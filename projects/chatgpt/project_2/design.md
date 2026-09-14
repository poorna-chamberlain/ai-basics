# Northstar Design System

## Foundation
- Visual direction: cool, precise, spacious product analytics UI.
- Color application uses semantic tokens only; all tokens switch deliberately with `data-theme`.
- Native system font stack ensures zero network dependency and platform-quality rendering.

## Light mode colors
- `background`: `#f5f7fb`
- `surface`: `#ffffff`
- `surface-2`: `#f8faff`
- `surface-3`: `#eef2f8`
- `text`: `#142033`
- `muted-text`: `#65728a`
- `faint-text`: `#8d98aa`
- `border`: `#dce2ec`
- `accent`: `#5b5ce2`
- `accent-hover`: `#7475ed`
- `accent-soft`: `#ededff`
- `accent-text`: `#4243b8`
- `cyan/data-secondary`: `#168aad`
- `success`: `#16875d`
- `warning`: `#b4690e`
- `error`: `#cf3c4f`

## Dark mode colors
- `background`: `#0d111c`
- `surface`: `#141a27`
- `surface-2`: `#192131`
- `surface-3`: `#222c3e`
- `text`: `#edf2fb`
- `muted-text`: `#a0abc0`
- `faint-text`: `#77839a`
- `border`: `#293449`
- `accent`: `#8b8cf6`
- `accent-hover`: `#a7a8ff`
- `accent-soft`: `#292952`
- `accent-text`: `#c3c4ff`
- `cyan/data-secondary`: `#55c2df`
- `success`: `#48bd8a`
- `warning`: `#e6a44f`
- `error`: `#f17182`

## Data visualization colors
- Indigo series: `#6768e8`
- Indigo bars: `#8b8cf6`
- Cyan series: `#28a5bf`
- Rose series: `#e46b80`
- Amber series: `#e09243`
- Area fills use the series color at `28%` opacity at the top and `0%` at the baseline.

## Spacing scale
- `space-0`: `0`
- `space-1`: `4px`
- `space-2`: `6px`
- `space-3`: `8px`
- `space-4`: `10px`
- `space-5`: `12px`
- `space-6`: `14px`
- `space-7`: `16px`
- `space-8`: `18px`
- `space-9`: `20px`
- `space-10`: `22px`
- `space-11`: `24px`
- `space-12`: `28px`
- `space-13`: `30px`
- `space-14`: `36px`
- `space-15`: `40px`
- `space-16`: `56px`
- Desktop page gutter: `28px`
- Mobile page gutter: `14px`
- Maximum content width: `1480px`

## Radius scale
- `radius-1`: `6px` — compact controls and tooltip
- `radius-2`: `10px` — controls and nested surfaces
- `radius-3`: `14px` — cards and dialogs
- `radius-4`: `20px` — large feature surfaces
- `radius-pill`: `999px` — switches, progress tracks, status shapes
- Brand mark radius: `10px`

## Typography
- Family: `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Body: `14px / 1.5`, weight `400`
- Supporting copy: `12px / 1.5`, weight `400`
- Labels: `12px / 1.5`, weight `650`
- Table headings: `11px / 1.5`, weight inherited bold, uppercase, `0.06em` tracking
- Eyebrow: `11px / 1.5`, weight `750`, uppercase, `0.14em` tracking
- Component heading: `15px / 1.5`, weight `700`, `-0.01em` tracking
- Section heading: `22px / 1.2`, weight `700`, `-0.025em` tracking
- Hero heading: responsive `26px–42px / 1.08`, weight `700`, `-0.045em` tracking
- Metric value: `28px / 1.5`, weight `700`, `-0.04em` tracking
- Brand: `16px / 1.5`, weight `750`, `-0.02em` tracking

## Shadows
- Light `shadow-1`: `0 1px 2px rgba(20,32,51,.05), 0 4px 14px rgba(20,32,51,.05)`
- Light `shadow-2`: `0 18px 45px rgba(20,32,51,.14), 0 2px 8px rgba(20,32,51,.08)`
- Dark `shadow-1`: `0 1px 2px rgba(0,0,0,.18), 0 5px 18px rgba(0,0,0,.16)`
- Dark `shadow-2`: `0 22px 55px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.25)`
- Accent brand shadow: `0 7px 18px rgba(91,92,226,.30)`
- Focus ring: `3px` accent at `42%` opacity, `2px` offset
- Input focus halo: `0 0 0 3px` accent at `18%` opacity

## Motion
- Fast duration: `140ms`
- Normal duration: `240ms`
- Slow duration: `420ms`
- Primary easing: `cubic-bezier(.22,1,.36,1)`
- Spinner: `700ms linear infinite`
- Skeleton shimmer: `1300ms linear infinite`
- Carousel autoplay interval: `4200ms`
- Toast visible duration: `3200ms`
- Reduced-motion mode forces animations and transitions to `0.01ms`.

## Interaction states
- Hover: surface elevation/color shift plus accent-tinted border where appropriate.
- Focus-visible: `3px` translucent accent ring with `2px` offset.
- Pressed: `translateY(1px) scale(.98)`; pagination uses `scale(.94)`.
- Disabled: `45%` opacity, `not-allowed` cursor, and no pressed transform.
- Selected: accent fill for primary selection or accent-soft fill with accent text.

## Responsive breakpoints
- Desktop/tablet split: `900px`; charts become one column and component cards become six columns.
- Mobile split: `620px`; `14px` gutters, all component cards become full-width, toolbars stack, details become one column, and chart height becomes `235px`.
- Minimum supported viewport: `360px`.

## Marketing homepage extensions
- Homepage light background: `#f7f8fc`; homepage dark background: `#0c101a`.
- Homepage light text: `#111b2c`; homepage dark text: `#f0f4fc`.
- Homepage light surface-2: `#f0f3f9`; homepage dark surface-2: `#1c2434`.
- Light navigation glass: `rgba(255,255,255,.72)`.
- Dark navigation glass: `rgba(14,19,30,.74)`.
- Navigation glass treatment: `blur(20px) saturate(160%)`.
- Homepage accent gradient: `linear-gradient(110deg, accent, #a757c7 50%, cyan)`.
- Homepage display heading: responsive `48px–92px / .98`, weight `760`, `-0.065em` tracking.
- Homepage section heading: responsive `35px–58px / 1.04`, `-0.055em` tracking.
- Homepage card radius: `20px`; CTA radius: `26px`; navigation radius: `18px`.
- Homepage depth shadow: `0 30px 90px rgba(27,31,67,.16)` light and `0 35px 100px rgba(0,0,0,.48)` dark.
- Reveal animation: `700ms` with primary easing and `24px` initial vertical offset.
- Navigation/menu animation: `180ms–200ms` with primary easing.
- Marketing desktop/tablet breakpoint: `850px`; mobile breakpoint: `600px`.
- Homepage maximum content width: `1180px`; desktop gutter: `20px`; mobile gutter: `14px`.
