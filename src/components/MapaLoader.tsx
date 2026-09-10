"use client";

import dynamic from "next/dynamic";
import type { Estacio, Avis } from "@/lib/meteocat";
import type { Satelit } from "@/lib/n2yo";
import type { Avio } from "@/lib/opensky";

const Mapa = dynamic(() => import("@/components/Mapa"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      Carregant mapa…
    </div>
  ),
});

export default function MapaLoader(props: {
  estacions: Estacio[];
  satelits: Satelit[];
  avions: Avio[];
  avisos: Avis[];
}) {
  return <Mapa {...props} />;
}
