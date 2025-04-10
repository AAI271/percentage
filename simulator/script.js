const canvas = document.getElementById('percentCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = 250;

let percent = Math.floor(Math.random() * 91) + 5; // 5% - 95%
let animatedPercent = 0;
let animationFrame;

animatePie();
document.getElementById("question").innerText = `Какой процент закрашен?`;

function animatePie() {
  animatedPercent = 0;
  cancelAnimationFrame(animationFrame);
  function draw() {
    if (animatedPercent < percent) {
      animatedPercent += 1;
      drawPie(animatedPercent);
      animationFrame = requestAnimationFrame(draw);
    } else {
      drawPie(percent);
    }
  }
  draw();
}

function drawPie(percentValue) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Серый круг (100%)
  ctx.beginPath();
  ctx.fillStyle = '#ddd';
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Закрашенный сектор (процент)
  ctx.beginPath();
  ctx.fillStyle = '#4CAF50';
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, (Math.PI * 2 * percentValue) / 100);
  ctx.closePath();
  ctx.fill();
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function getReducedFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function checkAnswer() {
  const userAnswer = parseInt(document.getElementById("answer").value);
  const feedback = document.getElementById("feedback");
  const fraction = getReducedFraction(percent, 100);

  if (userAnswer === percent) {
    feedback.textContent = `Молодец! Правильно! 🎉 Это ${fraction}`;
    feedback.style.color = "green";
  } else {
    feedback.textContent = `Ой! Это ${percent}%. Это ${fraction}. Попробуем другой пример?`;
    feedback.style.color = "red";
  }

  // Новый вопрос через 2 секунды
  setTimeout(() => {
    percent = Math.floor(Math.random() * 91) + 5;
    document.getElementById("question").innerText = `Какой процент закрашен?`;
    document.getElementById("answer").value = "";
    feedback.textContent = "";
    animatePie();
  }, 2000);
}