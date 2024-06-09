const mysql= require('mysql2/promise')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

// получение теста
const getTest = async(req, res) => {
    try{
        const lection_id = req.params.lection_id

        //получаем наш тест айди
        const [[{lectionTest_id: test_id}]] = await db.execute("SELECT * FROM lection_test WHERE lectionTest_lectionId = ?", [lection_id])
        
        // console.log(test_id)

        const [questions] = await db.execute("SELECT * FROM lection_test_question WHERE lectionTestQuestion_testId = ?", [test_id])
        
        let finalQuestion = [];

        for (const question of questions) {
            // Добавление вопроса и inputMode
            const questionObj = {
                question: question.lectionTestQuestion_text,
                inputMode: question.lectionTestQuestion_mode,
                correctAnswer: [],
                options: []
            };
        
            const [answers] = await db.execute("SELECT * FROM lection_test_answer WHERE lectionTestAnswer_questionId = ?", [question.lectionTestQuestion_id]);
        
            answers.forEach(answer => {
                questionObj.correctAnswer.push(answer.lectionTestAnswer_text);
            });
        
            const [options] = await db.execute("SELECT * FROM lection_test_option WHERE lectionTestOption_questionId = ?", [question.lectionTestQuestion_id]);

            options.forEach(option => {
                questionObj.options.push(option.lectionTestOption_text);
            });

            finalQuestion.push(questionObj);
        }

        res.status(200).json(finalQuestion)
    } catch(err){
        res.status(500).json({error: "Не удалось получить тест"})
    }
}

// создание и пересоздание курса (вместо обновления)
const postTest = async(req,res) => {
    try{
        const {testMass, lection_id} = req.body
        // console.log(testMass)

        // наш тестовый объект
        // const testMass = [
        //     {
        //     question: 'What is 2 + 2?',
        //     options: ['3', '4', '5', '6'],
        //     correctAnswer: ['4'],
        //     inputMode: 'radio',
        //     },
        //     {
        //     question: 'What is the capital of France?',
        //     options: ['London', 'Paris', 'Berlin', 'Madrid'],
        //     correctAnswer: ['Paris'],
        //     inputMode: 'radio',
        //     },
        //     {
        //     question: 'What is |x| = 2?',
        //     options: ['2', '-2', '4', '10'],
        //     correctAnswer: ['2', '-2'],
        //     inputMode: 'checkbox',
        //     },
        // ]
        
        // // наша лекция
        // const lection_id = 999

        // если тест для лекции не создан, то создаём его с нуля
        await db.execute('INSERT INTO lection_test (lectionTest_lectionId) SELECT ? FROM dual WHERE NOT EXISTS (SELECT 1 FROM lection_test WHERE lectionTest_lectionId = ?)', [lection_id, lection_id])
        const [[{lectionTest_id: test_id}]] = await db.execute('SELECT lectionTest_id FROM lection_test WHERE lectionTest_lectionId = ?', [lection_id])

        // для начала удаляем все данные по тесту этой же лекции
        await db.execute('DELETE FROM lection_test_answer WHERE lectionTestAnswer_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_option WHERE lectionTestOption_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_question WHERE lectionTestQuestion_testId = ?', [test_id])
        
        // цикл, который добавить тест в базу данных
        testMass.forEach( async (question) => {

            // добавляем самм вопрос и инпутМод
            const [{insertId: question_id}] = await db.execute("INSERT INTO lection_test_question (lectionTestQuestion_text, lectionTestQuestion_mode, lectionTestQuestion_testId) VALUES (?, ?, ?)", [question.question, question.inputMode, test_id])

            // добавляем опшны
            question.options.forEach(async (option) => {
                await db.execute("INSERT INTO lection_test_option (lectionTestOption_text, lectionTestOption_testId, lectionTestOption_questionId) VALUES (?, ?, ?)", [option, test_id, question_id])
            })

            // // добавляем правильные ответы
            question.correctAnswer.forEach(async (answer) => {
                await db.execute("INSERT INTO lection_test_answer (lectionTestAnswer_text, lectionTestAnswer_testId, lectionTestAnswer_questionId) VALUES (?, ?, ?)", [answer, test_id, question_id])
            })
        })

        res.status(200).json({massage: "Тест успешно создан"})
    } catch(error){
        res.status(500).json({error: "Ошибка при добавлении теста"})
    }

    
}

// удаление теста
const deleteTest = async(req, res) => {
    try{
        const lection_id = req.params.lection_id
        
        // получение айди теста
        const [[{lectionTest_id: test_id}]] = await db.execute('SELECT lectionTest_id FROM lection_test WHERE lectionTest_lectionId = ?', [lection_id])
        
        await db.execute('DELETE FROM lection_test WHERE lectionTest_Id = ?', [test_id])
        await db.execute('DELETE FROM lection_test_answer WHERE lectionTestAnswer_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_option WHERE lectionTestOption_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_question WHERE lectionTestQuestion_testId = ?', [test_id])

        res.status(200).json({massage: "Тест успешно удалён"})
    } catch(error){
        res.status(500).json({error: "Ошибка при удалении данных"})
    }
}

module.exports = {
    getTest,
    postTest,
    deleteTest
}