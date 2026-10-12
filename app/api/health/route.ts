import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (e) {
    console.error("HEALTH_CHECK_FAILED", e);
    return Response.json({ status: "error" }, { status: 503 });
  }
}