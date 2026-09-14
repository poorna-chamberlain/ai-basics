/** Translating between keyboard events, Electron accelerators, and readable labels. */

const NAMED_KEYS: Record<string, string> = {
  Space: 'Space',
  Enter: 'Return',
  Escape: 'Escape',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Tab: 'Tab',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/'
}

/**
 * Builds an Electron accelerator from a keydown event, or null if the event is
 * only modifiers or an unusable key.
 *
 * `event.code` is used rather than `event.key` so the binding is physical: with
 * Alt held, macOS reports `event.key` as "ˆ" for the I key, which Electron
 * cannot register.
 */
export function acceleratorFromEvent(event: KeyboardEvent, isMac: boolean): string | null {
  const parts: string[] = []
  if (event.metaKey) parts.push(isMac ? 'Command' : 'Super')
  if (event.ctrlKey) parts.push('Control')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')

  const key = keyFromCode(event.code)
  if (!key) return null
  // A global hotkey without a modifier would swallow the key system-wide.
  if (parts.length === 0) return null

  parts.push(key)
  return parts.join('+')
}

function keyFromCode(code: string): string | null {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit\d$/.test(code)) return code.slice(5)
  if (/^Numpad\d$/.test(code)) return `num${code.slice(6)}`
  if (/^F\d{1,2}$/.test(code)) return code
  return NAMED_KEYS[code] ?? null
}

const MAC_SYMBOLS: Record<string, string> = {
  Command: '⌘',
  Cmd: '⌘',
  CommandOrControl: '⌘',
  CmdOrCtrl: '⌘',
  Control: '⌃',
  Ctrl: '⌃',
  Alt: '⌥',
  Option: '⌥',
  Shift: '⇧',
  Super: '⌘',
  Return: '↩',
  Escape: '⎋',
  Up: '↑',
  Down: '↓',
  Left: '←',
  Right: '→'
}

const WIN_NAMES: Record<string, string> = {
  Command: 'Win',
  Super: 'Win',
  CommandOrControl: 'Ctrl',
  CmdOrCtrl: 'Ctrl',
  Control: 'Ctrl',
  Return: 'Enter'
}

/** `Alt+Shift+I` -> `⌥⇧I` on macOS, `Alt + Shift + I` elsewhere. */
export function formatAccelerator(accelerator: string, isMac: boolean): string {
  const parts = accelerator.split('+').filter(Boolean)
  if (isMac) return parts.map((part) => MAC_SYMBOLS[part] ?? part).join('')
  return parts.map((part) => WIN_NAMES[part] ?? part).join(' + ')
}
