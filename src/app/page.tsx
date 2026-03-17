export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          TinyJoy
        </h1>
        <p className="max-w-sm text-lg text-zinc-500 dark:text-zinc-400">
          Calm, quick, delightful games for everyday moments.
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Games coming soon…
        </p>
      </div>
    </main>
  );
}
