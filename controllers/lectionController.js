const mysql= require('mysql2/promise')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание лекции
const createLection = async(req, res) => {
    try{
        const {theme_id, lection_name, lection_content} = req.body

        console.log(theme_id, lection_name, lection_content)

        const [result] = await db.execute("INSERT INTO lection (theme_id, lection_name, lection_content) VALUES (?,?,?)", [theme_id, lection_name, lection_content])
        res.status(200).json({massege: 'Лекция успешно добавлена', id: result.insertId})
        

    } catch (error){
        res.status(500).json({error: "Ошибка при создании лекции"})
    }
}

// получение лекции
const getLection = async(req, res) => {
    try{
        const lection_id = req.params.id

        const rows = await db.execute("SELECT * FROM lection WHERE lection_id = ?", [lection_id])
        res.status(200).json(rows[0])
    } catch(error){
        res.status(500).json({error: "Ошибка при получении лекции"})
    }
}

// получение названий и айди лекций
const getLections = async(req, res) => {
    try{
        const theme_id = req.params.id

        const rows = await db.execute("SELECT lection_name, lection_id FROM lection WHERE theme_id = ?", [theme_id]);

        res.status(200).json(rows[0])
    } catch (error){
        res.status(500).json({error: "Ошибка при получении лекцийф"})
    }
}

// добавление фото лекции
const createLectionPhoto = async(req, res) => {
    try {
        // создание пути к файлу
        const imageUrl = 'http://localhost:1000/uploads/' + req.file.filename;
        
        // добавление ссылки на фото в базу данных 
        // const rows = await db.execute('UPDATE lection SET lection_images = CONCAT(lection_images, ?, ?')

        res.json({ imageUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
      }
}

// обновлении лекции
const updateLection = async(req, res) => {
    try{
        const {lection_content, lection_name, lection_id} = req.body
        const rows = await db.execute("UPDATE lection SET lection_content = ?, lection_name = ? WHERE lection_id = ?", [lection_content, lection_name, lection_id])
        res.status(200).json({massege: "Успешно оновлено"})
    } catch (err){
        res.status(500).json({massage: "Ошибка при обновлении"})
    }
}



// удаление лекции
const deleteLection = async(req, res) => {
    try{
        const {lection_id} = req.params.id
        const rows = await db.execute("DELETE FROM lection WHERE lection_id = ?", [lection_id])
        res.status(200).json({massege: "Успешно удалено"})
    } catch(err){
        res.status(500).json({massage: "Ошибка при удалении"})
    }
}


module.exports = {
    createLection,
    getLection,
    getLections,
    createLectionPhoto
}