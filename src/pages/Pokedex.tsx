import { useMemo, useState } from 'react'
import PokemonCard from '../components/PokemonCard'
import ShinyToggle from '../components/ShinyToggle'
import { formatPokemonCount } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import { pokedex } from '../lib/pokedex'
import { ALL_TYPES, TYPE_COLORS, TYPE_LABELS, typeTextColor } from '../lib/typeInfo'
import type { TypeName } from '../lib/types'
import { usePageTitle } from '../lib/usePageTitle'

export default function Pokedex() {
  const { lang, t } = useLanguage()
  usePageTitle(`Pokédex${t('site.pageTitleSuffix')}`)

  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>([])
  const [shiny, setShiny] = useState(false)

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

      <div className="mt-6">
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
        {formatPokemonCount(filtered.length, lang)}
      </p>

      {filtered.length === 0 ? (
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
          {filtered.map((p) => (
            <PokemonCard key={p.name} pokemon={p} shiny={shiny} />
          ))}
        </div>
      )}
    </div>
  )
}
