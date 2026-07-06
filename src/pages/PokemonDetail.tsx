import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AREA_NAMES, sortAreas } from '../data/areas'
import { DESCRIPTIONS } from '../data/descriptions'
import { LOCATIONS } from '../data/locations'
import ShinyToggle from '../components/ShinyToggle'
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
import { usePageTitle } from '../lib/usePageTitle'

export default function PokemonDetail() {
  const { lang, t } = useLanguage()
  const { name } = useParams<{ name: string }>()
  const pokemon = name ? byName.get(name) : undefined
  const [shiny, setShiny] = useState(false)
  const [formIdx, setFormIdx] = useState(0)

  // Resetăm forma selectată la schimbarea Pokémonului CHIAR în timpul randării
  // (nu într-un efect post-paint), ca să nu apară un cadru cu forma greșită
  // când navighezi între doi Pokémoni care ambii au forme.
  const [trackedName, setTrackedName] = useState(name)
  if (name !== trackedName) {
    setTrackedName(name)
    setFormIdx(0)
  }

  usePageTitle(
    pokemon
      ? t('detail.pageTitle', { name: pokemon.displayName })
      : t('detail.notFoundPageTitle'),
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [name])

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

  // dexNumber e continuu (1–242), deci vecinii se pot lua direct prin index.
  const index = pokemon.dexNumber - 1
  const prev = index > 0 ? pokedex[index - 1] : undefined
  const next = index < pokedex.length - 1 ? pokedex[index + 1] : undefined

  const forms = pokemon.forms
  const activeForm =
    forms && forms.length > 0 ? forms[Math.min(formIdx, forms.length - 1)] : undefined
  // Forma afișată — atât intrarea, cât și PokemonForm au tipuri/stat/sprite-uri.
  const display = activeForm ?? pokemon

  const src = shiny ? display.sprites.artworkShiny : display.sprites.artwork
  const alt = `${pokemon.displayName}${
    activeForm ? ` (${t(activeForm.labelKey as StringKey)})` : ''
  }${shiny ? t('common.shinyAlt') : ''}`
  const statTotal = STAT_ORDER.reduce((sum, k) => sum + display.stats[k], 0)

  const description = DESCRIPTIONS[pokemon.name]?.[lang]
  const locationEntry = LOCATIONS[pokemon.name]
  const areas = locationEntry ? sortAreas(locationEntry) : []

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
          <div className="rounded-2xl border border-line bg-surface p-6">
            <SpriteImage
              src={src}
              alt={alt}
              className="aspect-square w-full"
              loading="eager"
            />
          </div>
          <div className="mt-3 flex flex-col items-center gap-3">
            {forms && forms.length > 1 && (
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
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-accent text-white'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {t(f.labelKey as StringKey)}
                    </button>
                  )
                })}
              </div>
            )}
            <ShinyToggle checked={shiny} onChange={setShiny} />
          </div>
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
                {t(activeForm.labelKey as StringKey)}
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
              {t('detail.locations')}
            </h2>
            {areas.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {areas.map((id) => (
                  <li
                    key={id}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs"
                  >
                    {AREA_NAMES[lang][id]}
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
