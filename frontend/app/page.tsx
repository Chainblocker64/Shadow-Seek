"use client";

import { useState } from "react";
import { Footer } from "./components/Footer";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <section className="hero">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.5em] text-emerald-400">
          Multiplayer Stealth Arena
        </p>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Shadow Seek
        </h1>

        <p className="mb-10 max-w-xl text-lg text-zinc-300">
          A dark multiplayer hide-and-seek arena.
        </p>

        {isLoggedIn ? (
          <nav
            className="flex flex-col items-center gap-4 sm:flex-row"
            aria-label="Logged-in navigation"
          >
            <a className="primary-link" href="/lobby">
              Lobby
            </a>

            <a className="secondary-link" href="/profile">
              Profile
            </a>

            <a className="secondary-link" href="/leaderboard">
              Leaderboard
            </a>

            <button
              className="secondary-button"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="home-navigation" aria-label="Logged-out navigation">
            <button
              className="primary-button"
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>

            <a className="secondary-link" href="/register">
              Register
            </a>
          </nav>
        )}
      </section>

      <Footer />
    </main>
  );
}
