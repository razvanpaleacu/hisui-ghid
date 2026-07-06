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
import { useShiny } from '../lib/shiny'
import { TYPE_COLORS } from '../lib/typeInfo'
import { usePageTitle } from '../lib/usePageTitle'

// Hartă stilizată, originală — nu cea oficială din joc. Zonele sunt așezate
// aproximativ ca geografia regiunii: gheață la nord, coastă la sud, muntele
// Coronet în centru, câmpiile la vest, mlaștinile la est. Punctul colorat
// sugerează tipul dominant al zonei.
const REGIONS: {
  id: AreaId
  cx: number
  cy: number
  rx: number
  ry: number
  accent: string
}[] = [
  // Ordinea contează la desenare — Coronet (centru, îngust) e ultimul ca să
  // stea deasupra vecinilor și să nu-i fie tăiată eticheta.
  { id: 'alabaster-icelands', cx: 220, cy: 96, rx: 150, ry: 58, accent: TYPE_COLORS.ice },
  { id: 'obsidian-fieldlands', cx: 116, cy: 252, rx: 90, ry: 88, accent: TYPE_COLORS.grass },
  { id: 'crimson-mirelands', cx: 336, cy: 252, rx: 90, ry: 90, accent: TYPE_COLORS.poison },
  { id: 'cobalt-coastlands', cx: 220, cy: 418, rx: 150, ry: 56, accent: TYPE_COLORS.water },
  { id: 'coronet-highlands', cx: 226, cy: 262, rx: 56, ry: 118, accent: TYPE_COLORS.rock },
]

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

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('nav.tinuturi')}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {t('map.intro')}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr]">
        <svg
          viewBox="0 0 440 512"
          className="w-full select-none"
          role="group"
          aria-label={t('nav.tinuturi')}
        >
          <defs>
            <filter id="regionShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="5"
                floodColor="#1a1a1a"
                floodOpacity="0.1"
              />
            </filter>
          </defs>

          {/* Apa din jur și conturul continentului. */}
          <rect x="0" y="0" width="440" height="512" rx="24" fill="#E9EFF1" />
          <ellipse
            cx="220"
            cy="262"
            rx="204"
            ry="224"
            fill="#F5F2E9"
            stroke="#E2DCCB"
            strokeWidth="3"
          />

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
                filter="url(#regionShadow)"
              >
                <ellipse
                  cx={r.cx}
                  cy={r.cy}
                  rx={r.rx}
                  ry={r.ry}
                  strokeWidth={active ? 3 : 2}
                  className={`transition-all duration-200 ${
                    active
                      ? 'fill-accent stroke-accent'
                      : 'fill-surface stroke-line hover:fill-[#EAF1EC]'
                  }`}
                />
                <circle
                  cx={r.cx}
                  cy={r.cy - 20}
                  r={5}
                  fill={active ? '#ffffff' : r.accent}
                />
                <text
                  x={r.cx}
                  y={r.cy + 6}
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
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
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
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {t('map.pokemonHere')} ·{' '}
                {formatPokemonCount(pokemonHere.length, lang)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
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
    </div>
  )
}
