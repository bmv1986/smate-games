// admin/dashboard.js

// Проверка авторизации
if (!localStorage.getItem('adminLoggedIn')) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const packagesList = document.getElementById('packagesList');
    
    // Выход из админки
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    });
    
    // Загрузка статистики и пакетов
    loadDashboardData();
});

function loadDashboardData() {
    // Для демо - имитация загрузки данных
    setTimeout(() => {
        // Статистика
        document.getElementById('classicCount').textContent = '3';
        document.getElementById('quizCount').textContent = '2';
        document.getElementById('totalQuestions').textContent = '125';
        
        // Список пакетов
        loadPackages();
    }, 500);
}

function loadPackages() {
    const packagesList = document.getElementById('packagesList');
    
    // Демо-данные
    const packages = [
        { id: 1, name: 'Лига старта. Этап 1', type: 'classic', questions: 25, date: '2024-01-15' },
        { id: 2, name: 'История', type: 'quiz', questions: 30, date: '2024-01-20' },
        { id: 3, name: 'Наука', type: 'quiz', questions: 20, date: '2024-01-25' },
        { id: 4, name: '42 вопроса из базы ЧГК', type: 'classic', questions: 42, date: '2024-02-01' }
    ];
    
    if (packages.length === 0) {
        packagesList.innerHTML = `
            <div class="empty-state">
                <p>Пока нет пакетов. Создайте первый!</p>
            </div>
        `;
        return;
    }
    
    packagesList.innerHTML = packages.map(pkg => `
        <div class="package-item">
            <div class="package-info ${pkg.type}">
                <h3>${pkg.name}</h3>
                <div class="package-meta">
                    <span class="type">${pkg.type === 'classic' ? 'Классическая игра' : 'Викторина'}</span>
                    <span class="count">${pkg.questions} вопросов</span>
                    <span class="date">${pkg.date}</span>
                </div>
            </div>
            <div class="package-actions">
                <button class="btn edit-btn" onclick="editPackage(${pkg.id})">Редактировать</button>
                <button class="btn delete-btn" onclick="deletePackage(${pkg.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

function createNewPackage() {
    // Для демо - открываем редактор с новым пакетом
    window.location.href = 'package-editor.html?new=true';
}

function editPackage(id) {
    // Для демо - открываем редактор с существующим пакетом
    window.location.href = `package-editor.html?id=${id}`;
}

function deletePackage(id) {
    if (confirm('Вы уверены, что хотите удалить этот пакет? Это действие нельзя отменить.')) {
        // Для демо - просто показываем сообщение
        alert(`Пакет #${id} удален (в демо-версии)`);
        // В реальной системе здесь будет запрос к серверу
        loadPackages(); // Перезагружаем список
    }
}