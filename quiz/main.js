// quiz/main.js
const packages = [
    { id: 'quiz_history', name: 'История', file: 'data/packages/quiz_history.json' },
    { id: 'quiz_science', name: 'Наука', file: 'data/packages/quiz_science.json' }
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