let questions = [];
let currentQuestionIndex = 0;
let audioElement = null;
let timerAudio = null;
let recordTimeAudio = null;
let currentPackageFile = '';
let currentPackageName = '';

// Элементы
const questionText = document.getElementById('questionText');
const answerSection = document.getElementById('answerSection');
const answerText = document.getElementById('answerText');
const timer = document.getElementById('timer');
const recordTimeNotice = document.getElementById('recordTimeNotice');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');

// Аудио
timerAudio = new Audio('audio/timer.mp3');
timerAudio.loop = true;
recordTimeAudio = new Audio('audio/record_time.mp3');

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
currentPackageFile = decodeURIComponent(urlParams.get('pkg') || '');
currentPackageName = decodeURIComponent(urlParams.get('name') || 'Без названия');

if (!currentPackageFile) {
    // Для теста можно зашить пакет:
    // currentPackageFile = 'packages/package1.json';
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

    questionText.innerText = questionData.question;
    answerText.innerText = questionData.answer;

    // Скрываем всё лишнее
    answerSection.classList.add('hidden');
    timer.classList.add('hidden');
    questionText.classList.remove('hidden');
    recordTimeNotice.classList.add('hidden');
    nextButton.classList.add('hidden');

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

        // Воспроизводим аудио
        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise
                .then(_ => {
                    console.log("Аудио вопроса началось");
                })
                .catch(error => {
                    console.error("Ошибка воспроизведения аудио:", error);
                    // Даже если аудио не воспроизвелось, всё равно запускаем таймер
                    setTimeout(startQuestionTimer, 5000);
                });
        }

        // Когда аудио заканчивается, запускаем таймер
        audioElement.onended = function() {
            console.log("Аудио вопроса закончилось, запускаем таймер");
            startQuestionTimer();
        };

    } else {
        // Если аудио нет, запускаем таймер через паузу
        console.log("Нет аудио для вопроса, запуск таймера через 5 секунд");
        setTimeout(startQuestionTimer, 5000);
    }
}

function startQuestionTimer() {
    startTimer(60, () => {
        // Показываем надпись и воспроизводим аудио
        recordTimeNotice.classList.remove('hidden');
        recordTimeNotice.innerText = "Время для записи ответа на бланке";

        if (recordTimeAudio) {
            recordTimeAudio.currentTime = 0;
            recordTimeAudio.play().catch(e => console.log("Ошибка воспроизведения 'запись':", e));
        }

        // Ждём 10 секунд
        setTimeout(() => {
            recordTimeNotice.classList.add('hidden');
            // Через 5 секунд показываем ответ
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
    questionText.innerText = "Игра окончена!";
    answerSection.classList.add('hidden');
    nextButton.classList.add('hidden');
    recordTimeNotice.classList.add('hidden');
    timer.classList.add('hidden');
    
    // Останавливаем аудио, если играли
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