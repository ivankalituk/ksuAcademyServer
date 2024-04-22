const mysql= require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание курса
const createCourse = async (req, res) => {
    try{
        const {teacher_id, course_name} = req.body

        if (!teacher_id || !course_name){
            return res.status(400).json({error: 'Не введено айди пользователя или название предмета'})
        }

        const [result] = await db.execute('INSERT INTO course (teacher_id, course_name) VALUES (?, ?)', [teacher_id, course_name])
        res.json({ message: 'Предмет успешно добавлен', id: result.insertId });
    } catch(err){
        res.status(500).json({error: "Ошибка при добавлении предмета"})
    }
}

// получение одного курса
const getOneCourse = async (req, res) => {
    try{
        let course_id = req.params.id
        const rows  = await db.execute('SELECT * FROM course WHERE course_id = ?', [course_id])
        res.json(rows[0])
    } catch(error){
        console.error(error)
        res.status(500).json({error: "Ошибка при получении данных"})
    }
}

// получение всех курсов
const getAllCourses = async (req, res) => {
    try{
        let teacher_id = req.params.teacher_id
        const rows = await db.execute('SELECT * from course WHERE teacher_id = ?', [teacher_id])
        res.json(rows[0])
    } catch (error){
        res.status(500).json({error: "Ошибка при получении данных"})
    }
}

// удаление курса
const deleteCourse = async (req, res) => {
    try{
        let course_id = req.params.course_id
        const rows = await db.execute('Delete from course WHERE course_id = ?', [course_id])
        res.json({massage: "Предмет удалён"})
    } catch (error){
        console.log(error)
        res.status(500).json({error: "Ошибка при удалении"})
    }
}

// обновление курса

module.exports = {
    createCourse,
    getOneCourse,
    getAllCourses,
    deleteCourse
}