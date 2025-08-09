// quiz/main.js
// Список доступных пакетов для викторины
const packages = [
    { id: 'quiz_history', name: 'История', file: 'data/packages/quiz_history.json' },
    { id: 'quiz_science', name: 'Наука', file: 'data/packages/quiz_science.json' },
    { id: 'quiz_science', name: 'Наука', file: 'data/packages/quiz_himy.json' }
    // Добавьте больше пакетов по мере необходимости
];

// Функция для перемешивания массива (алгоритм Фишера-Йетса)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener('DOMContentLoaded', () => {
    const packagesList = document.getElementById('packagesList');
    packagesList.innerHTML = '';

    // Добавляем кнопку "Супер игра"
    const superGameButton = document.createElement('button');
    superGameButton.className = 'package-button super-game-button';
    superGameButton.innerHTML = `
        <span class="package-name">СУПЕР ИГРА</span>
        <span class="question-count">42 вопроса</span>
        <span class="super-desc">Вопросы из всех пакетов</span>
    `;
    superGameButton.onclick = startSuperGame;
    packagesList.appendChild(superGameButton);

    // Добавляем обычные пакеты
    packages.forEach(pkg => {
        const button = document.createElement('button');
        button.className = 'package-button';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'package-name';
        nameSpan.innerText = pkg.name;

        const countSpan = document.createElement('span');
        countSpan.className = 'question-count';
        countSpan.innerText = 'Загрузка...';

        button.appendChild(nameSpan);
        button.appendChild(countSpan);
        button.onclick = () => selectPackage(pkg);

        packagesList.appendChild(button);

        loadQuestionCount(pkg, countSpan);
    });
});

function selectPackage(pkg) {
    window.location.href = `package-start.html?pkg=${encodeURIComponent(pkg.file)}&name=${encodeURIComponent(pkg.name)}`;
}

function startSuperGame() {
    // Собираем все пакеты для супер игры
    const allPackageFiles = packages.map(p => p.file);
    createSuperGamePackage(allPackageFiles);
}

async function createSuperGamePackage(packageFiles) {
    try {
        const allQuestions = [];
        
        // Загружаем вопросы из всех пакетов
        for (const file of packageFiles) {
            const response = await fetch(file);
            if (response.ok) {
                const questions = await response.json();
                allQuestions.push(...questions);
            }
        }

        if (allQuestions.length === 0) {
            alert('Не удалось загрузить вопросы для супер игры.');
            return;
        }

        // Перемешиваем все вопросы
        const shuffledQuestions = shuffleArray([...allQuestions]);
        
        // Берем первые 42 вопроса
        const superGameQuestions = shuffledQuestions.slice(0, 42);
        
        // Создаем временный "файл" для супер игры
        const superGamePackage = {
            name: 'Супер игра',
            questions: superGameQuestions
        };

        // Сохраняем в localStorage и переходим к игре
        const superGameKey = 'super_game_' + Date.now();
        localStorage.setItem(superGameKey, JSON.stringify(superGamePackage));
        
        window.location.href = `package-start.html?super=${encodeURIComponent(superGameKey)}&name=${encodeURIComponent('Супер игра')}`;
        
    } catch (error) {
        console.error("Ошибка создания супер игры:", error);
        alert('Произошла ошибка при создании супер игры.');
    }
}

function loadQuestionCount(pkg, element) {
    fetch(pkg.file)
        .then(response => {
            if (!response.ok) throw new Error('Пакет не найден');
            return response.json();
        })
        .then(data => {
            element.innerText = `${data.length} вопросов`;
        })
        .catch(error => {
            console.error("Ошибка загрузки пакета для подсчета:", error);
            element.innerText = 'Ошибка';
        });
}