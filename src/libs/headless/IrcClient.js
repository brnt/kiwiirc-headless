'kiwi public';

import EventEmitter from './EventEmitter';
import StateAdapter from './StateAdapter';
import { PlainTextFormatter } from './Formatter';
import { Events } from './Events';
import * as IrcClientCore from '@/libs/IrcClient';

/**
 * Headless IRC Client
 * Provides a clean API for IRC connections without Vue dependencies
 */
export default class HeadlessIrcClient extends EventEmitter {
    constructor(options = {}) {
        super();

        // Connection options
        this.server = options.server || '';
        this.port = options.port || 6667;
        this.tls = options.tls || false;
        this.path = options.path || '';
        this.password = options.password || '';
        this.nick = options.nick || 'Guest' + Math.floor(Math.random() * 100);
        this.username = options.username || this.nick;
        this.gecos = options.gecos || 'Headless IRC Client';
        this.encoding = options.encoding || 'utf8';
        this.direct = options.direct !== false; // Default to direct connection
        this.autoReconnect = options.autoReconnect !== false;
        this.disconnectOnSaslFail = options.disconnectOnSaslFail || false;

        // Optional dependencies
        this.stateAdapter = options.stateAdapter || new StateAdapter();
        this.formatter = options.formatter || new PlainTextFormatter();
        this.transport = options.transport; // Custom transport factory

        // Internal state
        this.networkId = options.networkId || 1;
        this.network = null;
        this.ircClient = null;
        this.connected = false;
        this.registered = false;

        // Create network in state adapter
        this.network = this.stateAdapter.getOrCreateNetwork(this.networkId);
        this.network.name = options.networkName || 'Network';
        this.network.connection = {
            server: this.server,
            port: this.port,
            tls: this.tls,
            path: this.path,
            password: this.password,
            direct: this.direct,
            encoding: this.encoding,
            nick: this.nick,
        };
        this.network.nick = this.nick;
        this.network.username = this.username;
        this.network.gecos = this.gecos;
        this.network.password = this.password; // Store password for SASL
        this.network.auto_commands = options.autoCommands || '';

        // Apply settings
        if (options.settings) {
            Object.assign(this.stateAdapter.settings, options.settings);
        }

        // Create a minimal state-like object for compatibility with existing IrcClient
        this.state = this.createStateWrapper();
    }

    /**
     * Create a state wrapper that adapts the state adapter to work with existing IrcClient code
     */
    createStateWrapper() {
        const self = this;
        const stateAdapter = this.stateAdapter;
        const network = this.network;

        // Add helper methods to network object
        network.serverBuffer = () => {
            const buffer = stateAdapter.getOrAddBufferByName(self.networkId, '*');
            addBufferHelpers(buffer);
            return buffer;
        };
        network.bufferByName = (name) => {
            const buffer = stateAdapter.getBufferByName(self.networkId, name);
            addBufferHelpers(buffer);
            return buffer;
        };
        network.currentUser = () => stateAdapter.getUser(self.networkId, network.nick);
        network.userByName = (nick) => stateAdapter.getUser(self.networkId, nick);
        network.isChannelName = (name) => self.isChannelName(name);
        network.isNickExemptFromPmBlocks = (nick) => {
            // Simplified version - check if user is an operator
            const user = stateAdapter.getUser(self.networkId, nick);
            if (user && user.whois && user.whois.operator) {
                return true;
            }
            // Check if user is op in any shared channel
            const buffers = stateAdapter.getBuffersWithUser(self.networkId, nick);
            const isOpInAnyBuffer = buffers.some((buffer) => {
                const bufferUser = buffer.users[nick.toLowerCase()];
                return bufferUser && bufferUser.modes && bufferUser.modes.includes('o');
            });
            if (isOpInAnyBuffer) {
                return true;
            }
            return null; // Requires check
        };
        network.setting = (name, val) => {
            if (typeof val !== 'undefined') {
                if (!network.settings) {
                    network.settings = {};
                }
                network.settings[name] = val;
                return val;
            }
            return network.settings ? network.settings[name] : undefined;
        };
        // Add pendingPms array for PM blocking
        if (!network.pendingPms) {
            network.pendingPms = [];
        }

        // Add buffer helper methods
        const addBufferHelpers = (buffer) => {
            if (!buffer) return;
            buffer.isChannel = () => self.isChannelName(buffer.name);
            buffer.isQuery = () => !buffer.isChannel() && buffer.name !== '*';
            buffer.isServer = () => buffer.name === '*';
            buffer.isSpecial = () => buffer.name === '*' || buffer.name.startsWith('*');
            buffer.isRaw = () => buffer.name === '*raw';
            buffer.setting = (name, val) => {
                if (typeof val !== 'undefined') {
                    if (!buffer.settings) {
                        buffer.settings = {};
                    }
                    buffer.settings[name] = val;
                    return val;
                }
                return buffer.settings ? buffer.settings[name] : undefined;
            };
            buffer.clearUsers = () => {
                buffer.users = {};
            };
            buffer.clearMessageRange = (startTime, endTime) => {
                stateAdapter.clearMessageRange(buffer, startTime, endTime);
            };
            buffer.rename = (newName) => {
                const bufferMap = stateAdapter.buffers.get(self.networkId);
                if (bufferMap) {
                    bufferMap.delete(buffer.name.toLowerCase());
                    buffer.name = newName;
                    bufferMap.set(newName.toLowerCase(), buffer);
                }
            };
            buffer.isUserAnOp = (nick) => {
                const user = buffer.users[nick.toLowerCase()];
                return user && user.modes && user.modes.includes('o');
            };
            buffer.hasNick = (nick) => !!buffer.users[nick.toLowerCase()];
            buffer.flag = (name, value) => {
                if (typeof value !== 'undefined') {
                    if (!buffer.flags) {
                        buffer.flags = {};
                    }
                    buffer.flags[name] = value;
                    return value;
                }
                return buffer.flags ? buffer.flags[name] : undefined;
            };
            buffer.requestLatestScrollback = () => {
                // Placeholder for chathistory scrollback request
                // The underlying IrcClientCore handles this via chathistoryMiddleware
            };
        };

        // Add helpers to existing buffers
        network.buffers.forEach(addBufferHelpers);

        return {
            setting(name, val) {
                if (typeof val !== 'undefined') {
                    stateAdapter.setSetting(name, val);
                    return val;
                }
                return stateAdapter.setting(name);
            },
            settings: stateAdapter.settings,
            $emit(event, ...args) {
                // Emit on both the headless client and state adapter events
                self.emit(event, ...args);
            },
            $delete(obj, key) {
                // Vue.$delete equivalent
                if (obj && typeof obj === 'object') {
                    delete obj[key];
                }
            },
            $set(obj, key, value) {
                // Vue.$set equivalent
                if (obj && typeof obj === 'object') {
                    obj[key] = value;
                }
                return value;
            },
            getOrAddBufferByName(networkid, bufferName) {
                const buffer = stateAdapter.getOrAddBufferByName(networkid, bufferName);
                addBufferHelpers(buffer);
                return buffer;
            },
            getBufferByName(networkid, bufferName) {
                const buffer = stateAdapter.getBufferByName(networkid, bufferName);
                addBufferHelpers(buffer);
                return buffer;
            },
            addMessage(buffer, message) {
                stateAdapter.addMessage(buffer, message);
                // Emit message event
                self.emit(Events.MESSAGE, {
                    buffer: buffer.name,
                    networkid: buffer.networkid,
                    ...message,
                });
            },
            addMessageNoRepeat(buffer, message) {
                stateAdapter.addMessageNoRepeat(buffer, message);
                // Emit message event
                self.emit(Events.MESSAGE, {
                    buffer: buffer.name,
                    networkid: buffer.networkid,
                    ...message,
                });
            },
            addUser(networkid, userData, usersArr) {
                const user = stateAdapter.addUser(networkid, userData);
                // Add whois property if needed
                if (!user.whois) {
                    user.whois = {};
                }
                if (!user.whoFlags) {
                    user.whoFlags = {};
                }
                self.emit(Events.USER_ADDED, {
                    networkid,
                    user,
                });
                return user;
            },
            getUser(networkid, nick, usersArr) {
                return stateAdapter.getUser(networkid, nick);
            },
            removeUser(networkid, userData) {
                stateAdapter.removeUser(networkid, userData);
                self.emit(Events.USER_REMOVED, {
                    networkid,
                    user: userData,
                });
            },
            addUserToBuffer(buffer, userData, modes) {
                stateAdapter.addUserToBuffer(buffer, userData);
                self.emit(Events.USER_JOINED_BUFFER, {
                    buffer: buffer.name,
                    networkid: buffer.networkid,
                    user: userData,
                });
            },
            removeUserFromBuffer(buffer, nick) {
                stateAdapter.removeUserFromBuffer(buffer, nick);
                self.emit(Events.USER_LEFT_BUFFER, {
                    buffer: buffer.name,
                    networkid: buffer.networkid,
                    nick,
                });
            },
            addMultipleUsersToBuffer(buffer, users) {
                stateAdapter.addMultipleUsersToBuffer(buffer, users);
            },
            getBuffersWithUser(networkid, nick) {
                const buffers = stateAdapter.getBuffersWithUser(networkid, nick);
                buffers.forEach(addBufferHelpers);
                return buffers;
            },
            changeUserNick(networkid, oldNick, newNick) {
                stateAdapter.changeUserNick(networkid, oldNick, newNick);
                self.emit(Events.USER_NICK_CHANGED, {
                    networkid,
                    oldNick,
                    newNick,
                });
            },
            getActiveNetwork() {
                return network;
            },
            getActiveBuffer() {
                return stateAdapter.getActiveBuffer();
            },
            clearMessageRange(buffer, startTime, endTime) {
                stateAdapter.clearMessageRange(buffer, startTime, endTime);
            },
            usersTransaction(networkid, fn) {
                stateAdapter.usersTransaction(networkid, fn);
            },
        };
    }

    /**
     * Connect to IRC server
     */
    connect() {
        if (this.ircClient) {
            this.ircClient.connect();
            return;
        }

        // Create IRC client using the existing IrcClient.create function
        // with our adapted state, formatter, and transport
        this.ircClient = this.createIrcClient();
        this.ircClient.connect();
    }

    /**
     * Create IRC client instance
     */
    createIrcClient() {
        // Use the existing IrcClient.create but with our adapted state, formatter, and transport
        const ircClient = IrcClientCore.create(this.state, this.network, {
            formatter: this.formatter,
            transport: this.transport,
        });

        // Override connect to use our options
        const originalConnect = ircClient.connect;
        ircClient.connect = (...args) => {
            // Set connection options
            ircClient.options.host = this.server;
            ircClient.options.port = this.port;
            ircClient.options.tls = this.tls;
            ircClient.options.path = this.path;
            ircClient.options.password = this.password;
            ircClient.options.nick = this.nick;
            ircClient.options.username = this.username;
            ircClient.options.gecos = this.gecos;
            ircClient.options.encoding = this.encoding;
            ircClient.options.auto_reconnect = this.autoReconnect;
            ircClient.options.sasl_disconnect_on_fail = this.disconnectOnSaslFail;

            if (this.password && this.network.password) {
                ircClient.options.account = {
                    account: this.nick,
                    password: this.network.password,
                };
            } else {
                ircClient.options.account = {};
            }

            // Use custom transport if provided
            if (this.transport) {
                ircClient.options.transport = this.transport;
            } else if (!this.direct) {
                // For non-direct connections via Kiwi server, ServerConnection would be needed
                // Since headless client defaults to direct connections, this path is rarely used
                ircClient.options.transport = undefined;
            }

            originalConnect.apply(ircClient, args);
        };

        // Wire up events
        ircClient.on('connecting', () => {
            this.network.state = 'connecting';
            this.emit(Events.CONNECTING);
        });

        ircClient.on('connected', () => {
            this.network.state = 'connected';
            this.connected = true;
            this.emit(Events.CONNECTED);
        });

        ircClient.on('registered', () => {
            this.registered = true;
            this.emit(Events.REGISTERED);
        });

        ircClient.on('socket close', (err) => {
            this.connected = false;
            this.registered = false;
            this.network.state = 'disconnected';
            if (err) {
                this.network.state_error = typeof err === 'string' ? err : 'err_unknown';
            }
            this.emit(Events.DISCONNECTED, err);
        });

        // Store reference
        this.network.ircClient = ircClient;

        return ircClient;
    }

    /**
     * Disconnect from IRC server
     */
    disconnect() {
        if (this.ircClient) {
            this.ircClient.quit();
        }
    }

    /**
     * Send a message to a channel or user
     * @param {string} target - Channel or user name
     * @param {string} message - Message text
     */
    send(target, message) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.say(target, message);
    }

    /**
     * Send an action (/me) to a channel or user
     * @param {string} target - Channel or user name
     * @param {string} message - Action text
     */
    action(target, message) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.action(target, message);
    }

    /**
     * Join a channel
     * @param {string} channel - Channel name
     * @param {string} key - Channel key (optional)
     */
    join(channel, key) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.join(channel, key);
    }

    /**
     * Leave a channel
     * @param {string} channel - Channel name
     * @param {string} reason - Part reason (optional)
     */
    part(channel, reason) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.part(channel, reason);
    }

    /**
     * Change nickname
     * @param {string} newNick - New nickname
     */
    changeNick(newNick) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.changeNick(newNick);
        this.nick = newNick;
        this.network.nick = newNick;
    }

    /**
     * Send raw IRC command
     * @param {...any} args - Raw command arguments
     */
    raw(...args) {
        if (!this.ircClient) {
            throw new Error('Not connected');
        }
        this.ircClient.raw(...args);
    }

    /**
     * Get network state
     * @returns {Object} Network state object
     */
    getNetwork() {
        return this.network;
    }

    /**
     * Get buffer by name
     * @param {string} bufferName - Buffer name
     * @returns {Object|null} Buffer object or null
     */
    getBuffer(bufferName) {
        return this.stateAdapter.getBufferByName(this.networkId, bufferName);
    }

    /**
     * Get all buffers
     * @returns {Array} Array of buffer objects
     */
    getBuffers() {
        return this.network.buffers || [];
    }

    /**
     * Get user by nick
     * @param {string} nick - Nickname
     * @returns {Object|null} User object or null
     */
    getUser(nick) {
        return this.stateAdapter.getUser(this.networkId, nick);
    }

    /**
     * Get all users
     * @returns {Object} Map of users by nick
     */
    getUsers() {
        return this.network.users || {};
    }

    /**
     * Check if a name is a channel
     * @param {string} name - Name to check
     * @returns {boolean} True if channel name
     */
    isChannelName(name) {
        if (!this.ircClient || !this.ircClient.network) {
            // Default channel prefixes
            return name && (name[0] === '#' || name[0] === '&');
        }
        const chanPrefixes = this.ircClient.network.supports('CHANTYPES') || '#&';
        return chanPrefixes.indexOf(name[0]) > -1;
    }
}

/**
 * Create a new headless IRC client
 * @param {Object} options - Client options
 * @returns {HeadlessIrcClient} New client instance
 */
export function createIrcClient(options = {}) {
    return new HeadlessIrcClient(options);
}
