'kiwi public';

/**
 * Default formatter for headless client
 * Returns plain text without HTML formatting
 */
export class PlainTextFormatter {
    /**
     * Format a message
     * @param {string} type - Message type (privmsg, action, notice, etc.)
     * @param {Object} data - Message data
     * @returns {string} Formatted message
     */
    formatText(type, data) {
        if (type === 'action') {
            return `* ${data.nick || ''} ${data.text || ''}`;
        }
        if (type === 'notice') {
            return `-${data.nick || ''}- ${data.text || ''}`;
        }
        return data.text || '';
    }

    /**
     * Format a user display name
     * @param {Object} user - User object
     * @returns {string} Formatted user name
     */
    formatUser(user) {
        return user.nick || '';
    }

    /**
     * Format a user with full details
     * @param {Object} user - User object
     * @returns {string} Formatted user name with hostname
     */
    formatUserFull(user) {
        if (user.hostname) {
            return `${user.nick || ''}!${user.ident || ''}@${user.hostname}`;
        }
        return user.nick || '';
    }

    /**
     * Translate a key (no-op in plain formatter)
     * @param {string} key - Translation key
     * @param {Object} vars - Variables
     * @returns {string} Translated string (or key if no translation)
     */
    t(key, vars = {}) {
        // Simple template replacement
        let result = key;
        Object.keys(vars).forEach((varKey) => {
            result = result.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
        });
        return result;
    }

    /**
     * Format and translate
     * @param {string} key - Translation key
     * @param {Object} vars - Variables
     * @param {string} fallback - Fallback text
     * @param {Object} fallbackVars - Fallback variables
     * @returns {string} Formatted string
     */
    formatAndT(key, vars, fallback, fallbackVars) {
        return this.t(fallback, fallbackVars);
    }
}
