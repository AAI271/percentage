document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const space = document.getElementById('space');
    const percentSlider = document.getElementById('percentSlider');
    const percentValue = document.getElementById('percentValue');
    const btnEasy = document.getElementById('btnEasy');
    const btnMedium = document.getElementById('btnMedium');
    const btnHard = document.getElementById('btnHard');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const totalStarsEl = document.getElementById('totalStars');
    const collectedStarsEl = document.getElementById('collectedStars');
    const percentValueBig = document.getElementById('percentValueBig');

    // Настройки уровней
    const levels = {
        easy: { stars: 10, size: '1.8rem' },
        medium: { stars: 20, size: '1.4rem' },
        hard: { stars: 30, size: '1rem' }
    };

    let currentLevel = 'easy';
    let stars = [];
    let collected = 0;

    // Инициализация
    initLevel(currentLevel);

    // Обработчики
    percentSlider.addEventListener('input', updateStarsFromSlider);
    
    btnEasy.addEventListener('click', () => changeLevel('easy'));
    btnMedium.addEventListener('click', () => changeLevel('medium'));
    btnHard.addEventListener('click', () => changeLevel('hard'));

    // Проверяем тему устройства
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(updateTheme);
    updateTheme(darkModeMediaQuery);

    // Функции
    function updateTheme(e) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }

    function initLevel(level) {
        const config = levels[level];
        space.innerHTML = '';
        stars = [];
        collected = 0;

        // Создаем звёзды
        for (let i = 0; i < config.stars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '⭐';
            star.style.fontSize = config.size;
            star.dataset.index = i;

            star.addEventListener('click', function() {
                if (this.classList.contains('collected')) {
                    this.classList.remove('collected');
                    collected--;
                } else {
                    this.classList.add('collected');
                    collected++;
                    // Вибрация (если поддерживается)
                    if (navigator.vibrate) navigator.vibrate(30);
                }
                updateProgress();
            });

            space.appendChild(star);
            stars.push(star);
        }

        totalStarsEl.textContent = config.stars;
        updateProgress();
    }

    function changeLevel(level) {
        currentLevel = level;
        btnEasy.classList.remove('active');
        btnMedium.classList.remove('active');
        btnHard.classList.remove('active');
        document.getElementById(`btn${level.charAt(0).toUpperCase() + level.slice(1)}`).classList.add('active');
        initLevel(level);
    }

    function updateStarsFromSlider() {
        const percent = parseInt(percentSlider.value);
        percentValue.textContent = percent + '%';

        const total = stars.length;
        const targetCollected = Math.round(total * percent / 100);

        // Сбрасываем сбор
        stars.forEach(star => star.classList.remove('collected'));
        collected = 0;

        // Собираем нужное количество
        for (let i = 0; i < targetCollected; i++) {
            stars[i].classList.add('collected');
            collected++;
        }

        updateProgress();
    }

    function updateProgress() {
        const total = stars.length;
        const percent = Math.round((collected / total) * 100);

        progressFill.style.width = percent + '%';
        progressText.textContent = percent + '%';
        percentValueBig.textContent = percent + '%';
        collectedStarsEl.textContent = collected;

        // Обновляем слайдер, если кликали вручную
        if (percent !== parseInt(percentSlider.value)) {
            percentSlider.value = percent;
            percentValue.textContent = percent + '%';
        }
    }
});