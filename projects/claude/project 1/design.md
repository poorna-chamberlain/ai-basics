# QuickImage — Design System

Everything here is implemented in `src/renderer/src/styles/tokens.css`. This
document is the specification; the CSS is the copy.

**Concept: smoked glass over the desktop.** A cool graphite surface at partial
opacity sitting on a *native* OS blur, one blue-violet accent, and no decorative
colour anywhere else. Colour belongs to the user's images, never to the chrome.
Reference points are Spotlight and Raycast, not a web dashboard.

## Colour — Light

| Token | Value | Use |
| --- | --- | --- |
| `--surface` | `rgba(252, 252, 253, 0.76)` | Panel body, over the native blur |
| `--surface-solid` | `#fcfcfd` | Opaque contexts: toasts, segmented thumb |
| `--layer-1` | `rgba(9, 9, 11, 0.035)` | Inputs, option cards, chips, skeleton base |
| `--layer-2` | `rgba(9, 9, 11, 0.055)` | Raised layer, progress track |
| `--layer-hover` | `rgba(9, 9, 11, 0.05)` | Hover fill |
| `--layer-pressed` | `rgba(9, 9, 11, 0.08)` | Active/pressed fill |
| `--text-primary` | `#17171b` | Titles, input text, body |
| `--text-secondary` | `rgba(23, 23, 27, 0.64)` | Descriptions, icon buttons at rest |
| `--text-tertiary` | `rgba(23, 23, 27, 0.42)` | Placeholders, hints, section labels |
| `--text-on-accent` | `#ffffff` | Text on accent fills |
| `--border-subtle` | `rgba(9, 9, 11, 0.08)` | Hairlines, dividers, default edges |
| `--border-strong` | `rgba(9, 9, 11, 0.14)` | Swatch rings, scrollbar thumb |
| `--border-accent` | `rgba(91, 91, 214, 0.45)` | Focus/selected edges |
| `--accent` | `#5b5bd6` | Single accent: selection, primary button, links |
| `--accent-hover` | `#5151c4` | Primary button hover |
| `--accent-soft` | `rgba(91, 91, 214, 0.12)` | Selected row/option tint |
| `--accent-soft-hover` | `rgba(91, 91, 214, 0.18)` | Selected + hover |
| `--danger` | `#d13438` | Errors, destructive hover |
| `--danger-soft` | `rgba(209, 52, 56, 0.12)` | Error icon background |
| `--success` | `#10814a` | Healthy provider dot, copy confirmation |
| `--skeleton-base` | `rgba(9, 9, 11, 0.05)` | Skeleton ground |
| `--skeleton-sheen` | `rgba(9, 9, 11, 0.09)` | Skeleton sweep highlight |
| `--checkerboard-a` / `-b` | `#ffffff` / `#e9e9ee` | Transparency checkerboard |

## Colour — Dark

| Token | Value | Use |
| --- | --- | --- |
| `--surface` | `rgba(23, 23, 27, 0.72)` | Panel body, over the native blur |
| `--surface-solid` | `#17171b` | Opaque contexts |
| `--layer-1` | `rgba(255, 255, 255, 0.045)` | Inputs, option cards, chips |
| `--layer-2` | `rgba(255, 255, 255, 0.07)` | Raised layer, progress track |
| `--layer-hover` | `rgba(255, 255, 255, 0.065)` | Hover fill |
| `--layer-pressed` | `rgba(255, 255, 255, 0.1)` | Active/pressed fill |
| `--text-primary` | `rgba(255, 255, 255, 0.94)` | Titles, input text, body |
| `--text-secondary` | `rgba(255, 255, 255, 0.62)` | Descriptions |
| `--text-tertiary` | `rgba(255, 255, 255, 0.4)` | Placeholders, hints, section labels |
| `--text-on-accent` | `#ffffff` | Text on accent fills |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Hairlines, dividers |
| `--border-strong` | `rgba(255, 255, 255, 0.15)` | Swatch rings, scrollbar thumb |
| `--border-accent` | `rgba(126, 123, 240, 0.55)` | Focus/selected edges |
| `--accent` | `#7e7bf0` | Single accent (lifted for dark contrast) |
| `--accent-hover` | `#908df7` | Primary button hover |
| `--accent-soft` | `rgba(126, 123, 240, 0.18)` | Selected row/option tint |
| `--accent-soft-hover` | `rgba(126, 123, 240, 0.26)` | Selected + hover |
| `--danger` | `#ff6369` | Errors |
| `--danger-soft` | `rgba(255, 99, 105, 0.16)` | Error icon background |
| `--success` | `#3dd68c` | Healthy provider dot |
| `--skeleton-base` | `rgba(255, 255, 255, 0.055)` | Skeleton ground |
| `--skeleton-sheen` | `rgba(255, 255, 255, 0.11)` | Skeleton sweep highlight |
| `--checkerboard-a` / `-b` | `#2a2a30` / `#212126` | Transparency checkerboard |

Theme resolution: the main process sets `nativeTheme.themeSource` from the user
preference, so `prefers-color-scheme` already reflects it; the renderer mirrors
that onto `<html data-theme="light|dark">`.

## Backdrop

Real translucency is the OS's job, not CSS's — `backdrop-filter` cannot blur the
desktop behind a window.

| Platform | Technique | Window |
| --- | --- | --- |
| macOS | `vibrancy: 'under-window'`, `visualEffectState: 'active'` | opaque, natively masked |
| Windows 11 (≥ 22000) | `backgroundMaterial: 'acrylic'` | opaque, natively masked |
| Everything else | `transparent: true` + CSS | CSS-rounded, CSS-blurred |

- `--backdrop-blur: 30px`, `--backdrop-saturate: 180%` — applied as
  `backdrop-filter: blur(30px) saturate(180%)` on `.panel`. Only does real work
  in the fallback mode.
- Fallback surfaces go near-opaque so text stays legible without a real blur:
  light `rgba(250, 250, 252, 0.94)`, dark `rgba(22, 22, 26, 0.94)`.
- `--edge-highlight` — a 1px inner top highlight that sells the glass edge:
  light `inset 0 1px 0 rgba(255,255,255,0.6)`, dark `inset 0 1px 0 rgba(255,255,255,0.08)`.
- The panel also carries a full `1px solid var(--border-subtle)` inset ring so it
  reads as an object rather than a region of blur.

## Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | `5px` | Keycaps, badges, segmented items |
| `--radius-sm` | `7px` | Buttons, inputs, icon buttons |
| `--radius-md` | `10px` | Thumbnails, option cards, canvas frame |
| `--radius-lg` | `14px` | State icon tiles |
| `--radius-xl` | `18px` | Large cards (reserved) |
| `--radius-full` | `999px` | Chips, toasts, switches, dots |
| `--radius-window` | `12px` mac · `8px` Win 11 · `14px` fallback | Panel corners, matched to the OS mask |

## Spacing

4px-derived, with 2px and 6px steps for dense controls.

`--space-1: 2px` · `--space-2: 4px` · `--space-3: 6px` · `--space-4: 8px` ·
`--space-5: 12px` · `--space-6: 16px` · `--space-7: 20px` · `--space-8: 24px` ·
`--space-9: 32px`

Layout constants: `--panel-header-height: 68px`,
`--panel-footer-height: 34px`, `--thumb-min-width: 126px`, panel width `720px`,
max panel height `660px`, editor stage height `336px`, grid gap `--space-4`,
grid padding `12px 16px`.

## Typography

```
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text',
             'Segoe UI', 'Inter', system-ui, 'Helvetica Neue', sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
```

The system UI font is deliberate: the app should look like part of the OS. The
mono stack is used only for credential fields, where character shapes matter.

| Token | Size | Use |
| --- | --- | --- |
| `--text-2xs` | `10.5px` | Keycaps, badges, section labels, tile captions |
| `--text-xs` | `11.5px` | Hints, footer, chips, option descriptions |
| `--text-sm` | `12.5px` | Buttons, inputs, list rows |
| `--text-base` | `13.5px` | Body default, state titles, editor title |
| `--text-lg` | `15px` | Reserved emphasis |
| `--text-xl` | `19px` | The search field only |

Weights: `--weight-regular: 400` (body, search field), `--weight-medium: 500`
(buttons, titles, active items), `--weight-semibold: 600` (uppercase section
labels). Line height `--leading-tight: 1.25` for headings/captions,
`--leading-normal: 1.45` for body. Tracking `--tracking-tight: -0.01em` on the
large search field, `--tracking-wide: 0.02em` on uppercase labels.

Uppercase section labels are always `--text-2xs` / 600 / `--tracking-wide` /
`--text-tertiary`.

## Shadows

Window shadow is the OS's (`hasShadow: true`); these are for in-panel elevation.

| Token | Light | Dark |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(15,15,25,.07), 0 1px 1px rgba(15,15,25,.04)` | `0 1px 2px rgba(0,0,0,.3)` |
| `--shadow-md` | `0 4px 12px rgba(15,15,25,.1), 0 1px 3px rgba(15,15,25,.06)` | `0 4px 14px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.3)` |
| `--shadow-lg` | `0 16px 40px rgba(15,15,25,.18), 0 4px 10px rgba(15,15,25,.08)` | `0 18px 48px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.35)` |
| `--shadow-accent` | `0 2px 10px rgba(91,91,214,.3)` | `0 2px 12px rgba(126,123,240,.35)` |

Borders are drawn as `inset 0 0 0 1px` box-shadows rather than `border`, so they
never affect layout and can be swapped for an accent ring on focus.

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--duration-instant` | `90ms` |
| `--duration-fast` | `130ms` |
| `--duration-base` | `180ms` |
| `--duration-slow` | `260ms` |
| `--duration-overlay` | `170ms` |

`--ease-out` is an expo-out curve — fast departure, long soft settle — and is the
default for everything. It is what makes the panel feel like a launcher rather
than a web page.

- **Panel enter**: `opacity 0 → 1`, `scale(0.97) → 1`, `translateY(-6px) → 0` over
  `--duration-overlay` with `--ease-out`.
- **Hover/press feedback**: `--duration-fast`. Thumbnails lift `translateY(-2px)`
  on hover and settle to `scale(0.985)` on press.
- **Thumbnail fade-in on decode**: `--duration-slow`.
- **Toast enter**: `--duration-base` with `--ease-spring` (a slight overshoot;
  the only place spring is used).
- **Switch thumb**: `--duration-base`.
- **Skeleton sweep**: `1.4s` `--ease-in-out`, infinite, 200% background sweep.
- **Indeterminate progress**: `1.1s` `--ease-in-out`, infinite.
- **Spinner**: `0.7s` linear, infinite.

All durations collapse to `0ms` under `prefers-reduced-motion: reduce`.

## Rules of thumb

1. One accent colour. If something needs to stand out and is not the primary
   action or the current selection, it is wrong.
2. Depth comes from translucency and hairlines, never from heavy borders or
   large shadows on small elements.
3. The images are the content. Chrome stays graphite and quiet; captions appear
   only on hover.
4. No pure black and no pure white as surfaces — `#17171b` and `#fcfcfd` keep the
   panel feeling like glass rather than paper.
