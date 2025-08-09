// Список доступных пакетов для классической игры
const packages = [
    { id: 'chgk_42_questions', name: '42 вопроса из базы ЧГК', file: 'packages/chgk_42_questions.json' },
    { id: 'package1', name: 'Лига старта. Этап 1', file: 'packages/package1.json' },
    // { id: 'custom', name: 'Мой пакет', file: 'packages/custom.json' }
];

document.addEventListener('DOMContentLoaded', () => {
    const packagesList = document.getElementById('packagesList');

    packagesList.innerHTML = '';

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