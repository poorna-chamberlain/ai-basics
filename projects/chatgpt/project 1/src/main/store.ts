import { app, safeStorage } from 'electron'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { AppSettings, HistoryItem, ImageHistoryItem, PublicSettings, SearchHistoryItem } from '../shared/types.js'
import { providerDescriptors } from './providers.js'

interface DiskData {
  settings: Omit<AppSettings, 'googleApiKey'> & { encryptedGoogleApiKey: string }
  history: HistoryItem[]
}

const defaults: DiskData = {
  settings: {
    provider: 'openverse',
    hotkey: 'Alt+Shift+I',
    googleCx: '',
    encryptedGoogleApiKey: ''
  },
  history: []
}

export class AppStore {
  private readonly file = path.join(app.getPath('userData'), 'quickimage.json')
  private data: DiskData = structuredClone(defaults)

  async load(): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true })
    try {
      const parsed = JSON.parse(await readFile(this.file, 'utf8')) as Partial<DiskData>
      this.data = {
        settings: { ...defaults.settings, ...parsed.settings },
        history: Array.isArray(parsed.history) ? parsed.history : []
      }
    } catch {
      await this.persist()
    }
  }

  private decryptKey(): string {
    const value = this.data.settings.encryptedGoogleApiKey
    if (!value) return ''
    try {
      return safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(Buffer.from(value, 'base64'))
        : Buffer.from(value, 'base64').toString('utf8')
    } catch {
      return ''
    }
  }

  getSettings(): AppSettings {
    const { encryptedGoogleApiKey: _, ...settings } = this.data.settings
    return { ...settings, googleApiKey: this.decryptKey() }
  }

  getPublicSettings(): PublicSettings {
    const settings = this.getSettings()
    return {
      ...settings,
      googleConfigured: Boolean(settings.googleApiKey.trim() && settings.googleCx.trim()),
      providers: providerDescriptors(settings)
    }
  }

  async updateSettings(patch: Partial<AppSettings>): Promise<PublicSettings> {
    const current = this.getSettings()
    const next = { ...current, ...patch }
    if (next.provider === 'google' && (!next.googleApiKey.trim() || !next.googleCx.trim())) {
      next.provider = 'openverse'
    }
    const encryptedGoogleApiKey =
      patch.googleApiKey === undefined
        ? this.data.settings.encryptedGoogleApiKey
        : safeStorage.isEncryptionAvailable()
          ? safeStorage.encryptString(next.googleApiKey).toString('base64')
          : Buffer.from(next.googleApiKey, 'utf8').toString('base64')
    this.data.settings = {
      provider: next.provider,
      hotkey: next.hotkey,
      googleCx: next.googleCx,
      encryptedGoogleApiKey
    }
    await this.persist()
    return this.getPublicSettings()
  }

  getHistory(): HistoryItem[] {
    return [...this.data.history].sort((a, b) => b.createdAt - a.createdAt)
  }

  async addQuery(query: string): Promise<HistoryItem[]> {
    const normalized = query.trim()
    const withoutDuplicate = this.data.history.filter(
      (item) => item.kind !== 'query' || item.query.toLocaleLowerCase() !== normalized.toLocaleLowerCase()
    )
    const entry: SearchHistoryItem = {
      id: crypto.randomUUID(),
      kind: 'query',
      query: normalized,
      createdAt: Date.now()
    }
    this.data.history = [
      entry,
      ...withoutDuplicate
    ].slice(0, 60)
    await this.persist()
    return this.getHistory()
  }

  async saveImage(image: Omit<ImageHistoryItem, 'id' | 'kind' | 'createdAt'> & { id?: string }): Promise<HistoryItem[]> {
    const id = image.id ?? crypto.randomUUID()
    const entry: ImageHistoryItem = { ...image, id, kind: 'image', createdAt: Date.now() }
    this.data.history = [
      entry,
      ...this.data.history.filter((item) => item.id !== id)
    ].slice(0, 60)
    await this.persist()
    return this.getHistory()
  }

  async clearHistory(): Promise<void> {
    this.data.history = []
    await this.persist()
  }

  private async persist(): Promise<void> {
    const temporary = `${this.file}.tmp`
    await writeFile(temporary, JSON.stringify(this.data), 'utf8')
    await rename(temporary, this.file)
  }
}
