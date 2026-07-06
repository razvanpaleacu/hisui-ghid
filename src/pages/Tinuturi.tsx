import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SpriteImage from '../components/SpriteImage'
import {
  AREA_DESCRIPTIONS,
  AREA_NAMES,
  AREA_ORDER,
  AREA_SHORT,
  type AreaId,
} from '../data/areas'
import { LOCATIONS } from '../data/locations'
import { formatDexNumber, formatPokemonCount } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import { pokedex } from '../lib/pokedex'
import { usePageTitle } from '../lib/usePageTitle'

// Forme abstracte, originale — o hartă stilizată, nu cea oficială din joc.
// Poziționate aproximativ ca geografia regiunii: gheață la nord, coasta la sud,
// muntele Coronet în centru, câmpiile la vest și mlaștinile la est.
const REGIONS: { id: AreaId; cx: number; cy: number; rx: number; ry: number }[] = [
  { id: 'alabaster-icelands', cx: 200, cy: 64, rx: 150, ry: 46 },
  { id: 'obsidian-fieldlands', cx: 94, cy: 210, rx: 78, ry: 82 },
  { id: 'coronet-highlands', cx: 200, cy: 226, rx: 50, ry: 122 },
  { id: 'crimson-mirelands', cx: 306, cy: 210, rx: 80, ry: 84 },
  { id: 'cobalt-coastlands', cx: 200, cy: 398, rx: 150, ry: 48 },
]

function isAreaId(value: string | null): value is AreaId {
  return !!value && (AREA_ORDER as string[]).includes(value)
}

export default function Tinuturi() {
  const { lang, t } = useLanguage()
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

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('nav.tinuturi')}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {t('map.intro')}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr]">
        <svg
          viewBox="0 0 400 460"
          className="w-full select-none"
          role="group"
          aria-label={t('nav.tinuturi')}
        >
          {REGIONS.map((r) => {
            const active = selected === r.id
            return (
              <g
                key={r.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={t('map.openArea', { name: AREA_NAMES[lang][r.id] })}
                onClick={() => select(r.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    select(r.id)
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>ellipse]:stroke-accent"
              >
                <ellipse
                  cx={r.cx}
                  cy={r.cy}
                  rx={r.rx}
                  ry={r.ry}
                  className={`transition-colors ${
                    active
                      ? 'fill-accent stroke-accent'
                      : 'fill-surface stroke-line hover:fill-[#EAF1EC]'
                  }`}
                  strokeWidth={2}
                />
                <text
                  x={r.cx}
                  y={r.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`pointer-events-none text-[15px] font-semibold ${
                    active ? 'fill-white' : 'fill-ink'
                  }`}
                >
                  {AREA_SHORT[lang][r.id]}
                </text>
              </g>
            )
          })}
        </svg>

        <div>
          {!selected ? (
            <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
              {t('map.selectHint')}
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold tracking-tight">
                {AREA_NAMES[lang][selected]}
              </h2>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
                {AREA_DESCRIPTIONS[lang][selected]}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {t('map.pokemonHere')} · {formatPokemonCount(pokemonHere.length, lang)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {pokemonHere.map((p) => (
                  <Link
                    key={p.name}
                    to={`/pokedex/${p.name}`}
                    className="group rounded-lg border border-line bg-surface p-2 text-center transition-colors hover:border-accent"
                  >
                    <SpriteImage
                      src={p.sprites.normal}
                      alt={p.displayName}
                      className="mx-auto aspect-square w-full"
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
    </div>
  )
}
