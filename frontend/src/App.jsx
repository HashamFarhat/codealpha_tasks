import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Feed from './components/Feed';
import Profile from './components/Profile';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState({ type: 'feed' });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user', err);
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setCurrentView({ type: 'feed' });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleProfileUpdate = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not logged in, show authentication panel
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-4">
            <span className="font-bold text-2xl tracking-wider">S</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            SocialPulse
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Connect, Share, and Interact in Real-time.
          </p>
        </div>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Wrap authenticated view inside SocketProvider
  return (
    <SocketProvider>
      <div className="min-h-screen bg-dark-950 text-slate-100 pb-12">
        <Navbar 
          currentUser={currentUser} 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          onLogout={handleLogout} 
        />
        
        <main className="max-w-4xl mx-auto px-4 mt-6">
          {currentView.type === 'feed' && (
            <Feed 
              currentUser={currentUser} 
              setCurrentView={setCurrentView} 
            />
          )}

          {currentView.type === 'profile' && (
            <Profile 
              userId={currentView.userId} 
              currentUser={currentUser} 
              onProfileUpdate={handleProfileUpdate} 
              setCurrentView={setCurrentView} 
            />
          )}
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;
