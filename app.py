from flask import Flask, render_template, jsonify
import sqlite3

app = Flask(__name__)

prox_palavra = ""

def get_data_from_database():
    connection = sqlite3.connect('banco.db')
    cursor = connection.cursor()
    
    consulta = "SELECT palavra FROM palavras ORDER BY RANDOM() LIMIT 1;"
    cursor.execute(consulta)
    resultados = cursor.fetchall()
    print(resultados[0][0].upper())
    connection.close()
    return  resultados[0][0].upper()



# Rota para renderizar a página principal
@app.route('/')
def index():
    return render_template('main.html')

# Rota para fornecer dados para o script.js
@app.route('/get_data')
def get_data():
    global prox_palavra
    if (prox_palavra == ""):
        prox_palavra=get_data_from_database()
    palavra = prox_palavra 
    prox_palavra=get_data_from_database()
    return jsonify({'data': palavra})

if __name__ == '__main__':
    prox_palavra = get_data_from_database()
    app.run(debug=True)
