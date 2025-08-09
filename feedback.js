// feedback.js

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('suggestModal');
    const btn = document.getElementById('suggestQuestionBtn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('suggestQuestionForm');
    const formMessage = document.getElementById('formMessage');

    // Открытие модального окна
    btn.onclick = function() {
        modal.classList.remove('hidden');
        resetForm();
    }

    // Закрытие по крестику
    span.onclick = function() {
        modal.classList.add('hidden');
    }

    // Закрытие по клику вне окна
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    }

    // Счетчики символов
    setupCharacterCount('author', 'authorCount', 100);
    setupCharacterCount('questionText', 'questionCount', 350);
    setupCharacterCount('answer', 'answerCount', 150);
    setupCharacterCount('explanation', 'explanationCount', 200);

    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuestion();
    });
});

function setupCharacterCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const count = document.getElementById(countId);
    
    input.addEventListener('input', function() {
        const currentLength = this.value.length;
        count.textContent = currentLength;
        
        // Ограничиваем длину
        if (currentLength > maxLength) {
            this.value = this.value.substring(0, maxLength);
            count.textContent = maxLength;
        }
    });
}

function sanitizeInput(text) {
    // Удаляем HTML теги
    let sanitized = text.replace(/<[^>]*>/g, '');
    // Удаляем потенциально опасные символы
    sanitized = sanitized.replace(/[<>]/g, '');
    // Удаляем URL-ссылки
    sanitized = sanitized.replace(/(https?:\/\/[^\s]+)/g, '');
    return sanitized.trim();
}

function resetForm() {
    document.getElementById('suggestQuestionForm').reset();
    // Сброс счетчиков
    document.getElementById('authorCount').textContent = '0';
    document.getElementById('questionCount').textContent = '0';
    document.getElementById('answerCount').textContent = '0';
    document.getElementById('explanationCount').textContent = '0';
    hideMessage();
}

function showMessage(text, isSuccess) {
    const message = document.getElementById('formMessage');
    message.textContent = text;
    message.className = 'form-message ' + (isSuccess ? 'success' : 'error');
    message.classList.remove('hidden');
}

function hideMessage() {
    const message = document.getElementById('formMessage');
    message.classList.add('hidden');
}

function submitQuestion() {
    // Получаем значения
    const author = sanitizeInput(document.getElementById('author').value);
    const questionText = sanitizeInput(document.getElementById('questionText').value);
    const answer = sanitizeInput(document.getElementById('answer').value);
    const explanation = sanitizeInput(document.getElementById('explanation').value);

    // Проверка на пустые поля
    if (!author || !questionText || !answer) {
        showMessage('Пожалуйста, заполните все обязательные поля.', false);
        return;
    }

    // Формируем текст письма
    const fullQuestion = `${questionText} (Автор вопроса: ${author})`;
    const fullAnswer = explanation ? `${answer} (${explanation})` : answer;
    
    const mailContent = {
        question: fullQuestion,
        answer: fullAnswer,
        audio: "data/media/package1/audio/q--.mp3" // Заглушка
    };

    const mailtoString = `mailto:bmv86@mail.ru?subject=${encodeURIComponent('Предложенный вопрос для ЧГК')}&body=${encodeURIComponent(JSON.stringify(mailContent, null, 2))}`;

    // Открываем почтовый клиент
    window.location.href = mailtoString;

    // Показываем сообщение об успехе
    showMessage('Письмо с предложением открыто в вашем почтовом клиенте!', true);
    
    // Закрываем модальное окно через 2 секунды
    setTimeout(() => {
        document.getElementById('suggestModal').classList.add('hidden');
    }, 2000);
}