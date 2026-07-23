"use client";

import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function HomeClientWrapper() {
  const [view, setView] = useState<"home" | "login" | "register">("home");
  const [message, setMessage] = useState<string | null>(null);
  const { user, loading, fetchUser, logout } = useAuthStore();

  const handleLoginSuccess = async () => {
    await fetchUser();
    setView("home");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      logout();
      setView("home");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <div className="mt-8 text-zinc-500">Loading...</div>;
  }

  return (
    <nav
      className="home-navigation mt-8 w-full flex flex-col items-center gap-4"
      aria-label="Navigation"
    >
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-300 text-lg font-medium">
            Hi <span className="text-white font-bold">{user.username}</span>,
            nice to see you!
          </p>
          <div className="flex gap-4 items-center">
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
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </nav>
  );
}
