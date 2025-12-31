# Installation Guide for Preact/Other Projects

## Option 1: Git Dependency (Recommended)

### Prerequisites

Before installing from git, ensure the built files are available:

1. **Build the headless client:**
   ```bash
   npm run build:headless:prod
   ```

2. **Commit the built files** (update `.gitignore` to allow `dist/headless/`):
   ```bash
   # Add to .gitignore: !dist/headless/
   git add dist/headless/
   git commit -m "Add headless client build files"
   ```

### Installation in Your Preact Project

```bash
npm install git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless
# or
yarn add git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless
```

### Usage in TypeScript/Preact

```typescript
import { createIrcClient, HeadlessIrcClient } from '@kiwiirc/headless-client';

const client = createIrcClient({
  server: 'irc.example.com',
  port: 6667,
  nick: 'mynick',
});

client.on('message', (event) => {
  console.log(`[${event.buffer}] ${event.nick}: ${event.message}`);
});

client.connect();
```

### Updating

To update to the latest version:

```bash
npm update @kiwiirc/headless-client
# or
yarn upgrade @kiwiirc/headless-client
```

To pin to a specific commit or tag:

```bash
npm install git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless#commit-hash
```

## Option 2: Copy Files Directly

If you prefer not to use git dependency:

1. Copy the built files to your project:
   ```bash
   cp dist/headless/kiwi-headless-client.js* your-preact-project/src/libs/
   cp src/libs/headless/index.d.ts your-preact-project/src/libs/
   ```

2. Import in your code:
   ```typescript
   import { createIrcClient } from './libs/kiwi-headless-client.js';
   ```

## TypeScript Configuration

If using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```
