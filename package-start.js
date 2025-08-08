let currentPackageFile = '';
let currentPackageName = '';
let questions = [];

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

if (!currentPackageFile) {
    packageNameEl.innerText = "Ошибка: не выбран пакет.";
} else {
    packageNameEl.innerText = currentPackageName;
    loadPackageInfo(currentPackageFile);
}

backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

startButton.addEventListener('click', () => {
    // Переходим на страницу игры, передав начальный вопрос (0 по умолчанию)
    window.location.href = `game.html?pkg=${encodeURIComponent(currentPackageFile)}&name=${encodeURIComponent(currentPackageName)}&start=0`;
});

questionSelect.addEventListener('change', () => {
    const startIndex = questionSelect.value;
    window.location.href = `game.html?pkg=${encodeURIComponent(currentPackageFile)}&name=${encodeURIComponent(currentPackageName)}&start=${startIndex}`;
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

            // Заполняем выпадающий список
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