// Список доступных пакетов (можно расширить)
const packages = [
    { id: 'package1', name: 'Лига старта. Этап 1', file: 'packages/package1.json' },
    { id: 'package2', name: 'Лига старта. Этап 2', file: 'packages/package2.json' },
    // { id: 'custom', name: 'Мой пакет', file: 'packages/custom.json' }
];

document.addEventListener('DOMContentLoaded', () => {
    const packagesList = document.getElementById('packagesList');

    packages.forEach(pkg => {
        const button = document.createElement('button');
        button.className = 'package-button';
        button.innerText = pkg.name;
        button.onclick = () => selectPackage(pkg);
        packagesList.appendChild(button);
    });
});

function selectPackage(pkg) {
    // Передаем информацию о пакете через URL
    window.location.href = `game.html?pkg=${encodeURIComponent(pkg.file)}&name=${encodeURIComponent(pkg.name)}`;
}