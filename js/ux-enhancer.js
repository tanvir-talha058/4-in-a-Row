/**
 * UX Enhancement Module
 * Improves user experience with feedback, tooltips, and helpful messages
 */

class UXEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLoadingStates();
        this.setupTooltips();
        this.setupKeyboardNavigation();
        this.setupErrorHandling();
        this.addHelpfulMessages();
    }

    /**
     * Show loading state on buttons
     */
    setupLoadingStates() {
        const addLoadingState = (button) => {
            button.addEventListener('click', function() {
                if (!this.disabled) {
                    this.classList.add('loading');
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 500);
                }
            });
        };

        document.querySelectorAll('.menu-btn, .control-btn, .game-card').forEach(addLoadingState);
    }

    /**
     * Setup keyboard navigation for accessibility
     */
    setupKeyboardNavigation() {
        // Allow Enter key to activate game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // ESC key to go back
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const backBtn = document.querySelector('.back-btn:not([style*="display: none"])');
                if (backBtn) {
                    backBtn.click();
                }
            }
        });
    }

    /**
     * Add helpful tooltips
     */
    setupTooltips() {
        const tooltips = {
            'soundToggle': 'Toggle game sounds on/off',
            'playerMode': 'Play with a friend locally',
            'aiMode': 'Play against computer AI',
            'easyDifficulty': 'AI makes random moves',
            'mediumDifficulty': 'AI plays strategically with mistakes',
            'hardDifficulty': 'AI uses advanced algorithms'
        };

        Object.entries(tooltips).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('title')) {
                element.setAttribute('title', text);
                element.setAttribute('aria-label', text);
            }
        });
    }

    /**
     * Global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Game error:', e.error);
            this.showUserFriendlyError();
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showUserFriendlyError();
        });
    }

    /**
     * Show user-friendly error message
     */
    showUserFriendlyError() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'user-error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <strong>Oops!</strong> Something went wrong.
                    <br>Please refresh the page to continue.
                </div>
                <button onclick="location.reload()" class="error-btn">
                    Refresh Page
                </button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .user-error-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--surface, white);
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 400px;
                text-align: center;
            }
            .error-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .error-text {
                color: var(--text-primary, #0f172a);
                margin-bottom: 1.5rem;
                line-height: 1.6;
            }
            .error-btn {
                padding: 0.75rem 2rem;
                background: var(--primary, #6366f1);
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .error-btn:hover {
                transform: translateY(-2px);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);
    }

    /**
     * Add helpful messages throughout the app
     */
    addHelpfulMessages() {
        // Add first-time user tips
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setTimeout(() => {
                this.showWelcomeMessage();
                localStorage.setItem('hasVisited', 'true');
            }, 1000);
        }
    }

    /**
     * Show welcome message for first-time users
     */
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-notification';
        welcomeDiv.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">👋</div>
                <h3>Welcome to 4-in-a-Row Games!</h3>
                <p>Choose a game mode to get started. Click the sound icon to toggle audio.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="welcome-btn">
                    Got it!
                </button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .welcome-notification {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--surface, white);
                padding: 1.5rem;
                border-radius: 1rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-width: 320px;
                animation: slideInUp 0.5s ease;
            }
            .welcome-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            .welcome-content h3 {
                color: var(--text-primary, #0f172a);
                font-size: 1.125rem;
                margin-bottom: 0.5rem;
            }
            .welcome-content p {
                color: var(--text-secondary, #475569);
                font-size: 0.9375rem;
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            .welcome-btn {
                width: 100%;
                padding: 0.625rem;
                background: var(--primary, #6366f1);
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .welcome-btn:hover {
                transform: translateY(-2px);
            }
            @keyframes slideInUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @media (max-width: 768px) {
                .welcome-notification {
                    left: 1rem;
                    right: 1rem;
                    bottom: 1rem;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(welcomeDiv);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (welcomeDiv.parentElement) {
                welcomeDiv.style.animation = 'slideInUp 0.5s ease reverse';
                setTimeout(() => welcomeDiv.remove(), 500);
            }
        }, 8000);
    }

    /**
     * Show success notification
     */
    static showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .success-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: #10b981;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-icon {
                font-size: 1.25rem;
                font-weight: bold;
            }
            .notification-text {
                font-weight: 500;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @media (max-width: 768px) {
                .success-notification {
                    left: 1rem;
                    right: 1rem;
                    top: 1rem;
                }
            }
        `;
        
        if (!document.querySelector('#success-notification-styles')) {
            style.id = 'success-notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Improve button feedback
     */
    static addButtonFeedback(button, message) {
        const originalText = button.textContent;
        button.textContent = message;
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }
}

// Initialize UX enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uxEnhancer = new UXEnhancer();
    });
} else {
    window.uxEnhancer = new UXEnhancer();
}

// Export for use in other modules
window.UXEnhancer = UXEnhancer;
