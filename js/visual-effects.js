/**
 * Visual Effects System
 * Handles animations, particles, and visual enhancements
 */

class VisualEffects {
    constructor() {
        this.isInitialized = false;
        this.particles = [];
        this.animationFrame = null;
        this.particlePool = null;
        this.maxParticles = 50; // Limit for performance
        this.isPageVisible = true;
        this.domCache = PerformanceUtils.createDOMCache();
        
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (!this.isPageVisible) {
                this.pauseEffects();
            } else {
                this.resumeEffects();
            }
        });
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.initializeParticlePool();
        this.startBackgroundEffects();
        this.injectStyles();
        this.isInitialized = true;
    }

    initializeParticlePool() {
        // Create object pool for particles
        this.particlePool = PerformanceUtils.createObjectPool(
            () => document.createElement('div'),
            (element) => {
                element.className = '';
                element.style.cssText = '';
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            },
            20
        );
    }

    startBackgroundEffects() {
        if (!this.isPageVisible) return;
        
        // Use throttled versions for better performance
        const throttledParticle = PerformanceUtils.throttle(() => {
            if (this.particles.length < this.maxParticles) {
                this.createFloatingParticle();
            }
        }, 3000);
        
        const throttledSparkle = PerformanceUtils.throttle(() => {
            if (this.particles.length < this.maxParticles) {
                this.createSparkle();
            }
        }, 1500);
        
        const throttledAurora = PerformanceUtils.throttle(() => {
            this.createAuroraWave();
        }, 8000);
        
        // Start intervals
        setInterval(throttledParticle, 3000);
        setInterval(throttledSparkle, 1500);
        setInterval(throttledAurora, 8000);
    }

    createFloatingParticle() {
        if (!this.isPageVisible || this.particles.length >= this.maxParticles) return;
        
        const particle = this.particlePool.acquire();
        particle.className = 'floating-particle';
        
        // Random properties
        const size = Math.random() * 6 + 2;
        const x = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 15;
        
        // Use transform for better performance
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
            border-radius: 50%;
            left: ${x}px;
            bottom: -10px;
            pointer-events: none;
            z-index: 1;
            will-change: transform;
            animation: float-up ${duration}s linear forwards;
        `;
        
        document.body.appendChild(particle);
        this.particles.push(particle);
        
        setTimeout(() => {
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
            this.particlePool.release(particle);
        }, duration * 1000);
    }

    createSparkle() {
        if (!this.isPageVisible || document.querySelectorAll('.sparkle-global').length > 10) return;
        
        const sparkle = this.particlePool.acquire();
        sparkle.className = 'sparkle-global';
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 4 + 2;
        
        sparkle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 2;
            will-change: transform, opacity;
            animation: sparkle-twinkle 2s ease-in-out forwards;
            box-shadow: 0 0 ${size * 2}px rgba(255,255,255,0.8);
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            this.particlePool.release(sparkle);
        }, 2000);
    }

    createAuroraWave() {
        const aurora = document.createElement('div');
        aurora.className = 'aurora-wave';
        
        const colors = [
            'rgba(64, 224, 208, 0.3)',
            'rgba(147, 112, 219, 0.3)',
            'rgba(255, 105, 180, 0.3)',
            'rgba(0, 191, 255, 0.3)'
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const width = Math.random() * 300 + 200;
        const height = Math.random() * 100 + 50;
        
        aurora.style.cssText = `
            position: fixed;
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(45deg, ${randomColor}, transparent);
            border-radius: 50%;
            left: ${Math.random() * (window.innerWidth - width)}px;
            top: ${Math.random() * (window.innerHeight - height)}px;
            pointer-events: none;
            z-index: 0;
            animation: aurora-drift 8s ease-in-out;
            filter: blur(2px);
        `;
        
        document.body.appendChild(aurora);
        
        setTimeout(() => {
            if (aurora.parentNode) {
                aurora.parentNode.removeChild(aurora);
            }
        }, 8000);
    }

    createLightningEffect(col) {
        const gameBoard = document.getElementById('gameBoard');
        if (!gameBoard) return;
        
        const lightning = document.createElement('div');
        lightning.className = 'lightning-effect';
        
        const cellWidth = gameBoard.offsetWidth / 7;
        const x = col * cellWidth + cellWidth / 2;
        
        lightning.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: 0;
            width: 2px;
            height: 100%;
            background: linear-gradient(to bottom, 
                rgba(255,255,255,1) 0%,
                rgba(135,206,250,0.8) 50%,
                transparent 100%);
            pointer-events: none;
            z-index: 10;
            animation: lightning-strike 0.3s ease-out;
        `;
        
        gameBoard.appendChild(lightning);
        
        setTimeout(() => {
            if (lightning.parentNode) {
                lightning.parentNode.removeChild(lightning);
            }
        }, 300);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            left: 50%;
            top: 50%;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    createWinningCellEffect(cell) {
        // Add winning glow
        cell.classList.add('winning-cell');
        
        // Create sparkles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'cell-sparkle';
                
                sparkle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: gold;
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                    animation: sparkle-fade 1s ease-out;
                `;
                
                cell.style.position = 'relative';
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
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createFirework(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 200);
        }
    }

    createFirework(color) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 200) + 100;
        
        firework.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(firework);
        
        // Create explosion effect
        setTimeout(() => {
            this.createExplosion(firework, color);
        }, 100);
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 1500);
    }

    createExplosion(center, color) {
        const particles = 12;
        const centerRect = center.getBoundingClientRect();
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const angle = (360 / particles) * i;
            const velocity = Math.random() * 100 + 50;
            
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                left: ${centerRect.left + 4}px;
                top: ${centerRect.top + 4}px;
                pointer-events: none;
                z-index: 1001;
                animation: explode-${angle} 1s ease-out forwards;
            `;
            
            // Create dynamic animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes explode-${angle} {
                    to {
                        transform: translate(
                            ${Math.cos(angle * Math.PI / 180) * velocity}px,
                            ${Math.sin(angle * Math.PI / 180) * velocity}px
                        );
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) particle.parentNode.removeChild(particle);
                if (style.parentNode) style.parentNode.removeChild(style);
            }, 1000);
        }
    }

    // Inject required CSS animations
    injectStyles() {
        if (document.getElementById('visual-effects-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'visual-effects-styles';
        style.textContent = `
            @keyframes float-up {
                0% {
                    bottom: -10px;
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    bottom: 100vh;
                    opacity: 0;
                }
            }
            
            @keyframes sparkle-twinkle {
                0%, 100% {
                    opacity: 0;
                    transform: scale(0);
                }
                50% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes aurora-drift {
                0% {
                    opacity: 0;
                    transform: translateX(-50px) rotate(0deg);
                }
                50% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateX(50px) rotate(10deg);
                }
            }
            
            @keyframes lightning-strike {
                0% {
                    opacity: 0;
                    transform: scaleY(0);
                }
                50% {
                    opacity: 1;
                    transform: scaleY(1);
                }
                100% {
                    opacity: 0;
                }
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes sparkle-fade {
                0% {
                    opacity: 1;
                    transform: scale(0) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(1) rotate(180deg);
                }
            }
            
            .winning-cell {
                position: relative;
                animation: winning-pulse 1s ease-in-out infinite;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.8) !important;
            }
            
            @keyframes winning-pulse {
                0%, 100% {
                    transform: scale(1);
                    filter: brightness(1);
                }
                50% {
                    transform: scale(1.1);
                    filter: brightness(1.3);
                }
            }
            
            .drop-animation {
                animation: piece-drop 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes piece-drop {
                0% {
                    transform: translateY(-300px);
                }
                70% {
                    transform: translateY(10px);
                }
                100% {
                    transform: translateY(0);
                }
            }
            
            .cell.hover {
                transform: scale(1.1);
                transition: transform 0.2s ease;
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
        `;
        
        document.head.appendChild(style);
    }

    // Utility methods
    clearAllEffects() {
        // Remove all particles and effects
        const effects = document.querySelectorAll('.floating-particle, .sparkle-global, .aurora-wave, .lightning-effect, .ripple-effect, .firework, .firework-particle');
        effects.forEach(effect => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        });
    }

    pauseEffects() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    resumeEffects() {
        this.startBackgroundEffects();
    }
}

// Export singleton instance
const visualEffects = new VisualEffects();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = visualEffects;
} else if (typeof window !== 'undefined') {
    window.visualEffects = visualEffects;
}