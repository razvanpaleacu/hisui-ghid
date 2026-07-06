# Hisui — Ghid Legends: Arceus

Ghid neoficial, în limba română, pentru **Pokémon Legends: Arceus** (Nintendo Switch).
Site static: React + Vite + TypeScript + Tailwind CSS, cu rutare pe hash (`HashRouter`) —
fără backend, ușor de găzduit gratuit.

În versiunea curentă:

- **Pokédex Hisui complet** — toate cele 242 de intrări, cu căutare după nume/număr,
  filtrare după tip, **sortare** (număr, nume, statistici, înălțime/greutate),
  comutator normal/shiny (inclusiv un buton plutitor mereu vizibil) și pagină de detaliu
  pentru fiecare Pokémon (tipuri, statistici, înălțime/greutate, **descriere originală**,
  locații).
- **Sistem de forme** complet în detaliu: forme regionale (Alola, Galar, Paldea, Hisui),
  formele legendarilor (Origin/Altered/Sky/Land/Therian), Rotom, Wormadam, Basculin,
  Cherrim (Înnorat/Însorit) și mascul/femelă acolo unde diferă vizibil. Fiecare formă are
  propriile tipuri, statistici, sprite-uri și matchup-uri.
- **Slăbiciuni/rezistențe/imunități** de tip, **metodă de evoluție** (specifică PLA),
  **comportament în teren** și marcarea celor exclusiv din **distorsiuni spațio-temporale**.
- Navigare cu **săgețile ←/→** între Pokémoni.
- **Locațiile** fiecărui Pokémon (cele cinci ținuturi), plus o **hartă interactivă** a
  regiunii care înlocuiește tab-ul Ținuturi: alegi o zonă și vezi Pokémonii care apar acolo.
- Formele regionale Hisui sunt rezolvate corect, cu sprite-urile, tipurile și statisticile
  formei din Hisui, nu ale celei originale.
- Tab-uri stub pentru **Mecanici** și **Ghid & Sfaturi** — se completează ulterior.
- **Selector de limbă RO/EN** în antet — toată interfața e disponibilă în română
  și engleză; alegerea se reține în `localStorage` (implicit engleză la prima vizită).

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

```bash
npm run deploy   # build + publicare pe branch-ul gh-pages
```

Site-ul apare la `https://<utilizator>.github.io/<nume-repo>/`.
(La prima publicare, sursa Pages trebuie setată pe branch-ul `gh-pages` —
Settings → Pages, sau `gh api -X POST repos/<utilizator>/<repo>/pages -f "source[branch]=gh-pages"`.)

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
