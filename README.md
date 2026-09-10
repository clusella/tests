# Temps a Catalunya

Portal web per seguir dades públiques meteorològiques de Catalunya (Meteocat) i, com a extra, satèl·lits visibles al cel (N2YO). Amb possibilitat d'ampliar a altres fonts (p. ex. AEMET) més endavant.

## Estat del projecte

- Meteo: llistat d'estacions de la XEMA agrupades per comarca i una pàgina de detall amb les últimes lectures de cada estació.
- Satèl·lits: llistat dels satèl·lits actualment visibles sobre Catalunya (N2YO).

Sense les API keys configurades, l'app mostra dades d'exemple perquè es pugui provar la interfície.

## Configuració

1. Instal·la les dependències:

   ```bash
   npm install
   ```

2. Aconsegueix les API keys gratuïtes:
   - Meteocat: https://apidocs.meteocat.gencat.cat/ (cal registrar-se).
   - N2YO: https://www.n2yo.com/api/ (cal registrar-se).

3. Copia `.env.example` a `.env.local` i afegeix les teves claus:

   ```bash
   cp .env.example .env.local
   ```

4. Arrenca el servidor de desenvolupament:

   ```bash
   npm run dev
   ```

   Obre http://localhost:3000

## Estructura

- `src/lib/meteocat.ts` — client de l'API de Meteocat (estacions i lectures), amb dades d'exemple com a fallback.
- `src/lib/n2yo.ts` — client de l'API de N2YO (satèl·lits visibles), amb dades d'exemple com a fallback.
- `src/app/page.tsx` — llistat d'estacions meteorològiques per comarca.
- `src/app/estacions/[codi]/page.tsx` — detall d'una estació amb les últimes lectures.
- `src/app/satelits/page.tsx` — llistat de satèl·lits actualment visibles sobre Catalunya.

## Properes passes possibles

- Gràfics d'evolució (temperatura, precipitació) amb dades històriques.
- Emmagatzematge de sèries temporals (p. ex. amb una base de dades) per no dependre només de l'última lectura.
- Cerca/filtre d'estacions al llistat.
- Alertes meteorològiques (avisos del SMC).
- Ampliar a dades d'AEMET per a la resta de l'Estat.
- Seguiment de satèl·lits concrets (p. ex. l'ISS) amb la seva posició i pròxims passos visibles.
