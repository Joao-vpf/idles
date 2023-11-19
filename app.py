from flask import Flask, render_template, jsonify, request
import sqlite3

app = Flask(__name__)

prox_palavra = ""

def get_word_from_database():
    connection = sqlite3.connect('banco.db')
    cursor = connection.cursor()
    
    consulta = "SELECT palavra FROM palavras ORDER BY RANDOM() LIMIT 1;"
    cursor.execute(consulta)
    resultados = cursor.fetchall()
    print(resultados[0][0].upper())
    connection.close()
    return  resultados[0][0].upper()

def get_login_from_database(login, password):
    connection = sqlite3.connect('banco.db')
    cursor = connection.cursor()
    
    consulta = "SELECT COUNT(*) FROM user WHERE login=? AND password=?;"
    cursor.execute(consulta, (login, password))
    resultados = cursor.fetchall()
    print(resultados[0][0])
    connection.close()
    return  resultados[0][0]


# Rota para renderizar a página principal
@app.route('/')
def index():
    return render_template('main.html')

# Rota para fornecer a palavra
@app.route('/get_data')
def get_data():
    global prox_palavra
    if (prox_palavra == ""):
        prox_palavra=get_word_from_database()
    palavra = prox_palavra 
    prox_palavra=get_word_from_database()
    return jsonify({'data': palavra})


@app.route('/get_login', methods=['POST'])
def get_login():
    data = request.get_json() 
    username = data.get('username')
    password = data.get('password')
    conf = get_login_from_database(login=username,password=password)
    return jsonify({'data': conf})

if __name__ == '__main__':
    prox_palavra = get_word_from_database()
    app.run(debug=True)
