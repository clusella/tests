import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstacio, getUltimesLectures } from "@/lib/meteocat";

export const revalidate = 600;

export default async function EstacioPage({
  params,
}: {
  params: Promise<{ codi: string }>;
}) {
  const { codi } = await params;
  const estacio = await getEstacio(codi);
  if (!estacio) {
    notFound();
  }
  const { lectures, mock: mockMode } = await getUltimesLectures(codi);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Totes les estacions
        </Link>

        <h1 className="mt-2 text-2xl font-semibold text-black dark:text-zinc-50">
          {estacio.nom}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {estacio.municipi}, {estacio.comarca} · {estacio.altitud} m · codi {estacio.codi}
        </p>

        {mockMode && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Mostrant dades d&apos;exemple: no s&apos;han pogut obtenir lectures reals de Meteocat en
            aquest moment.
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Variable</th>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Valor</th>
                <th className="px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {lectures.map((lectura) => (
                <tr key={lectura.variableCodi}>
                  <td className="px-4 py-2 text-black dark:text-zinc-50">{lectura.nomVariable}</td>
                  <td className="px-4 py-2 text-black dark:text-zinc-50">
                    {lectura.valor} {lectura.unitat}
                  </td>
                  <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                    {new Date(lectura.dataLectura).toLocaleTimeString("ca-ES")}
                  </td>
                </tr>
              ))}
              {lectures.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    No hi ha lectures disponibles avui.
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
