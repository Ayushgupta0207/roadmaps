"use client";

import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type ResourceItem = {
  id: string; title: string; url: string; type: string; level: string; reason: string; isFree: boolean;
};
type TopicNode = {
  id: string; title: string; summary: string; posX: number; posY: number;
  parentId: string | null; resources: ResourceItem[];
};

export default function RoadmapGraph({ nodes }: { nodes: TopicNode[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = nodes.find((n) => n.id === activeId) ?? null;

  const flowNodes: Node[] = useMemo(
    () => nodes.map((n) => ({
      id: n.id,
      position: { x: n.posX, y: n.posY },
      data: { label: n.title },
    })),
    [nodes]
  );

  const flowEdges: Edge[] = useMemo(
    () => nodes
      .filter((n) => n.parentId)
      .map((n) => ({ id: `${n.parentId}-${n.id}`, source: n.parentId as string, target: n.id })),
    [nodes]
  );

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_360px]">
      <div className="h-[70vh] w-full min-w-0 rounded-xl border">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          fitView
          nodesDraggable={false}
          colorMode="system"
          nodesConnectable={false}
          onNodeClick={(_, node) => setActiveId(node.id)}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <aside className="rounded-xl border p-4">
        {active ? (
          <>
            <h2 className="text-xl font-semibold">{active.title}</h2>
            <p className="mb-4 text-sm text-neutral-600">{active.summary}</p>
            <ul className="space-y-3">
              {active.resources.map((r) => (
                <li key={r.id} className="rounded-lg border p-3">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                     className="font-medium underline">
                    {r.title}
                  </a>
                  <div className="mt-1 text-xs text-neutral-500">
                    {r.type} · {r.level} · {r.isFree ? "Free" : "Paid"}
                  </div>
                  <p className="mt-1 text-sm">{r.reason}</p>
                </li>
              ))}
              {active.resources.length === 0 && (
                <li className="text-sm text-neutral-500">No resources yet.</li>
              )}
            </ul>
          </>
        ) : (
          <p className="text-neutral-500">Click a topic to see the best resources.</p>
        )}
      </aside>
    </div>
  );
}