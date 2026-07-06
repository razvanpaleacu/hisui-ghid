import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SpriteImage from '../components/SpriteImage'
import {
  AREA_DESCRIPTIONS,
  AREA_MAP_IMAGE,
  AREA_NAMES,
  AREA_ORDER,
  type AreaId,
} from '../data/areas'
import { LOCATIONS } from '../data/locations'
import { formatDexNumber, formatPokemonCount } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import { pokedex } from '../lib/pokedex'
import { useShiny } from '../lib/shiny'
import { usePageTitle } from '../lib/usePageTitle'

// Poziții procentuale pe desktop (hub-and-spoke). Pe mobil se ignoră (grilă).
const LAYOUT: Record<AreaId | 'center', { x: number; y: number }> = {
  center: { x: 50, y: 49 },
  'alabaster-icelands': { x: 19, y: 17 },
  'coronet-highlands': { x: 50, y: 11 },
  'cobalt-coastlands': { x: 83, y: 30 },
  'crimson-mirelands': { x: 74, y: 82 },
  'obsidian-fieldlands': { x: 24, y: 82 },
}

function isAreaId(value: string | null): value is AreaId {
  return !!value && (AREA_ORDER as string[]).includes(value)
}

export default function Tinuturi() {
  const { lang, t } = useLanguage()
  const { shiny } = useShiny()
  usePageTitle(`${t('nav.tinuturi')}${t('site.pageTitleSuffix')}`)

  const [params, setParams] = useSearchParams()
  const zonaParam = params.get('zona')
  const selected: AreaId | null = isAreaId(zonaParam) ? zonaParam : null

  const select = (id: AreaId) => {
    setParams(id === selected ? {} : { zona: id }, { replace: true })
  }

  const pokemonHere = useMemo(
    () =>
      selected
        ? pokedex.filter((p) => LOCATIONS[p.name]?.includes(selected))
        : [],
    [selected],
  )

  const counts = useMemo(() => {
    const m = {} as Record<AreaId, number>
    for (const id of AREA_ORDER) {
      m[id] = pokedex.filter((p) => LOCATIONS[p.name]?.includes(id)).length
    }
    return m
  }, [])

  const card = (id: AreaId) => {
    const active = selected === id
    const pos = LAYOUT[id]
    return (
      <button
        key={id}
        type="button"
        aria-pressed={active}
        aria-label={t('map.openArea', { name: AREA_NAMES[lang][id] })}
        onClick={() => select(id)}
        style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
        className={`group z-10 w-full overflow-hidden rounded-xl border bg-surface text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift lg:absolute lg:w-[150px] lg:-translate-x-1/2 lg:-translate-y-1/2 ${
          active
            ? 'border-accent ring-2 ring-accent/30'
            : 'border-line hover:border-accent/40'
        }`}
      >
        <div className="h-20 w-full overflow-hidden bg-[var(--map-water)]">
          <img
            src={AREA_MAP_IMAGE[id]}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="px-3 py-2">
          <p className="truncate text-xs font-semibold group-hover:text-accent">
            {AREA_NAMES[lang][id]}
          </p>
          <p className="text-[11px] text-muted">
            {formatPokemonCount(counts[id], lang)}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('nav.tinuturi')}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {t('map.intro')}
      </p>

      <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:block lg:h-[560px]">
        {/* Liniile de legătură (doar pe desktop). */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          aria-hidden="true"
        >
          {AREA_ORDER.map((id) => (
            <line
              key={id}
              x1={LAYOUT.center.x}
              y1={LAYOUT.center.y}
              x2={LAYOUT[id].x}
              y2={LAYOUT[id].y}
              stroke="var(--accent)"
              strokeWidth="0.4"
              opacity="0.4"
            />
          ))}
        </svg>

        {/* Prezentarea centrală a regiunii. */}
        <div
          style={{ top: `${LAYOUT.center.y}%`, left: `${LAYOUT.center.x}%` }}
          className="z-10 col-span-2 mx-auto w-full max-w-[220px] rounded-xl border border-line bg-surface p-2 shadow-soft sm:col-span-3 lg:absolute lg:w-[150px] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <svg viewBox="0 0 120 80" className="block w-full" aria-hidden="true">
            <rect width="120" height="80" rx="6" fill="var(--map-water)" />
            <path
              d="M46 16 C64 12 78 18 82 30 C92 34 96 46 86 54 C80 66 60 70 48 62 C34 66 22 56 26 44 C20 34 30 20 46 16 Z"
              fill="var(--map-land)"
              stroke="var(--map-coast)"
              strokeWidth="2"
            />
          </svg>
          <p className="mt-1 text-center text-xs font-semibold">Hisui</p>
        </div>

        {AREA_ORDER.map((id) => card(id))}
      </div>

      <div className="mt-8">
        {!selected ? (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
            {t('map.selectHint')}
          </div>
        ) : (
          <div className="animate-fade-in" key={selected}>
            <h2 className="text-lg font-semibold tracking-tight">
              {AREA_NAMES[lang][selected]}
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
              {AREA_DESCRIPTIONS[lang][selected]}
            </p>
            <img
              src={AREA_MAP_IMAGE[selected]}
              alt={AREA_NAMES[lang][selected]}
              loading="lazy"
              className="mt-4 w-full max-w-lg rounded-xl border border-line"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              {t('map.pokemonHere')} ·{' '}
              {formatPokemonCount(pokemonHere.length, lang)}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {pokemonHere.map((p) => (
                <Link
                  key={p.name}
                  to={`/pokedex/${p.name}`}
                  className="group rounded-lg border border-line bg-surface p-2 text-center transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                >
                  <SpriteImage
                    src={shiny ? p.sprites.shiny : p.sprites.normal}
                    alt={p.displayName}
                    className="mx-auto aspect-square w-full [&_img]:transition-transform group-hover:[&_img]:scale-110"
                  />
                  <p className="mt-1 text-[10px] tabular-nums text-muted">
                    {formatDexNumber(p.dexNumber)}
                  </p>
                  <p className="truncate text-xs font-medium group-hover:text-accent">
                    {p.displayName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
