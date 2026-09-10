const API_BASE = "https://api.meteo.cat";

export type Estacio = {
  codi: string;
  nom: string;
  tipus: string;
  comarca: string;
  municipi: string;
  altitud: number;
  coordenades: { latitud: number; longitud: number };
};

// Forma real de la resposta de /xema/v1/estacions/metadades: comarca i
// municipi són objectes { codi, nom }, no cadenes de text.
type EstacioApi = {
  codi: string;
  nom: string;
  tipus: string;
  altitud: number;
  coordenades: { latitud: number; longitud: number };
  municipi?: { codi: string; nom: string };
  comarca?: { codi: string; nom: string };
};

export type Lectura = {
  variableCodi: number;
  nomVariable: string;
  unitat: string;
  valor: number;
  dataLectura: string;
};

// Codis de variables meteorològiques més habituals de la XEMA.
export const VARIABLES: Record<number, { nom: string; unitat: string }> = {
  32: { nom: "Temperatura", unitat: "°C" },
  33: { nom: "Humitat relativa", unitat: "%" },
  35: { nom: "Precipitació", unitat: "mm" },
  30: { nom: "Velocitat del vent (10 m)", unitat: "m/s" },
  31: { nom: "Direcció del vent (10 m)", unitat: "°" },
  34: { nom: "Pressió atmosfèrica", unitat: "hPa" },
  36: { nom: "Radiació solar global", unitat: "W/m²" },
};

function hasApiKey() {
  return Boolean(process.env.METEOCAT_API_KEY);
}

async function meteocatFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const apiKey = process.env.METEOCAT_API_KEY;
  if (!apiKey) {
    throw new Error("METEOCAT_API_KEY no configurada");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} consultant ${path}`);
  }
  return res.json() as Promise<T>;
}

const MOCK_ESTACIONS: Estacio[] = [
  {
    codi: "D5",
    nom: "Barcelona - el Raval",
    tipus: "A",
    comarca: "Barcelonès",
    municipi: "Barcelona",
    altitud: 43,
    coordenades: { latitud: 41.383, longitud: 2.167 },
  },
  {
    codi: "X4",
    nom: "Girona",
    tipus: "A",
    comarca: "Gironès",
    municipi: "Girona",
    altitud: 76,
    coordenades: { latitud: 41.987, longitud: 2.826 },
  },
  {
    codi: "C6",
    nom: "Lleida - la Femosa",
    tipus: "A",
    comarca: "Segrià",
    municipi: "Lleida",
    altitud: 155,
    coordenades: { latitud: 41.63, longitud: 0.6 },
  },
  {
    codi: "V3",
    nom: "Tarragona",
    tipus: "A",
    comarca: "Tarragonès",
    municipi: "Tarragona",
    altitud: 15,
    coordenades: { latitud: 41.12, longitud: 1.245 },
  },
];

function mockLectures(codi: string): Lectura[] {
  // Valors de mostra deterministes (basats en el codi) perquè es vegi la UI
  // sense necessitat de API key configurada.
  const seed = codi.charCodeAt(0) + codi.charCodeAt(1);
  const now = new Date().toISOString();
  return [
    { variableCodi: 32, nomVariable: "Temperatura", unitat: "°C", valor: 15 + (seed % 15), dataLectura: now },
    { variableCodi: 33, nomVariable: "Humitat relativa", unitat: "%", valor: 40 + (seed % 40), dataLectura: now },
    { variableCodi: 30, nomVariable: "Velocitat del vent (10 m)", unitat: "m/s", valor: (seed % 8), dataLectura: now },
    { variableCodi: 34, nomVariable: "Pressió atmosfèrica", unitat: "hPa", valor: 1000 + (seed % 25), dataLectura: now },
  ];
}

export type EstacionsResult = { estacions: Estacio[]; mock: boolean; error?: string };

export async function getEstacions(): Promise<EstacionsResult> {
  if (!hasApiKey()) {
    return { estacions: MOCK_ESTACIONS, mock: true };
  }
  try {
    const estacions = await meteocatFetch<EstacioApi[]>("/xema/v1/estacions/metadades", 60 * 60 * 6);
    return {
      estacions: estacions.map((e) => ({
        codi: e.codi,
        nom: e.nom,
        tipus: e.tipus,
        altitud: e.altitud,
        coordenades: e.coordenades,
        comarca: e.comarca?.nom ?? "Sense comarca",
        municipi: e.municipi?.nom ?? "Sense municipi",
      })),
      mock: false,
    };
  } catch (err) {
    console.error("Error consultant l'API de Meteocat, es mostren dades d'exemple:", err);
    return {
      estacions: MOCK_ESTACIONS,
      mock: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getEstacio(codi: string): Promise<Estacio | undefined> {
  const { estacions } = await getEstacions();
  return estacions.find((e) => e.codi === codi);
}

type VariableMesurada = {
  codi: number;
  lectures: { data: string; valor: number }[];
};

// L'endpoint pot retornar directament un array de variables, o un objecte
// { codi, variables: [...] }; acceptem totes dues formes.
type MesuradaResponse = VariableMesurada[] | { codi: string; variables: VariableMesurada[] };

export type LecturesResult = { lectures: Lectura[]; mock: boolean; error?: string };

export async function getUltimesLectures(codi: string): Promise<LecturesResult> {
  if (!hasApiKey()) {
    return { lectures: mockLectures(codi), mock: true };
  }
  try {
    const now = new Date();
    const any = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    const data = await meteocatFetch<MesuradaResponse>(
      `/xema/v1/estacions/mesurades/${codi}/${any}/${mes}/${dia}`,
      60 * 10,
    );
    const variables = Array.isArray(data) ? data : (data.variables ?? []);
    const lectures: Lectura[] = [];
    for (const variable of variables) {
      const info = VARIABLES[variable.codi];
      const ultima = variable.lectures?.at(-1);
      if (info && ultima) {
        lectures.push({
          variableCodi: variable.codi,
          nomVariable: info.nom,
          unitat: info.unitat,
          valor: ultima.valor,
          dataLectura: ultima.data,
        });
      }
    }
    return { lectures, mock: false };
  } catch (err) {
    console.error("Error consultant lectures de Meteocat, es mostren dades d'exemple:", err);
    return {
      lectures: mockLectures(codi),
      mock: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export type Avis = {
  comarca: string;
  perill: string;
  nivell: number;
};

export type AvisosResult = { avisos: Avis[]; mock: boolean; error?: string };

const MOCK_AVISOS: Avis[] = [
  { comarca: "Pallars Sobirà", perill: "Nevades", nivell: 1 },
  { comarca: "Val d'Aran", perill: "Vent", nivell: 2 },
];

type AvisApi = Record<string, unknown>;

// L'esquema exacte de /avisos/v1/vigents no s'ha pogut verificar directament
// (documentació no accessible en desenvolupament), així que llegim els noms
// de camp més probables i, si l'endpoint no respon com esperem, la funció
// cau igualment a dades d'exemple sense trencar res.
function textCamp(obj: AvisApi, claus: string[]): string | undefined {
  for (const clau of claus) {
    const valor = obj[clau];
    if (typeof valor === "string") return valor;
    if (valor && typeof valor === "object" && "nom" in valor) {
      const nom = (valor as { nom?: unknown }).nom;
      if (typeof nom === "string") return nom;
    }
  }
  return undefined;
}

function numCamp(obj: AvisApi, claus: string[]): number | undefined {
  for (const clau of claus) {
    const valor = obj[clau];
    if (typeof valor === "number") return valor;
  }
  return undefined;
}

export async function getAvisosVigents(): Promise<AvisosResult> {
  if (!hasApiKey()) {
    return { avisos: MOCK_AVISOS, mock: true };
  }
  try {
    const data = await meteocatFetch<AvisApi[]>("/avisos/v1/vigents", 60 * 15);
    const avisos: Avis[] = data.map((item) => ({
      comarca: textCamp(item, ["comarca", "nomComarca", "zona"]) ?? "Comarca desconeguda",
      perill: textCamp(item, ["perill", "tipus", "fenomen"]) ?? "Avís",
      nivell: numCamp(item, ["nivell", "grau", "nivellPerill"]) ?? 1,
    }));
    return { avisos, mock: false };
  } catch (err) {
    console.error("Error consultant avisos de Meteocat, es mostren dades d'exemple:", err);
    return {
      avisos: MOCK_AVISOS,
      mock: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
