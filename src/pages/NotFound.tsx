import { Link } from 'react-router-dom'
import { useLanguage } from '../lib/i18n'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFound() {
  const { t } = useLanguage()
  usePageTitle(t('notfound.pageTitle'))

  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">{t('notfound.title')}</h1>
      <p className="mt-2 text-sm text-muted">{t('notfound.body')}</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
      >
        {t('detail.back')}
      </Link>
    </div>
  )
}
