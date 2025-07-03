'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, Eye, Clock, CheckCircle, AlertCircle, User, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore'
import { firestore } from '@/firebase'
import { formatCurrency } from '@/lib/utils'

interface Assessment {
  id: string
  userId: string
  photos: string[]
  textDescription: string
  symptomDuration: string
  productUsage: string
  recentChanges: string
  status: 'pending_payment' | 'paid' | 'in_review' | 'completed' | 'payment_failed'
  createdAt: string
  updatedAt: string
  paidAt?: string
  paymentAmount?: number
  currency?: string
  adminNotes?: string
  analysis?: string
}

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || ['admin@skinwise.com']

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Check admin access
  const isAdmin = user && !user.isAnonymous && user.email && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    // Add null check for firestore
    if (!firestore) {
      console.error('Firestore not initialized')
      setLoading(false)
      return
    }

    // Set up real-time listener for assessments
    let q = query(collection(firestore, 'assessments'), orderBy('createdAt', 'desc'))
    
    if (filterStatus !== 'all') {
      q = query(collection(firestore, 'assessments'), where('status', '==', filterStatus), orderBy('createdAt', 'desc'))
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const assessmentData: Assessment[] = []
      querySnapshot.forEach((doc) => {
        assessmentData.push({ id: doc.id, ...doc.data() } as Assessment)
      })
      setAssessments(assessmentData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin, router, filterStatus])

  const updateAssessmentStatus = async (assessmentId: string, status: Assessment['status']) => {
    if (!firestore) {
      console.error('Firestore not initialized')
      return
    }
    
    try {
      await updateDoc(doc(firestore, 'assessments', assessmentId), {
        status,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating assessment status:', error)
    }
  }

  const saveAssessmentDetails = async () => {
    if (!selectedAssessment || !firestore) {
      if (!firestore) console.error('Firestore not initialized')
      return
    }

    try {
      await updateDoc(doc(firestore, 'assessments', selectedAssessment.id), {
        adminNotes,
        analysis,
        updatedAt: new Date().toISOString(),
      })
      setSelectedAssessment(null)
      setAdminNotes('')
      setAnalysis('')
    } catch (error) {
      console.error('Error saving assessment details:', error)
    }
  }

  const getStatusColor = (status: Assessment['status']) => {
    switch (status) {
      case 'pending_payment': return 'text-yellow-600 bg-yellow-100'
      case 'paid': return 'text-blue-600 bg-blue-100'
      case 'in_review': return 'text-purple-600 bg-purple-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'payment_failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: Assessment['status']) => {
    switch (status) {
      case 'pending_payment': return <Clock className="w-4 h-4" />
      case 'paid': return <DollarSign className="w-4 h-4" />
      case 'in_review': return <Eye className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'payment_failed': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-6 w-auto mr-2"
          />
          <span className="font-bold text-brand-blue">Admin</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Assessments</option>
            <option value="paid">Paid</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
          <span className="text-sm text-slate-600">{user.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Assessment Dashboard</h1>
            <p className="text-gray-600">Manage and review skin health assessments</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assessment List */}
              <div className="lg:col-span-2 space-y-4">
                {assessments.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No assessments found</p>
                    </CardContent>
                  </Card>
                ) : (
                  assessments.map((assessment) => (
                    <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                                {getStatusIcon(assessment.status)}
                                <span className="ml-1">{assessment.status.replace('_', ' ')}</span>
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(assessment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              ID: {assessment.id.substring(0, 16)}...
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {assessment.userId.substring(0, 8)}...
                              </span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {assessment.photos.length} photos
                              </span>
                              {assessment.paymentAmount && (
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {formatCurrency(assessment.paymentAmount / 100, assessment.currency)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {assessment.textDescription || 'No description provided'}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAssessment(assessment)
                                setAdminNotes(assessment.adminNotes || '')
                                setAnalysis(assessment.analysis || '')
                              }}
                            >
                              Review
                            </Button>
                            {assessment.status === 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => updateAssessmentStatus(assessment.id, 'in_review')}
                              >
                                Start Review
                              </Button>
                            )}
                            {assessment.status === 'in_review' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateAssessmentStatus(assessment.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Review Panel */}
              <div className="lg:col-span-1">
                {selectedAssessment ? (
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Review Assessment</CardTitle>
                      <CardDescription>
                        ID: {selectedAssessment.id.substring(0, 16)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">PHOTOS</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {selectedAssessment.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Assessment photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-gray-500">DETAILS</Label>
                          <div className="mt-1 space-y-2 text-sm">
                            <p><strong>Duration:</strong> {selectedAssessment.symptomDuration || 'Not specified'}</p>
                            <p><strong>Products:</strong> {selectedAssessment.productUsage || 'Not specified'}</p>
                            <p><strong>Changes:</strong> {selectedAssessment.recentChanges || 'Not specified'}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-gray-500">DESCRIPTION</Label>
                          <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {selectedAssessment.textDescription || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="admin-notes">Admin Notes</Label>
                          <textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Private notes for internal use..."
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="analysis">Analysis</Label>
                          <textarea
                            id="analysis"
                            value={analysis}
                            onChange={(e) => setAnalysis(e.target.value)}
                            placeholder="Assessment analysis to send to user..."
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={saveAssessmentDetails} className="flex-1">
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedAssessment(null)
                              setAdminNotes('')
                              setAnalysis('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Select an assessment to review</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 