// ==========================================
// 1. GLOBAL STATE & CULTURAL GEOGRAPHY DATA
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
    currentAnthem: null
};

const player = { lane: 1, width: 60, height: 100, y: 470 };
const skins = ['catalan', 'basque', 'spanish', 'azerbaijan'];
const lanes = [20, 120, 220];

// Hər şəhərin özünəməxsus abidəsi və simvolu (DOM-a basılacaq)
const geographyData = {
    azerbaijan: {
        name: "Azerbaijan",
        cities: [
            { city: "Baku", icon: "🗼", landmark: "Maiden Tower" },
            { city: "Ganja", icon: "🏛️", landmark: "Nizami Mausoleum" },
            { city: "Sumqayit", icon: "🕊️", landmark: "Dove Monument" },
            { city: "Shusha", icon: "🏰", landmark: "Shusha Fortress" },
            { city: "Nakhchivan", icon: "🕌", landmark: "Momine Khatun" }
        ]
    },
    catalan: {
        name: "Catalonia",
        cities: [
            { city: "Barcelona", icon: "⛪", landmark: "Sagrada Família" },
            { city: "Girona", icon: "🧳", landmark: "Onyar River Houses" },
            { city: "Tarragona", icon: "🏛️", landmark: "Roman Amphitheatre" },
            { city: "Lleida", icon: "🏰", landmark: "La Seu Vella" }
        ]
    },
    basque: {
        name: "Basque Country",
        cities: [
            { city: "Bilbao", icon: "🖼️", landmark: "Guggenheim Museum" },
            { city: "San Sebastian", icon: "🏖️", landmark: "La Concha Beach" },
            { city: "Vitoria-Gasteiz", icon: "⛪", landmark: "Santa Maria Cathedral" }
        ]
    },
    spanish: {
        name: "Spain",
        cities: [
            { city: "Madrid", icon: "👑", landmark: "Royal Palace" },
            { city: "Valencia", icon: "🧬", landmark: "City of Arts & Sciences" },
            { city: "Sevilla", icon: "💃", landmark: "Plaza de España" }
        ]
    }
};

// ==========================================
// 2. AUDIO ENGINE
// ==========================================
function playAnthem(country) {
    if (gameState.currentAnthem) {
        gameState.currentAnthem.pause();
        gameState.currentAnthem.currentTime = 0;
    }

    let fileName = "";
    if (country === 'azerbaijan') fileName = 'az.mp3';
    else if (country === 'spanish') fileName = 'es.mp3';
    else if (country === 'basque') fileName = 'eus.mp3';
    else if (country === 'catalan') fileName = 'Els-Segadors-Himne-Nacional-de-Catalunya.mp3';

    gameState.currentAnthem = new Audio(`assets/${fileName}`);
    gameState.currentAnthem.loop = true;
    gameState.currentAnthem.volume = 0.4;
    gameState.currentAnthem.play().catch(err => console.log("Audio waiting for gesture"));
}

function stopAnthem() {
    if (gameState.currentAnthem) gameState.currentAnthem.pause();
}

// ==========================================
// 3. RETRO SIDEBAR & INTERFACE RENDERING
// ==========================================
function updateGeographyUI() {
    const currentData = geographyData[gameState.selectedSkin];

    // Hər 30 xaldan bir yeni şəhərə/abidəyə keçid
    const cityIndex = Math.min(Math.floor(gameState.score / 30), currentData.cities.length - 1);
    const activeLocation = currentData.cities[cityIndex];

    // Sol və Sağ Panellərdəki DOM düyünlərini doldururuq
    document.getElementById('side-country').innerText = currentData.name;
    document.getElementById('side-city').innerText = activeLocation.city;
    document.getElementById('monument-emoji').innerText = activeLocation.icon;
    document.getElementById('monument-name').innerText = activeLocation.landmark;

    // Sol paneldəki mini bayrağın CSS-ni yeniləyirik
    const flagEl = document.getElementById('side-flag');
    if (flagEl) {
        flagEl.className = "flag-display " + gameState.selectedSkin + "-skin";
    }
}

function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    const viewportElement = document.getElementById('main-viewport');

    if (playerElement) {
        playerElement.style.left = lanes[player.lane] + 'px';
        playerElement.className = 'car ' + gameState.selectedSkin + '-skin';
    }

    if (viewportElement) {
        skins.forEach(s => viewportElement.classList.remove(`bg-${s}`));
        viewportElement.classList.add(`bg-${gameState.selectedSkin}`);
    }
    updateGeographyUI();
}

function updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = gameState.score;
    updateGeographyUI();
}

// Menyuda seçim dəyişəndə həm maşın, həm də yan panellər anında rənglənir
document.querySelectorAll('.car-option').forEach(option => {
    option.addEventListener('click', (e) => {
        document.querySelectorAll('.car-option').forEach(opt => opt.classList.remove('selected'));
        const currentOption = e.currentTarget;
        currentOption.classList.add('selected');
        gameState.selectedSkin = currentOption.dataset.region;
        updatePlayerPosition();
    });
});

// ==========================================
// 4. ENGINE CORE & LOGICS (Spawn, Move, Collision)
// ==========================================
function spawnEnemy() {
    gameState.enemySpawnTimer++;
    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        gameState.enemySpawnTimer = 0;

        const randomLane = Math.floor(Math.random() * 3);
        const enemyX = lanes[randomLane];

        const availableSkins = skins.filter(s => s !== gameState.selectedSkin);
        const randomEnemySkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];

        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy', randomEnemySkin + '-skin');
        enemyDiv.style.left = enemyX + 'px';
        enemyDiv.style.top = '-100px';
        document.getElementById('road').appendChild(enemyDiv);

        gameState.enemies.push({ x: enemyX, y: -100, width: 60, height: 100, element: enemyDiv });
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

            if (gameState.score % 50 === 0) gameState.speed += 0.4;
        }
    }
}

function checkCollisions() {
    const playerX = lanes[player.lane];
    gameState.enemies.forEach(enemy => {
        if (playerX < enemy.x + enemy.width && playerX + player.width > enemy.x && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
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

// ==========================================
// 5. CONTROL FLOW
// ==========================================
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
    playAnthem(gameState.selectedSkin);

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;
    stopAnthem();

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
}

window.addEventListener('keydown', (e) => {
    if (gameState.isGameOver || !gameState.isGameStarted) return;
    if (e.key === 'ArrowLeft' && player.lane > 0) { player.lane--; updatePlayerPosition(); }
    if (e.key === 'ArrowRight' && player.lane < 2) { player.lane++; updatePlayerPosition(); }
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

window.onload = () => {
    const startHighScoreEl = document.getElementById('start-high-score');
    if (startHighScoreEl) startHighScoreEl.innerText = gameState.highScore;
    updatePlayerPosition();
};