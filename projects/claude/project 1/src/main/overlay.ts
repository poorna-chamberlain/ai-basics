import { app, BrowserWindow, screen, shell } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'

/**
 * The overlay window: a frameless, always-on-top panel that behaves like
 * Spotlight rather than like a browser window.
 */

const isMac = process.platform === 'darwin'
const isWindows = process.platform === 'win32'

/** Windows 11 (build >= 22000) is the first release with acrylic backdrops. */
const supportsAcrylic = isWindows && Number.parseInt(release().split('.')[2] ?? '0', 10) >= 22000

/**
 * macOS and Windows 11 can blur the desktop behind the window natively, and
 * both mask the window to rounded corners themselves. Everywhere else we fall
 * back to a transparent window whose corners are rounded in CSS.
 */
export const usesNativeMaterial = isMac || supportsAcrylic

export type SurfaceMode = 'vibrancy' | 'acrylic' | 'fallback'
export const surfaceMode: SurfaceMode = isMac ? 'vibrancy' : supportsAcrylic ? 'acrylic' : 'fallback'

export const WINDOW_WIDTH = 720
/** Height of the panel when only the search field is showing. */
export const COLLAPSED_HEIGHT = 68
export const MAX_HEIGHT = 660

export class Overlay {
  private window: BrowserWindow | null = null
  private currentHeight = COLLAPSED_HEIGHT
  /** Suppresses blur-to-hide while the window is being shown or torn down. */
  private ignoreBlur = false

  constructor(
    private readonly preload: string,
    private readonly target: { url: string | null; file: string | null }
  ) {}

  create(): BrowserWindow {
    const window = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: COLLAPSED_HEIGHT,
      show: false,
      frame: false,
      // A transparent window cannot host a native material, so the two paths
      // are mutually exclusive.
      transparent: !usesNativeMaterial,
      backgroundColor: usesNativeMaterial ? undefined : '#00000000',
      vibrancy: isMac ? 'under-window' : undefined,
      visualEffectState: isMac ? 'active' : undefined,
      backgroundMaterial: supportsAcrylic ? 'acrylic' : undefined,
      roundedCorners: true,
      hasShadow: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      acceptFirstMouse: true,
      title: 'QuickImage',
      webPreferences: {
        preload: this.preload,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        // Background removal runs in a worker; throttling would stall it while
        // the panel is not frontmost.
        backgroundThrottling: false,
        spellcheck: false
      }
    })

    // `screen-saver` level keeps the panel above full-screen apps and other
    // always-on-top windows, which is what makes it feel OS-level.
    window.setAlwaysOnTop(true, 'screen-saver', 1)
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    window.on('blur', () => {
      if (this.ignoreBlur) return
      // Staying open while DevTools has focus keeps the panel debuggable.
      if (window.webContents.isDevToolsOpened()) return
      this.hide()
    })

    window.on('closed', () => {
      this.window = null
    })

    // External links (attribution, "get an API key") belong in the browser.
    window.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url)
      return { action: 'deny' }
    })
    window.webContents.on('will-navigate', (event, url) => {
      const internal = url.startsWith('app://') || (this.target.url ? url.startsWith(this.target.url) : false)
      if (!internal) {
        event.preventDefault()
        void shell.openExternal(url)
      }
    })

    const entry = this.target.url ?? this.target.file
    if (entry) void window.loadURL(entry)

    this.window = window
    return window
  }

  get browserWindow(): BrowserWindow | null {
    return this.window
  }

  private ensureWindow(): BrowserWindow {
    if (!this.window || this.window.isDestroyed()) return this.create()
    return this.window
  }

  isVisible(): boolean {
    return Boolean(this.window && !this.window.isDestroyed() && this.window.isVisible())
  }

  toggle(): void {
    if (this.isVisible()) this.hide()
    else this.show()
  }

  show(): void {
    const window = this.ensureWindow()

    this.ignoreBlur = true
    this.positionOnActiveDisplay(window)
    window.show()
    window.focus()
    if (isMac) {
      // The app is an accessory (LSUIElement), so it needs to explicitly take
      // focus for keystrokes to reach the search field.
      app.focus({ steal: true })
      window.moveTop()
    }

    window.webContents.send('overlay:shown')
    setTimeout(() => {
      this.ignoreBlur = false
    }, 200)
  }

  hide(): void {
    const window = this.window
    if (!window || window.isDestroyed() || !window.isVisible()) return

    this.ignoreBlur = true
    window.webContents.send('overlay:hidden')
    window.hide()
    // Returning focus to the previous app is what users expect from a launcher.
    if (isMac) app.hide()
    this.ignoreBlur = false
  }

  /** Places the panel centred in the upper third of whichever screen has the cursor. */
  private positionOnActiveDisplay(window: BrowserWindow): void {
    const cursor = screen.getCursorScreenPoint()
    const { workArea } = screen.getDisplayNearestPoint(cursor)

    window.setBounds({
      x: Math.round(workArea.x + (workArea.width - WINDOW_WIDTH) / 2),
      y: Math.round(workArea.y + workArea.height * 0.18),
      width: WINDOW_WIDTH,
      height: this.currentHeight
    })
  }

  /**
   * Grows/shrinks the panel to match its content, the way Spotlight expands as
   * results arrive. Driven by a ResizeObserver in the renderer.
   */
  setContentHeight(height: number): void {
    const window = this.window
    if (!window || window.isDestroyed()) return

    const next = Math.max(COLLAPSED_HEIGHT, Math.min(MAX_HEIGHT, Math.round(height)))
    if (Math.abs(next - this.currentHeight) < 2) return

    this.currentHeight = next
    if (!window.isVisible()) return

    const bounds = window.getBounds()
    window.setBounds({ ...bounds, height: next })
  }

  destroy(): void {
    this.ignoreBlur = true
    if (this.window && !this.window.isDestroyed()) this.window.destroy()
    this.window = null
  }
}

/** Resolves the renderer entry for dev (Vite server) vs packaged (app://) builds. */
export function resolveRendererTarget(): { url: string | null; file: string | null } {
  const devServer = process.env['ELECTRON_RENDERER_URL']
  if (!app.isPackaged && devServer) return { url: devServer, file: null }
  return { url: null, file: 'app://bundle/index.html' }
}

export function preloadPath(): string {
  return join(__dirname, '../preload/index.js')
}
