import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import PokemonCard from '../components/PokemonCard'
import ShinyToggle from '../components/ShinyToggle'
import { STAT_LABELS, STAT_ORDER, formatPokemonCount } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import { pokedex } from '../lib/pokedex'
import { ALL_TYPES, TYPE_COLORS, TYPE_LABELS, typeTextColor } from '../lib/typeInfo'
import type { PokedexEntry, PokemonStats, TypeName } from '../lib/types'
import { usePageTitle } from '../lib/usePageTitle'

type SortField = 'dex' | 'name' | 'total' | keyof PokemonStats | 'height' | 'weight'
type SortDir = 'asc' | 'desc'

/**
 * Starea vizuală a grilei, păstrată la nivel de modul ca să supraviețuiască
 * demontării rutei: la revenirea din pagina de detaliu, filtrele, căutarea,
 * sortarea, comutatorul shiny și poziția de scroll sunt exact cum le-ai lăsat.
 */
interface PokedexView {
  query: string
  types: TypeName[]
  shiny: boolean
  sortField: SortField
  sortDir: SortDir
  scrollY: number
}

const view: PokedexView = {
  query: '',
  types: [],
  shiny: false,
  sortField: 'dex',
  sortDir: 'asc',
  scrollY: 0,
}

function statTotal(p: PokedexEntry): number {
  return STAT_ORDER.reduce((sum, k) => sum + p.stats[k], 0)
}

/** Direcția implicită la alegerea unui criteriu (numeric → descrescător). */
function defaultDir(field: SortField): SortDir {
  return field === 'dex' || field === 'name' ? 'asc' : 'desc'
}

export default function Pokedex() {
  const { lang, t } = useLanguage()
  usePageTitle(`Pokédex${t('site.pageTitleSuffix')}`)

  const [query, setQuery] = useState(view.query)
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>(view.types)
  const [shiny, setShiny] = useState(view.shiny)
  const [sortField, setSortField] = useState<SortField>(view.sortField)
  const [sortDir, setSortDir] = useState<SortDir>(view.sortDir)

  // Oglindim starea în store, ca să o regăsim la revenire.
  useEffect(() => {
    view.query = query
    view.types = selectedTypes
    view.shiny = shiny
    view.sortField = sortField
    view.sortDir = sortDir
  }, [query, selectedTypes, shiny, sortField, sortDir])

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
    const q = query.trim().toLowerCase().replace(/^#/, '')
    return pokedex.filter((p) => {
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.some((type) => p.types.includes(type))
      ) {
        return false
      }
      if (!q) return true
      if (/^\d+$/.test(q)) {
        return p.dexNumber === Number(q) || String(p.dexNumber).startsWith(q)
      }
      return p.name.includes(q) || p.displayName.toLowerCase().includes(q)
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
    { value: 'total', label: t('sort.total') },
    ...STAT_ORDER.map((s) => ({ value: s, label: STAT_LABELS[lang][s] })),
    { value: 'height', label: t('sort.height') },
    { value: 'weight', label: t('sort.weight') },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        <ShinyToggle checked={shiny} onChange={setShiny} />
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
            className="w-full max-w-md rounded-lg border border-line bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
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
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
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
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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

      {/* Comutator shiny plutitor — mereu la îndemână, fără scroll până sus. */}
      <button
        type="button"
        role="switch"
        aria-checked={shiny}
        aria-label={t('shiny.aria')}
        onClick={() => setShiny((s) => !s)}
        className={`fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-md transition-colors ${
          shiny
            ? 'border-transparent bg-accent text-white'
            : 'border-line bg-surface text-ink hover:border-accent'
        }`}
      >
        <span aria-hidden="true">✦</span>
        Shiny
      </button>
    </div>
  )
}
