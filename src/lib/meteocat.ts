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

export async function getUsingMockData() {
  return !hasApiKey();
}

export async function getEstacions(): Promise<Estacio[]> {
  if (!hasApiKey()) {
    return MOCK_ESTACIONS;
  }
  return meteocatFetch<Estacio[]>("/xema/v1/estacions/metadades", 60 * 60 * 6);
}

export async function getEstacio(codi: string): Promise<Estacio | undefined> {
  const estacions = await getEstacions();
  return estacions.find((e) => e.codi === codi);
}

type MesuradaResponse = {
  codi: string;
  variables: {
    codi: number;
    lectures: { data: string; valor: number }[];
  }[];
};

export async function getUltimesLectures(codi: string): Promise<Lectura[]> {
  if (!hasApiKey()) {
    return mockLectures(codi);
  }
  const now = new Date();
  const any = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  const data = await meteocatFetch<MesuradaResponse>(
    `/xema/v1/estacions/mesurades/${codi}/${any}/${mes}/${dia}`,
    60 * 10,
  );
  const lectures: Lectura[] = [];
  for (const variable of data.variables ?? []) {
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
  return lectures;
}
