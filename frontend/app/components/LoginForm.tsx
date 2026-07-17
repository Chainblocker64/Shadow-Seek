import { useState } from 'react';

export default function LoginForm({ onBack, onLoginSuccess }: {
   onBack: () => void;
   onLoginSuccess: () => void 
  }) {

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include', 
    });

    const data = await response.json();

    if (response.ok) {
      onLoginSuccess();
      onBack();
    } else {
      const message = Array.isArray(data.message) ? data.message[0] : data.message;
      setError(message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Network error:', error);
    setError('Failed to connect to the server');
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 max-w-sm w-full">
      <h2 className="text-2xl font-bold text-white">Login</h2>
      
      <div className="flex flex-col gap-1">
        <input 
          onChange={handleInput}
          id="email"
          type="email"
          placeholder="Email Address"
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
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required 
        />
      </div>

      {error && (
        <span className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </span>
      )}

      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          className="flex-1 primary-button"
        >
          Login
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