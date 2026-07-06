import { Link } from 'react-router-dom'
import { formatDexNumber } from '../lib/format'
import { useLanguage } from '../lib/i18n'
import type { PokedexEntry } from '../lib/types'
import SpriteImage from './SpriteImage'
import TypeBadge from './TypeBadge'

interface Props {
  pokemon: PokedexEntry
  shiny: boolean
}

export default function PokemonCard({ pokemon, shiny }: Props) {
  const { t } = useLanguage()
  const src = shiny ? pokemon.sprites.artworkShiny : pokemon.sprites.artwork
  const alt = `${pokemon.displayName}${
    pokemon.isHisuianForm ? ` (${t('common.hisuiForm')})` : ''
  }${shiny ? t('common.shinyAlt') : ''}`

  return (
    <Link
      to={`/pokedex/${pokemon.name}`}
      className="group animate-fade-in rounded-xl border border-line bg-surface p-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-sm"
    >
      <SpriteImage src={src} alt={alt} className="aspect-square w-full" />
      <p className="mt-3 text-[11px] tabular-nums text-muted">
        {formatDexNumber(pokemon.dexNumber)}
      </p>
      <h3 className="mt-0.5 text-sm font-semibold transition-colors group-hover:text-accent">
        {pokemon.displayName}
      </h3>
      {pokemon.isHisuianForm && (
        <p className="text-[11px] text-muted">{t('common.hisuiForm')}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </Link>
  )
}
