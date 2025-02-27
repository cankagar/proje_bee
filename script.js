// Oyun durumu
let initialGameState = null;
let gameState = {
    playerPosition: { x: 0, y: 0 },
    batteryCount: 3,
    trashCount: 0,
    batteries: [],
    trashItems: [],
    gridSize: 5
};

// Hareket geçmişi
let moveHistory = [];
let isPlaying = false;
let currentPlacementMode = null; // 'player', 'battery', 'trash', veya null

// Hareket sembolleri
const moveSymbols = {
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→'
};

// Grid oluşturma
function createGrid() {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
    
    for (let y = 0; y < gameState.gridSize; y++) {
        for (let x = 0; x < gameState.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
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

            // Hücreye tıklama olayı ekle
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            grid.appendChild(cell);
        }
    }
    updateCounters();
}

// Hücre tıklama işleyicisi
function handleCellClick(x, y) {
    if (isPlaying) return;

    const position = { x, y };
    
    switch (currentPlacementMode) {
        case 'player':
            if (!isPositionOccupied(position)) {
                gameState.playerPosition = position;
            }
            break;
        case 'battery':
            if (!isPlayerAt(x, y)) {
                const batteryIndex = gameState.batteries.findIndex(b => b.x === x && b.y === y);
                if (batteryIndex === -1) {
                    gameState.batteries.push(position);
                } else {
                    gameState.batteries.splice(batteryIndex, 1);
                }
            }
            break;
        case 'trash':
            if (!isPlayerAt(x, y)) {
                const trashIndex = gameState.trashItems.findIndex(t => t.x === x && t.y === y);
                if (trashIndex === -1) {
                    gameState.trashItems.push(position);
                } else {
                    gameState.trashItems.splice(trashIndex, 1);
                }
            }
            break;
    }
    
    createGrid();
}

// Yerleştirme modunu değiştir
function setPlacementMode(mode) {
    if (isPlaying) return;
    currentPlacementMode = currentPlacementMode === mode ? null : mode;
    updatePlacementButtons();
}

// Yerleştirme butonlarının durumunu güncelle
function updatePlacementButtons() {
    document.querySelectorAll('.placement-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === currentPlacementMode) {
            btn.classList.add('active');
        }
    });
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
        return false;
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
            gameState.batteryCount += 3; // Pil toplandığında +3 hak
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
            return false;
        }
        return true;
    }
    return false;
}

// Hareket planlama fonksiyonları
function addMove(direction) {
    if (isPlaying) return;
    moveHistory.push(direction);
    updateMovesList();
}

function undoLastMove() {
    if (isPlaying || moveHistory.length === 0) return;
    moveHistory.pop();
    updateMovesList();
}

// Hareket listesini güncelle
function updateMovesList() {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = '';
    
    moveHistory.forEach((direction, index) => {
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        moveItem.textContent = `${index + 1}. ${moveSymbols[direction]}`;
        movesList.appendChild(moveItem);
    });
    
    movesList.scrollTop = movesList.scrollHeight;
}

// Kaydedilen hareketleri oynat
async function playRecordedMoves() {
    if (isPlaying || moveHistory.length === 0) return;
    
    isPlaying = true;
    // Oyunu başlangıç durumuna getir
    gameState = JSON.parse(JSON.stringify(initialGameState));
    createGrid();
    
    for (const direction of moveHistory) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Her hareket arası 500ms bekle
        if (!move(direction)) {
            break; // Eğer hareket başarısız olursa veya oyun bittiyse döngüyü kır
        }
    }
    
    isPlaying = false;
}

// Sayaçları güncelle
function updateCounters() {
    document.getElementById('battery-count').textContent = gameState.batteryCount;
    document.getElementById('trash-count').textContent = gameState.trashCount;
}

// Oyunu sıfırla
function resetGame() {
    initialGameState = null;
    moveHistory = [];
    isPlaying = false;
    currentPlacementMode = null;
    document.getElementById('moves-list').innerHTML = '';
    gameState = {
        playerPosition: { x: 0, y: 0 },
        batteryCount: 3,
        trashCount: 0,
        batteries: [],
        trashItems: [],
        gridSize: 5
    };
    createGrid();
    updatePlacementButtons();
}

// Oyunu başlat
function startGame() {
    if (moveHistory.length === 0) {
        alert('Önce hareketleri planlamalısınız!');
        return;
    }
    
    if (gameState.batteries.length === 0) {
        alert('Haritaya en az bir pil yerleştirmelisiniz!');
        return;
    }
    
    if (gameState.trashItems.length === 0) {
        alert('Haritaya en az bir çöp yerleştirmelisiniz!');
        return;
    }
    
    initialGameState = JSON.parse(JSON.stringify(gameState));
    playRecordedMoves();
}

// Oyunu başlat
createGrid(); 