const mysql= require('mysql2/promise')
const fs = require('fs')
const {OAuth2Client} = require('c')

const google_clientId = '535351391206-ehqso5i7b8r17mh8if26f7m4mlrbo0hu.apps.googleusercontent.com'
const client = new OAuth2Client(google_clientId)


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// создание пользователя

const createUser = async(req, res) => {
    try{
        const {user_googleId} = req.body
        console.log(user_googleId)
        // const ticket = await client.verifyIdToken({
        //     idToken: user_googleId,
        //     audience: google_clientId
        // })

        res.json({massage: 'success'})
    } catch(err){
        console.error(err).json({massage: "error"})
    }
}
// удаление пользователя

// обновление пользователя

// изменение фото пользователя

module.exports = {
    createUser,
}