"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/lobby"
          className="text-xl font-extrabold tracking-wider text-white hover:text-emerald-400 transition-colors"
        >
          Shadow<span className="text-emerald-500">Seek</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/lobby"
            className={`text-sm font-medium transition-colors ${
              isActive("/lobby")
                ? "text-emerald-400 font-semibold"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Lobby
          </Link>
          <Link
            href="/profile"
            className={`text-sm font-medium transition-colors ${
              isActive("/profile")
                ? "text-emerald-400 font-semibold"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors ${
              isActive("/leaderboard")
                ? "text-emerald-400 font-semibold"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* TODO: username / logout button */}
        </div>
      </div>
    </header>
  );
}
