import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, Send, User } from 'lucide-react';

interface CommentsProps {
  signalId: string;
}

export default function Comments({ signalId }: CommentsProps) {
  const { user } = useAuth();
  const { comments, addComment } = useComments(signalId);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setSending(true);
    await addComment(newComment, user.email, user.user_metadata?.name || user.email.split('@')[0]);
    setNewComment('');
    setSending(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <MessageCircle size={18} className="text-purple-400" />
        <h3 className="font-bold">Signal Discussion</h3>
        <span className="text-xs text-gray-500 ml-auto">{comments.length} comments</span>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to discuss this signal!</p>
        )}
        
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-purple-300">{comment.user_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your analysis or ask a question..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Send size={14} /> {sending ? '...' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-500">
          Login to join the discussion
        </div>
      )}
    </div>
  );
}