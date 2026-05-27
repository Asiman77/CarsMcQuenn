// 1. GLOBAL GAME STATE
const gameState = {
    isGameOver: false,
    isGameStarted: true, // Hələlik birbaşa başlasın, start ekranını sonra bağlayacağıq
    score: 0,
    speed: 4,               // Düşmən maşınların aşağı düşmə sürəti
    enemySpawnTimer: 0,     // Yeni maşın gəlməsi üçün sayğac
    enemySpawnInterval: 100,// Hər 100 framədən bir yeni düşmən yaransın
    enemies: []             // Ekrandakı aktiv düşmən maşınların siyahısı
};

const player = {
    lane: 1, // 0: Sol, 1: Orta, 2: Sağ
    width: 60,
    height: 100,
    y: 470 // CSS-dəki 'bottom: 30px' dəyərinə uyğun gələn Y oxu koordinatı (600 - 100 - 30)
};

const lanes = [20, 120, 220];

// 2. VIEW UPDATER (Oyunçu mövqeyi)
function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    playerElement.style.left = lanes[player.lane] + 'px';
}

// 3. ENEMY SPAWN & MOVEMENT LOGIC
function spawnEnemy() {
    gameState.enemySpawnTimer++;

    // Müəyyən intervaldan bir random zolaqda düşmən yaradırıq
    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
        gameState.enemySpawnTimer = 0;

        const randomLane = Math.floor(Math.random() * 3);
        const enemyX = lanes[randomLane];
        const enemyY = -100; // Ekranın yuxarısından, görünməyən hissədən başlayır

        // HTML elementini yaradırıq
        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.style.left = enemyX + 'px';
        enemyDiv.style.top = enemyY + 'px';
        document.getElementById('road').appendChild(enemyDiv);

        // Arxitekturaya uyğun olaraq obyekt kimi array-ə əlavə edirik
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
        enemy.y += gameState.speed; // Maşını aşağı sürüşdürürük
        enemy.element.style.top = enemy.y + 'px';

        // Əgər ekrandan tamamilə çıxıbsa, silirik
        if (enemy.y > 600) {
            enemy.element.remove();
            gameState.enemies.splice(i, 1);
        }
    }
}

// 4. AABB COLLISION DETECTION (Toqquşma alqoritmi)
function checkCollisions() {
    const playerX = lanes[player.lane]; // Oyunçunun anlıq X koordinatı

    gameState.enemies.forEach(enemy => {
        if (
            playerX < enemy.x + enemy.width &&       // Oyunçunun solu düşmənin sağından solmadır
            playerX + player.width > enemy.x &&       // Oyunçunun sağı düşmənin solundan sağdadır
            player.y < enemy.y + enemy.height &&     // Oyunçunun yuxarısı düşmənin aşağısından yuxarıdadır
            player.y + player.height > enemy.y       // Oyunçunun aşağısı düşmənin yuxarısından aşağıdadır
        ) {
            endGame();
        }
    });
}

// 5. GAME LOOP ENGINE
function gameLoop() {
    if (gameState.isGameOver) return; // Oyun bitibsə dövrü dayandır

    spawnEnemy();
    moveEnemies();
    checkCollisions(); // Hər saniyə toqquşmanı yoxla

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isGameOver = true;
    alert("BOOM! Toqquşma baş verdi! Oyun Bitdi.");
}

// 6. EVENT LISTENERS
window.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) return;

    if (e.key === 'ArrowLeft' && player.lane > 0) {
        player.lane--;
        updatePlayerPosition();
    } else if (e.key === 'ArrowRight' && player.lane < 2) {
        player.lane++;
        updatePlayerPosition();
    }
});

// Oyunu başladırıq
updatePlayerPosition();
requestAnimationFrame(gameLoop);