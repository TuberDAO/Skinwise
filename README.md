# SkinWise - AI-Assisted Skin Health Platform

A clean, ethical, AI-assisted skin health assessment platform built with Next.js 14+, Firebase, and Stripe.

## 🎯 Purpose

SkinWise provides honest, ethical skin health guidance through AI-assisted analysis. Users upload photos and descriptions of their skin concerns, pay $19.95 for professional review, and receive root-cause advice focusing on hydration, sleep, diet, and environment before any product recommendations.

## ✨ Key Features

- **Secure Authentication**: Google OAuth and anonymous login via Firebase Auth
- **Photo Upload**: Upload 1-4 skin photos with drag-and-drop interface using Firebase Storage
- **Payment Processing**: Stripe Checkout with automatic currency conversion
- **AI-Assisted Review**: Admin dashboard for professional assessment review
- **Ethical Approach**: Root-cause recommendations before product suggestions
- **Mobile-First Design**: Responsive UI with Tailwind CSS and shadcn/ui
- **Real-time Updates**: Firebase Firestore for real-time data synchronization

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (Google + Anonymous)
- **Payments**: Stripe Checkout
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- Stripe account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skinwise.git
   cd skinwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env.local` and fill in your credentials:
   
   ```bash
   cp env.example .env.local
   ```
   
   Required variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Admin Configuration
   ADMIN_EMAILS=admin@yourcompany.com,admin2@yourcompany.com
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Firebase Setup

1. **Create a Firebase project** at https://console.firebase.google.com
2. **Enable Authentication** with Google and Anonymous providers
3. **Create Firestore database** in production mode
4. **Set up Firebase Storage** with proper security rules
5. **Configure security rules**:

   **Firestore Rules** (`firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /assessments/{assessmentId} {
         allow read, write: if request.auth != null && 
           (request.auth.uid == resource.data.userId || 
            request.auth.token.email in get(/databases/$(database)/documents/config/admins).data.emails);
       }
     }
   }
   ```

   **Storage Rules** (`storage.rules`):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /assessments/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Stripe Setup

1. **Create a Stripe account** at https://stripe.com
2. **Get your API keys** from the dashboard
3. **Set up a webhook endpoint** pointing to `/api/webhook`
4. **Configure webhook events**:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the flow**
   - Create an account or sign in anonymously
   - Upload photos and fill out the form
   - Use Stripe test cards for payment testing

## 📱 User Flow

1. **Landing Page** → User sees value proposition and CTA
2. **Login** → Google OAuth or anonymous authentication
3. **Upload** → User uploads 1-4 photos and optional description
4. **Payment** → Stripe Checkout for $19.95 (auto-converts currency)
5. **Success** → Confirmation and next steps explanation
6. **Admin Review** → Professional reviews submission
7. **Results** → User receives honest, root-cause analysis

## 🔐 Security Features

- **Authentication Required**: All uploads require authentication
- **User-scoped Data**: Firestore rules ensure users only access their data
- **Admin Dashboard**: Access restricted to whitelisted email addresses
- **Secure File Upload**: Firebase Storage with user-specific paths
- **Payment Security**: Stripe handles all sensitive financial data
- **Environment Variables**: All secrets stored securely

## 👨‍💼 Admin Dashboard

Access the admin dashboard at `/admin` (requires whitelisted email):

- **View all assessments** with filtering by status
- **Review photos and descriptions** in detail
- **Update assessment status** (paid → in review → completed)
- **Add analysis and admin notes**
- **Real-time updates** via Firestore listeners

## 🎨 Design Philosophy

- **Medical/Clinical Feel**: Clean, trustworthy design inspired by health platforms
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessibility**: Proper contrast ratios, semantic HTML, keyboard navigation
- **Color Palette**: Slate blue (#475569), pale teal (#99F6E4), off-white (#FEFEFE)
- **Typography**: Inter font for clean, readable text

## 🔍 Environment Configuration

### Development
- Use Stripe test keys
- Firebase emulators (optional)
- Local development at `http://localhost:3000`

### Production
- Use Stripe live keys
- Update `NEXT_PUBLIC_APP_URL` to your domain
- Configure Stripe webhook endpoint
- Deploy to Vercel or similar platform

## 📊 Monitoring & Analytics

Consider adding:
- Firebase Analytics for user behavior
- Stripe Dashboard for payment analytics
- Error monitoring (Sentry, LogRocket)
- Performance monitoring (Vercel Analytics)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@skinwise.com
- Documentation: See inline code comments

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Vercel automatically deploys on git push
4. **Update Stripe webhook** URL to your production domain

### Other Platforms

This Next.js app can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

---

**SkinWise** - Honest, ethical skin health guidance powered by AI and human expertise. 