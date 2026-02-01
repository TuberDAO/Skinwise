// firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
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
    console.log('Starting Google sign-in process...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('Google sign-in failed:', error);
    
    // Specific error handling for common issues
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domain not authorized for Google sign-in. Please contact support.');
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups and try again.');
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    }
    
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(`Sign-in failed: ${error.message || 'Unknown error'}`);
  }
};

// Helper functions for email/password authentication
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('Starting email sign-in process...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('Email sign-in failed:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    }
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    
    if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    }
    
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(`Sign-in failed: ${error.message || 'Unknown error'}`);
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('Starting email registration process...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email registration successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('Email registration failed:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Email/password accounts are not enabled. Please contact support.');
    }
    
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    }
    
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
  }
};

// Helper function for anonymous authentication
export const signInAnon = async () => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('Starting anonymous sign-in process...');
    const result = await signInAnonymously(auth);
    console.log('Anonymous sign-in successful:', result.user?.uid);
    return result;
  } catch (error: any) {
    console.error('Anonymous sign-in failed:', error);
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Anonymous authentication is not enabled. Please contact support.');
    }
    
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(`Anonymous sign-in failed: ${error.message || 'Unknown error'}`);
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
