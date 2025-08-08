let questions = [];
let currentQuestionIndex = 0;
let audioElement = null;
let timerAudio = null;
let recordTimeAudio = null;
let currentPackageFile = '';
let currentPackageName = '';

// Элементы
const questionScreen = document.getElementById('questionScreen');
const imageContainer = document.getElementById('imageContainer');
const questionImage = document.getElementById('questionImage');
const questionText = document.getElementById('questionText');
const answerSection = document.getElementById('answerSection');
const answerText = document.getElementById('answerText');
const timer = document.getElementById('timer');
const recordTimeNotice = document.getElementById('recordTimeNotice');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
currentPackageFile = decodeURIComponent(urlParams.get('pkg') || '');
currentPackageName = decodeURIComponent(urlParams.get('name') || 'Без названия');

// Определяем путь к медиа для текущего пакета
let packageMediaPath = '';
if (currentPackageFile) {
    // Пример: 'packages/package1.json' -> 'media/package1/'
    const packageName = currentPackageFile.match(/packages\/(.+?)\.json/)?.[1] || 'unknown';
    packageMediaPath = `media/${packageName}/`;
}

// Загружаем общие аудио
timerAudio = new Audio('media/common/timer.mp3');
timerAudio.loop = true;
recordTimeAudio = new Audio('media/common/record_time.mp3');

if (!currentPackageFile) {
    questionText.innerText = "Ошибка: не выбран пакет вопросов.";
} else {
    loadPackage(currentPackageFile);
}

backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        nextButton.classList.add('hidden');
        showQuestion();
    } else {
        endGame();
    }
});

function loadPackage(packageFile) {
    fetch(packageFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Пакет ${packageFile} не найден. Статус: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            console.log(`Пакет "${currentPackageName}" загружен:`, questions);
            if (questions.length > 0) {
                showQuestion();
            } else {
                questionText.innerText = "В этом пакете нет вопросов.";
            }
        })
        .catch(error => {
            console.error("Ошибка загрузки пакета:", error);
            questionText.innerText = `Ошибка загрузки пакета: ${error.message}`;
        });
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const questionData = questions[currentQuestionIndex];

    // Скрываем всё лишнее
    answerSection.classList.add('hidden');
    timer.classList.add('hidden');
    recordTimeNotice.classList.add('hidden');
    nextButton.classList.add('hidden');
    imageContainer.classList.add('hidden');

    // Показываем текст вопроса
    questionText.innerText = questionData.question;
    questionText.classList.remove('hidden');

    // Показываем изображение, если есть
    if (questionData.image) {
        questionImage.src = questionData.image;
        imageContainer.classList.remove('hidden');
    }

    // Ответ
    answerText.innerText = questionData.answer;

    // Останавливаем предыдущие аудио
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement = null;
    }

    // --- ВОСПРОИЗВЕДЕНИЕ АУДИО ---
    if (questionData.audio) {
        console.log("Загрузка аудио:", questionData.audio);
        audioElement = new Audio(questionData.audio);

        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise
                .then(_ => {
                    console.log("Аудио вопроса началось");
                })
                .catch(error => {
                    console.error("Ошибка воспроизведения аудио:", error);
                    setTimeout(startQuestionTimer, 5000);
                });
        }

        // Когда аудио заканчивается, запускаем таймер
        audioElement.onended = function() {
            console.log("Аудио вопроса закончилось, запускаем таймер");
            startQuestionTimer();
        };

    } else {
        console.log("Нет аудио для вопроса, запуск таймера через 5 секунд");
        setTimeout(startQuestionTimer, 5000);
    }
}

function startQuestionTimer() {
    startTimer(60, () => {
        recordTimeNotice.classList.remove('hidden');
        recordTimeNotice.innerText = "Время для записи ответа на бланке";

        if (recordTimeAudio) {
            recordTimeAudio.currentTime = 0;
            recordTimeAudio.play().catch(e => console.log("Ошибка воспроизведения 'запись':", e));
        }

        setTimeout(() => {
            recordTimeNotice.classList.add('hidden');
            setTimeout(() => {
                answerSection.classList.remove('hidden');
                nextButton.classList.remove('hidden');
            }, 5000);
        }, 10000);
    });
}

function startTimer(seconds, onComplete) {
    timer.classList.remove('hidden');
    let timeLeft = seconds;

    timerAudio.currentTime = 0;
    timerAudio.play().catch(e => console.log("Ошибка воспроизведения таймера:", e));

    const interval = setInterval(() => {
        timer.innerText = timeLeft;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(interval);
            timer.classList.add('hidden');
            timerAudio.pause();
            onComplete();
        }
    }, 1000);
}

function endGame() {
    // Скрываем всё
    imageContainer.classList.add('hidden');
    questionText.classList.add('hidden');
    answerSection.classList.add('hidden');
    nextButton.classList.add('hidden');
    recordTimeNotice.classList.add('hidden');
    timer.classList.add('hidden');
    
    // Показываем сообщение об окончании
    const endMessage = document.createElement('div');
    endMessage.id = 'endMessage';
    endMessage.style.fontSize = '3em';
    endMessage.style.marginTop = '20px';
    endMessage.innerText = 'Игра окончена!';
    questionScreen.appendChild(endMessage);

    // Останавливаем аудио
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
    timerAudio.pause();
    timerAudio.currentTime = 0;
    if (recordTimeAudio) {
        recordTimeAudio.pause();
        recordTimeAudio.currentTime = 0;
    }
}