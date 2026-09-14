import { app, Menu, nativeImage, Tray } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Menu-bar / system-tray presence. The app has no dock icon or normal window. */

const isMac = process.platform === 'darwin'

/**
 * Icons live in `resources/`, which electron-builder unpacks out of the asar so
 * the paths resolve identically in dev and in a packaged app.
 */
function resourcesDir(): string {
  if (app.isPackaged) {
    const unpacked = join(process.resourcesPath, 'app.asar.unpacked', 'resources')
    if (existsSync(unpacked)) return unpacked
    return join(process.resourcesPath, 'resources')
  }
  return join(app.getAppPath(), 'resources')
}

function trayImage(): Electron.NativeImage {
  const dir = resourcesDir()
  // A template image is recoloured by macOS to match the menu bar in both
  // light and dark mode; other platforms need the coloured version.
  const file = isMac ? 'trayTemplate.png' : 'tray.png'
  const image = nativeImage.createFromPath(join(dir, file))
  if (isMac) image.setTemplateImage(true)
  return image
}

export interface TrayActions {
  onToggle: () => void
  onOpenSettings: () => void
  onQuit: () => void
}

export function createTray(actions: TrayActions, getHotkey: () => string | null): Tray {
  const tray = new Tray(trayImage())
  tray.setToolTip('QuickImage')

  const rebuild = (): void => {
    const hotkey = getHotkey()
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Open QuickImage',
          accelerator: hotkey ?? undefined,
          click: actions.onToggle
        },
        { type: 'separator' },
        { label: 'Settings…', click: actions.onOpenSettings },
        { type: 'separator' },
        { label: 'Quit QuickImage', click: actions.onQuit }
      ])
    )
  }

  rebuild()

  // On Windows a left click should summon the panel directly rather than open
  // the menu, matching how tray utilities behave there.
  if (!isMac) tray.on('click', actions.onToggle)

  // Expose the rebuild so the menu's accelerator label follows hotkey changes.
  ;(tray as Tray & { refresh?: () => void }).refresh = rebuild
  return tray
}

export function refreshTray(tray: Tray | null): void {
  ;(tray as (Tray & { refresh?: () => void }) | null)?.refresh?.()
}
