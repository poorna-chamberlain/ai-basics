import { app } from 'electron'
import { appendFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MAX_LOG_BYTES = 2 * 1024 * 1024
const recentLines: string[] = []
let logFile = ''

function serialize(details?: unknown): string {
  if (details === undefined) return ''
  if (details instanceof Error) {
    const cause = details.cause instanceof Error
      ? { name: details.cause.name, message: details.cause.message }
      : details.cause
    return ` ${JSON.stringify({ name: details.name, message: details.message, cause })}`
  }
  try {
    return ` ${JSON.stringify(details)}`
  } catch {
    return ' {"details":"unserializable"}'
  }
}

async function rotateIfNeeded(): Promise<void> {
  try {
    if ((await stat(logFile)).size < MAX_LOG_BYTES) return
    await rename(logFile, `${logFile}.1`).catch(() => undefined)
    await writeFile(logFile, '', 'utf8')
  } catch {
    // The file does not exist yet.
  }
}

async function write(level: 'INFO' | 'WARN' | 'ERROR', event: string, details?: unknown): Promise<void> {
  const line = `${new Date().toISOString()} [${level}] ${event}${serialize(details)}`
  recentLines.push(line)
  if (recentLines.length > 120) recentLines.shift()
  if (level === 'ERROR') console.error(line)
  else if (level === 'WARN') console.warn(line)
  else console.info(line)
  if (!logFile) return
  await appendFile(logFile, `${line}\n`, 'utf8').catch((error) => {
    console.error('QuickImage could not write its log file', error)
  })
}

export async function initializeLogger(): Promise<void> {
  const directory = path.join(app.getPath('userData'), 'logs')
  await mkdir(directory, { recursive: true })
  logFile = path.join(directory, 'quickimage.log')
  await rotateIfNeeded()
  try {
    const existing = await readFile(logFile, 'utf8')
    recentLines.push(...existing.trim().split('\n').filter(Boolean).slice(-80))
  } catch {
    // Created by the first log entry.
  }
  await write('INFO', 'application.started', {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch
  })
}

export const logger = {
  info: (event: string, details?: unknown) => void write('INFO', event, details),
  warn: (event: string, details?: unknown) => void write('WARN', event, details),
  error: (event: string, details?: unknown) => void write('ERROR', event, details),
  diagnostics: (): { path: string; lines: string[] } => ({
    path: logFile,
    lines: recentLines.slice(-80)
  })
}
