const { default: axios } = require('axios');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');

const google_clientId = '535351391206-ehqso5i7b8r17mh8if26f7m4mlrbo0hu.apps.googleusercontent.com';
const client = new OAuth2Client(google_clientId);

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
});

const checkUserTocken = async (req, res) => {
    try{
        const {access_tocken} = req.body
        console.log(access_tocken)
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_tocken}`);
        const tocken_time = response.data.expires_in         //вся инфа про аккаунт

        if(tocken_time > 0){
            res.status(200).json({active: true})
        } else {
            res.status(200).json({active: false})
        }

    } catch(error){
        res.status(500).json({error: "Ошибка при проверке пользователя"})
    }

}


module.exports = {
    checkUserTocken
}