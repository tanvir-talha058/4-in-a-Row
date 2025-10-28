/**
 * Audio System
 * Handles all sound effects and audio functionality
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundEnabled = true;
        this.backgroundMusicPlaying = false;
        this.soundCache = new Map(); // Cache sound buffers
        this.maxConcurrentSounds = 5;
        this.activeSounds = 0;
        this.initialize();
    }

    initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (window.gameState) {
                window.gameState.setAudioContext(this.audioContext);
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    createSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.soundEnabled || !this.audioContext || this.activeSounds >= this.maxConcurrentSounds) return;
        
        // Use object pooling concept
        this.activeSounds++;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            // Clean up
            oscillator.onended = () => {
                this.activeSounds--;
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (e) {
            this.activeSounds--;
            console.warn('Error creating sound:', e);
        }
    }

    // Game-specific sound effects
    playDropSound() {
        this.createSound(800, 0.1);
        setTimeout(() => this.createSound(600, 0.1), 50);
        setTimeout(() => this.createSound(400, 0.2), 100);
    }

    playHoverSound() {
        this.createSound(200, 0.1, 'sine', 0.05);
    }

    playClickSound() {
        this.createSound(440, 0.1, 'square', 0.1);
    }

    playWinSound() {
        const notes = [262, 330, 392, 523];
        notes.forEach((note, index) => {
            setTimeout(() => this.createSound(note, 0.3, 'triangle', 0.2), index * 150);
        });
    }

    playConnectionSound() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createSound(400 + i * 50, 0.1, 'sine', 0.1), i * 20);
        }
    }

    playSuccessSound() {
        const melody = [523, 659, 784, 1047];
        melody.forEach((note, index) => {
            setTimeout(() => this.createSound(note, 0.2, 'sine', 0.15), index * 100);
        });
    }

    playErrorSound() {
        this.createSound(200, 0.3, 'sawtooth', 0.1);
    }

    playLevelUpSound() {
        const ascending = [262, 330, 392, 523, 659];
        ascending.forEach((note, index) => {
            setTimeout(() => this.createSound(note, 0.2, 'triangle', 0.12), index * 80);
        });
    }

    toggle() {
        this.soundEnabled = !this.soundEnabled;
        
        // Update UI
        const soundIcon = document.getElementById('soundIcon');
        if (soundIcon) {
            soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        if (window.gameState) {
            window.gameState.audio.soundEnabled = this.soundEnabled;
        }
        
        return this.soundEnabled;
    }

    // Utility methods
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    suspend() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }
}

// Export singleton instance
const audioSystem = new AudioSystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = audioSystem;
} else if (typeof window !== 'undefined') {
    window.audioSystem = audioSystem;
}