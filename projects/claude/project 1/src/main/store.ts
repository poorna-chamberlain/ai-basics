import { app } from 'electron'
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  DEFAULT_SETTINGS,
  type HistoryImage,
  type HistoryState,
  type Settings
} from '@shared/types'

/**
 * A small JSON store in `userData`. Writes go to a temp file and are renamed
 * into place so a crash mid-write cannot leave a truncated file behind.
 */

interface Persisted {
  settings: Settings
  history: HistoryState
}

const MAX_QUERIES = 30
const MAX_IMAGES = 60

function emptyState(): Persisted {
  return { settings: { ...DEFAULT_SETTINGS }, history: { queries: [], images: [] } }
}

export class Store {
  private readonly file: string
  private state: Persisted
  private writeTimer: NodeJS.Timeout | null = null

  constructor(fileName = 'quickimage-data.json') {
    this.file = join(app.getPath('userData'), fileName)
    this.state = this.load()
  }

  private load(): Persisted {
    try {
      const parsed = JSON.parse(readFileSync(this.file, 'utf8')) as Partial<Persisted>
      return {
        // Merging over defaults keeps older data files working when new
        // settings are introduced in a later version.
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        history: {
          queries: parsed.history?.queries ?? [],
          images: parsed.history?.images ?? []
        }
      }
    } catch {
      return emptyState()
    }
  }

  /** Debounced so bursts of edits (typing in settings) cause one disk write. */
  private schedulePersist(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer)
    this.writeTimer = setTimeout(() => this.persistNow(), 250)
  }

  persistNow(): void {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer)
      this.writeTimer = null
    }
    try {
      mkdirSync(dirname(this.file), { recursive: true })
      const tmp = `${this.file}.tmp`
      writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8')
      renameSync(tmp, this.file)
    } catch (error) {
      console.error('[quickimage] failed to persist store:', error)
    }
  }

  /* ------------------------------------------------------------ settings -- */

  getSettings(): Settings {
    return { ...this.state.settings }
  }

  updateSettings(patch: Partial<Settings>): Settings {
    this.state.settings = { ...this.state.settings, ...patch }
    this.schedulePersist()
    return this.getSettings()
  }

  /* ------------------------------------------------------------- history -- */

  getHistory(): HistoryState {
    return {
      queries: [...this.state.history.queries],
      images: [...this.state.history.images]
    }
  }

  addQuery(query: string): HistoryState {
    const trimmed = query.trim()
    if (trimmed.length < 2) return this.getHistory()

    const queries = this.state.history.queries.filter(
      (q) => q.query.toLowerCase() !== trimmed.toLowerCase()
    )
    queries.unshift({ query: trimmed, at: Date.now() })
    this.state.history.queries = queries.slice(0, MAX_QUERIES)
    this.schedulePersist()
    return this.getHistory()
  }

  addImage(image: HistoryImage): HistoryState {
    const images = this.state.history.images.filter((i) => i.id !== image.id)
    images.unshift(image)
    this.state.history.images = images.slice(0, MAX_IMAGES)
    this.schedulePersist()
    return this.getHistory()
  }

  removeImage(id: string): HistoryState {
    this.state.history.images = this.state.history.images.filter((i) => i.id !== id)
    this.schedulePersist()
    return this.getHistory()
  }

  clearHistory(): HistoryState {
    this.state.history = { queries: [], images: [] }
    this.schedulePersist()
    return this.getHistory()
  }
}
