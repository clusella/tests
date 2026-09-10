import Link from "next/link";
import { getSatelitsSobreCatalunya } from "@/lib/n2yo";

export const revalidate = 300;

export default async function Satelits() {
  const { satelits, mock: mockMode } = await getSatelitsSobreCatalunya();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Temps a Catalunya
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Satèl·lits sobre Catalunya
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Satèl·lits actualment visibles al cel, segons N2YO.
        </p>

        {mockMode && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Mostrant dades d&apos;exemple. Configura <code>N2YO_API_KEY</code> a{" "}
            <code>.env.local</code> per veure satèl·lits reals.
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Satèl·lit</th>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Latitud</th>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Longitud</th>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Altitud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {satelits.map((satelit) => (
                <tr key={satelit.id}>
                  <td className="px-4 py-2 text-black dark:text-zinc-50">{satelit.nom}</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {satelit.latitud.toFixed(2)}°
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {satelit.longitud.toFixed(2)}°
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {satelit.altitud.toFixed(0)} km
                  </td>
                </tr>
              ))}
              {satelits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    No hi ha satèl·lits detectats ara mateix.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
