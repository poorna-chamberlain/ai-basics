import { useEffect } from 'react'
import { AlertIcon, CheckIcon } from './Icons'

export interface ToastMessage {
  id: number
  text: string
  tone: 'success' | 'error'
}

interface Props {
  toast: ToastMessage | null
  onDismiss: () => void
}

/** Brief confirmation pill, e.g. after copying to the clipboard. */
export function Toast({ toast, onDismiss }: Props): React.JSX.Element | null {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, toast.tone === 'error' ? 3600 : 1900)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div className="toast-layer">
      {/* Re-keying on id restarts the entry animation for back-to-back toasts. */}
      <div className="toast" data-tone={toast.tone} key={toast.id} role="status">
        <span className="toast__icon">
          {toast.tone === 'success' ? <CheckIcon size={14} /> : <AlertIcon size={14} />}
        </span>
        {toast.text}
      </div>
    </div>
  )
}
