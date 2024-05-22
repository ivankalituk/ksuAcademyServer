// функция получает ХТМЛ код и возвращает из него все загруженные ссылки по типу uploads/23232.jpg
const urlByHtml = (html) => {
    const pattern = /<img src="(http:\/\/localhost:1000\/[^"]+)"/g;
    
    let matches;
    const imageUrls = [];

    while ((matches = pattern.exec(html)) !== null) {
        const fullUrl = matches[1];
        const strippedUrl = fullUrl.replace('http://localhost:1000/', '');
        imageUrls.push(strippedUrl);
    }

    return (imageUrls)
}

// функция сравнения массивов и вывода массивов элементов с совпадениями и без
const massMatches = (array1, array2) => {
    const matches  = []
    const notFound = []

    for (const item1 of array1) {
        // Проверить, входит ли элемент первого массива во второй массив
        if (array2.includes(item1)) {
            matches.push(item1);
        } else {
            notFound.push(item1);
        }
    }

    for (const item2 of array2) {
        if (!array1.includes(item2)) {
            notFound.push(item2);
        }
    }

    return { matches, notFound };
}

// функция преобразования текста в массив
const textToArray = (text) => {
    if (text === null || text ===''){
        return []
    } else {
        return text.split(' ').filter(part => part.trim() !== '');
    }
}

// массив в текст через пробел
const arrayToText = (array) => {
    return array.join(' ');
}

module.exports = {
    urlByHtml,
    massMatches,
    textToArray,
    arrayToText
}