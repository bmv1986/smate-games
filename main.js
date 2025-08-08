// Список доступных пакетов
const packages = [
    { id: 'package1', name: 'Лига старта. Этап 1', file: 'packages/package1.json' },
    { id: 'package2', name: 'Лига старта. Этап 2', file: 'packages/package2.json' }
];

document.addEventListener('DOMContentLoaded', () => {
    const packagesList = document.getElementById('packagesList');

    packagesList.innerHTML = ''; // Очистим, если что-то было

    packages.forEach(pkg => {
        // Создаем кнопку
        const button = document.createElement('button');
        button.className = 'package-button';

        // Создаем элемент для названия
        const nameSpan = document.createElement('span');
        nameSpan.className = 'package-name';
        nameSpan.innerText = pkg.name;

        // Создаем элемент для количества вопросов
        const countSpan = document.createElement('span');
        countSpan.className = 'question-count';
        countSpan.innerText = 'Загрузка...';

        button.appendChild(nameSpan);
        button.appendChild(countSpan);
        button.onclick = () => selectPackage(pkg);

        packagesList.appendChild(button);

        // Асинхронно загружаем количество вопросов
        loadQuestionCount(pkg, countSpan);
    });
});

function selectPackage(pkg) {
    window.location.href = `game.html?pkg=${encodeURIComponent(pkg.file)}&name=${encodeURIComponent(pkg.name)}`;
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