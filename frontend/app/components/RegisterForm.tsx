export default function RegisterForm({ onBack }: { onBack: () => void }) {
  
  // todo: add registration logic

  return (
    <form className="flex flex-col items-stretch gap-4 p-6 w-full">
      <h2 className="text-2xl font-bold text-white">Register</h2>
      
      <div className="flex flex-col gap-1">
        <input 
          id="username"
          type="text"
          placeholder="Username"
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required 
        />
      </div>

      <div className="flex flex-col gap-1">
        <input 
          id="email"
          type="email"
          placeholder="Email Address"
          className="p-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          required 
        />
      </div>

      <div className="flex flex-col gap-1">
        <input 
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
          Register
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