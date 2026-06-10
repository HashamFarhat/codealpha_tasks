import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import PostCard from './PostCard';
import api from '../utils/api';
import { Edit3, Check, X, FileText, Calendar, Mail } from 'lucide-react';

const Profile = ({ userId, currentUser, onProfileUpdate, setCurrentView }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const socket = useSocket();
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/profiles/${userId}`);
        setProfileData(data);
        setBio(data.user.bio || '');
        setAvatar(data.user.avatar || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Listen for real-time WebSocket updates on profile posts
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      if (newPost.user._id !== userId) return;
      setProfileData((prev) => {
        if (!prev) return null;
        if (prev.posts.some(p => p._id === newPost._id)) return prev;
        return {
          ...prev,
          posts: [newPost, ...prev.posts],
        };
      });
    };

    const handlePostUpdated = (updatedPost) => {
      setProfileData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          posts: prev.posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
        };
      });
    };

    socket.on('newPost', handleNewPost);
    socket.on('postUpdated', handlePostUpdated);

    return () => {
      socket.off('newPost', handleNewPost);
      socket.off('postUpdated', handlePostUpdated);
    };
  }, [socket, userId]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      const { data } = await api.put('/profiles', { bio, avatar });
      // Update local view data
      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          bio: data.bio,
          avatar: data.avatar,
        },
      }));
      // Update parent session info
      onProfileUpdate(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel rounded-2xl p-6 border border-slate-800 text-center">
        <p className="text-red-400 text-sm font-semibold mb-4">{error}</p>
        <button 
          onClick={() => setCurrentView({ type: 'feed' })}
          className="bg-slate-800 text-slate-200 px-4 py-2 rounded-xl text-xs"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const { user, posts } = profileData;

  return (
    <div className="max-w-xl mx-auto px-4 pb-12 space-y-6">
      
      {/* Profile Overview Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Glow effect background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full filter blur-2xl pointer-events-none"></div>

        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username)}`}
              alt={user.username}
              className="w-20 h-20 rounded-2xl border-2 border-brand-500/30 object-cover"
            />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-100">{user.username}</h2>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mx-auto sm:mx-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-brand-400 border border-slate-700/60 hover:border-brand-500/30 transition-all active:scale-95"
                  >
                    <Edit3 size={13} />
                    Edit Profile
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-300 italic">
                {user.bio ? `"${user.bio}"` : 'No bio added yet.'}
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Profile Form Edit Mode */
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="font-bold text-sm text-brand-400 uppercase tracking-wide">Edit Profile Settings</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setError(''); }}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="Paste image URL (Unsplash or SVG link)..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Profile Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows="3"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-200 resize-none"
                />
                <p className="text-[10px] text-slate-500 text-right">{160 - bio.length} characters left</p>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {saveLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Check size={12} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User's Personal Feed */}
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850 pb-2">
        <FileText size={14} className="text-brand-400" />
        <span>Posts Published ({posts.length})</span>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onUserClick={(id) => setCurrentView({ type: 'profile', userId: id })}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-500 text-xs py-10">
          This user has not posted anything yet.
        </div>
      )}

    </div>
  );
};

export default Profile;
