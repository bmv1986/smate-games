let questions = [];
let currentQuestionIndex = 0;

document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('questionScreen').classList.remove('hidden');

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            showQuestion();
        });
}

function showQuestion() {
    const questionData = questions[currentQuestionIndex];
    const questionScreen = document.getElementById('questionScreen');
    const questionText = document.getElementById('questionText');
    const answerSection = document.getElementById('answerSection');
    const answerText = document.getElementById('answerText');
    const timer = document.getElementById('timer');

    questionText.innerText = questionData.question;
    answerText.innerText = questionData.answer;

    // Скрываем ответ и таймер
    answerSection.classList.add('hidden');
    timer.classList.add('hidden');

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
                        setTimeout(showQuestion, 3000); // Пауза перед следующим вопросом
                    } else {
                        alert("Игра окончена!");
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

    const interval = setInterval(() => {
        timer.innerText = timeLeft;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(interval);
            timer.classList.add('hidden');
            onComplete();
        }
    }, 1000);
}