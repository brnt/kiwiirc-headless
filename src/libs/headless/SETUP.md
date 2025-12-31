# Headless Client Setup

## Fresh Environment Setup

All changes are file-based and tracked in git. To build the headless client in a fresh environment:

### Prerequisites

- Node.js >= 18.18
- Yarn 1.22.22 (or compatible package manager)

### Setup Steps

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Build the headless client:**
   ```bash
   npm run build:headless
   # or for production (minified):
   npm run build:headless:prod
   ```

That's it! The build will create `dist/headless/kiwi-headless-client.js`.

### What's Included

All necessary files are tracked in git:

- **Source files**: `src/libs/headless/` (all JavaScript files, TypeScript definitions, README)
- **Build config**: `build/webpack/headless-client.js`
- **Stubs**: `src/libs/headless/stubs/PluginWrapper.js`
- **Package config**: `package.json` (includes webpack-cli dependency and build scripts)
- **Babel config**: Uses existing `babel.config.js`

### Dependencies

All required dependencies are already in `package.json`:
- `webpack` (already present)
- `webpack-cli` (added)
- `babel-loader` (explicitly added)
- `buffer` (already present)
- `stream-browserify` (already present)

No additional manual setup is required beyond `yarn install`.
