import React, { useState, useEffect } from 'react';
import { Comment, User } from '../types';
import { getCommentsByEpisodeId } from '../services/mockApi';
import { ICONS, COMMENT_COLLAPSE_THRESHOLD } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface CommentComponentProps {
  comment: Comment;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  const [score, setScore] = useState(comment.score);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(score < COMMENT_COLLAPSE_THRESHOLD);

  const handleVote = (type: 'up' | 'down') => {
    if (voted === type) { // Un-voting
      setScore(type === 'up' ? score - 1 : score + 1);
      setVoted(null);
    } else if (voted) { // Switching vote
      setScore(type === 'up' ? score + 2 : score - 2);
      setVoted(type);
    } else { // New vote
      setScore(type === 'up' ? score + 1 : score - 1);
      setVoted(type);
    }
  };

  const scoreColor = score > 0 ? 'text-emerald-400' : score < 0 ? 'text-red-500' : 'text-zinc-400';

  return (
    <div className="flex space-x-4 mt-4 fade-in">
      <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
      <div className="flex-grow">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-bold text-purple-400">{comment.user.name}</span>
          <span className="text-zinc-500">{comment.timestamp}</span>
        </div>
        
        {isCollapsed ? (
          <div className="text-zinc-500 italic cursor-pointer text-sm my-2" onClick={() => setIsCollapsed(false)}>
            Комментарий скрыт из-за низкого рейтинга ({score}). Нажмите, чтобы посмотреть.
          </div>
        ) : (
          <p className="text-zinc-300 mt-1">{comment.content}</p>
        )}
        
        <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-400 font-medium">
          <div className="flex items-center space-x-1">
            <button onClick={() => handleVote('up')} className={`p-1 rounded-full hover:bg-zinc-700 hover:text-emerald-400 ${voted === 'up' ? 'text-emerald-500' : ''}`}>{ICONS.CHEVRON_UP}</button>
            <span className={`font-semibold ${scoreColor}`}>{score}</span>
            <button onClick={() => handleVote('down')} className={`p-1 rounded-full hover:bg-zinc-700 hover:text-red-500 ${voted === 'down' ? 'text-red-500' : ''}`}>{ICONS.CHEVRON_DOWN}</button>
          </div>
          <button className="hover:text-white">Ответить</button>
          <button className="hover:text-white">Пожаловаться</button>
          <button className="hover:text-white">Игнорировать</button>
        </div>

        {comment.replies && comment.replies.length > 0 && !isCollapsed && (
          <div className="pl-4 border-l-2 border-zinc-800 mt-4">
            {comment.replies.map(reply => <CommentComponent key={reply.id} comment={reply} />)}
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentSectionProps {
    episodeId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ episodeId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const { currentUser, openLoginModal, addToast } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            const data = await getCommentsByEpisodeId(episodeId);
            setComments(data);
            setLoading(false);
        };
        fetchComments();
    }, [episodeId]);

    const submitComment = () => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: `temp-${Date.now()}`,
            user: {
                id: currentUser.id,
                name: currentUser.nickname,
                avatar: currentUser.avatar
            },
            timestamp: 'Только что',
            content: newComment.trim(),
            score: 0,
            replies: []
        };
        
        setComments(prevComments => [comment, ...prevComments]);
        setNewComment('');
        addToast("Ваш комментарий опубликован!", 'success');
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    };

    if (loading) return <div className="text-center p-8">Загрузка комментариев...</div>

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-white">Обсуждение</h3>
             <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow disabled:opacity-60"
                    placeholder={currentUser ? "Присоединяйтесь к обсуждению... (Shift+Enter для новой строки)" : "Войдите, чтобы оставить комментарий."}
                    rows={4}
                    disabled={!currentUser}
                ></textarea>
                <div className="flex justify-end">
                    <button 
                        type="submit"
                        className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors transform hover:scale-105 disabled:bg-zinc-600 disabled:cursor-not-allowed disabled:scale-100"
                        disabled={!newComment.trim() || !currentUser}
                    >
                        Отправить
                    </button>
                </div>
            </form>
            {comments.map(comment => <CommentComponent key={comment.id} comment={comment} />)}
        </div>
    );
}