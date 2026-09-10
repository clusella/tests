const CATALUNYA_BBOX = { lamin: 40.5, lomin: 0.15, lamax: 42.9, lomax: 3.4 };

export type Avio = {
  icao24: string;
  indicatiu: string;
  paisOrigen: string;
  latitud: number;
  longitud: number;
  altitud: number | null;
  velocitat: number | null;
  rumb: number | null;
};

export type AvionsResult = { avions: Avio[]; mock: boolean; error?: string };

const MOCK_AVIONS: Avio[] = [
  {
    icao24: "3c6444",
    indicatiu: "IBE1234",
    paisOrigen: "Spain",
    latitud: 41.3,
    longitud: 2.08,
    altitud: 10500,
    velocitat: 230,
    rumb: 45,
  },
  {
    icao24: "4ca7b1",
    indicatiu: "VLG5678",
    paisOrigen: "Spain",
    latitud: 41.9,
    longitud: 1.5,
    altitud: 8200,
    velocitat: 210,
    rumb: 190,
  },
];

// L'API pública d'OpenSky no requereix clau (amb límits de consultes anònims).
// https://openskynetwork.github.io/opensky-api/rest.html
type OpenSkyResponse = {
  states: (string | number | boolean | null)[][] | null;
};

export async function getAvionsSobreCatalunya(): Promise<AvionsResult> {
  try {
    const { lamin, lomin, lamax, lomax } = CATALUNYA_BBOX;
    const res = await fetch(
      `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      throw new Error(`Error ${res.status} consultant OpenSky`);
    }
    const data = (await res.json()) as OpenSkyResponse;
    const avions: Avio[] = (data.states ?? [])
      .filter((s) => s[5] != null && s[6] != null)
      .map((s) => ({
        icao24: String(s[0]),
        indicatiu: String(s[1] ?? "").trim() || "—",
        paisOrigen: String(s[2] ?? ""),
        longitud: Number(s[5]),
        latitud: Number(s[6]),
        altitud: s[7] != null ? Number(s[7]) : null,
        velocitat: s[9] != null ? Number(s[9]) : null,
        rumb: s[10] != null ? Number(s[10]) : null,
      }));
    return { avions, mock: false };
  } catch (err) {
    console.error("Error consultant OpenSky, es mostren dades d'exemple:", err);
    return {
      avions: MOCK_AVIONS,
      mock: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
