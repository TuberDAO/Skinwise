import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SkinWise - AI-Assisted Skin Health Assessment',
    template: '%s | SkinWise'
  },
  description: 'Get honest, ethical skin health advice from AI-assisted analysis.',
  keywords: 'skin health, AI analysis, dermatology, skin assessment, health platform',
  authors: [{ name: 'SkinWise Team' }],
  creator: 'SkinWise',
  publisher: 'SkinWise',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'health',
  classification: 'Health & Medical',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light',
  themeColor: '#475569',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkinWise',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'),
  openGraph: {
    type: 'website',
    siteName: 'SkinWise',
    title: 'SkinWise - AI-Assisted Skin Health Assessment',
    description: 'Get honest, ethical skin health advice from AI-assisted analysis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkinWise - AI-Assisted Skin Health Assessment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skinwise',
    creator: '@skinwise',
    title: 'SkinWise - AI-Assisted Skin Health Assessment',
    description: 'Get honest, ethical skin health advice from AI-assisted analysis.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#475569" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 