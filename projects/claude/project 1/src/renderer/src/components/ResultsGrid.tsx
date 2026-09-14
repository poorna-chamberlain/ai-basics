import { useEffect, useRef, useState } from 'react'
import type { ImageResult } from '@shared/types'

interface TileProps {
  result: ImageResult
  onSelect: (result: ImageResult) => void
}

/** One thumbnail. Fades in on decode so the grid never flashes broken images. */
function Tile({ result, onSelect }: TileProps): React.JSX.Element {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    // A dead thumbnail URL would otherwise leave a permanent empty hole.
    return <div className="tile skeleton skeleton--tile" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      className="tile"
      onClick={() => onSelect(result)}
      title={result.title}
      aria-label={`Open ${result.title}`}
    >
      <img
        className="tile__img"
        src={result.thumbnailUrl}
        alt={result.title}
        data-loaded={loaded}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      <span className="tile__caption">{result.title}</span>
    </button>
  )
}

interface Props {
  results: ImageResult[]
  loadingMore: boolean
  hasMore: boolean
  onSelect: (result: ImageResult) => void
  onLoadMore: () => void
}

export function ResultsGrid({
  results,
  loadingMore,
  hasMore,
  onSelect,
  onLoadMore
}: Props): React.JSX.Element {
  const sentinel = useRef<HTMLDivElement>(null)

  // Infinite scroll: fetch the next page once the sentinel comes into view.
  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
      },
      { rootMargin: '240px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, results.length])

  return (
    <div className="grid">
      {results.map((result) => (
        <Tile key={result.id} result={result} onSelect={onSelect} />
      ))}

      {loadingMore &&
        Array.from({ length: 5 }, (_, i) => (
          <div key={`more-${i}`} className="skeleton skeleton--tile" aria-hidden="true" />
        ))}

      {hasMore && !loadingMore && <div ref={sentinel} aria-hidden="true" />}
    </div>
  )
}

/** Placeholder grid shown while the first page of a query is in flight. */
export function SkeletonGrid({ count = 10 }: { count?: number }): React.JSX.Element {
  return (
    <div className="grid" aria-busy="true" aria-label="Searching">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton--tile" />
      ))}
    </div>
  )
}
