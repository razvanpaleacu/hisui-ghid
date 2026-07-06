import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import { useLanguage } from '../lib/i18n'
import { byName, pokedex } from '../lib/pokedex'
import { usePageTitle } from '../lib/usePageTitle'

export default function PokemonDetail() {
  const { lang, t } = useLanguage()
  const { name } = useParams<{ name: string }>()
  const pokemon = name ? byName.get(name) : undefined
  const [shiny, setShiny] = useState(false)

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

  const src = shiny ? pokemon.sprites.artworkShiny : pokemon.sprites.artwork
  const alt = `${pokemon.displayName}${
    pokemon.isHisuianForm ? ` (${t('common.hisuiForm')})` : ''
  }${shiny ? t('common.shinyAlt') : ''}`
  const statTotal = STAT_ORDER.reduce((sum, k) => sum + pokemon.stats[k], 0)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-sm font-medium text-accent hover:underline"
        >
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
          <div className="mt-3 flex justify-center">
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
            {pokemon.isHisuianForm && (
              <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-medium text-accent">
                {t('common.hisuiFormBadge')}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>

          {pokemon.description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
              {pokemon.description}
            </p>
          )}

          <dl className="mt-6 flex gap-8 text-sm">
            <div>
              <dt className="text-muted">{t('detail.height')}</dt>
              <dd className="mt-0.5 font-medium">
                {formatHeight(pokemon.height, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t('detail.weight')}</dt>
              <dd className="mt-0.5 font-medium">
                {formatWeight(pokemon.weight, lang)}
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
                  value={pokemon.stats[key]}
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
            {pokemon.locations.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                {t('detail.locationsSoon')}
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {pokemon.locations.map((loc) => (
                  <li
                    key={loc}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
