import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  User,
  Post,
  Story,
  ChatMessage,
  NotificationItem,
  VerificationRequest,
  UserReport,
  Announcement,
  ActivityLog,
} from '../types';
import {
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_VERIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LOGS,
} from '../initialData';

// ============================================================================
// EMBEDDED FIREBASE INITIALIZATION (No external firebase file required)
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAYzRbUiiANg30I3DN_p-LHQ8aJjUv8mvw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mrx2145-f99e9.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://mrx2145-f99e9-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mrx2145-f99e9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mrx2145-f99e9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '394231867021',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:394231867021:android:903607c095e2ae2711a4c4',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface PixoraContextType {
  currentUser: User;
  hasActiveAccount: boolean;
  users: User[];
  posts: Post[];
  stories: Story[];
  allStories: Story[];
  chats: ChatMessage[];
  notifications: NotificationItem[];
  verifications: VerificationRequest[];
  reports: UserReport[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  theme: 'light' | 'dark';
  currentView: 'user' | 'admin';
  toggleTheme: () => void;
  setCurrentView: (view: 'user' | 'admin') => void;
  switchUser: (userId: string) => void;
  loginUser: (identifier: string, pass?: string) => boolean;
  registerUser: (data: {
    username: string;
    fullName: string;
    email: string;
    password?: string;
    dateOfBirth: string;
    bio: string;
    avatar: string;
    isPrivate: boolean;
  }) => User;
  logoutUser: () => void;
  firebaseUser: FirebaseUser | null;
  firebaseAuthLoading: boolean;
  loginWithFirebaseEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebaseEmail: (data: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    dateOfBirth: string;
    bio: string;
    avatar: string;
    isPrivate: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithFirebaseGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutFirebase: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
  toggleAccountPrivacy: () => void;
  deleteAccount: (userId: string) => void;
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;
  approveFollowRequest: (requesterId: string) => void;
  rejectFollowRequest: (requesterId: string) => void;
  createPost: (data: { imageUrl: string; caption: string; location?: string }) => Post;
  likePost: (postId: string) => void;
  commentPost: (postId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  savePost: (postId: string) => void;
  createStory: (mediaUrl: string, caption?: string) => Story;
  viewStory: (storyId: string) => void;
  sendMessage: (receiverId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
  markConversationAsSeen: (partnerUserId: string) => void;
  markAllChatsAsSeen: () => void;
  getConversationWith: (targetUserId: string) => ChatMessage[];
  submitVerificationRequest: (data: {
    category: VerificationRequest['category'];
    proofUrl: string;
    reason: string;
  }) => void;
  submitReport: (data: {
    type: UserReport['type'];
    targetId?: string;
    targetName?: string;
    category: UserReport['category'];
    description: string;
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  adminToggleUserStatus: (userId: string, status: User['status']) => void;
  adminDeleteUser: (userId: string) => void;
  adminApproveVerification: (requestId: string) => void;
  adminRejectVerification: (requestId: string, reason?: string) => void;
  adminDeletePost: (postId: string, reason?: string) => void;
  adminDeleteStory: (storyId: string, reason?: string) => void;
  adminUpdateReportStatus: (reportId: string, status: UserReport['status'], notes?: string) => void;
  adminBroadcastAnnouncement: (title: string, content: string, category: Announcement['category']) => void;
  isAdminUnlocked: boolean;
  adminLock: () => void;
  adminUnlock: (password: string) => {
    success: boolean;
    error?: string;
    remainingAttempts?: number;
    lockoutSeconds?: number;
  };
  failedAdminAttempts: number;
  adminLockoutSeconds: number;
  adminMasterPassword: string;
  resetAllData: () => void;
}

const PixoraContext = createContext<PixoraContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'pixora_users_v3',
  POSTS: 'pixora_posts_v3',
  STORIES: 'pixora_stories_v3',
  CHATS: 'pixora_chats_v3',
  NOTIFICATIONS: 'pixora_notifications_v3',
  VERIFICATIONS: 'pixora_verifications_v3',
  REPORTS: 'pixora_reports_v3',
  ANNOUNCEMENTS: 'pixora_announcements_v3',
  LOGS: 'pixora_logs_v3',
  CURRENT_USER_ID: 'pixora_current_user_id_v3',
  THEME: 'pixora_theme_v3',
  VIEW: 'pixora_view_mode_v3',
};

const DEMO_USER_IDS = new Set([
  'user_1',
  'user_2',
  'user_3',
  'user_4',
  'user_5',
  'user_6',
  'user_admin',
]);

const DEMO_USERNAMES = new Set([
  'jordan_taylor',
  'alexa_wander',
  'marcus_lens',
  'elena_style',
  'sam_dev',
  'sophia_art',
  'admin',
]);

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function normalizeUserArrays(u: User): User {
  return {
    ...u,
    followers: Array.isArray(u.followers) ? u.followers : [],
    following: Array.isArray(u.following) ? u.following : [],
    pendingFollowRequests: Array.isArray(u.pendingFollowRequests) ? u.pendingFollowRequests : [],
    savedPostIds: Array.isArray(u.savedPostIds) ? u.savedPostIds : [],
  };
}

function getStoredCleanUsers(): User[] {
  let stored = getStoredItem<User[]>(STORAGE_KEYS.USERS, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter(
      (u) =>
        u &&
        u.id &&
        !DEMO_USER_IDS.has(u.id) &&
        !DEMO_USERNAMES.has(u.username?.toLowerCase?.() || '')
    )
    .map(normalizeUserArrays);
}

export const EMPTY_GUEST_USER: User = {
  id: '',
  username: 'guest',
  fullName: 'Guest User',
  email: '',
  dateOfBirth: '2000-01-01',
  bio: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  isPrivate: false,
  isVerified: false,
  role: 'user',
  status: 'active',
  followers: [],
  customFollowersCount: 0,
  following: [],
  pendingFollowRequests: [],
  savedPostIds: [],
  createdAt: new Date().toISOString(),
};

export const PixoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(getStoredCleanUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const stored = getStoredItem(STORAGE_KEYS.CURRENT_USER_ID, '');
    if (DEMO_USER_IDS.has(stored)) return '';
    return stored;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const list = getStoredItem<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    return Array.isArray(list) ? list.filter((p) => !DEMO_USER_IDS.has(p.userId)) : [];
  });

  const [allStories, setAllStories] = useState<Story[]>(() => {
    const list = getStoredItem<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
    return Array.isArray(list) ? list.filter((s) => !DEMO_USER_IDS.has(s.userId)) : [];
  });

  const [chats, setChats] = useState<ChatMessage[]>(() => getStoredItem(STORAGE_KEYS.CHATS, INITIAL_CHATS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );
  const [verifications, setVerifications] = useState<VerificationRequest[]>(() =>
    getStoredItem(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS)
  );
  const [reports, setReports] = useState<UserReport[]>(() => getStoredItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getStoredItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    getStoredItem(STORAGE_KEYS.LOGS, INITIAL_LOGS)
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredItem(STORAGE_KEYS.THEME, 'light'));
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState<boolean>(true);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [failedAdminAttempts, setFailedAdminAttempts] = useState<number>(0);
  const [adminLockoutUntil, setAdminLockoutUntil] = useState<number | null>(null);
  const [adminLockoutSeconds, setAdminLockoutSeconds] = useState<number>(0);
  const adminMasterPassword = 'Dharvex214';

  useEffect(() => {
    if (!adminLockoutUntil) {
      setAdminLockoutSeconds(0);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.ceil((adminLockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setAdminLockoutUntil(null);
        setAdminLockoutSeconds(0);
        setFailedAdminAttempts(0);
      } else {
        setAdminLockoutSeconds(remaining);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [adminLockoutUntil]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(allStories));
  }, [allStories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        if (!snap.empty) {
          const loaded: User[] = [];
          snap.forEach((d) => {
            const raw = d.data() as User;
            const u = normalizeUserArrays(raw);
            if (!DEMO_USER_IDS.has(u.id) && !DEMO_USERNAMES.has(u.username?.toLowerCase())) {
              loaded.push(u);
            }
          });
          if (loaded.length > 0) {
            setUsers((prev) => {
              const map = new Map<string, User>();
              loaded.forEach((u) => map.set(u.id, u));
              prev.forEach((u) => {
                if (!map.has(u.id) && !DEMO_USER_IDS.has(u.id)) {
                  map.set(u.id, normalizeUserArrays(u));
                }
              });
              return Array.from(map.values());
            });
          }
        }
      },
      () => {}
    );
    return () => unsubUsers();
  }, []);

  const currentUser = useMemo(() => {
    if (users.length === 0 || !currentUserId) return EMPTY_GUEST_USER;
    const found = users.find((u) => u.id === currentUserId);
    return found || EMPTY_GUEST_USER;
  }, [users, currentUserId]);

  const hasActiveAccount = useMemo(() => {
    return Boolean(currentUserId && currentUser.id !== '');
  }, [currentUserId, currentUser.id]);

  const stories = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return allStories.filter((s) => new Date(s.createdAt).getTime() > cutoff);
  }, [allStories]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const addLog = useCallback((action: string, details: string, type: ActivityLog['type'] = 'system') => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      adminUsername: 'admin',
      action,
      details,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    try {
      setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch(() => {});
    } catch (_) {}
  }, []);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  const loginUser = useCallback(
    (identifier: string, _pass?: string): boolean => {
      const match = users.find(
        (u) =>
          u.username.toLowerCase() === identifier.toLowerCase() ||
          u.email.toLowerCase() === identifier.toLowerCase()
      );
      if (match) {
        setCurrentUserId(match.id);
        return true;
      }
      return false;
    },
    [users]
  );

  const registerUser = useCallback(
    (data: {
      username: string;
      fullName: string;
      email: string;
      password?: string;
      dateOfBirth: string;
      bio: string;
      avatar: string;
      isPrivate: boolean;
    }): User => {
      const newUser: User = {
        id: 'user_' + Date.now(),
        username: data.username.toLowerCase().replace(/\s+/g, '_'),
        fullName: data.fullName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio || 'New Pixora member',
        avatar:
          data.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.username)}`,
        isPrivate: data.isPrivate,
        isVerified: false,
        role: 'user',
        status: 'active',
        followers: [],
        following: [],
        pendingFollowRequests: [],
        savedPostIds: [],
        createdAt: new Date().toISOString(),
        isOnline: true,
        lastActive: 'Active now',
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      try {
        setDoc(doc(db, 'users', newUser.id), newUser).catch(() => {});
      } catch (_) {}
      addLog('User Registered', `New account created: @${newUser.username}`, 'user');
      return newUser;
    },
    [addLog]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setFirebaseAuthLoading(false);
      if (fbUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (userSnap.exists()) {
            const uData = normalizeUserArrays(userSnap.data() as User);
            setUsers((prev) => [uData, ...prev.filter((p) => p.id !== uData.id)]);
            setCurrentUserId((prevId) => prevId || uData.id);
          } else {
            const baseName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Pixora User';
            const cleanUsername = (fbUser.email?.split('@')[0] || 'user_' + fbUser.uid.slice(0, 6))
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_');

            const newFbUser: User = {
              id: fbUser.uid,
              username: cleanUsername,
              fullName: baseName,
              email: fbUser.email || `${cleanUsername}@pixora.social`,
              dateOfBirth: '2000-01-01',
              bio: 'Joined Pixora with Firebase',
              avatar:
                fbUser.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
              isPrivate: false,
              isVerified: false,
              role: 'user',
              status: 'active',
              followers: [],
              customFollowersCount: 0,
              following: [],
              pendingFollowRequests: [],
              savedPostIds: [],
              createdAt: new Date().toISOString(),
              isOnline: true,
              lastActive: 'Active now',
            };
            try {
              await setDoc(doc(db, 'users', fbUser.uid), newFbUser);
            } catch (_) {}
            setUsers((prev) => [newFbUser, ...prev.filter((p) => p.id !== newFbUser.id)]);
            setCurrentUserId((prevId) => prevId || newFbUser.id);
          }
        } catch (_) {}
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithFirebaseEmail = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setFirebaseAuthLoading(true);
        const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
        const uid = res.user.uid;
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          const uData = normalizeUserArrays(userSnap.data() as User);
          setUsers((prev) => [uData, ...prev.filter((u) => u.id !== uid)]);
        }
        setCurrentUserId(uid);
        setFirebaseAuthLoading(false);
        return { success: true };
      } catch (err: any) {
        setFirebaseAuthLoading(false);
        return {
          success: false,
          error: 'Email ya password galat hai, ya account register nahi hai! Pehle Create Account karein.',
        };
      }
    },
    []
  );

  const registerWithFirebaseEmail = useCallback(
    async (data: {
      email: string;
      password: string;
      username: string;
      fullName: string;
      dateOfBirth: string;
      bio: string;
      avatar: string;
      isPrivate: boolean;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        setFirebaseAuthLoading(true);
        const res = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
        const uid = res.user.uid;
        const cleanUsername = data.username.toLowerCase().replace(/\s+/g, '_');

        const newUser: User = {
          id: uid,
          username: cleanUsername,
          fullName: data.fullName,
          email: data.email.trim(),
          dateOfBirth: data.dateOfBirth,
          bio: data.bio || 'New Pixora member',
          avatar:
            data.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
          isPrivate: data.isPrivate,
          isVerified: false,
          role: 'user',
          status: 'active',
          followers: [],
          customFollowersCount: 0,
          following: [],
          pendingFollowRequests: [],
          savedPostIds: [],
          createdAt: new Date().toISOString(),
          isOnline: true,
          lastActive: 'Active now',
        };

        try {
          await setDoc(doc(db, 'users', uid), newUser);
        } catch (_) {}

        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== uid)]);
        setCurrentUserId(uid);
        setFirebaseAuthLoading(false);
        return { success: true };
      } catch (err: any) {
        setFirebaseAuthLoading(false);
        return { success: false, error: err?.message || 'Registration failed' };
      }
    },
    []
  );

  const loginWithFirebaseGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setFirebaseAuthLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const cleanUsername = (fbUser.email?.split('@')[0] || 'google_user_' + fbUser.uid.slice(0, 5))
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
      if (userSnap.exists()) {
        const existingUser = normalizeUserArrays(userSnap.data() as User);
        setUsers((prev) => [existingUser, ...prev.filter((u) => u.id !== existingUser.id)]);
        setCurrentUserId(existingUser.id);
      } else {
        const newUser: User = {
          id: fbUser.uid,
          username: cleanUsername,
          fullName: fbUser.displayName || 'Google Member',
          email: fbUser.email || `${cleanUsername}@gmail.com`,
          dateOfBirth: '2000-01-01',
          bio: 'Pixora Google Member',
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
          isPrivate: false,
          isVerified: false,
          role: 'user',
          status: 'active',
          followers: [],
          customFollowersCount: 0,
          following: [],
          pendingFollowRequests: [],
          savedPostIds: [],
          createdAt: new Date().toISOString(),
          isOnline: true,
          lastActive: 'Active now',
        };
        try {
          await setDoc(doc(db, 'users', fbUser.uid), newUser);
        } catch (_) {}
        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
        setCurrentUserId(newUser.id);
      }

      setFirebaseAuthLoading(false);
      return { success: true };
    } catch (err: any) {
      setFirebaseAuthLoading(false);
      return { success: false, error: err?.message || 'Google sign-in failed' };
    }
  }, []);

  const logoutFirebase = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
    } catch (_) {}
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (_) {}
    setFirebaseUser(null);
    setCurrentUserId('');
  }, []);

  const updateUserProfile = useCallback(
    (updates: Partial<User>) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId) return;
      setUsers((prev) => prev.map((u) => (u.id === activeId ? { ...u, ...updates } : u)));
      try {
        updateDoc(doc(db, 'users', activeId), updates as any).catch(() => {});
      } catch (_) {}
    },
    [currentUserId, currentUser.id]
  );

  const toggleAccountPrivacy = useCallback(() => {
    const activeId = currentUser.id || currentUserId;
    if (!activeId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === activeId) {
          const nextPrivate = !u.isPrivate;
          try {
            updateDoc(doc(db, 'users', activeId), { isPrivate: nextPrivate }).catch(() => {});
          } catch (_) {}
          return { ...u, isPrivate: nextPrivate };
        }
        return u;
      })
    );
  }, [currentUserId, currentUser.id]);

  const deleteAccount = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setCurrentUserId('');
    try {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    } catch (_) {}
  }, []);

  const followUser = useCallback(
    (targetUserId: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId || targetUserId === activeId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === activeId) {
            return { ...u, following: Array.from(new Set([...u.following, targetUserId])) };
          }
          if (u.id === targetUserId) {
            return { ...u, followers: Array.from(new Set([...u.followers, activeId])) };
          }
          return u;
        })
      );
    },
    [currentUserId, currentUser.id]
  );

  const unfollowUser = useCallback(
    (targetUserId: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === activeId) {
            return { ...u, following: u.following.filter((id) => id !== targetUserId) };
          }
          if (u.id === targetUserId) {
            return { ...u, followers: u.followers.filter((id) => id !== activeId) };
          }
          return u;
        })
      );
    },
    [currentUserId, currentUser.id]
  );

  const approveFollowRequest = useCallback((_requesterId: string) => {}, []);
  const rejectFollowRequest = useCallback((_requesterId: string) => {}, []);

  const createPost = useCallback(
    (data: { imageUrl: string; caption: string; location?: string }): Post => {
      const newPost: Post = {
        id: 'post_' + Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        userFullName: currentUser.fullName,
        userAvatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        imageUrl: data.imageUrl,
        caption: data.caption,
        location: data.location,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      try {
        setDoc(doc(db, 'posts', newPost.id), newPost).catch(() => {});
      } catch (_) {}
      return newPost;
    },
    [currentUser]
  );

  const likePost = useCallback(
    (postId: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const hasLiked = p.likes.includes(activeId);
          const nextLikes = hasLiked ? p.likes.filter((id) => id !== activeId) : [...p.likes, activeId];
          return { ...p, likes: nextLikes };
        })
      );
    },
    [currentUserId, currentUser.id]
  );

  const commentPost = useCallback(
    (postId: string, text: string) => {
      if (!text.trim()) return;
      const newComment = {
        id: 'comment_' + Date.now(),
        postId,
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
      );
    },
    [currentUser]
  );

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p))
    );
  }, []);

  const savePost = useCallback(
    (postId: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== activeId) return u;
          const isSaved = u.savedPostIds.includes(postId);
          return {
            ...u,
            savedPostIds: isSaved ? u.savedPostIds.filter((id) => id !== postId) : [...u.savedPostIds, postId],
          };
        })
      );
    },
    [currentUserId, currentUser.id]
  );

  const createStory = useCallback(
    (mediaUrl: string, caption?: string): Story => {
      const newStory: Story = {
        id: 'story_' + Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        mediaUrl,
        caption,
        createdAt: new Date().toISOString(),
        viewers: [],
      };
      setAllStories((prev) => [newStory, ...prev]);
      return newStory;
    },
    [currentUser]
  );

  const viewStory = useCallback(
    (storyId: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!activeId) return;
      setAllStories((prev) =>
        prev.map((s) => {
          if (s.id === storyId && !s.viewers.includes(activeId)) {
            return { ...s, viewers: [...s.viewers, activeId] };
          }
          return s;
        })
      );
    },
    [currentUserId, currentUser.id]
  );

  const sendMessage = useCallback(
    (receiverId: string, text: string) => {
      const activeId = currentUser.id || currentUserId;
      if (!text.trim() || !activeId) return;
      const newMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        senderId: activeId,
        receiverId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        status: 'delivered',
      };
      setChats((prev) => [...prev, newMsg]);
    },
    [currentUserId, currentUser.id]
  );

  const getConversationWith = useCallback(
    (targetUserId: string) => {
      const activeId = currentUser.id || currentUserId;
      return chats.filter(
        (m) =>
          (m.senderId === activeId && m.receiverId === targetUserId) ||
          (m.senderId === targetUserId && m.receiverId === activeId)
      );
    },
    [chats, currentUserId, currentUser.id]
  );

  const deleteMessage = useCallback((messageId: string) => {
    setChats((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const markConversationAsSeen = useCallback((_partnerId: string) => {}, []);
  const markAllChatsAsSeen = useCallback(() => {}, []);

  const submitVerificationRequest = useCallback(
    (_data: { category: VerificationRequest['category']; proofUrl: string; reason: string }) => {},
    []
  );

  const submitReport = useCallback(
    (_data: {
      type: UserReport['type'];
      targetId?: string;
      targetName?: string;
      category: UserReport['category'];
      description: string;
    }) => {},
    []
  );

  const markNotificationAsRead = useCallback((_id: string) => {}, []);
  const markAllNotificationsAsRead = useCallback(() => {}, []);
  const deleteNotification = useCallback((_id: string) => {}, []);
  const clearAllNotifications = useCallback(() => {}, []);

  const adminUpdateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  }, []);

  const adminToggleUserStatus = useCallback((userId: string, status: User['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
  }, []);

  const adminDeleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const adminApproveVerification = useCallback((_requestId: string) => {}, []);
  const adminRejectVerification = useCallback((_requestId: string, _reason?: string) => {}, []);
  const adminDeletePost = useCallback((postId: string, _reason?: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);
  const adminDeleteStory = useCallback((storyId: string, _reason?: string) => {
    setAllStories((prev) => prev.filter((s) => s.id !== storyId));
  }, []);
  const adminUpdateReportStatus = useCallback(
    (_reportId: string, _status: UserReport['status'], _notes?: string) => {},
    []
  );
  const adminBroadcastAnnouncement = useCallback(
    (_title: string, _content: string, _category: Announcement['category']) => {},
    []
  );

  const adminUnlock = useCallback((password: string) => {
    if (password === adminMasterPassword) {
      setIsAdminUnlocked(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid master key.' };
  }, []);

  const adminLock = useCallback(() => setIsAdminUnlocked(false), []);

  const resetAllData = useCallback(() => {
    setUsers([]);
    setCurrentUserId('');
    localStorage.clear();
  }, []);

  return (
    <PixoraContext.Provider
      value={{
        currentUser,
        hasActiveAccount,
        users,
        posts,
        stories,
        allStories,
        chats,
        notifications,
        verifications,
        reports,
        announcements,
        activityLogs,
        theme,
        currentView,
        toggleTheme,
        setCurrentView,
        switchUser,
        loginUser,
        registerUser,
        logoutUser,
        firebaseUser,
        firebaseAuthLoading,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        loginWithFirebaseGoogle,
        logoutFirebase,
        updateUserProfile,
        toggleAccountPrivacy,
        deleteAccount,
        followUser,
        unfollowUser,
        approveFollowRequest,
        rejectFollowRequest,
        createPost,
        likePost,
        commentPost,
        deleteComment,
        savePost,
        createStory,
        viewStory,
        sendMessage,
        deleteMessage,
        markConversationAsSeen,
        markAllChatsAsSeen,
        getConversationWith,
        submitVerificationRequest,
        submitReport,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        adminUpdateUser,
        adminToggleUserStatus,
        adminDeleteUser,
        adminApproveVerification,
        adminRejectVerification,
        adminDeletePost,
        adminDeleteStory,
        adminUpdateReportStatus,
        adminBroadcastAnnouncement,
        resetAllData,
        isAdminUnlocked,
        adminLock,
        adminUnlock,
        failedAdminAttempts,
        adminLockoutSeconds,
        adminMasterPassword,
      }}
    >
      {children}
    </PixoraContext.Provider>
  );
};

export const usePixora = () => {
  const context = useContext(PixoraContext);
  if (!context) throw new Error('usePixora must be used within a PixoraProvider');
  return context;
};
