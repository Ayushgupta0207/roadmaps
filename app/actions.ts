"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleProgress(nodeId: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const key = { userId_nodeId: { userId: session.user.id, nodeId } };
  const existing = await db.progress.findUnique({ where: key });

  if (existing) {
    await db.progress.delete({ where: key });
  } else {
    await db.progress.create({ data: { userId: session.user.id, nodeId } });
  }

  revalidatePath(`/roadmaps/${slug}`);
}