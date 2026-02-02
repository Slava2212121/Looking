
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Bell, 
  User as UserIcon, 
  PenTool, 
  Flame, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Palette,
  ChevronRight,
  Heart,
  Hash,
  ShieldAlert,
  AlertTriangle,
  Moon,
  Sun,
  Crown,
  ShieldCheck,
  Zap,
  Activity,
  Users,
  FileText,
  Globe,
  Key,
  Laptop,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  UserMinus,
  Check
} from 'lucide-react';
import { CURRENT_USER, MOCK_POSTS, MOCK_CHATS, TRENDS } from './constants';
import { FeedMode, Post, PostType, Language, Chat, Message, MessageType, User, Comment, Theme } from './types';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import EditProfileModal from './components/EditProfileModal';
import ChatInterface from './components/ChatInterface';
import AuthScreen from './components/AuthScreen';
import MixControls from './components/MixControls';
import LegalModal from './components/LegalModal';
import AdminPanel from './components/AdminPanel';
import { TRANSLATIONS } from './translations';
import { moderateContent } from './utils/aiModeration';

type ViewState = 'HOME' | 'CHATS' | 'PROFILE' | 'NOTIFICATIONS' | 'EXPLORE' | 'SETTINGS' | 'ADMIN';

const APP_VERSION = 'v1.0';

// Security Configuration
const SECURITY_CONFIG = {
  limits: {
    POST: { max: 3, window: 60000 },
    LIKE: { max: 10, window: 10000 },
    MESSAGE: { max: 15, window: 60000 },
    COMMENT: { max: 5, window: 30000 }
  },
  maxViolations: 3,
  maxInputLength: 500
};

const SESSION_KEY = 'blend_session_v1';

const Logo = () => (
  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[var(--primary)]/20">
    B
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [feedMode, setFeedMode] = useState<FeedMode>(FeedMode.MIX);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('DARK');
  
  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Real Stats Initialization
  const [stats, setStats] = useState({
    totalUsers: 1, // Only the creator exists
    totalPosts: 0,
    onlineUsers: 1
  });

  // Registration ID Logic: Start from 2 because CURRENT_USER is 1
  const [nextStaticId, setNextStaticId] = useState(2);
  
  // Official Status Application
  const [hasAppliedOfficial, setHasAppliedOfficial] = useState(false);

  // Email Tracking for Uniqueness (Mocking Backend)
  const [registeredEmails, setRegisteredEmails] = useState<string[]>([
     'slava_kolosov11@mail.ru' // Register creator email
  ]);
  
  // Legal Modal State
  const [activeLegalDoc, setActiveLegalDoc] = useState<'TERMS' | 'PRIVACY' | null>(null);

  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  
  // Mix Algorithm State
  const [mixValues, setMixValues] = useState({
    friendsVsPopular: 50,
    textVsVideo: 50
  });

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isSecurityLocked, setIsSecurityLocked] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const rateLimitTracker = useRef<Record<string, number[]>>({
    POST: [],
    LIKE: [],
    MESSAGE: [],
    COMMENT: []
  });
  const violationCount = useRef(0);

  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('blend_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  // --- AUTO LOGIN LOGIC ---
  useEffect(() => {
    // Check local storage (persistent) first, then session storage (temporary)
    const storedSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    
    if (storedSession) {
      try {
        const { user } = JSON.parse(storedSession);
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log(`[Auto-Login] Welcome back, ${user.name}`);
      } catch (error) {
        console.error("Session parse error", error);
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // Live Stats Simulation (Very slow growth for realism now)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real user fluctuation (just 1 user mostly)
      setStats(prev => ({
        ...prev,
        onlineUsers: Math.max(1, prev.onlineUsers + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)) 
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('blend_lang', lang);
  }, [lang]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.toLowerCase());
  }, [theme]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[lang];

  // --- Security Functions ---
  const checkRateLimit = (actionType: keyof typeof SECURITY_CONFIG.limits): boolean => {
    const now = Date.now();
    const config = SECURITY_CONFIG.limits[actionType];
    const timestamps = rateLimitTracker.current[actionType];
    const activeTimestamps = timestamps.filter(t => now - t < config.window);
    rateLimitTracker.current[actionType] = activeTimestamps;

    if (activeTimestamps.length >= config.max) {
      handleSecurityViolation(`Rate limit exceeded for ${actionType}. Please slow down.`);
      return false;
    }
    rateLimitTracker.current[actionType].push(now);
    return true;
  };

  const handleSecurityViolation = (reason: string) => {
    violationCount.current += 1;
    setSecurityWarning(reason);
    setTimeout(() => setSecurityWarning(null), 3000);
    if (violationCount.current >= SECURITY_CONFIG.maxViolations) {
      setIsSecurityLocked(true);
    }
  };

  const sanitizeInput = (input: string): string | null => {
    if (!input) return null;
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > SECURITY_CONFIG.maxInputLength) {
      handleSecurityViolation(`Input too long. Max ${SECURITY_CONFIG.maxInputLength} chars.`);
      return null;
    }
    return trimmed.replace(/<[^>]*>?/gm, '');
  };

  // --- Handlers ---
  const handleLogin = (userData?: { name: string; handle: string; email: string }, rememberMe: boolean = false) => {
    let finalUser: User;

    if (userData) {
      if (userData.email === 'slava_kolosov11@mail.ru') {
         // Creator logging in
         finalUser = CURRENT_USER;
      } else {
        // New Registration
        const newId = nextStaticId;
        setNextStaticId(prev => prev + 1);
        setRegisteredEmails(prev => [...prev, userData.email]);
        
        // Update stats
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));

        finalUser = {
          ...currentUser,
          id: `u_${Date.now()}`,
          staticId: newId,
          name: userData.name,
          handle: userData.handle,
          role: 'USER',
          verified: false,
          isOfficial: false,
          isActive: false,
          isBanned: false,
          followers: [],
          following: [],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
        };
      }
    } else {
      finalUser = CURRENT_USER;
    }

    setCurrentUser(finalUser);
    setIsAuthenticated(true);
    setCurrentView('HOME');

    const sessionData = JSON.stringify({ user: finalUser });
    
    // Store in Local Storage if "Remember Me" is checked, otherwise Session Storage
    if (rememberMe) {
        localStorage.setItem(SESSION_KEY, sessionData);
        sessionStorage.removeItem(SESSION_KEY); // clean up other storage
    } else {
        sessionStorage.setItem(SESSION_KEY, sessionData);
        localStorage.removeItem(SESSION_KEY); // clean up other storage
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedChatId(null);
    setIsSecurityLocked(false);
    violationCount.current = 0;
    
    // Clear both storages
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    setPosts(prev => prev.map(p => 
      p.author.id === currentUser.id 
        ? { ...p, author: { ...p.author, ...updates } } 
        : p
    ));

    // Update persistent session if it exists
    const sessionData = JSON.stringify({ user: updatedUser });
    if (localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, sessionData);
    } else if (sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, sessionData);
    }
  };

  const handleRequestOfficial = () => {
     setHasAppliedOfficial(true);
     setTimeout(() => {
        handleUpdateProfile({ isOfficial: true });
     }, 2000);
  };

  const handleCreatePost = (content: string, type: PostType, mediaUrl?: string, audioDuration?: string) => {
    if (!checkRateLimit('POST')) return;
    
    const cleanContent = sanitizeInput(content);
    if (!cleanContent && !mediaUrl && !audioDuration) {
       setSecurityWarning("Content cannot be empty");
       return;
    }

    // --- AI MODERATION CHECK ---
    const moderation = moderateContent(cleanContent || '');
    if (moderation.flagged) {
        setSecurityWarning(t.post.hiddenBody); // Use translation
    }

    const newPost: Post = {
      id: `p${Date.now()}`,
      author: currentUser,
      content: cleanContent || '',
      type,
      mediaUrl,
      audioDuration,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
      shares: 0,
      views: 0,
      popularityScore: 0,
      mixExplanation: 'Your new post',
      
      // Moderation Flags
      isFlagged: moderation.flagged,
      isHidden: moderation.flagged,
      flagReason: moderation.reason
    };
    setPosts([newPost, ...posts]);
    setStats(prev => ({ ...prev, totalPosts: prev.totalPosts + 1 }));
  };

  // POST ACTIONS
  const handleLike = (id: string) => {
    if (!checkRateLimit('LIKE')) return;
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        const newLikes = isLiked ? post.likes + 1 : Math.max(0, post.likes - 1);
        return { 
          ...post, 
          isLiked,
          likes: newLikes,
          popularityScore: (post.popularityScore || 0) + (isLiked ? 10 : -10)
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!checkRateLimit('COMMENT')) return;
    const cleanText = sanitizeInput(text);
    if (!cleanText) return;

    // Optional: Moderate comments too
    const moderation = moderateContent(cleanText);
    if (moderation.flagged) {
       setSecurityWarning('Comment blocked by AI: ' + moderation.reason);
       return;
    }

    const newComment: Comment = {
      id: `cm${Date.now()}`,
      author: currentUser,
      text: cleanText,
      timestamp: 'Just now'
    };

    setPosts(prev => prev.map(post => {
       if (post.id === postId) {
         return {
           ...post,
           comments: [newComment, ...post.comments],
           commentsCount: post.commentsCount + 1,
           popularityScore: (post.popularityScore || 0) + 20
         };
       }
       return post;
    }));
  };

  const handleDeletePost = (id: string) => {
      setPosts(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({...prev, totalPosts: Math.max(0, prev.totalPosts - 1)}));
  };

  const handleEditPost = (id: string, newContent: string) => {
      setPosts(prev => prev.map(p => {
          if (p.id === id) {
              return { ...p, content: newContent };
          }
          return p;
      }));
  };

  const handleFollowToggle = (targetUserId: string) => {
      // Mock follow logic: updates current user's following list
      const isFollowing = currentUser.following.includes(targetUserId);
      let newFollowing = [...currentUser.following];
      
      if (isFollowing) {
          newFollowing = newFollowing.filter(id => id !== targetUserId);
      } else {
          newFollowing.push(targetUserId);
      }

      handleUpdateProfile({ following: newFollowing });
  };

  const handleMixChange = (key: 'friendsVsPopular' | 'textVsVideo', value: number) => {
    setMixValues(prev => ({ ...prev, [key]: value }));
  };

  const getSortedPosts = () => {
    // 1. Filter out hidden posts unless user is Admin or Owner
    const viewablePosts = posts.filter(p => {
        if (!p.isHidden) return true;
        if (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR') return true;
        if (p.author.id === currentUser.id) return true;
        return false;
    });

    return [...viewablePosts].sort((a, b) => b.id.localeCompare(a.id));
  };

  const handleSendMessage = (chatId: string, text: string, type: MessageType = MessageType.TEXT, audioDuration?: string) => {
    if (!checkRateLimit('MESSAGE')) return;
    let cleanText = text;
    if (type === MessageType.TEXT) {
      const sanitized = sanitizeInput(text);
      if (!sanitized) return;
      cleanText = sanitized;
    }
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text: type === MessageType.TEXT ? cleanText : undefined,
      audioDuration,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: type === MessageType.AUDIO ? '🎤 Voice Message' : cleanText,
          lastMessageTime: 'Just now'
        };
      }
      return chat;
    }));
  };

  // --- ADMIN ACTIONS ---
  const handleBanUser = (userId: string) => {
     // 1. Update user state (simulated by updating author info in all posts)
     const isBanning = !posts.find(p => p.author.id === userId)?.author.isBanned;

     setPosts(prev => prev.map(p => {
        if (p.author.id === userId) {
           return {
              ...p,
              isHidden: isBanning, // Hide posts if banned
              author: {
                 ...p.author,
                 isBanned: isBanning
              }
           }
        }
        return p;
     }));
     
     // Update current user if self-ban (unlikely but possible in test)
     if (userId === currentUser.id) {
        setCurrentUser(prev => ({ ...prev, isBanned: isBanning }));
     }
  };

  const handleDismissReport = (postId: string) => {
     setPosts(prev => prev.map(p => {
        if (p.id === postId) {
           return { ...p, isFlagged: false, isHidden: false, flagReason: undefined };
        }
        return p;
     }));
  };


  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full ${
        active 
          ? 'bg-[var(--bg-hover)] text-[var(--text-main)] font-medium border-l-4 border-[var(--primary)]' 
          : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] border-l-4 border-transparent'
      }`}
    >
      <Icon size={24} className={active ? 'text-[var(--primary)]' : ''} />
      <span className="text-lg">{label}</span>
    </button>
  );

  const renderExploreView = () => {
    const filteredPosts = posts.filter(post => 
      !post.isHidden && // Don't show hidden posts in explore
      (post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="max-w-[600px] mx-auto w-full min-h-screen">
        <div className="sticky top-16 lg:top-0 bg-[var(--bg-main)]/90 backdrop-blur-md z-30 px-4 py-4 border-b border-[var(--border)]">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.explore.search} 
                className="w-full bg-[var(--bg-hover)] border border-[var(--border)] rounded-full py-2.5 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors"
                autoFocus
              />
           </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-[var(--text-main)]">
            {searchQuery ? `Results for "${searchQuery}"` : t.explore.forYou}
          </h2>
          <div className="grid grid-cols-2 gap-4">
             {filteredPosts.length > 0 ? (
               filteredPosts.map(post => (
                 <div key={`exp-${post.id}`} className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-[var(--border)] bg-[var(--bg-card)]">
                   {/* Post rendering logic */}
                   {post.mediaUrl && <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />}
                 </div>
               ))
             ) : (
               <div className="col-span-2 text-center text-[var(--text-muted)] py-8">
                 {searchQuery ? "No results found" : "It's quiet here. Be the first to post!"}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileView = () => {
    // For now, only viewing self. In a real app, this would take a userId param.
    const userToView = currentUser; 
    
    const userPosts = posts.filter(p => p.author.id === userToView.id);
    const isCreator = userToView.role === 'CREATOR';
    const isModerator = userToView.role === 'MODERATOR';
    const isOfficial = userToView.isOfficial;
    const isActive = userToView.isActive;
    
    // Determine ring color
    let ringColor = '';
    if (isCreator) ringColor = 'ring-2 ring-red-500';
    else if (isModerator) ringColor = 'ring-2 ring-blue-500';
    else if (isOfficial) ringColor = 'ring-2 ring-yellow-400';
    else if (isActive) ringColor = 'ring-2 ring-green-500';

    return (
      <div className="max-w-[600px] mx-auto w-full">
        <div className="sticky top-16 lg:top-0 bg-[var(--bg-main)]/90 backdrop-blur-md z-30 px-4 py-3 border-b border-[var(--border)] flex items-center gap-4">
          <h2 className="text-lg font-bold text-[var(--text-main)]">{userToView.name}</h2>
        </div>
        
        {/* Banner Section */}
        <div className="relative h-32 bg-[var(--bg-hover)] overflow-hidden">
            {userToView.banner ? (
                <img src={userToView.banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-[var(--border)] to-[var(--bg-hover)]"></div>
            )}
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative -mt-10 mb-3 flex justify-between items-end">
             <div className="relative">
               <img src={userToView.avatar} alt="" className={`w-20 h-20 rounded-full border-4 border-[var(--bg-main)] object-cover ${ringColor}`} />
               {isCreator && (
                  <div className="absolute bottom-0 right-0 bg-red-500 p-1 rounded-full border border-[var(--bg-main)]">
                    <Crown size={12} className="text-white fill-white" />
                  </div>
               )}
                {isModerator && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full border border-[var(--bg-main)]">
                    <Shield size={12} className="text-white fill-white" />
                  </div>
               )}
                {isActive && !isCreator && !isModerator && !isOfficial && (
                  <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border border-[var(--bg-main)]">
                    <Zap size={12} className="text-white fill-white" />
                  </div>
               )}
             </div>
             <div className="flex items-center gap-2">
               <div className="bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm" title={`User ID: #${userToView.staticId}`}>
                  <Hash size={14} className="text-[var(--primary)]" />
                  <span className="text-[var(--text-main)] font-mono text-sm font-bold">{String(userToView.staticId).padStart(4, '0')}</span>
               </div>
               {userToView.id === currentUser.id ? (
                    <button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] border border-[var(--border)] px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        {t.profile.edit}
                    </button>
               ) : (
                    // Logic to follow other users would go here, currently viewing self mostly
                    <button className="bg-[var(--primary)] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                        Follow
                    </button>
               )}
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-main)]">{userToView.name}</h1>
            {isCreator && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">{t.profile.badges.creator}</span>}
          </div>
          <p className="text-[var(--text-muted)] text-sm mb-2">{userToView.handle}</p>
          {userToView.bio && <p className="text-[var(--text-muted)] text-sm mb-4">{userToView.bio}</p>}
          
          <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-4">
             <div className="flex gap-1">
               <span className="text-[var(--text-main)] font-bold">{userToView.following.length}</span>
               <span className="text-[var(--text-muted)]">{t.profile.following}</span>
             </div>
             <div className="flex gap-1">
               <span className="text-[var(--text-main)] font-bold">{userToView.followers.length}</span>
               <span className="text-[var(--text-muted)]">{t.profile.followers}</span>
             </div>
          </div>
          
          <h3 className="font-bold text-[var(--text-main)] mb-4 text-lg">{t.profile.posts}</h3>
          
          {userPosts.length > 0 ? (
             userPosts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    onLike={handleLike} 
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onFollow={handleFollowToggle}
                    t={t} 
                />
             ))
          ) : (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] border-dashed">
               <p className="text-[var(--text-muted)]">{t.profile.noPosts}</p>
               {userToView.id === currentUser.id && (
                <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="mt-2 text-[var(--primary)] text-sm font-medium hover:underline"
                    >
                    {t.create.title}
                </button>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivityView = () => (
    <div className="max-w-[600px] mx-auto w-full">
      <div className="sticky top-16 lg:top-0 bg-[var(--bg-main)]/90 backdrop-blur-md z-30 px-4 py-4 border-b border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.activity.title}</h2>
      </div>
      <div className="p-4 space-y-4">
         {/* No activity for now */}
         <div className="text-center text-[var(--text-muted)] py-10">
            <Bell size={40} className="mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
         </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="max-w-[600px] mx-auto w-full pb-10">
      <div className="sticky top-16 lg:top-0 bg-[var(--bg-main)]/90 backdrop-blur-md z-30 px-4 py-4 border-b border-[var(--border)]">
        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.settings.title}</h2>
      </div>
      
      <div className="p-4 space-y-6">
         {/* Settings content remains mostly same, simplified for brevity in this update block... */}
         {/* ACCOUNT SECTION */}
         <section className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">{t.settings.account}</h3>
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
            >
               <div className="flex items-center gap-3">
                 <UserIcon size={20} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                 <span className="text-[var(--text-main)] font-medium">{t.settings.account}</span>
               </div>
               <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </button>
         </section>
        
         {/* SECURITY SECTION */}
         <section className="space-y-2">
           <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 flex items-center gap-2">
              <Shield size={12} /> {t.settings.security}
           </h3>
           <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              {/* 2FA */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-hover)] rounded-lg text-[var(--primary)]">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-[var(--text-main)] font-medium text-sm">{t.settings.twoFactor}</p>
                       <p className="text-[var(--text-muted)] text-xs">Recommended</p>
                    </div>
                 </div>
                 <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className="transition-transform active:scale-95">
                    {twoFactorEnabled ? <ToggleRight size={28} className="text-[var(--primary)]"/> : <ToggleLeft size={28} className="text-[var(--text-muted)]"/>}
                 </button>
              </div>
              
              {/* Change Password */}
              <button 
                onClick={() => setSecurityWarning(t.auth.codeSent)}
                className="w-full p-4 border-b border-[var(--border)] flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors text-left"
              >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)]">
                       <Key size={20} />
                    </div>
                    <span className="text-[var(--text-main)] font-medium text-sm">{t.settings.changePassword}</span>
                 </div>
                 <ChevronRight size={16} className="text-[var(--text-muted)]" />
              </button>

              {/* Active Sessions */}
              <div className="p-4">
                 <h4 className="text-[var(--text-muted)] text-[10px] font-bold uppercase mb-3">{t.settings.activeSessions}</h4>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <Laptop size={20} className="text-[var(--primary)]" />
                       <div className="flex-1">
                          <p className="text-[var(--text-main)] text-sm font-medium">Windows PC - Chrome</p>
                          <p className="text-[var(--text-muted)] text-xs">Moscow, Russia • {t.settings.activeNow}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         </section>

         {/* LANGUAGE SECTION */}
         <section className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 flex items-center gap-2">
               <Globe size={12} /> Language
            </h3>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-2 flex gap-2">
               {(['en', 'ru', 'zh'] as Language[]).map((l) => (
                  <button
                     key={l}
                     onClick={() => setLang(l)}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${
                        lang === l 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                     }`}
                  >
                     {l}
                  </button>
               ))}
            </div>
         </section>

         {/* APPEARANCE SECTION */}
         <section className="space-y-2">
           <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">{t.settings.appearance}</h3>
           <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
              <div className="flex items-center gap-3 mb-3 text-[var(--text-muted)]">
                <Palette size={20} />
                <span className="font-bold text-sm uppercase tracking-wide">{t.settings.themes}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                 onClick={() => setTheme('DARK')}
                 className={`py-3 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${theme === 'DARK' ? 'bg-[#0B0B10] border-[#5B8CFF] text-white shadow-[0_0_15px_rgba(91,140,255,0.2)]' : 'bg-[#0B0B10] border-[#202030] text-gray-500 hover:border-[#303040] hover:text-gray-300'}`}
                >
                  <Moon size={20} />
                  {t.settings.dark}
                </button>
                <button 
                 onClick={() => setTheme('LIGHT')}
                 className={`py-3 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${theme === 'LIGHT' ? 'bg-[#F0F2F5] border-[#1877F2] text-black shadow-[0_0_15px_rgba(24,119,242,0.2)]' : 'bg-[#F0F2F5] border-[#E4E6EB] text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                >
                  <Sun size={20} />
                  {t.settings.light}
                </button>
                <button 
                 onClick={() => setTheme('GOLD')}
                 className={`py-3 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${theme === 'GOLD' ? 'bg-[#000000] border-[#FFD700] text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-[#000000] border-[#333333] text-[#888888] hover:border-[#FFD700]/50 hover:text-[#FFD700]'}`}
                >
                  <Crown size={20} />
                  {t.settings.gold}
                </button>
              </div>
           </div>
         </section>
         
         {/* STATUS & ACTIONS */}
         <section className="space-y-4 pt-2">
            <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 p-4 text-[#FF5B5B] bg-[#FF5B5B]/10 hover:bg-[#FF5B5B]/20 border border-[#FF5B5B]/20 rounded-xl transition-colors font-medium"
            >
               <LogOut size={20} />
               {t.settings.logout}
            </button>
         </section>

      </div>
    </div>
  );

  // --- Auth Check ---
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} existingEmails={registeredEmails} lang={lang} setLang={setLang} t={t} Logo={Logo} />;
  }

  // --- Security Lockout View ---
  if (isSecurityLocked) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF5B5B]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="relative z-10 bg-[var(--bg-card)] border border-[#FF5B5B]/30 p-10 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-[#FF5B5B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-[#FF5B5B]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-4">Security Lockdown</h1>
          <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
            Your account has been temporarily flagged.
          </p>
          <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] py-3 rounded-xl font-bold transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--primary)] selection:text-white relative transition-colors duration-300">
      
      {/* Security Toast */}
      {securityWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-[#FF5B5B] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in font-medium max-w-md w-full text-center justify-center">
          <AlertTriangle size={20} className="fill-white stroke-[#FF5B5B] shrink-0" />
          <span className="text-sm">{securityWarning}</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border)] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)]">Blend</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-main)]">
          <Menu size={28} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto flex">
        
        {/* Left Sidebar (Navigation) */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-[var(--bg-main)] border-r border-[var(--border)] p-4 flex flex-col z-50 transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-8 px-4 mt-2">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)]">
                Blend
              </h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-[var(--text-muted)]">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem icon={Home} label={t.nav.feed} active={currentView === 'HOME'} onClick={() => { setCurrentView('HOME'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={Search} label={t.nav.explore} active={currentView === 'EXPLORE'} onClick={() => { setCurrentView('EXPLORE'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={MessageSquare} label={t.nav.chats} active={currentView === 'CHATS'} onClick={() => { setCurrentView('CHATS'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={Bell} label={t.nav.activity} active={currentView === 'NOTIFICATIONS'} onClick={() => { setCurrentView('NOTIFICATIONS'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={UserIcon} label={t.nav.profile} active={currentView === 'PROFILE'} onClick={() => { setCurrentView('PROFILE'); setIsMobileMenuOpen(false); }} />
            
            {/* Admin Panel Link - Only for specific roles */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR' || currentUser.role === 'CREATOR') && (
              <NavItem icon={ShieldAlert} label={t.nav.admin} active={currentView === 'ADMIN'} onClick={() => { setCurrentView('ADMIN'); setIsMobileMenuOpen(false); }} />
            )}
            
            <NavItem icon={Settings} label={t.nav.settings} active={currentView === 'SETTINGS'} onClick={() => { setCurrentView('SETTINGS'); setIsMobileMenuOpen(false); }} />
          </nav>

          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="mt-6 w-full bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white py-3.5 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(91,140,255,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <PenTool size={20} />
            {t.nav.create}
          </button>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-[var(--border)] object-cover" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-[var(--text-main)]">{currentUser.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{currentUser.handle}</p>
              </div>
            </div>
            
            {/* Version Display */}
            <div className="px-2 pt-2 border-t border-[var(--border)] flex justify-between text-[10px] text-[var(--text-muted)]">
               <span>Blend Platform</span>
               <span>{APP_VERSION}</span>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <main className={`flex-1 min-w-0 border-r border-[var(--border)] pt-16 lg:pt-0 ${currentView === 'CHATS' ? 'p-0' : 'p-0'}`}>
          
          {currentView === 'HOME' && (
            <div className="max-w-[600px] mx-auto w-full">
              {/* Feed Header */}
              <div className="sticky top-16 lg:top-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-30 border-b border-[var(--border)]">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border)]">
                    <button 
                      onClick={() => setFeedMode(FeedMode.MIX)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${feedMode === FeedMode.MIX ? 'bg-[var(--bg-hover)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      {t.feed.mix}
                    </button>
                    <button 
                      onClick={() => setFeedMode(FeedMode.CHRONO)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${feedMode === FeedMode.CHRONO ? 'bg-[var(--bg-hover)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      {t.feed.chrono}
                    </button>
                  </div>
                  <button className="lg:hidden" onClick={() => setIsPostModalOpen(true)}>
                    <PenTool className="text-[var(--primary)]" size={24}/>
                  </button>
                </div>

                {feedMode === FeedMode.MIX && (
                   <MixControls mixValues={mixValues} onChange={handleMixChange} t={t} />
                )}
              </div>

              {/* Feed Content */}
              <div className="p-4">
                {getSortedPosts().length > 0 ? getSortedPosts().map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    onLike={handleLike} 
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onFollow={handleFollowToggle}
                    t={t} 
                  />
                )) : (
                   <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] border-dashed">
                      <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                         <PenTool size={30} className="text-[var(--text-muted)]" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Welcome to Blend</h3>
                      <p className="text-[var(--text-muted)] max-w-xs mx-auto mb-6">You are the first one here! Start by creating your first post.</p>
                      <button 
                         onClick={() => setIsPostModalOpen(true)}
                         className="px-6 py-2 bg-[var(--primary)] text-white rounded-full font-bold hover:shadow-lg transition-all"
                      >
                         Create Post
                      </button>
                   </div>
                )}
                
                {posts.length > 0 && (
                  <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                    <p>{t.feed.caughtUp}</p>
                    <div className="w-1 h-1 bg-[var(--border)] rounded-full mx-auto mt-2"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'CHATS' && (
            <ChatInterface 
              chats={chats} 
              currentUser={currentUser} 
              onSendMessage={handleSendMessage}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              t={t} 
            />
          )}

          {currentView === 'EXPLORE' && renderExploreView()}
          {currentView === 'NOTIFICATIONS' && renderActivityView()}
          {currentView === 'PROFILE' && renderProfileView()}
          {currentView === 'SETTINGS' && renderSettingsView()}
          {currentView === 'ADMIN' && (
             <AdminPanel 
                currentUser={currentUser} 
                posts={posts} 
                stats={stats} 
                t={t}
                onBanUser={handleBanUser}
                onDeletePost={handleDeletePost}
                onDismissReport={handleDismissReport}
             />
          )}

        </main>

        {/* Right Sidebar (Widgets) */}
        <aside className="hidden xl:block w-[350px] sticky top-0 h-screen p-6 overflow-y-auto scrollbar-hide">
          
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--text-main)] font-bold text-lg">
              <Flame size={20} className="text-[#FF5B5B]" />
              <h3>{t.widgets.trending}</h3>
            </div>
            {TRENDS.length > 0 ? (
               <div className="space-y-4">
                 {TRENDS.map(trend => (
                   <div key={trend.id} className="cursor-pointer group">
                     <p className="text-[var(--text-main)] font-medium group-hover:text-[var(--primary)] transition-colors">{trend.tag}</p>
                     <p className="text-[var(--text-muted)] text-xs">{trend.postsCount.toLocaleString()} {t.widgets.posts}</p>
                   </div>
                 ))}
               </div>
            ) : (
               <p className="text-[var(--text-muted)] text-sm italic">Not enough data for trends yet.</p>
            )}
          </div>

          {/* Platform Stats Widget (Replaces Schedule) */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
             <div className="flex items-center gap-2 mb-4 text-[var(--text-main)] font-bold text-lg">
              <Activity size={20} className="text-[#5BFF8C]" />
              <h3>{t.widgets.stats.title}</h3>
            </div>
            <div className="space-y-3">
               
               {/* Total Users */}
               <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-[#5B8CFF]/10 text-[#5B8CFF] rounded-lg">
                        <Users size={18} />
                     </div>
                     <span className="text-sm text-[var(--text-muted)]">{t.widgets.stats.users}</span>
                  </div>
                  <span className="font-bold text-[var(--text-main)]">{stats.totalUsers.toLocaleString()}</span>
               </div>

               {/* Total Posts */}
               <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-[#FF5B5B]/10 text-[#FF5B5B] rounded-lg">
                        <FileText size={18} />
                     </div>
                     <span className="text-sm text-[var(--text-muted)]">{t.widgets.stats.posts}</span>
                  </div>
                  <span className="font-bold text-[var(--text-main)]">{stats.totalPosts.toLocaleString()}</span>
               </div>

               {/* Online Now */}
               <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg relative">
                        <Zap size={18} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-[#10B981] rounded-full animate-ping"></span>
                     </div>
                     <span className="text-sm text-[var(--text-muted)]">{t.widgets.stats.online}</span>
                  </div>
                  <span className="font-bold text-[var(--text-main)] tabular-nums">{stats.onlineUsers.toLocaleString()}</span>
               </div>

            </div>
          </div>

          <div className="mt-6 text-[var(--text-muted)] text-xs leading-relaxed px-2">
            <p>{t.widgets.footer}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button onClick={() => setActiveLegalDoc('TERMS')} className="hover:text-[var(--text-main)] hover:underline transition-colors">{t.widgets.terms}</button>
              <span>•</span>
              <button onClick={() => setActiveLegalDoc('PRIVACY')} className="hover:text-[var(--text-main)] hover:underline transition-colors">{t.widgets.privacy}</button>
              <span>•</span>
              <button className="hover:text-[var(--text-main)] hover:underline transition-colors">{t.widgets.cookies}</button>
            </div>
          </div>

        </aside>

      </div>

      {isPostModalOpen && (
        <CreatePostModal 
          currentUser={currentUser}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleCreatePost}
          t={t}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal 
          currentUser={currentUser}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleUpdateProfile}
          onRequestOfficial={handleRequestOfficial}
          hasAppliedOfficial={hasAppliedOfficial}
          t={t}
        />
      )}

      {activeLegalDoc && (
        <LegalModal 
          type={activeLegalDoc} 
          onClose={() => setActiveLegalDoc(null)} 
          t={t} 
        />
      )}

    </div>
  );
};

export default App;