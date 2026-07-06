import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AREA_NAMES, sortAreas } from '../data/areas'
import { DESCRIPTIONS } from '../data/descriptions'
import { LOCATIONS } from '../data/locations'
import { PLA_INFO } from '../data/pladata'
import SpriteImage from '../components/SpriteImage'
import StatBar from '../components/StatBar'
import TypeBadge from '../components/TypeBadge'
import {
  formatDexNumber,
  formatHeight,
  formatWeight,
  STAT_LABELS,
  STAT_ORDER,
} from '../lib/format'
import { useLanguage, type StringKey } from '../lib/i18n'
import { byName, pokedex } from '../lib/pokedex'
import { useShiny } from '../lib/shiny'
import { defensiveMatchups, formatMultiplier } from '../lib/typeChart'
import { usePageTitle } from '../lib/usePageTitle'

export default function PokemonDetail() {
  const { lang, t } = useLanguage()
  const navigate = useNavigate()
  const { shiny } = useShiny()
  const { name } = useParams<{ name: string }>()
  const pokemon = name ? byName.get(name) : undefined
  const [formIdx, setFormIdx] = useState(0)

  // Resetăm forma selectată la schimbarea Pokémonului CHIAR în timpul randării,
  // ca să nu apară un cadru cu forma greșită la navigarea prev/next.
  const [trackedName, setTrackedName] = useState(name)
  if (name !== trackedName) {
    setTrackedName(name)
    setFormIdx(0)
  }

  const index = pokemon ? pokemon.dexNumber - 1 : -1
  const prev = pokemon && index > 0 ? pokedex[index - 1] : undefined
  const next =
    pokemon && index < pokedex.length - 1 ? pokedex[index + 1] : undefined

  usePageTitle(
    pokemon
      ? t('detail.pageTitle', { name: pokemon.displayName })
      : t('detail.notFoundPageTitle'),
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [name])

  // Navigare cu săgețile ← / → între Pokémoni.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return
      if (e.key === 'ArrowLeft' && prev) navigate(`/pokedex/${prev.name}`)
      else if (e.key === 'ArrowRight' && next) navigate(`/pokedex/${next.name}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, navigate])

  if (!pokemon) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">{t('detail.notFoundTitle')}</h1>
        <p className="mt-2 text-sm text-muted">
          {t('detail.notFoundBody', { name: name ?? '' })}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          {t('detail.back')}
        </Link>
      </div>
    )
  }

  const forms = pokemon.forms
  const activeForm =
    forms && forms.length > 0 ? forms[Math.min(formIdx, forms.length - 1)] : undefined
  const display = activeForm ?? pokemon

  const src = shiny ? display.sprites.artworkShiny : display.sprites.artwork
  const alt = `${pokemon.displayName}${
    activeForm ? ` (${activeForm.label[lang]})` : ''
  }${shiny ? t('common.shinyAlt') : ''}`
  const statTotal = STAT_ORDER.reduce((sum, k) => sum + display.stats[k], 0)
  const matchups = defensiveMatchups(display.types)

  const description = DESCRIPTIONS[pokemon.name]?.[lang]
  const info = PLA_INFO[pokemon.name]
  const evolvesFromEntry = info?.evolvesFrom ? byName.get(info.evolvesFrom) : undefined
  const locationEntry = LOCATIONS[pokemon.name]
  const areas = locationEntry ? sortAreas(locationEntry) : []

  const matchupRow = (
    labelKey: StringKey,
    items: { type: (typeof matchups.weak)[number]['type']; multiplier: number }[],
    showMultiplier: boolean,
  ) =>
    items.length > 0 && (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="w-24 shrink-0 text-xs text-muted">{t(labelKey)}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {items.map((m) => (
            <span key={m.type} className="inline-flex items-center gap-1">
              <TypeBadge type={m.type} />
              {showMultiplier && (
                <span className="text-[11px] font-medium tabular-nums text-muted">
                  {formatMultiplier(m.multiplier)}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    )

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="text-sm font-medium text-accent hover:underline">
          {t('detail.back')}
        </Link>
        <div className="flex gap-4 text-sm tabular-nums">
          {prev && (
            <Link
              to={`/pokedex/${prev.name}`}
              className="text-muted transition-colors hover:text-accent"
              aria-label={t('detail.prevAria', { name: prev.displayName })}
            >
              ← {formatDexNumber(prev.dexNumber)}
            </Link>
          )}
          {next && (
            <Link
              to={`/pokedex/${next.name}`}
              className="text-muted transition-colors hover:text-accent"
              aria-label={t('detail.nextAria', { name: next.displayName })}
            >
              {formatDexNumber(next.dexNumber)} →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <SpriteImage
              key={`${display.id}-${shiny}`}
              src={src}
              alt={alt}
              className="aspect-square w-full [&_img]:animate-fade-in"
              loading="eager"
            />
          </div>
          {forms && forms.length > 1 && (
            <div className="mt-3 flex justify-center">
              <div
                role="group"
                aria-label={t('form.label')}
                className="inline-flex flex-wrap items-center justify-center rounded-full border border-line bg-surface p-0.5"
              >
                {forms.map((f, i) => {
                  const active = i === Math.min(formIdx, forms.length - 1)
                  return (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFormIdx(i)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
                        active
                          ? 'bg-accent text-white'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {f.label[lang]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm tabular-nums text-muted">
            {formatDexNumber(pokemon.dexNumber)} {t('detail.hisuiNo')} ·{' '}
            {formatDexNumber(pokemon.nationalDex)} {t('detail.nationalNo')}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {pokemon.displayName}
            </h1>
            {activeForm && (
              <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-medium text-accent">
                {activeForm.label[lang]}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {display.types.map((type) => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>

          {description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}

          {(info?.behavior || info?.distortionOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {info?.behavior && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs">
                  {t(`behavior.${info.behavior}` as StringKey)}
                </span>
              )}
              {info?.distortionOnly && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  ✦ {t('distortion.only')}
                </span>
              )}
            </div>
          )}

          <dl className="mt-6 flex gap-8 text-sm">
            <div>
              <dt className="text-muted">{t('detail.height')}</dt>
              <dd className="mt-0.5 font-medium">
                {formatHeight(display.height, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t('detail.weight')}</dt>
              <dd className="mt-0.5 font-medium">
                {formatWeight(display.weight, lang)}
              </dd>
            </div>
          </dl>

          {info?.evolveMethod && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t('evolution.title')}
              </h2>
              <p className="mt-2 text-sm">
                {evolvesFromEntry ? (
                  <>
                    <Link
                      to={`/pokedex/${evolvesFromEntry.name}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {evolvesFromEntry.displayName}
                    </Link>{' '}
                    → <span className="text-muted">{info.evolveMethod[lang]}</span>
                  </>
                ) : (
                  <span className="text-muted">{info.evolveMethod[lang]}</span>
                )}
              </p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t('detail.stats')}
            </h2>
            <div className="mt-3 max-w-lg space-y-2.5">
              {STAT_ORDER.map((key) => (
                <StatBar
                  key={key}
                  label={STAT_LABELS[lang][key]}
                  value={display.stats[key]}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">
              {t('detail.total')}{' '}
              <span className="font-medium tabular-nums text-ink">
                {statTotal}
              </span>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t('matchup.title')}
            </h2>
            <div className="mt-3 space-y-3">
              {matchupRow('matchup.weak', matchups.weak, true)}
              {matchupRow('matchup.resist', matchups.resist, true)}
              {matchupRow('matchup.immune', matchups.immune, false)}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t('detail.locations')}
            </h2>
            {areas.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {areas.map((id) => (
                  <li key={id}>
                    <Link
                      to={`/tinuturi?zona=${id}`}
                      className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                    >
                      {AREA_NAMES[lang][id]}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {locationEntry
                  ? t('detail.locationsSpecial')
                  : t('detail.locationsSoon')}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
