const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')

// контроллеры
const {createCourse, getOneCourse, getAllCourses, deleteCourse, getAllCoursesByTeacher} = require('./controllers/courseController.js')
const {createChapter, getOneChapter, getAllChapters, deleteChapter} = require('./controllers/chapterController.js')
const {createTheme, getOneTheme, getAllThemes, deleteTheme} = require('./controllers/themeController.js')
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
// Не хватает обновления данных для каждого из запросов

// CRUD для предмета
app.post('/course', createCourse)                           //создание курса
app.get('/course/:id', getOneCourse)                        //получение курса по айди
app.get('/courses/:teacher_id', getAllCoursesByTeacher)     //получение курсов по айди препода
app.delete('/course/:course_id', deleteCourse)              //удаление курса
app.get('/courses', getAllCourses)                          //получение всех курсов

// CRUD для раздела
app.post('/chapter', createChapter)                         //создание предмета
app.get('/chapter/:id', getOneChapter)                      //получение раздела по айди (это не используется)
app.get('/chapters/:course_id', getAllChapters)             //получение разделов по айди предмета
app.delete('/chapter/:id', deleteChapter)                   //удаление раздела

// CRUD для темы
app.post('/theme', createTheme)                             //создание темы
app.get('/theme/:theme_id', getOneTheme)                    //получение темы по айди (не используется)
app.get('/themes/:chapter_id', getAllThemes)                //получение тем по айди раздела
app.delete('/theme/:theme_id', deleteTheme)                 //удаление раздела





app.listen(port, (err) => {
    if (err){
        return(console.log(err))
    }

    console.log("SERVER OK")
})