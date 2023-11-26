from flask import Flask, session, render_template, jsonify, request
from flask_login import LoginManager,login_manager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import timedelta
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
    return sqlite3.connect('banco.db')

def check_word_from_database(verif):
    with get_db_connection() as connection:
        print(verif)
        cursor = connection.cursor()
        verif=verif.upper()
        consulta = "SELECT palavra FROM palavras WHERE palavra = ?;"
        cursor.execute(consulta, (verif,))
        resultados = cursor.fetchall()
        print(resultados)
        if resultados:
            return 1
        return -1

def get_word_from_database():
    with get_db_connection() as connection:
        cursor = connection.cursor()
        consulta = "SELECT palavra FROM palavras ORDER BY RANDOM() LIMIT 1;"
        cursor.execute(consulta)
        resultados = cursor.fetchall()
        print(resultados[0][0].upper())
        return resultados[0][0].upper()

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
        if get_login_from_database(login,password):
            login=login.lower()
            newlogin=newlogin.lower()
            cursor = connection.cursor()
            consulta = "update user set username =? where username=?;"
            cursor.execute(consulta, (newlogin, login))
            return 1
        return -1

def update_login_senha_database(login, password,newpassword):
    with get_db_connection() as connection:
        if get_login_from_database(login,password):
            login=login.lower()
            cursor = connection.cursor()
            consulta = "update user set password=? where username=?;"
            cursor.execute(consulta, (newpassword, login))
            return 1
        return -1
    
@app.route('/')
def index():
    return render_template('main.html')

@app.route('/get_data')
def get_data():
    palavra = get_word_from_database()
    return jsonify({'data': palavra})

@app.route('/get_login', methods=['POST'])
def get_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conf = get_login_from_database(login=username, password=password)
        
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
    print(password + " "+newusername + " "+username)
    conf = update_login_username_database(login=username, password=password, newlogin=newusername)
    return jsonify({'data': conf})


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Você foi desconectado. <a href="/">Página inicial</a>.'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080,debug=False)
