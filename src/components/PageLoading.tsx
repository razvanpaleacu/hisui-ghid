import { useLanguage } from '../lib/i18n'

export default function PageLoading() {
  const { t } = useLanguage()
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-line bg-surface p-4"
          >
            <div className="aspect-square rounded-lg bg-line/60" />
            <div className="mt-3 h-3 w-1/3 rounded bg-line/60" />
            <div className="mt-2 h-4 w-2/3 rounded bg-line/60" />
          </div>
        ))}
      </div>
    </div>
  )
}
