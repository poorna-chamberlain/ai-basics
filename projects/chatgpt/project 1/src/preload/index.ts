import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, ImageHistoryItem, QuickImageApi } from '../shared/types.js'

const api: QuickImageApi = {
  search: (query, page = 1) => ipcRenderer.invoke('search:images', query, page),
  fetchImage: (url) => ipcRenderer.invoke('image:fetch', url),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:save', settings),
  getDiagnostics: () => ipcRenderer.invoke('diagnostics:get'),
  getHistory: () => ipcRenderer.invoke('history:get'),
  addQueryHistory: (query) => ipcRenderer.invoke('history:add-query', query),
  saveImageHistory: (
    image: Omit<ImageHistoryItem, 'id' | 'kind' | 'createdAt'> & { id?: string }
  ) => ipcRenderer.invoke('history:save-image', image),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  copyImage: (dataUrl) => ipcRenderer.invoke('clipboard:copy-image', dataUrl),
  closeOverlay: () => ipcRenderer.invoke('overlay:close'),
  resizeOverlay: (height) => ipcRenderer.invoke('overlay:resize', height),
  onOverlayVisibility: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, visible: boolean): void => callback(visible)
    ipcRenderer.on('overlay:visibility', listener)
    return () => ipcRenderer.removeListener('overlay:visibility', listener)
  }
}

contextBridge.exposeInMainWorld('quickImage', api)
