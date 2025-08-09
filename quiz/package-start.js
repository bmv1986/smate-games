// quiz/package-start.js
let currentPackageFile = '';
let currentPackageName = '';
let questions = [];
let isSuperGame = false;
let superGameKey = '';

// Элементы
const packageNameEl = document.getElementById('packageName');
const totalQuestionsEl = document.getElementById('totalQuestions');
const questionSelect = document.getElementById('questionSelect');
const startButton = document.getElementById('startButton');
const backButton = document.getElementById('backButton');

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
currentPackageFile = decodeURIComponent(urlParams.get('pkg') || '');
currentPackageName = decodeURIComponent(urlParams.get('name') || 'Без названия');

// Проверяем супер-игру
const superParam = urlParams.get('super');
if (superParam) {
    isSuperGame = true;
    superGameKey = decodeURIComponent(superParam);
    loadSuperGameInfo(superGameKey);
} else if (currentPackageFile) {
    packageNameEl.innerText = currentPackageName;
    loadPackageInfo(currentPackageFile);
} else {
    packageNameEl.innerText = "Ошибка: не выбран пакет.";
}

backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

startButton.addEventListener('click', () => {
    if (isSuperGame && superGameKey) {
        window.location.href = `game.html?super=${encodeURIComponent(superGameKey)}&name=${encodeURIComponent(currentPackageName)}`;
    } else {
        window.location.href = `game.html?pkg=${encodeURIComponent(currentPackageFile)}&name=${encodeURIComponent(currentPackageName)}&start=0`;
    }
});

questionSelect.addEventListener('change', () => {
    const startIndex = questionSelect.value;
    if (isSuperGame && superGameKey) {
        window.location.href = `game.html?super=${encodeURIComponent(superGameKey)}&name=${encodeURIComponent(currentPackageName)}&start=${startIndex}`;
    } else {
        window.location.href = `game.html?pkg=${encodeURIComponent(currentPackageFile)}&name=${encodeURIComponent(currentPackageName)}&start=${startIndex}`;
    }
});

function loadPackageInfo(packageFile) {
    fetch(packageFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Пакет ${packageFile} не найден.`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            totalQuestionsEl.innerText = questions.length;

            questionSelect.innerHTML = '';
            for (let i = 0; i < questions.length; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.text = `Вопрос ${i + 1}`;
                questionSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error("Ошибка загрузки пакета:", error);
            packageNameEl.innerText = `Ошибка: ${error.message}`;
        });
}

function loadSuperGameInfo(key) {
    try {
        const superGameData = localStorage.getItem(key);
        if (!superGameData) {
            throw new Error('Данные супер игры не найдены.');
        }
        
        const parsedData = JSON.parse(superGameData);
        packageNameEl.innerText = parsedData.name || 'Супер игра';
        // Для супер игры фиксированное количество вопросов
        totalQuestionsEl.innerText = '42';
        
        questionSelect.innerHTML = '';
        for (let i = 0; i < 42; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = `Вопрос ${i + 1}`;
            questionSelect.appendChild(option);
        }
        
    } catch (error) {
        console.error("Ошибка загрузки информации о супер игре:", error);
        packageNameEl.innerText = `Ошибка: ${error.message}`;
    }
}