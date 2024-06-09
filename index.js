const express = require('express')
const mysql = require('mysql2/promise')             
const cors = require('cors')                        //решение ошибки корс разных хостов
const multer = require('multer')                    //для сохранения фото
const {slugify} = require('transliteration')        //для перевода любых символов на англ

// контроллеры
const {createCourse, getOneCourse, getAllCourses, deleteCourse, getAllCoursesByTeacher, putCourse} = require('./controllers/courseController.js')
const {createChapter, getOneChapter, getAllChapters, deleteChapter, putChapter} = require('./controllers/chapterController.js')
const {createTheme, getOneTheme, getAllThemes, deleteTheme, putTheme} = require('./controllers/themeController.js')
const {createLection, getLection, getLections, createLectionPhoto, updateLection, deleteLection} = require('./controllers/lectionController.js')
const {checkUserTocken, postUser, putUserNickname, putUserAvatar} = require('./controllers/userController.js')
const {getTest, postTest, deleteTest} = require('./controllers/lectionTestController.js')

const port = 1000                               //порт
const app = express()       
app.use(express.json())                         //задаём формат данных
app.use(cors())                                 //для исправления ошибки корс
app.use('/uploads', express.static('uploads'))  //путь для фото

// создание уникальных названих для всех фото (даже одинаковых)
const storage = multer.diskStorage({
    destination: (_,__, cb) => {
        cb(null, 'uploads');
    },
    filename: (_,file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix+ slugify(file.originalname));
    },
})

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
});

const upload = multer({storage})       //назначение папки для файлов

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
app.delete('/lection/:id', deleteLection)                   //удаление лекции
app.put('/lection', updateLection)                          //обновление лекции
app.post('/lection/photo', upload.single('photo'), createLectionPhoto)   //добавление фото в лекцию

// CRUD для юзера
app.post('/userCheck', checkUserTocken)                     //проверяет активен ли пользователь, если да, то возвращает его из бд
app.post('/user', postUser)                                 //получает пользователя и создаёт его, если он не существует
app.put('/userNickname', putUserNickname)
app.put('/userImg', upload.single('photo'), putUserAvatar)

app.get('/lection/test/:lection_id', getTest)
app.post('/lection/test', postTest)
app.delete('/lection/test/:lection_id', deleteTest)

app.listen(port, (err) => {
    if (err){
        return(console.log(err))
    }
    console.log("SERVER OK")
})