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

**Important:** Neither npm nor Yarn Classic (v1) support the `#subdirectory=` syntax. Use one of these options:

#### Option A: Use Yarn v2+ (Berry) - Recommended

Yarn Berry supports subdirectories and works with private repositories. **Note:** Yarn Berry requires the package name to be specified explicitly.

**First, upgrade to Yarn Berry (if not already):**
```bash
# Enable Corepack (comes with Node.js 16.9+)
corepack enable

# Upgrade your project to Yarn Berry
yarn set version berry
```

**Then install the headless library:**
```bash
# With SSH (recommended for private repos)
yarn add @kiwiirc/headless-client@git+ssh://git@github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless

# With HTTPS (requires authentication for private repos)
yarn add @kiwiirc/headless-client@git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless
```

#### Option B: Use pnpm

pnpm also supports subdirectories:

```bash
pnpm add @kiwiirc/headless-client@git+ssh://git@github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless
```

#### Option C: Use GitPkg (Public repos only)

GitPkg creates a tarball of the subdirectory. **Note:** Only works with public repositories.

```bash
# With npm
npm install https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main

# With Yarn Classic
yarn add https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main
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

**With Yarn Berry:**
```bash
yarn up @kiwiirc/headless-client
```

**With npm:**
```bash
npm update @kiwiirc/headless-client
```

**With Yarn Classic:**
```bash
yarn upgrade @kiwiirc/headless-client
```

To pin to a specific commit or tag:

**With Yarn Berry:**
```bash
# SSH
yarn add @kiwiirc/headless-client@git+ssh://git@github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless#commit-hash

# HTTPS
yarn add @kiwiirc/headless-client@git+https://github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless#commit-hash
```

**With pnpm:**
```bash
pnpm add @kiwiirc/headless-client@git+ssh://git@github.com/brnt/kiwiirc-headless.git#subdirectory=src/libs/headless#commit-hash
```

**With GitPkg (public repos only):**
```bash
# npm
npm install https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main&commit=commit-hash

# Yarn Classic
yarn add https://gitpkg.now.sh/brnt/kiwiirc-headless/src/libs/headless?main&commit=commit-hash
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
