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

def get_db_connection():
    conn =  sqlite3.connect('banco.db')
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def check_word_from_database(verif):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        verif=verif.upper()
        consulta = "SELECT palavra FROM palavras WHERE palavra = ?;"
        cursor.execute(consulta, (verif,))
        resultados = cursor.fetchall()
        #print(resultados)
        if resultados:
            return 1
        return -1

def get_word_from_database():
    with get_db_connection() as connection:
        cursor = connection.cursor()
        consulta = "SELECT palavra FROM palavras ORDER BY RANDOM() LIMIT 1;"
        cursor.execute(consulta)
        resultados = cursor.fetchall()
       # print(resultados[0][0].upper())
        return resultados[0][0].upper()
    

def get_today_word_database():
    with get_db_connection() as connection:
        cursor = connection.cursor()

        consulta = "SELECT COUNT(*) FROM palavra_dia WHERE data_palavra = date();"
        resultados = cursor.execute(consulta).fetchone()

        if resultados[0] == 0:
            consulta =  "select id from palavras where 0 in (select count(*) from palavra_dia where data_palavra >= strftime('%Y-%m-%d', 'now', '-60 days') and palavras_id = palavras.id) order by random() limit 1;"
            resultados = cursor.execute(consulta).fetchone()

            if resultados:
                palavras_id = resultados[0]
                consulta = "INSERT INTO palavra_dia(data_palavra, palavras_id) VALUES (date(), ?);"
                cursor.execute(consulta, (palavras_id,))
                print(resultados[0])
                connection.commit()
              
        consulta = "SELECT palavra FROM palavras where id in (select palavras_id from palavra_dia where data_palavra = date());"
        resultados = cursor.execute(consulta).fetchone()
        if resultados:
            return resultados[0].upper()
        
        return -1   
    
    
def get_username_today_database(login):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        login=login.lower()
        consulta = "SELECT count(*) FROM today WHERE user_id in (select user.id from user where user.username = ?) AND pld_id in (select id from palavra_dia where data_palavra = date());"
        cursor.execute(consulta, (login,))
        resultados = cursor.fetchall()
        print(resultados[0][0])
        return resultados[0][0]   

def get_login_from_database(login, password):
    with get_db_connection() as connection:
        cursor = connection.cursor()
        login=login.lower()
        consulta = "SELECT count(*) FROM user WHERE username=? AND password=?;"
        cursor.execute(consulta, (login, password))
        resultados = cursor.fetchall()
        return resultados[0][0]
    
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
    
def insert_login_in_database(login, password):
    with get_db_connection() as connection:
        if get_username_from_database(login) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "insert into user(username,password) values(?,?);"
            cursor.execute(consulta, (login, password))
            return 1
        return -1
    
def delete_login_in_database(login, password):
    with get_db_connection() as connection:
        if get_login_from_database(login, password) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "delete from user WHERE username=? and password=?;"
            cursor.execute(consulta, (login, password))
            return 1
        return -1        

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

def update_login_senha_database(login, password,newpassword):
    with get_db_connection() as connection:
        if get_login_from_database(login,password) == 1:
            login=login.lower()
            cursor = connection.cursor()
            consulta = "update user set password=? where username=?;"
            cursor.execute(consulta, (newpassword, login))
            return 1
        return -1
    
def set_user_today(login, count_erro):
    with get_db_connection() as connection:
        if(get_username_from_database(login) == -1):
            login=login.lower()
            cursor = connection.cursor()
            consulta = "select id from palavra_dia where data_palavra = date()"
            cursor.execute(consulta)
            id_palavra = cursor.fetchall()[0][0]
            
            consulta = "select id from user where username = ?"
            cursor.execute(consulta, (login,))
            id_login = cursor.fetchall()[0][0]
            
            consulta = "insert into today(count_erro, user_id, pld_id) values(?,?,?)"
            cursor.execute(consulta, (count_erro,id_login,  id_palavra))

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

def recuperar_imagem(login):
    with get_db_connection() as connection:
        login=login.lower()
        cursor = connection.cursor()
        #print(login)
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

def image_to_base64(image):
    # Converte a imagem para formato base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

def get_user_id_image(login):
    with get_db_connection() as connection:
        login=login.lower()
        cursor = connection.cursor()
        consulta = "select id from user where username=?;"
        cursor.execute(consulta, (login,))
    
    
def set_image_user(login, id_img):
    with get_db_connection() as connection:
        login=login.lower()
        cursor = connection.cursor()
        consulta = "update user set png_id=? where username=?;"
        cursor.execute(consulta, (id_img, login))
    

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
    #print(username)
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
    #print(username, " ", id_image)
    conf = set_image_user(login=username, id_img = id_image)
    return {'data': conf}

@app.route('/set_today', methods=['POST'])
def set_today():
    data = request.get_json()
    username = data.get('username')
    count_erro = data.get('count_erro')
    conf = set_user_today(login=username,  count_erro=count_erro)
    return {'data': conf}


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Você foi desconectado. <a href="/">Página inicial</a>.'


if __name__ == '__main__':
    get_today_word_database()
   # app.run(host='0.0.0.0', port=8080,debug=False)
    app.run(debug=True)
