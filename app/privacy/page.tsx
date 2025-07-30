'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the unified terms page since privacy policy is included there
    // Use replace() to avoid creating a history entry that breaks back button
    router.replace('/terms')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Redirecting to Terms & Privacy Policy...</p>
      </div>
    </div>
  )
} 