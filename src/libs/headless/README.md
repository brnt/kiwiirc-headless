# KiwiIRC Headless Client

A standalone, browser-based IRC client library extracted from KiwiIRC. This library provides a clean, Vue-free API for building custom IRC UIs. Vue.js is bundled internally but not exposed in the API.

## Features

- **Self-contained**: Vue.js bundled - no external dependencies required
- **Event-based**: Clean event-driven API for handling IRC events
- **Pluggable**: Customizable formatters and transports
- **TypeScript support**: Full TypeScript definitions included
- **Browser-ready**: Single-file bundle for easy integration

## Installation

### Using the bundled file

Include the bundled file in your HTML. Vue.js is bundled internally - no need to include it separately:

```html
<script src="path/to/kiwi-headless-client.js"></script>
<script>
  // Vue is bundled internally - no need to include it separately
  const client = KiwiHeadlessClient.createIrcClient({
    server: 'irc.example.com',
    port: 6667,
    nick: 'mynick',
  });
  
  // Listen for messages
  client.on('message', (event) => {
    console.log(`[${event.buffer}] ${event.nick}: ${event.message}`);
  });
  
  // Connect to the server
  client.on('connected', () => {
    console.log('Connected!');
    client.join('#channel');
  });
  
  client.connect();
</script>
```

### Using ES modules

```javascript
import { createIrcClient } from './kiwi-headless-client.js';

const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
});
```

### Using npm/yarn from Git repository

**Important:** Neither npm nor Yarn Classic (v1) support the `#subdirectory=` syntax. Use one of these options:

#### Option A: Use Yarn v2+ (Berry) - Recommended

If you're using Yarn v2 or later (Berry), the subdirectory syntax is supported. **Note:** Yarn Berry requires the package name to be specified:

```bash
# With SSH (recommended for private repos)
yarn add @kiwiirc/headless-client@git+ssh://git@github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless

# With HTTPS (requires authentication for private repos)
yarn add @kiwiirc/headless-client@git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless
```

**Upgrading to Yarn Berry:**
```bash
# Enable Corepack (comes with Node.js 16.9+)
corepack enable

# Upgrade your project to Yarn Berry
yarn set version berry
```

#### Option B: Use GitPkg (Works with npm and Yarn Classic)

GitPkg creates a tarball of the subdirectory that package managers can install. **Note:** Only works with public repositories.

```bash
# With npm
npm install https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main

# With Yarn Classic
yarn add https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main
```

**Note:** Make sure the built files (`dist/headless/kiwi-headless-client.js`) are committed to the repository, or build them first:

```bash
# In the kiwiirc-headless repository
npm run build:headless:prod
git add dist/headless/
git commit -m "Add headless client build files"
```

Then in your Preact project, install using one of the methods above.

### Using npm/yarn (if published to npm)

```bash
npm install @kiwiirc/headless-client
# or
yarn add @kiwiirc/headless-client
```

## Quick Start

```javascript
import { createIrcClient } from '@/libs/headless';

// Create a client
const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  tls: false,
  nick: 'mynick',
  username: 'myuser',
  gecos: 'My IRC Client',
});

// Listen for messages
client.on('message', (event) => {
  console.log(`[${event.buffer}] ${event.nick}: ${event.message}`);
});

// Listen for connection events
client.on('connected', () => {
  console.log('Connected to IRC server');
  client.join('#channel');
});

client.on('disconnected', (error) => {
  console.log('Disconnected:', error);
});

// Connect to the server
client.connect();
```

## API Reference

### `createIrcClient(options)`

Creates a new headless IRC client instance.

#### Options

| Option                 | Type               | Default                    | Description                                         |
| ---------------------- | ------------------ | -------------------------- | --------------------------------------------------- |
| `server`               | `string`           | `''`                       | IRC server hostname                                 |
| `port`                 | `number`           | `6667`                     | IRC server port                                     |
| `tls`                  | `boolean`          | `false`                    | Use TLS/SSL connection                              |
| `path`                 | `string`           | `''`                       | WebSocket path (for WebSocket connections)          |
| `password`             | `string`           | `''`                       | Server password                                     |
| `nick`                 | `string`           | `'Guest' + random`         | Nickname                                            |
| `username`             | `string`           | `nick`                     | Username (defaults to nick)                         |
| `gecos`                | `string`           | `'Headless IRC Client'`    | Real name/GECOS                                     |
| `encoding`             | `string`           | `'utf8'`                   | Character encoding                                  |
| `direct`               | `boolean`          | `true`                     | Direct connection (not via Kiwi server)             |
| `autoReconnect`        | `boolean`          | `true`                     | Auto-reconnect on disconnect                        |
| `disconnectOnSaslFail` | `boolean`          | `false`                    | Disconnect on SASL failure                          |
| `networkId`            | `number\|string`   | `1`                        | Network ID                                          |
| `networkName`          | `string`           | `'Network'`                | Network name                                        |
| `autoCommands`         | `string`           | `''`                       | Auto-commands to run on connect (newline-separated) |
| `stateAdapter`         | `StateAdapter`     | `new StateAdapter()`       | Custom state adapter                                |
| `formatter`            | `Formatter`        | `new PlainTextFormatter()` | Custom message formatter                            |
| `transport`            | `TransportFactory` | `undefined`                | Custom transport factory                            |
| `settings`             | `object`           | `{}`                       | Settings object                                     |

#### Returns

`HeadlessIrcClient` instance

### `HeadlessIrcClient`

#### Methods

##### `connect()`

Connect to the IRC server.

```javascript
client.connect();
```

##### `disconnect()`

Disconnect from the IRC server.

```javascript
client.disconnect();
```

##### `send(target, message)`

Send a message to a channel or user.

**Parameters:**
- `target` (string): Channel name (e.g., `'#channel'`) or user nickname
- `message` (string): Message text

```javascript
client.send('#channel', 'Hello, world!');
client.send('nickname', 'Private message');
```

##### `action(target, message)`

Send an action (/me) to a channel or user.

**Parameters:**
- `target` (string): Channel name or user nickname
- `message` (string): Action text

```javascript
client.action('#channel', 'waves hello');
```

##### `join(channel, key?)`

Join a channel.

**Parameters:**
- `channel` (string): Channel name (e.g., `'#channel'`)
- `key` (string, optional): Channel key/password

```javascript
client.join('#channel');
client.join('#secret', 'password123');
```

##### `part(channel, reason?)`

Leave a channel.

**Parameters:**
- `channel` (string): Channel name
- `reason` (string, optional): Part reason

```javascript
client.part('#channel');
client.part('#channel', 'Leaving for now');
```

##### `changeNick(newNick)`

Change nickname.

**Parameters:**
- `newNick` (string): New nickname

```javascript
client.changeNick('newnick');
```

##### `raw(...args)`

Send raw IRC command.

**Parameters:**
- `...args`: Raw command arguments

```javascript
client.raw('MODE', '#channel', '+o', 'nickname');
```

##### `getNetwork()`

Get the network state object.

**Returns:** `Network` object

```javascript
const network = client.getNetwork();
console.log(network.name, network.state);
```

##### `getBuffer(bufferName)`

Get a buffer by name.

**Parameters:**
- `bufferName` (string): Buffer name (channel or nickname)

**Returns:** `Buffer` object or `null`

```javascript
const buffer = client.getBuffer('#channel');
if (buffer) {
  console.log(buffer.topic);
}
```

##### `getBuffers()`

Get all buffers.

**Returns:** Array of `Buffer` objects

```javascript
const buffers = client.getBuffers();
buffers.forEach(buffer => {
  console.log(buffer.name, buffer.joined);
});
```

##### `getUser(nick)`

Get a user by nickname.

**Parameters:**
- `nick` (string): Nickname

**Returns:** `User` object or `null`

```javascript
const user = client.getUser('nickname');
if (user) {
  console.log(user.username, user.host);
}
```

##### `getUsers()`

Get all users.

**Returns:** Object mapping nicknames to `User` objects

```javascript
const users = client.getUsers();
Object.values(users).forEach(user => {
  console.log(user.nick);
});
```

##### `isChannelName(name)`

Check if a name is a channel name.

**Parameters:**
- `name` (string): Name to check

**Returns:** `boolean`

```javascript
if (client.isChannelName('#channel')) {
  console.log('This is a channel');
}
```

#### Events

The client extends `EventEmitter` and emits the following events. You can use the `Events` enum for type-safe event names:

```javascript
import { createIrcClient, Events } from '@/libs/headless';

const client = createIrcClient({...});

// Type-safe event names with autocomplete
client.on(Events.MESSAGE, (event) => {
  console.log('Message:', event);
});

client.on(Events.CONNECTED, () => {
  console.log('Connected!');
});
```

Available events:

##### `connecting`

Emitted when connecting to the server.

```javascript
client.on('connecting', () => {
  console.log('Connecting...');
});
```

##### `connected`

Emitted when connected to the server (before registration).

```javascript
client.on('connected', () => {
  console.log('Connected!');
});
```

##### `registered`

Emitted when registered with the server.

```javascript
client.on('registered', () => {
  console.log('Registered!');
  client.join('#channel');
});
```

##### `disconnected`

Emitted when disconnected from the server.

**Event data:** `error` (optional) - Error object or string

```javascript
client.on('disconnected', (error) => {
  console.log('Disconnected:', error);
});
```

##### `message`

Emitted when a message is received.

**Event data:** `MessageEvent` object

```javascript
client.on('message', (event) => {
  console.log(`[${event.buffer}] ${event.nick}: ${event.message}`);
  console.log('Type:', event.type);
  console.log('Time:', new Date(event.time));
});
```

##### `user-added`

Emitted when a user is added to the network.

**Event data:** `{ networkid, user }`

```javascript
client.on('user-added', ({ networkid, user }) => {
  console.log('User added:', user.nick);
});
```

##### `user-removed`

Emitted when a user is removed from the network.

**Event data:** `{ networkid, user }`

```javascript
client.on('user-removed', ({ networkid, user }) => {
  console.log('User removed:', user.nick);
});
```

##### `user-joined-buffer`

Emitted when a user joins a buffer/channel.

**Event data:** `{ buffer, networkid, user }`

```javascript
client.on('user-joined-buffer', ({ buffer, user }) => {
  console.log(`${user.nick} joined ${buffer}`);
});
```

##### `user-left-buffer`

Emitted when a user leaves a buffer/channel.

**Event data:** `{ buffer, networkid, nick }`

```javascript
client.on('user-left-buffer', ({ buffer, nick }) => {
  console.log(`${nick} left ${buffer}`);
});
```

##### `user-nick-changed`

Emitted when a user changes their nickname.

**Event data:** `{ networkid, oldNick, newNick }`

```javascript
client.on('user-nick-changed', ({ oldNick, newNick }) => {
  console.log(`${oldNick} is now known as ${newNick}`);
});
```

## Advanced Usage

### Custom Formatter

Create a custom formatter to format messages differently:

```javascript
import { PlainTextFormatter } from '@/libs/headless';

class HtmlFormatter extends PlainTextFormatter {
  formatText(type, data) {
    const text = data.text || '';
    // Escape HTML
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    if (type === 'action') {
      return `<em>* ${data.nick || ''} ${escaped}</em>`;
    }
    return escaped;
  }
}

const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
  formatter: new HtmlFormatter(),
});
```

### Custom State Adapter

Create a custom state adapter to store state differently:

```javascript
import { StateAdapter } from '@/libs/headless';

class CustomStateAdapter extends StateAdapter {
  constructor() {
    super();
    // Override methods or add custom logic
  }
  
  addMessage(buffer, message) {
    // Custom message storage logic
    super.addMessage(buffer, message);
    // Maybe save to IndexedDB, send to server, etc.
  }
}

const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
  stateAdapter: new CustomStateAdapter(),
});
```

### Auto-commands

Run commands automatically on connect:

```javascript
const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
  autoCommands: '/mode mynick +x\n/msg nickserv identify password',
});
```

### Multiple Networks

Create multiple clients for different networks:

```javascript
const network1 = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
  networkId: 1,
  networkName: 'Example Network',
});

const network2 = createIrcClient({
  server: 'irc.other.com',
  port: 6667,
  nick: 'mynick',
  networkId: 2,
  networkName: 'Other Network',
});

network1.on('message', (event) => {
  console.log(`[Network 1] ${event.nick}: ${event.message}`);
});

network2.on('message', (event) => {
  console.log(`[Network 2] ${event.nick}: ${event.message}`);
});
```

## TypeScript Support

TypeScript definitions are included. Here's a complete example:

```typescript
import { 
  createIrcClient, 
  HeadlessIrcClient, 
  MessageEvent,
  Buffer,
  User,
  IrcClientOptions
} from '@/libs/headless';

// Create client with full type safety
const options: IrcClientOptions = {
  server: 'irc.example.com',
  port: 6667,
  tls: false,
  nick: 'mynick',
  username: 'myuser',
  gecos: 'My IRC Client',
};

const client: HeadlessIrcClient = createIrcClient(options);

// Type-safe event handlers
client.on('message', (event: MessageEvent) => {
  console.log(`[${event.buffer}] ${event.nick}: ${event.message}`);
  console.log('Message type:', event.type);
  console.log('Timestamp:', new Date(event.time));
  
  // Get buffer with type safety
  const buffer: Buffer | null = client.getBuffer(event.buffer);
  if (buffer) {
    console.log('Channel topic:', buffer.topic);
    console.log('Users in channel:', Object.keys(buffer.users).length);
  }
});

client.on('connected', () => {
  console.log('Connected to IRC server');
  client.join('#channel');
});

client.on('user-joined-buffer', (event) => {
  console.log(`${event.user.nick} joined ${event.buffer}`);
});

client.on('user-nick-changed', ({ oldNick, newNick }) => {
  console.log(`${oldNick} is now known as ${newNick}`);
});

// Connect with error handling
try {
  client.connect();
} catch (error) {
  console.error('Failed to connect:', error);
}

// Type-safe method calls
const network = client.getNetwork();
console.log('Network state:', network.state);
console.log('Current nick:', network.nick);

const buffers: Buffer[] = client.getBuffers();
buffers.forEach((buffer: Buffer) => {
  if (buffer.isChannel()) {
    console.log(`Channel: ${buffer.name}, Topic: ${buffer.topic}`);
  }
});
```

### Type Definitions

All types are exported from the library:

```typescript
import type {
  IrcClientOptions,
  HeadlessIrcClient,
  MessageEvent,
  Buffer,
  User,
  Network,
  Formatter,
  StateAdapter,
  Message,
} from '@/libs/headless';
```

## Building

To build the headless client as a single-file bundle:

```bash
npm run build:headless
```

This creates `dist/headless/kiwi-headless-client.js` which can be included in your project.

For production builds:

```bash
NODE_ENV=production npm run build:headless
```

## Browser Compatibility

The headless client works in modern browsers that support:
- ES6+ JavaScript
- WebSocket API (for direct connections)
- Fetch API (if using custom transports)

## Limitations

- **Vue bundled**: Vue.js is bundled internally for the underlying `IrcClient` implementation, but the headless API itself is Vue-free
- **Kiwi server transport**: Non-direct connections via Kiwi server require the full KiwiIRC server setup
- **Some features**: Some KiwiIRC-specific features (like bouncer support) may not be available in headless mode
- **Bundle size**: The bundled file is ~3.3MB unminified, ~825KB minified (includes Vue.js and all dependencies)

## License

Same license as KiwiIRC.

## Contributing

Contributions are welcome! Please ensure your code follows the existing style and includes tests where appropriate.
