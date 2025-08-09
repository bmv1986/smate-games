// admin/package-editor.js

// Проверка авторизации
if (!localStorage.getItem('adminLoggedIn')) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('id');
    const isNew = urlParams.has('new');
    const packageType = urlParams.get('type') || 'classic';
    
    // Инициализация
    initializeEditor(packageId, isNew, packageType);
    
    // Обработчики событий
    document.getElementById('packageType').addEventListener('change', toggleQuestionType);
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('saveBtn').addEventListener('click', savePackage);
    
    // Модальное окно
    document.querySelector('.close-modal').addEventListener('click', closeQuestionModal);
    document.getElementById('cancelQuestionBtn').addEventListener('click', closeQuestionModal);
    document.getElementById('questionForm').addEventListener('submit', saveQuestion);
    
    // Закрытие модального окна по клику вне его
    document.getElementById('questionModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeQuestionModal();
        }
    });
});

let currentPackage = {
    id: null,
    name: '',
    type: 'classic',
    questions: []
};

let editingQuestionIndex = -1;

function initializeEditor(packageId, isNew, packageType) {
    const title = document.getElementById('editorTitle');
    
    if (isNew) {
        title.textContent = 'Создание нового пакета';
        currentPackage.type = packageType;
        document.getElementById('packageType').value = packageType;
    } else if (packageId) {
        title.textContent = 'Редактирование пакета';
        loadPackage(packageId);
    } else {
        title.textContent = 'Редактор пакета';
        currentPackage.type = packageType;
        document.getElementById('packageType').value = packageType;
    }
    
    toggleQuestionType();
}

function loadPackage(packageId) {
    // Для демо - имитация загрузки пакета
    setTimeout(() => {
        // Демо-данные
        currentPackage = {
            id: packageId,
            name: packageId === '1' ? 'Лига старта. Этап 1' : 'Демо пакет',
            type: 'classic',
            questions: [
                {
                    question: 'Сколько будет 2+2*2?',
                    answer: '6',
                    audio: null,
                    image: null
                },
                {
                    question: 'Какой город является столицей Франции?',
                    answer: 'Париж',
                    audio: null,
                    image: null
                }
            ]
        };
        
        // Заполняем форму
        document.getElementById('packageName').value = currentPackage.name;
        document.getElementById('packageType').value = currentPackage.type;
        toggleQuestionType();
        renderQuestions();
    }, 300);
}

function toggleQuestionType() {
    const packageType = document.getElementById('packageType').value;
    currentPackage.type = packageType;
    
    // Показываем соответствующие элементы в модальном окне
    document.querySelectorAll('.question-type').forEach(el => {
        el.classList.add('hidden');
    });
    
    if (packageType === 'classic') {
        document.querySelector('.classic-question').classList.remove('hidden');
    } else {
        document.querySelector('.quiz-question').classList.remove('hidden');
    }
}

function renderQuestions() {
    const questionsList = document.getElementById('questionsList');
    
    if (currentPackage.questions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-state">
                <p>В пакете пока нет вопросов</p>
                <button class="btn primary-btn" onclick="addQuestion()">Добавить первый вопрос</button>
            </div>
        `;
        return;
    }
    
    questionsList.innerHTML = currentPackage.questions.map((q, index) => {
        const isClassic = currentPackage.type === 'classic';
        const previewText = isClassic ? q.answer : (q.options ? q.options[q.correct] : 'N/A');
        const previewLabel = isClassic ? 'Ответ:' : 'Правильный:';
        
        return `
        <div class="question-item ${currentPackage.type}">
            <div class="question-preview">
                <h4>Вопрос ${index + 1}</h4>
                <div class="question-text">${q.question}</div>
                <div class="question-meta">
                    <strong>${previewLabel}</strong> ${previewText}
                </div>
            </div>
            <div class="question-actions">
                <button class="btn edit-btn" onclick="editQuestion(${index})">Изменить</button>
                <button class="btn delete-btn" onclick="deleteQuestion(${index})">Удалить</button>
            </div>
        </div>
        `;
    }).join('');
}

function addQuestion() {
    editingQuestionIndex = -1;
    openQuestionModal();
}

function editQuestion(index) {
    editingQuestionIndex = index;
    const question = currentPackage.questions[index];
    openQuestionModal(question);
}

function deleteQuestion(index) {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
        currentPackage.questions.splice(index, 1);
        renderQuestions();
        showMessage('Вопрос удален', true);
    }
}

function openQuestionModal(question = null) {
    const modal = document.getElementById('questionModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('questionForm');
    
    // Сброс формы
    form.reset();
    document.getElementById('questionIndex').value = editingQuestionIndex;
    
    if (editingQuestionIndex === -1) {
        title.textContent = 'Добавление вопроса';
    } else {
        title.textContent = 'Редактирование вопроса';
        fillQuestionForm(question);
    }
    
    modal.classList.remove('hidden');
}

function fillQuestionForm(question) {
    if (currentPackage.type === 'classic') {
        document.getElementById('classicQuestion').value = question.question || '';
        document.getElementById('classicAnswer').value = question.answer || '';
        // В реальной системе здесь будут обработаны файлы
        if (question.audio) {
            document.getElementById('audioFileInfo').textContent = `Текущий файл: ${question.audio}`;
        }
        if (question.image) {
            document.getElementById('imageFileInfo').textContent = `Текущий файл: ${question.image}`;
        }
    } else {
        document.getElementById('quizQuestion').value = question.question || '';
        document.getElementById('explanation').value = question.explanation || '';
        
        if (question.options && question.options.length === 4) {
            for (let i = 0; i < 4; i++) {
                document.getElementById(`optionText${i}`).value = question.options[i] || '';
                document.getElementById(`option${i}`).checked = question.correct === i;
            }
        }
    }
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.add('hidden');
    editingQuestionIndex = -1;
}

function saveQuestion(e) {
    e.preventDefault();
    const form = document.getElementById('questionForm');
    
    if (currentPackage.type === 'classic') {
        saveClassicQuestion();
    } else {
        saveQuizQuestion();
    }
}

function saveClassicQuestion() {
    const questionText = document.getElementById('classicQuestion').value.trim();
    const answer = document.getElementById('classicAnswer').value.trim();
    
    if (!questionText || !answer) {
        showMessage('Пожалуйста, заполните все обязательные поля', false);
        return;
    }
    
    const question = {
        question: questionText,
        answer: answer
        // В реальной системе здесь будут обработаны файлы
    };
    
    if (editingQuestionIndex === -1) {
        currentPackage.questions.push(question);
    } else {
        currentPackage.questions[editingQuestionIndex] = question;
    }
    
    renderQuestions();
    closeQuestionModal();
    showMessage('Вопрос сохранен', true);
}

function saveQuizQuestion() {
    const questionText = document.getElementById('quizQuestion').value.trim();
    const explanation = document.getElementById('explanation').value.trim();
    
    if (!questionText) {
        showMessage('Пожалуйста, введите текст вопроса', false);
        return;
    }
    
    const options = [];
    let correctOption = -1;
    
    for (let i = 0; i < 4; i++) {
        const optionText = document.getElementById(`optionText${i}`).value.trim();
        const isCorrect = document.getElementById(`option${i}`).checked;
        
        if (!optionText) {
            showMessage(`Пожалуйста, заполните вариант ответа ${i + 1}`, false);
            return;
        }
        
        options.push(optionText);
        if (isCorrect) {
            correctOption = i;
        }
    }
    
    if (correctOption === -1) {
        showMessage('Пожалуйста, выберите правильный ответ', false);
        return;
    }
    
    const question = {
        question: questionText,
        options: options,
        correct: correctOption,
        explanation: explanation
    };
    
    if (editingQuestionIndex === -1) {
        currentPackage.questions.push(question);
    } else {
        currentPackage.questions[editingQuestionIndex] = question;
    }
    
    renderQuestions();
    closeQuestionModal();
    showMessage('Вопрос сохранен', true);
}

function savePackage() {
    const packageName = document.getElementById('packageName').value.trim();
    const packageType = document.getElementById('packageType').value;
    
    if (!packageName) {
        showMessage('Пожалуйста, введите название пакета', false);
        return;
    }
    
    if (currentPackage.questions.length === 0) {
        showMessage('Пожалуйста, добавьте хотя бы один вопрос', false);
        return;
    }
    
    // В реальной системе здесь будет отправка данных на сервер
    console.log('Сохранение пакета:', {
        name: packageName,
        type: packageType,
        questions: currentPackage.questions
    });
    
    showMessage('Пакет успешно сохранен!', true);
    
    // Для демо - через 2 секунды возвращаемся к дашборду
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

function showMessage(text, isSuccess) {
    const message = document.getElementById('editorMessage');
    message.textContent = text;
    message.className = 'message ' + (isSuccess ? 'success' : 'error');
    message.classList.remove('hidden');
    
    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
        message.classList.add('hidden');
    }, 3000);
}