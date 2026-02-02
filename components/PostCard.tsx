
import React, { useState, useRef } from 'react';
import { Post, PostType, User } from '../types';
import { Heart, MessageCircle, Share2, BarChart2, MoreHorizontal, Play, Pause, Volume2, Check, Info, Send, Crown, ShieldCheck, Shield, Zap, EyeOff, AlertTriangle, Eye, Ban, Trash2, Edit2, X, Save, UserPlus, UserMinus } from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string) => void;
  onFollow: (userId: string) => void;
  t: any;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment, onDelete, onEdit, onFollow, t }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [forceReveal, setForceReveal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isClip = post.type === PostType.CLIP;
  const isVideo = post.type === PostType.VIDEO;
  const isAudio = post.type === PostType.AUDIO;
  
  // ROLE CHECKS
  const isCreator = post.author.role === 'CREATOR';
  const isModerator = post.author.role === 'MODERATOR';
  const isOfficial = post.author.isOfficial;
  const isActive = post.author.isActive;
  const isBanned = post.author.isBanned;

  // PERMISSIONS
  const isAuthor = currentUser.id === post.author.id;
  const isAdmin = currentUser.role === 'ADMIN';
  const isFollowing = currentUser.following.includes(post.author.id);

  // HIDDEN LOGIC
  const isHidden = post.isHidden && !forceReveal;

  // Determine Badge Style
  let ringColor = 'border-[var(--border)]';
  if (isCreator) ringColor = 'border-[#FF0000] border-2';
  else if (isModerator) ringColor = 'border-[#5B8CFF] border-2';
  else if (isOfficial) ringColor = 'border-[#FFD700] border-2';
  else if (isActive) ringColor = 'border-[#10B981] border-2';
  else if (isBanned) ringColor = 'border-[#FF5B5B] border-2 opacity-50';

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://blend.social/p/${post.id}`);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSaveEdit = () => {
      onEdit(post.id, editContent);
      setIsEditing(false);
      setShowMenu(false);
  };

  return (
    <article className={`bg-[var(--bg-card)] border rounded-xl overflow-hidden hover:bg-[var(--bg-hover)] transition-colors mb-4 relative shadow-sm ${post.isFlagged ? 'border-[#FF5B5B]/50' : 'border-[var(--border)]'}`}>
      
      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-4 right-4 z-10 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={14} />
          {t.post.shareToast}
        </div>
      )}

      {/* Hidden Overlay */}
      {isHidden && (
         <div className="absolute inset-0 z-20 bg-[var(--bg-card)]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-[#FF5B5B]/10 rounded-full flex items-center justify-center mb-4">
               <EyeOff size={32} className="text-[#FF5B5B]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{t.post.hiddenTitle}</h3>
            <p className="text-[var(--text-muted)] max-w-sm mb-6">{t.post.hiddenBody}</p>
            <button 
              onClick={() => setForceReveal(true)}
              className="px-4 py-2 bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-main)] transition-colors flex items-center gap-2"
            >
               <Eye size={16} /> {t.post.reveal}
            </button>
         </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
               <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className={`w-10 h-10 rounded-full object-cover border ${ringColor} ${isBanned ? 'grayscale' : ''}`}
              />
              
              {/* Avatar Badges */}
              {isCreator && (
                 <div className="absolute -bottom-1 -right-1 bg-[#FF0000] rounded-full p-0.5" title="Platform Creator">
                    <Crown size={10} className="text-white fill-white" />
                 </div>
              )}
              {isModerator && (
                 <div className="absolute -bottom-1 -right-1 bg-[#5B8CFF] rounded-full p-0.5" title="Moderator">
                    <Shield size={10} className="text-white fill-white" />
                 </div>
              )}
              {isOfficial && !isCreator && !isModerator && (
                 <div className="absolute -bottom-1 -right-1 bg-[#FFD700] rounded-full p-0.5" title="Official Account">
                    <ShieldCheck size={10} className="text-black fill-black" />
                 </div>
              )}
               {isActive && !isCreator && !isModerator && !isOfficial && !isBanned && (
                 <div className="absolute -bottom-1 -right-1 bg-[#10B981] rounded-full p-0.5" title="Active User">
                    <Zap size={10} className="text-white fill-white" />
                 </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {isCreator && (
                  <span className="bg-[#FF0000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">
                    {t.profile.badges.creator}
                  </span>
                )}
                
                <span className={`text-[var(--text-main)] font-medium text-sm ${isBanned ? 'line-through opacity-50' : ''}`}>{post.author.name}</span>
                
                {/* Text Badges */}
                {isModerator && (
                   <span className="bg-[#5B8CFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ml-1" title="Moderator">
                     <Shield size={10} className="fill-white" /> {t.profile.badges.moderator}
                  </span>
                )}

                {isOfficial ? (
                  <span className="bg-[#FFD700] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ml-1" title="Official">
                     <ShieldCheck size={10} className="fill-black" /> {t.profile.badges.official}
                  </span>
                ) : post.author.verified && !isModerator && !isActive && !isCreator && !isBanned && (
                  <svg className="w-3 h-3 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}

                {isActive && !isBanned && (
                   <span className="bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ml-1" title="Active User">
                     <Zap size={10} className="fill-white" /> {t.profile.badges.active}
                  </span>
                )}

                {isBanned && (
                   <span className="bg-[#FF5B5B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ml-1" title="Banned User">
                     <Ban size={10} /> {t.profile.badges.banned}
                  </span>
                )}

              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] text-xs">{post.author.handle}</span>
                <span className="text-[var(--text-muted)] text-xs">• {post.timestamp}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {post.isFlagged && (
                <div className="text-[#FF5B5B] flex items-center gap-1 bg-[#FF5B5B]/10 px-2 py-1 rounded text-[10px] font-bold uppercase">
                   <AlertTriangle size={10} /> FLAGGED
                </div>
             )}
             {post.mixExplanation && (
                <div className="relative">
                   <button 
                    onClick={(e) => { e.stopPropagation(); setShowExplanation(!showExplanation); }}
                    className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                   >
                     <Info size={16} />
                   </button>
                   {showExplanation && (
                     <div className="absolute right-0 top-6 z-20 bg-[var(--bg-card)] text-[var(--text-main)] text-[10px] p-2 rounded-lg w-32 border border-[var(--primary)] shadow-xl animate-in fade-in zoom-in">
                       <p className="font-bold mb-1 text-[var(--primary)]">{t.feed.mixControls.why}</p>
                       {post.mixExplanation}
                     </div>
                   )}
                </div>
             )}
             <div className="relative">
                 <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1"
                 >
                   <MoreHorizontal size={20} />
                 </button>
                 {showMenu && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-30 animate-in fade-in zoom-in duration-200 overflow-hidden">
                        {!isAuthor && (
                            <button 
                                onClick={() => { onFollow(post.author.id); setShowMenu(false); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                            >
                                {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                {isFollowing ? t.post.actions.unfollow : t.post.actions.follow}
                            </button>
                        )}
                        {(isAuthor || isAdmin) && (
                            <>
                                {isAuthor && (
                                    <button 
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2 text-[var(--text-main)]"
                                    >
                                        <Edit2 size={16} /> {t.post.actions.edit}
                                    </button>
                                )}
                                <button 
                                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#FF5B5B]/10 text-[#FF5B5B] transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> {t.post.actions.delete}
                                </button>
                            </>
                        )}
                        {!isAuthor && !isAdmin && (
                            <div className="px-4 py-3 text-xs text-[var(--text-muted)] italic text-center">
                                No actions available
                            </div>
                        )}
                     </div>
                 )}
                 {showMenu && <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)}></div>}
             </div>
          </div>
        </div>

        {/* Text Content / Editing Mode */}
        {isEditing ? (
            <div className="mb-3">
                <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
                    rows={4}
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        {t.post.actions.cancel}
                    </button>
                    <button 
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs font-bold"
                    >
                        {t.post.actions.save}
                    </button>
                </div>
            </div>
        ) : (
            post.content && (
              <p className="text-[var(--text-main)] text-sm md:text-base leading-relaxed mb-3 whitespace-pre-wrap">
                {post.content}
              </p>
            )
        )}

        {/* Audio Content */}
        {isAudio && post.mediaUrl && (
          <div className="mb-3 bg-[var(--bg-main)] rounded-xl p-3 flex items-center gap-4 border border-[var(--border)]">
             <audio ref={audioRef} src={post.mediaUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
             <button 
               onClick={toggleAudio}
               className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:scale-105 transition-transform"
             >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
             </button>
             <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                   <span className="font-bold text-[var(--text-main)]">Voice Note</span>
                   <span>{post.audioDuration || '0:00'}</span>
                </div>
                <div className="h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
                   <div className={`h-full bg-[var(--primary)] ${isPlaying ? 'animate-[width_2s_linear_infinite]' : 'w-0'}`} style={{width: isPlaying ? '100%' : '0%'}}></div>
                </div>
             </div>
             <Volume2 size={18} className="text-[var(--text-muted)]" />
          </div>
        )}

        {/* Visual Media Content */}
        {!isAudio && post.mediaUrl && (
          <div className={`relative rounded-lg overflow-hidden border border-[var(--border)] mb-3 ${isClip ? 'aspect-[9/16] max-w-[280px]' : 'aspect-video w-full'}`}>
             {isVideo || isClip ? (
               <video src={post.mediaUrl} className="w-full h-full object-cover" controls playsInline />
             ) : (
                <img 
                  src={post.mediaUrl} 
                  alt="Post content" 
                  className="w-full h-full object-cover"
                />
             )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between text-[var(--text-muted)] mt-2 border-t border-[var(--border)] pt-3">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
          >
            <Heart size={18} className={post.isLiked ? 'fill-pink-500 stroke-pink-500' : 'group-hover:stroke-pink-500'} />
            <span className="text-xs">
              {post.likes > 1000 ? (post.likes/1000).toFixed(1) + 'k' : post.likes}
            </span>
          </button>
          
          <button onClick={handleToggleComments} className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'}`}>
            <MessageCircle size={18} className={showComments ? 'stroke-[var(--primary)]' : 'group-hover:stroke-[var(--primary)]'} />
            <span className="text-xs">{post.commentsCount}</span>
          </button>
          
          <button onClick={handleShare} className="flex items-center gap-2 hover:text-green-500 transition-colors group">
            <Share2 size={18} className="group-hover:stroke-green-500" />
            <span className="text-xs">{post.shares}</span>
          </button>
          
          <button className="flex items-center gap-2 hover:text-[var(--text-main)] transition-colors group">
            <BarChart2 size={18} className="group-hover:stroke-[var(--text-main)]" />
            <span className="text-xs">{post.views > 1000 ? (post.views/1000).toFixed(1) + 'k' : post.views}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
           <div className="mt-4 pt-4 border-t border-[var(--border)] animate-in slide-in-from-top-2 fade-in">
              <h4 className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase">{t.post.comments}</h4>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2">
                       <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                       <div className="bg-[var(--bg-main)] p-2.5 rounded-xl rounded-tl-none flex-1 border border-[var(--border)]">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-xs font-bold text-[var(--text-main)]">{comment.author.name}</span>
                             <span className="text-[10px] text-[var(--text-muted)]">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">{comment.text}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[var(--text-muted)] text-sm py-2 italic">No comments yet</p>
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleSubmitComment} className="flex items-center gap-2 relative">
                 <input 
                   type="text" 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   placeholder={t.post.writeComment}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-colors"
                 />
                 <button 
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-1.5 p-1.5 bg-[var(--primary)] rounded-full text-white disabled:opacity-0 disabled:scale-0 transition-all"
                 >
                   <Send size={14} />
                 </button>
              </form>
           </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
