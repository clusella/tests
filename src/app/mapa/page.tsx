import Link from "next/link";
import { getEstacions } from "@/lib/meteocat";
import { getSatelitsSobreCatalunya } from "@/lib/n2yo";
import MapaLoader from "@/components/MapaLoader";

export const revalidate = 300;

export default async function MapaPage() {
  const [{ estacions, mock: mockEstacions }, { satelits, mock: mockSatelits }] = await Promise.all([
    getEstacions(),
    getSatelitsSobreCatalunya(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Temps a Catalunya
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Mapa interactiu
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Estacions meteorològiques i satèl·lits sobre Catalunya, amb filtres.
        </p>

        {(mockEstacions || mockSatelits) && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Mostrant dades d&apos;exemple per a{" "}
            {[mockEstacions && "les estacions", mockSatelits && "els satèl·lits"]
              .filter(Boolean)
              .join(" i ")}
            .
          </div>
        )}

        <div className="mt-8">
          <MapaLoader estacions={estacions} satelits={satelits} />
        </div>
      </main>
    </div>
  );
}
