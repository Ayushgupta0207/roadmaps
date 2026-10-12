import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { createRoadmap, createNode, createResource, runLinkCheck, setParent } from "./actions";


export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-border bg-bg p-2 text-sm";
const label = "block text-sm text-muted";
const button = "rounded-lg border border-border px-4 py-2 text-sm hover:bg-card";
const section = "rounded-xl border border-border bg-card p-5 space-y-3";

export default async function AdminPage() {
  if (!(await isAdmin())) notFound(); // pretend the page doesn't exist

  const [roadmaps, nodes, broken, total] = await Promise.all([
    db.roadmap.findMany({ orderBy: { title: "asc" } }),
    db.node.findMany({ include: { roadmap: true }, orderBy: [{ roadmapId: "asc" }, { posY: "asc" }] }),
    db.resource.findMany({ where: { isBroken: true }, include: { node: true } }),
    db.resource.count(),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Admin</h1>

      {/* Link checker */}
      <section className={section}>
        <h2 className="text-xl font-semibold">Link health</h2>
        <p className="text-sm text-muted">
          {total} resources, {broken.length} marked broken (hidden from visitors).
        </p>
        <form action={runLinkCheck}>
          <button className={button}>Run link check now</button>
        </form>
        {broken.length > 0 && (
          <ul className="list-disc pl-5 text-sm">
            {broken.map((r) => (
              <li key={r.id}>
                {r.node.title}: {r.title} (<span className="break-all">{r.url}</span>)
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add roadmap */}
      <section className={section}>
        <h2 className="text-xl font-semibold">Add roadmap</h2>
        <form action={createRoadmap} className="space-y-3">
          <label className={label}>Title<input name="title" required className={input} /></label>
          <label className={label}>Slug (used in the URL, e.g. frontend)<input name="slug" required className={input} /></label>
          <label className={label}>Description<input name="description" required className={input} /></label>
          <button className={button}>Create roadmap</button>
        </form>
      </section>

      {/* Add topic */}
      <section className={section}>
        <h2 className="text-xl font-semibold">Add topic</h2>
        <form action={createNode} className="space-y-3">
          <label className={label}>Roadmap
            <select name="roadmapId" required className={input}>
              {roadmaps.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </label>
          <label className={label}>Title<input name="title" required className={input} /></label>
          <label className={label}>Slug<input name="slug" required className={input} /></label>
          <label className={label}>Summary<input name="summary" required className={input} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Position X<input name="posX" type="number" defaultValue={250} className={input} /></label>
            <label className={label}>Position Y<input name="posY" type="number" defaultValue={0} className={input} /></label>
          </div>
          <label className={label}>Comes after (parent topic)
            <select name="parentId" className={input}>
              <option value="">None (first topic)</option>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.roadmap.title}: {n.title}</option>)}
            </select>
          </label>
          <button className={button}>Create topic</button>
        </form>
      </section>

            {/* Change parent */}
      <section className={section}>
        <h2 className="text-xl font-semibold">Change a topic&apos;s parent</h2>
        <form action={setParent} className="space-y-3">
          <label className={label}>Topic
            <select name="nodeId" required className={input}>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.roadmap.title}: {n.title}</option>)}
            </select>
          </label>
          <label className={label}>Comes after
            <select name="parentId" className={input}>
              <option value="">None (first topic)</option>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.roadmap.title}: {n.title}</option>)}
            </select>
          </label>
          <button className={button}>Save parent</button>
        </form>
      </section>

      {/* Add resource */}
      <section className={section}>
        <h2 className="text-xl font-semibold">Add resource</h2>
        <form action={createResource} className="space-y-3">
          <label className={label}>Topic
            <select name="nodeId" required className={input}>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.roadmap.title}: {n.title}</option>)}
            </select>
          </label>
          <label className={label}>Title<input name="title" required className={input} /></label>
          <label className={label}>URL<input name="url" type="url" required placeholder="https://" className={input} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Type
              <select name="type" className={input}>
                {["DOC", "VIDEO", "BOOK", "COURSE", "ARTICLE"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className={label}>Level
              <select name="level" className={input}>
                {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>
          <label className={label}>Why is this the best pick?<input name="reason" required className={input} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFree" defaultChecked /> Free</label>
          <button className={button}>Create resource</button>
        </form>
      </section>
    </main>
  );
}