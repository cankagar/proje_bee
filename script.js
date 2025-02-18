// Grid boyutları
const GRID_COLS = 6;
const GRID_ROWS = 4;

// Oyun durumu
let playerPosition = {
    row: GRID_ROWS - 1,  // En alt satır
    col: 0               // En sol sütun
};

let collectedItems = 0;
let gameEnded = false;

// Hedef noktaları
let targetPositions = [];
let finishPosition = null;

// Hareket kuyruğu için dizi
let movementQueue = [];
let isExecuting = false;

// Kontrol butonlarını seçme
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnGo = document.getElementById('btn-go');
const btnClear = document.getElementById('btn-clear');
const queueDisplay = document.getElementById('movement-queue');

// Oyunu sıfırla
function resetGame() {
    playerPosition = {
        row: GRID_ROWS - 1,
        col: 0
    };
    collectedItems = 0;
    gameEnded = false;
    movementQueue = [];
    isExecuting = false;
    document.getElementById('collected-count').textContent = '0';
    document.getElementById('status-text').textContent = 'Oyun devam ediyor...';
    document.getElementById('status-text').style.color = '#333';
    
    // Kontrolleri aktif et
    enableControls();
    
    // Yeni oyun tahtası oluştur
    generateRandomPositions();
    updateBoard();
    updateQueueDisplay();
}

// Kontrolleri aktif et
function enableControls() {
    btnUp.disabled = false;
    btnDown.disabled = false;
    btnLeft.disabled = false;
    btnRight.disabled = false;
    btnGo.disabled = false;
    btnClear.disabled = false;
}

// Grid oluşturma
function createGrid() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = ''; // Grid'i temizle
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            gridContainer.appendChild(cell);
        }
    }
}

// Rastgele benzersiz pozisyonlar oluştur
function generateRandomPositions() {
    const positions = [];
    const startPos = `${GRID_ROWS - 1},0`; // Başlangıç pozisyonu

    while (positions.length < 4) {  // 3 hedef + 1 bitiş noktası
        const row = Math.floor(Math.random() * GRID_ROWS);
        const col = Math.floor(Math.random() * GRID_COLS);
        const posStr = `${row},${col}`;
        
        // Pozisyonun başlangıç noktası olmadığından ve tekrar etmediğinden emin ol
        if (posStr !== startPos && !positions.includes(posStr)) {
            positions.push(posStr);
        }
    }
    
    // İlk 3'ü hedef, son 1'i bitiş noktası
    targetPositions = positions.slice(0, 3).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col };
    });
    
    const [finishRow, finishCol] = positions[3].split(',').map(Number);
    finishPosition = { row: finishRow, col: finishCol };
}

// Oyun tahtasını güncelle
function updateBoard() {
    // Tüm hücreleri temizle
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.innerHTML = '';
    });
    
    // Hedefleri yerleştir
    targetPositions.forEach((pos, index) => {
        const cell = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
        if (cell) {
            const img = document.createElement('img');
            img.src = `https://picsum.photos/50/50?random=${index + 1}`;
            img.alt = `Hedef ${index + 1}`;
            cell.appendChild(img);
        }
    });
    
    // Bitiş noktasını yerleştir
    const finishCell = document.querySelector(`[data-row="${finishPosition.row}"][data-col="${finishPosition.col}"]`);
    if (finishCell) {
        const finishPoint = document.createElement('div');
        finishPoint.style.width = '90%';
        finishPoint.style.height = '90%';
        finishPoint.style.backgroundColor = '#FFD700';
        finishPoint.style.borderRadius = '5px';
        finishCell.appendChild(finishPoint);
    }
    
    // Oyuncuyu yerleştir
    const playerCell = document.querySelector(`[data-row="${playerPosition.row}"][data-col="${playerPosition.col}"]`);
    if (playerCell) {
        const player = document.createElement('div');
        player.className = 'player';
        playerCell.appendChild(player);
    }
}

// Oyuncuyu hareket ettir
function movePlayer(rowDiff, colDiff) {
    if (gameEnded) return false;

    const newRow = playerPosition.row + rowDiff;
    const newCol = playerPosition.col + colDiff;
    
    // Grid sınırlarını kontrol et
    if (newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS) {
        return false;
    }
    
    // Mevcut hücredeki oyuncuyu bul
    const currentCell = document.querySelector(`[data-row="${playerPosition.row}"][data-col="${playerPosition.col}"]`);
    const playerElement = currentCell.querySelector('.player');
    
    // Yeni hücreyi bul
    const newCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    
    if (playerElement) {
        // Hareket yönünü belirle
        let direction = '';
        if (rowDiff < 0) direction = 'move-up';
        else if (rowDiff > 0) direction = 'move-down';
        else if (colDiff < 0) direction = 'move-left';
        else if (colDiff > 0) direction = 'move-right';
        
        // Animasyon sınıfını ekle
        playerElement.className = 'player ' + direction;
        
        // Animasyon bittikten sonra yeni hücreye taşı
        setTimeout(() => {
            playerElement.className = 'player';
            newCell.appendChild(playerElement);
        }, 400);
    }
    
    // Pozisyonu güncelle
    playerPosition.row = newRow;
    playerPosition.col = newCol;
    
    // Hedef kontrolü
    checkCollectible();
    
    return true;
}

// Hareket fonksiyonları
function addToQueue(direction) {
    if (isExecuting || gameEnded) return;
    movementQueue.push(direction);
    updateQueueDisplay();
}

function updateQueueDisplay() {
    queueDisplay.innerHTML = '';
    movementQueue.forEach((direction, index) => {
        const queueItem = document.createElement('div');
        queueItem.className = `queue-item direction-${direction.toLowerCase()}`;
        queueItem.textContent = direction;
        queueDisplay.appendChild(queueItem);
    });
}

async function executeQueue() {
    if (isExecuting || movementQueue.length === 0 || gameEnded) return;
    
    isExecuting = true;
    btnGo.disabled = true;
    
    for (const direction of movementQueue) {
        let success = false;
        switch (direction) {
            case 'Yukarı':
                success = movePlayer(-1, 0);
                break;
            case 'Aşağı':
                success = movePlayer(1, 0);
                break;
            case 'Sol':
                success = movePlayer(0, -1);
                break;
            case 'Sağ':
                success = movePlayer(0, 1);
                break;
        }
        if (!success) break;
        
        // Her hareket için bekle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Her hareketten sonra oyun durumunu kontrol et
        checkGameStatus();
        if (gameEnded) break;
    }
    
    movementQueue = [];
    updateQueueDisplay();
    isExecuting = false;
    btnGo.disabled = false;
}

function clearQueue() {
    if (isExecuting || gameEnded) return;
    movementQueue = [];
    updateQueueDisplay();
}

// Hedef toplama kontrolü
function checkCollectible() {
    const targetIndex = targetPositions.findIndex(pos => 
        pos.row === playerPosition.row && pos.col === playerPosition.col
    );
    
    if (targetIndex !== -1) {
        // Hedef resmi bul ve animasyonlu şekilde kaldır
        const cell = document.querySelector(`[data-row="${playerPosition.row}"][data-col="${playerPosition.col}"]`);
        const img = cell.querySelector('img');
        if (img) {
            img.classList.add('collected-image');
            setTimeout(() => img.remove(), 400);
        }

        targetPositions.splice(targetIndex, 1);
        collectedItems++;
        
        // Toplanan resim sayısını güncelle ve animasyonlu göster
        const collectedCountElement = document.getElementById('collected-count');
        collectedCountElement.textContent = collectedItems;
        collectedCountElement.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            collectedCountElement.style.animation = '';
        }, 500);
    }
}

// Oyun durumu kontrolü
function checkGameStatus() {
    if (gameEnded) return;
    
    const statusText = document.getElementById('status-text');
    
    // Bitiş noktasına ulaşıldı mı?
    if (playerPosition.row === finishPosition.row && playerPosition.col === finishPosition.col) {
        gameEnded = true;
        if (collectedItems === 3) {
            statusText.textContent = 'Tebrikler! Görevi başarıyla tamamladınız!';
            statusText.style.color = 'green';
            showGameEndMessage('Başarılı! 🎉', 'success');
        } else {
            statusText.textContent = 'Görev başarısız! Tüm hedefleri toplamadan bitişe ulaştınız.';
            statusText.style.color = 'red';
            showGameEndMessage('Başarısız! Tekrar deneyin. 😕', 'error');
        }
        disableControls();
    }
}

// Oyun sonu mesajını göster
function showGameEndMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `game-message ${type}`;
    messageDiv.innerHTML = `
        <p>${message}</p>
        <button onclick="resetGame()" class="reset-button">Tekrar Dene</button>
    `;
    
    // Varsa eski mesajı kaldır
    const oldMessage = document.querySelector('.game-message');
    if (oldMessage) {
        oldMessage.remove();
    }
    
    document.querySelector('.game-container').appendChild(messageDiv);
    
    // Mesajı animasyonlu göster
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
}

// Kontrolleri devre dışı bırak
function disableControls() {
    btnUp.disabled = true;
    btnDown.disabled = true;
    btnLeft.disabled = true;
    btnRight.disabled = true;
    btnGo.disabled = true;
    btnClear.disabled = true;
}

// Event listeners
btnUp.addEventListener('click', () => addToQueue('Yukarı'));
btnDown.addEventListener('click', () => addToQueue('Aşağı'));
btnLeft.addEventListener('click', () => addToQueue('Sol'));
btnRight.addEventListener('click', () => addToQueue('Sağ'));
btnGo.addEventListener('click', executeQueue);
btnClear.addEventListener('click', clearQueue);

// Oyunu başlat
createGrid();
generateRandomPositions();
updateBoard(); 