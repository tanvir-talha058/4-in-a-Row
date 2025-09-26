// Game State
let currentPlayer = 1;
let gameBoard = Array(6).fill().map(() => Array(7).fill(0));
let gameMode = 'player'; // 'player' or 'ai'
let gameEnded = false;
let scores = { player1: 0, player2: 0 };

// Sound State
let soundEnabled = true;
let audioContext;
let backgroundMusicPlaying = false;

// Maze Game State
let mazeGrid = [];
let playerPos = { x: 1, y: 1 };
let aiPos = { x: 23, y: 18 };
let resources = [];
let exitPos = { x: 23, y: 18 };
let mazeScores = { player: 0, ai: 0 };

// Animation States
let dropAnimation = null;
let winningCells = [];

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeAudio();
    initializeGame();
    startBackgroundEffects();
});

function initializeAudio() {
    // Initialize Web Audio API
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function createSound(frequency, duration, type = 'sine', volume = 0.1) {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playDropSound() {
    // Descending tone for piece drop
    createSound(800, 0.1);
    setTimeout(() => createSound(600, 0.1), 50);
    setTimeout(() => createSound(400, 0.2), 100);
}

function playHoverSound() {
    createSound(300, 0.1, 'triangle', 0.05);
}

function playClickSound() {
    createSound(500, 0.1, 'square', 0.1);
}

function playWinSound() {
    // Victory fanfare
    const notes = [262, 330, 392, 523];
    notes.forEach((note, index) => {
        setTimeout(() => createSound(note, 0.3, 'triangle', 0.2), index * 150);
    });
}

function playConnectionSound() {
    // Rising tone for connection
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createSound(400 + i * 50, 0.1, 'sine', 0.1), i * 20);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundIcon = document.getElementById('soundIcon');
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    
    if (!soundEnabled && backgroundMusicPlaying) {
        stopBackgroundMusic();
    }
}

function startBackgroundEffects() {
    // Create floating particles periodically
    setInterval(createFloatingParticle, 3000);
    
    // Create sparkles
    setInterval(createSparkle, 1500);
    
    // Create aurora effects
    setInterval(createAuroraWave, 8000);
}

function initializeGame() {
    createBoard();
    updatePlayerTurn();
}

function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(col));
            cell.addEventListener('mouseenter', () => handleCellHover(col, true));
            cell.addEventListener('mouseleave', () => handleCellHover(col, false));
            board.appendChild(cell);
        }
    }
}

function handleCellClick(col) {
    if (gameEnded) return;
    
    const row = getLowestEmptyRow(col);
    if (row === -1) return; // Column is full
    
    playClickSound();
    createLightningEffect(col);
    dropPiece(row, col);
}

function handleCellHover(col, isHovering) {
    if (gameEnded) return;
    
    const row = getLowestEmptyRow(col);
    if (row === -1) return;
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (isHovering) {
        playHoverSound();
        cell.style.background = currentPlayer === 1 
            ? 'radial-gradient(circle at 30% 30%, rgba(255, 71, 87, 0.5), rgba(196, 69, 105, 0.5))'
            : 'radial-gradient(circle at 30% 30%, rgba(255, 217, 61, 0.5), rgba(246, 185, 61, 0.5))';
        cell.style.transform = 'scale(1.05)';
        cell.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.6)';
    } else {
        cell.style.background = 'radial-gradient(circle at 30% 30%, #ecf0f1, #bdc3c7)';
        cell.style.transform = 'scale(1)';
        cell.style.boxShadow = 'none';
    }
}

function getLowestEmptyRow(col) {
    for (let row = 5; row >= 0; row--) {
        if (gameBoard[row][col] === 0) {
            return row;
        }
    }
    return -1;
}

function dropPiece(row, col) {
    gameBoard[row][col] = currentPlayer;
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('filled');
    cell.classList.add(`player${currentPlayer}`);
    
    // Play drop sound
    playDropSound();
    
    // Create enhanced particles effect
    createEnhancedParticles(cell);
    
    // Create screen shake effect
    createScreenShake();
    
    // Check for win
    if (checkWin(row, col)) {
        handleWin();
        return;
    }
    
    // Check for draw
    if (isDraw()) {
        handleDraw();
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerTurn();
    
    // AI turn if playing against AI
    if (gameMode === 'ai' && currentPlayer === 2) {
        setTimeout(aiMove, 800);
    }
}

function createEnhancedParticles(cell) {
    const container = document.getElementById('particlesContainer');
    const rect = cell.getBoundingClientRect();
    const boardRect = container.getBoundingClientRect();
    
    // Create explosion particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle explosion';
        
        const colors = currentPlayer === 1 
            ? ['#ff4757', '#ff6b6b', '#ff8787'] 
            : ['#ffd93d', '#ffe066', '#ffeb99'];
        
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top - boardRect.top + rect.height / 2) + 'px';
        
        const angle = (i / 15) * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.transform = `translate(${vx}px, ${vy}px)`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
    
    // Create floating particles
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = currentPlayer === 1 ? '#ff4757' : '#ffd93d';
            particle.style.left = (rect.left - boardRect.left + rect.width / 2 + (Math.random() - 0.5) * 40) + 'px';
            particle.style.top = (rect.top - boardRect.top + rect.height / 2) + 'px';
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }, i * 100);
    }
}

function createScreenShake() {
    const container = document.querySelector('.container');
    container.style.animation = 'screenShake 0.3s ease-in-out';
    setTimeout(() => {
        container.style.animation = '';
    }, 300);
}

function createLightningEffect(col) {
    const container = document.getElementById('lightningContainer');
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    lightning.style.left = (col * 88 + 44) + 'px';
    lightning.style.top = '0px';
    
    container.appendChild(lightning);
    
    setTimeout(() => {
        if (lightning.parentNode) {
            lightning.parentNode.removeChild(lightning);
        }
    }, 300);
}

function createParticles(cell) {
    const container = document.getElementById('particlesContainer');
    const rect = cell.getBoundingClientRect();
    const boardRect = container.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.background = currentPlayer === 1 ? '#ff4757' : '#ffd93d';
        particle.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top - boardRect.top + rect.height / 2) + 'px';
        particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px)`;
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]], // Horizontal
        [[1, 0], [-1, 0]], // Vertical
        [[1, 1], [-1, -1]], // Diagonal /
        [[1, -1], [-1, 1]]  // Diagonal \
    ];
    
    for (let direction of directions) {
        let count = 1;
        let cells = [{row, col}];
        
        // Check both directions
        for (let [dx, dy] of direction) {
            let newRow = row + dx;
            let newCol = col + dy;
            
            while (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                   gameBoard[newRow][newCol] === currentPlayer) {
                count++;
                cells.push({row: newRow, col: newCol});
                newRow += dx;
                newCol += dy;
            }
        }
        
        if (count >= 4) {
            winningCells = cells;
            return true;
        }
    }
    return false;
}

function handleWin() {
    gameEnded = true;
    scores[`player${currentPlayer}`]++;
    updateScores();
    
    // Play win sound
    playWinSound();
    playConnectionSound();
    
    // Highlight winning cells with enhanced animation
    winningCells.forEach(({row, col}, index) => {
        setTimeout(() => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
            
            // Create explosion effect for each winning cell
            createWinExplosion(cell);
        }, index * 100);
    });
    
    // Create fireworks
    setTimeout(() => {
        createFireworks();
        showWinOverlay(`Player ${currentPlayer} Wins!`);
    }, 1500);
}

function createWinExplosion(cell) {
    const container = document.getElementById('particlesContainer');
    const rect = cell.getBoundingClientRect();
    const boardRect = container.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.background = '#fff';
        particle.style.width = '12px';
        particle.style.height = '12px';
        particle.style.boxShadow = '0 0 15px #fff';
        particle.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top - boardRect.top + rect.height / 2) + 'px';
        
        const angle = (i / 20) * Math.PI * 2;
        const velocity = 80 + Math.random() * 120;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.transform = `translate(${vx}px, ${vy}px)`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

function createFireworks() {
    const container = document.getElementById('fireworksContainer');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = (Math.random() * 80 + 10) + '%';
            firework.style.top = (Math.random() * 50 + 10) + '%';
            firework.style.background = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d9de0', '#ff8787'][Math.floor(Math.random() * 5)];
            
            container.appendChild(firework);
            
            setTimeout(() => {
                if (firework.parentNode) {
                    firework.parentNode.removeChild(firework);
                }
            }, 2000);
        }, i * 300);
    }
}

function handleDraw() {
    gameEnded = true;
    showWinOverlay("It's a Draw!");
}

function isDraw() {
    return gameBoard[0].every(cell => cell !== 0);
}

function showWinOverlay(message) {
    document.getElementById('winTitle').textContent = message;
    document.getElementById('winOverlay').classList.add('show');
}

function hideWinOverlay() {
    document.getElementById('winOverlay').classList.remove('show');
}

function updatePlayerTurn() {
    const turnElement = document.getElementById('playerTurn');
    const turnPiece = turnElement.querySelector('.turn-piece');
    const turnText = turnElement.querySelector('span');
    
    turnPiece.className = `turn-piece player${currentPlayer}`;
    turnText.textContent = gameMode === 'ai' && currentPlayer === 2 
        ? "AI's Turn" 
        : `Player ${currentPlayer}'s Turn`;
}

function updateScores() {
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
}

function resetGame() {
    gameBoard = Array(6).fill().map(() => Array(7).fill(0));
    gameEnded = false;
    currentPlayer = 1;
    winningCells = [];
    
    createBoard();
    updatePlayerTurn();
    hideWinOverlay();
}

function startGame(mode) {
    gameMode = mode;
    playClickSound();
    
    // Animate menu exit
    const menu = document.getElementById('gameMenu');
    menu.style.transform = 'scale(0.8)';
    menu.style.opacity = '0';
    
    setTimeout(() => {
        menu.style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        
        // Animate game entrance
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.style.transform = 'scale(0.8)';
        gameContainer.style.opacity = '0';
        
        setTimeout(() => {
            gameContainer.style.transform = 'scale(1)';
            gameContainer.style.opacity = '1';
            gameContainer.style.transition = 'all 0.5s ease';
        }, 50);
        
        resetGame();
    }, 300);
}

function goToMenu() {
    playClickSound();
    
    const gameContainer = document.getElementById('gameContainer');
    const mazeGame = document.getElementById('mazeGame');
    
    // Animate current screen exit
    [gameContainer, mazeGame].forEach(container => {
        if (container.style.display !== 'none') {
            container.style.transform = 'scale(0.8)';
            container.style.opacity = '0';
        }
    });
    
    setTimeout(() => {
        gameContainer.style.display = 'none';
        mazeGame.style.display = 'none';
        
        const menu = document.getElementById('gameMenu');
        menu.style.display = 'flex';
        
        // Animate menu entrance
        setTimeout(() => {
            menu.style.transform = 'scale(1)';
            menu.style.opacity = '1';
            menu.style.transition = 'all 0.5s ease';
        }, 50);
    }, 300);
    
    hideWinOverlay();
}

// Enhanced background effects
function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = (Math.random() * 8 + 4) + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = `hsla(${Math.random() * 360}, 70%, 70%, 0.6)`;
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1';
    particle.style.animation = `floatingParticle ${5 + Math.random() * 10}s ease-out forwards`;
    particle.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

function createAuroraWave() {
    const wave = document.createElement('div');
    wave.style.position = 'fixed';
    wave.style.top = '0';
    wave.style.left = '-100px';
    wave.style.width = '200px';
    wave.style.height = '100vh';
    wave.style.background = `linear-gradient(90deg, 
        transparent 0%, 
        hsla(${Math.random() * 360}, 70%, 70%, 0.1) 50%, 
        transparent 100%)`;
    wave.style.pointerEvents = 'none';
    wave.style.zIndex = '1';
    wave.style.animation = 'auroraWave 8s ease-in-out forwards';
    
    document.body.appendChild(wave);
    
    setTimeout(() => {
        if (wave.parentNode) {
            wave.parentNode.removeChild(wave);
        }
    }, 8000);
}

// AI Logic
function aiMove() {
    if (gameEnded) return;
    
    // Simple AI: Try to win, block player, or random move
    let bestCol = -1;
    
    // Try to win
    for (let col = 0; col < 7; col++) {
        const row = getLowestEmptyRow(col);
        if (row !== -1) {
            gameBoard[row][col] = 2;
            if (checkWin(row, col)) {
                gameBoard[row][col] = 0;
                bestCol = col;
                break;
            }
            gameBoard[row][col] = 0;
        }
    }
    
    // Try to block player
    if (bestCol === -1) {
        for (let col = 0; col < 7; col++) {
            const row = getLowestEmptyRow(col);
            if (row !== -1) {
                gameBoard[row][col] = 1;
                if (checkWin(row, col)) {
                    gameBoard[row][col] = 0;
                    bestCol = col;
                    break;
                }
                gameBoard[row][col] = 0;
            }
        }
    }
    
    // Random move
    if (bestCol === -1) {
        const availableCols = [];
        for (let col = 0; col < 7; col++) {
            if (getLowestEmptyRow(col) !== -1) {
                availableCols.push(col);
            }
        }
        bestCol = availableCols[Math.floor(Math.random() * availableCols.length)];
    }
    
    if (bestCol !== -1) {
        const row = getLowestEmptyRow(bestCol);
        dropPiece(row, bestCol);
    }
}

// Maze Game Functions
function showMazeGame() {
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('mazeGame').style.display = 'flex';
    generateMaze();
}

function generateMaze() {
    const width = 25;
    const height = 20;
    
    // Initialize maze with walls
    mazeGrid = Array(height).fill().map(() => Array(width).fill(1));
    
    // Simple maze generation (could be enhanced with proper algorithms)
    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            mazeGrid[y][x] = 0; // Empty space
            
            // Randomly connect to adjacent cells
            if (Math.random() < 0.7) {
                if (x + 2 < width - 1) mazeGrid[y][x + 1] = 0;
            }
            if (Math.random() < 0.7) {
                if (y + 2 < height - 1) mazeGrid[y + 1][x] = 0;
            }
        }
    }
    
    // Set player and AI positions
    playerPos = { x: 1, y: 1 };
    aiPos = { x: width - 2, y: height - 2 };
    exitPos = { x: width - 2, y: height - 2 };
    
    // Generate resources
    resources = [];
    for (let i = 0; i < 15; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
        } while (mazeGrid[y][x] === 1 || (x === playerPos.x && y === playerPos.y) || (x === aiPos.x && y === aiPos.y));
        
        resources.push({ x, y, value: Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1 });
    }
    
    mazeScores = { player: 0, ai: 0 };
    updateMazeDisplay();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleMazeKeyboard);
}

function updateMazeDisplay() {
    const container = document.getElementById('mazeContainer');
    container.innerHTML = '';
    
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 25; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            
            if (x === playerPos.x && y === playerPos.y) {
                cell.classList.add('maze-player');
            } else if (x === aiPos.x && y === aiPos.y) {
                cell.classList.add('maze-ai');
            } else if (x === exitPos.x && y === exitPos.y) {
                cell.classList.add('maze-exit');
            } else if (mazeGrid[y][x] === 1) {
                cell.classList.add('maze-wall');
            } else {
                cell.classList.add('maze-empty');
                
                // Check for resources
                const resource = resources.find(r => r.x === x && r.y === y);
                if (resource) {
                    if (resource.value === 1) cell.classList.add('maze-resource-low');
                    else if (resource.value === 2) cell.classList.add('maze-resource-med');
                    else cell.classList.add('maze-resource-high');
                }
            }
            
            container.appendChild(cell);
        }
    }
    
    document.getElementById('playerMazeScore').textContent = mazeScores.player;
    document.getElementById('aiMazeScore').textContent = mazeScores.ai;
}

function handleMazeKeyboard(event) {
    if (document.getElementById('mazeGame').style.display === 'none') return;
    
    let newX = playerPos.x;
    let newY = playerPos.y;
    
    switch (event.key) {
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
        case 'r':
        case 'R':
            generateMaze();
            return;
        case 'Escape':
            goToMenu();
            return;
        default:
            return;
    }
    
    // Check bounds and walls
    if (newX >= 0 && newX < 25 && newY >= 0 && newY < 20 && mazeGrid[newY][newX] === 0) {
        playerPos.x = newX;
        playerPos.y = newY;
        
        // Check for resources
        const resourceIndex = resources.findIndex(r => r.x === newX && r.y === newY);
        if (resourceIndex !== -1) {
            mazeScores.player += resources[resourceIndex].value;
            resources.splice(resourceIndex, 1);
        }
        
        // Check for exit
        if (newX === exitPos.x && newY === exitPos.y) {
            alert('Player wins! Press R to restart or Escape for menu.');
        }
        
        updateMazeDisplay();
        
        // Simple AI movement
        setTimeout(() => {
            moveAI();
        }, 500);
    }
}

function moveAI() {
    const directions = [
        { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    
    // Simple AI: move towards nearest resource or exit
    let bestMove = null;
    let bestScore = -1;
    
    for (let dir of directions) {
        const newX = aiPos.x + dir.x;
        const newY = aiPos.y + dir.y;
        
        if (newX >= 0 && newX < 25 && newY >= 0 && newY < 20 && mazeGrid[newY][newX] === 0) {
            let score = 0;
            
            // Score based on proximity to resources
            for (let resource of resources) {
                const distance = Math.abs(newX - resource.x) + Math.abs(newY - resource.y);
                score += resource.value / (distance + 1);
            }
            
            // Score based on proximity to exit
            const exitDistance = Math.abs(newX - exitPos.x) + Math.abs(newY - exitPos.y);
            score += 10 / (exitDistance + 1);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = { x: newX, y: newY };
            }
        }
    }
    
    if (bestMove) {
        aiPos.x = bestMove.x;
        aiPos.y = bestMove.y;
        
        // Check for resources
        const resourceIndex = resources.findIndex(r => r.x === bestMove.x && r.y === bestMove.y);
        if (resourceIndex !== -1) {
            mazeScores.ai += resources[resourceIndex].value;
            resources.splice(resourceIndex, 1);
        }
        
        // Check for exit
        if (bestMove.x === exitPos.x && bestMove.y === exitPos.y) {
            alert('AI wins! Press R to restart or Escape for menu.');
        }
        
        updateMazeDisplay();
    }
}

// Add some extra visual effects
document.addEventListener('DOMContentLoaded', function() {
    // Add floating animation to menu buttons
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach((btn, index) => {
        btn.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Enhanced sparkle effects
    setInterval(createSparkle, 1000);
});

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'fixed';
    sparkle.style.width = (Math.random() * 6 + 2) + 'px';
    sparkle.style.height = sparkle.style.width;
    sparkle.style.background = `hsla(${Math.random() * 360}, 80%, 80%, 0.8)`;
    sparkle.style.borderRadius = '50%';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '1';
    sparkle.style.animation = `sparkleFloat ${2 + Math.random() * 3}s ease-out forwards`;
    sparkle.style.boxShadow = `0 0 ${Math.random() * 20 + 10}px rgba(255, 255, 255, 0.8)`;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 5000);
}

// Add CSS for enhanced sparkle animation
const enhancedSparkleStyle = document.createElement('style');
enhancedSparkleStyle.textContent = `
@keyframes sparkleFloat {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0) rotate(0deg);
    }
    20% {
        opacity: 1;
        transform: translateY(-20px) scale(1) rotate(90deg);
    }
    80% {
        opacity: 1;
        transform: translateY(-150px) scale(1.2) rotate(270deg);
    }
    100% {
        opacity: 0;
        transform: translateY(-200px) scale(0) rotate(360deg);
    }
}

/* Additional particle animations */
@keyframes particleBurst {
    0% {
        opacity: 1;
        transform: scale(0.5);
    }
    50% {
        opacity: 1;
        transform: scale(1.5);
    }
    100% {
        opacity: 0;
        transform: scale(0.1);
    }
}

/* Glow effect for winning animations */
.cell.winning {
    position: relative;
}

.cell.winning::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: winGlow 1s ease-in-out infinite;
    z-index: -1;
}

@keyframes winGlow {
    0%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.2);
        opacity: 1;
    }
}
`;
document.head.appendChild(enhancedSparkleStyle);