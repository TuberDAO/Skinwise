'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, Upload, X, Mic, FileText, Camera, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, storage, firestore } from '@/firebase'
import { formatFileSize } from '@/lib/utils'
import { detectUserCurrency, formatPrice, getUserCurrencyFromLocale, type SupportedCurrency } from '@/lib/currency'
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

  const [symptomDuration, setSymptomDuration] = useState('')
  const [productUsage, setProductUsage] = useState('')
  const [recentChanges, setRecentChanges] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
        symptomDuration,
        productUsage,
        recentChanges,
        timestamp: Date.now()
      }
      localStorage.setItem('uploadState', JSON.stringify(state))
    }
  }, [textDescription, symptomDuration, productUsage, recentChanges])

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
            setSymptomDuration(state.symptomDuration || '')
            setProductUsage(state.productUsage || '')
            setRecentChanges(state.recentChanges || '')
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

  // Show loading if no user yet
  if (!user) {
    return <div>Loading...</div>
  }

  function onDrop(acceptedFiles: File[]) {
    const newFiles: UploadedFile[] = acceptedFiles.slice(0, 4 - files.length).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: typeof window !== 'undefined' ? URL.createObjectURL(file) : '',
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  // Camera capture handler
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
    
    console.log(`Starting upload of ${files.length} files...`)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.uploaded && file.file) {
        try {
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.file.name} (${formatFileSize(file.file.size)})`)
          
          const sanitizedFileName = file.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const storageRef = ref(storage, `assessments/${user.uid}/${Date.now()}_${sanitizedFileName}`)
          
          console.log(`Storage reference: ${storageRef.fullPath}`)
          
          const snapshot = await uploadBytes(storageRef, file.file)
          console.log(`File ${i + 1} uploaded successfully, getting download URL...`)
          
          const downloadURL = await getDownloadURL(snapshot.ref)
          uploadedUrls.push(downloadURL)
          
          console.log(`File ${i + 1} complete: ${downloadURL.substring(0, 50)}...`)
        } catch (error) {
          console.error(`Failed to upload file ${i + 1} (${file.file.name}):`, error)
          throw new Error(`Failed to upload file "${file.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    
    console.log(`All ${uploadedUrls.length} files uploaded successfully`)
    return uploadedUrls
  }

  const handleSubmit = async () => {
    console.log('=== Form Submission Started (SECURITY PROTECTED) ===')
    console.log('Files:', files.length)
    console.log('User email:', user?.email)
    console.log('User ID:', user?.uid)
    console.log('Firebase auth:', !!auth)
    console.log('Firebase firestore:', !!firestore)
    console.log('Firebase storage:', !!storage)

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
      console.log('✅ All files passed security validation')
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

      console.log('=== All validations passed, starting secure upload ===')

      setUploading(true)
      
      // Enhanced file upload with security
      console.log('Starting secure file upload...')
      const uploadedUrls = await uploadFilesSecurely()
      console.log('Files uploaded successfully:', uploadedUrls.length, 'files')
      
      // Create assessment document in Firestore with enhanced security
      const assessmentData = {
        email: user.email?.toLowerCase() || '', // Use authenticated user's email
        timestamp: serverTimestamp(),
        description: textDescription.trim().substring(0, 2000), // Limit description length
        duration: symptomDuration.trim().substring(0, 100),
        products: productUsage.trim().substring(0, 200),
        lifestyleChanges: recentChanges.trim().substring(0, 200),
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
      
      console.log('Saving assessment to Firestore...', {
        email: assessmentData.email,
        filesCount: assessmentData.files.length,
        userId: assessmentData.userId,
        securityChecks: 'passed'
      })
      
      // Save to Firestore assessments collection
      const docRef = await addDoc(collection(firestore, 'assessments'), assessmentData)
      
      console.log('Assessment saved to Firestore with ID:', docRef.id)
      
      // Store assessment data with document ID for payment flow
      const assessmentDataWithId = {
        ...assessmentData,
        id: docRef.id,
        timestamp: new Date().toISOString() // Convert serverTimestamp for sessionStorage
      }
      
      if (typeof window !== 'undefined') {
        console.log('Saving to sessionStorage...')
        sessionStorage.setItem('pendingAssessment', JSON.stringify(assessmentDataWithId))
        // Clear the upload state since we're moving to payment
        localStorage.removeItem('uploadState')
        console.log('SessionStorage updated, localStorage cleared')
      }
      
      console.log('=== Upload successful, redirecting to payment ===')
      
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
      if (error.code === 'storage/unauthorized') {
        alert('Authentication error. Please log in again and try uploading.')
        router.push('/login')
      } else if (error.code === 'storage/quota-exceeded') {
        alert('Storage quota exceeded. Please try again later or contact support.')
      } else if (error.message.includes('network')) {
        alert('Network error. Please check your internet connection and try again.')
      } else {
        alert('Upload failed. Please try again or contact support if the problem persists.')
      }
    }
  }

  // Enhanced secure file upload function
  const uploadFilesSecurely = async (): Promise<string[]> => {
    if (!storage || !user?.uid) {
      throw new Error('Storage or user not available')
    }

    const uploadedUrls: string[] = []
    
    console.log(`🔒 Starting secure upload of ${files.length} files`)
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i]
      
      try {
        console.log(`Uploading file ${i + 1}/${files.length}: ${fileData.file.name} (${formatFileSize(fileData.file.size)})`)
        
        // Use secure upload path
        const securePath = createSecureUploadPath(user.uid, fileData.file.name)
        const storageRef = ref(storage, securePath)
        
        console.log(`🔒 Secure storage path: ${storageRef.fullPath}`)
        
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
        
        const snapshot = await uploadBytes(storageRef, fileData.file, metadata)
        console.log(`File ${i + 1} uploaded successfully, getting download URL...`)
        
        const downloadURL = await getDownloadURL(snapshot.ref)
        uploadedUrls.push(downloadURL)
        
        console.log(`✅ File ${i + 1} complete: ${downloadURL.substring(0, 50)}...`)
      } catch (error) {
        console.error(`❌ Failed to upload file ${i + 1} (${fileData.file.name}):`, error)
        throw new Error(`Failed to upload file "${fileData.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    console.log(`✅ All ${uploadedUrls.length} files uploaded securely`)
    return uploadedUrls
  }

  const startRecording = () => {
    // Voice recording implementation would go here
    setIsRecording(true)
    // For now, just simulate recording
    setTimeout(() => {
      setIsRecording(false)
      setTextDescription(prev => prev + ' [Voice note recorded]')
    }, 3000)
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
        <div className="ml-auto text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">
          {user.email || 'No email'}
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
                        JPEG, PNG, WebP • Max 10MB each • Up to 4 photos
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

          {/* Description */}
          <Card className="medical-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Additional Information</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Help us understand your skin concern better (optional but recommended)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-sm sm:text-base">Description</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <textarea
                    id="description"
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    placeholder="Describe your skin concern, symptoms, pain level, or any other relevant details..."
                    className="flex-1 min-h-[100px] w-full rounded-md border-2 border-slate-500 bg-white px-3 py-2 text-sm font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                  />
                  <Button
                    onClick={startRecording}
                    disabled={isRecording}
                    variant="outline"
                    size="icon"
                    className="shrink-0 self-start sm:self-auto"
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                  </Button>
                </div>
                {isRecording && (
                  <p className="text-xs sm:text-sm text-red-600">Recording... (3 seconds for demo)</p>
                )}
              </div>



              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="font-semibold text-sm sm:text-base">How long have you noticed this?</Label>
                  <Input
                    id="duration"
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    placeholder="e.g., 2 weeks, 3 months"
                    className="border-2 border-slate-500 bg-white font-medium placeholder:text-slate-500 focus-visible:ring-brand-blue focus-visible:border-brand-blue shadow-sm text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="products" className="font-semibold text-sm sm:text-base">Current products you're using</Label>
                  <Input
                    id="products"
                    value={productUsage}
                    onChange={(e) => setProductUsage(e.target.value)}
                    placeholder="e.g., moisturizer, cleanser, medication"
                    className="border-2 border-slate-500 bg-white font-medium placeholder:text-slate-500 focus-visible:ring-brand-blue focus-visible:border-brand-blue shadow-sm text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="changes" className="font-semibold text-sm sm:text-base">Recent changes in routine, environment, or lifestyle</Label>
                <Input
                  id="changes"
                  value={recentChanges}
                  onChange={(e) => setRecentChanges(e.target.value)}
                  placeholder="e.g., new products, stress, diet changes, travel"
                  className="border-2 border-slate-500 bg-white font-medium placeholder:text-slate-500 focus-visible:ring-brand-blue focus-visible:border-brand-blue shadow-sm text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white p-3 sm:p-4 rounded-lg border">
            <Link href="/login" className="text-xs sm:text-sm text-brand-blue hover:underline order-2 sm:order-1">
              ← Change account
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={files.length === 0 || uploading}
              className="bg-brand-blue hover:bg-brand-blue/90 w-full sm:w-auto order-1 sm:order-2"
              size="lg"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Uploading...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">
                  Continue to Payment ({currencyLoading ? '$19.95 USD' : formatPrice(userCurrency)})
                </span>
              )}
            </Button>
          </div>
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