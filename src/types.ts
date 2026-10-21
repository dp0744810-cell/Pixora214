export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  isPrivate: boolean;
  isVerified: boolean;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'blocked';
  followers: string[];
  customFollowersCount?: number;
  following: string[];
  pendingFollowRequests: string[];
  savedPostIds: string[];
  createdAt: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  userAvatar: string;
  isVerified: boolean;
  imageUrl: string;
  caption: string;
  location?: string;
  createdAt: string;
  likes: string[];
  comments: CommentItem[];
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified: boolean;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified: boolean;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  viewers: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'seen';
}

export interface NotificationItem {
  id: string;
  userId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  senderIsVerified: boolean;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'announcement';
  title?: string;
  message: string;
  postId?: string;
  createdAt: string;
  isRead: boolean;
  followRequestStatus?: 'pending' | 'accepted' | 'declined';
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  userAvatar: string;
  category: 'Creator/Influencer' | 'News/Media' | 'Sports' | 'Fashion/Art' | 'Business/Brand' | 'Government/Public';
  proofUrl: string;
  reason: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface UserReport {
  id: string;
  reporterUserId: string;
  reporterUsername: string;
  type: 'post' | 'user' | 'bug';
  targetId?: string;
  targetName?: string;
  category: 'Spam/Harassment' | 'Inappropriate Content' | 'Hate Speech' | 'Impersonation' | 'Technical Bug' | 'Other';
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  createdAt: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'update' | 'feature' | 'security';
  createdAt: string;
  author: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  adminUsername: string;
  action: string;
  details: string;
  type: 'system' | 'user' | 'content' | 'verification' | 'report' | 'broadcast';
}
