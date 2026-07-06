import { useLanguage } from '../lib/i18n'
import { TYPE_COLORS, TYPE_LABELS, typeTextColor } from '../lib/typeInfo'
import type { TypeName } from '../lib/types'

interface Props {
  type: TypeName
  size?: 'sm' | 'md'
}

export default function TypeBadge({ type, size = 'sm' }: Props) {
  const { lang } = useLanguage()
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium leading-tight ${sizeClasses}`}
      style={{ backgroundColor: TYPE_COLORS[type], color: typeTextColor(type) }}
    >
      {TYPE_LABELS[lang][type]}
    </span>
  )
}
