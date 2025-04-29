// Oyun durumu
let playerName = '';
let initialGameState = null;
let currentLevel = 1;
let maxLevel = 10;

// P - Arabanın konumu
// B - Pilin konumu
// T - Çöpün konumu

const levels = {
    1: {
        name: "Kolay Seviye - Öğrenme",
        description: "X'in ilk görevi çok kolay! Sadece 1 çöp ve 1 pil var. Haydi başlayalım!",
        grid: [
            "-----",
            "-----",
            "-BP-T",
            "-----",
            "-----"
        ]
    },
    2: {
        name: "Kolay Seviye - Alıştırma",
        description: "X harika gidiyor! Şimdi 2 çöp ve 1 pil var. X yapabilir!",
        grid: [
            "-----",
            "-B---",
            "--P--",
            "--T--",
            "-----"
        ]
    },
    3: {
        name: "Orta Seviye - Başlangıç",
        description: "X için zorluk biraz artıyor! 3 çöp ve 1 pil var.",
        grid: [
            "B---T",
            "-----",
            "-T-T-",
            "-----",
            "--P--"
        ]
    },
    4: {
        name: "Orta Seviye - Çapraz Hareket",
        description: "X'in çapraz hareketleri kullanması gereken bir seviye! 3 çöp ve 2 pil var.",
        grid: [
            "P---B",
            "-----",
            "--T--",
            "-T---",
            "B---T"
        ]
    },
    5: {
        name: "Orta Seviye - Strateji",
        description: "X pilleri akıllıca kullanmalı! 4 çöp ve 2 pil var.",
        grid: [
            "--P--",
            "-T-T-",
            "B---B",
            "-T-T-",
            "-----"
        ]
    },
    6: {
        name: "Zor Seviye - Planlama",
        description: "X iyi bir planlama yapmalı! 4 çöp ve 2 pil var, ama konumları zorlu.",
        grid: [
            "P----",
            "--T--",
            "-T-T-",
            "--T--",
            "B---B"
        ]
    },
    7: {
        name: "Zor Seviye - Labirent",
        description: "X için çöpler labirent gibi dizilmiş! 5 çöp ve 2 pil var.",
        grid: [
            "--P--",
            "-T-T-",
            "B-T-B",
            "-T-T-",
            "-----"
        ]
    },
    8: {
        name: "Uzman Seviye - Verimlilik",
        description: "X her hareketi dikkatli planlamalı! 5 çöp ve 2 pil, minimum hareketle toplanmalı.",
        grid: [
            "P----",
            "-T-T-",
            "--B-T",
            "-T---",
            "--T-B"
        ]
    },
    9: {
        name: "Uzman Seviye - Maksimum Zorluk",
        description: "X için en zor seviyelerden biri! 6 çöp ve 2 pil var.",
        grid: [
            "B---T",
            "-T-T-",
            "--P--",
            "-T-T-",
            "T---B"
        ]
    },
    10: {
        name: "Final Seviye - Ustalaşma",
        description: "X için final seviyesi! 6 çöp ve 2 pil. X'in tüm öğrendiklerini kullanma zamanı!",
        grid: [
            "P-T-B",
            "--T--",
            "T-T-T",
            "--T--",
            "B-T--"
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

// Grid tabanlı level'ı koordinat bazlı verilere dönüştürme
function parseLevel(level) {
    const player = { x: 0, y: 0 };
    const batteries = [];
    const trashItems = [];
    
    for (let y = 0; y < level.grid.length; y++) {
        const row = level.grid[y];
        for (let x = 0; x < row.length; x++) {
            const cell = row.charAt(x);
            
            if (cell === 'P') {
                player.x = x;
                player.y = y;
            } else if (cell === 'B') {
                batteries.push({ x, y });
            } else if (cell === 'T') {
                trashItems.push({ x, y });
            }
        }
    }
    
    return {
        player,
        batteries,
        trashItems
    };
}

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

    const parsedLevel = parseLevel(level);
    
    gameState = {
        playerPosition: { ...parsedLevel.player },
        batteryCount: 3,
        trashCount: 0,
        batteries: [...parsedLevel.batteries],
        trashItems: [...parsedLevel.trashItems],
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

    // Level açıklamasını kişiselleştir
    const personalizedDescription = level.description.replace(/X/g, playerName);

    const levelInfo = document.createElement('div');
    levelInfo.className = 'level-info';
    levelInfo.innerHTML = `
        <h2>Seviye ${currentLevel}: ${level.name}</h2>
        <p>${personalizedDescription}</p>
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

// İsim girişini kontrol et ve hikayeyi göster
function submitName() {
    const nameInput = document.getElementById('initial-player-name');
    const name = nameInput.value.trim();
    
    if (name === '') {
        alert('Lütfen isminizi giriniz!');
        return;
    }

    // İsim uzunluğu kontrolü
    if (name.length < 3) {
        alert('İsminiz çok kısa! Lütfen en az 3 karakter kullanın.');
        return;
    }

    if (name.length > 15) {
        alert('İsminiz çok uzun! Lütfen isminizi kısaltıp tekrar deneyiniz.');
        return;
    }
    
    playerName = name;
    
    // İsim giriş ekranını gizle
    document.getElementById('name-entry').style.display = 'none';
    
    // Hikaye metnini güncelle
    updateStoryText();
    
    // Hikaye ekranını göster
    document.getElementById('intro-story').style.display = 'flex';
}

// Hikaye metnini güncelle
function updateStoryText() {
    // Başlığı güncelle
    document.getElementById('story-title').textContent = `${playerName}'in Çevre Dostu Macerası`;
    
    // Paragrafları güncelle
    document.getElementById('story-p1').textContent = 
        `Bir zamanlar, doğayı çok seven ${playerName} adında bir çocuk vardı. ${playerName}, yaşadığı dünyayı korumak için her zaman en iyi yolları arıyordu. Ama bir sorun vardı! Havanın içindeki kötü CO2 gazları artmıştı ve dünya biraz üzgündü. 😔`;
    
    document.getElementById('story-p2').textContent = 
        `${playerName}, bu sorunu çözmek için sihirli elektrikli arabasına atladı! 🚗⚡ Ama dikkat etmesi gereken bir şey vardı: Arabanın pili 3 taneydi! Her hareket ettiğinde pili bir tane azalacaktı. Ama neyse ki yol boyunca alabileceği 3 pil bulunuyor ve yoluna devam ediyor! Ayrıca, dünyayı daha temiz yapmak için yerdeki çöpleri de toplaması gerekiyordu. 🌍✨`;
    
    document.getElementById('story-p3').textContent = 
        `Şimdi ${playerName}'in macerasına sen de katılmaya hazır mısın? Ona ileri, geri, sağa ve sola gitmesini söyleyerek hem çöpleri toplayabilir hem de pilleri alarak yoluna devam etmesini sağlayabilirsin. Ama dikkatli ol! Pil bitmeden görevi tamamlaman gerekiyor!`;
    
    document.getElementById('story-p4').textContent = 
        `Hadi, ${playerName}'e yardım edelim ve dünyayı daha temiz bir yer yapalım! 🌿🚀`;
}

// Oyun başlangıç fonksiyonu
function startGame() {
    if (moveHistory.length === 0) {
        alert('Önce hareketleri planlamalısınız!');
        return;
    }

    // Başlangıç durumunu kaydet
    initialGameState = JSON.parse(JSON.stringify(gameState));
    
    // Hareketleri oynat
    playRecordedMoves();
}

// Hikayeden oyuna geç
function startFromStory() {
    // Hikaye ekranını gizle
    document.getElementById('intro-story').style.display = 'none';
    
    // Oyun container'ını göster
    document.querySelector('.game-container').style.display = 'flex';
    
    // Oyun başlığını güncelle
    document.querySelector('.container h1').textContent = `${playerName}'in Çevre Dostu Macerası`;
    
    // Oyun arayüzünü göster
    document.querySelector('.game-info').style.display = 'block';
    
    // İlk seviyeyi yükle
    loadLevel(currentLevel);
}

// Oyunu sıfırla
function resetGame() {
    currentLevel = 1;
    
    // İsim giriş ekranını göster
    document.getElementById('name-entry').style.display = 'flex';
    
    // Hikaye ve oyun ekranlarını gizle
    document.getElementById('intro-story').style.display = 'none';
    document.querySelector('.game-container').style.display = 'none';
    
    // İsim giriş alanını temizle
    document.getElementById('initial-player-name').value = '';
    
    // Başlığı sıfırla
    document.querySelector('h1').textContent = `X'in Çevre Dostu Macerası`;
    
    // Oyun durumunu sıfırla
    playerName = '';
    moveHistory = [];
    document.getElementById('moves-list').innerHTML = '';
    
    // Grid'i temizle
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';
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

#name-input-container {
    margin: 20px 0;
    text-align: center;
}

#player-name {
    padding: 8px;
    font-size: 16px;
    border: 2px solid #00796b;
    border-radius: 4px;
    margin: 0 10px;
}

.name-submit-btn {
    padding: 8px 20px;
    font-size: 16px;
    background-color: #00796b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.name-submit-btn:hover {
    background-color: #005b4f;
}
`;
document.head.appendChild(style);

// Oyunu başlat
loadLevel(currentLevel); 