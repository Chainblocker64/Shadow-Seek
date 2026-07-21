import { cookies } from "next/headers";
import { Footer } from "./components/Footer";
import HomeClientWrapper from "./components/HomeClientWrapper";
import { AuthenticatedUser } from "./auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasCookie = cookieStore.get("is_logged_in");

  let user: AuthenticatedUser | null = null;

  if (hasCookie) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
          cache: "no-store",
          next: { revalidate: 0 },
        },
      );

      if (response.ok) {
        user = await response.json();
      }
    } catch (error) {
      console.error("Failed to fetch user on server:", error);
    }
  }

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

          <HomeClientWrapper user={user} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
