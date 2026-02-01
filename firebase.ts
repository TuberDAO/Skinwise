// firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

// Initialize Google Auth Provider with enhanced production support
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider with production-ready settings
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// ⚠️ IMPORTANT: For custom Google OAuth credentials
// If you have GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables,
// Firebase will automatically use them when properly configured in Firebase Console
console.log('🔑 Google OAuth Environment Check:', {
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  authDomain: firebaseConfig.authDomain,
  environment: process.env.NODE_ENV
});

// 🚨 CRITICAL: Redirect URI Configuration Check
// For Firebase Auth, the redirect URI should be: https://[authDomain]/__/auth/handler
// NOT your app domain. This is automatic with Firebase Auth.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const expectedRedirectUri = `https://${firebaseConfig.authDomain}/__/auth/handler`;
  console.log('🔄 Firebase Auth Redirect URI (automatic):', expectedRedirectUri);
  console.log('📋 Google Cloud Console Setup Required:');
  console.log('   Authorized JavaScript origins: https://skinwiseapp.com');
  console.log('   Authorized redirect URIs:', expectedRedirectUri);
}

// Helper functions for authentication
export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('🔐 Starting Google sign-in process...');
    console.log('🌍 Current domain:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
    console.log('🔧 Auth domain:', firebaseConfig.authDomain);
    console.log('📱 User agent:', typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'SSR');
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('❌ Google sign-in failed:', error);
    
    // Enhanced error logging for production debugging
    console.error('🚨 Error details:', {
      code: error.code,
      message: error.message,
      domain: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      authDomain: firebaseConfig.authDomain,
      timestamp: new Date().toISOString(),
    });
    
    // Specific error handling for common production issues
    if (error.code === 'auth/unauthorized-domain') {
      console.error('🔥 UNAUTHORIZED DOMAIN ERROR:');
      console.error('   → Add your domain to Firebase Console → Authentication → Settings → Authorized domains');
      console.error('   → Current domain:', typeof window !== 'undefined' ? window.location.origin : 'Unknown');
      throw new Error('Domain not authorized for Google sign-in. Please contact support.');
    }
    
    if (error.code === 'auth/popup-blocked') {
      console.error('🚫 POPUP BLOCKED ERROR:');
      console.error('   → User needs to allow popups for this site');
      throw new Error('Popup was blocked. Please allow popups and try again.');
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.error('👆 POPUP CLOSED BY USER');
      throw new Error('Sign-in was cancelled. Please try again.');
    }
    
    if (error.code === 'auth/network-request-failed') {
      console.error('📡 NETWORK ERROR:');
      console.error('   → Check internet connection');
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Generic error with helpful message
    throw new Error(`Sign-in failed: ${error.message || 'Unknown error'}`);
  }
};

// Helper functions for email/password authentication
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('🔐 Starting email sign-in process...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('❌ Email sign-in failed:', error);
    
    // Handle specific authentication errors
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
    
    // Generic error with helpful message
    throw new Error(`Sign-in failed: ${error.message || 'Unknown error'}`);
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    console.log('🔐 Starting email registration process...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Email registration successful:', result.user?.email);
    return result;
  } catch (error: any) {
    console.error('❌ Email registration failed:', error);
    
    // Handle specific registration errors
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
    
    // Generic error with helpful message
    throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
  }
};

// 🔧 Production Configuration Validator
export const validateProductionConfig = () => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  const issues = [];
  const currentDomain = window.location.origin;
  
  // Check environment variables
  if (!firebaseConfig.apiKey) issues.push('❌ NEXT_PUBLIC_FIREBASE_API_KEY missing');
  if (!firebaseConfig.authDomain) issues.push('❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN missing');
  if (!firebaseConfig.projectId) issues.push('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID missing');
  
  // Check Google OAuth environment variables (optional but recommended)
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 PRODUCTION GOOGLE AUTH VALIDATION:');
    console.log('==================================================');
    console.log('📍 Current Domain:', currentDomain);
    console.log('🔧 Firebase Auth Domain:', firebaseConfig.authDomain);
    console.log('🔑 Google Client ID Set:', hasGoogleClientId ? '✅ Yes' : '⚠️ No (using Firebase default)');
    console.log('🔐 Google Client Secret Set:', hasGoogleClientSecret ? '✅ Yes' : '⚠️ No (using Firebase default)');
    
    if (firebaseConfig.authDomain) {
      const correctRedirectUri = `https://${firebaseConfig.authDomain}/__/auth/handler`;
      console.log('');
      console.log('🚨 CRITICAL: Google Cloud Console Configuration:');
      console.log('   → OAuth 2.0 Client IDs → Your Client → Edit');
      console.log('   → Authorized JavaScript origins:');
      console.log('     ✅ https://skinwiseapp.com');
      console.log('   → Authorized redirect URIs:');
      console.log(`     ✅ ${correctRedirectUri}`);
      console.log('     ❌ https://skinwiseapp.com/login (INCORRECT - remove this)');
      console.log('');
      console.log('📋 Firebase Console Configuration:');
      console.log('   → Authentication → Sign-in method → Google → Enable');
      console.log('   → Use your Google Cloud Console OAuth client credentials');
    }
    
    if (issues.length > 0) {
      console.error('🚨 CONFIGURATION ISSUES FOUND:');
      issues.forEach(issue => console.error(issue));
    } else {
      console.log('✅ All environment variables configured correctly');
    }
    console.log('==================================================');
  }
};

// Auto-validate on module load in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Run validation after a short delay to ensure environment is loaded
  setTimeout(validateProductionConfig, 1000);
}

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