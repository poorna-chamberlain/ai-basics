# Model Test Prompts: Claude Opus 5 vs GPT-5.6 Sol

**Purpose**: Real build tasks to run against both models, so you can compare output quality, token usage, and cost yourself. Each project below is one prompt. Ask me to add more projects any time — I'll append them as "Project 2," "Project 3," etc. below this one.

**How to run this**:
1. Open two fresh sessions — Claude Opus 5 in one, GPT-5.6 Sol in the other. No prior context in either.
2. Copy the prompt **exactly as written** into both.
3. Record tokens, time, and your quality judgment in the log table under each project.
4. Read the "For You Only" section under each project *before* you run it — it's analysis for you (feasibility, complexity, expected cost) and is explicitly **not** part of what you paste into the models.

---

## Project 1: Global-Hotkey Image Search + Background Remover (Desktop App)

```
Build a cross-platform desktop application named "QuickImage" using Electron + Node.js, with a React + TypeScript renderer bundled via Vite (electron-vite or vite-plugin-electron). This must be a real, runnable desktop app — not a browser page pretending to be one. It needs actual Electron main-process code: BrowserWindow management, a system tray icon, globalShortcut registration, and native OS clipboard access.

CORE BEHAVIOR

1. Global hotkey overlay
   - Register a global keyboard shortcut (default: Alt+Shift+I on both Windows and macOS) that toggles a floating overlay window from anywhere on the OS, even when the app has no focus.
   - The overlay is frameless, centered in the upper-third of the screen, always-on-top, with a translucent/blurred backdrop (vibrancy on macOS, acrylic/backdrop-filter fallback on Windows), rounded corners, and a soft elevation shadow — the visual quality bar is macOS Spotlight / Raycast / Alfred, not a plain browser window with square corners and a white background.
   - It fades and scales in on open (150-200ms), and closes on Escape, on losing focus, or by pressing the hotkey again.
   - Respects system light/dark mode automatically.

2. Image search
   - A single text input at the top of the overlay. As the user types (debounced), the app searches for images and renders results as a responsive, lazy-loaded image grid directly below the input, inside the same overlay.
   - Build image search behind a pluggable provider interface (e.g. an `ImageSearchProvider` with a single `search(query, page)` method) with at least two concrete providers:
     a. **OpenverseProvider** (default, active out of the box, no setup required): calls the free, public Openverse API (`https://api.openverse.org/v1/images/?q=<query>`), which requires no API key or signup for anonymous use (rate-limited but sufficient for personal use). This must work the moment the app is installed, with zero configuration.
     b. **GoogleCustomSearchProvider** (optional upgrade, disabled until configured): calls the Google Custom Search JSON API with `searchType=image`, reading the API key and Custom Search Engine ID (cx) from user-provided config (a `.env` file for local dev, and a Settings panel that writes to persisted app storage). Do not hardcode credentials, and do not scrape Google's HTML directly.
   - The Settings panel lets the user pick the active provider (Openverse / Google), and only shows Google as usable once both a key and cx are entered. Design the provider interface so a third provider could be added later without touching the UI code.
   - Handle and visually distinguish: loading state (skeleton placeholders), empty state (no query yet), no-results state, and API-error/rate-limit state — and show which provider is currently active somewhere subtle in the UI (e.g. a small label near the settings icon).

3. Selecting and editing an image
   - Clicking a thumbnail opens a preview/edit view (still inside the overlay or in a secondary window — your choice, but state which) showing the full image and these actions:
     - "Remove background" — process the image client-side using a local ML/WASM-based background removal library (e.g. a package like @imgly/background-removal, or an equivalent that runs fully offline without a paid third-party API), with a visible progress/processing indicator since this can take a few seconds.
     - "Set background: White / Black / Transparent" — after background removal, let the user pick a solid backing color or keep it transparent, with a live preview of the result.
     - "Copy to clipboard" — copies the actual current image (post-editing) as real image data to the OS clipboard using Electron's native clipboard API, so it can be pasted directly into any other app (Slack, Docs, Figma, Mail, etc.) with a normal Cmd/Ctrl+V. Confirm with a brief toast when copied.

4. History tab
   - A second tab/section in the overlay listing previously searched queries and previously selected/edited images (with thumbnails), persisted locally across app restarts. Clicking a history thumbnail reopens the edit view for it (re-copy, re-edit).

5. Settings
   - A settings panel where the user can rebind the global hotkey to a different combination, and enter/update the Google API key and CX. Changes persist across restarts.

DELIVERABLE FORMAT
Return a complete, runnable project: full folder structure, package.json with every dependency and scripts (`npm install`, `npm run dev` to launch the app in development, `npm run build` to produce a packaged installer for both macOS (.dmg) and Windows (.exe/.msi) via electron-builder), main process source, preload script, renderer source, and a README explaining setup — including confirming that image search works immediately after `npm install && npm run dev` with zero configuration (via Openverse), plus a separate, clearly marked optional section on where to get a Google Custom Search API key and CX and how to add them later to switch providers. Do not use pseudocode or "// implement this" placeholders in core logic — write real, working code for every feature listed above.

DESIGN QUALITY (read carefully, this matters as much as functionality)
AI-generated UIs default to a small set of dated, recognizable clichés: warm cream backgrounds with a serif font and a terracotta/orange accent, or a plain near-black dark mode with a neon/acid-green accent, or a dense newspaper-style layout with hairline rules. Do not produce any of these. This is a 2026 native launcher-style app — it should look and feel like a premium, modern OS-level tool, comparable in visual polish to Raycast or Spotlight, not like a 2015 web admin dashboard.

Once the app is fully built and working, create a file named `design.md` in the project root (max 200 lines) documenting the exact design tokens used for both light and dark mode: background/surface colors, text colors, accent color, border colors, backdrop-blur value, border-radius scale, spacing scale, font family/sizes/weights, shadow values, and animation durations/easing — written precisely enough that the same visual system could be reproduced exactly in a separate future session without seeing this code.
```

### Log Table (fill in after running)

| Model | Input tokens | Output tokens | Total tokens | Time to complete | Actually runs? (Y/N) | Hotkey works? | Background removal works? | Clipboard copy works? | Visual quality (1-5) | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Opus 5 | | | | | | | | | | |
| GPT-5.6 Sol | | | | | | | | | | |

### For You Only — Not Part of the Prompt (feasibility, complexity, cost estimate)

**Is this possible?** Yes — this is essentially "Spotlight/Raycast + Google Image Search + client-side background removal," and every piece already exists as a real, working pattern:
- Global hotkeys + floating overlay window: Electron's `globalShortcut` + a frameless always-on-top `BrowserWindow` is exactly how Raycast-style launchers are built.
- Client-side background removal without a paid API: real npm packages (e.g. `@imgly/background-removal`) run an ONNX/WASM segmentation model directly in the renderer — no server, no per-image API cost, works offline after first model download (~10-40MB).
- Native clipboard image copy: Electron's `clipboard.writeImage()` is a built-in, first-class API on both macOS and Windows.
- Image search: since you don't have a Google API key yet, the prompt now defaults to the **Openverse API** (`api.openverse.org`) — a real, free, public image-search API that genuinely requires **zero signup or key** for anonymous use (rate-limited to ~1 request/second, 20 results/page, which is plenty for personal use). This means the app will actually return real search results the moment it's built, with no setup step blocking you. Google's **Custom Search JSON API** (which does legitimately support `searchType=image`, unlike scraping google.com/images, which breaks ToS and breaks constantly) is wired in as a second, optional provider you can switch to later once you get a key — free for 100 queries/day, then ~$5 per 1,000 queries after that.

**How complicated is it, realistically?** Medium-High for a first project, but very achievable:
- Easy/well-trodden parts: global hotkey, overlay window, settings persistence, search UI, clipboard copy.
- The genuinely fiddly parts you should expect to iterate on by hand afterward: macOS requires Accessibility/Input-Monitoring permission prompts for global shortcuts to work reliably (first-run UX for this is easy to get wrong); Windows sometimes has hotkey conflicts with other running software; background-removal quality/speed varies a lot by image; and `electron-builder` code-signing for a distributable macOS `.dmg` needs an Apple Developer account if you want to avoid Gatekeeper warnings (not needed for just running it on your own machine).
- Realistic expectation: a strong model will likely get you a working dev-mode app (`npm run dev` launches it, hotkey works, search works) in one solid pass, with background removal and the production installer build being the parts most likely to need a follow-up fix-it prompt.

**Estimated tokens/cost, Claude Opus 5 vs GPT-5.6 Sol**: This is a genuinely large, multi-file scaffold (main process, preload, several renderer components, settings store, IPC wiring, electron-builder config, README) — expect a big single response, roughly in this range for one full generation pass in a plain chat (not an agentic multi-turn build):

| | Input tokens | Output tokens | Approx. cost (single pass) |
|---|---|---|---|
| Claude Opus 5 ($5/$25 per M) | ~1,000-1,300 (Claude's tokenizer counts the same prompt as more tokens) | ~12,000-18,000 (Claude tends to be more verbose, and its tokenizer inflates code ~1.5-1.7x vs GPT's) | ~$0.31-0.46 |
| GPT-5.6 Sol ($5/$30 per M, approx.) | ~750-950 | ~8,000-12,000 | ~$0.25-0.37 |

Treat these as rough order-of-magnitude estimates, not guarantees — actual numbers depend heavily on how much of the app each model tries to write in one shot vs. how much it summarizes/truncates. If you run this through an **agentic coding tool** (Cursor/Claude Code/Codex CLI) instead of a single chat message — which is realistically how you'd actually want to build this, since it needs to create a real multi-file project, install dependencies, and iterate — expect total cost to be several times higher than the single-pass estimate above (context gets re-sent every turn, and you'll likely go through multiple fix-it rounds for the permission/packaging issues mentioned above). A realistic full build-to-working-app budget through an agent is more likely **$1-4 total**, not the single-pass number above, and Claude's tokenizer/verbosity gap will compound turn-over-turn exactly as described in `QUESTIONS_ANSWERED.md` Q9.
