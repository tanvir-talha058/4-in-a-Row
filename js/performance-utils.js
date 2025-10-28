/**
 * Performance Optimization Utilities
 * Debounce, throttle, and other performance helpers
 */

class PerformanceUtils {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Request Animation Frame based throttle
     * @param {Function} func - Function to throttle
     * @returns {Function} RAF throttled function
     */
    static rafThrottle(func) {
        let rafId = null;
        return function(...args) {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, args);
                    rafId = null;
                });
            }
        };
    }

    /**
     * Memoize function results
     * @param {Function} func - Function to memoize
     * @returns {Function} Memoized function
     */
    static memoize(func) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    /**
     * Lazy load images
     * @param {HTMLImageElement} img - Image element
     */
    static lazyLoadImage(img) {
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        } else {
            // Fallback for browsers that don't support lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        observer.unobserve(image);
                    }
                });
            });
            observer.observe(img);
        }
    }

    /**
     * Batch DOM updates
     * @param {Function} callback - Function containing DOM updates
     */
    static batchDOMUpdate(callback) {
        requestAnimationFrame(() => {
            callback();
        });
    }

    /**
     * Memory-efficient array operations
     * @param {Array} array - Array to process
     * @param {Function} callback - Processing function
     * @param {number} chunkSize - Size of each chunk
     */
    static processArrayInChunks(array, callback, chunkSize = 100) {
        let index = 0;
        
        function processChunk() {
            const chunk = array.slice(index, index + chunkSize);
            chunk.forEach(callback);
            index += chunkSize;
            
            if (index < array.length) {
                requestAnimationFrame(processChunk);
            }
        }
        
        processChunk();
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Efficient event delegation
     * @param {HTMLElement} parent - Parent element
     * @param {string} selector - Child selector
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     */
    static delegateEvent(parent, selector, eventType, handler) {
        parent.addEventListener(eventType, (event) => {
            const target = event.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, event);
            }
        });
    }

    /**
     * Object pool for reusing objects
     */
    static createObjectPool(createFn, resetFn, initialSize = 10) {
        const pool = [];
        
        // Initialize pool
        for (let i = 0; i < initialSize; i++) {
            pool.push(createFn());
        }
        
        return {
            acquire() {
                return pool.length > 0 ? pool.pop() : createFn();
            },
            release(obj) {
                resetFn(obj);
                pool.push(obj);
            },
            clear() {
                pool.length = 0;
            }
        };
    }

    /**
     * Cancel all ongoing animations
     */
    static cancelAnimations(animationIds) {
        animationIds.forEach(id => cancelAnimationFrame(id));
        animationIds.length = 0;
    }

    /**
     * Measure performance
     * @param {string} name - Performance marker name
     * @param {Function} callback - Function to measure
     */
    static async measurePerformance(name, callback) {
        const startMark = `${name}-start`;
        const endMark = `${name}-end`;
        
        performance.mark(startMark);
        await callback();
        performance.mark(endMark);
        
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        
        // Clean up
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(name);
    }

    /**
     * Cache DOM queries
     */
    static createDOMCache() {
        const cache = new Map();
        
        return {
            get(selector) {
                if (!cache.has(selector)) {
                    cache.set(selector, document.querySelector(selector));
                }
                return cache.get(selector);
            },
            getAll(selector) {
                if (!cache.has(selector)) {
                    cache.set(selector, Array.from(document.querySelectorAll(selector)));
                }
                return cache.get(selector);
            },
            clear() {
                cache.clear();
            },
            remove(selector) {
                cache.delete(selector);
            }
        };
    }

    /**
     * Optimize CSS animations
     */
    static optimizeAnimation(element) {
        element.style.willChange = 'transform, opacity';
        element.style.transform = 'translateZ(0)'; // Force GPU acceleration
        
        // Remove will-change after animation
        element.addEventListener('animationend', () => {
            element.style.willChange = 'auto';
        }, { once: true });
    }

    /**
     * Reduce memory leaks by cleaning up event listeners
     */
    static createEventBus() {
        const listeners = new Map();
        
        return {
            on(event, callback) {
                if (!listeners.has(event)) {
                    listeners.set(event, []);
                }
                listeners.get(event).push(callback);
            },
            off(event, callback) {
                if (listeners.has(event)) {
                    const callbacks = listeners.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            },
            emit(event, data) {
                if (listeners.has(event)) {
                    listeners.get(event).forEach(callback => callback(data));
                }
            },
            clear() {
                listeners.clear();
            }
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceUtils;
} else if (typeof window !== 'undefined') {
    window.PerformanceUtils = PerformanceUtils;
}