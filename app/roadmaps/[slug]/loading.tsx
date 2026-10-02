export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse p-4 md:p-8">
      <div className="h-8 w-64 rounded bg-card" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-card" />
      <div className="mt-8 h-[60vh] rounded-xl bg-card" />
    </main>
  );
}