// 1. GAME STATE (Oyunun Vəziyyəti)
const player = {
    lane: 1, // 0: Sol zolaq, 1: Orta zolaq, 2: Sağ zolaq
    width: 60,
    height: 100
};

// Zolaqların sol tərəfdən olan məsafələri (X koordinatları)
// Hər zolaq 100px-dir, maşın 60px olduğu üçün mərkəzə salmaq üçün bu rəqəmlər idealdır:
const lanes = [20, 120, 220];

// 2. VIEW UPDATER (Maşının ekrandakı yerini yeniləyən funksiya)
function updatePlayerPosition() {
    const playerElement = document.getElementById('player');
    playerElement.style.left = lanes[player.lane] + 'px';
}

// 3. EVENT LISTENER (Klaviaturadan gələn əmrlər)
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        if (player.lane > 0) { // Sol kənardan çıxmasın
            player.lane--;
            updatePlayerPosition();
        }
    } else if (e.key === 'ArrowRight') {
        if (player.lane < 2) { // Sağ kənardan çıxmasın
            player.lane++;
            updatePlayerPosition();
        }
    }
});

// Oyunu başladanda mövqeni ilkin olaraq sazla
updatePlayerPosition();