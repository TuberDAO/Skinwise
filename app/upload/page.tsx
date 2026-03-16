'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, Upload, X, FileText, Camera, AlertCircle, CheckCircle, Mail, LogOut } from "lucide-react"
import Link from "next/link"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, storage, firestore } from '@/firebase'
import { signOut } from 'firebase/auth'
import { formatFileSize } from '@/lib/utils'
import { detectUserCurrency, formatPrice, formatDermatologistPrice, getUserCurrencyFromLocale, type SupportedCurrency } from '@/lib/currency'
import { validateFiles, logFileUploadAttempt, createSecureUploadPath } from '@/lib/file-validation'

interface UploadedFile {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  url?: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [textDescription, setTextDescription] = useState('')

  // Structured questionnaire state
  const [symptomTypes, setSymptomTypes] = useState<string[]>([])
  const [bodyLocation, setBodyLocation] = useState('')
  const [symptomDuration, setSymptomDuration] = useState('')
  const [changeOverTime, setChangeOverTime] = useState('')
  const [redFlags, setRedFlags] = useState<Record<string, boolean>>({
    bleeding: false,
    rapidGrowth: false,
    fever: false,
    spreadingFast: false,
    severeItchPain: false,
  })
  const [productUsage, setProductUsage] = useState('')
  const [lifestyleTriggers, setLifestyleTriggers] = useState<string[]>([])
  const [lifestyleNotes, setLifestyleNotes] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [uploading, setUploading] = useState(false)
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Define onDrop before useDropzone (must be before the hook that uses it)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.slice(0, 4 - files.length).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: typeof window !== 'undefined' ? URL.createObjectURL(file) : '',
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length])

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 4,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  // Cleanup function for URL objects to prevent memory leaks
  const cleanupPreviews = useCallback(() => {
    files.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview)
      }
    })
  }, [files])

  // Save state to localStorage for persistence
  const saveStateToStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const state = {
        textDescription,
        symptomTypes,
        bodyLocation,
        symptomDuration,
        changeOverTime,
        redFlags,
        productUsage,
        lifestyleTriggers,
        lifestyleNotes,
        timestamp: Date.now()
      }
      localStorage.setItem('uploadState', JSON.stringify(state))
    }
  }, [textDescription, symptomTypes, bodyLocation, symptomDuration, changeOverTime, redFlags, productUsage, lifestyleTriggers, lifestyleNotes])

  // Load state from localStorage
  const loadStateFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uploadState')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          // Only restore if less than 1 hour old
          if (Date.now() - state.timestamp < 3600000) {
            setTextDescription(state.textDescription || '')
            setSymptomTypes(state.symptomTypes || [])
            setBodyLocation(state.bodyLocation || '')
            setSymptomDuration(state.symptomDuration || '')
            setChangeOverTime(state.changeOverTime || '')
            setRedFlags(state.redFlags || { bleeding: false, rapidGrowth: false, fever: false, spreadingFast: false, severeItchPain: false })
            setProductUsage(state.productUsage || '')
            setLifestyleTriggers(state.lifestyleTriggers || [])
            setLifestyleNotes(state.lifestyleNotes || '')
          }
        } catch (error) {
          console.warn('Failed to restore upload state:', error)
        }
      }
    }
  }, [])

  // Use useEffect for redirect to avoid render-time state changes
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Load saved state on component mount
  useEffect(() => {
    loadStateFromStorage()
  }, [loadStateFromStorage])

  // Save state when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(saveStateToStorage, 500) // Debounce saves
    return () => clearTimeout(timeoutId)
  }, [saveStateToStorage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreviews()
      // Stop camera stream if active
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cleanupPreviews, stream])

  useEffect(() => {
    // Detect user's currency for pricing display
    detectUserCurrency().then(currency => {
      setUserCurrency(currency)
      setCurrencyLoading(false)
    }).catch(() => {
      const fallbackCurrency = getUserCurrencyFromLocale()
      setUserCurrency(fallbackCurrency)
      setCurrencyLoading(false)
    })
  }, [])

  // Camera capture handler - MUST be before any early returns
  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFiles = event.target.files
    if (capturedFiles && capturedFiles.length > 0) {
      const newFiles: UploadedFile[] = Array.from(capturedFiles).slice(0, 4 - files.length).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: typeof window !== 'undefined' ? URL.createObjectURL(file) : '',
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
    // Reset the input value so the same photo can be taken again if needed
    if (event.target) {
      event.target.value = ''
    }
  }, [files.length])

  // Helper: Check if user is anonymous (guest)
  const isAnonymousUser = user?.isAnonymous === true
  
  // Helper: Get the email to use for reports
  const getReportEmail = (): string => {
    if (user?.email) return user.email.toLowerCase()
    if (isAnonymousUser && guestEmail) return guestEmail.toLowerCase()
    return ''
  }
  
  // Helper: Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  // Helper: Check if form can be submitted
  const canSubmit = (): boolean => {
    if (files.length === 0) return false
    if (uploading) return false
    // If anonymous, require valid email
    if (isAnonymousUser && !isValidEmail(guestEmail)) return false
    return true
  }

  // Show loading if no user yet
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Check if device is mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Start camera stream
  const startCamera = async () => {
    try {
      if (isMobile()) {
        // On mobile, use the file input with camera capture
        fileInputRef.current?.click()
        return
      }

      // On desktop, use getUserMedia API
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use rear camera if available
        }
      })
      
      setStream(mediaStream)
      setShowCamera(true)
      
      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions or use file upload instead.')
    }
  }

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || files.length >= 4) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const timestamp = Date.now()
        const file = new File([blob], `camera-capture-${timestamp}.jpg`, { type: 'image/jpeg' })
        
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(blob),
        }
        
        setFiles(prev => [...prev, newFile])
      }
    }, 'image/jpeg', 0.8)
  }

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const toRemove = prev.find(f => f.id === id)
      if (toRemove && toRemove.preview) {
        URL.revokeObjectURL(toRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const uploadFiles = async () => {
    if (!storage) throw new Error('Storage not initialized')
    if (!user?.uid) throw new Error('User not authenticated')
    
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.uploaded && file.file) {
        try {
          const sanitizedFileName = file.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const storageRef = ref(storage, `assessments/${user.uid}/${Date.now()}_${sanitizedFileName}`)
          
          const snapshot = await uploadBytes(storageRef, file.file)
          const downloadURL = await getDownloadURL(snapshot.ref)
          uploadedUrls.push(downloadURL)
        } catch (error) {
          console.error(`Upload failed for file ${i + 1}`)
          throw new Error(`Failed to upload file "${file.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async () => {

    try {
      // Enhanced file validation with security checks
      const fileObjects = files.map(f => f.file)
      const validationResult = await validateFiles(fileObjects)
      
      if (!validationResult.valid) {
        console.error('🚨 File validation failed:', validationResult.error)
        logFileUploadAttempt(user?.uid || 'unknown', fileObjects, validationResult.results, false)
        
        // Show specific validation errors
        const firstError = validationResult.results.find(r => !r.valid)?.error
        alert(`File validation failed: ${firstError || validationResult.error}`)
        return
      }

      // Log successful file validation
      logFileUploadAttempt(user?.uid || 'unknown', fileObjects, validationResult.results, true)

      // Validate required fields
      if (files.length === 0) {
        console.error('Validation failed: No files uploaded')
        alert('Please upload at least one photo')
        return
      }



      if (!user?.uid) {
        console.error('Validation failed: No user ID')
        alert('Authentication error. Please log in again.')
        router.push('/login')
        return
      }

      if (!firestore) {
        console.error('Validation failed: Firestore not initialized')
        alert('Database connection error. Please check your internet connection and try again.')
        return
      }

      if (!storage) {
        console.error('Validation failed: Storage not initialized')
        alert('File storage not available. Please check your internet connection and try again.')
        return
      }

      setUploading(true)
      
      // Enhanced file upload with security
      const uploadedUrls = await uploadFilesSecurely()
      
      // Create assessment document in Firestore with enhanced security
      const reportEmail = getReportEmail()
      const assessmentData = {
        email: reportEmail, // Email for sending reports
        reportEmail: reportEmail, // Explicit field for clarity
        isAnonymous: isAnonymousUser,
        timestamp: serverTimestamp(),
        // Structured questionnaire data
        symptomTypes: symptomTypes,
        bodyLocation: bodyLocation.trim().substring(0, 100),
        duration: symptomDuration.trim().substring(0, 100),
        changeOverTime: changeOverTime.trim().substring(0, 100),
        redFlags: redFlags,
        products: productUsage.trim().substring(0, 120),
        lifestyleTriggers: lifestyleTriggers,
        lifestyleNotes: lifestyleNotes.trim().substring(0, 200),
        additionalNotes: textDescription.trim().substring(0, 500),
        files: uploadedUrls,
        userId: user.uid,
        status: 'pending_payment',
        // Security metadata
        ipAddress: 'client-side', // This would be set server-side in production
        userAgent: navigator.userAgent.substring(0, 200),
        uploadTimestamp: new Date().toISOString(),
        fileValidation: {
          totalSize: validationResult.totalSize,
          fileCount: files.length,
          allValid: true
        }
      }
      
      // Saving assessment to Firestore
      
      // Save to Firestore assessments collection
      const docRef = await addDoc(collection(firestore, 'assessments'), assessmentData)
      
      // Assessment saved successfully
      
      // Store assessment data with document ID for payment flow
      const assessmentDataWithId = {
        ...assessmentData,
        id: docRef.id,
        timestamp: new Date().toISOString() // Convert serverTimestamp for sessionStorage
      }
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingAssessment', JSON.stringify(assessmentDataWithId))
        // Clear the upload state since we're moving to payment
        localStorage.removeItem('uploadState')
      }
      
      // Use window.location for more reliable navigation
      window.location.href = '/payment'
      
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      
      // Enhanced error logging
      console.error('🚨 UPLOAD ERROR DETAILS:', {
        error: error.message,
        stack: error.stack?.substring(0, 500),
        userId: user?.uid,
        timestamp: new Date().toISOString()
      })
      
      setUploading(false)
      
      // User-friendly error messages
      if (error.code === 'storage/unauthorized' || error.code === 'storage/unauthenticated') {
        alert('Permission denied. Please log in with Google instead of guest checkout, or contact support.')
        router.push('/login')
      } else if (error.code === 'permission-denied' || error.message.includes('permission')) {
        alert('Firebase permission denied. Guest checkout may not be enabled. Please try logging in with Google.')
        router.push('/login')
      } else if (error.code === 'storage/quota-exceeded') {
        alert('Storage quota exceeded. Please try again later or contact support.')
      } else if (error.message.includes('network')) {
        alert('Network error. Please check your internet connection and try again.')
      } else if (error.message.includes('timed out') || error.message.includes('timeout')) {
        alert('Upload timed out. This may be a permissions issue. Please try logging in with Google instead of guest checkout.')
      } else {
        alert(`Upload failed: ${error.message || 'Unknown error'}. Please try again or contact support.`)
      }
    }
  }

  // Helper: Add timeout to promises
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ])
  }

  // Enhanced secure file upload function
  const uploadFilesSecurely = async (): Promise<string[]> => {
    if (!storage || !user?.uid) {
      throw new Error('Storage or user not available')
    }

    const uploadedUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i]
      
      try {
        // Use secure upload path
        const securePath = createSecureUploadPath(user.uid, fileData.file.name)
        const storageRef = ref(storage, securePath)
        
        // Upload with metadata
        const metadata = {
          contentType: fileData.file.type,
          customMetadata: {
            originalName: fileData.file.name,
            uploadedBy: user.uid,
            uploadedAt: new Date().toISOString(),
            fileSize: fileData.file.size.toString(),
            securityValidated: 'true'
          }
        }
        
        // Add 30 second timeout to upload
        const snapshot = await withTimeout(
          uploadBytes(storageRef, fileData.file, metadata),
          30000,
          'Upload timed out after 30 seconds. Please check your connection and Firebase Storage permissions.'
        )
        
        const downloadURL = await withTimeout(
          getDownloadURL(snapshot.ref),
          10000,
          'Failed to get download URL. Please try again.'
        )
        uploadedUrls.push(downloadURL)
      } catch (error) {
        console.error(`Upload failed for file ${i + 1}`)
        throw new Error(`Failed to upload file "${fileData.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return uploadedUrls
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-3 sm:px-4 lg:px-6 h-12 sm:h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-8 sm:h-10 w-auto"
          />
        </Link>
        <div className="ml-auto flex items-center space-x-3">
          <span className="text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">
            {user.email ? user.email : (isAnonymousUser ? 'Guest' : 'No email')}
          </span>
          <button
            onClick={async () => {
              if (auth) {
                try {
                  await signOut(auth)
                  // Use window.location for immediate redirect to avoid React re-render issues
                  window.location.href = '/login'
                } catch (error) {
                  console.error('Logout failed:', error)
                  window.location.href = '/login'
                }
              }
            }}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 flex items-center"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-blue px-2">
              Upload Your Photos
            </h1>
            <p className="text-sm sm:text-base text-slate-600 px-2">
              Share 1-4 clear photos of your skin concern for professional analysis
            </p>
          </div>

          {/* What You Get - Pricing Expectation Block */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-4 pb-4 sm:pt-5 sm:pb-5">
              <div className="space-y-3">
                {/* Included Today */}
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                    <CheckCircle className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Included today ({currencyLoading ? '£19.97' : formatPrice(userCurrency)}): Same-day AI + human review
                  </h3>
                  <ul className="mt-2 ml-6 space-y-1 text-xs sm:text-sm text-slate-600">
                    <li>• Plain-English summary of what your photos most likely show (and what it may not be)</li>
                    <li>• Actionable next steps (skincare, hygiene, triggers, lifestyle) + when to seek urgent care</li>
                    <li>• Clinician-style note you can share with your doctor or dermatologist</li>
                  </ul>
                </div>
                
                {/* Optional Upgrade */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs sm:text-sm font-medium text-slate-700">
                    Optional upgrade after results (typically {currencyLoading ? '£35' : formatDermatologistPrice(userCurrency)}): Dermatologist review
                  </h4>
                  <ul className="mt-1 ml-0 space-y-0.5 text-xs text-slate-500">
                    <li>• Dermatologist reviews your case and refines the assessment</li>
                    <li>• Updated plain-English plan + more detailed clinician letter</li>
                    <li>• Guidance on what to ask for next (prescriptions / referral), where appropriate</li>
                    <li>• Decide later: No payment is taken now, and charges only apply if you opt-in for this review.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="medical-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Photos ({files.length}/4)</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Upload clear, well-lit photos from different angles if possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="relative">
                      <img
                        src={file.preview}
                        alt="Upload preview"
                        className="w-full h-32 sm:h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {formatFileSize(file.file.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {files.length < 4 && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Drag & Drop Area */}
                <div
                  {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-slate-300 hover:border-brand-blue hover:bg-slate-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-slate-400" />
                  {isDragActive ? (
                    <p className="text-brand-blue text-sm sm:text-base">Drop the photos here...</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-600 text-sm sm:text-base">
                        Drag & drop photos here, or click to select
                      </p>
                      <p className="text-xs text-slate-500">
                        JPEG, PNG, WebP • Max 10MB each • <strong>Up to 4 photos</strong>
                      </p>
                    </div>
                  )}
                  </div>

                  {/* Camera Capture Option - Mobile Optimized */}
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-teal-100 p-2 rounded-full">
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm sm:text-base">Take Photo with Camera</h4>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {typeof window !== 'undefined' && isMobile() ? 'Open your device camera' : 'Use your computer\'s webcam'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          onChange={handleCameraCapture}
                          className="hidden"
                          id="camera-input"
                        />
                        <button
                          onClick={startCamera}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg cursor-pointer transition-colors text-sm"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {typeof window !== 'undefined' && isMobile() ? 'Open Camera' : 'Start Webcam'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900">Photography Tips</h4>
                    <ul className="mt-1 text-blue-800 space-y-1 text-xs sm:text-sm">
                      <li>• Use natural lighting when possible</li>
                      <li>• Take photos from different angles</li>
                      <li>• Ensure the area is clean and clearly visible</li>
                      <li>• Include a reference object for scale if helpful</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structured Questionnaire */}
          <Card className="medical-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>About Your Skin Concern</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Quick questions to help our team provide accurate guidance (2-3 min)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              
              {/* 1. Symptom Type - Multi-select chips */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm sm:text-base">What are you experiencing? <span className="text-slate-500 font-normal">(select all that apply)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {['Rash', 'Spots/Pimples', 'Dry/Flaky', 'Itching', 'Redness', 'Swelling', 'Discolouration', 'Mole/Growth', 'Wound/Sore', 'Other'].map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        setSymptomTypes(prev => 
                          prev.includes(symptom) 
                            ? prev.filter(s => s !== symptom)
                            : [...prev, symptom]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        symptomTypes.includes(symptom)
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Body Location - Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="bodyLocation" className="font-semibold text-sm sm:text-base">Where on your body?</Label>
                <select
                  id="bodyLocation"
                  value={bodyLocation}
                  onChange={(e) => setBodyLocation(e.target.value)}
                  className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select location...</option>
                  <option value="face">Face</option>
                  <option value="scalp">Scalp</option>
                  <option value="neck">Neck</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="stomach">Stomach</option>
                  <option value="arms">Arms</option>
                  <option value="hands">Hands</option>
                  <option value="legs">Legs</option>
                  <option value="feet">Feet</option>
                  <option value="groin">Groin/Private area</option>
                  <option value="multiple">Multiple areas</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* 3. Duration - Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="font-semibold text-sm sm:text-base">How long have you had this?</Label>
                <select
                  id="duration"
                  value={symptomDuration}
                  onChange={(e) => setSymptomDuration(e.target.value)}
                  className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select duration...</option>
                  <option value="today">Just today</option>
                  <option value="few-days">A few days</option>
                  <option value="1-week">About 1 week</option>
                  <option value="2-4-weeks">2-4 weeks</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="over-1-year">Over 1 year</option>
                  <option value="comes-goes">Comes and goes</option>
                </select>
              </div>

              {/* 4. Change Over Time - Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="changeOverTime" className="font-semibold text-sm sm:text-base">Has it changed over time?</Label>
                <select
                  id="changeOverTime"
                  value={changeOverTime}
                  onChange={(e) => setChangeOverTime(e.target.value)}
                  className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select...</option>
                  <option value="getting-worse">Getting worse</option>
                  <option value="getting-better">Getting better</option>
                  <option value="staying-same">Staying the same</option>
                  <option value="spreading">Spreading to new areas</option>
                  <option value="changing-appearance">Changing in appearance</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </div>

              {/* 5. Red Flag Symptoms - Yes/No toggles */}
              <div className="space-y-3">
                <Label className="font-semibold text-sm sm:text-base">Do you have any of these symptoms?</Label>
                <div className="space-y-2 bg-red-50 border border-red-100 rounded-lg p-3">
                  {[
                    { key: 'bleeding', label: 'Bleeding or oozing' },
                    { key: 'rapidGrowth', label: 'Rapid growth or change in size' },
                    { key: 'fever', label: 'Fever or feeling unwell' },
                    { key: 'spreadingFast', label: 'Spreading quickly (within hours)' },
                    { key: 'severeItchPain', label: 'Severe pain or unbearable itching' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-1">
                      <span className="text-sm text-slate-700">{label}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setRedFlags(prev => ({ ...prev, [key]: false }))}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            !redFlags[key]
                              ? 'bg-slate-600 text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedFlags(prev => ({ ...prev, [key]: true }))}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            redFlags[key]
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {Object.values(redFlags).some(v => v) && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    If symptoms are severe, please seek immediate medical attention
                  </p>
                )}
              </div>

              {/* 6. Current Products - Short text */}
              <div className="space-y-2">
                <Label htmlFor="products" className="font-semibold text-sm sm:text-base">Products currently using on this area <span className="text-slate-500 font-normal">(optional)</span></Label>
                <Input
                  id="products"
                  value={productUsage}
                  onChange={(e) => setProductUsage(e.target.value.substring(0, 120))}
                  placeholder="e.g., moisturiser, steroid cream, cleanser"
                  maxLength={120}
                  className="border-2 border-slate-300 bg-white font-medium placeholder:text-slate-400 focus-visible:ring-teal-500 focus-visible:border-teal-500 text-sm"
                />
                <p className="text-xs text-slate-400 text-right">{productUsage.length}/120</p>
              </div>

              {/* 7. Lifestyle/Trigger Changes - Chips + optional text */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm sm:text-base">Any recent changes or triggers? <span className="text-slate-500 font-normal">(select any)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {['New product', 'Stress', 'Diet change', 'Travel', 'Medication', 'Weather', 'Illness', 'None'].map((trigger) => (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => {
                        setLifestyleTriggers(prev => 
                          prev.includes(trigger) 
                            ? prev.filter(t => t !== trigger)
                            : [...prev, trigger]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        lifestyleTriggers.includes(trigger)
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
                {lifestyleTriggers.length > 0 && !lifestyleTriggers.includes('None') && (
                  <Input
                    value={lifestyleNotes}
                    onChange={(e) => setLifestyleNotes(e.target.value.substring(0, 100))}
                    placeholder="Any details? (optional)"
                    maxLength={100}
                    className="mt-2 border-2 border-slate-300 bg-white font-medium placeholder:text-slate-400 focus-visible:ring-teal-500 focus-visible:border-teal-500 text-sm"
                  />
                )}
              </div>

              {/* 8. Optional Free Text - with counter */}
              <div className="space-y-2">
                <Label htmlFor="additionalNotes" className="font-semibold text-sm sm:text-base">Anything else we should know? <span className="text-slate-500 font-normal">(optional)</span></Label>
                <textarea
                  id="additionalNotes"
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value.substring(0, 500))}
                  placeholder="Any other details, medical history, or questions..."
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
                <p className="text-xs text-slate-400 text-right">{textDescription.length}/500</p>
              </div>

            </CardContent>
          </Card>

          {/* Payment Summary Box */}
          <Card className="medical-card border-teal-200 bg-gradient-to-br from-white to-teal-50">
            <CardContent className="pt-5 sm:pt-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Same-Day AI + Human Review</h3>
              </div>
              
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Your photos are encrypted and handled confidentially</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Results typically within 2-4 hours</span>
                </li>
              </ul>

              {/* Email input for anonymous/guest users */}
              {isAnonymousUser && (
                <div className="space-y-2 pt-2 border-t border-teal-100">
                  <Label htmlFor="guestEmail" className="text-sm font-medium text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-teal-600" />
                    Email for your results
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={`border-2 ${guestEmail && !isValidEmail(guestEmail) ? 'border-red-300' : 'border-slate-300'} bg-white font-medium placeholder:text-slate-400 focus-visible:ring-teal-500 focus-visible:border-teal-500`}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Used only to send your report and follow-up link. No marketing.
                  </p>
                  {guestEmail && !isValidEmail(guestEmail) && (
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6 text-base sm:text-lg rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Continue: {currencyLoading ? '£19.97' : formatPrice(userCurrency)}</span>
                  )}
                </Button>
              </div>

              {/* Auth status display */}
              <div className="text-center pt-2 space-y-1">
                {user?.email ? (
                  <p className="text-xs text-slate-600">
                    Signed in as <span className="font-medium">{user.email}</span>
                  </p>
                ) : isAnonymousUser ? (
                  <p className="text-xs text-slate-500">Guest checkout</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto max-h-[60vh] object-cover"
                />
                
                {/* Capture Button Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={capturePhoto}
                    disabled={files.length >= 4}
                    className="bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-medium py-3 px-6 rounded-full shadow-lg transition-colors flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Photo ({files.length}/4)</span>
                  </button>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="text-center text-sm text-gray-600">
                <p>Position your skin concern clearly in the camera view and click "Capture Photo"</p>
                <p>You can take up to {4 - files.length} more photo{4 - files.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  )
} 