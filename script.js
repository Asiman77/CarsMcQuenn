// 1. GLOBAL GAME STATE
const gameState = {
    isGameOver: false,
    isGameStarted: false, // Oyun dərhal başlamır, Start düyməsini gözləyir
    score: 0,
    speed: 4,
    enemySpawnTimer: 0,
    enemySpawnInterval: 80,
    enemies: []
};

const player = {
    lane: 1,
    width: 60,
    height: 100,
    y: 470
};

const lanes = [20, 120, 220];

// 2. VIEW UPDATERS
function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    if (playerElement) {
        playerElement.style.left = lanes[player.lane] + 'px';
    }
}

function updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = gameState.score;
}

// 3. ENEMY SPAWN & MOVEMENT LOGIC
function spawnEnemy() {
    gameState.enemySpawnTimer++;

    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        gameState.enemySpawnTimer = 0;

        const randomLane = Math.floor(Math.random() * 3);
        const enemyX = lanes[randomLane];
        const enemyY = -100;

        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.style.left = enemyX + 'px';
        enemyDiv.style.top = enemyY + 'px';
        document.getElementById('road').appendChild(enemyDiv);

        gameState.enemies.push({
            x: enemyX,
            y: enemyY,
            width: 60,
            height: 100,
            element: enemyDiv
        });
    }
}

function moveEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        let enemy = gameState.enemies[i];
        enemy.y += gameState.speed;
        enemy.element.style.top = enemy.y + 'px';

        if (enemy.y > 600) {
            enemy.element.remove();
            gameState.enemies.splice(i, 1);

            gameState.score += 10;
            updateScoreUI();

            if (gameState.score % 50 === 0) {
                gameState.speed += 0.5;
            }
        }
    }
}

// 4. AABB COLLISION DETECTION
function checkCollisions() {
    const playerX = lanes[player.lane];

    gameState.enemies.forEach(enemy => {
        if (
            playerX < enemy.x + enemy.width &&
            playerX + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            endGame();
        }
    });
}

// 5. GAME FLOW ARCHITECTURE (Start, Loop, End, Restart)
function gameLoop() {
    if (gameState.isGameOver || !gameState.isGameStarted) return;

    spawnEnemy();
    moveEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    // State sıfırlanır (Restart sistemi üçün əsas şərt)
    gameState.isGameStarted = true;
    gameState.isGameOver = false;
    gameState.score = 0;
    gameState.speed = 4;
    gameState.enemySpawnTimer = 0;
    gameState.enemies = [];
    player.lane = 1; // Ortadan başlasın

    // Ekrandakı köhnə düşmən maşınlarını təmizləyirik
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());

    // UI yenilənir və ekranlar gizlədilir
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');

    updatePlayerPosition();
    updateScoreUI();

    // Oyun dövrü işə düşür
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;

    // Game Over ekranını açırıq və yekun xalı yazırıq
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
}

// 6. EVENT LISTENERS
window.addEventListener('keydown', (e) => {
    if (gameState.isGameOver || !gameState.isGameStarted) return;

    if (e.key === 'ArrowLeft' && player.lane > 0) {
        player.lane--;
        updatePlayerPosition();
    } else if (e.key === 'ArrowRight' && player.lane < 2) {
        player.lane++;
        updatePlayerPosition();
    }
});

// Düymələrin funksiyalarla bağlanması
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Səhifə ilk açılanda oyunçunu ortala
updatePlayerPosition();