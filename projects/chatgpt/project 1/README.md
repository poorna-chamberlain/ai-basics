# QuickImage

QuickImage is a real Electron desktop launcher for finding, editing, and copying images without leaving the app you are working in. It runs from the system tray and opens above every application with a global shortcut.

## Features

- Native Electron `BrowserWindow`, system tray, global shortcut, and OS image clipboard
- Openverse image search with no account or API key
- Optional Google Custom Search provider
- Local background removal powered by `@imgly/background-removal` (WASM/ONNX; no image is sent to a background-removal API)
- Transparent, white, or black image backgrounds with live preview
- Persistent search and image history
- Persistent shortcut and provider settings
- Automatic system light/dark appearance
- Context-isolated, sandboxed renderer with a narrow preload API

The editor opens **inside the launcher overlay**, replacing the search grid until Back or Escape is pressed.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer
- macOS 12+ or Windows 10+

## Run in development

```bash
npm install
npm run dev
```

Image search works immediately after these two commands. Openverse is active by default and requires zero configuration. Use **Alt+Shift+I** on either macOS or Windows, or click the tray icon.

The first background-removal operation may download the model runtime distributed by IMG.LY. Processing then runs locally in the renderer; images are never uploaded to a removal service. Browser caching makes later runs faster.

## Build installers

```bash
# Requests both configured installers
npm run build

# Platform-specific alternatives
npm run build:mac
npm run build:win
```

Outputs are written to `release/`:

- macOS: signed-style DMG layout (unsigned unless Apple signing credentials are supplied)
- Windows: NSIS `.exe` installer

Electron Builder can cross-build Windows NSIS from macOS when Wine is installed. For reliable release artifacts, run `build:mac` on macOS and `build:win` on Windows. Code signing/notarization credentials are intentionally not stored in this project.

## Optional: enable Google image search

Openverse remains the recommended zero-setup provider. Google requires both an API key and a Programmable Search Engine ID.

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Custom Search API** and create an API key under Credentials.
3. Create a [Programmable Search Engine](https://programmablesearchengine.google.com/), enable searching the entire web if desired, and copy its **Search engine ID** (`cx`).
4. Open QuickImage Settings, paste the key and `cx`, save, then select Google.

For local development, credentials can instead be loaded on first launch:

```bash
cp .env.example .env
```

Then set:

```dotenv
GOOGLE_API_KEY=your_key
GOOGLE_CX=your_search_engine_id
```

Credentials entered in Settings are stored in Electron's user-data directory. The API key is encrypted with Electron `safeStorage` when the operating system keychain is available. No credentials are hardcoded or sent anywhere except Google's documented JSON API.

## Keyboard behavior

- **Alt+Shift+I**: toggle the overlay globally
- **Escape**: return to search; from search, close the overlay
- The overlay also closes when it loses focus
- Rebind the shortcut in Settings by focusing the shortcut field and pressing a modifier combination

## Project structure

```text
QuickImage/
├── resources/                 # App and tray artwork
├── src/
│   ├── main/
│   │   ├── index.ts           # Windows, tray, shortcut, IPC, clipboard
│   │   ├── providers.ts       # Pluggable Openverse/Google providers
│   │   └── store.ts           # Atomic persisted settings/history
│   ├── preload/index.ts       # Context-isolated renderer bridge
│   ├── renderer/
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       └── styles.css
│   └── shared/types.ts
├── design.md
├── electron.vite.config.ts
└── package.json
```

## Provider architecture

Every provider implements `ImageSearchProvider.search(query, page)` and returns the shared `SearchResponse` shape. The main process chooses the configured implementation; the renderer only consumes normalized results and renders provider metadata dynamically. A third provider and its descriptor can be registered in `src/main/providers.ts` without changing renderer UI code.

## Privacy and security

Search requests run in the main process. The renderer has no Node.js access and runs with `contextIsolation` and sandboxing enabled. Remote image bytes are downloaded by a validated IPC handler, capped at 25 MB, and passed to local editing. Clipboard writes happen only in the Electron main process through native `ClipboardItem` image data.

## Diagnostics and logs

QuickImage logs startup, shortcut registration, provider searches, HTTP failures, image downloads, and settings changes. Google credentials are never included. Open **Settings → Diagnostics** to see recent events and the exact persistent log-file path. Logs also appear in the terminal during `npm run dev`. The log rotates at 2 MB and keeps one previous file as `quickimage.log.1`.
