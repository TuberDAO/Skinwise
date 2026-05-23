export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Temporary update
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          SkinWise is temporarily offline
        </h1>
      </section>
    </main>
  );
}