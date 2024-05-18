const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const multer = require('multer')

// контроллеры
const {createCourse, getOneCourse, getAllCourses, deleteCourse, getAllCoursesByTeacher, putCourse} = require('./controllers/courseController.js')
const {createChapter, getOneChapter, getAllChapters, deleteChapter, putChapter} = require('./controllers/chapterController.js')
const {createTheme, getOneTheme, getAllThemes, deleteTheme, putTheme} = require('./controllers/themeController.js')
const {createLection, getLection, getLections, createLectionPhoto, updateLection, deleteLection} = require('./controllers/lectionController.js')


const port = 1000           //порт

const app = express()       
app.use(express.json())                         //задаём формат данных
app.use(cors())                                 //для исправления ошибки корс
app.use('/uploads', express.static('uploads'))

// нужно сделать так, чтоб любое фото ставало особым
const storage = multer.diskStorage({
    destination: (_,__, cb) => {
        cb(null, 'uploads');
    },
    filename: (_,file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix+ file.originalname);
    },
})


const upload = multer({storage})       //назначение папки для файлов

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
app.put('/course', upload.single('photo'), putCourse)                               //обновление курса

// CRUD для раздела
app.post('/chapter', createChapter)                         //создание предмета
app.get('/chapter/:id', getOneChapter)                      //получение раздела по айди (это не используется)
app.get('/chapters/:course_id', getAllChapters)             //получение разделов по айди предмета
app.delete('/chapter/:id', deleteChapter)                   //удаление раздела
app.put('/chapter', upload.single('photo'), putChapter)     //обновление раздела

// CRUD для темы
app.post('/theme', createTheme)                             //создание темы
app.get('/theme/:theme_id', getOneTheme)                    //получение темы по айди (не используется)
app.get('/themes/:chapter_id', getAllThemes)                //получение тем по айди раздела
app.delete('/theme/:theme_id', deleteTheme)                 //удаление темы
app.put('/theme', putTheme)                                 //обновление темы 

// CRUD для лекции
app.post('/lection', createLection)                         //создание лекции
app.get('/lection/:id', getLection)                         //получение лекции по её айди
app.get('/lections/:id', getLections)                       //получение айди и названий лекций по айди темы
// app.delete('/lectio/:id')
app.put('/lection', updateLection)

app.post('/lection/photo',upload.single('photo'), createLectionPhoto)

app.listen(port, (err) => {
    if (err){
        return(console.log(err))
    }

    console.log("SERVER OK")
})