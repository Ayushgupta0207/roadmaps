export type ResourceItem = {
  id: string;
  title: string;
  url: string;
  type: string;
  level: string;
  reason: string;
  isFree: boolean;
};

export default function ResourceCard({ r }: { r: ResourceItem }) {
  return (
    <li className="rounded-lg border border-border bg-bg p-3">
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-accent underline"
      >
        {r.title}
      </a>
      <div className="mt-1 text-xs text-muted">
        {r.type} · {r.level} · {r.isFree ? "Free" : "Paid"}
      </div>
      <p className="mt-1 text-sm">{r.reason}</p>
    </li>
  );
}