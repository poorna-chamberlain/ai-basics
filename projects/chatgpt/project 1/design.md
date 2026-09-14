# QuickImage visual system

Exact renderer tokens for reproducing the QuickImage launcher.

## Color mode

- Declare `color-scheme: light dark`.
- Switch only with `@media (prefers-color-scheme: dark)`.
- Accent family is cool indigo/periwinkle. No warm neutrals or fluorescent colors.

## Light colors

- `accent`: `#5b5bd6`
- `accent-hover`: `#4c4cc4`
- `accent-soft`: `rgba(91, 91, 214, 0.11)`
- `surface`: `rgba(246, 248, 252, 0.84)`
- `surface-solid`: `#f7f8fb`
- `surface-raised`: `rgba(255, 255, 255, 0.72)`
- `surface-hover`: `rgba(33, 42, 63, 0.065)`
- `surface-active`: `rgba(91, 91, 214, 0.12)`
- `text-primary`: `#171b27`
- `text-secondary`: `#60687a`
- `text-tertiary`: `#8c93a2`
- `border`: `rgba(33, 42, 63, 0.13)`
- `border-strong`: `rgba(33, 42, 63, 0.20)`
- `danger`: `#d13c58`

## Dark colors

- `accent`: `#8585ee`
- `accent-hover`: `#9999f4`
- `accent-soft`: `rgba(133, 133, 238, 0.15)`
- `surface`: `rgba(25, 29, 39, 0.86)`
- `surface-solid`: `#1a1e28`
- `surface-raised`: `rgba(49, 54, 68, 0.58)`
- `surface-hover`: `rgba(255, 255, 255, 0.075)`
- `surface-active`: `rgba(133, 133, 238, 0.17)`
- `text-primary`: `#f1f3f8`
- `text-secondary`: `#aab0bf`
- `text-tertiary`: `#777f91`
- `border`: `rgba(255, 255, 255, 0.11)`
- `border-strong`: `rgba(255, 255, 255, 0.18)`
- `danger`: `#ff7189`

## Native material

- Window background: transparent Electron window.
- macOS vibrancy: `under-window`, active visual-effect state.
- Windows background material: `acrylic`.
- CSS fallback: `backdrop-filter: blur(36px) saturate(1.32)`.
- Main surface uses the mode-specific translucent `surface` token.

## Radius scale

- `radius-window`: `18px`
- `radius-large`: `13px`
- `radius-medium`: `10px`
- `radius-small`: `7px`
- Pills and progress tracks: `999px`
- Status icon container: `15px`

## Spacing scale

- Base unit: `4px`
- Micro: `4px`
- Tight: `7px`, `8px`
- Control: `10px`, `12px`
- Component: `14px`, `16px`
- Section: `20px`, `22px`, `24px`
- Panel horizontal: `26px`
- Preview image inset: `18px`
- Search header horizontal inset: `24px`

## Typography

- Family: `-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", sans-serif`
- Search input: `21px`, weight `450`, letter spacing `-0.015em`
- Panel title: `14px`, weight `650`
- Status title: `14px`, weight `700`
- Standard controls: `12px`, weight `600` or `650`
- Supporting copy: `11px`, weight `400`, line height `1.45` to `1.5`
- Eyebrow labels: `11px`, weight `700`, letter spacing `0.07em`, uppercase
- Micro labels: `9px` to `10px`, weight `600`

## Borders

- Standard: `1px solid border`
- Window and emphasized controls: `1px solid border-strong`
- Accent focus: `1px solid accent` plus `0 0 0 3px accent-soft`
- Image hover: 55% accent mixed with transparent

## Shadows

- Light window: `0 24px 70px rgba(23,31,50,.25), 0 3px 12px rgba(23,31,50,.14)`
- Dark window: `0 28px 80px rgba(0,0,0,.52), 0 3px 15px rgba(0,0,0,.30)`
- Light card: `0 4px 14px rgba(28,36,55,.10)`
- Dark card: `0 5px 18px rgba(0,0,0,.25)`
- Accent button: `0 3px 10px` using accent at 26% opacity

## Control dimensions

- Launcher width: `760px`
- Empty launcher window: `126px`; internal search row: `104px`
- Expanded launcher: `650px`; internal search row: `82px`
- Icon button: `34px`; quiet variant: `28px`
- Provider pill: `24px`
- Fields: `39px`
- Primary/secondary buttons: `38px`
- Image grid: four columns, `134px` rows, `10px` gap
- History grid: five columns, `112px` rows, `9px` gap

## Motion

- Window entrance opacity: `160ms ease-out`
- Window entrance transform: `180ms cubic-bezier(0.16, 1, 0.3, 1)`
- Entrance origin: top center; from `translateY(-8px) scale(.975)`
- Card hover: `150ms cubic-bezier(0.16, 1, 0.3, 1)`
- Thumbnail zoom: `240ms cubic-bezier(0.16, 1, 0.3, 1)`
- Standard control feedback: `120ms ease`
- Toast entrance: `180ms cubic-bezier(0.16, 1, 0.3, 1)`
- Progress interpolation: `180ms ease`
- Skeleton shimmer: `1250ms ease-in-out infinite`
- Spinner: `900ms linear infinite`
- Reduced-motion mode collapses all animation/transition durations to `1ms`.

## Iconography and imagery

- Icons: Lucide, normally `17px` to `19px`, stroke inherited from library.
- Search icon: `23px`, stroke width `1.8`.
- Thumbnails use cover in search and contain in history/editor.
- Transparent images use a neutral 16px checkerboard at 12% opacity.
