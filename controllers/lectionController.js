const mysql= require('mysql2/promise')
const fs = require('fs')
const {urlByHtml, textToArray, massMatches} = require('../functions/urlByHtml.js')

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
// добавление ссылки на фото в базу данных
const createLectionPhoto = async(req, res) => {
    try {
        // создание пути к файлу
        const imageUrl = 'http://localhost:1000/uploads/' + req.file.filename;
        const dbImageUrl  = 'uploads/' + req.file.filename
        const {lection_id} = req.body
        console.log(lection_id)

        // добавление ссылки на фото в базу данных 
        const rows = await db.execute('UPDATE lection SET lection_images = COALESCE(CONCAT(lection_images, " ", ?), ?) WHERE lection_id = ?;', [dbImageUrl, dbImageUrl, lection_id])

        res.json({ imageUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
      }
}

// добавление массива фото
// обновлении лекции
const updateLection = async(req, res) => {
    try{
        const {lection_content, lection_name, lection_id} = req.body
        const rows = await db.execute("UPDATE lection SET lection_content = ?, lection_name = ? WHERE lection_id = ?", [lection_content, lection_name, lection_id])
        const [[{lection_images}]] = await db.execute("SELECT lection_images FROM lection WHERE lection_id = ?", [lection_id])

        // УДАЛЕНИЕ НЕНУЖНЫХ ФОТО ((((((НЕ ПРОВЕРЯЛОСЬ))))))

        // достаём адреса фото из актуального ХТМЛ
        const actualImgArray = urlByHtml(lection_content)

        // переводим текст со ВСЕМИ адресами фото в массив адресов
        const allImgArray = textToArray(lection_images)

        // сравниваем два массива
        const {matchedImg, unMatchedImg} = massMatches(actualImgArray, allImgArray)

        // удаляем ненужные фото из файлов
        
        // добавляем в бд фактические фото

        res.status(200).json({massege: "Успешно оновлено"})
    } catch (err){
        res.status(500).json({massage: "Ошибка при обновлении"})
    }
}

// удаление лекции
// нету  удаления фото
const deleteLection = async(req, res) => {
    try{
        const lection_id = req.params.id
        console.log(lection_id)
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
    createLectionPhoto,
    updateLection,
    deleteLection
}