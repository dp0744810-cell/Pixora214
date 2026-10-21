import React, { useState, useMemo } from 'react';
import { usePixora } from '../context/PixoraContext';
import { ShieldCheck, Heart, MessageCircle, Share2, Bookmark, Home, Search, PlusSquare, Compass, Send, Bell, Settings, LogOut, HelpCircle, AlertTriangle, Lock, Globe, Sparkles } from 'lucide-react';

export const UserApp: React.FC = () => {
  const { currentUser, users, posts, stories, chats, notifications, theme, toggleTheme, setCurrentView, logoutUser } = usePixora();
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'add' | 'stories' | 'chat' | 'profile' | 'settings'>('feed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 min-h-screen border-x border-slate-200 dark:border-slate-800 flex flex-col shadow-sm relative pb-20">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-serif italic">
            Pixora
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('admin')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
            <button
              onClick={logoutUser}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4">
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="text-center py-10 text-slate-400 text-sm">
                Welcome to Pixora Feed, @{currentUser.username}! Share your first moment.
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={currentUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h2 className="font-bold text-base">{currentUser.fullName}</h2>
                  <p className="text-xs text-slate-500">@{currentUser.username}</p>
                  <p className="text-xs mt-1">{currentUser.bio}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              <h2 className="font-bold text-sm">Settings</h2>
              <button onClick={toggleTheme} className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold">
                Toggle Theme ({theme})
              </button>
            </div>
          )}
        </main>

        {/* Bottom Navbar */}
        <nav className="fixed bottom-0 max-w-xl md:max-w-2xl w-full z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 px-2 flex items-center justify-around">
          <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center ${activeTab === 'feed' ? 'text-pink-500 font-bold' : 'text-slate-500'}`}>
            <Home size={22} />
            <span className="text-[10px] mt-0.5">Feed</span>
          </button>
          <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center ${activeTab === 'search' ? 'text-pink-500 font-bold' : 'text-slate-500'}`}>
            <Search size={22} />
            <span className="text-[10px] mt-0.5">Explore</span>
          </button>
          <button onClick={() => setActiveTab('add')} className="flex flex-col items-center text-slate-500">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <PlusSquare size={22} />
            </div>
          </button>
          <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center ${activeTab === 'chat' ? 'text-pink-500 font-bold' : 'text-slate-500'}`}>
            <Send size={22} />
            <span className="text-[10px] mt-0.5">Chat</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-pink-500 font-bold' : 'text-slate-500'}`}>
            <img src={currentUser.avatar} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-[10px] mt-0.5">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
};
