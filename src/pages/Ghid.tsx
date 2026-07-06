import StubPage, { type StubContent } from '../components/StubPage'
import { useLanguage, type Lang } from '../lib/i18n'

const CONTENT: Record<Lang, StubContent> = {
  ro: {
    title: 'Ghid & Sfaturi',
    intro:
      'Sfaturi practice pentru explorarea regiunii Hisui, de la primele ore de joc până la completarea Pokédexului.',
    items: [
      {
        title: 'Primii pași în Hisui',
        description:
          'Ce să faci în primele ore: misiunile echipei Galaxy, primele capturi și cum îți organizezi echipa.',
      },
      {
        title: 'Cum urci în rangul Galaxy',
        description:
          'Punctele de cercetare, nivelurile de studiu ale fiecărei specii și cele mai eficiente moduri de a avansa.',
      },
      {
        title: 'Trucuri de prindere',
        description:
          'Furișare prin iarbă, momeli, Poké Ball-uri potrivite pentru fiecare situație și cum abordezi Pokémonii agresivi.',
      },
    ],
  },
  en: {
    title: 'Guide & Tips',
    intro:
      'Practical tips for exploring the Hisui region, from your first hours of play to completing the Pokédex.',
    items: [
      {
        title: 'First steps in Hisui',
        description:
          'What to do in your first hours: Galaxy Team missions, your first catches and how to organise your team.',
      },
      {
        title: 'Raising your Galaxy rank',
        description:
          'Research points, study levels for each species and the most efficient ways to advance.',
      },
      {
        title: 'Catching tricks',
        description:
          'Sneaking through grass, lures, the right Poké Ball for each situation and how to approach aggressive Pokémon.',
      },
    ],
  },
}

export default function Ghid() {
  const { lang } = useLanguage()
  return <StubPage content={CONTENT[lang]} />
}
