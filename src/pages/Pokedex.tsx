import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import PokemonCard from '../components/PokemonCard'
import { AREA_NAMES, AREA_ORDER } from '../data/areas'
import { LOCATIONS } from '../data/locations'
import { PLA_INFO } from '../data/pladata'
import { STAT_LABELS, STAT_ORDER, formatPokemonCount } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import { pokedex } from '../lib/pokedex'
import { useShiny } from '../lib/shiny'
import { ALL_TYPES, TYPE_COLORS, TYPE_LABELS, typeTextColor } from '../lib/typeInfo'
import type { PokedexEntry, PokemonStats, TypeName } from '../lib/types'
import { usePageTitle } from '../lib/usePageTitle'

type SortField =
  | 'dex'
  | 'name'
  | 'total'
  | keyof PokemonStats
  | 'height'
  | 'weight'
  | 'location'
type SortDir = 'asc' | 'desc'

/**
 * Starea vizuală a grilei, păstrată la nivel de modul ca să supraviețuiască
 * demontării rutei: la revenirea din pagina de detaliu, filtrele, căutarea,
 * sortarea și poziția de scroll sunt exact cum le-ai lăsat.
 */
interface PokedexView {
  query: string
  types: TypeName[]
  sortField: SortField
  sortDir: SortDir
  scrollY: number
}

const view: PokedexView = {
  query: '',
  types: [],
  sortField: 'dex',
  sortDir: 'asc',
  scrollY: 0,
}

function statTotal(p: PokedexEntry): number {
  return STAT_ORDER.reduce((sum, k) => sum + p.stats[k], 0)
}

// Index de căutare: pentru fiecare Pokémon, un text cu tot ce se poate căuta —
// nume (RO/EN), număr, tipuri, ținuturi, forme, plus etichete (shiny/distorsiuni).
const SEARCH_BLOBS = new Map<string, string>(
  pokedex.map((p) => {
    const parts: string[] = [
      p.name,
      p.displayName,
      String(p.dexNumber),
      `#${String(p.dexNumber).padStart(3, '0')}`,
      String(p.nationalDex),
      ...p.types.flatMap((t) => [TYPE_LABELS.ro[t], TYPE_LABELS.en[t]]),
      ...(LOCATIONS[p.name] ?? []).flatMap((a) => [
        AREA_NAMES.ro[a],
        AREA_NAMES.en[a],
      ]),
      ...(p.forms ?? []).flatMap((f) => [f.label.ro, f.label.en]),
    ]
    if (p.isHisuianForm) parts.push('hisui', 'hisuian')
    const info = PLA_INFO[p.name]
    if (info?.distortionOnly)
      parts.push('distortion', 'distortions', 'distorsiune', 'distorsiuni')
    if (info?.behavior) parts.push(info.behavior)
    return [p.name, parts.join(' ').toLowerCase()]
  }),
)

/** Un Pokémon corespunde dacă TOȚI termenii căutării se regăsesc în index. */
function matchesSearch(p: PokedexEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const blob = SEARCH_BLOBS.get(p.name) ?? ''
  return q.split(/\s+/).every((term) => {
    const num = term.replace(/^#/, '')
    if (/^\d+$/.test(num)) {
      return (
        p.dexNumber === Number(num) ||
        p.nationalDex === Number(num) ||
        String(p.dexNumber).startsWith(num) ||
        blob.includes(term)
      )
    }
    return blob.includes(term)
  })
}

/** Cheia de sortare după locație: indicele primului ținut (în ordinea jocului). */
function locationKey(p: PokedexEntry): number {
  const areas = LOCATIONS[p.name]
  if (!areas || areas.length === 0) return AREA_ORDER.length
  return Math.min(...areas.map((a) => AREA_ORDER.indexOf(a)))
}

/** Direcția implicită la alegerea unui criteriu (numeric → descrescător). */
function defaultDir(field: SortField): SortDir {
  return field === 'dex' || field === 'name' || field === 'location'
    ? 'asc'
    : 'desc'
}

export default function Pokedex() {
  const { lang, t } = useLanguage()
  const { shiny } = useShiny()
  usePageTitle(`Pokédex${t('site.pageTitleSuffix')}`)

  const [query, setQuery] = useState(view.query)
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>(view.types)
  const [sortField, setSortField] = useState<SortField>(view.sortField)
  const [sortDir, setSortDir] = useState<SortDir>(view.sortDir)

  useEffect(() => {
    view.query = query
    view.types = selectedTypes
    view.sortField = sortField
    view.sortDir = sortDir
  }, [query, selectedTypes, sortField, sortDir])

  // Restaurăm poziția de scroll la montare și o salvăm continuu.
  useLayoutEffect(() => {
    window.scrollTo(0, view.scrollY)
    const onScroll = () => {
      view.scrollY = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      view.scrollY = window.scrollY
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const filtered = useMemo(() => {
    return pokedex.filter((p) => {
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.some((type) => p.types.includes(type))
      ) {
        return false
      }
      return matchesSearch(p, query)
    })
  }, [query, selectedTypes])

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp: number
      switch (sortField) {
        case 'dex':
          cmp = a.dexNumber - b.dexNumber
          break
        case 'name':
          cmp = a.displayName.localeCompare(b.displayName, lang)
          break
        case 'total':
          cmp = statTotal(a) - statTotal(b)
          break
        case 'height':
          cmp = a.height - b.height
          break
        case 'weight':
          cmp = a.weight - b.weight
          break
        case 'location':
          cmp = locationKey(a) - locationKey(b)
          break
        default:
          cmp = a.stats[sortField] - b.stats[sortField]
      }
      // Tiebreak stabil după numărul din dex.
      return (cmp || a.dexNumber - b.dexNumber) * dir
    })
    return arr
  }, [filtered, sortField, sortDir, lang])

  const hasFilters = query.trim() !== '' || selectedTypes.length > 0

  const toggleType = (type: TypeName) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type],
    )
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedTypes([])
  }

  const changeSortField = (field: SortField) => {
    setSortField(field)
    setSortDir(defaultDir(field))
  }

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'dex', label: t('sort.dex') },
    { value: 'name', label: t('sort.name') },
    { value: 'location', label: t('sort.location') },
    { value: 'total', label: t('sort.total') },
    ...STAT_ORDER.map((s) => ({ value: s, label: STAT_LABELS[lang][s] })),
    { value: 'height', label: t('sort.height') },
    { value: 'weight', label: t('sort.weight') },
  ]

  return (
    <div className="animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('pokedex.title')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t('pokedex.intro', {
            count: formatPokemonCount(pokedex.length, lang),
          })}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="cautare-pokedex" className="sr-only">
            {t('pokedex.searchLabel')}
          </label>
          <input
            id="cautare-pokedex"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pokedex.searchPlaceholder')}
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none sm:max-w-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sortare-pokedex" className="text-sm text-muted">
            {t('sort.label')}
          </label>
          <select
            id="sortare-pokedex"
            value={sortField}
            onChange={(e) => changeSortField(e.target.value as SortField)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            aria-label={t('sort.dirToggle')}
            title={sortDir === 'asc' ? t('sort.dirAsc') : t('sort.dirDesc')}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-ink"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label={t('pokedex.filterAria')}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        {ALL_TYPES.map((type) => {
          const active = selectedTypes.includes(type)
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => toggleType(type)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
                active
                  ? 'border-transparent'
                  : 'border-line bg-surface text-muted hover:text-ink'
              }`}
              style={
                active
                  ? {
                      backgroundColor: TYPE_COLORS[type],
                      color: typeTextColor(type),
                    }
                  : undefined
              }
            >
              {TYPE_LABELS[lang][type]}
            </button>
          )
        })}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-2 py-1 text-xs font-medium text-accent hover:underline"
          >
            {t('pokedex.clearFilters')}
          </button>
        )}
      </div>

      <p role="status" className="mt-6 text-sm text-muted">
        {formatPokemonCount(sorted.length, lang)}
      </p>

      {sorted.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium">{t('pokedex.emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('pokedex.emptyHint')}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent"
          >
            {t('pokedex.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sorted.map((p) => (
            <PokemonCard key={p.name} pokemon={p} shiny={shiny} />
          ))}
        </div>
      )}
    </div>
  )
}
