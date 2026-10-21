import React, { useState } from 'react';
import { usePixora } from '../context/PixoraContext';
import { Flame, LogIn, UserPlus, AlertTriangle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithFirebaseEmail, registerWithFirebaseEmail, loginWithFirebaseGoogle } = usePixora();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const res = await loginWithFirebaseEmail(email.trim(), password);
      if (!res.success) setError(res.error || 'Login failed.');
    } else {
      if (!username.trim() || !fullName.trim()) {
        setLoading(false);
        setError('Full Name and Username are required.');
        return;
      }
      const res = await registerWithFirebaseEmail({
        email: email.trim(),
        password,
        username: username.trim(),
        fullName: fullName.trim(),
        dateOfBirth: '2000-01-01',
        bio: 'New Pixora member',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isPrivate: false,
      });
      if (!res.success) setError(res.error || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-serif italic mb-2">
          Pixora
        </h1>
        <p className="text-xs text-slate-400 mb-6">Sign in or create your account via Firebase</p>

        <div className="flex p-1 bg-slate-800 rounded-2xl mb-4 text-xs font-bold">
          <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-slate-950 text-white' : 'text-slate-400'}`}>
            <LogIn size={14} /> Sign In
          </button>
          <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-slate-950 text-white' : 'text-slate-400'}`}>
            <UserPlus size={14} /> Create Account
          </button>
        </div>

        <button
          type="button"
          onClick={loginWithFirebaseGoogle}
          className="w-full py-2.5 px-4 mb-4 bg-white text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100"
        >
          <Flame size={15} className="text-amber-500 fill-amber-500" /> Continue with Google
        </button>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              </div>
            </>
          )}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold text-xs shadow-lg">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
