# Model Test Prompts: Claude Opus 5 vs GPT-5.6 Sol

**Purpose**: Real build tasks to run against both models, so you can compare output quality, token usage, and cost yourself. Each project below is one prompt. Ask me to add more projects any time — I'll append them as "Project 2," "Project 3," etc. below this one.

**How to run this**:
1. Open two fresh sessions — Claude Opus 5 in one, GPT-5.6 Sol in the other. No prior context in either.
2. Copy the prompt **exactly as written** into both.
3. Record tokens, time, and your quality judgment in the log table under each project.
4. Read the "For You Only" section under each project *before* you run it — it's analysis for you (feasibility, complexity, expected cost) and is explicitly **not** part of what you paste into the models.

**Lesson learned from Project 1 (applies to every project from Project 2 onward)**: Project 1 named a specific external dependency (Openverse) for the model to use, and it turned out unreliable for at least one model, forcing manual intervention that broke the 1:1 comparison. Going forward, prompts will restrict **outcome and quality bar** (what it must do, how good it must look/feel, which dated patterns are forbidden) but will **not** mandate a specific external service/library/provider when reliability is uncertain — the model should be free to pick its own working implementation for anything like that. Where a prompt *does* pin something (e.g., "single self-contained file, no external dependencies"), that's a reliability/fairness choice in the other direction — removing an external-failure risk entirely, not adding one.

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
| Claude Opus 5 | | | | | Y | | | | 5 (your words: "did best work, its really best") | Best output of the two, genuinely good. Your concern: cost. You don't want to reach for Opus this often at this price — open question below. |
| GPT-5.6 Sol | | | | | N (per your feedback) | | | | 2 (your words: "too bad, that's never a good work") | Cheapest/fastest, but the output quality itself was poor for this specific task — cost-effective doesn't help if the app doesn't actually work. |

**Your verdict (logged 2026-09-14)**: Claude Opus 5 wins on quality by a clear margin for this app-building task, but you're uneasy about Opus's cost for routine use. GPT-5.6 Sol was cheap but the result "was never a good work" — cheap + broken isn't a win.

**Open follow-up you raised**: *Can Claude Sonnet 5 do Project 1 well enough to replace Opus here, at lower cost?* Worth running Project 1 through Sonnet 5 next as a 3-way check (Opus vs Sonnet vs GPT-5.6 Sol) before concluding Opus is "required" for this class of task — flag this to me whenever you're ready to run it and I'll extend the log table to a third row.

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

---

## Project 2: Full Interactive UI Component Showcase (Dashboard-Style Single Page)

**Before you run this**, two things worth knowing (not questions that block you — I made a call on both, tell me if you want it different next time):
1. I pinned "single self-contained HTML file, vanilla JS/CSS only, no frameworks, no external libraries, no CDN links, no network calls at all." This is deliberately the *opposite* kind of constraint from the Openverse issue: instead of naming an external dependency that might fail, this removes every external dependency entirely, so there is zero chance either model's output breaks because of something outside its own code. It also means you can compare results instantly — just open both `.html` files in two browser tabs, no npm install, no build step. It does mean charts must be hand-built with SVG/Canvas rather than a charting library, which is intentional — that's a harder, more revealing test of raw capability, exactly what you said you want to see.
2. Your "all available HTML components" ask is open-ended enough that one model could build 6 solid components and the other could build 20 shallow ones, which wouldn't be a fair comparison either. So I turned it into a specific, identical checklist below — same reasoning as pinning tech stack in Project 1 for fairness, just applied to scope instead of tooling.

```
Build a single, self-contained HTML file (inline CSS and vanilla JavaScript only — no frameworks, no external libraries, no CDN links, no build tools, no network requests of any kind). It must open and fully work by double-clicking the file in a browser, with zero setup. All data shown must be realistic mock/sample data you invent and hardcode into the file.

The page has a top-level tab bar (visually similar in concept to a search engine's result-type tabs — e.g. "Overview / Data Table / Analytics / Components") that switches which section of the page is visible, without a full page reload. Each section must retain its own internal state (filters, sort order, selected timeframe, expanded rows, scroll position, etc.) when the user switches to another tab and back — switching tabs must never reset anything.

SECTION 1: DATA TABLE
Build one interactive data table (invent a realistic dataset — e.g. a company's yearly revenue/metrics by category — with at least 10 rows and at least 4 columns) with all of the following working, not just visually present:
- Click a column header to sort ascending/descending by that column.
- Each row can expand to reveal nested detail sub-rows (e.g. a breakdown of that row), collapsible on demand, plus an "expand all / collapse all" control.
- A footer row showing the sum of every numeric column, which recalculates correctly after sorting, filtering, or reordering columns.
- A control to reorder/swap the columns (e.g. move-left/move-right buttons or drag handles on the header cells).
- The first data column holds a raw base value (e.g. revenue for that row). Add at least one additional column that is a computed "Growth %" column, calculated from that base value column (e.g. period-over-period change). This computed column must keep tracking the correct base column even after columns are reordered — it should never silently start computing against the wrong column just because its visual position changed.
- A live search/filter input above the table that filters visible rows as the user types, with the footer totals and any expanded state still behaving correctly against the filtered set.
- Pagination (or a "load more") if useful for the dataset size you chose.

SECTION 2: ANALYTICS / CHARTS
Build every chart below from scratch using raw SVG or Canvas (no charting library, no CDN):
- A timeframe tab selector above the charts with at least "1Y / 3Y / 5Y" options, controlling the date range shown across every chart in this section at once, with a smooth transition when switching.
- A line chart.
- A line chart where 1-2 of the plotted lines have a soft area/gradient "shadow" fill beneath them down to the axis.
- A bar chart.
- A combo chart in the same canvas/SVG that renders bars for one series and an overlaid line for a second series together.
- Every chart must have: hover tooltips showing the exact value/date under the cursor, a legend that can toggle individual series on/off, and a smooth animated transition when the timeframe or underlying data changes.

SECTION 3: COMPONENTS
Build every one of these, fully functional (not just styled placeholders), using one consistent visual language across all of them:
- Text input, number input, textarea, and a password input with a show/hide toggle
- A custom-styled dropdown/select (not the plain native browser one) supporting keyboard navigation (arrow keys + Enter) and type-to-filter
- A multi-select tag/chip input (type to add a tag, click to remove one)
- A carousel/slider with next/prev arrows, clickable dot indicators, drag/swipe support, and autoplay that pauses on hover
- A checkbox group and a radio button group
- A toggle/switch control
- A modal/dialog that opens on demand, traps focus while open, and closes on Escape, backdrop click, or its own close button
- A toast/notification that appears after a triggering action and auto-dismisses after a few seconds
- An accordion (FAQ-style, expand/collapse sections)
- A tooltip that appears on hover/focus for at least one element
- A dual-handle range slider (e.g. a min/max price filter)
- A standalone pagination control (page numbers + prev/next)
- A progress bar and a loading-skeleton state, both demonstrated with a real trigger (e.g. a button that simulates a load)
- A breadcrumb trail
- A row of buttons demonstrating every state explicitly: default, hover, focus-visible (keyboard), active/pressed, disabled, and a loading state with a spinner

DESIGN & QUALITY RULES (read carefully — these apply across the entire page, every section, every component)
- You choose the entire visual language yourself: colors, typography, spacing scale, border-radius, shadows, iconography. Nothing is prescribed for you. But whatever you choose must be applied with total consistency everywhere — one coherent design system used identically across the table, charts, and every component, not different ad-hoc styling per section.
- Do not default to any of these three dated, over-used AI-generated patterns: (1) a warm cream/off-white background (#F4F1EA-ish) with a serif display font and a terracotta/orange accent, (2) a plain near-black dark background with a neon or acid-green accent, or (3) a dense newspaper/editorial layout with thin hairline rules everywhere. This is a 2026 product-grade dashboard — the bar is the polish level of a modern analytics product (think Linear, Stripe Dashboard, or Vercel's dashboard as reference points for craft, not for their specific colors), not a 2015 admin template or a bare Bootstrap page.
- Include a working light/dark mode toggle, with both modes fully and deliberately designed (not just an inverted CSS filter) — every color, border, and shadow should be intentionally chosen for each mode.
- Every interactive element, in every section, must have a visible hover state, a visible keyboard focus state, an active/pressed state, and a disabled state where disabling makes sense — this is a functional requirement, not optional polish.
- Every animation and transition should feel smooth and intentional, never an abrupt snap — this applies to tab switching, row expand/collapse, chart updates, modal open/close, toast entry/exit, and carousel movement alike.
- The entire page must be fully responsive and genuinely usable from a 360px-wide mobile viewport up to a 1920px desktop viewport — the table, the charts, and every component must restructure sensibly at small widths, not just shrink until it breaks.
- Everything must be genuinely accessible: correct semantic HTML elements, labels on every form control, full keyboard operability (correct tab order; Enter/Space/Escape/arrow keys behaving the way a user would expect for each component type), and visible focus indicators throughout — do not rely on mouse-only interaction anywhere.

Once the page is fully built and working, create a file named `design.md` in the project root (max 200 lines) documenting the exact design tokens you used for both light and dark mode: background/surface colors, text colors, accent/semantic colors (success/warning/error if used), border colors, the full spacing scale, border-radius scale, typography (font family/sizes/weights/line-heights), shadow values, and animation durations/easing curves — written precisely enough that the same visual system could be reproduced exactly in a separate future session without seeing this code.
```

### Log Table (fill in after running)

| Model | Input tokens | Output tokens | Total tokens | Time to complete | Opens & runs with zero setup? | # of Section 3 components fully working | Column-reorder keeps Growth% correct? | Visual quality (1-5) | Consistency across sections (1-5) | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Opus 5 | | | | | | | | | | Not explicitly rated by you against GPT for this project — your feedback singled out GPT's UI as the standout result here. Fill in your own score if you want a direct side-by-side. |
| GPT-5.6 Sol | | | | | few minutes | | | 5 (your words: "best ui") | | Fastest turnaround ("just few mins") AND best visual result of the two, by your own review — a clean win for GPT-5.6 Sol on this specific UI-heavy task, opposite of the Project 1 result. |

**Your verdict (logged 2026-09-14)**: GPT-5.6 Sol produced the best UI, fast. This flips the Project 1 outcome — worth noting as a real data point that **task type**, not brand loyalty, decided the winner here: Claude won the "build a real working desktop app with system integration" task, GPT won the "build a polished, comprehensive UI" task. That's a direct, first-hand confirmation of the "route by task, not brand loyalty" principle from `notes/completed/07.real-world-user-experiences.md` and `QUESTIONS_ANSWERED.md` Q2 — not a contradiction of Claude's general strength, just evidence it isn't universal either.

### For You Only — Not Part of the Prompt (feasibility, complexity, cost estimate)

**Is this possible in one file?** Yes, technically — everything asked for (sortable/expandable tables, hand-built SVG charts, carousels, modals, custom dropdowns) is standard vanilla-JS territory with no exotic browser APIs required. The honest risk isn't "can it be done," it's **length**: this is a large amount of distinct functionality (table + 4 chart types + ~15 components) crammed into one file with a real design system applied consistently, which is a lot to generate correctly in a single response.

**What to actually watch for when you compare them**: because this is a big single-shot ask, expect one or both models to do one of three things, and it's worth noting *which* each one does, since it's itself a meaningful capability signal:
1. Genuinely deliver everything, complete and working, in one response.
2. Deliver most of it well but visibly cut corners on 2-4 of the Section 3 components (e.g., a tooltip that's just a CSS `title` attribute instead of a real component) to fit.
3. Explicitly say it's continuing in a follow-up message/response due to length, and need a "continue" prompt from you.
Don't automatically penalize option 3 as worse than option 2 — a model that's honest about needing more room and then actually delivers a fully correct rest is arguably better engineering judgment than one that silently under-builds several components to appear "done" in one shot. Judge on what's actually correct and complete at the end, not on whether it fit in exactly one message.

**The most interesting single test in here**: the Growth % column staying correctly bound to its base column after a column reorder. This is a small detail buried in a big prompt, but it's a real state-management/data-binding correctness test that's easy to get subtly wrong (e.g., hardcoding "column index 1" instead of tracking the actual data field) — worth checking by hand in both outputs rather than trusting it visually looks fine.

**Estimated tokens/cost, Claude Opus 5 vs GPT-5.6 Sol**: This is the largest single-file ask in this project set so far — expect a long response regardless of model:

| | Input tokens | Output tokens | Approx. cost (single pass, if it fits) |
|---|---|---|---|
| Claude Opus 5 ($5/$25 per M) | ~1,100-1,400 | ~18,000-28,000+ (may hit practical response-length limits given everything asked for) | ~$0.46-0.71+ |
| GPT-5.6 Sol ($5/$30 per M, approx.) | ~850-1,050 | ~12,000-20,000 | ~$0.36-0.60 |

These are rougher estimates than Project 1's, precisely because of the length risk noted above — if either model splits its answer across 2-3 continuation turns, multiply the output-token cost accordingly (each continuation re-sends the prior output as input context too, so a 3-turn completion costs meaningfully more than 3x a single clean turn, not exactly 3x). Given Claude's tokenizer counts the same code as roughly 1.5-1.7x more tokens than GPT's (see `QUESTIONS_ANSWERED.md` Q9), and this prompt is almost entirely code, expect that gap to show up clearly in your logged numbers here.
