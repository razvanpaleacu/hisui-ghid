# Hisui — Ghid Legends: Arceus

Ghid neoficial, în limba română, pentru **Pokémon Legends: Arceus** (Nintendo Switch).
Site static: React + Vite + TypeScript + Tailwind CSS, cu rutare pe hash (`HashRouter`) —
fără backend, ușor de găzduit gratuit.

În versiunea curentă:

- **Pokédex Hisui complet** — toate cele 242 de intrări, cu căutare după nume/număr,
  filtrare după tip, comutator normal/shiny și pagină de detaliu pentru fiecare Pokémon
  (tipuri, statistici de bază, înălțime/greutate, locații — în curând).
- Formele regionale Hisui (Growlithe, Zorua, Braviary etc.) sunt rezolvate corect,
  cu sprite-urile, tipurile și statisticile formei din Hisui, nu ale celei originale.
- Tab-uri stub pentru **Ținuturile Hisui**, **Mecanici** și **Ghid & Sfaturi** —
  se completează în sesiuni viitoare.
- **Selector de limbă RO/EN** în antet — toată interfața e disponibilă în română
  și engleză; alegerea se reține în `localStorage`.

## Rulare locală

Ai nevoie de **Node 18+**.

```bash
npm install
npm run dev        # server local de dezvoltare
```

## Regenerarea datelor

Datele Pokédexului se generează **o singură dată, la build**, din [PokéAPI](https://pokeapi.co),
în `src/data/pokedex-hisui.json` (fișierul generat se comite în repo — aplicația nu face
request-uri către PokéAPI la runtime, doar imaginile se încarcă din CDN-ul de sprite-uri).

```bash
npm run data
```

Scriptul (`scripts/build-pokedex.mjs`):

- ia lista Pokédexului Hisui (`/api/v2/pokedex/hisui`);
- pentru fiecare specie alege varietatea corectă — formele `-hisui` acolo unde există,
  plus excepția `basculin` → `basculin-white-striped` (forma din Hisui);
- limitează concurența la 8 request-uri simultane și reîncearcă la erori `429`/`5xx`/rețea.

## Build & verificare

```bash
npm run build      # typecheck + build de producție în dist/
npm run preview    # servește build-ul local
```

## Deploy

### GitHub Pages

`vite.config.ts` folosește `base: './'` (căi relative), iar rutarea e pe hash,
deci build-ul funcționează din orice subdirector, fără altă configurare:

1. `npm run build`
2. Publică directorul `dist/` pe branch-ul `gh-pages` (de ex. cu `npx gh-pages -d dist`)
   sau printr-un workflow GitHub Actions care face upload la `dist/`.
3. În Settings → Pages alege sursa corespunzătoare.

Dacă preferi `base` explicit, setează în `vite.config.ts` `base: '/nume-repo/'`.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

Nu e nevoie de reguli de redirect: `HashRouter` ține toată rutarea în fragmentul
de hash, deci refresh-ul nu produce 404.

## Drepturi

Proiect personal de fan, **neoficial** — neafiliat cu Nintendo, Game Freak sau
The Pokémon Company; Pokémon și Pokémon Legends: Arceus sunt mărci ale deținătorilor lor.

- Repo-ul **nu conține** imagini oficiale; imaginile sunt referențiate la runtime, prin URL,
  din [repository-ul public de sprite-uri PokéAPI](https://github.com/PokeAPI/sprites).
- Site-ul **nu afișează** texte oficiale de Pokédex (flavor text); eventualele descrieri
  sunt formulări originale.
- Date furnizate de [PokéAPI](https://pokeapi.co).
