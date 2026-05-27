// ==========================================
// 1. GLOBAL GAME STATE & GEOGRAPHY DATA
// ==========================================
const gameState = {
    isGameOver: false,
    isGameStarted: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    speed: 4,
    enemySpawnTimer: 0,
    enemySpawnInterval: 80,
    enemies: [],
    selectedSkin: 'catalan',
    currentAnthem: null // Aktiv çalan musiqi obyekti üçün
};

const player = {
    lane: 1,
    width: 60,
    height: 100,
    y: 470
};

const skins = ['catalan', 'basque', 'spanish', 'azerbaijan'];
const lanes = [20, 120, 220];

// Ölkələrə və Regionlara xas Şəhər Mərhələləri Datası
const countryCities = {
    azerbaijan: ['Baku', 'Ganja', 'Sumqayit', 'Shusha', 'Nakhchivan'],
    catalan: ['Barcelona', 'Girona', 'Tarragona', 'Lleida'],
    basque: ['Bilbao', 'San Sebastian', 'Vitoria-Gasteiz'],
    spanish: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla']
};

// ==========================================
// 2. AUDIO ENGINE (Himn Mexanikası)
// ==========================================
function playAnthem(country) {
    if (gameState.currentAnthem) {
        gameState.currentAnthem.pause();
        gameState.currentAnthem.currentTime = 0;
    }

    // Sənin assets qovluğundakı real fayl adlarının xəritəsi (Mapping)
    let fileName = "";
    if (country === 'azerbaijan') {
        fileName = 'az.mp3';
    } else if (country === 'spanish') {
        fileName = 'es.mp3';
    } else if (country === 'basque') {
        fileName = 'eus.mp3';
    } else if (country === 'catalan') {
        fileName = 'Els-Segadors-Himne-Nacional-de-Catalunya.mp3';
    }

    // Dynamic URL tam olaraq sənin qovluqdakı ada bağlanır
    gameState.currentAnthem = new Audio(`assets/${fileName}`);
    gameState.currentAnthem.loop = true;
    gameState.currentAnthem.volume = 0.4; // 40% səs dərəcəsi

    // Brauzerə ifa əmrini göndəririk
    gameState.currentAnthem.play().catch(err => {
        console.log("Brauzer təhlükəsizlik səbəbindən klik gözləyir:", err);
    });
}

function stopAnthem() {
    if (gameState.currentAnthem) {
        gameState.currentAnthem.pause();
    }
}

// ==========================================
// 3. SELECTION & UI LOGIC
// ==========================================
document.querySelectorAll('.car-option').forEach(option => {
    option.addEventListener('click', (e) => {
        document.querySelectorAll('.car-option').forEach(opt => opt.classList.remove('selected'));
        const currentOption = e.currentTarget;
        currentOption.classList.add('selected');
        gameState.selectedSkin = currentOption.dataset.region;
    });
});

function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    if (playerElement) {
        playerElement.style.left = lanes[player.lane] + 'px';
        playerElement.className = 'car';
        playerElement.classList.add(gameState.selectedSkin + '-skin');
    }
}

// Coğrafi mövqeni (Şəhəri) xala görə hesablayıb ekrana yazdıran funksiya
function updateGeographyUI() {
    const cityElement = document.getElementById('current-city');
    if (cityElement) {
        const cities = countryCities[gameState.selectedSkin];
        // Hər 30 xaldan bir şəhər dəyişsin. Əgər şəhər bitərsə sonuncu şəhərdə qalsın.
        const cityIndex = Math.min(Math.floor(gameState.score / 30), cities.length - 1);
        cityElement.innerText = cities[cityIndex];
    }
}

function updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = gameState.score;
    updateGeographyUI(); // Xal hər dəyişəndə şəhəri də yoxla
}

function updateHighScoreUI() {
    const startHighScoreEl = document.getElementById('start-high-score');
    if (startHighScoreEl) startHighScoreEl.innerText = gameState.highScore;
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

        const availableSkins = skins.filter(s => s !== gameState.selectedSkin);
        const randomEnemySkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];

        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.classList.add(randomEnemySkin + '-skin');
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
// 5. COLLISION & GAME FLOW
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

    // SEÇİLMİŞ ÖLKƏNİN HİMNİNİ ÇALIRIQ 🎵
    playAnthem(gameState.selectedSkin);

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;

    // Uduzanda himni dayandırırıq 🔇
    stopAnthem();

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }

    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
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

window.onload = () => {
    updatePlayerPosition();
    updateHighScoreUI();
};