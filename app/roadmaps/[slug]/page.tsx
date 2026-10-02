import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import RoadmapGraph from "@/components/RoadmapGraph";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const roadmap = await db.roadmap.findUnique({ where: { slug } });
  return {
    title: roadmap ? `${roadmap.title} Roadmap` : "Not found",
    description: roadmap?.description,
  };
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;

  const roadmap = await db.roadmap.findUnique({
    where: { slug },
    include: {
      nodes: {
        include: {
          resources: { where: { isBroken: false }, orderBy: { score: "desc" } },
        },
      },
    },
  });

  if (!roadmap) notFound();
    const session = await auth();
    const doneRows = session?.user?.id
    ? await db.progress.findMany({
        where: { userId: session.user.id, node: { roadmapId: roadmap.id } },
        select: { nodeId: true },
      })
    : [];
  const doneIds = doneRows.map((d) => d.nodeId);

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">← All roadmaps</Link>
      <h1 className="mt-2 text-3xl font-bold">{roadmap.title} Roadmap</h1>
      <p className="mb-6 text-neutral-600">{roadmap.description}</p>
      <RoadmapGraph
        nodes={roadmap.nodes}
        slug={slug}
        doneIds={doneIds}
        signedIn={Boolean(session?.user)}
      />
    </main>
  );
}