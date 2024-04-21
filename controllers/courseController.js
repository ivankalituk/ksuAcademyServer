const mysql= require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

const createSubject = async (req, res) => {
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

module.exports = {
    createSubject
}