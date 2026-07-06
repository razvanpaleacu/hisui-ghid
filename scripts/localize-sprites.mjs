#!/usr/bin/env node
/**
 * Descarcă toate artwork-urile (artwork + artworkShiny, la intrări și forme),
 * le convertește în WebP optimizat și le salvează local în public/sprites/,
 * apoi rescrie URL-urile din pokedex-hisui.json către căile locale.
 *
 * Motiv: raw.githubusercontent.com limitează rata când grila cere sute de
 * imagini deodată → unele apar ca „?". Găzduite local (same-origin), se încarcă
 * mereu, instant. Rulare: node scripts/localize-sprites.mjs
 */
import { execFile } from 'node:child_process'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const JSON_FILE = path.join(ROOT, 'src', 'data', 'pokedex-hisui.json')
const OUT_DIR = path.join(ROOT, 'public', 'sprites')
const TMP_DIR = path.join(ROOT, '.sprite-tmp')
const CWEBP = process.env.CWEBP || 'cwebp'
const SIZE = 350
const QUALITY = 80
const CONCURRENCY = 6

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const exists = (p) => access(p).then(() => true).catch(() => false)

// githubusercontent limitează dur descărcările în masă; folosim jsDelivr (CDN).
function downloadUrl(url) {
  return url.replace(
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/',
    'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/',
  )
}

/** Calea locală (relativă) pentru un URL de sprite: după „/sprites/pokemon/". */
function localName(url) {
  const after = url.split('/sprites/pokemon/')[1]
  return after.replace(/\//g, '_').replace(/\.png$/i, '.webp')
}

async function fetchBuffer(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(downloadUrl(url))
      if (res.ok) return Buffer.from(await res.arrayBuffer())
      // 403/429/5xx de la CDN → mai încercăm.
      if (![403, 429].includes(res.status) && res.status < 500) {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (e) {
      if (attempt >= 6) throw e
    }
    await sleep(300 * 2 ** attempt + Math.random() * 400)
  }
}

async function convert(url, index) {
  const name = localName(url)
  const out = path.join(OUT_DIR, name)
  // Reluare: sărim ce s-a convertit deja.
  if (await exists(out)) return name
  const tmp = path.join(TMP_DIR, `${index}.png`)
  const buf = await fetchBuffer(url)
  await writeFile(tmp, buf)
  await execFileP(CWEBP, ['-quiet', '-q', String(QUALITY), '-resize', String(SIZE), '0', tmp, '-o', out])
  await rm(tmp, { force: true })
  return name
}

async function mapWithConcurrency(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

async function main() {
  const data = JSON.parse(await readFile(JSON_FILE, 'utf8'))

  // Colectăm toate URL-urile de artwork (unice).
  const urls = new Set()
  const addForm = (f) => {
    urls.add(f.sprites.artwork)
    urls.add(f.sprites.artworkShiny)
  }
  for (const p of data) {
    addForm(p)
    for (const f of p.forms ?? []) addForm(f)
  }
  const list = [...urls]
  console.log(`Artwork-uri unice: ${list.length}`)

  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(TMP_DIR, { recursive: true })

  let done = 0
  let failed = 0
  const map = new Map()
  await mapWithConcurrency(list, CONCURRENCY, async (url, idx) => {
    try {
      const name = await convert(url, idx)
      map.set(url, `sprites/${name}`)
    } catch {
      // O imagine picată nu oprește tot — rămâne pe CDN (cu retry în UI).
      failed++
    }
    if (++done % 60 === 0 || done === list.length) console.log(`  ${done}/${list.length}…`)
  })
  if (failed) console.log(`  ${failed} au picat — rămân pe CDN.`)

  // Rescriem toate referințele către căile locale.
  const rewrite = (s) => {
    s.artwork = map.get(s.artwork) ?? s.artwork
    s.artworkShiny = map.get(s.artworkShiny) ?? s.artworkShiny
  }
  for (const p of data) {
    rewrite(p.sprites)
    for (const f of p.forms ?? []) rewrite(f.sprites)
  }

  await writeFile(JSON_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
  await rm(TMP_DIR, { recursive: true, force: true })
  console.log(`Gata: ${list.length} imagini în public/sprites/, JSON rescris.`)
}

main().catch((e) => {
  console.error('Eroare:', e.message)
  process.exit(1)
})
