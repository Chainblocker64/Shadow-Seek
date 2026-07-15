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
    <main className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Multiplayer Stealth Arena</p>

        <h1 className="home-title">Shadow Seek</h1>

        <p className="home-description">
          A dark multiplayer hide-and-seek arena.
        </p>

        {isLoggedIn ? (
          <nav className="home-navigation" aria-label="Logged-in navigation">
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
