// ==========================================
// 1. GLOBAL GAME STATE (Oyunun Vəziyyəti)
// ==========================================
const gameState = {
    isGameOver: false,
    isGameStarted: false,
    score: 0,
    // Rekord xalı localyaddaşdan oxuyuruq
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    speed: 4,
    enemySpawnTimer: 0,
    enemySpawnInterval: 80,
    enemies: [],
    selectedSkin: 'catalan' // İlkin default seçim (Excalidraw sketch-inə uyğun)
};

const player = {
    lane: 1, // 0: Sol, 1: Orta, 2: Sağ
    width: 60,
    height: 100,
    y: 470
};

// Mövcud maşın dizayn növləri (Skin-lər)
const skins = ['catalan', 'basque', 'spanish'];
const lanes = [20, 120, 220];

// ==========================================
// 2. SKIN SELECTION INTERFACE LOGIC
// ==========================================
// Start ekranındakı maşın seçimi düymələrini qulaqlayırıq
document.querySelectorAll('.car-option').forEach(option => {
    option.addEventListener('click', (e) => {
        // Əvvəlki seçilmiş vizualı təmizləyirik
        document.querySelectorAll('.car-option').forEach(opt => opt.classList.remove('selected'));

        // Kliklənən yeni seçimi aktiv edirik
        const currentOption = e.currentTarget;
        currentOption.classList.add('selected');

        // State-i yeniləyirik
        gameState.selectedSkin = currentOption.dataset.region;
    });
});

// ==========================================
// 3. VIEW UPDATERS (Ekrana Yazdırma Funksiyaları)
// ==========================================
function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    if (playerElement) {
        playerElement.style.left = lanes[player.lane] + 'px';

        // Dinamik olaraq oyunçunun seçdiyi CSS skin sinfini tətbiq edirik
        playerElement.className = 'car';
        playerElement.classList.add(gameState.selectedSkin + '-skin');
    }
}

function updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = gameState.score;
}

function updateHighScoreUI() {
    const startHighScoreEl = document.getElementById('start-high-score');
    if (startHighScoreEl) {
        startHighScoreEl.innerText = gameState.highScore;
    }
}

// ==========================================
// 4. ENEMY SPAWN & MOVEMENT LOGIC
// ==========================================
function spawnEnemy() {
    gameState.enemySpawnTimer++;

    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        gameState.enemySpawnTimer = 0;

        const randomLane = Math.floor(Math.random() * 3);
        const enemyX = lanes[randomLane];
        const enemyY = -100;

        // MƏNTİQ: Oyunçunun seçmədiyi digər skinləri düşmən maşınlarına random paylayırıq
        const availableSkins = skins.filter(s => s !== gameState.selectedSkin);
        const randomEnemySkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];

        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.classList.add(randomEnemySkin + '-skin'); // Düşmənə fərqli skin verilir
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

        // Maşın ekrandan çıxanda xal qazanılır
        if (enemy.y > 600) {
            enemy.element.remove();
            gameState.enemies.splice(i, 1);

            gameState.score += 10;
            updateScoreUI();

            // Çətinlik artımı
            if (gameState.score % 50 === 0) {
                gameState.speed += 0.5;
            }
        }
    }
}

// ==========================================
// 5. AABB COLLISION DETECTION (Toqquşma Mexanikası)
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
// 6. GAME FLOW ARCHITECTURE (Oyun Axını)
// ==========================================
function gameLoop() {
    if (gameState.isGameOver || !gameState.isGameStarted) return;

    spawnEnemy();
    moveEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    // Arxitekturaya uyğun olaraq bütün State sıfırlanır
    gameState.isGameStarted = true;
    gameState.isGameOver = false;
    gameState.score = 0;
    gameState.speed = 4;
    gameState.enemySpawnTimer = 0;
    gameState.enemies = [];
    player.lane = 1; // Həmişə orta zolaqdan başlasın

    // Köhnə oyundan qalan düşmənləri DOM-dan tam təmizləyirik
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());

    // Overlay ekranlarını gizlədirik
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');

    // UI elementlərini vizual olaraq yeniləyirik
    updatePlayerPosition();
    updateScoreUI();
    updateHighScoreUI();

    // Oyun dövrü rəsmi olaraq tetiklənir
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;

    // Mövcud xal rekorddan böyükdürsə, localStorage-ə qeyd edirik
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }

    // Game over overlay-ini aktivləşdiririk
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
}

// ==========================================
// 7. EVENT LISTENERS (Giriş İdarəetməsi)
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

// Düymələrin funksiyalarla bağlanması (DOM Binding)
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Səhifə ilk dəfə render olunanda ilkin vəziyyəti qur
window.onload = () => {
    updatePlayerPosition();
    updateHighScoreUI();
};