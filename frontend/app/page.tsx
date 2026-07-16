"use client";

import { useEffect, useState } from 'react';
import { getAuthenticatedUser, AuthenticatedUser } from './auth';
import { Footer } from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

export default function HomePage() {
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthenticatedUser().then((userData) => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const handleLoginSuccess = async () => {
    const userData = await getAuthenticatedUser();
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('shadowseek_authToken');
    setUser(null);
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Multiplayer Stealth Arena</p>
        <h1 className="home-title">Shadow Seek</h1>
        <p className="home-description">A dark multiplayer hide-and-seek arena.</p>

        {user ? (
          <nav className="home-navigation" aria-label="Logged-in navigation">
            <a className="primary-link" href="/lobby">Lobby</a>
            <a className="secondary-link" href="/profile">Profile</a>
            <a className="secondary-link" href="/leaderboard">Leaderboard</a>
            <button className="secondary-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        ) : (
          <nav className="home-navigation" aria-label="Logged-out navigation">
            {view === "login" ? (
              <div className="animate-fade-in-up w-full max-w-sm">
                <LoginForm 
                  onBack={() => setView("home")} 
                  onLoginSuccess={handleLoginSuccess} 
                />
              </div>
            ) : view === "register" ? (
              <div className="animate-fade-in-up w-full max-w-sm">
                <RegisterForm onBack={() => setView("home")} />
              </div>
            ) : (
              <>
                <button className="primary-button" onClick={() => setView("login")}>Login</button>
                <button className="secondary-link" onClick={() => setView("register")}>Register</button>
              </>
            )}
          </nav>
        )}
      </section>
      <Footer />
    </main>
  );
}