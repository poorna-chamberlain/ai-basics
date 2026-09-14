export type ProviderId = string

export interface ProviderDescriptor {
  id: ProviderId
  label: string
  configured: boolean
  description: string
}

export interface SearchImage {
  id: string
  title: string
  thumbnailUrl: string
  fullUrl: string
  width?: number
  height?: number
  creator?: string
  sourceUrl?: string
}

export interface SearchResponse {
  images: SearchImage[]
  page: number
  hasMore: boolean
  provider: ProviderId
}

export interface AppSettings {
  provider: ProviderId
  hotkey: string
  googleApiKey: string
  googleCx: string
}

export interface PublicSettings extends Omit<AppSettings, 'googleApiKey'> {
  googleApiKey: string
  googleConfigured: boolean
  providers: ProviderDescriptor[]
}

export interface SearchHistoryItem {
  id: string
  kind: 'query'
  query: string
  createdAt: number
}

export interface ImageHistoryItem {
  id: string
  kind: 'image'
  title: string
  sourceUrl: string
  thumbnailUrl: string
  editedDataUrl?: string
  background: 'transparent' | 'white' | 'black'
  createdAt: number
}

export type HistoryItem = SearchHistoryItem | ImageHistoryItem

export interface ImageSearchProvider {
  readonly id: ProviderId
  search(query: string, page: number): Promise<SearchResponse>
}

export interface Diagnostics {
  path: string
  lines: string[]
}

export interface QuickImageApi {
  search: (query: string, page?: number) => Promise<SearchResponse>
  fetchImage: (url: string) => Promise<string>
  getSettings: () => Promise<PublicSettings>
  saveSettings: (settings: Partial<AppSettings>) => Promise<PublicSettings>
  getDiagnostics: () => Promise<Diagnostics>
  getHistory: () => Promise<HistoryItem[]>
  addQueryHistory: (query: string) => Promise<HistoryItem[]>
  saveImageHistory: (image: Omit<ImageHistoryItem, 'id' | 'kind' | 'createdAt'> & { id?: string }) => Promise<HistoryItem[]>
  clearHistory: () => Promise<void>
  copyImage: (dataUrl: string) => Promise<void>
  closeOverlay: () => Promise<void>
  resizeOverlay: (height: number) => Promise<void>
  onOverlayVisibility: (callback: (visible: boolean) => void) => () => void
}
