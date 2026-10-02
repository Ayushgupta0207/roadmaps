import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // always read fresh data for now

export default async function Home() {
  const roadmaps = await db.roadmap.findMany({ orderBy: { title: "asc" } });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-bold">Learn Any Tech</h1>
      <p className="mt-2 text-neutral-600">Curated roadmaps and the best resources.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {roadmaps.map((r) => (
          <li key={r.id}>
            <Link href={`/roadmaps/${r.slug}`}
              className="block rounded-xl border border-border bg-card p-5 transition hover:border-accent hover:shadow-md">
              <h2 className="text-xl font-semibold">{r.title}</h2>
              <p className="text-sm text-neutral-600">{r.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      {roadmaps.length === 0 && (
        <p className="mt-8 text-muted">No roadmaps yet. Check back soon.</p>
      )}
    </main>
  );
}