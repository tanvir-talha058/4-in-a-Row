/**
 * Brain Games Collection
 * Interactive brain development and cognitive training games
 */

class BrainGamesManager {
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
        } catch (error) {
            console.error('Failed to initialize Memory Match:', error);
        }
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

    // ==================== MATH CHALLENGE GAME ====================
    
    initializeMathChallenge() {
        const gameContainer = document.getElementById('mathAdventureGame');
        if (!gameContainer) return;

        this.state.resetKidsGame('math');
        this.state.kidsGames.math.streak = 0;
        this.state.kidsGames.math.timeLeft = 30;
        this.state.kidsGames.math.correct = 0;
        this.state.kidsGames.math.total = 0;

        this.generateMathQuestion();
        this.startMathTimer();
        this.setupMathListeners();
        this.updateMathDisplay();
    }

    generateMathQuestion() {
        const level = this.state.kidsGames.level;
        const maxNum = Math.min(10 + level * 5, 100);
        
        const num1 = Math.floor(Math.random() * maxNum) + 1;
        const num2 = Math.floor(Math.random() * maxNum) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let answer;
        let questionText;
        
        switch (operation) {
            case '+':
                answer = num1 + num2;
                questionText = `${num1} + ${num2}`;
                break;
            case '-':
                const larger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                answer = larger - smaller;
                questionText = `${larger} - ${smaller}`;
                break;
            case '*':
                answer = num1 * num2;
                questionText = `${num1} × ${num2}`;
                break;
        }
        
        this.state.kidsGames.math.question = {
            text: questionText,
            answer: answer,
            options: this.generateMathOptions(answer)
        };
        
        this.updateMathQuestion();
    }

    generateMathOptions(correctAnswer) {
        const options = [correctAnswer];
        while (options.length < 4) {
            const wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
            if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    }

    updateMathQuestion() {
        const questionEl = document.getElementById('mathQuestion');
        const optionsEl = document.getElementById('mathOptions');
        
        if (questionEl) {
            questionEl.textContent = `${this.state.kidsGames.math.question.text} = ?`;
        }
        
        if (optionsEl) {
            optionsEl.innerHTML = '';
            this.state.kidsGames.math.question.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'math-option-btn';
                btn.textContent = option;
                btn.onclick = () => this.checkMathAnswer(option);
                optionsEl.appendChild(btn);
            });
        }
    }

    checkMathAnswer(selectedAnswer) {
        const correct = selectedAnswer === this.state.kidsGames.math.question.answer;
        this.state.kidsGames.math.total++;
        
        const feedbackEl = document.getElementById('mathFeedback');
        
        if (correct) {
            this.state.kidsGames.math.correct++;
            this.state.kidsGames.math.streak++;
            this.state.kidsGames.score += 10 * this.state.kidsGames.math.streak;
            this.audio.playSuccessSound();
            this.effects.createSparkleEffect(feedbackEl || document.body);
            
            if (feedbackEl) {
                feedbackEl.textContent = `✅ Correct! +${10 * this.state.kidsGames.math.streak} points`;
                feedbackEl.className = 'math-feedback success';
            }
            
            setTimeout(() => {
                this.generateMathQuestion();
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'math-feedback';
                }
            }, 1000);
        } else {
            this.state.kidsGames.math.streak = 0;
            this.audio.playErrorSound();
            
            if (feedbackEl) {
                feedbackEl.textContent = `❌ Wrong! The answer was ${this.state.kidsGames.math.question.answer}`;
                feedbackEl.className = 'math-feedback error';
            }
            
            setTimeout(() => {
                this.generateMathQuestion();
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'math-feedback';
                }
            }, 2000);
        }
        
        this.updateMathDisplay();
        
        if (window.progressTracker) {
            window.progressTracker.updateGameScore('mathAdventure', correct ? 10 : 0);
        }
    }

    startMathTimer() {
        if (this.mathTimerInterval) {
            clearInterval(this.mathTimerInterval);
        }
        
        this.mathTimerInterval = setInterval(() => {
            this.state.kidsGames.math.timeLeft--;
            this.updateMathDisplay();
            
            if (this.state.kidsGames.math.timeLeft <= 0) {
                this.endMathGame();
            }
        }, 1000);
    }

    updateMathDisplay() {
        const scoreEl = document.getElementById('mathScore');
        const levelEl = document.getElementById('mathLevel');
        const streakEl = document.getElementById('mathStreak');
        const timeEl = document.getElementById('mathTime');
        const timerBarEl = document.getElementById('mathTimerBar');
        
        if (scoreEl) scoreEl.textContent = this.state.kidsGames.score;
        if (levelEl) levelEl.textContent = this.state.kidsGames.level;
        if (streakEl) streakEl.textContent = this.state.kidsGames.math.streak;
        if (timeEl) timeEl.textContent = `${this.state.kidsGames.math.timeLeft}s`;
        if (timerBarEl) {
            timerBarEl.style.width = `${(this.state.kidsGames.math.timeLeft / 30) * 100}%`;
        }
    }

    endMathGame() {
        clearInterval(this.mathTimerInterval);
        const accuracy = this.state.kidsGames.math.total > 0 
            ? Math.round((this.state.kidsGames.math.correct / this.state.kidsGames.math.total) * 100)
            : 0;
        
        alert(`Time's up! 🎉\n\nScore: ${this.state.kidsGames.score}\nCorrect: ${this.state.kidsGames.math.correct}/${this.state.kidsGames.math.total}\nAccuracy: ${accuracy}%`);
        
        if (window.gameController) {
            window.gameController.showBrainGames();
        }
    }

    setupMathListeners() {
        // Already set up in updateMathQuestion
    }

    // ==================== NUMBER SEQUENCE GAME ====================
    
    initializeNumberSequence() {
        const gameContainer = document.getElementById('numberSequenceGame');
        if (!gameContainer) return;

        this.state.resetKidsGame('logic');
        this.generateSequence();
        this.setupSequenceListeners();
        this.updateSequenceDisplay();
    }

    generateSequence() {
        const level = this.state.kidsGames.level;
        const sequenceTypes = ['arithmetic', 'geometric', 'fibonacci', 'square'];
        const type = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)];
        
        let sequence = [];
        let nextNumber;
        
        switch (type) {
            case 'arithmetic':
                const diff = Math.floor(Math.random() * 5) + 2;
                const start = Math.floor(Math.random() * 10) + 1;
                sequence = [start, start + diff, start + diff * 2, start + diff * 3];
                nextNumber = start + diff * 4;
                break;
            case 'geometric':
                const ratio = Math.floor(Math.random() * 3) + 2;
                const gStart = Math.floor(Math.random() * 5) + 1;
                sequence = [gStart, gStart * ratio, gStart * ratio * ratio, gStart * ratio * ratio * ratio];
                nextNumber = gStart * ratio * ratio * ratio * ratio;
                break;
            case 'fibonacci':
                sequence = [1, 1, 2, 3];
                nextNumber = 5;
                break;
            case 'square':
                const base = Math.floor(Math.random() * 5) + 1;
                sequence = [base * base, (base + 1) * (base + 1), (base + 2) * (base + 2), (base + 3) * (base + 3)];
                nextNumber = (base + 4) * (base + 4);
                break;
        }
        
        this.state.kidsGames.sequence = {
            numbers: sequence,
            answer: nextNumber,
            type: type
        };
    }

    updateSequenceDisplay() {
        const displayEl = document.getElementById('sequenceDisplay');
        if (displayEl) {
            displayEl.innerHTML = `
                <div class="sequence-numbers">
                    ${this.state.kidsGames.sequence.numbers.map((num, i) => 
                        `<span class="sequence-number">${num}</span>`
                    ).join('')}
                    <span class="sequence-number missing">?</span>
                </div>
            `;
        }
    }

    setupSequenceListeners() {
        const inputEl = document.getElementById('sequenceInput');
        const submitBtn = document.querySelector('.sequence-submit');
        
        if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
            inputEl.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.checkSequence();
                }
            };
        }
        
        if (submitBtn) {
            submitBtn.onclick = () => this.checkSequence();
        }
    }

    checkSequence() {
        const inputEl = document.getElementById('sequenceInput');
        const feedbackEl = document.getElementById('sequenceFeedback');
        
        if (!inputEl || !inputEl.value) return;
        
        const guess = parseInt(inputEl.value);
        const correct = guess === this.state.kidsGames.sequence.answer;
        
        if (correct) {
            this.state.kidsGames.score += 20;
            this.audio.playSuccessSound();
            this.effects.createFireworks();
            
            if (feedbackEl) {
                feedbackEl.textContent = '✅ Correct! Great pattern recognition!';
                feedbackEl.className = 'sequence-feedback success';
            }
            
            if (window.progressTracker) {
                window.progressTracker.updateGameScore('numberSequence', 20);
            }
            
            setTimeout(() => {
                this.state.kidsGames.level++;
                this.generateSequence();
                this.updateSequenceDisplay();
                if (inputEl) inputEl.value = '';
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'sequence-feedback';
                }
            }, 2000);
        } else {
            this.audio.playErrorSound();
            
            if (feedbackEl) {
                feedbackEl.textContent = `❌ Wrong! The answer was ${this.state.kidsGames.sequence.answer}`;
                feedbackEl.className = 'sequence-feedback error';
            }
            
            setTimeout(() => {
                if (inputEl) inputEl.value = '';
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'sequence-feedback';
                }
            }, 2000);
        }
        
        this.updateSequenceDisplay();
    }

    // ==================== COLOR MATCH GAME ====================
    
    initializeColorMatch() {
        const gameContainer = document.getElementById('colorMatchGame');
        if (!gameContainer) return;

        this.state.resetKidsGame('reaction');
        this.state.kidsGames.colorMatch = {
            score: 0,
            correct: 0,
            total: 0,
            timeLeft: 60
        };
        
        this.generateColorTarget();
        this.startColorTimer();
        this.updateColorDisplay();
    }

    generateColorTarget() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const shapes = ['circle', 'square', 'triangle'];
        
        const targetColor = colors[Math.floor(Math.random() * colors.length)];
        const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        this.state.kidsGames.colorMatch.target = {
            color: targetColor,
            shape: targetShape
        };
        
        // Generate options
        const options = [{ color: targetColor, shape: targetShape }];
        while (options.length < 4) {
            const option = {
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)]
            };
            if (!options.some(opt => opt.color === option.color && opt.shape === option.shape)) {
                options.push(option);
            }
        }
        
        this.state.kidsGames.colorMatch.options = options.sort(() => Math.random() - 0.5);
        this.updateColorDisplay();
    }

    updateColorDisplay() {
        const targetEl = document.getElementById('targetShape');
        const optionsEl = document.getElementById('colorOptions');
        
        if (targetEl && this.state.kidsGames.colorMatch.target) {
            targetEl.className = `target-shape ${this.state.kidsGames.colorMatch.target.shape}`;
            targetEl.style.backgroundColor = this.state.kidsGames.colorMatch.target.color;
        }
        
        if (optionsEl && this.state.kidsGames.colorMatch.options) {
            optionsEl.innerHTML = '';
            this.state.kidsGames.colorMatch.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = `color-option ${option.shape}`;
                btn.style.backgroundColor = option.color;
                btn.onclick = () => this.checkColorMatch(option);
                optionsEl.appendChild(btn);
            });
        }
        
        const scoreEl = document.getElementById('colorScore');
        const timeEl = document.getElementById('colorTime');
        const accuracyEl = document.getElementById('colorAccuracy');
        
        if (scoreEl) scoreEl.textContent = this.state.kidsGames.colorMatch.score;
        if (timeEl) timeEl.textContent = `${this.state.kidsGames.colorMatch.timeLeft}s`;
        if (accuracyEl) {
            const accuracy = this.state.kidsGames.colorMatch.total > 0
                ? Math.round((this.state.kidsGames.colorMatch.correct / this.state.kidsGames.colorMatch.total) * 100)
                : 100;
            accuracyEl.textContent = `${accuracy}%`;
        }
    }

    checkColorMatch(selected) {
        const target = this.state.kidsGames.colorMatch.target;
        const correct = selected.color === target.color && selected.shape === target.shape;
        
        this.state.kidsGames.colorMatch.total++;
        
        if (correct) {
            this.state.kidsGames.colorMatch.correct++;
            this.state.kidsGames.colorMatch.score += 10;
            this.audio.playSuccessSound();
        } else {
            this.audio.playErrorSound();
        }
        
        this.generateColorTarget();
        this.updateColorDisplay();
        
        if (window.progressTracker) {
            window.progressTracker.updateGameScore('colorMatch', correct ? 10 : 0);
        }
    }

    startColorTimer() {
        if (this.colorTimerInterval) {
            clearInterval(this.colorTimerInterval);
        }
        
        this.colorTimerInterval = setInterval(() => {
            this.state.kidsGames.colorMatch.timeLeft--;
            this.updateColorDisplay();
            
            if (this.state.kidsGames.colorMatch.timeLeft <= 0) {
                this.endColorGame();
            }
        }, 1000);
    }

    endColorGame() {
        clearInterval(this.colorTimerInterval);
        const accuracy = this.state.kidsGames.colorMatch.total > 0
            ? Math.round((this.state.kidsGames.colorMatch.correct / this.state.kidsGames.colorMatch.total) * 100)
            : 0;
        
        alert(`Time's up! 🎉\n\nScore: ${this.state.kidsGames.colorMatch.score}\nCorrect: ${this.state.kidsGames.colorMatch.correct}/${this.state.kidsGames.colorMatch.total}\nAccuracy: ${accuracy}%`);
        
        if (window.gameController) {
            window.gameController.showBrainGames();
        }
    }

    // ==================== UTILITY METHODS ====================
    
    updateKidsScore() {
        const scoreEls = document.querySelectorAll('.kids-score-value, .brain-score-value');
        scoreEls.forEach(el => {
            el.textContent = this.state.kidsGames.score;
        });
        
        const levelEls = document.querySelectorAll('.kids-level-value, .brain-level-value');
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
        } else if (gameType === 'math') {
            this.initializeMathChallenge();
        } else if (gameType === 'logic') {
            this.initializeNumberSequence();
        } else if (gameType === 'reaction') {
            this.initializeColorMatch();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrainGamesManager;
} else if (typeof window !== 'undefined') {
    window.BrainGamesManager = BrainGamesManager;
}