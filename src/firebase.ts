import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAYzRbUiiANg30I3DN_p-LHQ8aJjUv8mvw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mrx2145-f99e9.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://mrx2145-f99e9-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mrx2145-f99e9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mrx2145-f99e9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '394231867021',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:394231867021:android:903607c095e2ae2711a4c4',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
