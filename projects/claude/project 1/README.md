# QuickImage

A launcher-style desktop app for finding an image, cutting its background out, and
getting it onto your clipboard — without leaving the keyboard or switching apps.

Press **`Alt+Shift+I`** anywhere in the OS and a translucent panel drops in over
whatever you were doing. Type, pick an image, remove the background, choose a
backing colour, copy. Press `Esc` and it's gone.

Built with Electron + React + TypeScript, bundled by electron-vite, packaged by
electron-builder for macOS (`.dmg`) and Windows (`.exe` / `.msi`).

---

## Quick start

```bash
npm install
npm run dev
```

That's the whole setup. **Image search works immediately, with zero
configuration** — the default provider is Wikimedia Commons, which needs no API
key, no signup and no account.

The app has no dock icon and no ordinary window. After `npm run dev` it starts in
the background; look for the QuickImage icon in your menu bar / system tray, or
just press `Alt+Shift+I`.

> If `npm install` finishes suspiciously fast and `npm run dev` reports
> `Error: Electron uninstall`, the Electron binary download was skipped. Fix it
> with `node node_modules/electron/install.js`.

### Packaging

```bash
npm run build:mac    # -> release/QuickImage-1.0.0-arm64.dmg (and x64)
npm run build:win    # -> release/QuickImage-1.0.0-Setup.exe and QuickImage-1.0.0.msi
npm run build:all    # both
```

Builds are unsigned. macOS will quarantine the `.dmg` on first open — right-click
the app and choose *Open*, or run `xattr -dr com.apple.quarantine` on it. Add
signing credentials to `electron-builder.yml` for real distribution.

> Behind a TLS-inspecting corporate proxy, `electron-builder` fails with
> `unable to get local issuer certificate` while downloading its toolchain.
> Point `NODE_EXTRA_CA_CERTS` at your company's root certificate. `npm run build`
> itself is unaffected.

---

## What it does

**Global hotkey overlay.** `Alt+Shift+I` (rebindable) toggles a frameless,
always-on-top panel, centred in the upper third of whichever screen has your
cursor. It sits above full-screen apps, fades and scales in over ~170 ms, and
closes on `Esc`, on losing focus, or on the hotkey again. Real translucency:
macOS vibrancy, Windows 11 acrylic, with a blurred-and-opaque CSS fallback
elsewhere. Follows system light/dark automatically.

**Search.** Type (debounced ~260 ms) and a lazy-loaded, responsive grid of
results appears below the field. The panel grows from a single search bar to fit
its content and back again. Scroll to the bottom to page in more.

**Edit.** Click a thumbnail to open the preview/edit view — **inside the same
overlay window**, not a secondary window, so `Esc` still peels back one layer at
a time and the app keeps its single-surface feel. There you can:

- **Remove background** — runs an ISNet segmentation model locally via
  ONNX Runtime compiled to WebAssembly. Your image never leaves the machine and
  there is no paid API. Progress is shown while it works.
- **Set background** — White / Black / Transparent, recomposited from the
  original cut-out each time so switching colours is lossless. Transparency is
  drawn on a checkerboard so a white cut-out is never mistaken for a white fill.
- **Copy to clipboard** — puts real PNG image data on the OS clipboard via
  Electron's native clipboard, so `Cmd/Ctrl+V` pastes a picture into Slack,
  Docs, Figma, Mail and anything else. Confirmed with a brief toast.

**History.** A second tab keeps past searches and past images (with thumbnails),
persisted across restarts. Clicking a history image reopens the editor with its
saved cut-out, so you can recolour or re-copy without downloading or
reprocessing anything.

**Settings.** Rebind the global hotkey, switch image provider, add Google
credentials, pick appearance and removal quality, toggle launch-at-login.
Everything persists across restarts.

### Keyboard

| Key | Action |
| --- | --- |
| `Alt+Shift+I` | Toggle the overlay from anywhere (rebindable) |
| `Esc` | Close editor/settings → clear query → hide the panel |
| `Cmd/Ctrl+,` | Toggle settings |
| `Cmd/Ctrl+C` | Copy the edited image (in the editor) |

---

## Image providers

Search sits behind a pluggable `ImageSearchProvider` interface — one method,
`search(query, page, settings, signal)`. Providers are constructed once in
`src/shared/providers/registry.ts`; the settings panel and the active-provider
chip are both driven by the registry's metadata, so **adding a fourth provider
requires no UI changes at all**.

| Provider | Key required | Status |
| --- | --- | --- |
| **Wikimedia Commons** | No | **Default, works out of the box** |
| **Openverse** | No | Selectable; see the note below |
| **Google Images** | Yes | Optional upgrade, hidden until configured |

If the selected provider fails (outage, rate limit, missing credentials), the
registry transparently retries with another key-free provider and the UI says
which one actually answered. Turn this off with *Fall back automatically* in
Settings.

### A note on Openverse

Openverse is implemented exactly as specified and is selectable in Settings, but
**it is not the default**, because its public API proved unreliable during
development: fresh queries timed out repeatedly and `openverse.org` itself
returned `502`s, with only edge-cached query variants responding. Since the
requirement was that search work the moment the app is installed, the default is
Wikimedia Commons, which was verified fast and reliable (5/5 requests, ~1 s,
with rich licence and author metadata). Automatic fallback means that selecting
Openverse still gives you results even while it is down.

### Optional: switching to Google Images

Google is entirely optional — everything above works without it.

1. **Get an API key.** Go to
   [Custom Search JSON API](https://developers.google.com/custom-search/v1/overview),
   click *Get a Key*, and create/select a project. Copy the key.
2. **Create a search engine.** Go to the
   [Programmable Search control panel](https://programmablesearchengine.google.com/controlpanel/all),
   click *Add*, and create one. In its settings turn **Image search** ON and set
   **Search the entire web** ON. Copy the **Search engine ID** (the `cx` value).
3. **Enter them in QuickImage.** Open Settings (gear icon or `Cmd/Ctrl+,`), paste
   both into *Google Custom Search*. Google Images becomes selectable as soon as
   both are present; pick it as the image source.

Credentials are stored in the app's own data directory, never in the repo. The
free tier allows 100 searches/day; past that the app surfaces a clear rate-limit
state.

**For local development** you can instead put them in a `.env` file — copy
`.env.example` to `.env` and fill in `MAIN_VITE_GOOGLE_API_KEY` and
`MAIN_VITE_GOOGLE_CX`. They seed the settings on first run; anything typed in the
Settings panel takes precedence. `.env` is gitignored.

---

## Background removal

The first removal downloads the model once (~44 MB for *Fast* / `isnet_quint8`,
~88 MB for *High quality* / `isnet_fp16`) from img.ly's CDN, then caches it for
offline use. Inference itself always runs locally — typically ~11 s per image on
a modern laptop.

**This needs one-time outbound access to `staticimgly.com`.** On a locked-down
or proxied corporate network that download may be blocked or throttled, in which
case the editor reports that it could not download the model and everything else
in the app continues to work normally. See `TECHNICAL.md` for the details and
for the options if you need it to work fully offline.

---

## Project layout

```
src/
  main/              Electron main process
    index.ts           bootstrap: tray, hotkey, store, protocol
    overlay.ts         the panel window (vibrancy/acrylic, positioning, auto-height)
    ipc.ts             every IPC handler
    net.ts             all outbound HTTP + image download
    store.ts           atomic JSON persistence in userData
    shortcuts.ts       global hotkey registration with safe rebinding
    tray.ts            menu-bar / system-tray item
    protocol.ts        app:// scheme so the renderer has a real secure origin
  preload/index.ts   the entire renderer-facing API surface
  shared/            types + providers, used by both sides
    providers/         ImageSearchProvider interface and the three implementations
  renderer/src/      React UI
    components/        panel, grid, editor, history, settings, states
    hooks/             search, debounce, theme, auto-height
    lib/               canvas imaging, background removal, accelerators
    styles/            tokens.css (the design system) + global.css
scripts/             icon generation and the dev test harnesses
```

## Development scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run the app with hot reload |
| `npm run typecheck` | Type-check main/preload and renderer |
| `npm run build` | Typecheck + bundle everything into `out/` |
| `npm run icons` | Regenerate tray/app icons (no image dependencies) |
| `npm run selftest` | Exercise providers, fallback, download and clipboard for real |
| `npm run capture` | Screenshot every UI state into `.screenshots/` |
| `npm run test:editor` | Drive search → remove background → recolour → copy |

`design.md` documents the exact design tokens. `TECHNICAL.md` documents the
architecture, the decisions behind it, and the known issues.
