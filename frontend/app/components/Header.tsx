"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { useJoinedRoom, useLeaveRoom } from "../lobby/RoomProvider";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const joinedRoom = useJoinedRoom();
  const leaveRoom = useLeaveRoom();
  const isActive = (path: string) => pathname === path;

  const handleLobbyClick = (e: React.MouseEvent) => {
    if (joinedRoom) {
      e.preventDefault();
      leaveRoom();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-wider text-white transition-colors cursor-pointer"
        >
          Shadow Seek
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/lobby"
            onClick={handleLobbyClick}
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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-300">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
