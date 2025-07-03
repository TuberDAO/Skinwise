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

// Firebase configuration using environment variables - NO FALLBACKS to force proper config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

// In development, use placeholder values if env vars are missing
if (missingEnvVars.length > 0) {
  console.warn('Missing Firebase environment variables:', missingEnvVars.join(', '));
  console.warn('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
  
  if (process.env.NODE_ENV !== 'development') {
    throw new Error(
      `Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`
    );
  }
}

// Initialize Firebase app (prevent reinitialization) with error handling for development
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
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
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