import React, { useState } from 'react';
import { Heart, MessageSquare, Send, Calendar } from 'lucide-react';
import api from '../utils/api';

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const PostCard = ({ post, currentUser, onUserClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // Check if current user liked the post
  const isLiked = post.likes.includes(currentUser?._id);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.put(`/posts/${post._id}/like`);
      // Real-time update will be received via socket.io inside parent component
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setCommentText('');
      // Real-time update will be received via socket.io inside parent component
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 shadow-lg">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(post.user?.username || 'user')}`}
            alt={post.user?.username}
            className="w-10 h-10 rounded-full border border-slate-700 object-cover cursor-pointer hover:border-brand-500 transition-colors"
            onClick={() => onUserClick(post.user?._id)}
          />
          <div>
            <h4 
              className="font-semibold text-slate-100 hover:text-brand-400 cursor-pointer transition-colors"
              onClick={() => onUserClick(post.user?._id)}
            >
              {post.user?.username || 'anonymous'}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar size={12} />
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-slate-200 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-4 border border-slate-800 max-h-[400px] bg-slate-950/40">
          <img 
            src={post.image} 
            alt="Post media" 
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
            }}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 border-t border-slate-800/80 pt-3">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 text-sm font-medium transition-all ${
            isLiked 
              ? 'text-red-500 scale-105' 
              : 'text-slate-400 hover:text-red-400 hover:scale-105'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="transition-transform duration-300" />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 text-sm font-medium transition-all ${
            showComments 
              ? 'text-brand-400' 
              : 'text-slate-400 hover:text-brand-400'
          }`}
        >
          <MessageSquare size={18} />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comment Section Drawer */}
      {showComments && (
        <div className="mt-4 border-t border-slate-800/60 pt-4 space-y-4">
          
          {/* Write Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm outline-none placeholder-slate-500 transition-all text-slate-100"
            />
            <button
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
                  <img
                    src={comment.user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(comment.user?.username || 'user')}`}
                    alt={comment.user?.username}
                    className="w-7 h-7 rounded-full border border-slate-700 object-cover cursor-pointer"
                    onClick={() => onUserClick(comment.user?._id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 
                        className="text-xs font-semibold text-slate-200 hover:text-brand-400 cursor-pointer"
                        onClick={() => onUserClick(comment.user?._id)}
                      >
                        {comment.user?.username || 'anonymous'}
                      </h5>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-2">
              No comments yet. Be the first to join the conversation!
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default PostCard;
