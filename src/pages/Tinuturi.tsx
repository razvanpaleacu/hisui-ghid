import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeafletMap from '../components/LeafletMap'
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
import { TYPE_COLORS } from '../lib/typeInfo'
import { usePageTitle } from '../lib/usePageTitle'

interface MapView {
  key: string
  label: string
  img: string
  area: AreaId
  accent: string
}

// Numele zonelor la Serebii (harta tiled, ca în PLA-Live-Map).
const SEREBII: Record<AreaId, string> = {
  'obsidian-fieldlands': 'obsidianfieldlands',
  'crimson-mirelands': 'crimsonmirelands',
  'cobalt-coastlands': 'cobaltcoastlands',
  'coronet-highlands': 'coronethighlands',
  'alabaster-icelands': 'alabastericelands',
}

// Culoarea de accent a fiecărui ținut (tipul dominant), pentru carduri.
const AREA_ACCENT: Record<AreaId, string> = {
  'obsidian-fieldlands': TYPE_COLORS.grass,
  'crimson-mirelands': TYPE_COLORS.poison,
  'cobalt-coastlands': TYPE_COLORS.water,
  'coronet-highlands': TYPE_COLORS.rock,
  'alabaster-icelands': TYPE_COLORS.ice,
}

export default function Tinuturi() {
  const { lang, t } = useLanguage()
  const { shiny } = useShiny()
  usePageTitle(`${t('nav.tinuturi')}${t('site.pageTitleSuffix')}`)

  const views: MapView[] = AREA_ORDER.map((id) => ({
    key: id,
    label: AREA_NAMES[lang][id],
    img: AREA_MAP_IMAGE[id],
    area: id,
    accent: AREA_ACCENT[id],
  }))

  const counts = useMemo(() => {
    const m = {} as Record<AreaId, number>
    for (const id of AREA_ORDER) {
      m[id] = pokedex.filter((p) => LOCATIONS[p.name]?.includes(id)).length
    }
    return m
  }, [])

  const [params, setParams] = useSearchParams()
  const zona = params.get('zona')
  const current = views.find((v) => v.key === zona) ?? views[0]

  const selectView = (key: string) => {
    setParams({ zona: key }, { replace: true })
  }

  const pokemonHere = useMemo(
    () =>
      current.area
        ? pokedex.filter((p) => LOCATIONS[p.name]?.includes(current.area!))
        : [],
    [current.area],
  )

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('nav.tinuturi')}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {t('map.intro')}
      </p>

      {/* Selector de zonă — carduri cu numele suprapus pe hartă. */}
      <div
        role="tablist"
        aria-label={t('nav.tinuturi')}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {views.map((v) => {
          const active = v.key === current.key
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectView(v.key)}
              style={active ? { boxShadow: `0 0 0 2px ${v.accent}` } : undefined}
              className="group relative aspect-video overflow-hidden rounded-xl border border-line text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
            >
              <img
                src={v.img}
                alt=""
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  active ? '' : 'saturate-[0.8] group-hover:saturate-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: v.accent }}
                  />
                  <span className="truncate text-sm font-semibold text-white drop-shadow">
                    {v.label}
                  </span>
                </div>
                <span className="text-[11px] text-white/75">
                  {formatPokemonCount(counts[v.area], lang)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Harta interactivă (tile-uri Serebii prin Leaflet, ca PLA-Live-Map). */}
      <div className="mt-4">
        <LeafletMap
          key={current.area}
          area={SEREBII[current.area]}
          label={current.label}
        />
        <p className="mt-2 text-xs text-muted">{t('map.dragHint')}</p>
      </div>

      {/* Detaliile ținutului selectat. */}
      {current.area && (
        <div className="mt-8 animate-fade-in" key={current.key}>
          <h2 className="text-lg font-semibold tracking-tight">
            {current.label}
          </h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
            {AREA_DESCRIPTIONS[lang][current.area]}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('map.pokemonHere')} · {formatPokemonCount(pokemonHere.length, lang)}
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
  )
}
