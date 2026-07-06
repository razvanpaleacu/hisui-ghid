import StubPage, { type StubContent } from '../components/StubPage'
import { useLanguage, type Lang } from '../lib/i18n'

const CONTENT: Record<Lang, StubContent> = {
  ro: {
    title: 'Mecanici',
    intro:
      'Pokémon Legends: Arceus schimbă multe dintre regulile clasice ale seriei. Aici vom explica pe larg fiecare mecanică nouă.',
    items: [
      {
        title: 'Stiluri Agil & Puternic',
        description:
          'Aceeași mișcare poate fi folosită rapid (Agile Style) sau cu putere sporită (Strong Style), schimbând ordinea de acțiune în luptă.',
      },
      {
        title: 'Pokémon Alpha',
        description:
          'Exemplare supradimensionate, cu ochi roșii și statistici crescute — agresive, dar merită prinse.',
      },
      {
        title: 'Pokémon Nobili',
        description:
          'Pokémoni venerați de oamenii din Hisui, înnebuniți de o furtună misterioasă; lupte-cheie ale poveștii.',
      },
      {
        title: 'Meșteșug (crafting)',
        description:
          'Poké Ball-uri, momeli și leacuri se fabrică din resurse adunate de pe teren, la masa de lucru sau din mers.',
      },
      {
        title: 'Prinderea Pokémonilor',
        description:
          'Arunci Poké Ball-uri direct în lumea deschisă, pe furiș sau după ce amețești ținta — fără a intra mereu în luptă.',
      },
    ],
  },
  en: {
    title: 'Mechanics',
    intro:
      'Pokémon Legends: Arceus changes many of the series’ classic rules. Here we will explain each new mechanic in depth.',
    items: [
      {
        title: 'Agile & Strong Styles',
        description:
          'The same move can be used quickly (Agile Style) or with extra power (Strong Style), changing the turn order in battle.',
      },
      {
        title: 'Alpha Pokémon',
        description:
          'Oversized specimens with red eyes and boosted stats — aggressive, but well worth catching.',
      },
      {
        title: 'Noble Pokémon',
        description:
          'Pokémon revered by the people of Hisui, driven into a frenzy by a mysterious storm; key story battles.',
      },
      {
        title: 'Crafting',
        description:
          'Poké Balls, lures and remedies are made from resources gathered in the field, at a workbench or on the go.',
      },
      {
        title: 'Catching Pokémon',
        description:
          'Throw Poké Balls directly in the open world — sneak up or stun your target first — without always entering battle.',
      },
    ],
  },
}

export default function Mecanici() {
  const { lang } = useLanguage()
  return <StubPage content={CONTENT[lang]} />
}
