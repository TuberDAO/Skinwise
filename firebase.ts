// firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  type Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore 
} from 'firebase/firestore';
import { 
  getStorage, 
  type FirebaseStorage 
} from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase config loaded from environment variables:', {
  apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'missing',
  authDomain: firebaseConfig.authDomain || 'missing',
  projectId: firebaseConfig.projectId || 'missing',
  storageBucket: firebaseConfig.storageBucket || 'missing'
});

// Initialize Firebase app (prevent reinitialization) with error handling
let app: FirebaseApp;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Only initialize services if app was created successfully
  if (app && app.name) {
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase services initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create mock app for development
  app = {} as FirebaseApp;
  auth = null;
  firestore = null;
  storage = null;
}

export { auth, firestore, storage };

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Helper functions for authentication
export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Export the app instance
export { app };

// Export Firebase types
export type { 
  User, 
  UserCredential, 
  AuthError 
} from 'firebase/auth';

export type { 
  DocumentData, 
  DocumentReference, 
  DocumentSnapshot, 
  QuerySnapshot, 
  CollectionReference 
} from 'firebase/firestore';

export type { 
  StorageReference, 
  UploadResult, 
  UploadTask 
} from 'firebase/storage'; 