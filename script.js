// Oyun durumu
let gameState = {
    playerPosition: { x: 0, y: 0 },
    batteryCount: 3,
    trashCount: 0,
    batteries: [],
    trashItems: [],
    gridSize: 5
};

// Grid oluşturma
function createGrid() {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
    
    // Rastgele pil ve çöp konumları oluştur
    generateRandomItems();

    for (let y = 0; y < gameState.gridSize; y++) {
        for (let x = 0; x < gameState.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Oyuncu pozisyonu
            if (x === gameState.playerPosition.x && y === gameState.playerPosition.y) {
                cell.innerHTML = '🚗';
                cell.classList.add('player');
            }
            
            // Pil pozisyonları
            if (isBatteryAt(x, y)) {
                cell.innerHTML = '🔋';
                cell.classList.add('battery');
            }
            
            // Çöp pozisyonları
            if (isTrashAt(x, y)) {
                cell.innerHTML = '🗑️';
                cell.classList.add('trash');
            }
            
            grid.appendChild(cell);
        }
    }
    updateCounters();
}

// Rastgele pil ve çöp konumları oluştur
function generateRandomItems() {
    gameState.batteries = [];
    gameState.trashItems = [];
    
    // 3 pil ekle
    while (gameState.batteries.length < 3) {
        const position = getRandomPosition();
        if (!isPositionOccupied(position) && !isPlayerAt(position.x, position.y)) {
            gameState.batteries.push(position);
        }
    }
    
    // 3 çöp ekle
    while (gameState.trashItems.length < 3) {
        const position = getRandomPosition();
        if (!isPositionOccupied(position) && !isPlayerAt(position.x, position.y)) {
            gameState.trashItems.push(position);
        }
    }
}

// Rastgele pozisyon oluştur
function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * gameState.gridSize),
        y: Math.floor(Math.random() * gameState.gridSize)
    };
}

// Pozisyon kontrolleri
function isPositionOccupied(pos) {
    return isBatteryAt(pos.x, pos.y) || isTrashAt(pos.x, pos.y);
}

function isBatteryAt(x, y) {
    return gameState.batteries.some(battery => battery.x === x && battery.y === y);
}

function isTrashAt(x, y) {
    return gameState.trashItems.some(trash => trash.x === x && trash.y === y);
}

function isPlayerAt(x, y) {
    return gameState.playerPosition.x === x && gameState.playerPosition.y === y;
}

// Hareket fonksiyonu
function move(direction) {
    if (gameState.batteryCount <= 0) {
        alert('Pil bitti! Oyunu kaybettiniz.');
        resetGame();
        return;
    }

    const newPosition = { ...gameState.playerPosition };
    
    switch (direction) {
        case 'up':
            if (newPosition.y > 0) newPosition.y--;
            break;
        case 'down':
            if (newPosition.y < gameState.gridSize - 1) newPosition.y++;
            break;
        case 'left':
            if (newPosition.x > 0) newPosition.x--;
            break;
        case 'right':
            if (newPosition.x < gameState.gridSize - 1) newPosition.x++;
            break;
    }

    // Hareket gerçekleştiyse
    if (newPosition.x !== gameState.playerPosition.x || newPosition.y !== gameState.playerPosition.y) {
        gameState.batteryCount--;
        
        // Pil toplama
        const batteryIndex = gameState.batteries.findIndex(
            battery => battery.x === newPosition.x && battery.y === newPosition.y
        );
        if (batteryIndex !== -1) {
            gameState.batteryCount++;
            gameState.batteries.splice(batteryIndex, 1);
        }
        
        // Çöp toplama
        const trashIndex = gameState.trashItems.findIndex(
            trash => trash.x === newPosition.x && trash.y === newPosition.y
        );
        if (trashIndex !== -1) {
            gameState.trashCount++;
            gameState.trashItems.splice(trashIndex, 1);
        }
        
        gameState.playerPosition = newPosition;
        createGrid();
        
        // Oyunu kazanma kontrolü
        if (gameState.trashItems.length === 0) {
            alert('Tebrikler! Tüm çöpleri topladınız ve oyunu kazandınız!');
            resetGame();
        }
    }
}

// Sayaçları güncelle
function updateCounters() {
    document.getElementById('battery-count').textContent = gameState.batteryCount;
    document.getElementById('trash-count').textContent = gameState.trashCount;
}

// Oyunu sıfırla
function resetGame() {
    gameState = {
        playerPosition: { x: 0, y: 0 },
        batteryCount: 3,
        trashCount: 0,
        batteries: [],
        trashItems: [],
        gridSize: 5
    };
    createGrid();
}

// Oyunu başlat
createGrid(); 