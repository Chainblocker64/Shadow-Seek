"use client";

import { useState, FormEvent } from "react";
import { AuthenticatedUser } from "../auth";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: AuthenticatedUser;
  setUser: (user: AuthenticatedUser | null) => void;
}

export default function ProfileForm({ user, setUser }: ProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const payload: { username?: string; password?: string } = {};
      if (username !== user.username) payload.username = username;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setSubmitting(false);
        setMessage({ type: "error", text: "No changes detected." });
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message || "Update failed";
        throw new Error(errorMsg);
      }

      const updatedUser: AuthenticatedUser = await res.json();
      setUser(updatedUser);

      setPassword("");
      setMessage({ type: "success", text: "Profile successfully updated!" });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-4 p-6 w-full max-w-md mx-auto mt-10 bg-zinc-950 text-zinc-100">
      <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

      {message && (
        <div
          className={`p-3 rounded text-sm border ${
            message.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : "bg-red-950 border-red-700 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-400">
          Email Address
        </label>
        <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-400 text-sm select-all min-h-[38px] flex items-center">
          {user.email || "No email available"}
        </div>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            Nickname / Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 secondary-link"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
