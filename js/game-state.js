/**
 * Game State Management
 * Centralized state management for all games
 */

class GameState {
    constructor() {
        // Connect 4 Game State
        this.connect4 = {
            currentPlayer: 1,
            gameBoard: Array(6).fill().map(() => Array(7).fill(0)),
            gameMode: 'player', // 'player' or 'ai'
            aiDifficulty: 'medium', // 'easy', 'medium', 'hard'
            gameEnded: false,
            scores: { player1: 0, player2: 0 },
            dropAnimation: null,
            winningCells: []
        };

        // AI Settings
        this.aiSettings = {
            easy: {
                name: 'Easy',
                randomMoveChance: 0.7,
                lookAheadDepth: 1,
                description: 'Makes mostly random moves'
            },
            medium: {
                name: 'Medium', 
                randomMoveChance: 0.3,
                lookAheadDepth: 3,
                description: 'Strategic with occasional mistakes'
            },
            hard: {
                name: 'Hard',
                randomMoveChance: 0.0,
                lookAheadDepth: 7,
                description: 'Advanced minimax algorithm with deeper search and improved evaluation'
            }
        };

        // Sound State
        this.audio = {
            soundEnabled: true,
            audioContext: null,
            backgroundMusicPlaying: false
        };

        // Maze Game State
        this.maze = {
            grid: [],
            playerPos: { x: 1, y: 1 },
            aiPos: { x: 23, y: 18 },
            resources: [],
            exitPos: { x: 23, y: 18 },
            scores: { player: 0, ai: 0 }
        };

        // Kids Games State
        this.kidsGames = {
            currentGame: '',
            score: 0,
            level: 1,
            gameData: {},
            
            // Memory Game
            memory: {
                cards: [],
                flippedCards: [],
                matchedPairs: 0
            },
            
            // Pattern Game
            pattern: {
                sequence: [],
                playerSequence: [],
                step: 0,
                isShowing: false
            },
            
            // Math Game
            math: {
                question: {},
                streak: 0
            },
            
            // Word Game
            word: {
                currentWord: '',
                letters: [],
                foundWords: []
            }
        };
    }

    // Connect 4 State Methods
    resetConnect4() {
        this.connect4.currentPlayer = 1;
        this.connect4.gameBoard = Array(6).fill().map(() => Array(7).fill(0));
        this.connect4.gameEnded = false;
        this.connect4.winningCells = [];
        this.connect4.dropAnimation = null;
    }

    setGameMode(mode) {
        this.connect4.gameMode = mode;
    }

    setAIDifficulty(difficulty) {
        this.connect4.aiDifficulty = difficulty;
    }

    // Kids Games State Methods
    resetKidsGame(gameType) {
        if (!this.kidsGames[gameType]) return;
        
        this.kidsGames.currentGame = gameType;
        this.kidsGames.score = 0;
        this.kidsGames.level = 1;
        
        // Reset specific game data
        switch (gameType) {
            case 'memory':
                this.kidsGames.memory = {
                    cards: [],
                    flippedCards: [],
                    matchedPairs: 0
                };
                break;
            case 'pattern':
                this.kidsGames.pattern = {
                    sequence: [],
                    playerSequence: [],
                    step: 0,
                    isShowing: false
                };
                break;
            case 'math':
                this.kidsGames.math = {
                    question: {},
                    streak: 0
                };
                break;
            case 'word':
                this.kidsGames.word = {
                    currentWord: '',
                    letters: [],
                    foundWords: []
                };
                break;
        }
    }

    // Audio State Methods
    toggleSound() {
        this.audio.soundEnabled = !this.audio.soundEnabled;
        return this.audio.soundEnabled;
    }

    setAudioContext(context) {
        this.audio.audioContext = context;
    }

    // Maze State Methods
    resetMaze() {
        this.maze.playerPos = { x: 1, y: 1 };
        this.maze.resources = [];
        this.maze.scores = { player: 0, ai: 0 };
    }
}

// Export singleton instance
const gameState = new GameState();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameState;
} else if (typeof window !== 'undefined') {
    window.gameState = gameState;
}