import type { SearchErrorKind } from '@shared/types'
import { AlertIcon, ImageIcon, SearchIcon } from './Icons'

/** The four things the results area can show other than results. */

export function EmptyState(): React.JSX.Element {
  return (
    <div className="state">
      <span className="state__icon">
        <ImageIcon size={19} />
      </span>
      <span className="state__title">Search for an image</span>
      <span className="state__body">
        Type at least two characters. Pick a result to remove its background, change the backing
        colour, and copy it straight to your clipboard.
      </span>
    </div>
  )
}

export function NoResultsState({ query }: { query: string }): React.JSX.Element {
  return (
    <div className="state">
      <span className="state__icon">
        <SearchIcon size={19} />
      </span>
      <span className="state__title">No images for “{query.trim()}”</span>
      <span className="state__body">
        Try a broader or differently worded search, or switch provider in Settings.
      </span>
    </div>
  )
}

interface ErrorProps {
  kind: SearchErrorKind
  message: string
  onRetry: () => void
  onOpenSettings: () => void
}

const TITLES: Record<SearchErrorKind, string> = {
  network: 'That provider is not responding',
  rate_limit: 'Rate limit reached',
  unauthorized: 'The provider rejected the request',
  not_configured: 'This provider needs setting up',
  unknown: 'Something went wrong'
}

export function ErrorState({
  kind,
  message,
  onRetry,
  onOpenSettings
}: ErrorProps): React.JSX.Element {
  const needsSettings = kind === 'not_configured' || kind === 'unauthorized'

  return (
    <div className="state">
      <span className="state__icon" data-tone="error">
        <AlertIcon size={19} />
      </span>
      <span className="state__title">{TITLES[kind]}</span>
      <span className="state__body">{message}</span>
      <div className="state__actions">
        {needsSettings ? (
          <button type="button" className="button button--primary" onClick={onOpenSettings}>
            Open settings
          </button>
        ) : (
          <button type="button" className="button button--primary" onClick={onRetry}>
            Try again
          </button>
        )}
        <button type="button" className="button button--ghost" onClick={onOpenSettings}>
          Change provider
        </button>
      </div>
    </div>
  )
}
