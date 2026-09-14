import { globalShortcut } from 'electron'
import { DEFAULT_SETTINGS } from '@shared/types'

/**
 * Owns the single global hotkey. Registration can fail when another app already
 * holds the combination, so rebinding reports success instead of throwing and
 * always leaves *some* working hotkey registered.
 */
export class HotkeyManager {
  private current: string | null = null

  constructor(private readonly onTrigger: () => void) {}

  get accelerator(): string | null {
    return this.current
  }

  /**
   * Registers `accelerator`, keeping the previous binding if the new one is
   * rejected by the OS.
   */
  register(accelerator: string): { ok: boolean; error?: string } {
    const previous = this.current

    this.unregister()

    if (!isPlausibleAccelerator(accelerator)) {
      if (previous) this.registerRaw(previous)
      return { ok: false, error: 'That shortcut needs at least one modifier and one key.' }
    }

    if (this.registerRaw(accelerator)) return { ok: true }

    // Put the old binding back so the user is never left with no hotkey at all.
    if (previous && this.registerRaw(previous)) {
      return { ok: false, error: `${accelerator} is already in use by another app.` }
    }
    if (this.registerRaw(DEFAULT_SETTINGS.hotkey)) {
      return { ok: false, error: `${accelerator} is unavailable. Reverted to the default shortcut.` }
    }
    return { ok: false, error: `${accelerator} is already in use by another app.` }
  }

  private registerRaw(accelerator: string): boolean {
    try {
      const ok = globalShortcut.register(accelerator, this.onTrigger)
      if (ok) this.current = accelerator
      return ok
    } catch {
      return false
    }
  }

  unregister(): void {
    if (this.current) {
      try {
        globalShortcut.unregister(this.current)
      } catch {
        // Already gone; nothing to clean up.
      }
      this.current = null
    }
  }

  unregisterAll(): void {
    this.current = null
    globalShortcut.unregisterAll()
  }
}

const MODIFIERS = new Set([
  'command',
  'cmd',
  'control',
  'ctrl',
  'commandorcontrol',
  'cmdorctrl',
  'alt',
  'option',
  'altgr',
  'shift',
  'super',
  'meta'
])

/**
 * Electron throws on malformed accelerators, so screen them first. A usable
 * global hotkey needs at least one modifier plus exactly one non-modifier key.
 */
export function isPlausibleAccelerator(accelerator: string): boolean {
  const parts = accelerator
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) return false

  const modifiers = parts.filter((p) => MODIFIERS.has(p.toLowerCase()))
  const keys = parts.filter((p) => !MODIFIERS.has(p.toLowerCase()))
  return modifiers.length >= 1 && keys.length === 1
}
