import React from 'react';
import { LogOut, Home, User as UserIcon, Activity } from 'lucide-react';

const Navbar = ({ currentUser, currentView, setCurrentView, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-4 py-3 mb-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setCurrentView({ type: 'feed' })}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-brand-600 p-2 rounded-xl text-white group-hover:bg-brand-500 transition-colors">
            <Activity size={20} className="animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            SocialPulse
          </span>
        </div>

        {/* Navigation Actions */}
        {currentUser && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView({ type: 'feed' })}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                currentView.type === 'feed'
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Feed"
            >
              <Home size={18} />
              <span className="hidden sm:inline text-sm font-medium">Feed</span>
            </button>

            <button
              onClick={() => setCurrentView({ type: 'profile', userId: currentUser._id })}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                currentView.type === 'profile' && currentView.userId === currentUser._id
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Profile"
            >
              <img 
                src={currentUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser.username)}`} 
                alt={currentUser.username}
                className="w-5 h-5 rounded-full border border-slate-700 object-cover"
              />
              <span className="hidden sm:inline text-sm font-medium">Profile</span>
            </button>

            <div className="w-px h-6 bg-slate-800"></div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
