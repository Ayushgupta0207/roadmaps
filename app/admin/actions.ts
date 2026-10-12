"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { checkAllLinks } from "@/lib/linkcheck";

const slug = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only");

// Only allow http(s) links. Blocks things like javascript: URLs.
const httpUrl = z.string().refine((v) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}, "Must be a valid http(s) URL");

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return result.data;
}

export async function createRoadmap(formData: FormData) {
  await requireAdmin();
  const data = parse(
    z.object({
      title: z.string().min(2).max(80),
      slug,
      description: z.string().min(5).max(300),
    }),
    Object.fromEntries(formData)
  );
  await db.roadmap.create({ data });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createNode(formData: FormData) {
  await requireAdmin();
  const data = parse(
    z.object({
      roadmapId: z.string().min(1),
      title: z.string().min(2).max(80),
      slug,
      summary: z.string().min(5).max(300),
      posX: z.coerce.number(),
      posY: z.coerce.number(),
      parentId: z.string().optional().transform((v) => v || null),
    }),
    Object.fromEntries(formData)
  );
  await db.node.create({ data });
  revalidatePath("/admin");
}

export async function createResource(formData: FormData) {
  await requireAdmin();
  const data = parse(
    z.object({
      nodeId: z.string().min(1),
      title: z.string().min(2).max(120),
      url: httpUrl,
      type: z.enum(["VIDEO", "DOC", "BOOK", "COURSE", "ARTICLE"]),
      level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      isFree: z.boolean(),
      reason: z.string().min(5).max(300),
    }),
    { ...Object.fromEntries(formData), isFree: formData.get("isFree") === "on" }
  );
  await db.resource.create({ data });
  revalidatePath("/admin");
}

export async function runLinkCheck() {
  await requireAdmin();
  await checkAllLinks();
  revalidatePath("/admin");
}

export async function setParent(formData: FormData) {
  await requireAdmin();
  const d = parse(
    z.object({
      nodeId: z.string().min(1),
      parentId: z.string().optional().transform((v) => v || null),
    }),
    Object.fromEntries(formData)
  );
  if (d.parentId === d.nodeId) throw new Error("A topic cannot come after itself");
  await db.node.update({ where: { id: d.nodeId }, data: { parentId: d.parentId } });
  revalidatePath("/admin");
}