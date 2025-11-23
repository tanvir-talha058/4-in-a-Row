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

        // Initialize Brain Games Manager
        this.brainGamesManager = new BrainGamesManager(this.gameState, this.audioSystem, this.visualEffects);

        // Initialize progress tracking
        this.progressTracker = window.progressTracker || new ProgressTracker();
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
            'showBrainGames': () => this.showBrainGames(),
            'backToMainFromBrain': () => this.showMenu('main'),
            'backToMainFromConnect4': () => this.showMenu('main'),
            'backToBrainMenu': () => this.showMenu('brain')
        };

        Object.entries(menuButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });

        this.setupEntryMenu();
    }

    setupEntryMenu() {
        const entryCards = document.querySelectorAll('[data-game-entry]');
        entryCards.forEach(card => {
            card.addEventListener('click', () => {
                const target = card.dataset.gameEntry;
                if (!target) return;

                if (target === 'connect4') {
                    this.showConnect4Game();
                } else if (target === 'brainMenu') {
                    this.showBrainGames();
                } else {
                    this.showBrainGame(target);
                }
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key.toLowerCase()) {
                case 'r':
                    if (this.currentMenu === 'connect4' && this.connect4Game) {
                        this.connect4Game.reset();
                    } else if (this.isBrainGameActive()) {
                        resetBrainGame();
                    }
                    break;
                case 'm':
                    this.audioSystem.toggle();
                    this.updateSoundButton(this.audioSystem.soundEnabled);
                    break;
                case 'escape':
                    if (this.currentMenu !== 'main') {
                        this.showMenu('main');
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
            'brain': 'brainGamesMenu'
        };

        const menuId = menuIdMap[menuName] || `${menuName}Menu`;
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = 'block';
            menu.classList.add('menu-fade-in');
        }

        this.currentMenu = menuName;
        this.audioSystem.playClickSound();

        // Update stats on main menu
        if (menuName === 'main') {
            this.updateMainMenuStats();
        }
    }

    updateMainMenuStats() {
        const stats = this.progressTracker.getOverallStats();
        const totalScoreEl = document.getElementById('totalScore');
        const gamesPlayedEl = document.getElementById('gamesPlayed');
        const currentLevelEl = document.getElementById('currentLevel');
        const overallProgressEl = document.getElementById('overallProgress');

        if (totalScoreEl) totalScoreEl.textContent = stats.totalScore || 0;
        if (gamesPlayedEl) gamesPlayedEl.textContent = stats.gamesPlayed || 0;
        if (currentLevelEl) currentLevelEl.textContent = stats.level || 1;
        if (overallProgressEl) {
            overallProgressEl.style.width = `${stats.progress || 0}%`;
            overallProgressEl.textContent = `${stats.progress || 0}%`;
        }
    }

    hideAllMenus() {
        const menus = [
            'mainMenu',
            'brainGamesMenu',
            'connect4Game',
            'kidsGameContainer',
            'memoryMatchGame',
            'simonGame',
            'wordScrambleGame',
            'mathAdventureGame',
            'numberSequenceGame',
            'colorMatchGame'
        ];

        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = 'none';
                menu.classList.remove('menu-fade-in');
            }
        });
    }

    showAchievements() {
        const panel = document.getElementById('achievementsPanel');
        if (panel) {
            panel.style.display = 'block';
            this.updateAchievementsDisplay();
        }
    }

    hideAchievements() {
        const panel = document.getElementById('achievementsPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    updateAchievementsDisplay() {
        const achievements = this.progressTracker.getAchievements();
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementCard.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.unlocked ? `<div class="achievement-date">Unlocked: ${achievement.date}</div>` : ''}
            `;
            grid.appendChild(achievementCard);
        });
    }

    showBrainGames() {
        this.showMenu('brain');
        this.currentMenu = 'brain';
        this.setupCategoryFilter();
        this.updateGameProgress();
    }

    showConnect4Game() {
        this.hideAllMenus();
        const container = document.getElementById('connect4Game');
        if (container) {
            container.style.display = 'block';
            container.classList.add('menu-fade-in');
        }

        if (this.connect4Game && !this.connect4Game.isInitialized) {
            this.connect4Game.initialize();
        } else if (this.connect4Game) {
            this.connect4Game.updateModeButtons();
            this.connect4Game.updateDifficultyButtons();
            this.connect4Game.updatePlayerTurn?.();
        }

        this.currentMenu = 'connect4';
        this.audioSystem.playClickSound();
    }

    setupCategoryFilter() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const category = tab.dataset.category;
                this.filterGamesByCategory(category);
            });
        });
    }

    filterGamesByCategory(category) {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateGameProgress() {
        const progressData = this.progressTracker.getGameProgress();
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameType = card.onclick.toString().match(/'(\w+)'/)?.[1];
            if (gameType && progressData[gameType]) {
                const progress = progressData[gameType].progress || 0;
                const progressBar = card.querySelector('.progress-fill-mini');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        });
    }

    showBrainGame(gameType) {
        this.hideAllMenus();

        // Map game types to container IDs
        const gameTypeMap = {
            'memoryMatch': 'memoryMatchGame',
            'simonGame': 'simonGame',
            'wordScramble': 'wordScrambleGame',
            'mathAdventure': 'mathAdventureGame',
            'numberSequence': 'numberSequenceGame',
            'colorMatch': 'colorMatchGame'
        };

        const containerId = gameTypeMap[gameType] || `${gameType}Game`;
        const gameContainer = document.getElementById(containerId);
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }

        this.currentMenu = gameType;
        this.audioSystem.playClickSound();

        // Initialize specific brain game
        this.initializeBrainGame(gameType);
    }

    initializeBrainGame(gameType) {
        // Map game types to state keys
        const stateKeyMap = {
            'memoryMatch': 'memory',
            'simonGame': 'pattern',
            'wordScramble': 'word',
            'mathAdventure': 'math',
            'numberSequence': 'logic',
            'colorMatch': 'reaction'
        };

        const stateKey = stateKeyMap[gameType] || gameType;
        this.gameState.resetKidsGame(stateKey);

        // Track game start
        this.progressTracker.startGame(gameType);

        switch (gameType) {
            case 'memoryMatch':
                this.brainGamesManager.initializeMemoryMatch();
                break;
            case 'simonGame':
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

        isBrainGameActive() {
            return ['memoryMatch', 'simonGame', 'wordScramble', 'mathAdventure', 'numberSequence', 'colorMatch'].includes(this.currentMenu);
        }

        isGameActive() {
            return this.currentMenu === 'connect4' || this.isBrainGameActive();
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

function resetBrainGame() {
    if (window.gameController && window.gameController.brainGamesManager) {
        window.gameController.brainGamesManager.resetCurrentGame();
    }
}

function goToBrainMenu() {
    if (window.gameController) {
        window.gameController.showBrainGames();
    }
}

function goToMenu() {
    goToMainMenu();
}

function resetKidsGame() {
    resetBrainGame();
}

function goToKidsMenu() {
    goToBrainMenu();
}

function resetGame() {
    if (window.gameController && window.gameController.connect4Game) {
        window.gameController.connect4Game.resetGame();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
} else if (typeof window !== 'undefined') {
    window.GameController = GameController;
}