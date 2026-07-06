import StubPage, { type StubContent } from '../components/StubPage'
import { useLanguage, type Lang } from '../lib/i18n'

const CONTENT: Record<Lang, StubContent> = {
  ro: {
    title: 'Ținuturile Hisui',
    intro:
      'Regiunea Hisui — vechiul Sinnoh — e împărțită în cinci zone deschise, fiecare cu propriul climat și proprii Pokémoni. Ghidurile detaliate pentru fiecare ținut sunt în lucru.',
    items: [
      {
        title: 'Câmpiile de Obsidian',
        description:
          'Obsidian Fieldlands — pajiști, păduri și râuri; prima zonă pe care o explorezi și locul ideal pentru primele capturi.',
      },
      {
        title: 'Mlaștinile Purpurii',
        description:
          'Crimson Mirelands — mlaștini cețoase și terenuri noroioase, casa multor Pokémoni de tip Pământ și Otravă.',
      },
      {
        title: 'Coasta de Cobalt',
        description:
          'Cobalt Coastlands — plaje, faleze și ape adânci, cu Pokémoni de tip Apă și Zbor.',
      },
      {
        title: 'Podișul Coronet',
        description:
          'Coronet Highlands — drumul stâncos spre vârful muntelui Coronet, cu peșteri și Pokémoni de tip Rocă și Dragon.',
      },
      {
        title: 'Ținuturile de Gheață Alabastru',
        description:
          'Alabaster Icelands — tundra înghețată din nordul regiunii, cu viscol, gheață și Pokémoni rari.',
      },
    ],
  },
  en: {
    title: 'Hisui Areas',
    intro:
      'The Hisui region — ancient Sinnoh — is divided into five open areas, each with its own climate and its own Pokémon. Detailed guides for each area are in the works.',
    items: [
      {
        title: 'Obsidian Fieldlands',
        description:
          'Meadows, forests and rivers; the first area you explore and the ideal place for your first catches.',
      },
      {
        title: 'Crimson Mirelands',
        description:
          'Misty bogs and muddy terrain, home to many Ground- and Poison-type Pokémon.',
      },
      {
        title: 'Cobalt Coastlands',
        description:
          'Beaches, cliffs and deep waters, with Water- and Flying-type Pokémon.',
      },
      {
        title: 'Coronet Highlands',
        description:
          'The rocky climb to the peak of Mount Coronet, with caves and Rock- and Dragon-type Pokémon.',
      },
      {
        title: 'Alabaster Icelands',
        description:
          'The frozen tundra in the north of the region, with blizzards, ice and rare Pokémon.',
      },
    ],
  },
}

export default function Tinuturi() {
  const { lang } = useLanguage()
  return <StubPage content={CONTENT[lang]} />
}
