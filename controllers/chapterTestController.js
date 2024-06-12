const mysql= require('mysql2/promise')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// получение теста

// получение теста
// не проверял
const getThemeTest = async(req, res) => {
    try{
        const theme_id = req.params.theme_id

        console.log(theme_id)
        //получаем наш тест айди

        const [[{themeTest_id: test_id}]] = await db.execute('SELECT CASE WHEN COUNT(*) > 0 THEN themeTest_id ELSE -1 END AS themeTest_id FROM theme_test WHERE themeTest_themeId = ?;', [theme_id])
        console.log(test_id)
        if (test_id < 0){
            res.status(200).json({data: null})
            return
        }

        const [questions] = await db.execute("SELECT * FROM theme_test_question WHERE themeTestQuestion_testId = ?", [test_id])
        
        let finalQuestion = [];

        for (const question of questions) {
            // Добавление вопроса и inputMode
            const questionObj = {
                question: question.themeTestQuestion_text,
                inputMode: question.themeTestQuestion_mode,
                correctAnswer: [],
                options: []
            };
        
            const [answers] = await db.execute("SELECT * FROM theme_test_answer WHERE themeTestAnswer_questionId = ?", [question.themeTestQuestion_id]);
        
            answers.forEach(answer => {
                questionObj.correctAnswer.push(answer.themeTestAnswer_text);
            });
        
            const [options] = await db.execute("SELECT * FROM theme_test_option WHERE themeTestOption_questionId = ?", [question.themeTestQuestion_id]);

            options.forEach(option => {
                questionObj.options.push(option.themeTestOption_text);
            });

            finalQuestion.push(questionObj);
        }

        res.status(200).json(finalQuestion)
    } catch(err){
        res.status(500).json({error: "Не удалось получить тест"})
    }
}

// создание и пересоздание курса (вместо обновления)
// не проверял
const posThemeTest = async(req,res) => {
    try{
        const {testMass, theme_id} = req.body

        // если тест для лекции не создан, то создаём его с нуля
        await db.execute('INSERT INTO theme_test (themeTest_themeId) SELECT ? FROM dual WHERE NOT EXISTS (SELECT 1 FROM theme_test WHERE themeTest_themeId = ?)', [theme_id, theme_id])
        const [[{themeTest_id: test_id}]] = await db.execute('SELECT themeTest_id FROM theme_test WHERE themeTest_themeId = ?', [theme_id])

        // для начала удаляем все данные по тесту этой же лекции
        await db.execute('DELETE FROM theme_test_answer WHERE themeTestAnswer_testId = ?', [test_id])
        await db.execute('DELETE FROM theme_test_option WHERE themeTestOption_testId = ?', [test_id])
        await db.execute('DELETE FROM theme_test_question WHERE themeTestQuestion_testId = ?', [test_id])
        
        // цикл, который добавить тест в базу данных
        testMass.forEach( async (question) => {

            // добавляем самм вопрос и инпутМод
            const [{insertId: question_id}] = await db.execute("INSERT INTO theme_test_question (themeTestQuestion_text, themeTestQuestion_mode, themeTestQuestion_testId) VALUES (?, ?, ?)", [question.question, question.inputMode, test_id])

            // добавляем опшны
            question.options.forEach(async (option) => {
                await db.execute("INSERT INTO theme_test_option (themeTestOption_text, themeTestOption_testId, themeTestOption_questionId) VALUES (?, ?, ?)", [option, test_id, question_id])
            })

            // // добавляем правильные ответы
            question.correctAnswer.forEach(async (answer) => {
                await db.execute("INSERT INTO theme_test_answer (themeTestAnswer_text, themeTestAnswer_testId, themeTestAnswer_questionId) VALUES (?, ?, ?)", [answer, test_id, question_id])
            })
        })

        res.status(200).json({massage: "Тест успешно создан"})
    } catch(error){
        res.status(500).json({error: "Ошибка при добавлении теста"})
    }

    
}

// удаление теста
// не проверял
const deleteThemeTest = async(req, res) => {
    try{
        const theme_id = req.params.theme_id
        
        // получение айди теста
        const [[{themeTest_id: test_id}]] = await db.execute('SELECT themeTest_id FROM theme_test WHERE themeTest_themeId = ?', [theme_id])
        
        await db.execute('DELETE FROM theme_test WHERE themeTest_id = ?', [test_id])
        await db.execute('DELETE FROM theme_test_answer WHERE themeTestAnswer_testId = ?', [test_id])
        await db.execute('DELETE FROM theme_test_option WHERE themeTestOption_testId = ?', [test_id])
        await db.execute('DELETE FROM them_test_question WHERE themeTestQuestion_testId = ?', [test_id])

        res.status(200).json({massage: "Тест успешно удалён"})
    } catch(error){
        res.status(500).json({error: "Ошибка при удалении данных"})
    }
}

module.exports = {
    getThemeTest,
    posThemeTest,
    deleteThemeTest
}