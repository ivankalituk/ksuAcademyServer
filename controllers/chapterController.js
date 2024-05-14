const mysql= require('mysql2/promise')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание раздела
const createChapter = async (req,res) => {
    try{
        const {chapter_name, course_id} = req.body
        if (!chapter_name || !course_id){
            return res.status(400).json({error: 'Не введено айди пользователя или название предмета'})
        }
        const [result] = await db.execute("INSERT INTO chapter (course_id, chapter_name) VALUES (?, ?)", [course_id, chapter_name])
        res.json({massege: "Раздел успешно добавлен", id: result.insertId})
    }catch(error){
        res.status(500).json({error: "Ошибка при добавлении"})
    }
}

// получение одного раздела по айди
const getOneChapter = async (req, res) => {
    try{
        const chapter_id = req.params.id
        const rows = await db.execute('SELECT * FROM chapter WHERE chapter_id = ?', [chapter_id])
        res.json(rows[0])
    } catch(error){
        console.error(error)
        res.status(500).json({error: "Ошибка при получении данных"})
    }
}

// получение всех разделов по айди курса
const getAllChapters = async (req, res) => {
    try{
        const course_id = req.params.course_id
        const rows = await db.execute("SELECT * FROM chapter WHERE course_id = ?", [course_id])
        res.json(rows[0])
    } catch(error){
        res.status(500).json({error: "Ошибка получения данних"})
    }
} 

// удаление раздела по айди
const deleteChapter = async (req, res) => {
    try{
        const chapter_id = req.params.id

        // удаление файла
        const [[{img_path}]] = await db.execute("SELECT img_path FROM chapter WHERE chapter_id = ?", [chapter_id]);
        if (img_path !== null && fs.existsSync(img_path)){
            fs.unlink(img_path, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }

        // удаление из бд
        const rows = await db.execute("DELETE FROM chapter WHERE chapter_id = ?", [chapter_id])
        res.json({massege: "Раздел удалён"})
    } catch (error) {
        res.status(500).json({error: "ошибка при удалении данных"})
    }
}

// обновление раздела
const putChapter = async (req, res) => {
    try{
        const {chapter_id, chapter_name} = req.body

        // обновление данных
        if (req.file){
            // удаление старого фото если новое фото загруджено
            const [[{img_path}]] = await db.execute("SELECT img_path FROM chapter WHERE chapter_id = ?", [chapter_id]);
            if (img_path !== null && fs.existsSync(img_path)){
                fs.unlink(img_path, (err) => {
                    if (err){
                        console.error(err)
                        res.status(500).json({massage: "Ошибка удаления файла"})
                    }
                })
            }
            
            const {filename} = req.file
            const rows = await db.execute("UPDATE chapter SET chapter_name = ?, img_path = ? WHERE chapter_id = ?", [chapter_name, 'uploads/'+ filename, chapter_id]);
        } else {
            const rows = await db.execute("UPDATE chapter SET chapter_name = ? WHERE chapter_id = ?", [chapter_name, chapter_id]);
        }
       

        res.json({massage: 'Раздел обновлен'})
    } catch(error){
        res.status(500).json({error: "Ошибка при обновлении данных"})
    }
}

module.exports = {
    createChapter,
    getOneChapter,
    getAllChapters,
    deleteChapter,
    putChapter
}