/// <reference types="electron-vite/node" />

/** Variables electron-vite injects into the main process from `.env`. */
interface ImportMetaEnv {
  readonly MAIN_VITE_GOOGLE_API_KEY?: string
  readonly MAIN_VITE_GOOGLE_CX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
