"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Estacio } from "@/lib/meteocat";
import type { Satelit } from "@/lib/n2yo";

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

type Props = {
  estacions: Estacio[];
  satelits: Satelit[];
};

export default function Mapa({ estacions, satelits }: Props) {
  const [mostrarEstacions, setMostrarEstacions] = useState(true);
  const [mostrarSatelits, setMostrarSatelits] = useState(true);
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
        </MapContainer>
      </div>
    </div>
  );
}
