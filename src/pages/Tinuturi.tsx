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
import ancientMap from '../assets/maps/ancient-retreat.png'
import jubilifeMap from '../assets/maps/jubilife-village.png'

// Cele 7 panouri, în aranjamentul din harta jocului: cinci ținuturi + două
// așezări (Jubilife Village, Ancient Retreat). Pozițiile sunt procentuale, pe
// desktop (hub-and-spoke); pe mobil se ignoră și panourile curg într-o grilă.
// `route` = felul conectorului portocaliu ('v' = vertical întâi, 'h' = orizontal).
interface Panel {
  key: string
  label: string
  img: string
  x: number
  y: number
  route: 'v' | 'h'
  area?: AreaId
}

const CENTER = { x: 45, y: 51 }

export default function Tinuturi() {
  const { lang, t } = useLanguage()
  const { shiny } = useShiny()
  usePageTitle(`${t('nav.tinuturi')}${t('site.pageTitleSuffix')}`)

  const [params, setParams] = useSearchParams()
  const zonaParam = params.get('zona')
  const selected: AreaId | null =
    zonaParam && (AREA_ORDER as string[]).includes(zonaParam)
      ? (zonaParam as AreaId)
      : null

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

  const panels: Panel[] = [
    { key: 'alabaster-icelands', label: AREA_NAMES[lang]['alabaster-icelands'], img: AREA_MAP_IMAGE['alabaster-icelands'], x: 17, y: 17, route: 'v', area: 'alabaster-icelands' },
    { key: 'coronet-highlands', label: AREA_NAMES[lang]['coronet-highlands'], img: AREA_MAP_IMAGE['coronet-highlands'], x: 45, y: 12, route: 'v', area: 'coronet-highlands' },
    { key: 'ancient-retreat', label: 'Ancient Retreat', img: ancientMap, x: 76, y: 17, route: 'v' },
    { key: 'jubilife-village', label: 'Jubilife Village', img: jubilifeMap, x: 13, y: 51, route: 'h' },
    { key: 'cobalt-coastlands', label: AREA_NAMES[lang]['cobalt-coastlands'], img: AREA_MAP_IMAGE['cobalt-coastlands'], x: 83, y: 49, route: 'h', area: 'cobalt-coastlands' },
    { key: 'obsidian-fieldlands', label: AREA_NAMES[lang]['obsidian-fieldlands'], img: AREA_MAP_IMAGE['obsidian-fieldlands'], x: 30, y: 87, route: 'v', area: 'obsidian-fieldlands' },
    { key: 'crimson-mirelands', label: AREA_NAMES[lang]['crimson-mirelands'], img: AREA_MAP_IMAGE['crimson-mirelands'], x: 61, y: 87, route: 'v', area: 'crimson-mirelands' },
  ]

  const counts = useMemo(() => {
    const m = {} as Record<AreaId, number>
    for (const id of AREA_ORDER) {
      m[id] = pokedex.filter((p) => LOCATIONS[p.name]?.includes(id)).length
    }
    return m
  }, [])

  const connectorPoints = (p: Panel) =>
    p.route === 'v'
      ? `${CENTER.x},${CENTER.y} ${CENTER.x},${p.y} ${p.x},${p.y}`
      : `${CENTER.x},${CENTER.y} ${p.x},${CENTER.y} ${p.x},${p.y}`

  const panelInner = (p: Panel) => {
    const active = p.area && selected === p.area
    return (
      <>
        <p
          className={`mb-1 truncate text-center text-xs font-semibold ${
            active ? 'text-accent' : 'text-ink'
          }`}
        >
          {p.label}
        </p>
        <div className="overflow-hidden rounded-lg border border-line">
          <img
            src={p.img}
            alt={p.label}
            loading="lazy"
            className="h-[70px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </>
    )
  }

  const panelPos = (p: { x: number; y: number }) => ({
    top: `${p.y}%`,
    left: `${p.x}%`,
  })

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('nav.tinuturi')}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {t('map.intro')}
      </p>

      <div
        className="relative mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line p-4 sm:grid-cols-3 lg:block lg:h-[660px]"
        style={{ background: 'var(--map-board)' }}
      >
        {/* Conectorii portocalii (doar pe desktop). */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          aria-hidden="true"
        >
          {panels.map((p) => (
            <polyline
              key={p.key}
              points={connectorPoints(p)}
              fill="none"
              stroke="#c96f3c"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {panels.map((p) => (
            <circle key={`d-${p.key}`} cx={p.x} cy={p.y} r={1.2} fill="#c96f3c" vectorEffect="non-scaling-stroke" />
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r={1.6} fill="#c96f3c" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Prezentarea centrală a regiunii. */}
        <div
          style={panelPos(CENTER)}
          className="z-10 col-span-2 mx-auto w-full max-w-[200px] rounded-xl border border-line bg-surface p-2 shadow-soft sm:col-span-3 lg:absolute lg:w-[140px] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2"
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

        {panels.map((p) =>
          p.area ? (
            <button
              key={p.key}
              type="button"
              aria-pressed={selected === p.area}
              aria-label={t('map.openArea', { name: p.label })}
              onClick={() => p.area && select(p.area)}
              style={panelPos(p)}
              className={`group z-10 w-full rounded-xl border bg-surface p-2 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift lg:absolute lg:w-[150px] lg:-translate-x-1/2 lg:-translate-y-1/2 ${
                selected === p.area
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-line hover:border-accent/40'
              }`}
            >
              {panelInner(p)}
            </button>
          ) : (
            <div
              key={p.key}
              style={panelPos(p)}
              className="group z-10 w-full rounded-xl border border-line bg-surface p-2 shadow-soft lg:absolute lg:w-[150px] lg:-translate-x-1/2 lg:-translate-y-1/2"
            >
              {panelInner(p)}
            </div>
          ),
        )}
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
              {formatPokemonCount(counts[selected], lang)}
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
