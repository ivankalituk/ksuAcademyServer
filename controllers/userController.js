const mysql = require('mysql2/promise')
const { default: axios } = require('axios');


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

const checkUserTocken = async (req, res) => {
    try{
        const {access_token} = req.body
        // console.log(access_token)
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`);
        const token_time = response.data.expires_in         //вся инфа про аккаунт

        // получение данных пользователя прямо из бд
        const rows = await db.execute('SELECT * FROM users WHERE user_email = ?', [response.data.email])
        // console.log(rows[0])

        if(token_time > 0){
            res.status(200).json({active: true, userData: rows[0]})
        } else {
            res.status(200).json({active: false})
        }

    } catch(error){
        res.status(500).json({error: "Ошибка при проверке пользователя"})
    }
}

const postUser = async(req, res) => {
    try{
        const {access_tocken} = req.body
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_tocken}`).then(({data}) => data);
        // проверка есть ли такой пользователь в базе данных
        const [[isExist]] = await db.execute('SELECT COUNT(*) AS count FROM users WHERE user_email = ?', [response.email])


        if (!isExist.count){
            // создание, если пользователя не существует
            const rows = await db.execute('INSERT INTO users (user_googleId, user_nickName, user_email, user_role) VALUES (?, ?, ?, ?)', [response.sub, response.email, response.email, 'student'])
        }

        const rows = await db.execute('SELECT * FROM users WHERE user_email = ?', [response.email])
        res.status(200).json(rows[0])
    } catch(err){
        res.status(500).json({error: "ошибка при получении пользователя"})
    }
}

module.exports = {
    postUser,
    checkUserTocken
}