# Blank Wallet Extension

### Node Version

If you already have nvm installed, just type `nvm use` to set the node version.

## Available scripts

### Extension

- `start:ext` - Starts the extension in development mode (hot reload). Any change made to code will trigger a Chrome window reload along with the extenxion.
- `build:ext` - Build extension for production
- `build:ext:dev` - Build extension for development use
- `tests` - Runs Jest tests included on the **\_\_tests\_\_** folder

## Loading into Chrome

- Visit [chrome://extensions/](chrome://extensions/) in your Chrome Browser
- Turn on **Developer Mode**
- Click **Load Unpacked Extension**
- Select `/dist` folder at the monorepo's root.

## Storybook preview

Running `storybook` script will load [Storybook](https://storybook.js.org/docs/react/get-started/introduction) environment and open a browser window containing all the `stories` defined at `/src/stories/` folder.

This tool allows building and testing UI views and components disconnected from background, using mock state values and custom stories.

