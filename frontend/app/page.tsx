"use client";

import { useEffect, useState } from "react";
import { getAuthenticatedUser, AuthenticatedUser } from "./auth";
import { Footer } from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [view, setView] = useState<"home" | "login" | "register">("home");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const hasCookie = document.cookie.includes("is_logged_in=true");

      if (!hasCookie) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getAuthenticatedUser();
        if (isMounted) {
          if (!userData) {
            document.cookie =
              "is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            setUser(null);
          } else {
            setUser(userData);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          document.cookie =
            "is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return null;

  const handleLoginSuccess = async () => {
    const userData = await getAuthenticatedUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        setUser(null);
        router.replace("/");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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

          {user ? (
            <nav
              className="home-navigation mt-8"
              aria-label="Logged-in navigation"
            >
              <Link className="primary-link" href="/lobby">
                Lobby
              </Link>
              <Link className="secondary-link" href="/profile">
                Profile
              </Link>
              <Link className="secondary-link" href="/leaderboard">
                Leaderboard
              </Link>
              <button
                className="secondary-button"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>
          ) : (
            <nav
              className="home-navigation mt-8 w-full flex flex-col items-center gap-4"
              aria-label="Logged-out navigation"
            >
              {view === "login" ? (
                <div className="animate-fade-in-up w-full max-w-md">
                  {message && (
                    <div className="mb-4 text-emerald-500">{message}</div>
                  )}
                  <LoginForm
                    onBack={() => setView("home")}
                    onLoginSuccess={handleLoginSuccess}
                  />
                </div>
              ) : view === "register" ? (
                <div className="animate-fade-in-up w-full max-w-md">
                  <RegisterForm
                    onBack={() => setView("home")}
                    onRegisterSuccess={(msg: string) => {
                      setView("login");
                      setMessage(msg);
                    }}
                  />
                </div>
              ) : (
                <>
                  <button
                    className="primary-button"
                    onClick={() => setView("login")}
                  >
                    Login
                  </button>
                  <button
                    className="secondary-link"
                    onClick={() => setView("register")}
                  >
                    Register
                  </button>
                </>
              )}
            </nav>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
