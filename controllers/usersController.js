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

// создание пользователя
const createUser = async (req, res) => {
    try {
        const { user_googleId } = req.body;
        console.log(user_googleId);

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: user_googleId,
            audience: google_clientId
        });

        const payload = ticket.getPayload();
        const userid = payload['sub']; // Google user ID
        const email = payload['email'];
        const name = payload['name'];

        res.json({massege: "GAY"})

    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ message: 'Invalid ID token' });
    }
};

const checkUserTocken = async (req, res) => {
    try{
        const {access_tocken} = req.body
        res.json({massege: access_tocken})
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_tocken}`);
        const tokenInfo = response.data         //вся инфа про аккаунт

        res.status(200).json({active: tokenInfo})
    } catch(error){
        res.status(500).json({error: "Ошибка при добавлении предмета"})
    }

}


module.exports = {
    createUser,
    checkUserTocken
}