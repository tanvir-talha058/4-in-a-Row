/**
 * Connect 4 Game Logic
 * Core game mechanics for Connect 4
 */

class Connect4Game {
    constructor(gameState, audioSystem) {
        this.state = gameState;
        this.audio = audioSystem;
        this.ROWS = 6;
        this.COLS = 7;
        this.WINNING_LENGTH = 4;
        this.transpositionTable = new Map(); // Cache for AI calculations
        this.domCache = PerformanceUtils.createDOMCache();
        this.eventListeners = []; // Track listeners for cleanup
        this.isInitialized = false;
    }

    initialize() {
        this.createBoard();
        this.updatePlayerTurn();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    startGame(mode, difficulty) {
        if (mode) {
            this.setGameMode(mode);
        }
        if (difficulty) {
            this.setDifficulty(difficulty);
        }
        this.reset();
    }

    resetGame() {
        this.reset();
    }

    createBoard() {
        const board = this.domCache.get('#gameBoard');
        if (!board) return;
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cell = this.createCell(row, col);
                fragment.appendChild(cell);
            }
        }
        
        board.innerHTML = '';
        board.appendChild(fragment);
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Add event listeners
        cell.addEventListener('click', () => this.handleCellClick(col));
        cell.addEventListener('mouseenter', () => this.handleCellHover(col, true));
        cell.addEventListener('mouseleave', () => this.handleCellHover(col, false));
        
        return cell;
    }

    handleCellClick(col) {
        if (this.state.connect4.gameEnded) return;
        
        const row = this.getLowestEmptyRow(col);
        if (row === -1) return; // Column is full
        
        this.audio.playClickSound();
        this.dropPiece(row, col);
    }

    handleCellHover(col, isHovering) {
        if (this.state.connect4.gameEnded) return;
        
        const row = this.getLowestEmptyRow(col);
        if (row === -1) return;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        
        if (isHovering) {
            cell.classList.add('hover');
            this.audio.playHoverSound();
        } else {
            cell.classList.remove('hover');
        }
    }

    dropPiece(row, col) {
        try {
            // Validate move
            if (row < 0 || row >= this.ROWS || col < 0 || col >= this.COLS) {
                console.error('Invalid move coordinates:', row, col);
                return;
            }
            
            if (this.state.connect4.gameBoard[row][col] !== 0) {
                console.warn('Attempted to place piece in occupied cell');
                return;
            }
            
            // Update game board
            this.state.connect4.gameBoard[row][col] = this.state.connect4.currentPlayer;
            
            // Update UI
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add(`player${this.state.connect4.currentPlayer}`, 'drop-animation');
                this.createRippleEffect(cell);
            }
            
            this.audio.playDropSound();
            
            // Check for win
            if (this.checkWin(row, col)) {
                this.handleWin(row, col);
                return;
            }
            
            // Check for tie
            if (this.isBoardFull()) {
                this.handleTie();
                return;
            }
            
            // Switch players
            this.switchPlayer();
            
            // AI turn
            if (this.state.connect4.gameMode === 'ai' && this.state.connect4.currentPlayer === 2) {
                setTimeout(() => this.aiMove(), 500);
            }
        } catch (error) {
            console.error('Error in dropPiece:', error);
        }
    }

    getLowestEmptyRow(col) {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.state.connect4.gameBoard[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    checkWin(row, col) {
        const player = this.state.connect4.currentPlayer;
        const directions = [
            [[0, 1], [0, -1]], // Horizontal
            [[1, 0], [-1, 0]], // Vertical
            [[1, 1], [-1, -1]], // Diagonal /
            [[1, -1], [-1, 1]]  // Diagonal \
        ];
        
        for (let direction of directions) {
            let count = 1;
            let winningCells = [{ row, col }];
            
            for (let [dx, dy] of direction) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (this.isValidPosition(newRow, newCol) && 
                       this.state.connect4.gameBoard[newRow][newCol] === player) {
                    count++;
                    winningCells.push({ row: newRow, col: newCol });
                    newRow += dx;
                    newCol += dy;
                }
            }
            
            if (count >= this.WINNING_LENGTH) {
                this.state.connect4.winningCells = winningCells;
                return true;
            }
        }
        
        return false;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.ROWS && col >= 0 && col < this.COLS;
    }

    handleWin(row, col) {
        this.state.connect4.gameEnded = true;
        this.highlightWinningCells();
        this.showWinMessage();
        this.updateScore();
        this.audio.playWinSound();
        this.createFireworks();
    }

    highlightWinningCells() {
        this.state.connect4.winningCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('winning-cell');
                this.createSparkleEffect(cell);
            }
        });
    }

    showWinMessage() {
        const winnerName = this.state.connect4.currentPlayer === 1 ? 'Player 1' : 
                          (this.state.connect4.gameMode === 'ai' ? 'AI' : 'Player 2');
        
        const messageEl = document.getElementById('gameMessage');
        if (messageEl) {
            messageEl.textContent = `🎉 ${winnerName} wins! 🎉`;
            messageEl.classList.add('show', 'winner');
        }
    }

    handleTie() {
        this.state.connect4.gameEnded = true;
        const messageEl = document.getElementById('gameMessage');
        if (messageEl) {
            messageEl.textContent = "🤝 It's a tie! 🤝";
            messageEl.classList.add('show', 'tie');
        }
    }

    updateScore() {
        const playerKey = `player${this.state.connect4.currentPlayer}`;
        this.state.connect4.scores[playerKey]++;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const player1ScoreEl = document.getElementById('player1Score');
        const player2ScoreEl = document.getElementById('player2Score');
        
        if (player1ScoreEl) {
            player1ScoreEl.textContent = this.state.connect4.scores.player1;
        }
        if (player2ScoreEl) {
            player2ScoreEl.textContent = this.state.connect4.scores.player2;
        }
    }

    switchPlayer() {
        this.state.connect4.currentPlayer = this.state.connect4.currentPlayer === 1 ? 2 : 1;
        this.updatePlayerTurn();
    }

    updatePlayerTurn() {
        const turnEl = document.getElementById('currentTurn');
        if (turnEl) {
            const playerName = this.state.connect4.currentPlayer === 1 ? 'Player 1' : 
                             (this.state.connect4.gameMode === 'ai' ? 'AI' : 'Player 2');
            turnEl.textContent = `${playerName}'s Turn`;
            turnEl.className = `player${this.state.connect4.currentPlayer}`;
        }
    }

    isBoardFull() {
        return this.state.connect4.gameBoard[0].every(cell => cell !== 0);
    }

    reset() {
        this.state.resetConnect4();
        this.clearBoard();
        this.updatePlayerTurn();
        this.clearMessage();
        this.updateScoreDisplay();
    }

    clearBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });
    }

    clearMessage() {
        const messageEl = document.getElementById('gameMessage');
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = '';
        }
    }

    // AI Methods
    aiMove() {
        if (this.state.connect4.gameEnded) return;
        
        try {
            const settings = this.state.aiSettings[this.state.connect4.aiDifficulty];
            if (!settings) {
                console.error('Invalid AI difficulty setting');
                return;
            }
            
            let bestCol = -1;
            
            // Random move chance
            if (Math.random() < settings.randomMoveChance) {
                bestCol = this.getRandomMove();
            } else {
                // Strategic move
                if (this.state.connect4.aiDifficulty === 'hard') {
                    bestCol = this.getMinimaxMove(settings.lookAheadDepth);
                } else {
                    bestCol = this.getStrategicMove();
                }
            }
            
            // Fallback to random
            if (bestCol === -1) {
                bestCol = this.getRandomMove();
            }
            
            if (bestCol !== -1 && bestCol >= 0 && bestCol < this.COLS) {
                const row = this.getLowestEmptyRow(bestCol);
                if (row !== -1) {
                    this.dropPiece(row, bestCol);
                }
            }
        } catch (error) {
            console.error('Error in aiMove:', error);
            // Fallback to random move on error
            const fallbackCol = this.getRandomMove();
            if (fallbackCol !== -1) {
                const row = this.getLowestEmptyRow(fallbackCol);
                if (row !== -1) {
                    this.dropPiece(row, fallbackCol);
                }
            }
        }
    }

    getRandomMove() {
        const availableCols = [];
        for (let col = 0; col < this.COLS; col++) {
            if (this.getLowestEmptyRow(col) !== -1) {
                availableCols.push(col);
            }
        }
        return availableCols.length > 0 
            ? availableCols[Math.floor(Math.random() * availableCols.length)] 
            : -1;
    }

    getStrategicMove() {
        // Priority 1: Try to win
        for (let col = 0; col < this.COLS; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.state.connect4.gameBoard[row][col] = 2;
                if (this.checkWinForPlayer(row, col, 2)) {
                    this.state.connect4.gameBoard[row][col] = 0;
                    return col;
                }
                this.state.connect4.gameBoard[row][col] = 0;
            }
        }
        
        // Priority 2: Block player from winning
        for (let col = 0; col < this.COLS; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.state.connect4.gameBoard[row][col] = 1;
                if (this.checkWinForPlayer(row, col, 1)) {
                    this.state.connect4.gameBoard[row][col] = 0;
                    return col;
                }
                this.state.connect4.gameBoard[row][col] = 0;
            }
        }
        
        // Priority 3: Play center columns
        const centerCols = [3, 2, 4, 1, 5, 0, 6];
        for (let col of centerCols) {
            if (this.getLowestEmptyRow(col) !== -1) {
                return col;
            }
        }
        
        return -1;
    }

    checkWinForPlayer(row, col, player) {
        const directions = [
            [[0, 1], [0, -1]], // Horizontal
            [[1, 0], [-1, 0]], // Vertical
            [[1, 1], [-1, -1]], // Diagonal /
            [[1, -1], [-1, 1]]  // Diagonal \
        ];
        
        for (let direction of directions) {
            let count = 1;
            
            for (let [dx, dy] of direction) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (this.isValidPosition(newRow, newCol) && 
                       this.state.connect4.gameBoard[newRow][newCol] === player) {
                    count++;
                    newRow += dx;
                    newCol += dy;
                }
            }
            
            if (count >= this.WINNING_LENGTH) return true;
        }
        return false;
    }

    // Minimax algorithm for hard AI with optimizations
    getMinimaxMove(depth) {
        let bestScore = -Infinity;
        let bestCol = -1;
        
        // Clear transposition table if too large
        if (this.transpositionTable.size > 10000) {
            this.transpositionTable.clear();
        }
        
        // Prioritize center columns first
        const columnOrder = [3, 2, 4, 1, 5, 0, 6];
        
        for (let col of columnOrder) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.state.connect4.gameBoard[row][col] = 2;
                
                // Create board hash for transposition table
                const boardHash = this.getBoardHash();
                let score;
                
                if (this.transpositionTable.has(boardHash)) {
                    score = this.transpositionTable.get(boardHash);
                } else {
                    score = this.minimax(depth - 1, false, -Infinity, Infinity);
                    this.transpositionTable.set(boardHash, score);
                }
                
                this.state.connect4.gameBoard[row][col] = 0;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestCol = col;
                }
            }
        }
        
        return bestCol;
    }

    getBoardHash() {
        // Create simple hash of board state
        return this.state.connect4.gameBoard.flat().join('');
    }

    minimax(depth, isMaximizing, alpha, beta) {
        // Check for terminal states (win conditions)
        // Check entire board for wins
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.state.connect4.gameBoard[row][col] === 2) {
                    if (this.checkWinForPlayer(row, col, 2)) {
                        return 1000 + depth;
                    }
                }
                if (this.state.connect4.gameBoard[row][col] === 1) {
                    if (this.checkWinForPlayer(row, col, 1)) {
                        return -1000 - depth;
                    }
                }
            }
        }
        
        if (depth === 0 || this.isBoardFull()) {
            return this.evaluateBoard();
        }
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let col = 0; col < this.COLS; col++) {
                const row = this.getLowestEmptyRow(col);
                if (row !== -1) {
                    this.state.connect4.gameBoard[row][col] = 2;
                    const score = this.minimax(depth - 1, false, alpha, beta);
                    this.state.connect4.gameBoard[row][col] = 0;
                    maxScore = Math.max(score, maxScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let col = 0; col < this.COLS; col++) {
                const row = this.getLowestEmptyRow(col);
                if (row !== -1) {
                    this.state.connect4.gameBoard[row][col] = 1;
                    const score = this.minimax(depth - 1, true, alpha, beta);
                    this.state.connect4.gameBoard[row][col] = 0;
                    minScore = Math.min(score, minScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
            }
            return minScore;
        }
    }

    evaluateBoard() {
        let score = 0;
        
        // Center column preference
        const centerCol = 3;
        for (let row = 0; row < this.ROWS; row++) {
            if (this.state.connect4.gameBoard[row][centerCol] === 2) {
                score += 4;
            }
        }
        
        // Evaluate all possible 4-in-a-row combinations
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.state.connect4.gameBoard[row][col] !== 0) {
                    // Check all directions
                    if (col <= 3) {
                        score += this.evaluateLine([
                            this.state.connect4.gameBoard[row][col],
                            this.state.connect4.gameBoard[row][col + 1],
                            this.state.connect4.gameBoard[row][col + 2],
                            this.state.connect4.gameBoard[row][col + 3]
                        ]);
                    }
                    if (row <= 2) {
                        score += this.evaluateLine([
                            this.state.connect4.gameBoard[row][col],
                            this.state.connect4.gameBoard[row + 1][col],
                            this.state.connect4.gameBoard[row + 2][col],
                            this.state.connect4.gameBoard[row + 3][col]
                        ]);
                    }
                    if (row <= 2 && col <= 3) {
                        score += this.evaluateLine([
                            this.state.connect4.gameBoard[row][col],
                            this.state.connect4.gameBoard[row + 1][col + 1],
                            this.state.connect4.gameBoard[row + 2][col + 2],
                            this.state.connect4.gameBoard[row + 3][col + 3]
                        ]);
                    }
                    if (row >= 3 && col <= 3) {
                        score += this.evaluateLine([
                            this.state.connect4.gameBoard[row][col],
                            this.state.connect4.gameBoard[row - 1][col + 1],
                            this.state.connect4.gameBoard[row - 2][col + 2],
                            this.state.connect4.gameBoard[row - 3][col + 3]
                        ]);
                    }
                }
            }
        }
        
        return score;
    }

    evaluateLine(line) {
        let aiCount = 0;
        let playerCount = 0;
        let empty = 0;
        
        for (let cell of line) {
            if (cell === 2) aiCount++;
            else if (cell === 1) playerCount++;
            else empty++;
        }
        
        // If both players have pieces, line is not useful
        if (aiCount > 0 && playerCount > 0) return 0;
        
        // Scoring
        if (aiCount === 4) return 10000;
        if (aiCount === 3 && empty === 1) return 1000;
        if (aiCount === 2 && empty === 2) return 5;
        if (aiCount === 1 && empty === 3) return 1;
        
        if (playerCount === 4) return -10000;
        if (playerCount === 3 && empty === 1) return -1000;
        if (playerCount === 2 && empty === 2) return -5;
        if (playerCount === 1 && empty === 3) return -1;
        
        return 0;
    }

    // Animation and visual effects
    createRippleEffect(cell) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        cell.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    createSparkleEffect(cell) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                cell.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    createFireworks() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = Math.random() * 100 + '%';
                firework.style.top = Math.random() * 100 + '%';
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                document.body.appendChild(firework);
                
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 1000);
            }, i * 200);
        }
    }

    // Event setup
    setupEventListeners() {
        // Game mode buttons
        const playerModeBtn = document.getElementById('playerMode');
        const aiModeBtn = document.getElementById('aiMode');
        const resetBtn = document.getElementById('resetGame');
        
        if (playerModeBtn) {
            playerModeBtn.addEventListener('click', () => this.setGameMode('player'));
        }
        if (aiModeBtn) {
            aiModeBtn.addEventListener('click', () => this.setGameMode('ai'));
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Difficulty buttons
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const btn = document.getElementById(`${difficulty}Difficulty`);
            if (btn) {
                btn.addEventListener('click', () => this.setDifficulty(difficulty));
            }
        });
    }

    setGameMode(mode) {
        this.state.setGameMode(mode);
        this.reset();
        this.updateModeButtons();
    }

    setDifficulty(difficulty) {
        this.state.setAIDifficulty(difficulty);
        this.updateDifficultyButtons();
    }

    updateModeButtons() {
        const playerBtn = document.getElementById('playerMode');
        const aiBtn = document.getElementById('aiMode');
        
        if (playerBtn && aiBtn) {
            playerBtn.classList.toggle('active', this.state.connect4.gameMode === 'player');
            aiBtn.classList.toggle('active', this.state.connect4.gameMode === 'ai');
        }
    }

    updateDifficultyButtons() {
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const btn = document.getElementById(`${difficulty}Difficulty`);
            if (btn) {
                btn.classList.toggle('active', this.state.connect4.aiDifficulty === difficulty);
            }
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Connect4Game;
} else if (typeof window !== 'undefined') {
    window.Connect4Game = Connect4Game;
}