const mysql= require('mysql2/promise')
const fs = require('fs')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ksu_academy'
})

const getTest = async(req, res) => {
    try{
        const lection_id = req.params.id

        //получаем наш тест айди
        const [[{lectionTest_lectionId: test_id}]] = await db.execute("SELECT * FROM lection_test WHERE lectionTest_lectionId = ?", [lection_id])
        
        // получаем вопросы по тест айди
        // const questions = await db.execute("SELECT * FROM lection_test_question WHERE lectionTestQuestion_testId = ?", [test_id])

        // в нём на самом деле будет находится массив с айди вопросов
        const questions = [1,2,3];

        let questionsArray = []


        // // сделать цикл, которй проходит колличество вопросов
        // for (let i = 0; i < questions.length - 1; i++){

        //     // получаем первый вопрос по запросу
        //     const question = await db.execute("SELECT * FROM lection_test_question WHERE lectionTest_lectionId = ?", [lection_id])
        //     // заполняем данные по вопросу в объект массива вопросов

        //     // получаем

        // }



        res.status(200).json(test_id)


    } catch(err){
        res.status(500).json({error: "Не удалось получить тест"})
    }
}

const postTest = async(req,res) => {
    try{
        // const {testMass, lection_id} = req.body

        // наш тестовый объект
        const testMass = [
            {
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: ['4'],
            inputMode: 'radio',
            },
            {
            question: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: ['Paris'],
            inputMode: 'radio',
            },
            {
            question: 'What is |x| = 2?',
            options: ['2', '-2', '4', '10'],
            correctAnswer: ['2', '-2'],
            inputMode: 'checkbox',
            },
        ]
        
        // наша лекция
        const lection_id = 2

        // если тест для лекции не создан, то создаём его с нуля
        await db.execute('INSERT INTO lection_test (lectionTest_lectionId) SELECT 2 FROM dual WHERE NOT EXISTS (SELECT 1 FROM lection_test WHERE lectionTest_lectionId = ?)', [lection_id])
        const [[{lectionTest_id: test_id}]] = await db.execute('SELECT lectionTest_id FROM lection_test WHERE lectionTest_lectionId = ?', [lection_id])

        console.log(test_id)

        // для начала удаляем все данные по тесту этой же лекции
        await db.execute('DELETE FROM lection_test_answer WHERE lectionTestAnswer_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_option WHERE lectionTestOption_testId = ?', [test_id])
        await db.execute('DELETE FROM lection_test_question WHERE lectionTestQuestion_testId = ?', [test_id])
        
        // цикл, который добавить тест в базу данных
        testMass.forEach( async (question) => {
            console.log(question.question)
            // добавляем самм вопрос и инпутМод
            await db.execute("INSERT INTO lection_test_question (lectionTestQuestion_text, lectionTestQuestion_mode, lectionTestQuestion_testId) VALUES (?, ?, ?)", [question.question, question.inputMode, test_id])
            
            // добавляем опшны
            // ТУТ НЕТУ КВЕСЧИН АЙДИ
            question.options.forEach(async (option) => {
                await db.execute("INSERT INTO lection_test_option (lectionTestOption_text, lectionTestOption_testId) VALUES (?, ?)", [option, test_id])
            })

            // // добавляем правильные ответы
            // question.correctAnswer.forEach(async (answer) => {
            //     await db.execute("INSERT INTO lection_test_answer (lectionTestAnswer_text, lectionTestAnswer_testId) = (?, ?)", [answer, test_id])
            // })
        })

        res.status(200).json({massage: "я вахуе, но это работает"})
    } catch(error){
        res.status(500).json({error: "Ошибка при добавлении теста"})
    }

    
}

module.exports = {
    getTest,
    postTest
}