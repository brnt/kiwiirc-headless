/**
 * Headless IRC Client Library
 * TypeScript definitions for KiwiIRC Headless Client
 */

/**
 * Event types emitted by the Headless IRC Client
 */
export enum Events {
    /** Emitted when connecting to the server */
    CONNECTING = 'connecting',
    /** Emitted when connected to the server (before registration) */
    CONNECTED = 'connected',
    /** Emitted when registered with the server */
    REGISTERED = 'registered',
    /** Emitted when disconnected from the server */
    DISCONNECTED = 'disconnected',
    /** Emitted when a message is received */
    MESSAGE = 'message',
    /** Emitted when a user is added to the network */
    USER_ADDED = 'user-added',
    /** Emitted when a user is removed from the network */
    USER_REMOVED = 'user-removed',
    /** Emitted when a user joins a buffer/channel */
    USER_JOINED_BUFFER = 'user-joined-buffer',
    /** Emitted when a user leaves a buffer/channel */
    USER_LEFT_BUFFER = 'user-left-buffer',
    /** Emitted when a user changes their nickname */
    USER_NICK_CHANGED = 'user-nick-changed',
}

/**
 * List of all event names as an array
 */
export const EVENT_NAMES: string[];

export interface IrcClientOptions {
    /** IRC server hostname */
    server?: string;
    /** IRC server port (default: 6667) */
    port?: number;
    /** Use TLS/SSL connection (default: false) */
    tls?: boolean;
    /** WebSocket path (for WebSocket connections) */
    path?: string;
    /** Server password */
    password?: string;
    /** Nickname */
    nick?: string;
    /** Username (defaults to nick) */
    username?: string;
    /** Real name/GECOS */
    gecos?: string;
    /** Character encoding (default: 'utf8') */
    encoding?: string;
    /** Direct connection (default: true) */
    direct?: boolean;
    /** Auto-reconnect on disconnect (default: true) */
    autoReconnect?: boolean;
    /** Disconnect on SASL failure (default: false) */
    disconnectOnSaslFail?: boolean;
    /** Network ID (default: 1) */
    networkId?: number | string;
    /** Network name */
    networkName?: string;
    /** Auto-commands to run on connect */
    autoCommands?: string;
    /** Custom state adapter */
    stateAdapter?: StateAdapter;
    /** Custom message formatter */
    formatter?: Formatter;
    /** Custom transport factory */
    transport?: TransportFactory;
    /** Settings object */
    settings?: Record<string, any>;
}

export interface Message {
    /** Message ID */
    id?: string;
    /** Buffer ID */
    buffer_id?: string;
    /** Network ID */
    networkid?: number | string;
    /** Timestamp */
    time: number;
    /** Server timestamp */
    server_time?: number;
    /** Sender nickname */
    nick: string;
    /** Formatted message text */
    message: string;
    /** Message type */
    type?:
        | 'privmsg'
        | 'notice'
        | 'action'
        | 'traffic'
        | 'error'
        | 'motd'
        | 'wallops'
        | 'invite'
        | 'nick'
        | 'mode'
        | 'topic'
        | 'help'
        | 'presence';
    /** Extra type information */
    type_extra?: string;
    /** IRCv3 message tags */
    tags?: Record<string, string>;
    /** Whether message is a highlight */
    isHighlight?: boolean;
}

export interface Buffer {
    /** Buffer ID */
    id: string;
    /** Network ID */
    networkid: number | string;
    /** Buffer name (channel name or nickname) */
    name: string;
    /** Whether user has joined this channel */
    joined: boolean;
    /** Whether buffer is enabled */
    enabled: boolean;
    /** Users in buffer */
    users: Record<string, User>;
    /** Channel modes */
    modes: Record<string, string>;
    /** Channel topic */
    topic?: string;
    /** Topic set by */
    topic_by?: string;
    /** Topic set when */
    topic_when?: number;
    /** Buffer settings */
    settings?: Record<string, any>;
    /** Buffer flags */
    flags?: Record<string, any>;
    /** Latest messages */
    latest_messages: Message[];
    /** Helper: Check if buffer is a channel */
    isChannel(): boolean;
    /** Helper: Check if buffer is a query */
    isQuery(): boolean;
    /** Helper: Check if buffer is server buffer */
    isServer(): boolean;
    /** Helper: Check if buffer is special */
    isSpecial(): boolean;
    /** Helper: Check if buffer is raw */
    isRaw(): boolean;
    /** Helper: Get setting */
    setting(name: string, value?: any): any;
    /** Helper: Clear users */
    clearUsers(): void;
    /** Helper: Clear message range */
    clearMessageRange(startTime: number, endTime: number): void;
    /** Helper: Rename buffer */
    rename(newName: string): void;
    /** Helper: Check if user is op */
    isUserAnOp(nick: string): boolean;
    /** Helper: Check if buffer has user */
    hasNick(nick: string): boolean;
    /** Helper: Get/set flag */
    flag(name: string, value?: any): any;
}

export interface User {
    /** User ID */
    id: string;
    /** Network ID */
    networkid: number | string;
    /** Nickname */
    nick: string;
    /** Username */
    username?: string;
    /** Hostname */
    host?: string;
    /** Real name */
    realname?: string;
    /** Away status */
    away?: string;
    /** Account name */
    account?: string;
    /** User modes */
    modes?: Array<{ mode: string; param?: string }>;
    /** Buffers user is in */
    buffers?: Record<string, { modes?: string[] }>;
    /** Whois information */
    whois?: Record<string, any>;
    /** Who flags */
    whoFlags?: Record<string, any>;
    /** Has whois data */
    hasWhois?: boolean;
    /** Has who flags */
    hasWhoFlags?: boolean;
}

export interface Network {
    /** Network ID */
    id: number | string;
    /** Network name */
    name: string;
    /** Connection state */
    state: 'disconnected' | 'connecting' | 'connected';
    /** State error */
    state_error?: string;
    /** Last error */
    last_error?: string;
    /** Current nickname */
    nick: string;
    /** Username */
    username?: string;
    /** GECOS */
    gecos?: string;
    /** Away status */
    away?: string;
    /** Connection details */
    connection: {
        server: string;
        port: number;
        tls: boolean;
        path: string;
        password: string;
        direct: boolean;
        encoding: string;
        nick: string;
    };
    /** Network settings */
    settings?: Record<string, any>;
    /** Buffers */
    buffers: Buffer[];
    /** Users */
    users: Record<string, User>;
    /** Auto commands */
    auto_commands?: string;
    /** IRCd type */
    ircd?: string;
    /** Channel list */
    channel_list?: Array<{ channel: string; users?: number; topic?: string }>;
    /** Channel list state */
    channel_list_state?: string;
    /** Helper: Get server buffer */
    serverBuffer(): Buffer;
    /** Helper: Get buffer by name */
    bufferByName(name: string): Buffer | null;
    /** Helper: Get current user */
    currentUser(): User | null;
    /** Helper: Get user by name */
    userByName(nick: string): User | null;
    /** Helper: Check if name is channel */
    isChannelName(name: string): boolean;
    /** Helper: Check if nick is exempt from PM blocks */
    isNickExemptFromPmBlocks(nick: string): boolean | null;
    /** Helper: Get/set setting */
    setting(name: string, value?: any): any;
}

export interface Formatter {
    /** Format message text */
    formatText(
        type: string,
        data: {
            nick?: string;
            username?: string;
            host?: string;
            text?: string;
            message?: string;
            [key: string]: any;
        }
    ): string;
    /** Format user display name */
    formatUser(user: { nick?: string; [key: string]: any }): string;
    /** Format user with full details */
    formatUserFull(user: { nick?: string; ident?: string; hostname?: string; [key: string]: any }): string;
    /** Translate key */
    t(key: string, vars?: Record<string, any>): string;
    /** Format and translate */
    formatAndT(
        key: string,
        vars: Record<string, any> | null,
        fallback: string,
        fallbackVars: Record<string, any>
    ): string;
}

export interface StateAdapter {
    /** Get or create network */
    getOrCreateNetwork(networkId: number | string): Network;
    /** Get network */
    getNetwork(networkId: number | string): Network | null;
    /** Get or add buffer */
    getOrAddBufferByName(networkId: number | string, bufferName: string): Buffer;
    /** Get buffer */
    getBufferByName(networkId: number | string, bufferName: string): Buffer | null;
    /** Add message */
    addMessage(buffer: Buffer, message: Message): void;
    /** Add message without repeating */
    addMessageNoRepeat(buffer: Buffer, message: Message): void;
    /** Add user */
    addUser(networkId: number | string, userData: Partial<User>): User;
    /** Get user */
    getUser(networkId: number | string, nick: string): User | null;
    /** Remove user */
    removeUser(networkId: number | string, userData: { nick: string }): void;
    /** Add user to buffer */
    addUserToBuffer(buffer: Buffer, userData: Partial<User>): void;
    /** Remove user from buffer */
    removeUserFromBuffer(buffer: Buffer, nick: string): void;
    /** Add multiple users to buffer */
    addMultipleUsersToBuffer(buffer: Buffer, users: Array<{ user?: Partial<User>; modes?: string[] }>): void;
    /** Get buffers with user */
    getBuffersWithUser(networkId: number | string, nick: string): Buffer[];
    /** Change user nick */
    changeUserNick(networkId: number | string, oldNick: string, newNick: string): void;
    /** Get setting */
    setting(name: string): any;
    /** Set setting */
    setSetting(name: string, value: any): void;
    /** Get active network */
    getActiveNetwork(): Network | null;
    /** Get active buffer */
    getActiveBuffer(): Buffer | null;
    /** Set active buffer */
    setActiveBuffer(networkId: number | string, bufferName: string): void;
    /** Clear message range */
    clearMessageRange(buffer: Buffer, startTime: number, endTime: number): void;
    /** Users transaction */
    usersTransaction(networkId: number | string, fn: (users: Record<string, User>) => void): void;
    /** Settings */
    settings: Record<string, any>;
}

export type TransportFactory = (options: any) => any;

export interface MessageEvent {
    /** Buffer name */
    buffer: string;
    /** Network ID */
    networkid: number | string;
    /** Timestamp */
    time: number;
    /** Server timestamp */
    server_time?: number;
    /** Sender nickname */
    nick: string;
    /** Message text */
    message: string;
    /** Message type */
    type?: string;
    /** Message tags */
    tags?: Record<string, string>;
}

export interface UserEvent {
    /** Network ID */
    networkid: number | string;
    /** User object */
    user: User;
}

export interface UserJoinedBufferEvent {
    /** Buffer name */
    buffer: string;
    /** Network ID */
    networkid: number | string;
    /** User data */
    user: Partial<User>;
}

export interface UserNickChangedEvent {
    /** Network ID */
    networkid: number | string;
    /** Old nickname */
    oldNick: string;
    /** New nickname */
    newNick: string;
}

/**
 * Headless IRC Client
 * Provides a clean API for IRC connections without Vue dependencies
 */
export declare class HeadlessIrcClient {
    constructor(options?: IrcClientOptions);

    /** Connection options */
    server: string;
    port: number;
    tls: boolean;
    path: string;
    password: string;
    nick: string;
    username: string;
    gecos: string;
    encoding: string;
    direct: boolean;
    autoReconnect: boolean;
    disconnectOnSaslFail: boolean;
    networkId: number | string;
    network: Network;
    connected: boolean;
    registered: boolean;

    /**
     * Connect to IRC server
     */
    connect(): void;

    /**
     * Disconnect from IRC server
     */
    disconnect(): void;

    /**
     * Send a message to a channel or user
     * @param target - Channel or user name
     * @param message - Message text
     */
    send(target: string, message: string): void;

    /**
     * Send an action (/me) to a channel or user
     * @param target - Channel or user name
     * @param message - Action text
     */
    action(target: string, message: string): void;

    /**
     * Join a channel
     * @param channel - Channel name
     * @param key - Channel key (optional)
     */
    join(channel: string, key?: string): void;

    /**
     * Leave a channel
     * @param channel - Channel name
     * @param reason - Part reason (optional)
     */
    part(channel: string, reason?: string): void;

    /**
     * Change nickname
     * @param newNick - New nickname
     */
    changeNick(newNick: string): void;

    /**
     * Send raw IRC command
     * @param args - Raw command arguments
     */
    raw(...args: any[]): void;

    /**
     * Get network state
     * @returns Network state object
     */
    getNetwork(): Network;

    /**
     * Get buffer by name
     * @param bufferName - Buffer name
     * @returns Buffer object or null
     */
    getBuffer(bufferName: string): Buffer | null;

    /**
     * Get all buffers
     * @returns Array of buffer objects
     */
    getBuffers(): Buffer[];

    /**
     * Get user by nick
     * @param nick - Nickname
     * @returns User object or null
     */
    getUser(nick: string): User | null;

    /**
     * Get all users
     * @returns Map of users by nick
     */
    getUsers(): Record<string, User>;

    /**
     * Check if a name is a channel
     * @param name - Name to check
     * @returns True if channel name
     */
    isChannelName(name: string): boolean;

    /**
     * Register an event listener
     * @param event - Event name (use Events enum for type safety)
     * @param listener - Event handler
     * @returns Unsubscribe function
     */
    on(event: Events.MESSAGE, listener: (event: MessageEvent) => void): () => void;
    on(event: Events.CONNECTING, listener: () => void): () => void;
    on(event: Events.CONNECTED, listener: () => void): () => void;
    on(event: Events.REGISTERED, listener: () => void): () => void;
    on(event: Events.DISCONNECTED, listener: (error?: any) => void): () => void;
    on(event: Events.USER_ADDED, listener: (event: UserEvent) => void): () => void;
    on(event: Events.USER_REMOVED, listener: (event: UserEvent) => void): () => void;
    on(event: Events.USER_JOINED_BUFFER, listener: (event: UserJoinedBufferEvent) => void): () => void;
    on(
        event: Events.USER_LEFT_BUFFER,
        listener: (event: { buffer: string; networkid: number | string; nick: string }) => void
    ): () => void;
    on(event: Events.USER_NICK_CHANGED, listener: (event: UserNickChangedEvent) => void): () => void;
    on(event: string, listener: (...args: any[]) => void): () => void;

    /**
     * Register a one-time event listener
     * @param event - Event name
     * @param listener - Event handler
     */
    once(event: string, listener: (...args: any[]) => void): void;

    /**
     * Remove an event listener
     * @param event - Event name
     * @param listener - Event handler
     */
    off(event: string, listener: (...args: any[]) => void): void;

    /**
     * Remove all listeners for an event, or all events
     * @param event - Event name (optional)
     */
    removeAllListeners(event?: string): void;
}

/**
 * Create a new headless IRC client
 * @param options - Client options
 * @returns New client instance
 */
export declare function createIrcClient(options?: IrcClientOptions): HeadlessIrcClient;

/**
 * Event emitter base class
 */
export declare class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): () => void;
    once(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    removeAllListeners(event?: string): void;
    listeners(event: string): Array<(...args: any[]) => void>;
}

/**
 * Default state adapter
 */
export declare class StateAdapter implements StateAdapter {
    networks: Map<number | string, Network>;
    buffers: Map<number | string, Map<string, Buffer>>;
    users: Map<number | string, Map<string, User>>;
    messages: Message[];
    settings: Record<string, any>;
    ui: {
        active_network: number | string | null;
        active_buffer: string | null;
    };
    getOrCreateNetwork(networkId: number | string): Network;
    getNetwork(networkId: number | string): Network | null;
    getOrAddBufferByName(networkId: number | string, bufferName: string): Buffer;
    getBufferByName(networkId: number | string, bufferName: string): Buffer | null;
    addMessage(buffer: Buffer, message: Message): void;
    addMessageNoRepeat(buffer: Buffer, message: Message): void;
    addUser(networkId: number | string, userData: Partial<User>): User;
    getUser(networkId: number | string, nick: string): User | null;
    removeUser(networkId: number | string, userData: { nick: string }): void;
    addUserToBuffer(buffer: Buffer, userData: Partial<User>): void;
    removeUserFromBuffer(buffer: Buffer, nick: string): void;
    addMultipleUsersToBuffer(buffer: Buffer, users: Array<{ user?: Partial<User>; modes?: string[] }>): void;
    getBuffersWithUser(networkId: number | string, nick: string): Buffer[];
    changeUserNick(networkId: number | string, oldNick: string, newNick: string): void;
    setting(name: string): any;
    setSetting(name: string, value: any): void;
    getActiveNetwork(): Network | null;
    getActiveBuffer(): Buffer | null;
    setActiveBuffer(networkId: number | string, bufferName: string): void;
    clearMessageRange(buffer: Buffer, startTime: number, endTime: number): void;
    usersTransaction(networkId: number | string, fn: (users: Record<string, User>) => void): void;
}

/**
 * Plain text formatter
 */
export declare class PlainTextFormatter implements Formatter {
    formatText(
        type: string,
        data: {
            nick?: string;
            username?: string;
            host?: string;
            text?: string;
            message?: string;
            [key: string]: any;
        }
    ): string;
    formatUser(user: { nick?: string; [key: string]: any }): string;
    formatUserFull(user: { nick?: string; ident?: string; hostname?: string; [key: string]: any }): string;
    t(key: string, vars?: Record<string, any>): string;
    formatAndT(
        key: string,
        vars: Record<string, any> | null,
        fallback: string,
        fallbackVars: Record<string, any>
    ): string;
}
