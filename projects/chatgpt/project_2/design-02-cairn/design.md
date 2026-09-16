# Cairn Design System

## Direction
- Character: dependable, calm, precise, and quietly premium.
- Intended contexts: finance, payments, commerce operations, inventory, and ecommerce.
- Display typography is editorial but restrained; interface typography remains compact and operational.
- Forest communicates trust and completion, bronze adds measured warmth, and blue is reserved for neutral information.

## Light colors
- Background: `#f4f7f5`
- Paper/surface: `#ffffff`
- Wash/subtle surface: `#e9f0ec`
- Primary text/charcoal: `#122027`
- Muted text: `#65737a` (`#627078` on marketing page)
- Border: `#d7dfda`
- Forest primary: `#175c48`
- Forest hover: `#24765d`
- Muted bronze: `#a77b35`
- Bronze soft: `#f5ecd9`
- Information blue: `#215d8f`
- Error red: `#b33f3f`
- Navigation glass: `rgba(255,255,255,.82)`

## Dark colors
- Background: `#0d1514`
- Paper/surface: `#14201e`
- Wash/subtle surface: `#1b2b27`
- Primary text: `#eef4f1`
- Muted text: `#9baaa3`
- Border: `#2a3b36`
- Forest primary: `#52b894`
- Forest hover: `#6ccba8`
- Muted gold: `#d1a65e`
- Gold soft: `#342c1e`
- Information blue: `#70a9d5`
- Error red: `#ea7777`
- Navigation glass: `rgba(17,28,26,.84)`

## Typography
- UI family: `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Editorial family: `Georgia, serif`
- Data family: `ui-monospace, SFMono-Regular, monospace`
- Body: `14px/1.55` in product; `15px/1.6` in marketing; weight `400`
- Small/supporting: `10px–12px/1.5`; weights `400–700`
- UI labels: `11px/1.5`; weight `700`
- Eyebrow: `10px–11px/1.5`; weight `800`; uppercase; `0.15em` tracking
- Product page title: responsive `27px–40px/1.1`; Georgia `500`; `-0.04em`
- Product section title: `25px/1.2`; Georgia `600`
- Marketing hero: responsive `48px–78px/1.02`; Georgia `500`; `-0.055em`
- Marketing section: responsive `34px–56px/1.08`; Georgia `500`; `-0.045em`
- Editorial sample: `44px/1.05`; Georgia `500`; `-0.045em`
- Data sample: `24px/1.2`; monospace `600`; tabular numbers

## Spacing
- Base unit: `4px`
- Scale: `4, 8, 12, 16, 24, 32, 48, 64, 80, 110px`
- Product desktop gutter: `28px`
- Product mobile gutter: `14px`
- Marketing desktop gutter: `20px`
- Marketing mobile gutter: `14px`
- Product maximum width: `1480px`
- Marketing maximum width: `1200px`
- Standard card padding: `18px`
- Marketing card padding: `24px`

## Radius
- Compact: `5px`
- Control: `8px–9px`
- Alert: `9px–10px`
- Nested surface: `10px–12px`
- Product card: `13px`
- Menu/dialog: `14px`
- Marketing card: `18px`
- Feature image/quote: `24px–26px`
- Pill: `999px`
- Brand mark: asymmetric `50% 50% 50% 7px`

## Borders and shadows
- Standard border: `1px solid` border token.
- Product light shadow: `0 10px 30px rgba(22,46,37,.08)`
- Product dark shadow: `0 12px 35px rgba(0,0,0,.23)`
- Product deep light: `0 24px 70px rgba(18,32,39,.17)`
- Product deep dark: `0 28px 80px rgba(0,0,0,.5)`
- Marketing light shadow: `0 14px 40px rgba(22,46,37,.09)`
- Marketing dark shadow: `0 16px 45px rgba(0,0,0,.25)`
- Marketing deep light: `0 32px 90px rgba(18,32,39,.16)`
- Marketing deep dark: `0 35px 100px rgba(0,0,0,.46)`
- Focus ring: `3px` forest at `35%–38%` opacity with `2px–3px` offset.
- Input focus halo: `0 0 0 3px` forest at `15%` opacity.

## Motion
- Primary easing: `cubic-bezier(.2,.8,.2,1)`
- Micro interaction: `150ms–180ms`
- Menu and tooltip: `180ms–200ms`
- Component expansion: `250ms`
- Panel transition: `300ms`
- Chart update: `350ms`
- Progress/reveal: `600ms–700ms`
- Spinner: `700ms linear infinite`
- Skeleton: `1200ms linear infinite`
- Toast duration: `3000ms`
- Marketing float loop: `5000ms ease-in-out infinite`
- Reduced-motion mode reduces all animation and transition durations to `0.01ms`.

## Layout breakpoints
- Product tablet: `900px`
- Product mobile: `620px`
- Marketing tablet: `850px`
- Marketing mobile: `580px`

## Interaction policy
- Static examples update immediately and do not interpolate spatial change.
- Animated examples use motion only to clarify focus, expansion, progress, or changed position.
- Hover raises primary marketing actions by `2px`; pressed state uses `scale(.97–.98)`.
- Disabled controls use `45%` opacity and no pressed transform.
- Selected controls use forest fill or paper-on-wash elevation.
- Every custom control provides pointer and keyboard operation plus visible focus.
