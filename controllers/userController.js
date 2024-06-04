const mysql = require('mysql2/promise')
const { default: axios } = require('axios');
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// запрос для получения данных по токену
const getInfoByToken = async (access_token) => {
    try{
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`);
        return response
    } catch {
        return {data: {expires_in: -1}}
    }
}

// получение пользователя из бд, если у него активный токен
const checkUserTocken = async (req, res) => {
    try{
        const {access_token} = req.body
        const response = await getInfoByToken(access_token)
        const token_time = response.data.expires_in         //получение времени до деактивации токена
        
        // если токен активен, то возвращаем пользователя, если нет, отправляем НЕ АКТИВЕН
        if(token_time > 0){
            const rows = await db.execute('SELECT * FROM users WHERE user_email = ?', [response.data.email])
            res.status(200).json({active: true, userData: rows[0]})
        } else {
            res.status(200).json({active: false})
        }
        
    } catch(error){
        res.status(500).json({error: "Ошибка при проверке пользователя"})
    }
}

// получение пользователя
const postUser = async(req, res) => {
    try{
        const {access_tocken} = req.body
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_tocken}`).then(({data}) => data);
        
        // получаем колличество записей с этим эмейлом (0 либо 1)
        const [[isExist]] = await db.execute('SELECT COUNT(*) AS count FROM users WHERE user_email = ?', [response.email])

        // если записи с такой почтой нет, мы создаём пользователя в бд
        if (!isExist.count){
            // создание, если пользователя не существует
            await db.execute('INSERT INTO users (user_googleId, user_nickName, user_email, user_role) VALUES (?, ?, ?, ?)', [response.sub, response.email, response.email, 'student'])
        }

        // получаем пользователя из бд уже с user_id и отправляем на фронт
        const rows = await db.execute('SELECT * FROM users WHERE user_email = ?', [response.email])
        res.status(200).json(rows[0])
    } catch(err){
        res.status(500).json({error: "ошибка при получении пользователя"})
    }
}

// обновление ника пользователя
const putUserNickname = async (req, res) => {
    try{
        const {user_nickname, user_id} = req.body

        await db.execute('UPDATE users SET user_nickName = ? WHERE user_id = ?', [user_nickname, user_id])
        res.status(200).json('Успешно обновлено')
    } catch(err){
        res.status(500).json('Ошибка при изменении ника пользователя')
    }
}

// обновление аватара пользователя
const putUserAvatar = async (req, res) => {
    try{

        const {user_id} = req.body
        // если есть прошлое фото то удалить
        const [[userPastImg]] = await db.execute("SELECT user_imgUrl FROM users WHERE user_id = ?", [user_id]);
        
        const pastImg_path = userPastImg.user_imgUrl

        if (pastImg_path !== null && fs.existsSync(pastImg_path)){
            fs.unlink(pastImg_path, (err) => {
                if (err){
                    console.error(err)
                    res.status(500).json({massage: "Ошибка удаления файла"})
                }
            })
        }

        const {filename} = req.file
        await db.execute("UPDATE users SET user_imgUrl = ? WHERE user_id = ?",  ['uploads/' + filename, user_id])

        const rows = await db.execute("SELECT user_imgUrl FROM users WHERE user_id = ?", [user_id])

        res.status(200).json(rows[0])
    } catch(err){
        res.status(500).json('Ошибка при изменении аватара пользователя')
    }
}

// удаление пользователя

module.exports = {
    postUser,
    checkUserTocken,
    putUserNickname,
    putUserAvatar
}