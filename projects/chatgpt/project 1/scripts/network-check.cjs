const { app, net } = require('electron')

app.whenReady().then(async () => {
  const startedAt = Date.now()
  try {
    const url = new URL('https://api.openverse.org/v1/images/')
    url.searchParams.set('q', 'diagnostic')
    url.searchParams.set('page_size', '1')
    const response = await net.fetch(url.toString(), {
      signal: AbortSignal.timeout(12_000)
    })
    const body = await response.json()
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    console.log(JSON.stringify({
      ok: true,
      provider: 'openverse',
      status: response.status,
      results: body.results?.length ?? 0,
      durationMs: Date.now() - startedAt
    }, null, 2))
    app.exit(0)
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      provider: 'openverse',
      error: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined,
      durationMs: Date.now() - startedAt
    }, null, 2))
    app.exit(1)
  }
})
