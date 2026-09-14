# Northwind Atlas — Design Tokens

Single-file dashboard (`index.html`). Visual language: cool slate neutrals, indigo-violet primary,
teal secondary. Every value below is the literal value used in the stylesheet, so the system can be
rebuilt exactly without the original code. All tokens are CSS custom properties on `:root`
(light) and `[data-theme="dark"]`.

## 1. Typography

| Token | Value |
| --- | --- |
| `--font-sans` | `"Inter var","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif` |
| `--font-mono` | `ui-monospace,"SF Mono","JetBrains Mono","Roboto Mono",Menlo,Consolas,monospace` |

Size ramp (rem / px at 16px root):

| Token | rem | px | Typical use |
| --- | --- | --- | --- |
| `--fs-10` | 0.6875 | 11 | badge text, window chrome, micro labels |
| `--fs-20` | 0.75 | 12 | hints, captions, legends, numeric cells |
| `--fs-30` | 0.8125 | 13 | body-small, buttons, table body, inputs' labels |
| `--fs-40` | 0.875 | 14 | base body size, inputs, card titles (chart) |
| `--fs-50` | 1 | 16 | card titles, modal title, slide title |
| `--fs-60` | 1.125 | 18 | KPI value (mobile), window stat |
| `--fs-70` | 1.375 | 22 | section `h2`, KPI value |
| `--fs-80` | 1.75 | 28 | carousel art glyph |
| `--fs-90` | 2.125 | 34 | reserved display size |

Fluid display sizes (marketing surface only):
`hero h1: clamp(2.1rem, 4.6vw, 3.6rem)/1.03`, `home-head h2: clamp(1.5rem, 2.8vw, 2.125rem)`,
`cta-band h2: clamp(1.5rem, 3vw, 2.25rem)`, `price amount: 2.25rem`, `quote: clamp(1rem, 1.8vw, 1.375rem)/1.5`.

Weights: `--fw-regular 400`, `--fw-medium 500`, `--fw-semibold 600`, `--fw-bold 700`.
Line-heights: `--lh-tight 1.15`, `--lh-snug 1.35`, `--lh-normal 1.55` (body default).
Letter-spacing: `--tracking-tight -0.011em` (titles), `--tracking-caps 0.06em` (uppercase eyebrows/labels);
display headings use `-0.03em` to `-0.042em`. All numerals use `font-variant-numeric: tabular-nums`.

## 2. Spacing scale (4px base)

`--sp-1 4px`, `--sp-2 8px`, `--sp-3 12px`, `--sp-4 16px`, `--sp-5 20px`, `--sp-6 24px`,
`--sp-7 32px`, `--sp-8 40px`, `--sp-9 48px`, `--sp-10 64px`.

Conventions: card padding `--sp-5`; card head/body dividers at `--sp-5` (drops to `--sp-4` ≤720px);
grid/stack gaps `--sp-3`/`--sp-4`; section rhythm `--sp-7`; homepage section rhythm `--sp-10` (`--sp-8` ≤640px).
Shell: `max-width 1440px`, horizontal padding `--sp-6` (`--sp-4` ≤720px). Header height `--header-h: 60px` (54px ≤720px).

## 3. Radius scale

`--r-xs 4px` (chips in menus, micro buttons) · `--r-sm 6px` (inputs, buttons, tags) ·
`--r-md 10px` (grouped blocks, selects' menu, modal body blocks) · `--r-lg 14px` (cards, charts) ·
`--r-xl 20px` (hero, CTA band) · `--r-full 999px` (pills, switches, dots, progress).

## 4. Motion

| Token | Value |
| --- | --- |
| `--dur-1` | 120ms — micro (icon tint, row hover) |
| `--dur-2` | 180ms — default control transitions |
| `--dur-3` | 240ms — theme swap, accordion, row expand, switch |
| `--dur-4` | 320ms — panel enter, modal in, toast in |
| `--dur-5` | 480ms — carousel slide, hero rise |
| `--ease-out` | `cubic-bezier(.22,.8,.26,.99)` (default) |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` (theme + reversible motion) |
| `--ease-spring` | `cubic-bezier(.34,1.46,.64,1)` (switch thumb, chip/toast entry) |

JS-driven animation: chart tween 560ms with `t => 1 - (1-t)³` (matches `--ease-out`);
carousel autoplay interval 5000ms, 100ms progress tick; toast life 5000ms, exit 260ms;
hero aurora drift 22/26/30s `--ease-in-out` infinite; logo marquee 34s linear;
spinner 620ms linear. `@media (prefers-reduced-motion: reduce)` collapses all CSS
animation/transition to 0.01ms and JS tweens jump to their end state.

## 5. Light theme

| Token | Value |
| --- | --- |
| `--bg` | `#F4F5FA` |
| body background overlays | `radial-gradient(1100px 620px at 12% -8%, var(--bg-tint-a), transparent 62%)`, `radial-gradient(900px 540px at 100% 0%, var(--bg-tint-b), transparent 60%)` |
| `--bg-tint-a` / `--bg-tint-b` | `rgba(91,88,235,.07)` / `rgba(18,164,164,.06)` |
| `--surface` | `#FFFFFF` |
| `--surface-2` | `#FAFAFE` (inputs, sub-rows, toolbars) |
| `--surface-3` | `#F1F2F9` (tracks, segmented background, stepper) |
| `--surface-hover` | `#F5F6FC` |
| `--surface-active` | `#ECEEF8` |
| `--border` | `#E4E6F0` |
| `--border-strong` | `#CFD4E4` |
| `--text` | `#14161F` |
| `--text-2` | `#4C5264` |
| `--text-3` | `#7B8296` |
| `--text-on-accent` | `#FFFFFF` |
| `--accent` | `#5B58EB` |
| `--accent-hover` | `#4A47DC` |
| `--accent-active` | `#3E3BC6` |
| `--accent-soft` | `rgba(91,88,235,.10)` |
| `--accent-soft-hover` | `rgba(91,88,235,.17)` |
| `--accent-border` | `rgba(91,88,235,.32)` |
| `--ring` | `#5B58EB` |
| `--success` | `#0E9F6E` · soft `rgba(14,159,110,.12)` · border `rgba(14,159,110,.3)` |
| `--warning` | `#B4740B` · soft `rgba(203,133,16,.14)` · border `rgba(203,133,16,.32)` |
| `--danger` | `#D14343` · soft `rgba(209,67,67,.11)` · border `rgba(209,67,67,.3)` |
| chart series `--c1…--c5` | `#5B58EB`, `#0F9C9C`, `#E08A12`, `#D9457F`, `#3E7BD4` |
| `--grid` | `rgba(20,22,31,.07)` |
| `--axis-text` | `#7B8296` |
| `--skeleton-a` / `-b` | `#EDEEF6` / `#F7F8FC` |
| `--track` | `#E4E6F0` |
| `--overlay` | `rgba(23,25,36,.42)` + `blur(3px)` |

Shadows (light):
- `--shadow-1`: `0 1px 2px rgba(19,22,36,.06), 0 1px 1px rgba(19,22,36,.04)`
- `--shadow-2`: `0 4px 12px -2px rgba(19,22,36,.10), 0 2px 5px -2px rgba(19,22,36,.07)`
- `--shadow-3`: `0 24px 48px -16px rgba(19,22,36,.22), 0 8px 20px -10px rgba(19,22,36,.14)`
- `--shadow-focus`: `0 0 0 3px rgba(91,88,235,.22)`

## 6. Dark theme

| Token | Value |
| --- | --- |
| `--bg` | `#0C0E14` |
| `--bg-tint-a` / `--bg-tint-b` | `rgba(139,136,247,.10)` / `rgba(45,212,196,.06)` |
| `--surface` | `#14171F` |
| `--surface-2` | `#171B24` |
| `--surface-3` | `#1D222C` |
| `--surface-hover` | `#1C202A` |
| `--surface-active` | `#232834` |
| `--border` | `#262B36` |
| `--border-strong` | `#363D4C` |
| `--text` | `#EBEDF3` |
| `--text-2` | `#A3AABB` |
| `--text-3` | `#767E90` |
| `--text-on-accent` | `#0C0E14` |
| `--accent` | `#8B88F7` |
| `--accent-hover` | `#9E9BFA` |
| `--accent-active` | `#7B78EF` |
| `--accent-soft` | `rgba(139,136,247,.15)` |
| `--accent-soft-hover` | `rgba(139,136,247,.24)` |
| `--accent-border` | `rgba(139,136,247,.38)` |
| `--ring` | `#9E9BFA` |
| `--success` | `#34D399` · soft `rgba(52,211,153,.14)` · border `rgba(52,211,153,.32)` |
| `--warning` | `#F5B544` · soft `rgba(245,181,68,.14)` · border `rgba(245,181,68,.3)` |
| `--danger` | `#FB7185` · soft `rgba(251,113,133,.14)` · border `rgba(251,113,133,.3)` |
| chart series `--c1…--c5` | `#8B88F7`, `#2DD4C4`, `#F5B544`, `#F87FAE`, `#6BA5FF` |
| `--grid` | `rgba(235,237,243,.08)` |
| `--axis-text` | `#767E90` |
| `--skeleton-a` / `-b` | `#1B1F29` / `#232833` |
| `--track` | `#2A303C` |
| `--overlay` | `rgba(6,7,11,.66)` + `blur(3px)` |

Shadows (dark, deeper and more diffuse — no colored glows):
- `--shadow-1`: `0 1px 2px rgba(0,0,0,.44)`
- `--shadow-2`: `0 6px 16px -4px rgba(0,0,0,.55), 0 2px 6px -2px rgba(0,0,0,.4)`
- `--shadow-3`: `0 32px 64px -20px rgba(0,0,0,.72), 0 12px 28px -12px rgba(0,0,0,.5)`
- `--shadow-focus`: `0 0 0 3px rgba(139,136,247,.3)`

## 7. Control geometry & states

Heights: button 34px (`--btn-sm` 28px, `--btn-lg` 42px, icon button square); input/select trigger 36px;
textarea min-height 92px; switch 42×24 with 18px thumb (travel 18px); checkbox/radio 18px
(checkbox radius 5px); range track 4px with 18px thumb; progress 7px; pager button 32px min-width.

Interaction rules applied to every interactive element:
- **hover** — surface steps to `--surface-hover`, border to `--border-strong` (or accent variant moves to `*-hover`).
- **focus-visible** — `2px solid var(--ring)` with `outline-offset: 2px`; inputs instead use
  `border-color: var(--accent)` + `--shadow-focus`.
- **active/pressed** — background steps to `--surface-active`, `transform: translateY(1px)`, shadow removed.
- **disabled** — `opacity: .5` (`.55` for fields), `cursor: not-allowed`, no shadow or transform.
- **loading** — `.is-loading` hides the label and shows a 15px 2px-border spinner, `aria-busy="true"`.

Glass surfaces: sticky header/tab bar use `color-mix(in srgb, var(--bg) 82–88%, transparent)` with
`backdrop-filter: blur(14px) saturate(160%)`. Theme switching adds `.theme-anim` for 260ms, which
transitions `background-color`, `border-color`, `color`, `fill` and `stroke` at `--dur-3 --ease-in-out`.

Gradients: brand mark and progress fills `linear-gradient(145deg|90deg, var(--accent), var(--c2))`;
hero headline `linear-gradient(104deg, var(--accent) 6%, var(--c2) 58%, var(--c4) 96%)` clipped to text;
chart area fills are per-series vertical gradients at `0.34 → 0.06 → 0` alpha of the series color.

## 8. Responsive breakpoints

`1080px` overview grid collapses to one column · `980px` hero/pricing/bento stack, mock window loses 3D tilt ·
`860px` chart grid to one column · `720px` compact header, table pins its first column and scrolls,
toasts span full width, modal footer stacks · `640px` bento to single column, homepage gaps shrink ·
`420px` KPI strip to 2 columns, component grid to one column. Verified from 360px to 1920px.
