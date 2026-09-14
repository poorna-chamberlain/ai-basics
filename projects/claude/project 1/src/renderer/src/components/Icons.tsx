import type { SVGProps } from 'react'

/**
 * Inline 16px icons on a 24px grid, 1.6 stroke. Hand-rolled rather than pulled
 * from an icon package so the weight matches the type and nothing extra ships.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...props }: IconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
)

export const SettingsIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Icon>
)

export const BackIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
)

export const CloseIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)

export const CheckIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

export const CopyIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)

export const WandIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="m3 21 10.5-10.5" />
    <path d="m16.5 7.5 4-4" />
    <path d="M18 2v3M22.5 6.5h-3M15 9l-2-2" />
    <path d="m13.5 10.5 6-6a1.5 1.5 0 0 0-2.12-2.12l-6 6" />
  </Icon>
)

export const ImageIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
    <path d="m14 15 1.8-1.8a2 2 0 0 1 2.8 0L21 15.5" />
  </Icon>
)

export const HistoryIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 2.6-6.4" />
    <path d="M3 4v5h5" />
    <path d="M12 8v4.5l3 1.8" />
  </Icon>
)

export const AlertIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.2v.3" />
  </Icon>
)

export const ExternalIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M13 4h7v7" />
    <path d="M20 4 10.5 13.5" />
    <path d="M19 14.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5" />
  </Icon>
)

export const DownloadIcon = (p: IconProps): React.JSX.Element => (
  <Icon {...p}>
    <path d="M12 3v12" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M4 20h16" />
  </Icon>
)
