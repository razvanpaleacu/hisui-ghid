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
import { usePageTitle } from '../lib/usePageTitle'

interface MapView {
  key: string
  label: string
  img: string
  area: AreaId
}

// Numele zonelor la Serebii (harta tiled, ca în PLA-Live-Map).
const SEREBII: Record<AreaId, string> = {
  'obsidian-fieldlands': 'obsidianfieldlands',
  'crimson-mirelands': 'crimsonmirelands',
  'cobalt-coastlands': 'cobaltcoastlands',
  'coronet-highlands': 'coronethighlands',
  'alabaster-icelands': 'alabastericelands',
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
  }))

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

      {/* Selector de zonă. */}
      <div
        role="tablist"
        aria-label={t('nav.tinuturi')}
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
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
              className={`shrink-0 overflow-hidden rounded-lg border text-left transition-all ${
                active
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-line hover:border-accent/40'
              }`}
            >
              <img
                src={v.img}
                alt=""
                loading="lazy"
                className="h-12 w-24 object-cover"
              />
              <span
                className={`block px-2 py-1 text-[11px] font-medium ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                {v.label}
              </span>
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
