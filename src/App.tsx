import React, { useState } from 'react';
import { PixoraProvider, usePixora } from './context/PixoraContext';
import { UserApp } from './components/UserApp';
import { AdminApp } from './components/AdminApp';
import { AuthScreen } from './components/AuthScreen';
import { Lock, KeyRound, AlertTriangle } from 'lucide-react';

// Admin Lock Screen Component with updated text
const AdminLockScreen: React.FC = () => {
  const { adminUnlock, setCurrentView, failedAdminAttempts, adminLockoutSeconds } = usePixora();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = adminUnlock(password);
    if (!res.success) {
      setError(res.error || 'Invalid master key.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-500 mb-3">
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-extrabold text-white">Admin Vault Locked</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter master protection password to access Pixora Control Center.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {adminLockoutSeconds > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs text-center space-y-1">
            <p className="font-bold">Security Lockdown Active</p>
            <p className="font-mono text-sm">Please wait {adminLockoutSeconds}s before retrying.</p>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Master Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master key..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-rose-500"
                  autoFocus
                />
              </div>
              {/* Changed text from Default Master Key: Dharvex214 to Enter Master Key */}
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enter Master Key (Attempts: {failedAdminAttempts}/3)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              Unlock Admin Hub
            </button>
          </form>
        )}

        <button
          onClick={() => setCurrentView('user')}
          className="w-full mt-3 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Return to App
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentView, hasActiveAccount, isAdminUnlocked } = usePixora();

  if (currentView === 'admin') {
    if (!isAdminUnlocked) {
      return <AdminLockScreen />;
    }
    return <AdminApp />;
  }

  if (!hasActiveAccount) {
    return <AuthScreen />;
  }

  return <UserApp />;
};

export default function App() {
  return (
    <PixoraProvider>
      <AppContent />
    </PixoraProvider>
  );
}
