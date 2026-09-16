# Axiom Design System

## Direction
- Character: precise, confident, vivid, and highly responsive.
- Intended contexts: finance, payments, commerce operations, inventory, and ecommerce.
- Display typography is editorial but restrained; interface typography remains compact and operational.
- Forest communicates trust and completion, bronze adds measured warmth, and blue is reserved for neutral information.

## Light colors
- Background: `#f5f7ff`
- Paper/surface: `#ffffff`
- Wash/subtle surface: `#edf1ff`
- Primary text/charcoal: `#101426`
- Muted text: `#677089` (`#677089` on marketing page)
- Border: `#dce3f3`
- Cobalt primary: `#3157d5`
- Cobalt hover: `#4c6fe3`
- Periwinkle: `#7c5ce7`
- Periwinkle soft: `#f0ecff`
- Information blue: `#0d8fab`
- Error red: `#d64562`
- Navigation glass: `rgba(255,255,255,.82)`

## Dark colors
- Background: `#090d1a`
- Paper/surface: `#12182a`
- Wash/subtle surface: `#1a2238`
- Primary text: `#f3f5ff`
- Muted text: `#a4acc0`
- Border: `#293553`
- Cobalt primary: `#7b9cff`
- Cobalt hover: `#98afff`
- Periwinkle: `#b6a0ff`
- Periwinkle soft: `#2b2448`
- Information blue: `#55c9e3`
- Error red: `#ff7890`
- Navigation glass: `rgba(17,28,26,.84)`

## Typography
- UI family: `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Editorial family: `"Avenir Next", Inter, ui-sans-serif, sans-serif`
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

## Global motion control
- Root attribute: `data-motion="on|off"` on `html`.
- Persistent preference key: `axiom-motion`.
- Motion off sets all CSS animation and transition properties to `none` and scroll behavior to `auto`.
- JavaScript chart interpolation, reveal observers, and press feedback also check the same root state.
- Global press response: `270ms`, scale `1 → .96 → 1`, primary easing.
- Inputs and controls use `180ms–280ms` state interpolation.
- Expandable rows use `250ms`; accordions use `340ms`.
- Dropdown menus use `240ms` opacity, translate, and scale.
- Dialog and backdrop coordinate over `300ms`.
- Chart updates use `350ms`; disabled entirely when Motion is off.
- Carousel movement uses `450ms`.
- Tooltips use `180ms`; toasts use `250ms`.
- Progress uses `600ms`; skeleton shimmer uses `1200ms`.

## Motion differentiation
- Buttons use only a short CSS pressed-state scale; no universal scripted animation is applied.
- Inputs use a `480ms` focus/change halo without spatial movement.
- Table filters, sorts, and pagination stagger rows horizontally over `300ms`.
- Expandable records interpolate their own height over `250ms`.
- Tabs replace panels with a `300ms` vertical fade.
- Dropdowns combine `240ms` opacity, vertical movement, and subtle scale.
- Tags enter with a `300ms` scale and fade.
- Charts redraw with a `350ms` opacity interpolation.
- Accordions interpolate height over `340ms`.
- Dialogs coordinate backdrop fade with `300ms` surface scale and vertical movement.
- Carousels translate horizontally over `450ms`.
- Content-list pagination uses a `340ms` vertical crossfade.
- Every treatment becomes immediate when the global Motion toggle is off.

## Editorial layout
- Long-form article measure: `740px`.
- Article body: user-adjustable `15px–21px`; default `17px/1.82`.
- Reading layout: `230px` sticky sidebar, `70px` gap, and `740px` article.
- Article display: responsive `42px–72px/1.04`, weight `680`, `-0.055em`.
- Pull quote: `27px/1.4`, weight `620`, with `4px` violet rule.
- Editorial grid: three columns desktop, two tablet, one mobile.

## Paper editorial variant
- Page: `blog2.html`; designed as a low-decoration alternative for extended reading.
- Light canvas and surface: `#ffffff`.
- Paper text: `#161b26`; muted text: `#667085`.
- Paper wash: `#f6f8fc`; border: `#e4e7ec`.
- Paper blue: `#2859c5`; violet: `#7259c7`; aqua: `#167f98`.
- Article measure: `760px`; sidebar: `210px`; column gap: `80px`.
- Hero maximum height: `460px` with `12px` radius and border-only depth.
- Dark mode deliberately returns to the standard Axiom dark tokens for site continuity.
- Theme, Motion, sidebar, font-size, grid/list, and reading-progress behaviors remain shared.

## Table and chart motion
- Time-banded tables use local `1Y / 3Y / 5Y` controls inside the table toolbar.
- Table timeframe changes stagger rows vertically over `420ms` with `45ms` row offsets.
- Standard table sorting/filtering staggers rows horizontally over `300ms` with `35ms` offsets.
- Density toggles interpolate row padding over `250ms`.
- Variance toggles interpolate semantic background and text colors over `280ms`.
- Chart bars grow from their baseline over `520ms` with capped stagger.
- Chart lines draw using a `720ms` stroke-dash animation.
- Chart areas fade independently over `650ms`.
- The complete chart surface settles over `480ms` using the primary easing.
