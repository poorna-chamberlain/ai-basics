import type { QuickImageApi } from './index'

declare global {
  interface Window {
    quickImage: QuickImageApi
  }
}

export {}
