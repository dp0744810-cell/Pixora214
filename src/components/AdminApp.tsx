import React from 'react';
import { usePixora } from '../context/PixoraContext';
import { LayoutDashboard, Users, Smartphone, Lock } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { users, posts, setCurrentView, adminLock } = usePixora();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <LayoutDashboard className="text-indigo-500" /> Pixora Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('user')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Smartphone size={14} /> Back to App
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Users</span>
            <h2 className="text-2xl font-bold font-mono text-indigo-500 mt-1">{users.length}</h2>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Posts</span>
            <h2 className="text-2xl font-bold font-mono text-pink-500 mt-1">{posts.length}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};
