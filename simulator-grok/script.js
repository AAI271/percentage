// Получаем элементы DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreValue = document.getElementById('scoreValue');
const levelValue = document.getElementById('levelValue');
const currentTask = document.getElementById('currentTask');

// Глобальные переменные
let score = 0;
let level = 1;
let gameActive = false;
let fruits = [];
let currentTargetPercent = null;
let canvasWidth, canvasHeight;

// Цвета для фруктов
const fruitColors = [
    '#FF5733', // красный (яблоко)
    '#FFC300', // желтый (банан)
    '#FF9800', // оранжевый (апельсин)
    '#4CAF50', // зеленый (груша)
    '#9C27B0', // фиолетовый (слива)
    '#E91E63'  // розовый (клубника)
];

// Проценты для заданий
const percentTasks = [25, 50, 75, 10, 20, 30, 40, 60, 70, 80, 90, 100];

// Адаптивность канваса
function resizeCanvas() {
    const container = canvas.parentElement;
    canvasWidth = container.clientWidth;
    
    // Устанавливаем высоту в зависимости от устройства
    if (window.innerWidth <= 768) {
        canvasHeight = window.innerHeight * 0.4; // 40% высоты экрана на мобильных
    } else {
        canvasHeight = window.innerHeight * 0.5; // 50% высоты экрана на десктопах
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Перерисовываем фрукты при изменении размера
    if (gameActive) {
        drawFruits();
    }
}

// Класс для фруктов
class Fruit {
    constructor(x, y, radius, percent, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.percent = percent;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        this.text = `${percent}%`;
    }
    
    draw() {
        // Рисуем круг фрукта
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        
        // Рисуем процент внутри фрукта
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.radius * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        
        // Рисуем закрашенную часть (визуализация процента)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, -Math.PI/2, (this.percent/100) * Math.PI * 2 - Math.PI/2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
    
    update() {
        // Отскок от стенок
        if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.y + this.radius > canvasHeight || this.y - this.radius < 0) {
            this.velocity.y = -this.velocity.y;
        }
        
        // Обновление позиции
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Ограничиваем позицию в пределах канваса
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        
        this.draw();
    }
}

// Инициализация игры
function initGame() {
    score = 0;
    level = 1;
    scoreValue.textContent = score;
    levelValue.textContent = level;
    gameActive = true;
    createFruits();
    setNewTask();
    animate();
    startButton.textContent = 'Перезапустить';
}

// Создание фруктов
function createFruits() {
    fruits = [];
    const fruitCount = Math.min(5 + level, 10); // Увеличиваем количество фруктов с уровнем
    const minRadius = Math.min(canvasWidth, canvasHeight) * 0.06; // Минимальный радиус
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.1; // Максимальный радиус
    
    // Создаем уникальные проценты для фруктов
    const usedPercents = new Set();
    
    for (let i = 0; i < fruitCount; i++) {
        // Генерируем случайный процент (кратный 5)
        let percent;
        do {
            percent = Math.floor(Math.random() * 20 + 1) * 5;
        } while (usedPercents.has(percent));
        usedPercents.add(percent);
        
        // Подбираем позицию, где фрукты не перекрываются
        let x, y, radius, overlap;
        let attempts = 0;
        
        do {
            overlap = false;
            radius = Math.random() * (maxRadius - minRadius) + minRadius;
            x = Math.random() * (canvasWidth - radius * 2) + radius;
            y = Math.random() * (canvasHeight - radius * 2) + radius;
            
            // Проверяем перекрытие с другими фруктами
            for (const fruit of fruits) {
                const dx = fruit.x - x;
                const dy = fruit.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < fruit.radius + radius + 10) {
                    overlap = true;
                    break;
                }
            }
            
            attempts++;
        } while (overlap && attempts < 100);
        
        // Если после 100 попыток не нашли место, уменьшаем радиус
        if (overlap) {
            radius = minRadius * 0.8;
        }
        
        const color = fruitColors[i % fruitColors.length];
        fruits.push(new Fruit(x, y, radius, percent, color));
    }
}

// Установка нового задания
function setNewTask() {
    // Выбор случайного процента из доступных на фруктах
    const availablePercents = fruits.map(fruit => fruit.percent);
    currentTargetPercent = availablePercents[Math.floor(Math.random() * availablePercents.length)];
    
    // Устанавливаем текст задания
    currentTask.textContent = `Найди фрукт, который равен ${currentTargetPercent}%`;
}

// Проверка клика по фрукту
function checkFruitClick(x, y) {
    for (let i = 0; i < fruits.length; i++) {
        const fruit = fruits[i];
        const dx = fruit.x - x;
        const dy = fruit.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < fruit.radius) {
            // Если кликнули на правильный фрукт
            if (fruit.percent === currentTargetPercent) {
                score += 10 * level;
                scoreValue.textContent = score;
                
                // Удаляем фрукт из массива
                fruits.splice(i, 1);
                
                // Если фруктов не осталось, переходим на следующий уровень
                if (fruits.length === 0) {
                    levelUp();
                } else {
                    // Иначе устанавливаем новое задание
                    setNewTask();
                }
                
                return true;
            } else {
                // Если кликнули на неправильный фрукт, отнимаем очки
                score = Math.max(0, score - 5);
                scoreValue.textContent = score;
                return false;
            }
        }
    }
    return false;
}

// Переход на следующий уровень
function levelUp() {
    level++;
    levelValue.textContent = level;
    createFruits();
    setNewTask();
    
    // Показываем сообщение об уровне
    const levelMessage = `Уровень ${level}!`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#FFC300';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(levelMessage, canvasWidth / 2, canvasHeight / 2);
    
    // Задержка перед продолжением игры
    setTimeout(() => {
        animate();
    }, 1500);
}

// Анимация
function animate() {
    if (!gameActive) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Обновляем и рисуем все фрукты
    fruits.forEach(fruit => {
        fruit.update();
    });
    
    requestAnimationFrame(animate);
}

// Обработчики событий
startButton.addEventListener('click', () => {
    initGame();
});

// Обработка клика/тача по канвасу
function handleCanvasClick(e) {
    if (!gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    checkFruitClick(x, y);
}

// Добавляем обработчики событий для мыши и тача
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick);

// Обработчик изменения размера окна
window.addEventListener('resize', resizeCanvas);

// Инициализация при загрузке
window.addEventListener('load', () => {
    resizeCanvas();
    
    // Рисуем заставку
    ctx.fillStyle = '#e6f7ff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = '#4b0082';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Фруктовый Процентоград', canvasWidth / 2, canvasHeight / 2 - 40);
    
    ctx.font = '16px Arial';
    ctx.fillText('Нажми "Начать игру"', canvasWidth / 2, canvasHeight / 2 + 10);
    
    // Рисуем пример фруктов
    const exampleRadius = Math.min(canvasWidth, canvasHeight) * 0.08;
    const examples = [
        { percent: 25, x: canvasWidth / 4, y: canvasHeight * 0.7, color: fruitColors[0] },
        { percent: 50, x: canvasWidth / 2, y: canvasHeight * 0.7, color: fruitColors[1] },
        { percent: 75, x: canvasWidth * 3/4, y: canvasHeight * 0.7, color: fruitColors[2] }
    ];
    
    examples.forEach(example => {
        const fruit = new Fruit(example.x, example.y, exampleRadius, example.percent, example.color);
        fruit.draw();
    });
});