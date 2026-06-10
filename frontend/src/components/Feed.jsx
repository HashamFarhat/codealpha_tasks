import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import PostCard from './PostCard';
import api from '../utils/api';
import { Image, Send, MessageSquare, Compass, AlertCircle } from 'lucide-react';

const Feed = ({ currentUser, setCurrentView }) => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  const socket = useSocket();

  // Fetch posts initially
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load news feed.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Listen for real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      setPosts((prevPosts) => {
        // Prevent duplicate posts
        if (prevPosts.some(p => p._id === newPost._id)) return prevPosts;
        return [newPost, ...prevPosts];
      });
    };

    const handlePostUpdated = (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
    };

    socket.on('newPost', handleNewPost);
    socket.on('postUpdated', handlePostUpdated);

    return () => {
      socket.off('newPost', handleNewPost);
      socket.off('postUpdated', handlePostUpdated);
    };
  }, [socket]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image.trim()) return;

    setSubmitLoading(true);
    setError('');

    try {
      await api.post('/posts', { content, image });
      setContent('');
      setImage('');
      setShowImageInput(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-12 space-y-6">
      
      {/* Create Post Form */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div className="flex gap-3">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser?.username || 'user')}`}
              alt={currentUser?.username}
              className="w-10 h-10 rounded-full border border-slate-700 object-cover cursor-pointer"
              onClick={() => setCurrentView({ type: 'profile', userId: currentUser._id })}
            />
            <textarea
              required={!image.trim()}
              placeholder={`What's on your mind, ${currentUser?.username}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="3"
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none resize-none border-none py-1 focus:ring-0"
            />
          </div>

          {/* Optional Image URL Input */}
          {showImageInput && (
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
              <Image size={18} className="text-brand-400 shrink-0" />
              <input
                type="url"
                placeholder="Paste image URL here (e.g. Unsplash URL)..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-slate-200 placeholder-slate-600"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold ${
                showImageInput 
                  ? 'bg-brand-600/20 text-brand-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Image size={16} />
              <span>{showImageInput ? 'Cancel Image' : 'Add Image'}</span>
            </button>

            <button
              type="submit"
              disabled={submitLoading || (!content.trim() && !image.trim())}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-xs font-semibold shadow-lg hover:shadow-brand-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              {submitLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Post</span>
                  <Send size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Global Feed Section */}
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850 pb-2">
        <Compass size={14} className="text-brand-400" />
        <span>Global Stream Feed</span>
      </div>

      {/* Feed Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching global streams...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onUserClick={(userId) => setCurrentView({ type: 'profile', userId })}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center space-y-3">
          <MessageSquare className="mx-auto text-slate-600" size={32} />
          <h4 className="font-semibold text-slate-300">No posts in feed yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Be the first person to share a message or image on the feed above!
          </p>
        </div>
      )}

    </div>
  );
};

export default Feed;
