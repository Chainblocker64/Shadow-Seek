"use client";

import { useState } from "react";

export default function RegisterForm({
  onBack,
  onRegisterSuccess,
}: {
  onBack: () => void;
  onRegisterSuccess: (msg: string) => void;
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        onRegisterSuccess("Registration successful! Please login.");
      } else {
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setError(message || "Registration failed");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-stretch gap-4 p-6 w-full"
    >
      <h2 className="text-2xl font-bold text-white">Register</h2>

      <div className="flex flex-col gap-1">
        <input
          onChange={handleInput}
          id="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <input
          onChange={handleInput}
          id="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <input
          onChange={handleInput}
          id="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required
        />
      </div>

      {error && (
        <span className="text-sm text-red-500 bg-red-950 p-2 rounded border border-red-700">
          {error}
        </span>
      )}

      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex-1 secondary-link"
        >
          Back
        </button>
      </div>
    </form>
  );
}
