/**
 * Progress Tracker
 * Tracks user progress, achievements, and statistics
 */

class ProgressTracker {
    constructor() {
        this.storageKey = 'brainBoostProgress';
        this.progress = this.loadProgress();
        this.initializeDefaults();
    }

    initializeDefaults() {
        if (!this.progress.games) {
            this.progress = {
                totalScore: 0,
                gamesPlayed: 0,
                level: 1,
                games: {},
                achievements: [],
                lastPlayed: null
            };
            this.saveProgress();
        }
    }

    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error loading progress:', e);
            return {};
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    startGame(gameType) {
        if (!this.progress.games[gameType]) {
            this.progress.games[gameType] = {
                played: 0,
                score: 0,
                level: 1,
                bestScore: 0,
                progress: 0
            };
        }
        this.progress.games[gameType].played++;
        this.progress.gamesPlayed++;
        this.progress.lastPlayed = gameType;
        this.saveProgress();
    }

    updateGameScore(gameType, score) {
        if (!this.progress.games[gameType]) {
            this.startGame(gameType);
        }
        
        this.progress.games[gameType].score += score;
        this.progress.totalScore += score;
        
        if (score > this.progress.games[gameType].bestScore) {
            this.progress.games[gameType].bestScore = score;
        }
        
        // Calculate progress (0-100%)
        const maxLevel = 20;
        this.progress.games[gameType].level = Math.min(
            Math.floor(this.progress.games[gameType].score / 100) + 1,
            maxLevel
        );
        this.progress.games[gameType].progress = Math.min(
            (this.progress.games[gameType].score % 100),
            100
        );
        
        // Update overall level
        const totalProgress = Object.values(this.progress.games)
            .reduce((sum, game) => sum + game.progress, 0);
        const gameCount = Object.keys(this.progress.games).length;
        this.progress.level = Math.floor(totalProgress / (gameCount * 100)) + 1;
        
        this.checkAchievements(gameType, score);
        this.saveProgress();
    }

    checkAchievements(gameType, score) {
        const achievements = this.getAchievementDefinitions();
        achievements.forEach(achievement => {
            if (this.progress.achievements.includes(achievement.id)) {
                return; // Already unlocked
            }
            
            let unlocked = false;
            
            switch (achievement.id) {
                case 'first_game':
                    unlocked = this.progress.gamesPlayed >= 1;
                    break;
                case 'score_100':
                    unlocked = this.progress.totalScore >= 100;
                    break;
                case 'score_500':
                    unlocked = this.progress.totalScore >= 500;
                    break;
                case 'score_1000':
                    unlocked = this.progress.totalScore >= 1000;
                    break;
                case 'level_5':
                    unlocked = this.progress.level >= 5;
                    break;
                case 'level_10':
                    unlocked = this.progress.level >= 10;
                    break;
                case 'memory_master':
                    unlocked = this.progress.games.memoryMatch?.level >= 10;
                    break;
                case 'math_wizard':
                    unlocked = this.progress.games.mathAdventure?.level >= 10;
                    break;
                case 'word_expert':
                    unlocked = this.progress.games.wordScramble?.level >= 10;
                    break;
                case 'all_games':
                    unlocked = Object.keys(this.progress.games).length >= 6;
                    break;
            }
            
            if (unlocked) {
                this.progress.achievements.push(achievement.id);
                this.showAchievementNotification(achievement);
            }
        });
    }

    getAchievementDefinitions() {
        return [
            { id: 'first_game', name: 'First Steps', icon: '🎯', description: 'Play your first game', unlocked: false },
            { id: 'score_100', name: 'Getting Started', icon: '⭐', description: 'Reach 100 total points', unlocked: false },
            { id: 'score_500', name: 'Rising Star', icon: '🌟', description: 'Reach 500 total points', unlocked: false },
            { id: 'score_1000', name: 'Brain Master', icon: '🏆', description: 'Reach 1000 total points', unlocked: false },
            { id: 'level_5', name: 'Level Up', icon: '📈', description: 'Reach level 5', unlocked: false },
            { id: 'level_10', name: 'Expert', icon: '💎', description: 'Reach level 10', unlocked: false },
            { id: 'memory_master', name: 'Memory Master', icon: '🧩', description: 'Reach level 10 in Memory Match', unlocked: false },
            { id: 'math_wizard', name: 'Math Wizard', icon: '🔢', description: 'Reach level 10 in Math Challenge', unlocked: false },
            { id: 'word_expert', name: 'Word Expert', icon: '📝', description: 'Reach level 10 in Word Scramble', unlocked: false },
            { id: 'all_games', name: 'Explorer', icon: '🗺️', description: 'Play all available games', unlocked: false }
        ];
    }

    getAchievements() {
        const definitions = this.getAchievementDefinitions();
        return definitions.map(achievement => ({
            ...achievement,
            unlocked: this.progress.achievements.includes(achievement.id),
            date: this.progress.achievements.includes(achievement.id) 
                ? new Date().toLocaleDateString() 
                : null
        }));
    }

    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-notification-icon">${achievement.icon}</div>
                <div class="achievement-notification-text">
                    <div class="achievement-notification-title">Achievement Unlocked!</div>
                    <div class="achievement-notification-name">${achievement.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    getGameProgress() {
        return this.progress.games || {};
    }

    getOverallStats() {
        return {
            totalScore: this.progress.totalScore || 0,
            gamesPlayed: this.progress.gamesPlayed || 0,
            level: this.progress.level || 1,
            progress: Math.min(
                (Object.values(this.progress.games || {}).reduce((sum, game) => sum + game.progress, 0) / 
                 (Object.keys(this.progress.games || {}).length * 100)) * 100 || 0,
                100
            )
        };
    }

    resetProgress() {
        this.progress = {
            totalScore: 0,
            gamesPlayed: 0,
            level: 1,
            games: {},
            achievements: [],
            lastPlayed: null
        };
        this.saveProgress();
    }
}

// Export singleton instance
const progressTracker = new ProgressTracker();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = progressTracker;
} else if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
    window.progressTracker = progressTracker;
}

