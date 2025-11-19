/**
 * Kids Games Collection
 * Implementation of educational games for children
 */

class KidsGamesManager {
    constructor(gameState, audioSystem, visualEffects) {
        this.state = gameState;
        this.audio = audioSystem;
        this.effects = visualEffects;
        this.domCache = PerformanceUtils.createDOMCache();
        this.throttledUpdate = PerformanceUtils.throttle(() => this.updateKidsScore(), 100);
    }

    // ==================== MEMORY MATCH GAME ====================
    
    initializeMemoryMatch() {
        try {
            const gameContainer = this.domCache.get('#memoryMatchGame');
            if (!gameContainer) {
                console.error('Memory Match game container not found');
                return;
            }

            const gridContainer = gameContainer.querySelector('.memory-grid');
            if (!gridContainer) {
                console.error('Memory grid container not found');
                return;
            }

            // Reset state
            this.state.resetKidsGame('memory');

            // Get difficulty based on level
            const level = this.state.kidsGames.level;
            const pairCount = Math.min(8 + Math.floor(level / 2), 16);
            
            // Create card symbols
            const allSymbols = ['🌟', '🎈', '🎮', '🎨', '🎪', '🎭', '🎯', '🎲', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎥'];
            const symbols = allSymbols.slice(0, pairCount);
            const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            gridContainer.className = `memory-grid grid-${pairCount * 2}`;
            
            cards.forEach((symbol, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.symbol = symbol;
                card.dataset.index = index;
                
                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front">?</div>
                        <div class="card-back">${symbol}</div>
                    </div>
                `;
                
                card.addEventListener('click', () => this.handleMemoryCardClick(card), { passive: true });
                fragment.appendChild(card);
            });
            
            gridContainer.innerHTML = '';
            gridContainer.appendChild(fragment);
            
            this.state.kidsGames.memory.cards = cards;
            this.state.kidsGames.memory.totalPairs = pairCount;
            this.throttledUpdate();
    }

    handleMemoryCardClick(card) {
        if (card.classList.contains('flipped') || 
            card.classList.contains('matched') ||
            this.state.kidsGames.memory.flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        this.audio.playClickSound();
        
        const flippedCards = this.state.kidsGames.memory.flippedCards;
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            setTimeout(() => this.checkMemoryMatch(), 600);
        }
    }

    checkMemoryMatch() {
        const flippedCards = this.state.kidsGames.memory.flippedCards;
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            // Match!
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.audio.playSuccessSound();
            this.effects.createSparkleEffect(card1);
            this.effects.createSparkleEffect(card2);
            
            this.state.kidsGames.memory.matchedPairs++;
            this.state.kidsGames.score += 10;
            
            // Check if game is complete
            if (this.state.kidsGames.memory.matchedPairs === this.state.kidsGames.memory.totalPairs) {
                setTimeout(() => this.handleKidsGameWin('Memory Match'), 500);
            }
        } else {
            // No match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.audio.playErrorSound();
        }
        
        this.state.kidsGames.memory.flippedCards = [];
        this.updateKidsScore();
    }

    // ==================== SIMON GAME (PATTERN MEMORY) ====================
    
    initializeSimonGame() {
        const gameContainer = document.getElementById('simonGame');
        if (!gameContainer) return;

        // Reset state
        this.state.resetKidsGame('pattern');
        
        const level = this.state.kidsGames.level;
        const sequenceLength = 3 + Math.floor(level / 2);
        
        const sequence = this.generateSimonSequence(sequenceLength);
        this.state.kidsGames.pattern.sequence = sequence;
        this.state.kidsGames.pattern.playerSequence = [];
        this.state.kidsGames.pattern.currentStep = 0;
        
        // Setup button listeners
        this.setupSimonButtons();
        
        // Update UI
        this.updateKidsScore();
        const messageEl = gameContainer.querySelector('.simon-message');
        if (messageEl) {
            messageEl.textContent = 'Watch the pattern...';
        }
        
        // Show pattern after a delay
        setTimeout(() => this.showSimonPattern(), 1000);
    }

    generateSimonSequence(length) {
        const colors = ['red', 'blue', 'green', 'yellow'];
        return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
    }

    setupSimonButtons() {
        const buttons = document.querySelectorAll('.simon-button');
        buttons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', () => {
                if (!this.state.kidsGames.pattern.isShowing) {
                    this.handleSimonButtonClick(newButton.dataset.color);
                }
            });
        });
    }

    showSimonPattern() {
        const sequence = this.state.kidsGames.pattern.sequence;
        this.state.kidsGames.pattern.isShowing = true;
        
        const frequencies = { red: 329.63, blue: 261.63, green: 293.66, yellow: 349.23 };
        
        sequence.forEach((color, index) => {
            setTimeout(() => {
                const button = document.querySelector(`.simon-button[data-color="${color}"]`);
                if (button) {
                    button.classList.add('active', 'lit');
                    this.audio.createSound(frequencies[color], 0.4, 'sine', 0.15);
                    
                    setTimeout(() => {
                        button.classList.remove('active', 'lit');
                        
                        if (index === sequence.length - 1) {
                            this.state.kidsGames.pattern.isShowing = false;
                            const messageEl = document.querySelector('.simon-message');
                            if (messageEl) {
                                messageEl.textContent = 'Your turn! Repeat the pattern.';
                            }
                        }
                    }, 400);
                }
            }, index * 800);
        });
    }

    handleSimonButtonClick(color) {
        const button = document.querySelector(`.simon-button[data-color="${color}"]`);
        if (button) {
            button.classList.add('active');
            const frequencies = { red: 329.63, blue: 261.63, green: 293.66, yellow: 349.23 };
            this.audio.createSound(frequencies[color], 0.2, 'sine', 0.15);
            
            setTimeout(() => button.classList.remove('active'), 200);
        }
        
        const playerSequence = this.state.kidsGames.pattern.playerSequence;
        const correctSequence = this.state.kidsGames.pattern.sequence;
        const currentStep = playerSequence.length;
        
        playerSequence.push(color);
        
        // Check if the move is correct
        if (color !== correctSequence[currentStep]) {
            // Wrong move!
            this.audio.playErrorSound();
            const messageEl = document.querySelector('.simon-message');
            if (messageEl) {
                messageEl.textContent = '❌ Wrong! Try again...';
            }
            
            setTimeout(() => {
                this.state.kidsGames.pattern.playerSequence = [];
                this.showSimonPattern();
            }, 1500);
            return;
        }
        
        // Check if sequence is complete
        if (playerSequence.length === correctSequence.length) {
            // Success!
            this.audio.playSuccessSound();
            this.state.kidsGames.score += 20;
            this.updateKidsScore();
            
            const messageEl = document.querySelector('.simon-message');
            if (messageEl) {
                messageEl.textContent = '✅ Perfect! Get ready for next pattern...';
            }
            
            setTimeout(() => {
                this.state.kidsGames.pattern.playerSequence = [];
                const newLength = correctSequence.length + 1;
                
                if (newLength > 10) {
                    this.handleKidsGameWin('Simon Game');
                } else {
                    const newSequence = this.generateSimonSequence(newLength);
                    this.state.kidsGames.pattern.sequence = newSequence;
                    this.showSimonPattern();
                }
            }, 2000);
        }
    }

    // ==================== WORD SCRAMBLE GAME ====================
    
    initializeWordScramble() {
        const gameContainer = document.getElementById('wordScrambleGame');
        if (!gameContainer) return;

        // Reset state
        this.state.resetKidsGame('word');
        
        // Word list by difficulty
        const wordLists = {
            easy: ['cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird', 'book', 'ball'],
            medium: ['apple', 'happy', 'music', 'dance', 'smile', 'friend', 'color', 'flower', 'water', 'light'],
            hard: ['elephant', 'butterfly', 'rainbow', 'adventure', 'chocolate', 'computer', 'dinosaur', 'mountain', 'treasure', 'beautiful']
        };
        
        const level = this.state.kidsGames.level;
        let difficulty = 'easy';
        if (level > 5) difficulty = 'hard';
        else if (level > 2) difficulty = 'medium';
        
        const words = wordLists[difficulty];
        const word = words[Math.floor(Math.random() * words.length)];
        
        this.state.kidsGames.word.currentWord = word.toLowerCase();
        this.state.kidsGames.word.scrambledWord = this.scrambleWord(word);
        this.state.kidsGames.word.attempts = 0;
        this.state.kidsGames.word.maxAttempts = 3;
        
        // Update UI
        const scrambledEl = gameContainer.querySelector('.scrambled-word');
        const inputEl = gameContainer.querySelector('.word-input');
        const hintEl = gameContainer.querySelector('.word-hint');
        const attemptsEl = gameContainer.querySelector('.attempts-display');
        
        if (scrambledEl) scrambledEl.textContent = this.state.kidsGames.word.scrambledWord.toUpperCase();
        if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
        }
        if (hintEl) hintEl.textContent = `${word.length} letters`;
        if (attemptsEl) attemptsEl.textContent = `Attempts: ${this.state.kidsGames.word.attempts}/${this.state.kidsGames.word.maxAttempts}`;
        
        this.updateKidsScore();
        this.setupWordScrambleListeners();
    }

    scrambleWord(word) {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const scrambled = arr.join('');
        
        // Make sure it's actually scrambled
        if (scrambled.toLowerCase() === word.toLowerCase() && word.length > 3) {
            return this.scrambleWord(word);
        }
        
        return scrambled;
    }

    setupWordScrambleListeners() {
        const submitBtn = document.querySelector('.word-submit');
        const inputEl = document.querySelector('.word-input');
        const skipBtn = document.querySelector('.word-skip');
        const hintBtn = document.querySelector('.word-hint-btn');
        
        if (submitBtn) {
            const newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);
            newBtn.addEventListener('click', () => this.checkWordScramble());
        }
        
        if (inputEl) {
            const newInput = inputEl.cloneNode(true);
            inputEl.parentNode.replaceChild(newInput, inputEl);
            newInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkWordScramble();
                }
            });
        }
        
        if (skipBtn) {
            const newSkipBtn = skipBtn.cloneNode(true);
            skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
            newSkipBtn.addEventListener('click', () => this.initializeWordScramble());
        }
        
        if (hintBtn) {
            const newHintBtn = hintBtn.cloneNode(true);
            hintBtn.parentNode.replaceChild(newHintBtn, hintBtn);
            newHintBtn.addEventListener('click', () => this.showWordHint());
        }
    }

    showWordHint() {
        const word = this.state.kidsGames.word.currentWord;
        const hintEl = document.querySelector('.word-hint');
        
        if (hintEl) {
            const firstLetter = word[0].toUpperCase();
            const lastLetter = word[word.length - 1].toUpperCase();
            hintEl.textContent = `Hint: Starts with "${firstLetter}", ends with "${lastLetter}"`;
            this.audio.playClickSound();
        }
    }

    checkWordScramble() {
        const inputEl = document.querySelector('.word-input');
        const messageEl = document.querySelector('.word-message');
        const attemptsEl = document.querySelector('.attempts-display');
        
        if (!inputEl || !inputEl.value.trim()) {
            this.audio.playErrorSound();
            if (messageEl) messageEl.textContent = 'Please enter a word!';
            return;
        }
        
        const guess = inputEl.value.toLowerCase().trim();
        const correctWord = this.state.kidsGames.word.currentWord;
        
        this.state.kidsGames.word.attempts++;
        
        if (guess === correctWord) {
            // Correct!
            this.audio.playSuccessSound();
            this.effects.createFireworks();
            
            const points = 15 * (this.state.kidsGames.word.maxAttempts - this.state.kidsGames.word.attempts + 1);
            this.state.kidsGames.score += points;
            this.updateKidsScore();
            
            if (messageEl) {
                messageEl.textContent = `🎉 Correct! +${points} points`;
                messageEl.className = 'word-message success';
            }
            
            setTimeout(() => {
                if (this.state.kidsGames.score >= 100) {
                    this.handleKidsGameWin('Word Scramble');
                } else {
                    this.initializeWordScramble();
                }
            }, 2000);
        } else {
            // Wrong
            this.audio.playErrorSound();
            
            if (this.state.kidsGames.word.attempts >= this.state.kidsGames.word.maxAttempts) {
                if (messageEl) {
                    messageEl.textContent = `❌ The word was "${correctWord.toUpperCase()}"`;
                    messageEl.className = 'word-message error';
                }
                
                setTimeout(() => this.initializeWordScramble(), 3000);
            } else {
                if (messageEl) {
                    messageEl.textContent = '❌ Try again!';
                    messageEl.className = 'word-message error';
                }
                
                if (attemptsEl) {
                    attemptsEl.textContent = `Attempts: ${this.state.kidsGames.word.attempts}/${this.state.kidsGames.word.maxAttempts}`;
                }
                
                inputEl.value = '';
                inputEl.focus();
            }
        }
    }

    // ==================== UTILITY METHODS ====================
    
    updateKidsScore() {
        const scoreEls = document.querySelectorAll('.kids-score-value');
        scoreEls.forEach(el => {
            el.textContent = this.state.kidsGames.score;
        });
        
        const levelEls = document.querySelectorAll('.kids-level-value');
        levelEls.forEach(el => {
            el.textContent = this.state.kidsGames.level;
        });
    }

    handleKidsGameWin(gameName) {
        this.audio.playLevelUpSound();
        this.effects.createFireworks();
        
        setTimeout(() => {
            const message = `🎉 Congratulations!\n\nYou completed ${gameName}!\n\nScore: ${this.state.kidsGames.score}\nLevel: ${this.state.kidsGames.level}`;
            alert(message);
            
            this.state.kidsGames.level++;
            this.state.kidsGames.score = 0;
            
            // Restart the game at new level
            const gameType = this.state.kidsGames.currentGame;
            if (gameType === 'memory') this.initializeMemoryMatch();
            else if (gameType === 'pattern') this.initializeSimonGame();
            else if (gameType === 'word') this.initializeWordScramble();
        }, 1000);
    }

    resetCurrentGame() {
        const gameType = this.state.kidsGames.currentGame;
        this.state.kidsGames.score = 0;
        
        if (gameType === 'memory') {
            this.initializeMemoryMatch();
        } else if (gameType === 'pattern') {
            this.initializeSimonGame();
        } else if (gameType === 'word') {
            this.initializeWordScramble();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KidsGamesManager;
} else if (typeof window !== 'undefined') {
    window.KidsGamesManager = KidsGamesManager;
}