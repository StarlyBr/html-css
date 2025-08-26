const square = document.getElementById('square');
const scoreDisplay = document.getElementById('score');
let score = 0;

function moveSquare() {
    const maxX = 350; // 400 (area) - 50 (square)
    const maxY = 350;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    square.style.left = randomX + 'px';
    square.style.top = randomY + 'px';
}

square.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    moveSquare();
});

// Movimento inicial
moveSquare();
