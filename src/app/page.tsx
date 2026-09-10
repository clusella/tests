import Link from "next/link";
import { getEstacions, getUsingMockData } from "@/lib/meteocat";

export const revalidate = 3600;

export default async function Home() {
  const [estacions, mockMode] = await Promise.all([getEstacions(), getUsingMockData()]);
  const comarques = Array.from(new Set(estacions.map((e) => e.comarca))).sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Temps a Catalunya
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Dades de les estacions meteorològiques de la XEMA (Meteocat).
        </p>

        {mockMode && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Mostrant dades d&apos;exemple. Configura <code>METEOCAT_API_KEY</code> a{" "}
            <code>.env.local</code> per veure dades reals de Meteocat.
          </div>
        )}

        <div className="mt-8 space-y-8">
          {comarques.map((comarca) => (
            <section key={comarca}>
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {comarca}
              </h2>
              <ul className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                {estacions
                  .filter((e) => e.comarca === comarca)
                  .map((estacio) => (
                    <li key={estacio.codi}>
                      <Link
                        href={`/estacions/${estacio.codi}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <span className="font-medium text-black dark:text-zinc-50">
                          {estacio.nom}
                        </span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {estacio.municipi} · {estacio.altitud} m
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
