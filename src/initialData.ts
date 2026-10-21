import { Post, Story, ChatMessage, NotificationItem, VerificationRequest, UserReport, Announcement, ActivityLog } from './types';

export const INITIAL_POSTS: Post[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_CHATS: ChatMessage[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_VERIFICATIONS: VerificationRequest[] = [];
export const INITIAL_REPORTS: UserReport[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_1',
    title: 'Welcome to Pixora!',
    content: 'Explore stories, feeds, and secure Firebase authentication.',
    category: 'announcement',
    createdAt: new Date().toISOString(),
    author: 'Admin',
  },
];
export const INITIAL_LOGS: ActivityLog[] = [];
