const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')

// контроллеры
const { createSubject} = require('./controllers/courseController.js')


const port = 1000

const app = express()
app.use(express.json())
app.use(cors())

// подключение к базе данных
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// проверка подключения
db.getConnection()
    .then((connection) => {
        console.log('DB IS OK');
        connection.release();
    })
    .catch((err) => {
        console.log('DB CONNECTION ERROR: ', err.message);
    });

// ЗАПРОСЫ

// CRUD для предмета
app.post('/subject', createSubject)


app.listen(port, (err) => {
    if (err){
        return(console.log(err))
    }

    console.log("SERVER OK")
})