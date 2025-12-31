'kiwi public';

/**
 * Event types emitted by the Headless IRC Client
 *
 * @example
 * import { Events } from '@/libs/headless';
 *
 * client.on(Events.MESSAGE, (event) => {
 *   console.log('Message received:', event);
 * });
 */
export const Events = {
    /** Emitted when connecting to the server */
    CONNECTING: 'connecting',

    /** Emitted when connected to the server (before registration) */
    CONNECTED: 'connected',

    /** Emitted when registered with the server */
    REGISTERED: 'registered',

    /** Emitted when disconnected from the server */
    DISCONNECTED: 'disconnected',

    /** Emitted when a message is received */
    MESSAGE: 'message',

    /** Emitted when a user is added to the network */
    USER_ADDED: 'user-added',

    /** Emitted when a user is removed from the network */
    USER_REMOVED: 'user-removed',

    /** Emitted when a user joins a buffer/channel */
    USER_JOINED_BUFFER: 'user-joined-buffer',

    /** Emitted when a user leaves a buffer/channel */
    USER_LEFT_BUFFER: 'user-left-buffer',

    /** Emitted when a user changes their nickname */
    USER_NICK_CHANGED: 'user-nick-changed',
};

/**
 * List of all event names as an array (useful for validation, etc.)
 */
export const EVENT_NAMES = Object.values(Events);
