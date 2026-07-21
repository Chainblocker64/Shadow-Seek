"use client";

import { useState } from "react";
import { AuthenticatedUser, getAuthenticatedUser } from "../auth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HomeClientWrapperProps {
  user: AuthenticatedUser | null;
}

export default function HomeClientWrapper({
  user: initialUser,
}: HomeClientWrapperProps) {
  const [view, setView] = useState<"home" | "login" | "register">("home");
  const [user, setUser] = useState<AuthenticatedUser | null>(initialUser);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginSuccess = async () => {
    const userData = await getAuthenticatedUser();
    if (userData) {
      setUser(userData);
      setView("home");
    }
    router.refresh();
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
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav
      className="home-navigation mt-8 w-full flex flex-col items-center gap-4"
      aria-label="Navigation"
    >
      {user ? (
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
