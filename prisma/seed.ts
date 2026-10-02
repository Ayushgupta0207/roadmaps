import { PrismaClient, ResourceType, Level } from "../app/generated/prisma/client";
const db = new PrismaClient();

type Res = { title: string; url: string; type: ResourceType; level: Level; reason: string; isFree?: boolean };
type Topic = { slug: string; title: string; summary: string; x: number; y: number; parent?: string; resources: Res[] };

const topics: Topic[] = [
  { slug: "linux", title: "Linux Basics", summary: "Shell, permissions, processes, networking.", x: 250, y: 0,
    resources: [
      { title: "Linux Journey", url: "https://linuxjourney.com/", type: "ARTICLE", level: "BEGINNER",
        reason: "Gentle, structured, and free." },
    ] },
  { slug: "git", title: "Git & GitHub", summary: "Version control, branches, pull requests.", x: 250, y: 150, parent: "linux",
    resources: [
      { title: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "BOOK", level: "BEGINNER",
        reason: "The official book, free online." },
    ] },
  { slug: "docker", title: "Docker", summary: "Images, containers, compose.", x: 250, y: 300, parent: "git",
    resources: [
      { title: "Docker Official Get Started", url: "https://docs.docker.com/get-started/", type: "DOC", level: "BEGINNER",
        reason: "Authoritative and always up to date." },
    ] },
  { slug: "ci-cd", title: "CI/CD", summary: "Automate tests and deployments.", x: 50, y: 450, parent: "docker",
    resources: [
      { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "DOC", level: "BEGINNER",
        reason: "Best place to learn the tool you'll actually use." },
    ] },
  { slug: "cloud", title: "Cloud (AWS)", summary: "Compute, storage, networking, IAM.", x: 450, y: 450, parent: "docker",
    resources: [
      { title: "AWS Skill Builder: Cloud Practitioner", url: "https://explore.skillbuilder.aws/", type: "COURSE", level: "BEGINNER",
        reason: "Free official foundations course." },
    ] },
];

async function main() {
  const roadmap = await db.roadmap.upsert({
    where: { slug: "devops" },
    update: {},
    create: { slug: "devops", title: "DevOps", description: "From Linux basics to production." },
  });

  const idBySlug: Record<string, string> = {};

  for (const t of topics) {
    const node = await db.node.upsert({
      where: { roadmapId_slug: { roadmapId: roadmap.id, slug: t.slug } },
      update: { title: t.title, summary: t.summary, posX: t.x, posY: t.y,
        parentId: t.parent ? idBySlug[t.parent] : null },
      create: { roadmapId: roadmap.id, slug: t.slug, title: t.title, summary: t.summary,
        posX: t.x, posY: t.y, parentId: t.parent ? idBySlug[t.parent] : null },
    });
    idBySlug[t.slug] = node.id;

    for (const r of t.resources) {
      const found = await db.resource.findFirst({ where: { nodeId: node.id, url: r.url } });
      if (!found) {
        await db.resource.create({ data: { nodeId: node.id, isFree: r.isFree ?? true, ...r } });
      }
    }
  }
}

main().finally(() => db.$disconnect());