const mysql= require('mysql2/promise')
const fs = require('fs')
const {urlByHtml, textToArray, massMatches, arrayToText} = require('../functions/urlByHtml.js')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание лекции
const createLection = async(req, res) => {
    try{
        const {theme_id, lection_name, lection_content, lection_ready} = req.body

        console.log(theme_id, lection_name, lection_content)

        const [result] = await db.execute("INSERT INTO lection (theme_id, lection_name, lection_content, lection_ready) VALUES (?, ?, ?, ?)", [theme_id, lection_name, lection_content, lection_ready])
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

        const rows = await db.execute("SELECT lection_name, lection_id, lection_ready FROM lection WHERE theme_id = ?", [theme_id]);

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
        const {lection_content, lection_name, lection_id, lection_ready} = req.body

        // заполнение самой лекции
        const rows = await db.execute("UPDATE lection SET lection_content = ?, lection_name = ?, lection_ready = ? WHERE lection_id = ?", [lection_content, lection_name, lection_ready, lection_id])
        
        // получение всех использованных при создании лекции фото
        const [[{lection_images}]] = await db.execute("SELECT lection_images FROM lection WHERE lection_id = ?", [lection_id])

        const actualImgArray = urlByHtml(lection_content)           //актуальные адреса фото
        const allImgArray = textToArray(lection_images)             //все использованные фото

        // сравниваем два массива
        const {matches: matchedImg,notFound: unMatchedImg} = massMatches(actualImgArray, allImgArray)

        // удаляем ненужные фото из файлов
        unMatchedImg.forEach((item) => {
            if (fs.existsSync(item)){
                fs.unlink(item, (err)=>{
                    if (err){
                        console.error(err)
                        res.status(500).json({massage: "ошибка удаления фото лекции"})
                    }
                })
            }
        })

        // добавляем в бд фактические фото
        await db.execute('UPDATE lection SET lection_images = ? WHERE lection_id = ?', [arrayToText(matchedImg), lection_id])
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

        // удаление фото лекции
        const [[{lection_images}]] = await db.execute("SELECT lection_images FROM lection WHERE lection_id = ?", [lection_id])

        const lectionImgArray = textToArray(lection_images)

        lectionImgArray.forEach((item) => {
            if (fs.existsSync(item)){
                fs.unlink(item, (err)=>{
                    if (err){
                        console.error(err)
                        res.status(500).json({massage: "ошибка удаления фото лекции"})
                    }
                })
            }
        })

        // удаление теста и его подтаблиц
        const [[{lectionTest_id: test_id}]] = await db.execute('SELECT CASE WHEN COUNT(*) > 0 THEN lectionTest_id ELSE -1 END AS lectionTest_id FROM lection_test WHERE lectionTest_lectionId = ?;', [lection_id])

        if(test_id){
            await db.execute('DELETE FROM lection_test WHERE lectionTest_Id = ?', [test_id])
            await db.execute('DELETE FROM lection_test_answer WHERE lectionTestAnswer_testId = ?', [test_id])
            await db.execute('DELETE FROM lection_test_option WHERE lectionTestOption_testId = ?', [test_id])
            await db.execute('DELETE FROM lection_test_question WHERE lectionTestQuestion_testId = ?', [test_id])
        }

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