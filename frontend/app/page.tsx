"use client";

import { useState } from "react";
import { Footer } from "./components/Footer";
import LoginForm from "./components/LoginForm/LoginForm";
import RegisterForm from "./components/RegisterForm/RegisterForm";

export default function HomePage() {
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
  }

  const renderContent = () => {
    if (isLoggedIn) {
      return (
        <nav className="home-navigation" aria-label="Logged-in navigation">
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
        </nav>
      );
    }

    switch (view) {
      case "login":
        case "login":
          return (
            <div key="login-form" className="animate-fade-in-up w-full max-w-sm">
              <LoginForm onBack={() => setView("home")} />
            </div>
          );
      case "register":
        return (
            <div key="register-form" className="animate-fade-in-up w-full max-w-sm">
              <RegisterForm onBack={() => setView("home")} />
            </div>
          );
      case "home":
      default:
        return (
          <nav className="home-navigation" aria-label="Logged-out navigation">
            <button className="primary-button" onClick={() => setView("login")}>
              Login
            </button>
            <button className="secondary-link" onClick={() => setView("register")}>
              Register
            </button>
          </nav>
        );
    }
  }



  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Multiplayer Stealth Arena</p>

        <h1 className="home-title">Shadow Seek</h1>

        <p className="home-description">
          A dark multiplayer hide-and-seek arena.
        </p>

        {renderContent()}
      </section>

      <Footer />
    </main>
  );
}
