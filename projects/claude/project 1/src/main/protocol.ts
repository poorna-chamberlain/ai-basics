import { net, protocol } from 'electron'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Serving the packaged renderer over a custom standard scheme (rather than
 * `file://`) gives it a real, secure origin. That is what allows the
 * background-removal worker, its WASM module and Cache Storage to work in a
 * production build.
 *
 * Must be called before `app.whenReady()`.
 */
export function registerAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

/** Must be called after the app is ready. */
export function serveRenderer(): void {
  const rendererRoot = join(__dirname, '../renderer')

  protocol.handle('app', async (request) => {
    const { pathname } = new URL(request.url)
    const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'

    // Contain path traversal: anything resolving outside the bundle is refused.
    const resolved = join(rendererRoot, relative)
    if (!resolved.startsWith(rendererRoot)) {
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(pathToFileURL(resolved).toString())
  })
}
