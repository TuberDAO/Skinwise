'use client'

import Script from 'next/script'

/**
 * Google Analytics Component
 * 
 * This component loads Google Analytics (gtag.js) with the tracking ID
 * from environment variables. It's designed to be lightweight and
 * non-blocking for optimal performance.
 * 
 * Environment Variable:
 * - NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: Your GA4 tracking ID (e.g., G-XXXXXXXXXX)
 * 
 * Usage:
 * Import this component in your root layout to enable site-wide tracking.
 */

export default function GoogleAnalytics() {
  // Get Google Analytics ID from environment variables
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  
  // Don't render anything if GA ID is not configured
  if (!gaId) {
    console.warn('Google Analytics: NEXT_PUBLIC_GOOGLE_ANALYTICS_ID not found in environment variables')
    return null
  }

  return (
    <>
      {/* Google Analytics Script - Loads asynchronously for better performance */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
        id="google-analytics-script"
      />
      
      {/* Google Analytics Configuration */}
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  )
}

// Helper function to track custom events (optional - for future use)
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}