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

// Grid oluşturma
function createGrid() {
    const gridContainer = document.querySelector('.grid-container');
    
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
    while (positions.length < 4) {  // 3 hedef + 1 bitiş noktası
        const row = Math.floor(Math.random() * (GRID_ROWS - 1));  // Son satırı hariç tut
        const col = Math.floor(Math.random() * GRID_COLS);
        
        // Pozisyonun başlangıç noktası olmadığından emin ol
        if (!(row === GRID_ROWS - 1 && col === 0)) {
            const posStr = `${row},${col}`;
            if (!positions.includes(posStr)) {
                positions.push(posStr);
            }
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
            img.src = `https://picsum.photos/50/50?random=${index + 1}`;  // Rastgele resimler
            cell.appendChild(img);
        }
    });
    
    // Bitiş noktasını yerleştir
    const finishCell = document.querySelector(`[data-row="${finishPosition.row}"][data-col="${finishPosition.col}"]`);
    if (finishCell) {
        const finishPoint = document.createElement('div');
        finishPoint.style.width = '90%';
        finishPoint.style.height = '90%';
        finishPoint.style.backgroundColor = '#FFD700'; // Sarı renk
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
function movePlayer(direction) {
    if (gameEnded) return;
    
    const newPosition = { ...playerPosition };
    
    switch (direction) {
        case 'ArrowUp':
            if (newPosition.row > 0) newPosition.row--;
            break;
        case 'ArrowDown':
            if (newPosition.row < GRID_ROWS - 1) newPosition.row++;
            break;
        case 'ArrowLeft':
            if (newPosition.col > 0) newPosition.col--;
            break;
        case 'ArrowRight':
            if (newPosition.col < GRID_COLS - 1) newPosition.col++;
            break;
    }
    
    playerPosition = newPosition;
    
    // Hedef kontrolü
    const targetIndex = targetPositions.findIndex(pos => 
        pos.row === playerPosition.row && pos.col === playerPosition.col
    );
    
    if (targetIndex !== -1) {
        targetPositions.splice(targetIndex, 1);
        collectedItems++;
        document.getElementById('collected-count').textContent = collectedItems;
    }
    
    // Bitiş noktası kontrolü
    if (playerPosition.row === finishPosition.row && playerPosition.col === finishPosition.col) {
        gameEnded = true;
        const statusText = document.getElementById('status-text');
        if (collectedItems === 3) {
            statusText.textContent = 'Tebrikler! Görevi başarıyla tamamladınız!';
            statusText.style.color = 'green';
        } else {
            statusText.textContent = 'Görev başarısız! Tüm hedefleri toplamadan bitişe ulaştınız.';
            statusText.style.color = 'red';
        }
    }
    
    updateBoard();
}

// Klavye kontrollerini dinle
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        movePlayer(event.key);
    }
});

// Oyunu başlat
createGrid();
generateRandomPositions();
updateBoard(); 