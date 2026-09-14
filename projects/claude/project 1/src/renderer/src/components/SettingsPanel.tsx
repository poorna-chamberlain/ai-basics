import { useEffect, useState } from 'react'
import type { ProviderStatus, Settings, ThemePreference } from '@shared/types'
import { acceleratorFromEvent, formatAccelerator } from '@/lib/accelerator'
import { ExternalIcon } from './Icons'

const GOOGLE_CONSOLE_URL = 'https://developers.google.com/custom-search/v1/overview'
const GOOGLE_CX_URL = 'https://programmablesearchengine.google.com/controlpanel/all'

interface Props {
  settings: Settings
  providers: ProviderStatus[]
  isMac: boolean
  hotkeyError: string | null
  onChange: (patch: Partial<Settings>) => void
}

export function SettingsPanel({
  settings,
  providers,
  isMac,
  hotkeyError,
  onChange
}: Props): React.JSX.Element {
  const [recording, setRecording] = useState(false)

  // Credentials are edited locally and committed on blur so a partially typed
  // key never gets persisted and marked "configured".
  const [apiKey, setApiKey] = useState(settings.googleApiKey)
  const [cx, setCx] = useState(settings.googleCx)

  useEffect(() => setApiKey(settings.googleApiKey), [settings.googleApiKey])
  useEffect(() => setCx(settings.googleCx), [settings.googleCx])

  /* ------------------------------------------------------- hotkey capture -- */

  useEffect(() => {
    if (!recording) return

    const onKeyDown = (event: KeyboardEvent): void => {
      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        setRecording(false)
        return
      }

      const accelerator = acceleratorFromEvent(event, isMac)
      if (!accelerator) return // modifier-only press: keep listening

      setRecording(false)
      onChange({ hotkey: accelerator })
    }

    // Capture phase so the panel's own Escape handler does not close the window.
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [recording, isMac, onChange])

  const googleReady = apiKey.trim().length > 0 && cx.trim().length > 0

  return (
    <div className="settings">
      {/* --------------------------------------------------------- provider -- */}
      <div className="field">
        <span className="field__label">Image source</span>

        {providers.map((provider) => {
          const disabled = provider.requiresKey && !provider.configured
          return (
            <button
              key={provider.id}
              type="button"
              className="option"
              data-active={settings.providerId === provider.id}
              data-disabled={disabled}
              disabled={disabled}
              onClick={() => onChange({ providerId: provider.id })}
            >
              <span className="option__radio" />
              <span className="option__body">
                <span className="option__title">
                  {provider.label}
                  {!provider.requiresKey && <span className="badge">No key</span>}
                  {provider.requiresKey && !provider.configured && (
                    <span className="badge">Needs setup</span>
                  )}
                  {provider.requiresKey && provider.configured && (
                    <span className="badge" data-tone="accent">
                      Ready
                    </span>
                  )}
                </span>
                <span className="option__desc">{provider.description}</span>
              </span>
            </button>
          )
        })}

        <div className="switch-row" style={{ marginTop: 'var(--space-2)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)' }}>Fall back automatically</div>
            <div className="field__hint">
              If the selected source is down or rate limited, quietly retry with another key-free
              source instead of showing an error.
            </div>
          </div>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={settings.autoFallback}
            aria-label="Fall back automatically"
            data-on={settings.autoFallback}
            onClick={() => onChange({ autoFallback: !settings.autoFallback })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ google credentials -- */}
      <div className="field">
        <span className="field__label">Google Custom Search (optional)</span>

        <input
          className="input input--mono"
          type="password"
          spellCheck={false}
          autoComplete="off"
          placeholder="API key"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          onBlur={() => onChange({ googleApiKey: apiKey.trim() })}
        />
        <input
          className="input input--mono"
          type="text"
          spellCheck={false}
          autoComplete="off"
          placeholder="Search engine ID (cx)"
          value={cx}
          onChange={(event) => setCx(event.target.value)}
          onBlur={() => onChange({ googleCx: cx.trim() })}
        />

        <span className="field__hint" data-tone={googleReady ? 'success' : undefined}>
          {googleReady
            ? 'Both values set — Google Images is selectable above.'
            : 'Both values are required before Google Images can be selected.'}{' '}
          <button
            type="button"
            className="link"
            onClick={() => window.quickImage.openExternal(GOOGLE_CONSOLE_URL)}
          >
            Get an API key <ExternalIcon size={10} />
          </button>{' '}
          ·{' '}
          <button
            type="button"
            className="link"
            onClick={() => window.quickImage.openExternal(GOOGLE_CX_URL)}
          >
            Create a search engine <ExternalIcon size={10} />
          </button>
        </span>
      </div>

      {/* ----------------------------------------------------------- hotkey -- */}
      <div className="field">
        <span className="field__label">Global shortcut</span>
        <div className="hotkey-capture">
          <button
            type="button"
            className="hotkey-capture__field"
            data-recording={recording}
            onClick={() => setRecording((value) => !value)}
          >
            {recording ? 'Press a key combination…' : formatAccelerator(settings.hotkey, isMac)}
          </button>
          {recording ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setRecording(false)}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => onChange({ hotkey: 'Alt+Shift+I' })}
            >
              Reset
            </button>
          )}
        </div>
        <span className="field__hint" data-tone={hotkeyError ? 'error' : undefined}>
          {hotkeyError ?? 'Needs at least one modifier. Works from any app, even unfocused.'}
        </span>
      </div>

      {/* ----------------------------------------------------------- theme --- */}
      <div className="field">
        <span className="field__label">Appearance</span>
        <div className="segmented" style={{ alignSelf: 'flex-start' }}>
          {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => (
            <button
              key={option}
              type="button"
              className="segmented__item"
              data-active={settings.theme === option}
              onClick={() => onChange({ theme: option })}
              style={{ textTransform: 'capitalize', padding: '3px 10px' }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------- removal model --- */}
      <div className="field">
        <span className="field__label">Background removal quality</span>
        <div className="segmented" style={{ alignSelf: 'flex-start' }}>
          <button
            type="button"
            className="segmented__item"
            data-active={settings.bgRemovalModel === 'isnet_quint8'}
            onClick={() => onChange({ bgRemovalModel: 'isnet_quint8' })}
            style={{ padding: '3px 10px' }}
          >
            Fast
          </button>
          <button
            type="button"
            className="segmented__item"
            data-active={settings.bgRemovalModel === 'isnet_fp16'}
            onClick={() => onChange({ bgRemovalModel: 'isnet_fp16' })}
            style={{ padding: '3px 10px' }}
          >
            High quality
          </button>
        </div>
        <span className="field__hint">
          Runs entirely on this machine. Fast downloads a 44 MB model, high quality 88 MB — once
          each, then cached for offline use.
        </span>
      </div>

      {/* ------------------------------------------------------ login item --- */}
      <div className="field">
        <div className="switch-row">
          <div>
            <div style={{ fontSize: 'var(--text-sm)' }}>Launch at login</div>
            <div className="field__hint">Start QuickImage in the background when you sign in.</div>
          </div>
          <button
            type="button"
            className="switch"
            role="switch"
            aria-checked={settings.launchAtLogin}
            aria-label="Launch at login"
            data-on={settings.launchAtLogin}
            onClick={() => onChange({ launchAtLogin: !settings.launchAtLogin })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
    </div>
  )
}
