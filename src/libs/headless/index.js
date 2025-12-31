'kiwi public';

/**
 * Headless IRC Client Library
 *
 * Provides a standalone, browser-based IRC client that exposes an API
 * for building custom UIs without Vue dependencies.
 *
 * @example
 * import { createIrcClient } from '@/libs/headless';
 *
 * const client = createIrcClient({
 *   server: 'irc.example.com',
 *   port: 6667,
 *   nick: 'mynick',
 * });
 *
 * client.on('message', (event) => {
 *   console.log(`${event.nick}: ${event.message}`);
 * });
 *
 * client.connect();
 */

export { default as HeadlessIrcClient, createIrcClient } from './IrcClient';
export { default as EventEmitter } from './EventEmitter';
export { default as StateAdapter } from './StateAdapter';
export { PlainTextFormatter } from './Formatter';
export { Events, EVENT_NAMES } from './Events';
