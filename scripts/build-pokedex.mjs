#!/usr/bin/env node
/**
 * Generează src/data/pokedex-hisui.json din PokéAPI.
 *
 * Rulare: npm run data
 *
 * - Ia lista Pokédexului Hisui (GET /pokedex/hisui, cu fallback prin
 *   listarea tuturor dex-urilor și căutarea celui cu region === "hisui").
 * - Pentru fiecare specie rezolvă forma corectă: dacă există o varietate
 *   "-hisui" o folosește pe aceea (sprite-uri/tipuri/statistici corecte),
 *   altfel varietatea implicită. Excepțiile care nu urmează convenția
 *   "-hisui" sunt tratate prin VARIETY_OVERRIDES.
 * - Nu descarcă imagini: reține doar URL-urile din repository-ul public
 *   de sprite-uri PokéAPI.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://pokeapi.co/api/v2'
const OUT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'pokedex-hisui.json',
)
const CONCURRENCY = 8
const MAX_RETRIES = 5

// Forme regionale care NU urmează convenția „-hisui" din varieties:
// în Hisui, Basculin apare exclusiv în forma White-Striped (cea care
// evoluează în Basculegion), nu în forma Red-Striped din Unova.
const VARIETY_OVERRIDES = {
  basculin: 'basculin-white-striped',
}

// Nume afișate care nu se obțin corect prin simpla capitalizare.
const NAME_OVERRIDES = {
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'porygon-z': 'Porygon-Z',
}

const STAT_KEYS = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Cache simplu pe durata rulării, ca să nu cerem același URL de două ori.
const cache = new Map()

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url)
  for (let attempt = 1; ; attempt++) {
    let res
    try {
      res = await fetch(url)
    } catch (err) {
      // Eroare de rețea (conexiune întreruptă, DNS etc.) — reîncercăm.
      if (attempt >= MAX_RETRIES) {
        throw new Error(`${url} → ${err.message} (după ${attempt} încercări)`)
      }
      const delay = 500 * 2 ** attempt
      console.warn(`  Eroare de rețea la ${url} — reîncerc în ${delay}ms`)
      await sleep(delay)
      continue
    }
    if (res.ok) {
      const data = await res.json()
      cache.set(url, data)
      return data
    }
    const retriable = res.status === 429 || res.status >= 500
    if (!retriable || attempt >= MAX_RETRIES) {
      throw new Error(`${url} → HTTP ${res.status} (după ${attempt} încercări)`)
    }
    const retryAfter = Number(res.headers.get('retry-after'))
    const delay =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 500 * 2 ** attempt
    console.warn(`  HTTP ${res.status} la ${url} — reîncerc în ${delay}ms`)
    await sleep(delay)
  }
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index], index)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  )
  return results
}

function displayNameFor(speciesName) {
  if (NAME_OVERRIDES[speciesName]) return NAME_OVERRIDES[speciesName]
  return speciesName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function getHisuiDex() {
  try {
    return await fetchJson(`${API}/pokedex/hisui/`)
  } catch {
    console.warn('Dexul "hisui" nu a putut fi luat direct; caut în lista de dex-uri…')
    const list = await fetchJson(`${API}/pokedex/?limit=100`)
    for (const ref of list.results) {
      const dex = await fetchJson(ref.url)
      if (dex.region?.name === 'hisui') return dex
    }
    throw new Error('Nu am găsit niciun Pokédex cu region === "hisui".')
  }
}

// Etichete bilingve pentru sufixele de forme (regionale + alternative reale).
const SUFFIX_LABELS = {
  alola: { ro: 'Alola', en: 'Alolan' },
  galar: { ro: 'Galar', en: 'Galarian' },
  paldea: { ro: 'Paldea', en: 'Paldean' },
  hisui: { ro: 'Hisui', en: 'Hisui' },
  origin: { ro: 'Origin', en: 'Origin' },
  altered: { ro: 'Altered', en: 'Altered' },
  sky: { ro: 'Sky', en: 'Sky' },
  land: { ro: 'Land', en: 'Land' },
  therian: { ro: 'Therian', en: 'Therian' },
  incarnate: { ro: 'Incarnate', en: 'Incarnate' },
  male: { ro: 'Mascul', en: 'Male' },
  female: { ro: 'Femelă', en: 'Female' },
  'red-striped': { ro: 'Dungi roșii', en: 'Red-Striped' },
  'blue-striped': { ro: 'Dungi albastre', en: 'Blue-Striped' },
  'white-striped': { ro: 'Dungi albe', en: 'White-Striped' },
  plant: { ro: 'Frunze', en: 'Plant' },
  sandy: { ro: 'Nisip', en: 'Sandy' },
  trash: { ro: 'Gunoi', en: 'Trash' },
  heat: { ro: 'Heat', en: 'Heat' },
  wash: { ro: 'Wash', en: 'Wash' },
  frost: { ro: 'Frost', en: 'Frost' },
  fan: { ro: 'Fan', en: 'Fan' },
  mow: { ro: 'Mow', en: 'Mow' },
}

// Varietăți cosmetice / de luptă pe care NU le includem (megaevoluții, Gigantamax,
// șepcile lui Pikachu, forme de totem etc.).
const EXCLUDE_VARIETY =
  /-(mega|gmax|totem|cap|cosplay|rock-star|belle|pop-star|phd|libre|partner|starter|eternamax|primal|world|original|busted|hangry|ash)/

const HOME = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home'

// Forme care în PokéAPI nu sunt varietăți separate, ci „pokemon-form"
// (ex. Cherrim înnorat/însorit). Folosim render-urile HOME (HD), nu sprite-urile
// pixel, ca să rămână coerente cu restul imaginilor.
const CURATED_FORMS = {
  cherrim: {
    primaryKey: 'overcast',
    primaryLabel: { ro: 'Înnorat', en: 'Overcast' },
    extra: [
      {
        key: 'sunshine',
        label: { ro: 'Însorit', en: 'Sunshine' },
        sprites: {
          normal: `${HOME}/421-sunshine.png`,
          shiny: `${HOME}/shiny/421-sunshine.png`,
          artwork: `${HOME}/421-sunshine.png`,
          artworkShiny: `${HOME}/shiny/421-sunshine.png`,
        },
      },
    ],
  },
}

/** Sufixul unei varietăți față de numele speciei (ex. „vulpix-alola" → „alola"). */
function variantSuffix(name, speciesName) {
  if (name === speciesName) return ''
  if (name.startsWith(`${speciesName}-`)) return name.slice(speciesName.length + 1)
  return ''
}

/** Eticheta unui sufix: din hartă, altfel title-case ca fallback. */
function labelForSuffix(suffix) {
  if (SUFFIX_LABELS[suffix]) return SUFFIX_LABELS[suffix]
  const titled = suffix
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
  return { ro: titled, en: titled }
}

/** Eticheta formei principale (Hisui/regional/alternativă/standard). */
function computePrimaryLabel(pokemonName, speciesName, varieties) {
  const suffix = variantSuffix(pokemonName, speciesName)
  if (suffix) return { key: suffix, label: labelForSuffix(suffix) }
  const hasRegional = varieties.some((v) =>
    /-(alola|galar|paldea)$/.test(v.pokemon.name),
  )
  return hasRegional
    ? { key: 'original', label: { ro: 'Originală', en: 'Original' } }
    : { key: 'default', label: { ro: 'Standard', en: 'Standard' } }
}

/** Extrage câmpurile comune (tipuri/statistici/sprite-uri) dintr-un „pokemon". */
function extractForm(pokemon) {
  const stats = {}
  for (const s of pokemon.stats) {
    const key = STAT_KEYS[s.stat.name]
    if (key) stats[key] = s.base_stat
  }

  const artwork = pokemon.sprites.other?.['official-artwork'] ?? {}
  const normal = pokemon.sprites.front_default
  const shiny = pokemon.sprites.front_shiny ?? normal
  if (!normal) {
    throw new Error(`"${pokemon.name}" nu are sprite front_default în PokéAPI.`)
  }

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((t) => t.type.name),
    stats,
    height: pokemon.height,
    weight: pokemon.weight,
    sprites: {
      normal,
      shiny,
      artwork: artwork.front_default ?? normal,
      // Unele forme nu au artwork shiny — cădem pe sprite-ul shiny obișnuit.
      artworkShiny: artwork.front_shiny ?? shiny,
    },
  }
}

// Specii cu diferențe de sex vizibile care merită un comutator. Majoritatea
// speciilor marcate `has_gender_differences` au diferențe minuscule (coada lui
// Pikachu etc.) și n-au artwork oficial femelă — le sărim ca să nu aglomerăm.
// (Basculegion e tratat separat, prin varietăți male/female, cu artwork oficial.)
const GENDER_DIFF_NOTABLE = new Set(['hippopotas', 'hippowdon', 'combee'])

/**
 * Forme mascul/femelă din sprite-urile HOME (același stil pentru ambele, ca să
 * se schimbe doar aspectul de sex, nu stilul de desen). Întoarce [male, female]
 * sau null dacă nu există sprite femelă.
 */
function genderForms(pokemon, base) {
  const s = pokemon.sprites
  const home = s.other?.home ?? {}
  if (!home.front_female) return null
  const commonMeta = {
    id: pokemon.id,
    name: pokemon.name,
    // Diferențele de sex sunt cosmetice: tipuri/statistici/dimensiuni identice.
    types: base.types,
    stats: base.stats,
    height: base.height,
    weight: base.weight,
  }
  return [
    {
      key: 'male',
      label: { ro: 'Mascul', en: 'Male' },
      ...commonMeta,
      // Masculul e forma principală → păstrăm official-artwork (coerent cu grila).
      sprites: base.sprites,
    },
    {
      key: 'female',
      label: { ro: 'Femelă', en: 'Female' },
      ...commonMeta,
      // Nu există artwork oficial pentru femelă; folosim render-ul HOME (HD).
      sprites: {
        normal: home.front_female,
        shiny: home.front_shiny_female ?? home.front_female,
        artwork: home.front_female,
        artworkShiny: home.front_shiny_female ?? home.front_female,
      },
    },
  ]
}

async function buildEntry(entry) {
  const species = await fetchJson(entry.pokemon_species.url)

  const hisuiVariety = species.varieties.find((v) =>
    v.pokemon.name.endsWith('-hisui'),
  )
  const overrideName = VARIETY_OVERRIDES[species.name]
  const overrideVariety = overrideName
    ? species.varieties.find((v) => v.pokemon.name === overrideName)
    : undefined
  const variety =
    hisuiVariety ?? overrideVariety ?? species.varieties.find((v) => v.is_default)
  if (!variety) {
    throw new Error(`Specia "${species.name}" nu are nicio varietate utilizabilă.`)
  }

  const pokemon = await fetchJson(variety.pokemon.url)
  const form = extractForm(pokemon)
  const isHisuianForm = pokemon.name.endsWith('-hisui')

  // Forma principală + eticheta ei.
  const pl = computePrimaryLabel(pokemon.name, species.name, species.varieties)
  const forms = [{ key: pl.key, label: pl.label, ...form }]

  if (isHisuianForm) {
    // Forma originală (varietatea default a speciei).
    const defaultVariety = species.varieties.find((v) => v.is_default)
    if (defaultVariety && defaultVariety.pokemon.name !== pokemon.name) {
      const basePokemon = await fetchJson(defaultVariety.pokemon.url)
      forms.push({
        key: 'original',
        label: { ro: 'Originală', en: 'Original' },
        ...extractForm(basePokemon),
      })
    }
  } else {
    // Toate celelalte varietăți reale: regionale (Alola/Galar/Paldea), Rotom,
    // Wormadam, Basculin, legendari (Origin/Therian/…) — fără cele cosmetice.
    for (const v of species.varieties) {
      if (v.pokemon.name === pokemon.name) continue
      if (EXCLUDE_VARIETY.test(v.pokemon.name)) continue
      const suffix = variantSuffix(v.pokemon.name, species.name)
      if (!suffix) continue
      const altPokemon = await fetchJson(v.pokemon.url)
      forms.push({ key: suffix, label: labelForSuffix(suffix), ...extractForm(altPokemon) })
    }
  }

  // Diferențe de sex vizibile (când nu există deja o varietate de sex).
  const hasGenderVariety = forms.some((f) => f.key === 'female' || f.key === 'male')
  if (GENDER_DIFF_NOTABLE.has(species.name) && !hasGenderVariety) {
    const pair = genderForms(pokemon, form)
    if (pair) {
      // Înlocuim forma principală cu perechea mascul/femelă (același stil HOME).
      forms.splice(0, 1, ...pair)
    }
  }

  // Forme punctuale de tip „pokemon-form" (ex. Cherrim înnorat/însorit).
  const curated = CURATED_FORMS[species.name]
  if (curated) {
    forms[0].key = curated.primaryKey
    forms[0].label = curated.primaryLabel
    for (const ex of curated.extra) {
      forms.push({
        key: ex.key,
        label: ex.label,
        id: form.id,
        name: form.name,
        types: form.types,
        stats: form.stats,
        height: form.height,
        weight: form.weight,
        sprites: ex.sprites,
      })
    }
  }

  return {
    dexNumber: entry.entry_number,
    id: form.id,
    nationalDex: species.id,
    name: form.name,
    displayName: displayNameFor(species.name),
    types: form.types,
    stats: form.stats,
    height: form.height,
    weight: form.weight,
    isHisuianForm,
    sprites: form.sprites,
    locations: [],
    ...(forms.length > 1 ? { forms } : {}),
  }
}

async function main() {
  console.log('Iau Pokédexul Hisui de la PokéAPI…')
  const dex = await getHisuiDex()
  const total = dex.pokemon_entries.length
  console.log(`Dex găsit: "${dex.name}" cu ${total} intrări.`)

  let done = 0
  const entries = await mapWithConcurrency(
    dex.pokemon_entries,
    CONCURRENCY,
    async (entry) => {
      const built = await buildEntry(entry)
      done++
      if (done % 40 === 0 || done === total) {
        console.log(`  ${done}/${total}…`)
      }
      return built
    },
  )

  entries.sort((a, b) => a.dexNumber - b.dexNumber)

  // Validări de bază înainte de scriere.
  if (entries.length !== total) {
    throw new Error(`Am construit ${entries.length} intrări, dar dexul are ${total}.`)
  }
  const hisuiForms = entries.filter((e) => e.isHisuianForm)
  const missingShinyArt = entries.filter(
    (e) => e.sprites.artworkShiny === e.sprites.shiny,
  )

  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + '\n', 'utf8')

  console.log(`\nScris: ${path.relative(process.cwd(), OUT_FILE)}`)
  console.log(`Total intrări: ${entries.length}`)
  console.log(
    `Forme Hisui (${hisuiForms.length}): ${hisuiForms.map((e) => e.name).join(', ')}`,
  )
  if (missingShinyArt.length > 0) {
    console.log(
      `Fără artwork shiny (fallback pe sprite): ${missingShinyArt.map((e) => e.name).join(', ')}`,
    )
  }
}

main().catch((err) => {
  console.error('\nEroare la generarea datelor:', err.message)
  process.exit(1)
})
