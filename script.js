// ==========================================
// 1. GLOBAL GAME STATE (Oyunun Vəziyyəti)
// ==========================================
const gameState = {
    isGameOver: false,
    isGameStarted: false,
    score: 0,
    // ÖNCƏLİKLİ REKORDU LOCALSTORAGE-DƏN OXUYURUQ (Əgər yoxdursa 0 təyin edirik)
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
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

// ==========================================
// 2. VIEW UPDATERS (Ekrana Yazdırma Funksiyaları)
// ==========================================
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

// Rekord xalı həm başlanğıc, həm də oyun bitiş ekranında yeniləyən funksiya
function updateHighScoreUI() {
    const startHighScoreEl = document.getElementById('start-high-score');
    if (startHighScoreEl) {
        startHighScoreEl.innerText = gameState.highScore;
    }
}

// ==========================================
// 3. ENEMY SPAWN & MOVEMENT LOGIC
// ==========================================
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

// ==========================================
// 4. AABB COLLISION DETECTION
// ==========================================
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

// ==========================================
// 5. GAME FLOW ARCHITECTURE (Giriş-Çıxış Mexanikası)
// ==========================================
function gameLoop() {
    if (gameState.isGameOver || !gameState.isGameStarted) return;

    spawnEnemy();
    moveEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState.isGameStarted = true;
    gameState.isGameOver = false;
    gameState.score = 0;
    gameState.speed = 4;
    gameState.enemySpawnTimer = 0;
    gameState.enemies = [];
    player.lane = 1;

    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');

    updatePlayerPosition();
    updateScoreUI();
    updateHighScoreUI();

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;

    // REKORD YOXLANIŞI VƏ LOCALSTORAGE-Ə YAZILMASI
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore); // Brauzer yaddaşına qeyd edilir
    }

    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
    updateHighScoreUI();
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
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

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Səhifə ilk dəfə yüklənəndə rekord xalı ekranda göstər
window.onload = () => {
    updatePlayerPosition();
    updateHighScoreUI();
};