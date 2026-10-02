"use client";

import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ResourceCard, { type ResourceItem } from "./ResourceCard";
import DoneButton from "./DoneButton";

type TopicNode = {
  id: string;
  title: string;
  summary: string;
  posX: number;
  posY: number;
  parentId: string | null;
  resources: ResourceItem[];
};

type Props = {
  nodes: TopicNode[];
  slug: string;
  doneIds: string[];
  signedIn: boolean;
};

export default function RoadmapGraph({ nodes, slug, doneIds, signedIn }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = nodes.find((n) => n.id === activeId) ?? null;
  const doneSet = useMemo(() => new Set(doneIds), [doneIds]);

  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => {
        const done = doneSet.has(n.id);
        const isActive = n.id === activeId;
        return {
          id: n.id,
          position: { x: n.posX, y: n.posY },
          data: { label: done ? `✓ ${n.title}` : n.title },
          style: {
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            border: isActive
              ? "2px solid var(--accent)"
              : done
              ? "2px solid #22c55e"
              : undefined,
          },
        };
      }),
    [nodes, activeId, doneSet]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      nodes
        .filter((n) => n.parentId)
        .map((n) => ({ id: `${n.parentId}-${n.id}`, source: n.parentId as string, target: n.id })),
    [nodes]
  );

  const ordered = useMemo(() => [...nodes].sort((a, b) => a.posY - b.posY), [nodes]);
  const percent = nodes.length ? Math.round((doneIds.length / nodes.length) * 100) : 0;

  return (
    <>
      {signedIn && (
        <div className="mb-4">
          <div className="mb-1 text-sm text-muted">
            {doneIds.length} of {nodes.length} topics completed ({percent}%)
          </div>
          <div className="h-2 overflow-hidden rounded bg-card">
            <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {/* Desktop: graph + side panel */}
      <div className="hidden gap-4 md:grid md:grid-cols-[1fr_360px]">
        <div className="h-[70vh] w-full min-w-0 rounded-xl border border-border">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => setActiveId(node.id)}
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="rounded-xl border border-border bg-card p-4">
          {active ? (
            <>
              <h2 className="text-xl font-semibold">{active.title}</h2>
              <p className="mb-4 text-sm text-muted">{active.summary}</p>
              <DoneButton
                nodeId={active.id}
                slug={slug}
                done={doneSet.has(active.id)}
                signedIn={signedIn}
              />
              <ul className="space-y-3">
                {active.resources.map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
                {active.resources.length === 0 && (
                  <li className="text-sm text-muted">No resources yet.</li>
                )}
              </ul>
            </>
          ) : (
            <p className="text-muted">Click a topic to see the best resources.</p>
          )}
        </aside>
      </div>

      {/* Mobile: simple expandable list */}
      <ul className="space-y-3 md:hidden">
        {ordered.map((n, i) => (
          <li key={n.id}>
            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer font-semibold">
                {i + 1}. {n.title} {doneSet.has(n.id) && "✓"}
              </summary>
              <p className="mb-3 mt-2 text-sm text-muted">{n.summary}</p>
              <DoneButton
                nodeId={n.id}
                slug={slug}
                done={doneSet.has(n.id)}
                signedIn={signedIn}
              />
              <ul className="space-y-3">
                {n.resources.map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}