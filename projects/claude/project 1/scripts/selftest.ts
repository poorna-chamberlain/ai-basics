/**
 * Development self-test. Runs inside Electron's main process so it exercises
 * the real networking layer, the real providers and the real clipboard API.
 *
 *   npm run selftest
 */
import { app, clipboard, nativeImage, ClipboardItem } from 'electron'
import { createProviderRegistry } from '@shared/providers/registry'
import { DEFAULT_SETTINGS, type Settings } from '@shared/types'
import { httpClient, fetchImageAsDataUrl } from '../src/main/net'

let failures = 0

function report(name: string, ok: boolean, detail: string): void {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(42)} ${detail}`)
}

async function main(): Promise<void> {
  const registry = createProviderRegistry(httpClient)
  const base: Settings = { ...DEFAULT_SETTINGS }

  console.log('\n--- providers -------------------------------------------------')

  for (const id of ['wikimedia', 'openverse'] as const) {
    const provider = registry.get(id)
    try {
      const response = await provider.search('golden retriever', 1, base)
      const first = response.results[0]
      report(
        `${id}: direct search`,
        response.results.length > 0,
        `${response.results.length} results, first="${first?.title.slice(0, 34) ?? '-'}" license=${first?.license ?? '-'}`
      )
      if (first) {
        report(
          `${id}: result shape`,
          Boolean(first.thumbnailUrl && first.fullUrl && first.id),
          `thumb=${first.thumbnailUrl.slice(0, 46)}…`
        )
      }
    } catch (error) {
      report(`${id}: direct search`, false, (error as Error).message)
    }
  }

  console.log('\n--- registry fallback ----------------------------------------')

  // Force the flaky provider and confirm the registry silently recovers.
  try {
    const response = await registry.search('mountain lake', 1, {
      ...base,
      providerId: 'openverse',
      autoFallback: true
    })
    report(
      'fallback: openverse -> served',
      response.results.length > 0,
      `servedBy=${response.servedBy}${response.fellBackFrom ? ` (fell back from ${response.fellBackFrom})` : ' (no fallback needed)'}`
    )
  } catch (error) {
    report('fallback: openverse -> served', false, (error as Error).message)
  }

  // Google with no credentials must fail cleanly, then fall back.
  try {
    const response = await registry.search('cat', 1, { ...base, providerId: 'google' })
    report(
      'fallback: unconfigured google',
      response.servedBy !== 'google' && response.results.length > 0,
      `servedBy=${response.servedBy}, fellBackFrom=${response.fellBackFrom}`
    )
  } catch (error) {
    report('fallback: unconfigured google', false, (error as Error).message)
  }

  // With fallback off, the same call must surface a typed error.
  try {
    await registry.search('cat', 1, { ...base, providerId: 'google', autoFallback: false })
    report('error: unconfigured google throws', false, 'expected a SearchError')
  } catch (error) {
    const kind = (error as { kind?: string }).kind
    report('error: unconfigured google throws', kind === 'not_configured', `kind=${kind}`)
  }

  console.log('\n--- image fetch + clipboard ----------------------------------')

  try {
    const wikimedia = registry.get('wikimedia')
    const response = await wikimedia.search('red apple', 1, base)
    const target = response.results[0]
    if (!target) throw new Error('no search result to download')

    const fetched = await fetchImageAsDataUrl(target.thumbnailUrl)
    report(
      'image: download as data URL',
      fetched.dataUrl.startsWith('data:image/') && fetched.byteLength > 1000,
      `${fetched.mimeType}, ${(fetched.byteLength / 1024).toFixed(0)} KB`
    )

    const image = nativeImage.createFromDataURL(fetched.dataUrl)
    report(
      'image: decodes to a bitmap',
      !image.isEmpty(),
      `${image.getSize().width}×${image.getSize().height}`
    )

    const png = new Uint8Array(image.toPNG())
    await clipboard.write([
      new ClipboardItem({ 'image/png': new Blob([png], { type: 'image/png' }) })
    ])
    const hasImage = await clipboard.has('image/png')
    report('clipboard: writes a pasteable PNG', hasImage, `wrote ${(png.length / 1024).toFixed(0)} KB`)
  } catch (error) {
    report('image: download + clipboard', false, (error as Error).message)
  }

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`)
  app.exit(failures === 0 ? 0 : 1)
}

app.whenReady().then(main)
