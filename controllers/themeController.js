const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание темы
const createTheme = async (req, res) => {
    try{
        const {chapter_id, theme_name} = req.body

        if (!chapter_id || !theme_name){
            return res.status(400).json({error: 'Не введено айди пользователя или название предмета'})
        }

        const [result] = await db.execute('INSERT INTO theme (chapter_id, theme_name) VALUES (?, ?)', [chapter_id, theme_name])
        res.json({ message: 'Предмет успешно добавлен', id: result.insertId });
    } catch(err){
        res.status(500).json({error: "Ошибка при добавлении предмета"})
    }
}

// получение одной темы
const getOneTheme = async (req, res) => {
    try{
        const theme_id = req.params.theme_id
        const rows = await db.execute('SELECT * FROM theme WHERE theme_id = ?', [theme_id])
        res.json(rows[0])
    } catch (error){
        res.status(500).json({error: "Ошибка при получении данных"})
    }
}

// получение всех тем раздела
const getAllThemes = async (req, res) => {
    try{
        const chapter_id = req.params.chapter_id
        const rows = await db.execute("SELECT * FROM theme WHERE chapter_id = ?", [chapter_id])
        res.json(rows[0])
    } catch (error){
        res.status(500).json({error: "Ошибка при получении данных"})
    }
}

// удаление темы
const deleteTheme = async (req, res) => {
    try{
        const theme_id = req.params.theme_id
        await db.execute('DELETE FROM theme WHERE theme_id = ?', [theme_id])
        res.json({message: "Тема успещно удалена"})
    } catch (error){
        res.status(500).json("Ошибка при удалении данных")
    }
}

// обновление темы
const putTheme = async (req, res) => {
    try{
        const {theme_name, theme_id} = req.body

        const rows = await db.execute("UPDATE theme SET theme_name = ? WHERE theme_id = ?", [theme_name, theme_id])
        res.json({massage: "Обвновление успешно"})

    } catch(error){
        res.status(error).json({error: "Ошибка при обновлении"})
    }
}


module.exports= {
    createTheme,
    getOneTheme,
    getAllThemes,
    deleteTheme,
    putTheme
}