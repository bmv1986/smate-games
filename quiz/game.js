let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 30;
let timerAudio = null; // Можно добавить аудио таймера позже

// Элементы
const quizScreen = document.getElementById('quizScreen');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const timerElement = document.getElementById('timer');
const timerFill = document.getElementById('timerFill');
const timerText = document.getElementById('timerText');
const resultScreen = document.getElementById('resultScreen');
const resultMessage = document.getElementById('resultMessage');
const explanation = document.getElementById('explanation');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const currentQuestionNumberEl = document.getElementById('currentQuestionNumber');
const totalQuestionsCountEl = document.getElementById('totalQuestionsCount');

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const currentPackageFile = decodeURIComponent(urlParams.get('pkg') || '');
const currentPackageName = decodeURIComponent(urlParams.get('name') || 'Без названия');
const startParam = urlParams.get('start');
const startIndex = startParam !== null ? parseInt(startParam, 10) : 0;

if (!currentPackageFile) {
    questionText.innerText = "Ошибка: не выбран пакет вопросов.";
} else {
    loadPackage(currentPackageFile, startIndex);
}

backButton.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти? Прогресс будет потерян.')) {
        window.location.href = 'index.html';
    }
});

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        resultScreen.classList.add('hidden');
        showQuestion();
    } else {
        endGame();
    }
});

function loadPackage(packageFile, startIndex = 0) {
    fetch(packageFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Пакет ${packageFile} не найден. Статус: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            currentQuestionIndex = Math.max(0, Math.min(startIndex, questions.length - 1));
            
            if (totalQuestionsCountEl) {
                totalQuestionsCountEl.innerText = questions.length;
            }
            
            console.log(`Пакет "${currentPackageName}" загружен. Начинаем с вопроса ${currentQuestionIndex + 1}:`, questions);
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

    // Обновление номера вопроса
    if (currentQuestionNumberEl) {
        currentQuestionNumberEl.innerText = currentQuestionIndex + 1;
    }

    // Сброс UI
    resetUI();

    // Показываем вопрос
    questionText.innerText = questionData.question;
    questionText.classList.remove('hidden');

    // Создаем варианты ответов
    optionsContainer.innerHTML = '';
    questionData.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.innerText = `${String.fromCharCode(65 + index)}. ${option}`; // A. B. C. D.
        button.dataset.index = index;
        button.addEventListener('click', () => onOptionSelected(index, questionData));
        optionsContainer.appendChild(button);
    });

    // Запускаем таймер
    startTimer();
}

function startTimer() {
    // Сброс таймера
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerUI();

    timerElement.classList.remove('hidden');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Время вышло - считаем как неправильный ответ
            showResult(false, questions[currentQuestionIndex]);
        }
    }, 1000);
}

function updateTimerUI() {
    const percentage = (timeLeft / 30) * 100;
    timerFill.style.width = `${percentage}%`;
    timerText.innerText = timeLeft;

    // Меняем цвет при малом времени
    if (timeLeft <= 10) {
        timerFill.style.background = 'linear-gradient(90deg, #f44336, #ff9800)';
    } else if (timeLeft <= 20) {
        timerFill.style.background = 'linear-gradient(90deg, #ff9800, #4caf50)';
    }
}

function onOptionSelected(selectedIndex, questionData) {
    // Останавливаем таймер
    clearInterval(timerInterval);
    
    // Отключаем все кнопки
    const optionButtons = optionsContainer.querySelectorAll('.option-button');
    optionButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.disabled = true;
    });

    const isCorrect = selectedIndex === questionData.correct;
    
    // Подсвечиваем выбранный и правильный ответ
    const selectedButton = optionButtons[selectedIndex];
    if (selectedButton) {
        if (isCorrect) {
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }
    }
    
    // Подсвечиваем правильный ответ, если выбрали неправильно
    if (!isCorrect) {
        const correctButton = optionButtons[questionData.correct];
        if (correctButton) {
            correctButton.classList.add('correct');
        }
    }

    // Обновляем счет
    if (isCorrect) {
        score++;
    }

    // Показываем результат
    showResult(isCorrect, questionData);
}

function showResult(isCorrect, questionData) {
    // Скрываем таймер
    timerElement.classList.add('hidden');
    
    // Показываем экран результата
    resultScreen.classList.remove('hidden');
    
    if (isCorrect) {
        resultMessage.innerText = 'Правильно!';
        resultMessage.className = 'result-message correct';
    } else {
        if (timeLeft <= 0) {
            resultMessage.innerText = 'Время вышло!';
        } else {
            resultMessage.innerText = 'Неправильно!';
        }
        resultMessage.className = 'result-message incorrect';
    }
    
    explanation.innerText = questionData.explanation || '';
}

function resetUI() {
    // Скрываем все элементы
    timerElement.classList.add('hidden');
    resultScreen.classList.add('hidden');
    
    // Сброс таймера
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerUI();
    
    // Очистка контейнеров
    optionsContainer.innerHTML = '';
}

function endGame() {
    resetUI();
    questionText.innerText = `Викторина окончена! Ваш счёт: ${score} из ${questions.length}`;
    optionsContainer.innerHTML = `
        <div style="font-size: 2rem; margin: 20px 0;">
            Точность: ${Math.round((score / questions.length) * 100)}%
        </div>
        <button class="btn next-button" onclick="location.href='index.html'">К выбору пакетов</button>
    `;
}