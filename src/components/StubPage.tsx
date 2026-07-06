import { useLanguage } from '../lib/i18n'
import { usePageTitle } from '../lib/usePageTitle'

export interface StubItem {
  title: string
  description: string
}

export interface StubContent {
  title: string
  intro: string
  items: StubItem[]
}

interface Props {
  content: StubContent
}

/** Pagină-schelet pentru secțiunile pe care le completăm în sesiuni viitoare. */
export default function StubPage({ content }: Props) {
  const { t } = useLanguage()
  usePageTitle(`${content.title}${t('site.pageTitleSuffix')}`)

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">{content.title}</h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        {content.intro}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold">{item.title}</h2>
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                {t('stub.soon')}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
