'kiwi public';

/**
 * Simple event emitter for headless client
 * Provides event-based API without Vue dependencies
 */
export default class EventEmitter {
    constructor() {
        this._events = Object.create(null);
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     * @returns {Function} Unsubscribe function
     */
    on(event, listener) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(listener);

        // Return unsubscribe function
        return () => {
            this.off(event, listener);
        };
    }

    /**
     * Register a one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     */
    once(event, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler
     */
    off(event, listener) {
        if (!this._events[event]) {
            return;
        }

        const index = this._events[event].indexOf(listener);
        if (index > -1) {
            this._events[event].splice(index, 1);
        }

        if (this._events[event].length === 0) {
            delete this._events[event];
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     */
    emit(event, ...args) {
        if (!this._events[event]) {
            return;
        }

        // Create a copy of listeners to avoid issues if listeners are removed during emit
        const listeners = [...this._events[event]];
        listeners.forEach((listener) => {
            try {
                listener(...args);
            } catch (error) {
                // Emit error event if handler throws
                if (event !== 'error') {
                    this.emit('error', error, event);
                }
            }
        });
    }

    /**
     * Remove all listeners for an event, or all events
     * @param {string} [event] - Event name (optional)
     */
    removeAllListeners(event) {
        if (event) {
            delete this._events[event];
        } else {
            this._events = Object.create(null);
        }
    }

    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Function[]} Array of listeners
     */
    listeners(event) {
        return this._events[event] ? [...this._events[event]] : [];
    }
}
