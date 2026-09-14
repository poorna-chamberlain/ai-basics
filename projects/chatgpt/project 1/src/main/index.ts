import {
  app,
  BrowserWindow,
  clipboard,
  ClipboardItem,
  globalShortcut,
  ipcMain,
  Menu,
  net,
  nativeImage,
  nativeTheme,
  screen,
  Tray
} from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { AppStore } from './store.js'
import { providerFor } from './providers.js'
import { initializeLogger, logger } from './logger.js'
import type { AppSettings } from '../shared/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.join(app.getAppPath(), '.env') })

let overlay: BrowserWindow | null = null
let tray: Tray | null = null
let store: AppStore
let registeredHotkey = ''
let quitting = false

function overlayPosition(width: number, height: number): Electron.Rectangle {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const area = display.workArea
  return {
    x: Math.round(area.x + (area.width - width) / 2),
    y: Math.round(area.y + Math.max(36, area.height * 0.11)),
    width,
    height
  }
}

function createOverlay(): BrowserWindow {
  const width = 760
  const height = 126
  const window = new BrowserWindow({
    ...overlayPosition(width, height),
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    roundedCorners: true,
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  if (process.platform === 'win32') window.setBackgroundMaterial('acrylic')
  window.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'normal')
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  window.on('blur', () => {
    if (window.isVisible() && !window.webContents.isDevToolsOpened()) hideOverlay()
  })
  window.on('closed', () => {
    overlay = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  return window
}

function showOverlay(): void {
  if (!overlay || overlay.isDestroyed()) overlay = createOverlay()
  const bounds = overlay.getBounds()
  overlay.setBounds(overlayPosition(bounds.width, bounds.height), false)
  overlay.show()
  overlay.focus()
  overlay.webContents.send('overlay:visibility', true)
}

function hideOverlay(): void {
  if (!overlay?.isVisible()) return
  overlay.webContents.send('overlay:visibility', false)
  setTimeout(() => overlay?.hide(), 170)
}

function toggleOverlay(): void {
  overlay?.isVisible() ? hideOverlay() : showOverlay()
}

function registerHotkey(accelerator: string): boolean {
  if (registeredHotkey) globalShortcut.unregister(registeredHotkey)
  const success = globalShortcut.register(accelerator, toggleOverlay)
  if (success) registeredHotkey = accelerator
  if (success) logger.info('shortcut.registered', { accelerator })
  else logger.error('shortcut.registration_failed', { accelerator })
  return success
}

function createTray(): void {
  const iconName = 'trayTemplate.svg'
  const icon = nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', iconName))
  if (process.platform === 'darwin') icon.setTemplateImage(true)
  tray = new Tray(icon)
  tray.setToolTip('QuickImage')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open QuickImage', click: showOverlay },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : undefined,
        click: () => {
          quitting = true
          app.quit()
        }
      }
    ])
  )
  tray.on('click', toggleOverlay)
}

function registerIpc(): void {
  ipcMain.handle('search:images', async (_event, query: string, page = 1) => {
    const clean = query.trim().slice(0, 200)
    if (!clean) return { images: [], page: 1, hasMore: false, provider: store.getSettings().provider }
    const settings = store.getSettings()
    const startedAt = Date.now()
    logger.info('search.started', { provider: settings.provider, query: clean, page })
    try {
      const result = await providerFor(settings).search(clean, Math.max(1, page))
      logger.info('search.completed', {
        provider: settings.provider,
        query: clean,
        page,
        results: result.images.length,
        durationMs: Date.now() - startedAt
      })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed.'
      logger.error('search.failed', {
        provider: settings.provider,
        query: clean,
        page,
        durationMs: Date.now() - startedAt,
        error: message,
        cause: error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined
      })
      if (message === 'RATE_LIMITED') {
        throw new Error(`${settings.provider === 'google' ? 'Google' : 'Openverse'} rate limit reached. Please wait and try again.`)
      }
      throw new Error(`${settings.provider === 'google' ? 'Google' : 'Openverse'} search failed: ${message}`)
    }
  })
  ipcMain.handle('image:fetch', async (_event, source: string) => {
    const url = new URL(source)
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported image address.')
    logger.info('image.download_started', { host: url.host })
    const response = await net.fetch(url.toString(), { signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error(`Image download failed (${response.status}).`)
    const declaredLength = Number(response.headers.get('content-length') ?? 0)
    if (declaredLength > 25 * 1024 * 1024) throw new Error('This image is larger than 25 MB.')
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length > 25 * 1024 * 1024) throw new Error('This image is larger than 25 MB.')
    const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'image/png'
    if (!contentType.startsWith('image/')) throw new Error('The selected URL did not return an image.')
    return `data:${contentType};base64,${bytes.toString('base64')}`
  })
  ipcMain.handle('settings:get', () => store.getPublicSettings())
  ipcMain.handle('diagnostics:get', () => logger.diagnostics())
  ipcMain.handle('settings:save', async (_event, patch: Partial<AppSettings>) => {
    const oldHotkey = store.getSettings().hotkey
    if (patch.hotkey && patch.hotkey !== oldHotkey && !registerHotkey(patch.hotkey)) {
      registerHotkey(oldHotkey)
      throw new Error(`“${patch.hotkey}” is already in use by another application.`)
    }
    const updated = await store.updateSettings(patch)
    logger.info('settings.updated', {
      provider: updated.provider,
      hotkey: updated.hotkey,
      googleConfigured: updated.googleConfigured
    })
    return updated
  })
  ipcMain.handle('history:get', () => store.getHistory())
  ipcMain.handle('history:add-query', (_event, query: string) => store.addQuery(query))
  ipcMain.handle('history:save-image', (_event, image) => store.saveImage(image))
  ipcMain.handle('history:clear', () => store.clearHistory())
  ipcMain.handle('clipboard:copy-image', async (_event, dataUrl: string) => {
    const image = nativeImage.createFromDataURL(dataUrl)
    if (image.isEmpty()) throw new Error('The edited image could not be copied.')
    const png = image.toPNG()
    const item = new ClipboardItem({
      'image/png': new Blob([Uint8Array.from(png)], { type: 'image/png' })
    })
    await clipboard.write([item])
  })
  ipcMain.handle('overlay:close', hideOverlay)
  ipcMain.handle('overlay:resize', (_event, requestedHeight: number) => {
    if (!overlay) return
    const area = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea
    const height = Math.min(Math.max(Math.round(requestedHeight), 126), area.height - 110)
    overlay.setBounds(overlayPosition(760, height), true)
  })
}

app.whenReady().then(async () => {
  await initializeLogger()
  store = new AppStore()
  await store.load()
  const envKey = process.env.GOOGLE_API_KEY
  const envCx = process.env.GOOGLE_CX
  if (envKey && envCx && !store.getSettings().googleApiKey) {
    await store.updateSettings({ googleApiKey: envKey, googleCx: envCx })
  }
  overlay = createOverlay()
  createTray()
  registerIpc()
  registerHotkey(store.getSettings().hotkey)
  app.dock?.hide()
  logger.info('application.ready', { provider: store.getSettings().provider })

  nativeTheme.on('updated', () => overlay?.webContents.send('theme:updated', nativeTheme.shouldUseDarkColors))
})

app.on('window-all-closed', () => {
  // Tray applications intentionally remain alive without an open window.
})
app.on('before-quit', () => {
  quitting = true
  globalShortcut.unregisterAll()
})
app.on('activate', showOverlay)
