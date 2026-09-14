import type { HistoryImage, HistoryState } from '@shared/types'
import { CloseIcon, HistoryIcon } from './Icons'

interface Props {
  history: HistoryState
  onPickQuery: (query: string) => void
  onPickImage: (image: HistoryImage) => void
  onRemoveImage: (id: string) => void
  onClear: () => void
}

/**
 * Past searches and past images, both persisted across restarts. Picking an
 * image reopens the editor with its saved cut-out so it can be re-coloured or
 * re-copied without downloading or reprocessing anything.
 */
export function HistoryView({
  history,
  onPickQuery,
  onPickImage,
  onRemoveImage,
  onClear
}: Props): React.JSX.Element {
  const isEmpty = history.queries.length === 0 && history.images.length === 0

  if (isEmpty) {
    return (
      <div className="state">
        <span className="state__icon">
          <HistoryIcon size={19} />
        </span>
        <span className="state__title">No history yet</span>
        <span className="state__body">
          Searches you run and images you open will collect here, so you can copy them again later.
        </span>
      </div>
    )
  }

  return (
    <div>
      {history.queries.length > 0 && (
        <>
          <div className="section-label">Recent searches</div>
          <div className="chips">
            {history.queries.map((entry) => (
              <button
                key={entry.query}
                type="button"
                className="chip"
                onClick={() => onPickQuery(entry.query)}
                title={`Search for “${entry.query}” again`}
              >
                <span className="chip__text">{entry.query}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {history.images.length > 0 && (
        <>
          <div className="section-label section-label--row">
            <span>Recent images</span>
            <button type="button" className="section-label__action" onClick={onClear}>
              Clear all
            </button>
          </div>

          <div className="grid">
            {history.images.map((image) => (
              <div key={image.id} className="tile">
                <button
                  type="button"
                  onClick={() => onPickImage(image)}
                  title={image.title}
                  aria-label={`Reopen ${image.title}`}
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  <img
                    className="tile__img"
                    src={image.thumbnailDataUrl}
                    alt={image.title}
                    data-loaded="true"
                    draggable={false}
                  />
                  <span className="tile__caption">{image.title}</span>
                </button>

                {image.editedDataUrl && <span className="tile__badge">Edited</span>}

                <button
                  type="button"
                  className="tile__remove"
                  aria-label={`Remove ${image.title} from history`}
                  title="Remove from history"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveImage(image.id)
                  }}
                >
                  <CloseIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
