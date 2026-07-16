import { useState } from 'react';

export default function LoginForm({ onBack }: { onBack: () => void }) {

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Login successful!');
        // todo: redirect
      } else {
        console.error('Login failed');
        // todo: show error
      }
    } catch (error) {
      console.error('Network error:', error);
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