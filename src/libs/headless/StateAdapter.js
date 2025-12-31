'kiwi public';

/**
 * Default state adapter for headless client
 * Provides minimal state management without Vue dependencies
 */
export default class StateAdapter {
    constructor() {
        this.networks = new Map();
        this.buffers = new Map(); // Map<networkId, Map<bufferName, Buffer>>
        this.users = new Map(); // Map<networkId, Map<nick, User>>
        this.messages = []; // Array of message objects
        this.settings = {};
        this.ui = {
            active_network: null,
            active_buffer: null,
        };
    }

    /**
     * Get or create a network
     * @param {number|string} networkId - Network ID
     * @returns {Object} Network object
     */
    getOrCreateNetwork(networkId) {
        if (!this.networks.has(networkId)) {
            const network = {
                id: networkId,
                name: '',
                state: 'disconnected',
                state_error: '',
                last_error: '',
                nick: '',
                connection: {
                    server: '',
                    port: 6667,
                    tls: false,
                    path: '',
                    password: '',
                    direct: false,
                    encoding: 'utf8',
                    nick: '',
                },
                settings: {},
                buffers: [],
                users: {},
            };
            this.networks.set(networkId, network);
            this.buffers.set(networkId, new Map());
            this.users.set(networkId, new Map());
        }
        return this.networks.get(networkId);
    }

    /**
     * Get a network by ID
     * @param {number|string} networkId - Network ID
     * @returns {Object|null} Network object or null
     */
    getNetwork(networkId) {
        return this.networks.get(networkId) || null;
    }

    /**
     * Get or create a buffer
     * @param {number|string} networkId - Network ID
     * @param {string} bufferName - Buffer name
     * @returns {Object} Buffer object
     */
    getOrAddBufferByName(networkId, bufferName) {
        const network = this.getOrCreateNetwork(networkId);
        const bufferMap = this.buffers.get(networkId);

        const bufferKey = bufferName.toLowerCase();
        if (!bufferMap.has(bufferKey)) {
            const buffer = {
                id: `${networkId}-${bufferName}`,
                networkid: networkId,
                name: bufferName,
                joined: false,
                enabled: true,
                users: {},
                modes: {},
                topic: '',
                topic_by: '',
                topic_when: 0,
                settings: {},
                flags: {},
                latest_messages: [],
            };
            bufferMap.set(bufferKey, buffer);
            network.buffers.push(buffer);
        }

        return bufferMap.get(bufferKey);
    }

    /**
     * Get a buffer by name
     * @param {number|string} networkId - Network ID
     * @param {string} bufferName - Buffer name
     * @returns {Object|null} Buffer object or null
     */
    getBufferByName(networkId, bufferName) {
        const bufferMap = this.buffers.get(networkId);
        if (!bufferMap) {
            return null;
        }
        return bufferMap.get(bufferName.toLowerCase()) || null;
    }

    /**
     * Add a message to a buffer
     * @param {Object} buffer - Buffer object
     * @param {Object} message - Message object
     */
    addMessage(buffer, message) {
        if (!buffer) {
            return;
        }

        const msg = {
            ...message,
            id: `${buffer.id}-${Date.now()}-${Math.random()}`,
            buffer_id: buffer.id,
            networkid: buffer.networkid,
        };

        buffer.latest_messages.push(msg);
        this.messages.push(msg);

        // Keep only last 1000 messages per buffer
        if (buffer.latest_messages.length > 1000) {
            buffer.latest_messages.shift();
        }
    }

    /**
     * Add a message without repeating (for error messages)
     * @param {Object} buffer - Buffer object
     * @param {Object} message - Message object
     */
    addMessageNoRepeat(buffer, message) {
        if (!buffer || !buffer.latest_messages.length) {
            this.addMessage(buffer, message);
            return;
        }

        const lastMsg = buffer.latest_messages[buffer.latest_messages.length - 1];
        if (lastMsg.message !== message.message || lastMsg.type !== message.type) {
            this.addMessage(buffer, message);
        }
    }

    /**
     * Add a user to a network
     * @param {number|string} networkId - Network ID
     * @param {Object} userData - User data
     * @returns {Object} User object
     */
    addUser(networkId, userData) {
        const network = this.getOrCreateNetwork(networkId);
        const userMap = this.users.get(networkId);
        const userKey = (userData.nick || '').toLowerCase();

        if (!userMap.has(userKey)) {
            const user = {
                id: `${networkId}-${userKey}`,
                networkid: networkId,
                nick: userData.nick || '',
                username: userData.username || '',
                host: userData.host || '',
                realname: userData.realname || '',
                away: userData.away || '',
                account: userData.account || '',
                modes: userData.modes || [],
                buffers: {},
            };
            userMap.set(userKey, user);
            network.users[userKey] = user;
        } else {
            // Update existing user
            const user = userMap.get(userKey);
            Object.assign(user, userData);
            // Ensure buffers object exists
            if (!user.buffers) {
                user.buffers = {};
            }
        }

        const user = userMap.get(userKey);
        // Ensure whois and whoFlags exist
        if (user && !user.whois) {
            user.whois = {};
        }
        if (user && !user.whoFlags) {
            user.whoFlags = {};
        }
        return user;
    }

    /**
     * Get a user by nick
     * @param {number|string} networkId - Network ID
     * @param {string} nick - Nickname
     * @returns {Object|null} User object or null
     */
    getUser(networkId, nick) {
        const userMap = this.users.get(networkId);
        if (!userMap) {
            return null;
        }
        return userMap.get(nick.toLowerCase()) || null;
    }

    /**
     * Remove a user from a network
     * @param {number|string} networkId - Network ID
     * @param {Object} userData - User data (must include nick)
     */
    removeUser(networkId, userData) {
        const userMap = this.users.get(networkId);
        if (!userMap) {
            return;
        }
        const userKey = (userData.nick || '').toLowerCase();
        userMap.delete(userKey);

        const network = this.networks.get(networkId);
        if (network) {
            delete network.users[userKey];
        }
    }

    /**
     * Add a user to a buffer
     * @param {Object} buffer - Buffer object
     * @param {Object} userData - User data
     */
    addUserToBuffer(buffer, userData) {
        if (!buffer) {
            return;
        }

        const user = this.addUser(buffer.networkid, userData);
        const userKey = (userData.nick || '').toLowerCase();

        if (!buffer.users[userKey]) {
            buffer.users[userKey] = {
                ...user,
                modes: userData.modes || [],
            };
        } else {
            Object.assign(buffer.users[userKey], userData);
        }

        if (!user.buffers[buffer.id]) {
            user.buffers[buffer.id] = {
                modes: userData.modes || [],
            };
        }
    }

    /**
     * Remove a user from a buffer
     * @param {Object} buffer - Buffer object
     * @param {string} nick - Nickname
     */
    removeUserFromBuffer(buffer, nick) {
        if (!buffer) {
            return;
        }

        const userKey = nick.toLowerCase();
        delete buffer.users[userKey];

        const user = this.getUser(buffer.networkid, nick);
        if (user) {
            delete user.buffers[buffer.id];
        }
    }

    /**
     * Add multiple users to a buffer
     * @param {Object} buffer - Buffer object
     * @param {Array} users - Array of user objects
     */
    addMultipleUsersToBuffer(buffer, users) {
        users.forEach((userData) => {
            this.addUserToBuffer(buffer, userData.user || userData);
        });
    }

    /**
     * Get buffers containing a user
     * @param {number|string} networkId - Network ID
     * @param {string} nick - Nickname
     * @returns {Array} Array of buffer objects
     */
    getBuffersWithUser(networkId, nick) {
        const bufferMap = this.buffers.get(networkId);
        if (!bufferMap) {
            return [];
        }

        const buffers = [];
        bufferMap.forEach((buffer) => {
            if (buffer.users[nick.toLowerCase()]) {
                buffers.push(buffer);
            }
        });

        return buffers;
    }

    /**
     * Change a user's nick
     * @param {number|string} networkId - Network ID
     * @param {string} oldNick - Old nickname
     * @param {string} newNick - New nickname
     */
    changeUserNick(networkId, oldNick, newNick) {
        const userMap = this.users.get(networkId);
        if (!userMap) {
            return;
        }

        const oldKey = oldNick.toLowerCase();
        const newKey = newNick.toLowerCase();
        const user = userMap.get(oldKey);

        if (user) {
            user.nick = newNick;
            userMap.delete(oldKey);
            userMap.set(newKey, user);

            // Update in network.users
            const network = this.networks.get(networkId);
            if (network) {
                delete network.users[oldKey];
                network.users[newKey] = user;
            }

            // Update in all buffers
            const bufferMap = this.buffers.get(networkId);
            if (bufferMap) {
                bufferMap.forEach((buffer) => {
                    if (buffer.users[oldKey]) {
                        buffer.users[newKey] = buffer.users[oldKey];
                        buffer.users[newKey].nick = newNick;
                        delete buffer.users[oldKey];
                    }
                });
            }
        }
    }

    /**
     * Get setting value
     * @param {string} name - Setting name
     * @returns {any} Setting value
     */
    setting(name) {
        return this.settings[name];
    }

    /**
     * Set setting value
     * @param {string} name - Setting name
     * @param {any} value - Setting value
     */
    setSetting(name, value) {
        this.settings[name] = value;
    }

    /**
     * Get active network
     * @returns {Object|null} Active network or null
     */
    getActiveNetwork() {
        if (this.ui.active_network === null) {
            return null;
        }
        return this.getNetwork(this.ui.active_network);
    }

    /**
     * Get active buffer
     * @returns {Object|null} Active buffer or null
     */
    getActiveBuffer() {
        if (this.ui.active_network === null || !this.ui.active_buffer) {
            return null;
        }
        return this.getBufferByName(this.ui.active_network, this.ui.active_buffer);
    }

    /**
     * Set active buffer
     * @param {number|string} networkId - Network ID
     * @param {string} bufferName - Buffer name
     */
    setActiveBuffer(networkId, bufferName) {
        this.ui.active_network = networkId;
        this.ui.active_buffer = bufferName;
    }

    /**
     * Clear message range from buffer (for chathistory)
     * @param {Object} buffer - Buffer object
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    clearMessageRange(buffer, startTime, endTime) {
        if (!buffer) {
            return;
        }

        buffer.latest_messages = buffer.latest_messages.filter((msg) => {
            return !msg.time || msg.time < startTime || msg.time > endTime;
        });
    }

    /**
     * Users transaction - modify users without triggering reactivity
     * @param {number|string} networkId - Network ID
     * @param {Function} fn - Function that receives users object
     */
    usersTransaction(networkId, fn) {
        const network = this.getNetwork(networkId);
        if (!network) {
            return;
        }

        const userMap = this.users.get(networkId);
        if (!userMap) {
            return;
        }

        // Create a plain object copy
        const users = {};
        userMap.forEach((user, key) => {
            users[key.toUpperCase()] = user;
        });

        fn(users);

        // Update back to map
        userMap.clear();
        Object.keys(users).forEach((key) => {
            userMap.set(key.toLowerCase(), users[key]);
        });
        network.users = users;
    }
}
