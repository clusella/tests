# Temps a Catalunya

Portal web per seguir dades públiques meteorològiques de Catalunya (Meteocat), amb possibilitat d'ampliar a altres fonts (p. ex. AEMET) més endavant.

## Estat del projecte

Punt de partida: llistat d'estacions de la XEMA agrupades per comarca i una pàgina de detall amb les últimes lectures de cada estació. Sense API key configurada, l'app mostra dades d'exemple perquè es pugui provar la interfície.

## Configuració

1. Instal·la les dependències:

   ```bash
   npm install
   ```

2. Aconsegueix una API key gratuïta de Meteocat a https://apidocs.meteocat.gencat.cat/ (cal registrar-se).

3. Copia `.env.example` a `.env.local` i afegeix la teva clau:

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
- `src/app/page.tsx` — llistat d'estacions per comarca.
- `src/app/estacions/[codi]/page.tsx` — detall d'una estació amb les últimes lectures.

## Properes passes possibles

- Gràfics d'evolució (temperatura, precipitació) amb dades històriques.
- Emmagatzematge de sèries temporals (p. ex. amb una base de dades) per no dependre només de l'última lectura.
- Cerca/filtre d'estacions al llistat.
- Alertes meteorològiques (avisos del SMC).
- Ampliar a dades d'AEMET per a la resta de l'Estat.
