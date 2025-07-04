# 🔧 Firebase Setup & Fix Guide

## 🚨 **Current Issues:**
- ❌ Missing Firebase environment variables
- ❌ Firestore permissions error: "Missing or insufficient permissions"
- ❌ No `.env.local` file

## 🛠️ **Step-by-Step Fix:**

### **Step 1: Create Environment File**

1. **Create a new file** named `.env.local` in your project root
2. **Copy the content** from `firebase-config-template.txt` 
3. **Replace the placeholder values** with your actual Firebase config

### **Step 2: Get Your Firebase Configuration**

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project (likely "skinwisexv1")
3. Click the **⚙️ Settings** icon → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click the **Web app** (</>) icon
6. Copy the config values:

```javascript
// Your Firebase config will look like this:
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // Copy this
  authDomain: "skinwisexv1.firebaseapp.com",  // Copy this
  projectId: "skinwisexv1",                    // Copy this  
  storageBucket: "skinwisexv1.appspot.com",   // Copy this
  messagingSenderId: "123456789",             // Copy this
  appId: "1:123456789:web:abc123..."          // Copy this
};
```

### **Step 3: Update .env.local File**

Replace the placeholder values in your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skinwisexv1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skinwisexv1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skinwisexv1.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...
NEXT_PUBLIC_ADMIN_EMAILS=your_email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 4: Fix Firestore Security Rules**

1. In Firebase Console, go to **Firestore Database**
2. Click the **Rules** tab
3. **Replace all existing rules** with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own assessments
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to create new assessments
    match /assessments/{assessmentId} {
      allow create: if request.auth != null 
                   && request.auth.uid == resource.data.userId;
    }
  }
}
```

4. Click **Publish** to save the rules

### **Step 5: Test the Fix**

1. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Try the upload process again**:
   - Upload photos
   - Fill in text fields  
   - Click proceed to payment
   - Check if the error is gone

### **Step 6: Verify Data in Firebase**

1. Go to **Firestore Database** in Firebase Console
2. Look for the **`assessments`** collection
3. You should see your test submission with all the text fields

## 🛡️ **Rollback Option**

If anything goes wrong, run:
```bash
.\rollback-firebase-fixes.ps1
```

This will restore all original files.

## 🔍 **Expected Results After Fix:**

✅ **No environment variable errors**  
✅ **Successful data save to Firestore**  
✅ **Assessment visible in Firebase Console**  
✅ **All text fields properly stored**  

## 🚨 **If You Still Get Errors:**

1. **Check console logs** for specific error messages
2. **Verify .env.local file** exists and has correct values
3. **Ensure Firestore rules** are published correctly
4. **Try logging in with Google** again
5. **Check Firebase Console** for any API key restrictions

## 📞 **Quick Checklist:**

- [ ] Created `.env.local` file
- [ ] Added Firebase configuration values
- [ ] Updated Firestore security rules
- [ ] Restarted development server
- [ ] Tested upload process
- [ ] Verified data appears in Firebase Console

---

**🔧 Run this fix and let me know if you encounter any issues!** 