let questions = [];
let currentQuestionIndex = 0;
let audioElement = null;
let timerAudio = null;

// Создаём элемент для фоновой музыки таймера
timerAudio = new Audio('audio/timer.mp3');
timerAudio.loop = true; // Повторять музыку

const defaultQuestions = [
    {
        "question": "В одном из выпусков «Поля чудес» за сектор, в котором находилось слово «СЕКТОР», была дана призовая единица. Назовите эту единицу.",
        "answer": "Бочка",
        "audio": "audio/q1.mp3"
    },
    {
        "question": "Во время ремонта в московском метро, в тоннеле между станциями «Третьяковская» и «Новокузнецкая» были обнаружены остатки старых вагонов. Их отправили в музей. Какой музей их принял?",
        "answer": "Музей московского метрополитена",
        "audio": "audio/q2.mp3"
    }
];

document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('questionScreen').classList.remove('hidden');

    fetch('questions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Файл не найден');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            console.log("Вопросы загружены из файла:", questions);
            showQuestion();
        })
        .catch(error => {
            console.warn("Не удалось загрузить файл questions.json, используем встроенные вопросы.", error);
            questions = defaultQuestions;
            showQuestion();
        });
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        document.getElementById('questionText').innerText = "Вопросы закончились!";
        return;
    }

    const questionData = questions[currentQuestionIndex];
    const questionText = document.getElementById('questionText');
    const answerSection = document.getElementById('answerSection');
    const answerText = document.getElementById('answerText');
    const timer = document.getElementById('timer');

    questionText.innerText = questionData.question;
    answerText.innerText = questionData.answer;

    // Скрываем ответ и таймер
    answerSection.classList.add('hidden');
    timer.classList.add('hidden');
    questionText.classList.remove('hidden');

    // Останавливаем предыдущее аудио
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }

    // Воспроизводим аудио вопроса
    if (questionData.audio) {
        audioElement = new Audio(questionData.audio);
        audioElement.play().catch(e => console.log("Ошибка воспроизведения аудио:", e));
    }

    // Через 5 секунд показываем таймер
    setTimeout(() => {
        startTimer(60, () => {
            // После 60 секунд — 10 секунд на запись
            setTimeout(() => {
                // Через 5 секунд показываем ответ
                setTimeout(() => {
                    answerSection.classList.remove('hidden');
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        setTimeout(showQuestion, 5000);
                    } else {
                        setTimeout(() => {
                            document.getElementById('questionText').innerText = "Игра окончена!";
                            answerSection.classList.add('hidden');
                        }, 3000);
                    }
                }, 5000);
            }, 10000);
        });
    }, 5000);
}

function startTimer(seconds, onComplete) {
    const timer = document.getElementById('timer');
    timer.classList.remove('hidden');
    let timeLeft = seconds;

    // Воспроизводим музыку таймера
    timerAudio.currentTime = 0;
    timerAudio.play().catch(e => console.log("Ошибка воспроизведения таймера:", e));

    const interval = setInterval(() => {
        timer.innerText = timeLeft;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(interval);
            timer.classList.add('hidden');
            timerAudio.pause(); // Останавливаем музыку
            onComplete();
        }
    }, 1000);
}