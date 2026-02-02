
export type UserRole = 'USER' | 'ADMIN' | 'CREATOR' | 'MODERATOR';
export type Theme = 'DARK' | 'LIGHT' | 'GOLD';

export interface User {
  id: string;
  staticId: number; // Unique sequential ID
  name: string;
  handle: string;
  avatar: string;
  banner?: string; // Base64 Data URL for hand-drawn banner
  bio?: string;
  verified?: boolean;
  isOfficial?: boolean; // Yellow Official Status
  isActive?: boolean; // Green Active Status
  isBanned?: boolean; // New: Banned status
  role?: UserRole;
  followers: string[]; // List of user IDs following this user
  following: string[]; // List of user IDs this user follows
}

export enum PostType {
  NOTE = 'NOTE',
  CARD = 'CARD',
  CLIP = 'CLIP',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  type: PostType;
  author: User;
  content: string;
  mediaUrl?: string;
  audioDuration?: string; // Duration for audio posts
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number; // Display count
  comments: Comment[]; // Actual comments data
  shares: number;
  views: number;
  popularityScore?: number; // For Mix algorithm
  mixExplanation?: string; // "Why am I seeing this?"
  
  // Moderation Fields
  isFlagged?: boolean; // Flagged by AI or User
  isHidden?: boolean; // Hidden from public feed
  flagReason?: string; // Why it was flagged
}

export enum MessageType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  CALL_INFO = 'CALL_INFO'
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  audioDuration?: string; // For audio messages
  type: MessageType;
  timestamp: string;
  isRead: boolean;
}

export enum ChatCategory {
  PERSONAL = 'PERSONAL',
  DISCUSSION = 'DISCUSSION', // Post discussions/replies
  CHANNEL = 'CHANNEL'
}

export interface Chat {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  category: ChatCategory; // Added category
  messages: Message[];
}

export interface Trend {
  id: string;
  tag: string;
  postsCount: number;
}

export enum FeedMode {
  MIX = 'MIX',
  CHRONO = 'CHRONO'
}

export type Language = 'en' | 'ru' | 'zh';
