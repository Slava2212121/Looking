
import { Chat, Post, Trend, User } from './types';

export const CURRENT_USER: User = {
  id: 'u_slava',
  staticId: 1,
  name: 'Slava Kolosov',
  handle: '@slava_creator',
  avatar: 'https://ui-avatars.com/api/?name=Slava+Kolosov&background=5B8CFF&color=fff&size=200',
  bio: 'Founder & Creator of Blend Platform.',
  verified: true,
  role: 'CREATOR',
  isOfficial: true,
  isActive: true,
  followers: [],
  following: []
};

export const MOCK_USERS: Record<string, User> = {};

export const MOCK_POSTS: Post[] = [];

export const MOCK_CHATS: Chat[] = [];

export const TRENDS: Trend[] = [];
