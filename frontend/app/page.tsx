import { Footer } from "./components/Footer";
import HomeClientWrapper from "./components/HomeClientWrapper";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="flex flex-grow flex-col items-center justify-center p-6">
        <section className="home-hero w-full max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.5em] text-emerald-400">
            Multiplayer Stealth Arena
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Shadow Seek
          </h1>

          <p className="home-description mx-auto">
            A dark multiplayer hide-and-seek arena.
          </p>

          <HomeClientWrapper user={null} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
