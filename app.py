from ctypes import resize
from flask import Flask, session, render_template, jsonify, request, send_file
from flask_login import LoginManager,login_manager, UserMixin, login_user, login_required, logout_user, current_user
from PIL import Image
from io import BytesIO
import base64
import sqlite3

app = Flask(__name__)
login_manager = LoginManager(app)
app.secret_key = 'pato'


class User(UserMixin):
    pass

# Função para carregar usuário a partir do ID (usada pelo Flask-Login)
@login_manager.user_loader
def load_user(user_id):
    user = User()
    user.id = user_id
    return user
# Função para conectar com o banco de dados e habilitar foreing_key
def get_db_connection():
    conn =  sqlite3.connect('banco.db')
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

# Função para verificar se há a palavra no banco de daods
def check_word_from_database(verif):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        verif=verif.upper()
        consulta = "SELECT palavra FROM palavras WHERE palavra = ?;"
        cursor.execute(consulta, (verif,))
        resultados = cursor.fetchall()
        if resultados:
            return 1
        return -1

# Função para funçao para pegar uma palavra aleatoria do banco de dados
def get_word_from_database():
    with get_db_connection() as connection:
        cursor = connection.cursor()
        consulta = "SELECT palavra FROM palavras ORDER BY RANDOM() LIMIT 1;"
        cursor.execute(consulta)
        resultados = cursor.fetchall()
        return resultados[0][0].upper()
    
# Função para gerar pegar uma palavra(a do dia) do banco de dados
def get_today_word_database():
    with get_db_connection() as connection:
        cursor = connection.cursor()

        consulta = "SELECT COUNT(*) FROM palavra_dia WHERE data_palavra = date('now');"
        cursor.execute(consulta)
        resultados = cursor.fetchone()

        if resultados[0] == 0:
            consulta =  "select id from palavras where 0 in (select count(*) from palavra_dia where data_palavra >= strftime('%Y-%m-%d', 'now', '-60 days') and palavras_id = palavras.id) order by random() limit 1;"
            cursor.execute(consulta)
            resultados = cursor.fetchone()

            if resultados:
                palavras_id = resultados[0]
                consulta = "INSERT INTO palavra_dia(data_palavra, palavras_id) VALUES (date('now'), ?);"
                cursor.execute(consulta, (palavras_id,))
                connection.commit()
              
        consulta = "SELECT palavra FROM palavras where id in (select palavras_id from palavra_dia where data_palavra = date('now'));"
        resultados = cursor.execute(consulta).fetchone()
        if resultados:
            return resultados[0].upper()
        
        return -1   
    
# Função para ver se jogou o modo dia dia    
def get_username_today_database(login):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        login=login.lower()
        consulta = "SELECT count(*) FROM today WHERE user_id in (select user.id from user where user.username = ?) AND pld_id in (select id from palavra_dia where data_palavra = date('now'));"
        cursor.execute(consulta, (login,))
        resultados = cursor.fetchall()
        return resultados[0][0]   

# Função para verificar o login no banco de dados
def get_login_from_database(login, password):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        login=login.lower()
        consulta = "SELECT count(*) FROM user WHERE username=? AND password=?;"
        cursor.execute(consulta, (login, password))
        resultados = cursor.fetchall()
        return resultados[0][0]

# Função paraverificar se o user name esta no banco de dados 
def get_username_from_database(login):
     with get_db_connection() as connection:
        cursor = connection.cursor()
        login=login.lower()
        consulta = "SELECT count(*) FROM user WHERE username=?;"
        cursor.execute(consulta, (login,))
        resultados = cursor.fetchall()
        if resultados[0][0] == 1:
            return -1
        return 1

# Função para inserir o no banco de dados o novo login(user)
def insert_login_in_database(login, password):
    with get_db_connection() as connection:
        if get_username_from_database(login) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "insert into user(username,password) values(?,?);"
            cursor.execute(consulta, (login, password))
            
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            user_id = cursor.fetchall()[0][0]
            
            consulta = "insert into historico(user_id,score_palavra) values(?,0);"
            cursor.execute(consulta, (user_id,))
            return 1
        return -1

# Função para deletar a conta (user)
def delete_login_in_database(login, password):
    with get_db_connection() as connection:
        if get_login_from_database(login, password) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "delete from user WHERE username=? and password=?;"
            cursor.execute(consulta, (login, password))
            return 1
        return -1        

# Função para mudar o nome de usuario
def update_login_username_database(login, password,newlogin):
    with get_db_connection() as connection:
        login=login.lower()
        newlogin=newlogin.lower()
        if get_login_from_database(login, password) == 1:
            if get_username_from_database(newlogin) == 1:
                cursor = connection.cursor()
                consulta = "update user set username =? where username=?;"
                cursor.execute(consulta, (newlogin, login))
                return 1
            return 2
        return -1

# Função para mudar a senha
def update_login_senha_database(login, password,newpassword):
    with get_db_connection() as connection:
        if get_login_from_database(login,password) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "update user set password=? where username=?;"
            cursor.execute(consulta, (newpassword, login))
            return 1
        return -1
    
# Função para salvar a quantidade de erros da palavra do dia
def set_user_today(login, count_erro):
    with get_db_connection() as connection:
        if(get_username_from_database(login) == -1):
            login=login.lower()
            cursor = connection.cursor()
            consulta = "select id from palavra_dia where data_palavra = date('now')"
            cursor.execute(consulta)
            id_palavra = cursor.fetchall()[0][0]
            
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            id_login = cursor.fetchall()[0][0]
            
            consulta = "insert into today(count_erro, user_id, pld_id) values(?,?,?)"
            cursor.execute(consulta, (count_erro,id_login,  id_palavra))

# Função para pegar todas as imagens do banco de dados
def recuperar_todas_imagens():
    with get_db_connection() as connection:
        cursor = connection.cursor()

        # Recuperar todos os dados binários das imagens
        cursor.execute("SELECT id, imagem FROM png;")
        resultados = cursor.fetchall()

        imagens = []

        for resultado in resultados:
            id_imagem, dados_imagem = resultado
            imagem = Image.open(BytesIO(dados_imagem))
            imagens.append({'id': id_imagem, 'imagem': imagem})

        return imagens

# Função para pre carregar uma imagem
def recuperar_imagem(login):
    with get_db_connection() as connection:
        login=login.lower()
        cursor = connection.cursor()
        cursor.execute("SELECT png_id FROM user WHERE username = ?;", (login,))
        resultado = cursor.fetchone()
        if resultado:
            cursor.execute("SELECT imagem FROM png WHERE id = ?;", (resultado[0],))
            resultado = cursor.fetchone()

            if resultado:
                # Converter os dados binários para um objeto de imagem
                dados_imagem = resultado[0]
                imagem = Image.open(BytesIO(dados_imagem))

                return imagem

# Função para converte a imagem para formato base64
def image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

# Função para pegar usar a imagem escolida do usuario
def get_user_id_image(login):
    with get_db_connection() as connection:
        login=login.lower()
        cursor = connection.cursor()
        consulta = "select id from user where username=?;"
        cursor.execute(consulta, (login,))
    

# Função para mudar a imagem 
def set_image_user(login, id_img):
    with get_db_connection() as connection:
        login=login.lower()
        if(login == "napoleao"):
            return -1
        cursor = connection.cursor()
        consulta = "update user set png_id=? where username=?;"
        cursor.execute(consulta, (id_img, login))
        return 1

# Função para ver se o user tem historico
def  get_historico_from_database(login):
    with get_db_connection() as connection:
        if get_username_from_database(login) == -1:
            cursor = connection.cursor()
            login=login.lower()
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            user_id = cursor.fetchall()[0][0]
            consulta = "select count(*) from historico where user_id=?;"
            cursor.execute(consulta, (user_id,))
            return -1
        return 1  

# Função para mudar score no historico
def set_score_palavra_from_hist(login,score):
    with get_db_connection() as connection:
        if get_historico_from_database(login) == -1:
            cursor = connection.cursor()
            login=login.lower()
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            user_id = cursor.fetchall()[0][0]
            
            consulta = "select score_palavra from historico where user_id = ?"
            cursor.execute(consulta, (user_id,))
            value = int(cursor.fetchall()[0][0])
            if(value == int(score)-1):
                #Score so pode ser alterado se for maior em 1
                consulta = "update historico set score_palavra=? where user_id=?;"
                cursor.execute(consulta, (score,user_id))
                return 1
        return -1  

# Função para pegar o score no historico
def get_score_palavra_from_hist(login):
    with get_db_connection() as connection:
        if get_historico_from_database(login) == -1:
            cursor = connection.cursor()
            login=login.lower()
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            user_id = cursor.fetchall()[0][0]
            consulta = "select score_palavra from historico where user_id=?;"
            cursor.execute(consulta, (user_id,))
            res = cursor.fetchall()[0][0]
            return res
        return -1  

# Função para pegar a quantidade de erro nos ultimos 5 jogos diarios
def get_last_5_games(login):
    with get_db_connection() as connection:
        if get_username_from_database(login) == -1:
            cursor = connection.cursor()
            login=login.lower()
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            user_id = cursor.fetchall()[0][0]
            
            consulta = "select palavras_id from palavra_dia order by data_palavra desc limit 5;"
            cursor.execute(consulta)
            palavras_passadas = [row[0] for row in cursor.fetchall()]
            palavras_passadas = palavras_passadas[::-1]
            consulta = "select id from palavra_dia order by data_palavra desc limit 5;"
            cursor.execute(consulta)
            id_todays_passadas = [row[0] for row in cursor.fetchall()]
            id_todays_passadas = id_todays_passadas[::-1]
            res = [[-1,""], [-1,""],[-1,""],[-1,""], [-1,""]]
            for i in range(5):
                consulta = "select count(*) from today where pld_id=? and user_id=?;"
                cursor.execute(consulta, (id_todays_passadas[i], user_id))
                aux = int(cursor.fetchall()[0][0])
                if aux == 1:
                    consulta = "select count_erro from today where pld_id=? and user_id=?;"
                    cursor.execute(consulta, (id_todays_passadas[i], user_id))
                    res[i][0] = int(cursor.fetchall()[0][0])
                consulta = "select palavra from palavras where id=?;"
                cursor.execute(consulta, (palavras_passadas[i],))
                res[i][1] = cursor.fetchall()[0][0]
            return res
        return -1



#daqui para baixo e a conexao entre o python com o javascript
@app.route('/')
def index():
    return render_template('main.html')

@app.route('/get_data')
def get_data():
    palavra = get_word_from_database()
    return jsonify({'data': palavra})

@app.route('/get_today')
def get_today():
    palavra = get_today_word_database()
    return jsonify({'data': palavra})

@app.route('/get_login', methods=['POST'])
def get_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conf = get_login_from_database(login=username, password=password)
        
    return jsonify({'data': conf})

@app.route('/get_user_today', methods=['POST'])
def get_user_today():
    data = request.get_json()
    username = data.get('username')
    conf = get_username_today_database(login=username)
    return jsonify({'data': conf})

@app.route('/check_word', methods=['POST'])
def check_word():
    data = request.get_json()
    conf = check_word_from_database(verif=(data.get("word")))
    return jsonify({'data': conf})

@app.route('/set_conta', methods=['POST'])
def set_conta():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conf = insert_login_in_database(login=username, password=password)
    return jsonify({'data': conf})

@app.route('/del_conta', methods=['POST'])
def del_conta():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conf = delete_login_in_database(login=username, password=password)
    
    return jsonify({'data': conf})

@app.route('/alter_senha', methods=['POST'])
def alter_senha():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    newpassword = data.get('newpassword')
    conf = update_login_senha_database(login=username, password=password, newpassword=newpassword)
    
    return jsonify({'data': conf})


@app.route('/alter_user', methods=['POST'])
def alter_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    newusername = data.get('newusername')
    conf = update_login_username_database(login=username, password=password, newlogin=newusername)
    return jsonify({'data': conf})


@app.route('/get_all_images', methods=['GET'])
def get_all_images():
    imagens = recuperar_todas_imagens()

    imagens_base64 = [{'id': imagem['id'], 'imagem': image_to_base64(imagem['imagem'])} for imagem in imagens]

    return {'imagens': imagens_base64}


@app.route('/imagem/<string:username>')
def get_one_image(username):
    imagem = recuperar_imagem(login=username)
    
    if imagem:
        img_bytes = BytesIO()
        imagem.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        return send_file(img_bytes, mimetype='image/jpeg')

    return 'Imagem não encontrada', 404


@app.route('/set_image', methods=['POST'])
def set_image():
    data = request.get_json()
    id_image = data.get('id_image')
    username = data.get("username")
    conf = set_image_user(login=username, id_img = id_image)
    return {'data': conf}

@app.route('/set_today', methods=['POST'])
def set_today():
    data = request.get_json()
    username = data.get('username')
    count_erro = data.get('count_erro')
    conf = set_user_today(login=username,  count_erro=count_erro)
    return {'data': conf}

@app.route('/get_hist', methods=['POST'])
def get_hist():
    data = request.get_json()
    username = data.get('username')
    conf = get_historico_from_database(login=username)
    return {'data': conf, 'best_score':get_score_palavra_from_hist(login=username), 'last_5_today': get_last_5_games(login=username)}


@app.route('/set_new_score_game', methods=['POST'])
def set_new_score_game():
    data = request.get_json()
    username = data.get('username')
    wins = data.get('wins')
    conf = set_score_palavra_from_hist(login=username, score=wins)
    return {'data': conf}


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Você foi desconectado. <a href="/">Página inicial</a>.'


#função para estabelecer um host
if __name__ == '__main__':
    get_today_word_database()
    #app.run(host='0.0.0.0', port=8080,debug=False)
    app.run(debug=True)
