"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Estacio, Avis } from "@/lib/meteocat";
import type { Satelit } from "@/lib/n2yo";
import type { Avio } from "@/lib/opensky";

const CENTRE_CATALUNYA: [number, number] = [41.82, 1.86];

function icona(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

const ICONA_ESTACIO = icona("#2563eb");
const ICONA_SATELIT = icona("#9333ea");
const ICONA_AVIO = icona("#ea580c");

const COLOR_NIVELL: Record<number, string> = {
  1: "bg-yellow-400",
  2: "bg-orange-500",
  3: "bg-red-600",
};

type Props = {
  estacions: Estacio[];
  satelits: Satelit[];
  avions: Avio[];
  avisos: Avis[];
};

export default function Mapa({ estacions, satelits, avions, avisos }: Props) {
  const [mostrarEstacions, setMostrarEstacions] = useState(true);
  const [mostrarSatelits, setMostrarSatelits] = useState(true);
  const [mostrarAvions, setMostrarAvions] = useState(true);
  const [mostrarAvisos, setMostrarAvisos] = useState(true);
  const [comarca, setComarca] = useState("Totes");

  const comarques = useMemo(
    () => ["Totes", ...Array.from(new Set(estacions.map((e) => e.comarca))).sort()],
    [estacions],
  );

  const estacionsFiltrades = useMemo(
    () => estacions.filter((e) => comarca === "Totes" || e.comarca === comarca),
    [estacions, comarca],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarEstacions}
            onChange={(e) => setMostrarEstacions(e.target.checked)}
          />
          <span className="inline-block h-3 w-3 rounded-full bg-[#2563eb]" />
          Estacions meteorològiques
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarSatelits}
            onChange={(e) => setMostrarSatelits(e.target.checked)}
          />
          <span className="inline-block h-3 w-3 rounded-full bg-[#9333ea]" />
          Satèl·lits
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarAvions}
            onChange={(e) => setMostrarAvions(e.target.checked)}
          />
          <span className="inline-block h-3 w-3 rounded-full bg-[#ea580c]" />
          Avions
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarAvisos}
            onChange={(e) => setMostrarAvisos(e.target.checked)}
          />
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
          Avisos meteorològics
        </label>
        <label className="flex items-center gap-2">
          Comarca:
          <select
            value={comarca}
            onChange={(e) => setComarca(e.target.value)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {comarques.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mostrarAvisos && avisos.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {avisos.map((avis, i) => (
            <li
              key={`${avis.comarca}-${i}`}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className={`inline-block h-2 w-2 rounded-full ${COLOR_NIVELL[avis.nivell] ?? "bg-yellow-400"}`} />
              <strong>{avis.comarca}</strong>
              <span className="text-zinc-500 dark:text-zinc-400">{avis.perill}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <MapContainer center={CENTRE_CATALUNYA} zoom={8} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mostrarEstacions &&
            estacionsFiltrades.map((estacio) => (
              <Marker
                key={`estacio-${estacio.codi}`}
                position={[estacio.coordenades.latitud, estacio.coordenades.longitud]}
                icon={ICONA_ESTACIO}
              >
                <Popup>
                  <strong>{estacio.nom}</strong>
                  <br />
                  {estacio.municipi}, {estacio.comarca}
                  <br />
                  <a href={`/estacions/${estacio.codi}`}>Veure lectures →</a>
                </Popup>
              </Marker>
            ))}
          {mostrarSatelits &&
            satelits.map((satelit) => (
              <Marker
                key={`satelit-${satelit.id}`}
                position={[satelit.latitud, satelit.longitud]}
                icon={ICONA_SATELIT}
              >
                <Popup>
                  <strong>{satelit.nom}</strong>
                  <br />
                  Altitud: {satelit.altitud.toFixed(0)} km
                </Popup>
              </Marker>
            ))}
          {mostrarAvions &&
            avions.map((avio) => (
              <Marker key={avio.icao24} position={[avio.latitud, avio.longitud]} icon={ICONA_AVIO}>
                <Popup>
                  <strong>{avio.indicatiu}</strong>
                  <br />
                  {avio.paisOrigen}
                  <br />
                  {avio.altitud != null && `Altitud: ${Math.round(avio.altitud)} m`}
                  {avio.velocitat != null && ` · ${Math.round(avio.velocitat * 3.6)} km/h`}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}
