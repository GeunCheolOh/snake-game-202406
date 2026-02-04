const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const gameOverMsg = document.getElementById('game-over');
const rankingList = document.getElementById('ranking-list');

const grid = 20;
let speed = 120; // ms
let snake, apple, score, gameLoopId, isGameOver, isStarted;
let ranking = [];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function loadRanking() {
    ranking = JSON.parse(localStorage.getItem('snake_ranking') || '[]');
    updateRankingDisplay();
}

function saveRanking() {
    localStorage.setItem('snake_ranking', JSON.stringify(ranking));
}

function updateRankingDisplay() {
    rankingList.innerHTML = '';
    ranking.slice(0, 5).forEach((s, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}등: ${s}점`;
        rankingList.appendChild(li);
    });
}

function addScoreToRanking(score) {
    ranking.push(score);
    ranking.sort((a, b) => b - a);
    if (ranking.length > 5) ranking = ranking.slice(0, 5);
    saveRanking();
    updateRankingDisplay();
}

function resetGame() {
    snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
    apple = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid };
    score = 0;
    isGameOver = false;
    isStarted = false;
    gameOverMsg.style.display = 'none';
    restartBtn.disabled = true;
    startBtn.disabled = false;
    draw(); // 게임 초기화 시 화면 갱신
}

function setSpeed(level) {
    if (level === 'easy') speed = 180;
    else if (level === 'normal') speed = 120;
    else if (level === 'hard') speed = 70;
    else if (level === 'hell') speed = 40;
}

function gameOver() {
    isGameOver = true;
    clearTimeout(gameLoopId);
    gameOverMsg.style.display = 'block';
    restartBtn.disabled = false;
    startBtn.disabled = true;
    addScoreToRanking(score);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#0f0';
    snake.cells.forEach(cell => ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1));

    // Draw apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('점수: ' + score, 10, 390);
}

function update() {
    // Move snake
    snake.x += snake.dx;
    snake.y += snake.dy;

    // 벽에 부딪히면 게임 오버
    if (
        snake.x < 0 || snake.x >= canvas.width ||
        snake.y < 0 || snake.y >= canvas.height
    ) {
        gameOver();
        return;
    }

    // Snake body update
    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) snake.cells.pop();

    // Self collision
    for (let i = 1; i < snake.cells.length; i++) {
        if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
            gameOver();
            return;
        }
    }

    // Apple collision
    if (snake.x === apple.x && snake.y === apple.y) {
        snake.maxCells++;
        score++;
        apple.x = getRandomInt(0, 20) * grid;
        apple.y = getRandomInt(0, 20) * grid;
    }
}

function loop() {
    if (isGameOver || !isStarted) return;
    update();
    draw();
    if (!isGameOver && isStarted) {
        gameLoopId = setTimeout(loop, speed);
    }
}

document.addEventListener('keydown', function(e) {
    if (!isStarted || isGameOver) return;
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid; snake.dy = 0;
    } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dy = -grid; snake.dx = 0;
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid; snake.dy = 0;
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dy = grid; snake.dx = 0;
    }
});

window.setSpeed = function(level) {
    setSpeed(level);
};

window.startGame = function() {
    if (isStarted) return;
    isStarted = true;
    isGameOver = false;
    // 반드시 시작 시 오른쪽으로 이동하도록 설정
    snake.dx = grid;
    snake.dy = 0;
    // snake.cells가 비어있으면 초기 위치 추가
    if (!snake.cells || snake.cells.length === 0) {
        snake.cells = [{ x: snake.x, y: snake.y }];
    }
    startBtn.disabled = true;
    restartBtn.disabled = true;
    loop();
};

window.restartGame = function() {
    resetGame();
};

function init() {
    loadRanking();
    setSpeed('normal');
    resetGame();
}

init();
