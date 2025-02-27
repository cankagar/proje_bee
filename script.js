// Oyun durumu
let initialGameState = null;
let currentLevel = 1;
let maxLevel = 10;

const levels = {
    1: {
        name: "Kolay Seviye - Öğrenme",
        description: "İlk görevin çok kolay! Sadece 1 çöp ve 1 pil var. Haydi başlayalım!",
        player: { x: 2, y: 2 },  // Oyuncu tam ortada başlasın
        batteries: [
            { x: 1, y: 2 }  // Oyuncuya yakın bir pil
        ],
        trashItems: [
            { x: 3, y: 2 }  // Pilin diğer tarafında bir çöp
        ]
    },
    2: {
        name: "Kolay Seviye - Alıştırma",
        description: "Harika gidiyorsun! Şimdi 2 çöp ve 1 pil var. Sen yapabilirsin!",
        player: { x: 2, y: 2 },  // Yine ortada başlasın
        batteries: [
            { x: 1, y: 1 }  // Köşeye yakın bir pil
        ],
        trashItems: [
            { x: 3, y: 1 },  // Pilin karşısında bir çöp
            { x: 2, y: 3 }   // Aşağıda bir çöp
        ]
    },
    3: {
        name: "Orta Seviye - Başlangıç",
        description: "Biraz daha zorlaşıyor! 3 çöp ve 1 pil var.",
        player: { x: 2, y: 2 },
        batteries: [
            { x: 0, y: 0 }
        ],
        trashItems: [
            { x: 4, y: 0 },
            { x: 1, y: 2 },
            { x: 3, y: 2 }
        ]
    },
    4: {
        name: "Orta Seviye - Çapraz Hareket",
        description: "Çapraz hareketleri kullanman gereken bir seviye! 3 çöp ve 2 pil var.",
        player: { x: 0, y: 0 },
        batteries: [
            { x: 4, y: 0 },
            { x: 0, y: 4 }
        ],
        trashItems: [
            { x: 2, y: 2 },
            { x: 4, y: 4 },
            { x: 1, y: 3 }
        ]
    },
    5: {
        name: "Orta Seviye - Strateji",
        description: "Pilleri akıllıca kullanmalısın! 4 çöp ve 2 pil var.",
        player: { x: 2, y: 0 },
        batteries: [
            { x: 0, y: 2 },
            { x: 4, y: 2 }
        ],
        trashItems: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 3 },
            { x: 3, y: 3 }
        ]
    },
    6: {
        name: "Zor Seviye - Planlama",
        description: "İyi bir planlama yapmalısın! 4 çöp ve 2 pil var, ama konumları zorlu.",
        player: { x: 0, y: 0 },
        batteries: [
            { x: 4, y: 0 },
            { x: 0, y: 4 }
        ],
        trashItems: [
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 2, y: 3 }
        ]
    },
    7: {
        name: "Zor Seviye - Labirent",
        description: "Bu seviyede çöpler labirent gibi dizilmiş! 5 çöp ve 2 pil var.",
        player: { x: 2, y: 0 },
        batteries: [
            { x: 0, y: 2 },
            { x: 4, y: 2 }
        ],
        trashItems: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 3 }
        ]
    },
    8: {
        name: "Uzman Seviye - Verimlilik",
        description: "Her hareketi dikkatli planla! 5 çöp ve 2 pil, minimum hareketle toplamalısın.",
        player: { x: 0, y: 0 },
        batteries: [
            { x: 2, y: 2 },
            { x: 4, y: 4 }
        ],
        trashItems: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    9: {
        name: "Uzman Seviye - Maksimum Zorluk",
        description: "En zor seviyelerden biri! 6 çöp ve 2 pil var.",
        player: { x: 2, y: 2 },
        batteries: [
            { x: 0, y: 0 },
            { x: 4, y: 4 }
        ],
        trashItems: [
            { x: 0, y: 4 },
            { x: 4, y: 0 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
            { x: 1, y: 3 },
            { x: 3, y: 1 }
        ]
    },
    10: {
        name: "Final Seviye - Ustalaşma",
        description: "Final seviyesi! 6 çöp ve 2 pil. Tüm öğrendiklerini kullanma zamanı!",
        player: { x: 0, y: 0 },
        batteries: [
            { x: 4, y: 0 },
            { x: 0, y: 4 }
        ],
        trashItems: [
            { x: 2, y: 0 },
            { x: 4, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 3 }
        ]
    }
};

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

// Hareket sembolleri
const moveSymbols = {
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'upLeft': '↖',
    'upRight': '↗',
    'downLeft': '↙',
    'downRight': '↘'
};

// Grid oluşturma
function createGrid() {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
    
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

// Seviyeyi yükle
function loadLevel(levelNumber) {
    const level = levels[levelNumber];
    if (!level) return;

    gameState = {
        playerPosition: { ...level.player },
        batteryCount: 3,
        trashCount: 0,
        batteries: [...level.batteries],
        trashItems: [...level.trashItems],
        gridSize: 5
    };

    // Seviye bilgisini göster
    showLevelInfo(level);
    moveHistory = [];
    document.getElementById('moves-list').innerHTML = '';
    createGrid();
}

// Seviye bilgisini göster
function showLevelInfo(level) {
    const container = document.querySelector('.container');
    const existingInfo = container.querySelector('.level-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    const levelInfo = document.createElement('div');
    levelInfo.className = 'level-info';
    levelInfo.innerHTML = `
        <h2>Seviye ${currentLevel}: ${level.name}</h2>
        <p>${level.description}</p>
    `;

    container.insertBefore(levelInfo, container.querySelector('.game-info'));
}

// Pozisyon kontrolleri
function isBatteryAt(x, y) {
    return gameState.batteries.some(battery => battery.x === x && battery.y === y);
}

function isTrashAt(x, y) {
    return gameState.trashItems.some(trash => trash.x === x && trash.y === y);
}

// Hareket fonksiyonu
function move(direction) {
    if (gameState.batteryCount <= 0) {
        alert('Pil bitti! Seviyeyi tekrar deneyin.');
        loadLevel(currentLevel);
        return false;
    }

    const newPosition = { ...gameState.playerPosition };
    let isValidMove = true;
    
    switch (direction) {
        case 'up':
            if (newPosition.y > 0) newPosition.y--;
            else isValidMove = false;
            break;
        case 'down':
            if (newPosition.y < gameState.gridSize - 1) newPosition.y++;
            else isValidMove = false;
            break;
        case 'left':
            if (newPosition.x > 0) newPosition.x--;
            else isValidMove = false;
            break;
        case 'right':
            if (newPosition.x < gameState.gridSize - 1) newPosition.x++;
            else isValidMove = false;
            break;
        case 'upLeft':
            if (newPosition.y > 0 && newPosition.x > 0) {
                newPosition.y--;
                newPosition.x--;
            } else isValidMove = false;
            break;
        case 'upRight':
            if (newPosition.y > 0 && newPosition.x < gameState.gridSize - 1) {
                newPosition.y--;
                newPosition.x++;
            } else isValidMove = false;
            break;
        case 'downLeft':
            if (newPosition.y < gameState.gridSize - 1 && newPosition.x > 0) {
                newPosition.y++;
                newPosition.x--;
            } else isValidMove = false;
            break;
        case 'downRight':
            if (newPosition.y < gameState.gridSize - 1 && newPosition.x < gameState.gridSize - 1) {
                newPosition.y++;
                newPosition.x++;
            } else isValidMove = false;
            break;
    }

    if (!isValidMove) {
        alert('Alanın dışına çıktınız! Seviyeyi tekrar deneyin.');
        loadLevel(currentLevel);
        return false;
    }

    if (newPosition.x !== gameState.playerPosition.x || newPosition.y !== gameState.playerPosition.y) {
        gameState.batteryCount--;
        
        const batteryIndex = gameState.batteries.findIndex(
            battery => battery.x === newPosition.x && battery.y === newPosition.y
        );
        if (batteryIndex !== -1) {
            gameState.batteryCount += 3;
            gameState.batteries.splice(batteryIndex, 1);
        }
        
        const trashIndex = gameState.trashItems.findIndex(
            trash => trash.x === newPosition.x && trash.y === newPosition.y
        );
        if (trashIndex !== -1) {
            gameState.trashCount++;
            gameState.trashItems.splice(trashIndex, 1);
            
            if (gameState.trashItems.length === 0) {
                checkWin();
            }
        }
        
        gameState.playerPosition = newPosition;
        createGrid();
        return true;
    }
    return false;
}

// Oyunu kazanma kontrolü
function checkWin() {
    if (gameState.trashItems.length === 0) {
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
    // Hareket butonlarını devre dışı bırak
    disableMovementControls(true);
    
    // Oyunu başlangıç durumuna getir
    gameState = JSON.parse(JSON.stringify(initialGameState));
    createGrid();
    
    let allTrashCollected = false;
    
    for (const direction of moveHistory) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!move(direction)) {
            // Hareket başarısız olursa veya pil bittiyse
            handleLevelFailure();
            return;
        }
        // Her hareket sonrası kazanma durumunu kontrol et
        if (checkWin()) {
            allTrashCollected = true;
        }
    }
    
    // Tüm hareketler tamamlandıktan sonra başarı kontrolü
    if (allTrashCollected) {
        setTimeout(() => {
            const message = currentLevel === maxLevel ? 
                'Tebrikler! Tüm seviyeleri tamamladınız! 🎉' :
                `Tebrikler! ${currentLevel}. seviyeyi tamamladınız! Bir sonraki seviyeye geçiliyor...`;
            
            alert(message);
            
            if (currentLevel < maxLevel) {
                currentLevel++;
                loadLevel(currentLevel);
            } else {
                resetGame();
            }
        }, 500);
    } else {
        handleLevelFailure();
    }
    
    isPlaying = false;
    disableMovementControls(false);
}

// Hareket kontrollerini etkinleştir/devre dışı bırak
function disableMovementControls(disable) {
    const planButtons = document.querySelectorAll('.plan-btn');
    const undoButton = document.querySelector('.undo-btn');
    
    planButtons.forEach(button => {
        button.disabled = disable;
        if (disable) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
    
    if (undoButton) {
        undoButton.disabled = disable;
        undoButton.style.opacity = disable ? '0.5' : '1';
        undoButton.style.cursor = disable ? 'not-allowed' : 'pointer';
    }
}

// Seviye başarısız olduğunda
function handleLevelFailure() {
    setTimeout(() => {
        alert('Seviyeyi tamamlayamadınız! Tekrar deneyin.');
        isPlaying = false;
        loadLevel(currentLevel); // Mevcut seviyeyi yeniden başlat
        disableMovementControls(false);
    }, 500);
}

// Sayaçları güncelle
function updateCounters() {
    document.getElementById('battery-count').textContent = gameState.batteryCount;
    document.getElementById('trash-count').textContent = gameState.trashCount;
}

// Oyunu sıfırla
function resetGame() {
    currentLevel = 1;
    loadLevel(currentLevel);
}

// Oyunu başlat
function startGame() {
    if (moveHistory.length === 0) {
        alert('Önce hareketleri planlamalısınız!');
        return;
    }
    
    initialGameState = JSON.parse(JSON.stringify(gameState));
    playRecordedMoves();
}

// CSS için stil
const style = document.createElement('style');
style.textContent = `
.level-info {
    background-color: #e8f5e9;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.level-info h2 {
    color: #00796b;
    margin-bottom: 0.5rem;
}

.level-info p {
    color: #2e7d32;
}
`;
document.head.appendChild(style);

// Oyunu başlat
loadLevel(currentLevel); 