import { PrismaClient } from "../app/generated/prisma/client";
const prisma = new PrismaClient();
const db = new PrismaClient();

async function main() {
  const roadmap = await db.roadmap.upsert({
    where: { slug: "devops" },
    update: {},
    create: { slug: "devops", title: "DevOps", description: "From Linux basics to production." },
  });

  const linux = await db.node.upsert({
    where: { roadmapId_slug: { roadmapId: roadmap.id, slug: "linux" } },
    update: {},
    create: { roadmapId: roadmap.id, slug: "linux", title: "Linux Basics",
      summary: "Shell, permissions, processes, networking.", posX: 250, posY: 0 },
  });

  const docker = await db.node.upsert({
    where: { roadmapId_slug: { roadmapId: roadmap.id, slug: "docker" } },
    update: {},
    create: { roadmapId: roadmap.id, slug: "docker", title: "Docker",
      summary: "Images, containers, compose.", posX: 250, posY: 150, parentId: linux.id },
  });

  const exists = await db.resource.findFirst({ where: { nodeId: docker.id } });
  if (!exists) {
    await db.resource.create({
      data: { nodeId: docker.id, title: "Docker Official Get Started",
        url: "https://docs.docker.com/get-started/", type: "DOC", level: "BEGINNER",
        isFree: true, reason: "Authoritative and always up to date." },
    });
  }
}

main().finally(() => db.$disconnect());