"use client";

import { useTransition } from "react";
import { toggleProgress } from "@/app/actions";

type Props = { nodeId: string; slug: string; done: boolean; signedIn: boolean };

export default function DoneButton({ nodeId, slug, done, signedIn }: Props) {
  const [pending, start] = useTransition();

  if (!signedIn) {
    return <p className="mb-4 text-sm text-muted">Sign in to track your progress.</p>;
  }

  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleProgress(nodeId, slug))}
      className={`mb-4 rounded-lg border px-3 py-1.5 text-sm ${
        done ? "border-accent bg-accent text-bg" : "border-border hover:bg-bg"
      }`}
    >
      {pending ? "Saving..." : done ? "✓ Completed (click to undo)" : "Mark as done"}
    </button>
  );
}