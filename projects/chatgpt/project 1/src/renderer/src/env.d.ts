/// <reference types="vite/client" />

import type { QuickImageApi } from '../../shared/types'

declare global {
  interface Window {
    quickImage: QuickImageApi
  }
}

export {}
