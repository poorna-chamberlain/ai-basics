# QuickImage — Development Approach & Technical Notes

Written for review. Covers how the app is put together, the decisions that were
made and why, what was verified and how, and what is still open.

---

## 1. Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Shell | Electron 44 | Real BrowserWindow, tray, `globalShortcut`, native clipboard |
| Bundler | electron-vite 5 (Vite 7) | One config for main/preload/renderer, correct Electron targets |
| UI | React 19 + TypeScript 5.9 | — |
| Packaging | electron-builder 26 | `.dmg`, NSIS `.exe`, `.msi` from one config |
| Segmentation | `@imgly/background-removal` 1.7 | ISNet via ONNX Runtime WASM, runs locally, no paid API |
| Persistence | hand-rolled JSON store | Avoids the ESM/CJS friction of `electron-store` in the main bundle; ~90 lines, atomic writes |

No CSS framework and no icon package: the design system is ~40 custom
properties, and the icons are hand-written SVG so their stroke weight matches
the type.

## 2. Process architecture

```
main                            preload                renderer
────                            ───────                ────────
overlay window lifecycle   ──►  contextBridge     ──►  React UI
tray + globalShortcut           window.quickImage      providers run here?  No:
JSON store (userData)           (explicit, hand-        they call back through
ALL outbound HTTP (net.ts)       written surface)       IPC into main
clipboard write
app:// protocol
```

`contextIsolation: true`, `nodeIntegration: false`, and no raw `ipcRenderer` is
exposed — the renderer can only call the named methods in `src/preload/index.ts`.

### Why all HTTP lives in the main process

Provider `search()` calls and image downloads both go through
`src/main/net.ts`, using Electron's `net.fetch`:

1. **No CORS.** Wikimedia, Openverse and Google would otherwise need per-origin
   CORS cooperation from a `app://` renderer.
2. **Untainted canvas.** Images are downloaded in main and handed to the
   renderer as data URLs. A canvas drawn from a cross-origin `<img>` is tainted,
   and `toDataURL()` throws — which would break both background removal and
   clipboard export. This is the single most important structural decision in
   the app.
3. One place for timeouts, aborts and the user agent.

Providers stay decoupled from this: they receive an injected `HttpClient`
(`getJson`), so the same provider classes would work against `fetch` in a test.

### `app://` instead of `file://`

The packaged renderer is served by a custom scheme registered as
`standard + secure + supportFetchAPI`. A `file://` page has an opaque origin,
which breaks Web Workers, WASM instantiation and Cache Storage — all of which
background removal needs. Path traversal is rejected in the handler.

## 3. The overlay window

The hard part of "looks like Spotlight, not a browser window" is that
`backdrop-filter` **cannot** blur the desktop behind a window; only the OS can.

- **macOS** — `vibrancy: 'under-window'`, opaque window, `roundedCorners: true`.
  macOS masks the window and draws the shadow.
- **Windows 11** — `backgroundMaterial: 'acrylic'`, DWM rounds and shadows it.
- **Anything else** — `transparent: true`, corners and blur done in CSS, surface
  pushed to 94% opacity so text stays readable without a real blur.

Because a transparent window cannot host a native material, the two paths are
mutually exclusive; `surfaceMode` is reported to the renderer and drives
`<html data-surface>` so the CSS can compensate (see `design.md`).

Other details worth knowing:

- `setAlwaysOnTop(true, 'screen-saver')` + `setVisibleOnAllWorkspaces` is what
  puts the panel above full-screen apps.
- The app is an accessory (`LSUIElement`, `app.dock.hide()`), so it must call
  `app.focus({ steal: true })` on show or keystrokes won't reach the field, and
  `app.hide()` on close to return focus to the previous app.
- Hide-on-blur is suppressed for 200 ms around `show()` and whenever DevTools is
  open, otherwise the panel is undebuggable.
- **Auto-height**: the panel sizes to its content and a `ResizeObserver` reports
  that height over IPC, which resizes the OS window. This is why nothing in the
  CSS may be `height: 100%` — that would make the measurement circular.

## 4. Provider abstraction

`ImageSearchProvider` is one method:

```ts
search(query, page, settings, signal): Promise<SearchResponse>
```

plus metadata (`label`, `description`, `requiresKey`, `isConfigured`). The
settings picker and the active-provider chip render from
`registry.describe(settings)`, so **a fourth provider is a new class plus one
line in `createProviderRegistry` — no UI file changes.**

Failures must be thrown as `SearchError` with a `kind`
(`network | rate_limit | unauthorized | not_configured | unknown`), which is what
lets the UI distinguish a rate limit from an outage. `kind` survives IPC because
handlers return a discriminated `IpcResult` value rather than rejecting — an IPC
rejection would flatten everything into a string.

### Automatic fallback

`ProviderRegistry.search` retries with another key-free provider when the
selected one fails, and stamps the response with `servedBy` / `fellBackFrom` so
the footer chip can say so. Only key-free providers are fallback candidates:
silently spending a user's metered Google quota would be wrong.

### Why Wikimedia is the default instead of Openverse

The brief specified Openverse as the zero-config default. It was implemented as
specified, but measured before being trusted:

| Provider | Result |
| --- | --- |
| Openverse | Repeated timeouts on fresh queries; only edge-cached variants responded; `openverse.org` itself returned `502`; one run returned `401/403`. Failed regardless of user agent. |
| Wikimedia Commons | 5/5 successes, ~1 s, with thumbnails, author and licence metadata. |

Since the hard requirement was that search work the instant the app is
installed, the default was switched to Wikimedia Commons and Openverse was kept
as a selectable provider covered by automatic fallback. Openverse's timeout is
deliberately short (8 s) so falling back still feels responsive.

One real finding worth recording: Openverse's edge **stalls on unusual
`User-Agent` strings**. A plain browser-shaped UA is used in `net.ts` for that
reason.

## 5. Editing pipeline

1. Main downloads the original → data URL (untainted canvas).
2. `downscaleIfHuge` caps the long edge at 2048px; ISNet's input is 1024px, so
   above that is wasted CPU.
3. `removeBackground(..., { proxyToWorker: true })` → transparent PNG.
4. Backing colour is composited **from the cut-out every time**, never from the
   previous composite, so white → black → transparent is lossless.
5. Copy: `nativeImage.createFromDataURL` → `toPNG()` →
   `clipboard.write([new ClipboardItem({ 'image/png': Blob })])`.

Note that Electron 44 **removed the legacy clipboard API** (`clipboard.writeImage`,
`clipboard.write({ image })`). The current API is the W3C-shaped async
`ClipboardItem` one above. `image/png` alone is written deliberately — it is the
flavour Slack, Docs, Figma and Mail all accept as a pasteable picture.

History stores the *transparent cut-out* (not the composite) plus a downscaled
PNG thumbnail, so reopening an item restores full re-colouring ability without
re-downloading or re-running the model.

## 6. What was verified, and how

Three harnesses under `scripts/`, run against the real app wiring rather than
mocks:

- **`npm run selftest`** — providers, fallback, image download, clipboard.
  Result: all pass except the Openverse direct search, which fails as expected
  and is rescued by fallback.
- **`npm run capture`** — screenshots every UI state, light and dark, into
  `.screenshots/`. Used to actually *look* at the UI rather than assume.
- **`npm run test:editor`** — drives search → open → remove background →
  recolour → copy, and measures real pixel alpha to confirm the cut-out is
  genuinely transparent and that backing colours fill it. All checks pass:
  removal in ~11 s, 46.2% of pixels transparent (from 0%), white/black backings
  fill to 0% transparent, and returning to transparent restores exactly 46.2% —
  proving the recolour is lossless.

Four real bugs were found this way and fixed:

1. **Theme race** — `useTheme` read `prefers-color-scheme` during render but
   subscribed in an effect, so a change landing in between was missed
   permanently. Fixed by re-reading immediately after subscribing.
2. **Default input border** — the CSS reset covered `button` but not `input`, so
   settings fields showed the UA's heavy dark border in light mode.
3. **Editor torn down on hide** — hiding the overlay reset the view, abandoning
   an in-flight background removal the moment the panel lost focus. The view is
   now preserved across hide/show.
4. **CSP blocked background removal** — the most consequential one. `script-src`
   allowed `'wasm-unsafe-eval'` but not `'unsafe-eval'`, and ONNX Runtime
   instantiates its emscripten glue by evaluating it as a string. Removal failed
   with an `EvalError` a few seconds in, and because the failure surfaced as a
   toast that auto-dismisses, it looked like a silent hang.

   The diagnosis came from a contrast: the same library ran fine in a standalone
   probe page, which had *no* CSP, but failed inside the app, which has a strict
   one. Fixed by adding `'unsafe-eval'` to `script-src`, with the rationale
   recorded in a comment in `src/renderer/index.html`.

## 7. Known issues / open items

- **Background removal needs one-time access to `staticimgly.com`** to fetch the
  model (~44 MB *Fast* / ~88 MB *High quality*), after which it is cached and
  runs offline. On a restricted or proxied corporate network that download may
  be blocked or slow; the editor reports it clearly and the rest of the app is
  unaffected. **No attempt was made to work around any network policy.** To run
  fully offline from first launch, vendor the `@imgly/background-removal-data`
  assets locally and point the library's `publicPath` at them.
- **`'unsafe-eval'` is enabled in the renderer CSP.** Required by ONNX Runtime
  (see above). It is a real if contained weakening: the renderer only executes
  our own bundled code over `app://`, never loads remote pages, and keeps
  `contextIsolation` on with no Node access. Removing the dependency, or moving
  inference into a separate isolated window, would let it be dropped.
- **WASM runs single-threaded.** ONNX Runtime wants `crossOriginIsolated`, which
  needs COOP/COEP headers on the `app://` responses. Adding
  `Cross-Origin-Embedder-Policy: credentialless` would enable multi-threading
  (roughly a 4–8× speedup, on top of the current ~11 s) but risks breaking
  remote thumbnail loading, so it was left off pending testing.
- **Packaging was not run to completion on this machine.** `electron-builder`
  fails at `unable to get local issuer certificate` while fetching its own
  toolchain, because the corporate TLS-inspecting proxy's root CA is not in
  Node's trust store. This is environmental, not a config error — the
  `electron-builder.yml` targets are unexercised rather than known-broken. The
  fix is to trust the corporate CA properly (`NODE_EXTRA_CA_CERTS` pointing at
  the company root certificate), which is an IT decision, not something to work
  around. Everything up to and including `npm run build` succeeds.
- **Builds are unsigned.** `identity: null`, `notarize: false`. Real
  distribution needs signing credentials.
- Google Custom Search paging is capped by the API at `start <= 91` (~10 pages).
- `npm install` may skip Electron's binary download; see the README note.

## 8. Repo conventions

- `src/shared/` is imported by all three processes and must stay free of
  Electron and DOM APIs.
- Borders are `inset` box-shadows, never `border`, so they never shift layout.
- Comments explain constraints and decisions, not mechanics.
