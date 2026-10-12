import { db } from "@/lib/db";

type Result = "ok" | "broken" | "unknown";

async function check(url: string): Promise<Result> {
  const options = {
    redirect: "follow" as const,
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "LearnMapLinkChecker/1.0" },
  };

  try {
    let res = await fetch(url, { ...options, method: "HEAD" });
    // Some sites refuse HEAD requests, so retry with GET
    if ([403, 405, 501].includes(res.status)) {
      res = await fetch(url, { ...options, method: "GET" });
    }
    if (res.ok) return "ok";
    if (res.status === 404 || res.status === 410) return "broken";
    return "unknown"; // 403, 429, 5xx: could be bot protection or a temporary outage
  } catch {
    return "broken"; // DNS failure, timeout, refused connection
  }
}

export async function checkAllLinks() {
  const resources = await db.resource.findMany({ select: { id: true, url: true } });
  const summary = { total: resources.length, ok: 0, broken: 0, unknown: 0 };

  // Check 5 links at a time so we don't hammer anyone
  for (let i = 0; i < resources.length; i += 5) {
    const batch = resources.slice(i, i + 5);
    await Promise.all(
      batch.map(async (r) => {
        const result = await check(r.url);
        summary[result]++;
        await db.resource.update({
          where: { id: r.id },
          data: {
            lastCheckedAt: new Date(),
            // "unknown" keeps the previous status instead of flip-flopping
            ...(result !== "unknown" && { isBroken: result === "broken" }),
          },
        });
      })
    );
  }
  return summary;
}