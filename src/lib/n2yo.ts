const API_BASE = "https://api.n2yo.com/rest/v1/satellite";

// Punt central de Catalunya, per defecte, per buscar quins satèl·lits hi ha
// visibles al cel en aquest moment.
const CATALUNYA = { lat: 41.82, lng: 1.86, alt: 0 };

export type Satelit = {
  id: number;
  nom: string;
  latitud: number;
  longitud: number;
  altitud: number;
};

function hasApiKey() {
  return Boolean(process.env.N2YO_API_KEY);
}

async function n2yoFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const apiKey = process.env.N2YO_API_KEY;
  if (!apiKey) {
    throw new Error("N2YO_API_KEY no configurada");
  }
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API_BASE}${path}${separator}apiKey=${apiKey}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} consultant ${path}`);
  }
  return res.json() as Promise<T>;
}

const MOCK_SATELITS: Satelit[] = [
  { id: 25544, nom: "ISS (ZARYA)", latitud: 41.9, longitud: 1.7, altitud: 420 },
  { id: 20580, nom: "HST (Hubble)", latitud: 42.3, longitud: 2.1, altitud: 540 },
  { id: 48274, nom: "STARLINK-2345", latitud: 41.5, longitud: 1.3, altitud: 550 },
];

type AboveResponse = {
  info: { satcount: number };
  above: {
    satid: number;
    satname: string;
    satlat: number;
    satlng: number;
    satalt: number;
  }[];
};

export type SatelitsResult = { satelits: Satelit[]; mock: boolean; error?: string };

// Radi de cerca en graus (0-90) des del punt d'observació; categoria 0 = totes.
export async function getSatelitsSobreCatalunya(
  radiGraus = 70,
  categoria = 0,
): Promise<SatelitsResult> {
  if (!hasApiKey()) {
    return { satelits: MOCK_SATELITS, mock: true };
  }
  try {
    const data = await n2yoFetch<AboveResponse>(
      `/above/${CATALUNYA.lat}/${CATALUNYA.lng}/${CATALUNYA.alt}/${radiGraus}/${categoria}`,
      60 * 5,
    );
    return {
      satelits: (data.above ?? []).map((s) => ({
        id: s.satid,
        nom: s.satname,
        latitud: s.satlat,
        longitud: s.satlng,
        altitud: s.satalt,
      })),
      mock: false,
    };
  } catch (err) {
    console.error("Error consultant l'API de N2YO, es mostren dades d'exemple:", err);
    return {
      satelits: MOCK_SATELITS,
      mock: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
