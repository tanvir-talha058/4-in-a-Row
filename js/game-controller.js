/**
 * Main Game Controller
 * Refined and modular game initialization and management
 */

class GameController {
    constructor() {
        this.gameState = null;
        this.audioSystem = null;
        this.visualEffects = null;
        this.connect4Game = null;
        this.currentMenu = 'main';
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize core systems
            await this.initializeSystems();
            
            // Setup event listeners
            this.setupGlobalEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Start the main menu
            this.showMenu('main');
            
            this.isInitialized = true;
            console.log('Game Controller initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
        }
    }

    async initializeSystems() {
        // Initialize game state
        this.gameState = window.gameState || new GameState();
        
        // Initialize audio system
        this.audioSystem = window.audioSystem || new AudioSystem();
        
        // Initialize visual effects
        this.visualEffects = window.visualEffects || new VisualEffects();
        this.visualEffects.initialize();
        
        // Initialize Connect 4 game
        this.connect4Game = new Connect4Game(this.gameState, this.audioSystem);
        
        // Initialize Kids Games Manager
        this.kidsGamesManager = new KidsGamesManager(this.gameState, this.audioSystem, this.visualEffects);
    }

    setupGlobalEventListeners() {
        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                const enabled = this.audioSystem.toggle();
                this.updateSoundButton(enabled);
            });
        }

        // Menu navigation
        this.setupMenuNavigation();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });

        // Handle audio context resume (for browsers that suspend it)
        document.addEventListener('click', () => {
            this.audioSystem.resume();
        }, { once: true });
    }

    setupMenuNavigation() {
        const menuButtons = {
            'showConnect4': () => this.showConnect4Game(),
            'showKidsGames': () => this.showKidsGames(),
            'backToMain': () => this.showMenu('main'),
            'backToKidsMenu': () => this.showMenu('kids')
        };

        Object.entries(menuButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Don't handle shortcuts when typing in inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'r':
                case 'R':
                    if (this.currentMenu === 'connect4') {
                        this.connect4Game.reset();
                    }
                    break;
                case 'm':
                case 'M':
                    this.audioSystem.toggle();
                    break;
                case 'Escape':
                    this.showMenu('main');
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                    if (this.currentMenu === 'connect4') {
                        const col = parseInt(event.key) - 1;
                        this.connect4Game.handleCellClick(col);
                    }
                    break;
            }
        });
    }

    initializeUI() {
        // Update initial UI state
        this.updateSoundButton(this.audioSystem.soundEnabled);
        
        // Initialize difficulty buttons
        if (this.connect4Game) {
            this.connect4Game.updateDifficultyButtons();
            this.connect4Game.updateModeButtons();
        }
    }

    showMenu(menuName) {
        this.hideAllMenus();
        
        // Map menu names to actual IDs
        const menuIdMap = {
            'main': 'mainMenu',
            'kids': 'kidsGamesMenu',
            'connect4': 'connect4Game'
        };
        
        const menuId = menuIdMap[menuName] || `${menuName}Menu`;
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = 'block';
            menu.classList.add('menu-fade-in');
        }
        
        this.currentMenu = menuName;
        this.audioSystem.playClickSound();
    }

    hideAllMenus() {
        const menus = [
            'mainMenu', 
            'connect4Game', 
            'kidsGamesMenu',
            'kidsGameContainer',
            'difficultyMenu',
            'memoryMatchGame',
            'simonGame',
            'wordScrambleGame',
            'patternMasterGame',
            'mathAdventureGame',
            'wordBuilderGame',
            'shapePuzzleGame',
            'colorSymphonyGame'
        ];

        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = 'none';
                menu.classList.remove('menu-fade-in');
            }
        });
    }

    showConnect4Game() {
        this.showMenu('connect4');
        
        // Initialize Connect 4 if not already done
        if (!this.connect4Game.isInitialized) {
            this.connect4Game.initialize();
        }
        
        // Make sure the game board is visible
        const gameContainer = document.getElementById('connect4Game');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        this.currentMenu = 'connect4';
    }

    showKidsGames() {
        this.showMenu('kids');
        this.currentMenu = 'kids';
    }

    showKidsGame(gameType) {
        this.hideAllMenus();
        
        // Map game types to container IDs
        const gameTypeMap = {
            'memoryMatch': 'memoryMatchGame',
            'simonGame': 'simonGame',
            'wordScramble': 'wordScrambleGame',
            'patternMaster': 'patternMasterGame',
            'mathAdventure': 'mathAdventureGame',
            'wordBuilder': 'wordBuilderGame',
            'shapePuzzle': 'shapePuzzleGame',
            'colorSymphony': 'colorSymphonyGame'
        };
        
        const containerId = gameTypeMap[gameType] || `${gameType}Game`;
        const gameContainer = document.getElementById(containerId);
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        this.currentMenu = gameType;
        this.audioSystem.playClickSound();
        
        // Initialize specific kids game
        this.initializeKidsGame(gameType);
    }

    initializeKidsGame(gameType) {
        // Map game types to state keys
        const stateKeyMap = {
            'memoryMatch': 'memory',
            'simonGame': 'pattern',
            'wordScramble': 'word',
            'patternMaster': 'pattern',
            'mathAdventure': 'math',
            'wordBuilder': 'word',
            'shapePuzzle': 'memory',
            'colorSymphony': 'pattern'
        };
        
        const stateKey = stateKeyMap[gameType] || gameType;
        this.gameState.resetKidsGame(stateKey);
        
        switch (gameType) {
            case 'memoryMatch':
                this.kidsGamesManager.initializeMemoryMatch();
                break;
            case 'simonGame':
                this.kidsGamesManager.initializeSimonGame();
                break;
            case 'wordScramble':
                this.kidsGamesManager.initializeWordScramble();
                break;
            case 'patternMaster':
                this.initializePatternGame();
                break;
            case 'mathAdventure':
                this.initializeMathGame();
                break;
            case 'wordBuilder':
                this.showComingSoon('Word Builder');
                break;
            case 'shapePuzzle':
                this.showComingSoon('Shape Puzzle');
                break;
            case 'colorSymphony':
                this.showComingSoon('Color Symphony');
                break;
        }
    }

    // Kids Games Implementation (simplified versions)
    initializeMemoryGame() {
        const gameContainer = document.getElementById('memoryMatchGame');
        if (!gameContainer) return;

        const gridContainer = gameContainer.querySelector('.memory-grid');
        if (!gridContainer) return;

        // Create memory cards
        const symbols = ['🌟', '🎈', '🎮', '🎨', '🎪', '🎭', '🎯', '🎲'];
        const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        
        gridContainer.innerHTML = '';
        
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            
            card.innerHTML = `
                <div class="card-front">?</div>
                <div class="card-back">${symbol}</div>
            `;
            
            card.addEventListener('click', () => this.handleMemoryCardClick(card));
            gridContainer.appendChild(card);
        });
        
        this.gameState.kidsGames.memory.cards = cards;
    }

    handleMemoryCardClick(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        this.audioSystem.playClickSound();
        
        const flippedCards = this.gameState.kidsGames.memory.flippedCards;
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            setTimeout(() => this.checkMemoryMatch(), 600);
        }
    }

    checkMemoryMatch() {
        const flippedCards = this.gameState.kidsGames.memory.flippedCards;
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            // Match!
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.audioSystem.playSuccessSound();
            
            this.gameState.kidsGames.memory.matchedPairs++;
            this.gameState.kidsGames.score += 10;
            
            // Check if game is complete
            if (this.gameState.kidsGames.memory.matchedPairs === 8) {
                this.handleKidsGameWin('Memory Match');
            }
        } else {
            // No match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.audioSystem.playErrorSound();
        }
        
        this.gameState.kidsGames.memory.flippedCards = [];
        this.updateKidsScore();
    }

    initializePatternGame() {
        const sequence = this.generatePatternSequence(3);
        this.gameState.kidsGames.pattern.sequence = sequence;
        this.gameState.kidsGames.pattern.playerSequence = [];
        this.gameState.kidsGames.pattern.step = 0;
        
        this.showPattern();
    }

    generatePatternSequence(length) {
        const colors = ['red', 'blue', 'green', 'yellow'];
        return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
    }

    showPattern() {
        const sequence = this.gameState.kidsGames.pattern.sequence;
        const buttons = document.querySelectorAll('.pattern-button');
        
        this.gameState.kidsGames.pattern.isShowing = true;
        
        sequence.forEach((color, index) => {
            setTimeout(() => {
                const button = document.querySelector(`.pattern-button[data-color="${color}"]`);
                if (button) {
                    button.classList.add('active');
                    this.audioSystem.createSound(200 + index * 50, 0.3);
                    
                    setTimeout(() => {
                        button.classList.remove('active');
                        if (index === sequence.length - 1) {
                            this.gameState.kidsGames.pattern.isShowing = false;
                        }
                    }, 400);
                }
            }, index * 600);
        });
    }

    initializeMathGame() {
        this.generateMathQuestion();
    }

    generateMathQuestion() {
        const level = this.gameState.kidsGames.level;
        const maxNum = Math.min(10 + level * 5, 50);
        
        const num1 = Math.floor(Math.random() * maxNum) + 1;
        const num2 = Math.floor(Math.random() * maxNum) + 1;
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let answer;
        let questionText;
        
        if (operation === '+') {
            answer = num1 + num2;
            questionText = `${num1} + ${num2}`;
        } else {
            // Ensure positive result for subtraction
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            answer = larger - smaller;
            questionText = `${larger} - ${smaller}`;
        }
        
        this.gameState.kidsGames.math.question = {
            text: questionText,
            answer: answer
        };
        
        // Update UI
        const questionEl = document.querySelector('.math-question');
        const answerInput = document.querySelector('.math-answer');
        
        if (questionEl) questionEl.textContent = `${questionText} = ?`;
        if (answerInput) answerInput.value = '';
    }

    handleKidsGameWin(gameName) {
        this.audioSystem.playLevelUpSound();
        this.visualEffects.createFireworks();
        
        // Show win message
        setTimeout(() => {
            alert(`🎉 Congratulations! You completed ${gameName}! 🎉`);
            this.gameState.kidsGames.level++;
            this.showMenu('kids');
        }, 1000);
    }

    updateKidsScore() {
        const scoreEl = document.getElementById('kidsScore');
        if (scoreEl) {
            scoreEl.textContent = this.gameState.kidsGames.score;
        }
    }

    showComingSoon(gameName) {
        const message = `🎮 ${gameName} is coming soon! 🎮\n\nThis exciting game is currently being developed. Stay tuned!`;
        alert(message);
        this.showMenu('kids');
    }

    updateSoundButton(enabled) {
        const soundIcon = document.getElementById('soundIcon');
        if (soundIcon) {
            soundIcon.textContent = enabled ? '🔊' : '🔇';
        }
        
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.title = enabled ? 'Turn Sound Off' : 'Turn Sound On';
        }
    }

    handlePageHidden() {
        // Pause effects when page is hidden
        this.visualEffects.pauseEffects();
        this.audioSystem.suspend();
    }

    handlePageVisible() {
        // Resume effects when page is visible
        this.visualEffects.resumeEffects();
        this.audioSystem.resume();
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Utility methods
    getCurrentGame() {
        return this.currentMenu;
    }

    isGameActive() {
        return ['connect4', 'memoryMatch', 'simonGame', 'wordScramble'].includes(this.currentMenu);
    }
}

// Initialize the game controller when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const gameController = new GameController();
        await gameController.initialize();
        
        // Make it globally accessible for debugging
        window.gameController = gameController;
        
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});

// Global helper functions for inline onclick handlers
function startGame(mode, difficulty) {
    if (window.gameController && window.gameController.connect4Game) {
        window.gameController.connect4Game.startGame(mode, difficulty);
    }
}

function goToMainMenu() {
    if (window.gameController) {
        window.gameController.showMenu('main');
    }
}

function resetKidsGame() {
    if (window.gameController && window.gameController.kidsGamesManager) {
        window.gameController.kidsGamesManager.resetCurrentGame();
    }
}

function goToKidsMenu() {
    if (window.gameController) {
        window.gameController.showKidsGames();
    }
}

function resetGame() {
    if (window.gameController && window.gameController.connect4Game) {
        window.gameController.connect4Game.resetGame();
    }
}

function goToMenu() {
    goToMainMenu();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
} else if (typeof window !== 'undefined') {
    window.GameController = GameController;
}