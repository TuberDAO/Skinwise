'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, UserCheck, Stethoscope, Menu, X, ChevronDown, HelpCircle, Quote, User, FileText, Lock, UserX } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { detectUserCurrency, formatPrice, formatDermatologistPrice } from '@/lib/currency'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [userCurrency, setUserCurrency] = useState<'USD' | 'CHF' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SEK' | 'NOK' | 'DKK'>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [exampleModal, setExampleModal] = useState<'patient' | 'doctor' | null>(null)

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const currency = await detectUserCurrency()
        setUserCurrency(currency)
      } catch (error) {
        console.error('Failed to detect currency:', error)
        setUserCurrency('USD')
      } finally {
        setCurrencyLoading(false)
      }
    }
    loadCurrency()
  }, [])

  const getBasePrice = () => currencyLoading ? '£19.97' : formatPrice(userCurrency)
  const getDermatologistPrice = () => currencyLoading ? '£35' : formatDermatologistPrice(userCurrency)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExampleModal(null)
    }
    if (exampleModal) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [exampleModal])

  const openExampleModal = useCallback((type: 'patient' | 'doctor') => {
    setExampleModal(type)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile-First Header - Fixed Navigation Issues */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        {/* Mobile Header - Shows up to 1024px (lg breakpoint) */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-3 py-3 min-h-[64px]">
            {/* Logo Section - More compact for mobile */}
            <Link className="flex items-center space-x-2 flex-shrink-0" href="/">
              <img 
                src="/skinwise-logo.png.png" 
                alt="SkinWise App" 
                className="h-12 w-auto"
              />
              <div className="hidden xs:block">
                <h1 className="text-sm font-bold text-gray-900 leading-tight">
                  SkinWise
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  Smart Skin Diagnostics
                </p>
              </div>
            </Link>
            
            {/* Mobile Menu Button - Ensure proper spacing */}
            <button 
              className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
          
          {/* Mobile Title for very small screens */}
          <div className="xs:hidden px-3 pb-3 text-center">
            <h1 className="text-base font-bold text-gray-900">
              SkinWise
            </h1>
            <p className="text-xs text-gray-500">
              Smart Skin Diagnostics
            </p>
          </div>
        </div>
        
        {/* Desktop Header - Shows from 1024px (lg) and up */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4">
          <Link className="flex items-center space-x-4" href="/">
            <img 
              src="/skinwise-logo.png.png" 
              alt="SkinWise App" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SkinWise
              </h1>
              <p className="text-sm text-gray-500">
                Smart Skin Diagnostics
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors whitespace-nowrap" 
              href="#how-it-works"
            >
              How It Works
            </Link>
            <Link 
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors whitespace-nowrap" 
              href="#when-to-use"
            >
              When to Use
            </Link>
            <Link 
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors whitespace-nowrap" 
              href="#example-reports"
            >
              Example Reports
            </Link>
            <Link 
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors whitespace-nowrap" 
              href="#faq"
            >
              FAQ
            </Link>
            <Link 
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors whitespace-nowrap" 
              href="#testimonials"
            >
              Testimonials
            </Link>
          </nav>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              <Link 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-gray-50 rounded-md transition-colors" 
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-gray-50 rounded-md transition-colors" 
                href="#when-to-use"
                onClick={() => setMobileMenuOpen(false)}
              >
                When to Use
              </Link>
              <Link 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-gray-50 rounded-md transition-colors" 
                href="#example-reports"
                onClick={() => setMobileMenuOpen(false)}
              >
                Example Reports
              </Link>
              <Link 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-gray-50 rounded-md transition-colors" 
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-gray-50 rounded-md transition-colors" 
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Trust-Forward, Clinical */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-8">
          <div className="text-center space-y-2 sm:space-y-3">
            {/* How to Use Graphic - Mobile-first, wider on small screens */}
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-0">
              <img 
                src="/how-to-use-skinwise.png" 
                alt="How to use SkinWise - Take a photo, Send securely, results reviewed by a human" 
                className="w-full h-auto object-contain max-h-40 sm:max-h-52 md:max-h-64 lg:max-h-72 xl:max-h-80 rounded-xl sm:rounded-2xl shadow-sm"
              />
            </div>

            {/* Headlines - Trust-forward, clinical */}
            <div className="space-y-1 sm:space-y-1.5 max-w-4xl mx-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                Fast skin photo assessment:{" "}
                <span className="text-teal-700">reviewed by a human</span>
              </h1>
              <h2 className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Upload photos & a short description. We'll send a clear analysis + a doctor-friendly note. <strong>Private by default</strong>, no names shared with reviewers.
              </h2>
              <p className="text-xs sm:text-xs md:text-sm text-gray-500 max-w-2xl mx-auto">
                One-time assessment fee. No subscription.
              </p>
            </div>

            {/* AI mention - demoted to secondary text */}
            <p className="text-xs text-gray-500 max-w-xl mx-auto">
              AI-assisted triage, then checked by a trained reviewer for clarity and safety.
            </p>

            {/* CTA Button - Compact */}
            <div className="max-w-sm mx-auto space-y-1.5">
              <Link href="/login">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm sm:text-base py-2.5 sm:py-3 px-6 shadow-lg transition-colors">
                  Start Secure Skin Assessment
                </Button>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                {currencyLoading ? '£19.97' : formatPrice(userCurrency)} • Results in 2 to 4 hours
              </p>
              <p className="text-xs text-gray-700 text-center font-bold leading-snug">
                One-time assessment fee. No subscription.
              </p>
              <p className="text-xs text-gray-500 text-center leading-snug">
                If your concern appears urgent, we will clearly advise in-person care.
              </p>
              
              {/* Trust Indicators - Compact */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 pb-1 max-w-md mx-auto">
                <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Encrypted uploads</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                  <UserX className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Anonymous option</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                  <Shield className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Private by default</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Human reviewed</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-1 pt-1">
                <Link 
                  href="#example-reports" 
                  className="text-xs text-teal-700 hover:text-teal-800 underline underline-offset-2 transition-colors"
                >
                  See example reports
                </Link>
                <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                  <button 
                    onClick={() => {
                      document.getElementById('example-reports')?.scrollIntoView({ behavior: 'smooth' })
                      setTimeout(() => openExampleModal('patient'), 500)
                    }}
                    className="hover:text-teal-700 underline underline-offset-2 transition-colors"
                  >
                    Patient summary
                  </button>
                  <span>|</span>
                  <button 
                    onClick={() => {
                      document.getElementById('example-reports')?.scrollIntoView({ behavior: 'smooth' })
                      setTimeout(() => openExampleModal('doctor'), 500)
                    }}
                    className="hover:text-teal-700 underline underline-offset-2 transition-colors"
                  >
                    Doctor letter
                  </button>
                </div>
              </div>
              <Link 
                href="#testimonials" 
                className="inline-block text-xs text-teal-700 hover:text-teal-800 underline underline-offset-2 transition-colors"
              >
                See testimonials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar - Compact grid of trust signals */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700">
              <Shield className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Private photo handling</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>2 to 4 hours typical</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700">
              <UserCheck className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Anonymous option</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700">
              <Stethoscope className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Clear next steps + referral letter</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm text-gray-700 col-span-2 sm:col-span-1">
              <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>No cosmetic upselling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Safety Note - Calm, subtle */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <p className="text-xs sm:text-sm text-amber-800 text-center">
            <span className="font-medium">Not for emergencies.</span> If symptoms are severe or rapidly worsening, seek urgent medical care.
          </p>
        </div>
      </section>

      {/* Skin Assessment Section - Human-first positioning */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Headlines */}
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Professional Skin Assessment
              </h2>
              <h3 className="text-base sm:text-lg md:text-xl text-gray-700">
                Concerned About a Skin Change?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Get a detailed assessment for rashes, moles, lesions, discoloration or any other skin issue: reviewed by a trained professional.
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Our assessment process uses AI to assist with initial triage, but every case is checked by a trained reviewer. 
              For added peace of mind, you can opt to have your case reviewed by a licensed dermatologist. 
              We offer ethical guidance: no cosmetic upselling, ever. This service is for over 18s only.
            </p>

            {/* Features Grid - Better Mobile Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <div className="text-center space-y-4 p-4 md:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Results in 2 to 4 hours</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Fast, reliable analysis when you need answers</p>
                </div>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Optional dermatologist review</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Licensed dermatologist consultation available after results</p>
                </div>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Private & ethical approach</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Confidential & no cosmetic upselling</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link href="/login">
                <Button className="bg-teal-700 hover:bg-teal-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-lg transition-colors">
                  Get Your Skin Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* When to Use Section - Fixed Mobile Layout */}
      <section id="when-to-use" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                When Should You Use SkinWise?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Our service is designed for concerning skin changes that need professional attention
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="border-teal-200 bg-teal-50/50">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-teal-700 flex-shrink-0" />
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl text-teal-900">Use SkinWise For:</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-left">
                    {[
                      "New or changing moles or spots",
                      "Persistent rashes or skin irritation", 
                      "Unusual discoloration or lesions",
                      "Skin growths or bumps",
                      "Areas that won't heal or keep returning",
                      "Or any other skin concern you have"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - PROPER MOBILE RESPONSIVE */}
      <section id="how-it-works" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Professional Assessment Process
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Secure, professional analysis designed for healthcare-focused guidance
              </p>
            </div>
            
            {/* Process Cards - MOBILE FIRST: Stack vertically, then 2 cols, then 4 cols */}
            <div className="space-y-6 md:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6 max-w-7xl mx-auto">
              <Card className="bg-white shadow-sm border-gray-200 mx-auto max-w-md lg:max-w-none">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl font-bold">1</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-lg text-gray-900 font-semibold whitespace-nowrap">
                    Secure Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Upload clear photos & describe your concern.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-gray-200 mx-auto max-w-md lg:max-w-none">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl font-bold">2</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-lg text-gray-900 font-semibold whitespace-nowrap">
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Advanced AI examines your skin concern, and we'll send you a clear, preliminary explanation of what it may be.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-gray-200 mx-auto max-w-md lg:max-w-none">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl font-bold">3</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-lg text-gray-900 font-semibold whitespace-nowrap">
                    Referral Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Downloadable referral letter in medical terms to give your dermatologist, with optional case review by a certified dermatologist via email.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-gray-200 mx-auto max-w-md lg:max-w-none">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg sm:text-xl font-bold">4</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-lg text-gray-900 font-semibold whitespace-nowrap">
                    Pathway Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    If further attention is recommended, we offer clear next steps and referral guidance to ensure you can access professional care with ease and confidence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics Section - Fixed Mobile Layout */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Our Medical Ethics Promise
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Healthcare-focused guidance without commercial bias or hidden agendas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <div className="text-center space-y-4 p-4 md:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">No Product Sales</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We don't upsell cosmetic products. Our recommendations focus purely on your health.
                </p>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words hyphens-auto">Health-First Approach</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words hyphens-auto">
                  We prioritize identifying health concerns and root causes.
                </p>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words hyphens-auto">Professional Standards</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words hyphens-auto">
                  Every assessment follows established medical guidelines and professional standards of care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Fixed Mobile Layout */}
      <section id="faq" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10 max-w-4xl mx-auto">
            <div className="space-y-3 sm:space-y-4">
              <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-teal-700 mx-auto" />
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Get answers to common questions about SkinWiseapp
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              {[
                {
                  q: "What is SkinWiseapp and how does it work?",
                  a: "SkinWiseapp is a fast, affordable way to get a preliminary assessment of any visible skin concern; using expert-trained AI & human review. You upload up to 4 photos and provide a brief description. Within 2-4 hours, you receive a clear, easy-to-read explanation of what the issue may be; plus a letter written for medical professionals that you can take to your dermatologist. SkinWiseapp supports assessments for any skin condition, anywhere on the body. Strictly confidential with an anonymous login option."
                },
                {
                  q: `What do I get for ${getBasePrice()}?`,
                  a: "You'll receive:\nA detailed PDF report that includes an AI-assisted analysis based on your submitted photos and description, written in clear, everyday language to help you understand your skin concern.\nA medically formatted letter for your Doctor or dermatologist, written in clinical terms.\nResults delivered within 2-4 hours directly to your email."
                },
                {
                  q: "Can I get a certified dermatologist to review my case in more detail?",
                  a: `Yes. After your initial results, you can request a more detailed review by a certified dermatologist for ${getDermatologistPrice()}. You'll receive an expert evaluation, clinical letter, and next steps; typically within 1 to 2 days.`
                },
                {
                  q: "What kinds of skin problems can this help with?",
                  a: "SkinWiseapp is designed for any visible skin concern; whether it's a rash, spot, mole, discolouration, irritation, swelling or chronic condition. We examine any skin condition anywhere on the body."
                },
                {
                  q: "Is this like those instant AI skin apps?",
                  a: "No, and that's intentional. Many apps give instant results that are often wrong. SkinWiseapp takes up to 2-4 hours because your submission is carefully evaluated using medically informed AI workflows and human review. Accuracy is our top priority. We also offer further analysis with a certified dermatologist. Also, please note, to protect your data and ensure the best results, please ensure you're using the official SkinWise app. Other apps may have similar names, but you can always identify us by our official logo and our domain: skinwiseapp.com"
                },
                {
                  q: "How long does it take to get results?",
                  a: "Your initial human reviewed AI-assisted assessment is delivered within 2 to 4 hours, some cases may take 24hrs but most are within a few hours. If you choose certified dermatologist review, that report usually arrives within 1 to 2 days."
                },

                {
                  q: "Who can use SkinWiseapp?",
                  a: "SkinWiseapp is available globally. You must be 18yrs old or older to use SkinWiseapp."
                }
              ].map((faq, index) => (
                <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left text-sm sm:text-base lg:text-lg text-gray-900 pr-4 break-words hyphens-auto">{faq.q}</CardTitle>
                      <ChevronDown 
                        className={`h-5 w-5 text-teal-700 transition-transform duration-200 flex-shrink-0 ${
                          openFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {openFAQ === index && (
                    <CardContent className="pt-0">
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line break-words hyphens-auto" style={{ wordBreak: 'keep-all' }}>{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            {/* Section Header */}
            <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Testimonials
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Feedback from real users (names changed for privacy)
              </p>
            </div>
            
            {/* Testimonial Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Testimonial 1 - Ms Anne */}
              <Card className="bg-white shadow-md border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up">
                <CardContent className="p-6 space-y-4">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-teal-200 -mb-2" />
                  
                  {/* Quote Text */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                    "I wanted to share my sincere gratitude for the guidance I received. I am now fully recovered and it's a relief to finally be comfortable and pain-free in my daily life again. I truly appreciate the assessments provided; wishing the entire team nothing but the best."
                  </p>
                  
                  {/* User Info - single flex row: avatar, name, badge */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 border-t border-gray-100 min-h-[3rem]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden>
                      <span className="text-sm sm:text-base font-semibold text-teal-700">AA</span>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap flex-shrink-0 ">Ms Anne</p>
                    <span className="inline-flex flex-shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap ml-auto">
                      Positive outcome
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 - Mr Ben */}
              <Card className="bg-white shadow-md border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-6 space-y-4">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-teal-200 -mb-2" />
                  
                  {/* Quote Text */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                    "Thanks. This is the first photo I've taken and I will take periodic photos as advised. The letter you wrote for my doctor was also very handy, he quickly arranged an appointment with the local dermatologist. Great service."
                  </p>
                  
                  {/* User Info - single flex row: avatar, name, badge */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 border-t border-gray-100 min-h-[3rem]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden>
                      <span className="text-sm sm:text-base font-semibold text-blue-700">BK</span>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap flex-shrink-0 ">Mr Ben</p>
                    <span className="inline-flex flex-shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap ml-auto">
                      Helpful referral letter
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 - Ms Chloe */}
              <Card className="bg-white shadow-md border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-6 space-y-4">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-teal-200 -mb-2" />
                  
                  {/* Quote Text */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                    "A very fast response, both the AI review and the online dermatologist put my mind at rest. Thank you."
                  </p>
                  
                  {/* User Info - single flex row: avatar, name, badge */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 border-t border-gray-100 min-h-[3rem]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden>
                      <span className="text-sm sm:text-base font-semibold text-purple-700">CH</span>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap flex-shrink-0 ">Ms Chloe</p>
                    <span className="inline-flex flex-shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap ml-auto">
                      Fast reassurance
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Disclosure */}
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto pt-4">
              Individual experiences vary. SkinWise is not a substitute for professional medical diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* Example Reports Section */}
      <section id="example-reports" className="bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            {/* Section Header */}
            <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Example of What You'll Receive
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                You will receive two letters in a similar format to the examples below, one written for you and one that you can give to your doctor.
              </p>
            </div>
            
            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Patient Summary Card */}
              <button
                onClick={() => openExampleModal('patient')}
                className="text-left group"
              >
                <Card className="bg-white shadow-md border-gray-200 hover:shadow-xl hover:border-teal-300 transition-all duration-300 h-full">
                  <CardContent className="p-6 space-y-4">
                    {/* Document Header */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Patient Summary</h3>
                        <p className="text-xs text-gray-500">(Plain English)</p>
                      </div>
                    </div>
                    
                    {/* Preview Content */}
                    <div className="space-y-2 text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700">Summary of Your Concern</p>
                      <p className="line-clamp-2">Based on the photos you provided showing a mole on your forehead, we reviewed a pigmented skin lesion...</p>
                      <p className="font-medium text-gray-700 pt-2">Key Observations</p>
                      <p className="line-clamp-1">• Location: Forehead, near the hairline...</p>
                    </div>
                    
                    {/* Click to expand */}
                    <p className="text-xs text-teal-700 font-medium group-hover:text-teal-800 transition-colors flex items-center">
                      Click to view full example
                      <ChevronDown className="h-3 w-3 ml-1 -rotate-90" />
                    </p>
                  </CardContent>
                </Card>
              </button>

              {/* Doctor Letter Card */}
              <button
                onClick={() => openExampleModal('doctor')}
                className="text-left group"
              >
                <Card className="bg-white shadow-md border-gray-200 hover:shadow-xl hover:border-teal-300 transition-all duration-300 h-full">
                  <CardContent className="p-6 space-y-4">
                    {/* Document Header */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Doctor Letter</h3>
                        <p className="text-xs text-gray-500">(Medical Format)</p>
                      </div>
                    </div>
                    
                    {/* Preview Content */}
                    <div className="space-y-2 text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700">RE: Pigmented lesion of the forehead</p>
                      <p className="line-clamp-2">Dear Doctor, Thank you for reviewing this patient, who presents with a pigmented lesion...</p>
                      <p className="font-medium text-gray-700 pt-2">Clinical impression</p>
                      <p className="line-clamp-1">The lesion demonstrates several reassuring features...</p>
                    </div>
                    
                    {/* Click to expand */}
                    <p className="text-xs text-teal-700 font-medium group-hover:text-teal-800 transition-colors flex items-center">
                      Click to view full example
                      <ChevronDown className="h-3 w-3 ml-1 -rotate-90" />
                    </p>
                  </CardContent>
                </Card>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Fixed Mobile Layout */}
      <section className="bg-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white break-words hyphens-auto">
              Ready to Get Your Skin Assessment?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-teal-100 break-words hyphens-auto">
              Get trusted guidance for your skin. Fast, Private and Affordable
            </p>
            <Link href="/login">
              <Button className="bg-white text-teal-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-lg transition-colors">
                Start Your Assessment Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Fixed Mobile Layout */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/skinwise-logo.png.png" 
                  alt="SkinWise App" 
                  className="h-8 w-auto"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold">SkinWise</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Smart Skin Diagnostics</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words hyphens-auto">
                Professional AI-assisted skin assessments with optional dermatologist review.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors break-words hyphens-auto">Skin Assessment</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors break-words hyphens-auto">How It Works</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors break-words hyphens-auto">FAQ</Link></li>
                <li><Link href="#testimonials" className="hover:text-white transition-colors break-words hyphens-auto">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors break-words hyphens-auto">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors break-words hyphens-auto">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Contact</h4>
              <p className="text-xs sm:text-sm text-gray-400 break-words hyphens-auto">
                For support and inquiries, please use the contact form in your assessment portal.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-400 break-words hyphens-auto">
              © SkinWiseapp 2026. All rights reserved. Professional medical advice should always be sought for serious concerns.
            </p>
          </div>
        </div>
      </footer>

      {/* Example Report Modal */}
      {exampleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setExampleModal(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                {exampleModal === 'patient' ? (
                  <>
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Patient Summary</h3>
                      <p className="text-xs text-gray-500">Plain English Format</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Doctor Letter</h3>
                      <p className="text-xs text-gray-500">Medical Format</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setExampleModal(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {exampleModal === 'patient' ? (
                <div className="space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Note:</strong> This is an illustrative template for demonstration purposes only.
                  </div>
                  <div className="prose prose-sm max-w-none text-justify space-y-4 [&_p]:mb-3 [&_h4]:mt-6 [&_h4]:mb-2 [&_ul]:my-3">
                    <h4 className="font-semibold text-gray-900 mb-2">RE: SkinWiseApp Examination Report and Attached Doctor Letter</h4>
                    <p>Dear SkinWiseApp Customer,</p>
                    <p>Thank you for sending your photographs and the background information about your skin.</p>
                    <p>Based on the images you provided and the information included in your submission form, the overall appearance most strongly suggests tinea faciei, which is a fungal infection affecting the skin of the face.</p>
                    <p>A fungal infection means that microscopic organisms called dermatophytes are growing in the outer layer of the skin. Dermatophytes are fungi that feed on keratin, which is the protein found in the outer layer of skin, hair, and nails. When these organisms grow on the skin they can cause red patches, scaling, and itching.</p>
                    <p>This condition is sometimes called facial ringworm, although there is no worm involved. The name comes from the circular shape that the rash often forms on the skin.</p>
                    <p>The important positive point is that this condition is very common, very treatable, and usually clears completely once the correct treatment is started.</p>
                    <p>To be clear, the list below is not saying that you definitely have several conditions at the same time. It is simply a ranked list of the most likely explanations based on the photographs and the information you provided.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Most likely possibilities</h4>
                    <p><strong>Tinea faciei (facial fungal infection) about 80 percent likely</strong></p>
                    <p>This is the most likely explanation. Tinea faciei is caused by dermatophyte fungi growing in the outer layer of facial skin. These infections usually appear as round or oval red patches with a slightly raised edge and a clearer centre.</p>
                    <p>This diagnosis fits because the patch on your skin appears circular with a more inflamed outer border and mild surface scaling. The edge of the rash looks more active than the centre, which is a classic pattern for fungal skin infections.</p>
                    <p><strong>Nummular eczema about 12 percent likely</strong></p>
                    <p>Nummular eczema is a form of eczema that produces round patches of inflamed skin. The word nummular means coin shaped. These patches can look similar to fungal infections but usually have less clearly defined borders and tend to be more generally dry across the whole patch.</p>
                    <p><strong>Granuloma annulare about 8 percent likely</strong></p>
                    <p>Granuloma annulare is a skin condition where small clusters of immune cells form ring shaped patterns in the skin. These patches are typically smooth rather than scaly. Because your patch appears slightly scaly and irritated, this possibility is less likely.</p>
                    <p>In simpler terms, the appearance of the rash most strongly suggests a superficial fungal infection rather than eczema or another inflammatory condition.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">What I can see in the photographs</h4>
                    <p>From the images alone, I can see:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>a round red patch on the facial skin</li>
                      <li>a slightly raised and more inflamed border around the patch</li>
                      <li>mild scaling and dryness across the surface</li>
                      <li>a centre that appears slightly calmer than the outer edge</li>
                      <li>a pattern that commonly occurs with superficial fungal infections</li>
                    </ul>
                    <p>I do not see thick yellow crusting, pus filled spots, or blistering in the photographs. That makes a bacterial infection less likely at this stage.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">About fungal skin infections</h4>
                    <p>Fungal skin infections occur when dermatophyte fungi grow in the outermost layer of the skin. These organisms are very common and can be picked up through contact with infected skin, animals, shared towels, bedding, gym equipment, or sometimes from fungal infections on other parts of the body such as the feet.</p>
                    <p>The infection stays in the outer layer of the skin but can slowly spread outward if untreated.</p>
                    <p>The reassuring news is that once antifungal treatment is started, most cases improve significantly within one to two weeks and usually clear fully within about three to four weeks. Even before treatment is started, following the advice below can help reduce irritation and slow the spread.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Why the shape of the rash matters</h4>
                    <p>Fungal infections tend to expand slowly from the centre outward. The outer edge is where the fungus is actively growing, which is why that area often looks redder and slightly raised. The centre may look calmer because the infection has already moved outward from that area.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Product by product advice</h4>
                    <p>During the information submission stage you mentioned that you are currently using several skincare products. These products are discussed below only because you listed them in your submission. SkinWiseApp is not recommending these products. The comments below are simply guidance on whether it may be sensible to continue or pause them while the rash is present.</p>
                    <p><strong>CeraVe Moisturising Cream</strong></p>
                    <p>This is the one product that may be reasonable to continue using because it is a simple moisturiser designed to support the skin barrier. The skin barrier refers to the outer protective layer of skin that helps prevent dryness, irritation, and water loss.</p>
                    <p><strong>How to use CeraVe Moisturising Cream in this situation</strong></p>
                    <p>Wash your hands first.</p>
                    <p>Clean the face gently using lukewarm water and a mild cleanser if needed. Pat the skin dry with a clean towel rather than rubbing it.</p>
                    <p>Squeeze out a small amount of the cream about the size of a small pea onto a clean fingertip.</p>
                    <p>Gently spread the cream onto the surrounding dry skin on the face using light movements. The goal is to moisturise the surrounding skin rather than cover the active rash heavily.</p>
                    <p>Try to leave a small gap of a few millimetres around the outer edge of the rash so the cream does not sit directly on the most inflamed border.</p>
                    <p>Do not rub the cream in aggressively. Instead lightly smooth it across the skin until it forms a thin layer.</p>
                    <p>Use the cream once in the morning and once in the evening if the surrounding skin feels dry or tight.</p>
                    <p>Wash your hands again after applying it so that any organisms on the skin are not transferred to other areas.</p>
                    <p><strong>Paula&apos;s Choice 2 percent BHA Liquid Exfoliant</strong></p>
                    <p>I would stop using this product for now.</p>
                    <p>BHA stands for beta hydroxy acid, which is a chemical exfoliant used to remove dead skin cells and treat acne. Exfoliating acids can irritate inflamed skin and may worsen redness and stinging if applied to an active rash.</p>
                    <p><strong>Tea tree oil spot treatment</strong></p>
                    <p>I would also stop this for now.</p>
                    <p>Tea tree oil has antimicrobial properties, but it can irritate facial skin and sometimes cause contact dermatitis, which is a skin reaction caused by irritation or allergy. Applying essential oils directly to inflamed skin can increase irritation.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Makeup and daily activities</h4>
                    <p>Many people ask whether they can continue wearing makeup. If possible, it is best to avoid makeup directly over the rash while the skin is healing, especially heavy foundations or concealers. These can trap moisture and irritate the skin.</p>
                    <p>If makeup is needed for work or social reasons, try to keep it minimal and avoid applying it directly onto the affected patch. Use clean brushes or applicators and wash them regularly to reduce the chance of spreading the infection.</p>
                    <p>You can otherwise continue most normal daily activities. The infection is usually mild and does not affect general health.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">What to avoid for now</h4>
                    <p>For the next several days I would avoid:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>exfoliating acids</li>
                      <li>scrubs or abrasive cleansers</li>
                      <li>essential oils on the face</li>
                      <li>fragranced skincare</li>
                      <li>heavy makeup over the rash</li>
                      <li>trying several new skincare products at the same time</li>
                      <li>sharing towels or pillowcases with others</li>
                    </ul>
                    <p>The aim right now is to reduce irritation and prevent the rash from spreading further.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Practical steps that can help recovery</h4>
                    <p>Change pillowcases every one to two days while the rash is active.</p>
                    <p>Use a separate face towel and avoid sharing towels with other people.</p>
                    <p>Wash hands after touching the rash.</p>
                    <p>If you have athlete&apos;s foot or fungal infection on the feet, make sure that is treated as well because fungal infections can sometimes spread from one area of the body to another.</p>
                    <p>Avoid scratching the rash because scratching can spread the infection to nearby skin.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">What to do over the next few days</h4>
                    <p>Keep the routine simple and gentle. Wash the face using lukewarm water and a mild cleanser if needed.</p>
                    <p>Avoid exfoliating products and essential oils.</p>
                    <p>Use a simple moisturiser on surrounding dry skin if needed.</p>
                    <p>Arrange a medical review so the rash can be examined properly.</p>
                    <p>A Doctor or Dermatologist may confirm the diagnosis by examining the rash closely. Sometimes a small skin scraping is taken and examined under a microscope to look for fungal organisms.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Do you need to see a Doctor or Dermatologist</h4>
                    <p>Yes. I would recommend arranging an appointment with a Doctor or Dermatologist within the next few days.</p>
                    <p>If this is a fungal infection, treatment usually involves antifungal creams. Antifungal medicines specifically kill dermatophyte fungi and allow the skin to heal.</p>
                    <p>Most people start to notice improvement within one to two weeks after starting treatment, and the skin usually returns to normal over the following weeks.</p>
                    <p>A Doctor or Dermatologist will also check that the rash is not another condition that can occasionally mimic fungal infections.</p>
                    <p>A helpful way to explain the issue at the appointment would be:</p>
                    <p>&quot;This patch on my face appeared recently and seems to be slowly expanding. It is slightly itchy and round with a red border. I have been advised that it may be a fungal infection called tinea faciei and would like it examined.&quot;</p>
                    <p>If you cannot get a timely appointment</p>
                    <p>If you cannot arrange a prompt appointment with a Doctor or Dermatologist, please let us know and we will organise a longer and more thorough dermatology review.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">When you need faster help</h4>
                    <p>Please seek urgent medical advice if any of the following occur:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>the rash spreads rapidly across the face</li>
                      <li>the skin becomes very painful or swollen</li>
                      <li>you develop pus, blistering, or severe crusting</li>
                      <li>the rash spreads close to the eye area</li>
                    </ul>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Final summary</h4>
                    <p>The appearance in the photographs is most consistent with tinea faciei, which is a fungal infection affecting the outer layer of facial skin. The other possibilities listed above are much less likely based on the pattern seen in the images.</p>
                    <p>The positive news is that this condition is usually very treatable and temporary once the correct treatment is started.</p>
                    <p>The most sensible next steps are:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>keep the skincare routine simple</li>
                      <li>avoid exfoliating products and essential oils</li>
                      <li>moisturise surrounding dry skin if needed</li>
                      <li>avoid makeup directly over the rash</li>
                      <li>arrange examination with a Doctor or Dermatologist</li>
                    </ul>
                    <p>Thank you for using SkinWiseApp and we wish you a quick recovery.</p>
                    <p>Kind Regards</p>
                    <p>SkinWiseApp Team</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Note:</strong> This is an illustrative template for demonstration purposes only.
                  </div>
                  <div className="prose prose-sm max-w-none text-justify space-y-4 [&_p]:mb-3 [&_h4]:mt-6 [&_h4]:mb-2 [&_ul]:my-3">
                    <h4 className="font-semibold text-gray-900 mb-2">RE: SkinWiseApp Clinical Summary and Referral Information</h4>
                    <p>Dear Doctor / Dermatologist,</p>
                    <p>Thank you for reviewing this patient following an initial remote assessment performed through SkinWiseApp.</p>
                    <p>The patient submitted facial photographs and a short clinical history through the SkinWiseApp platform. Based on the visual findings and the information provided, the working impression from the remote review is tinea faciei, a superficial dermatophyte infection of the facial skin. This letter summarises the observations and differential considerations to assist with clinical assessment.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Clinical summary</h4>
                    <p>The patient submitted photographs demonstrating a solitary erythematous annular plaque on the facial skin. The lesion appears to show:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>a well defined circular or oval erythematous plaque</li>
                      <li>peripheral accentuation with a mildly raised inflammatory border</li>
                      <li>fine superficial scaling across the lesion surface</li>
                      <li>relative central clearing compared with the active border</li>
                      <li>no visible pustulation, vesiculation, or honey coloured crusting</li>
                    </ul>
                    <p>The lesion morphology and pattern of peripheral inflammatory activity are strongly suggestive of a dermatophyte infection involving the glabrous skin of the face, consistent with tinea faciei.</p>
                    <p>There are no obvious visual features suggesting acute bacterial infection, impetiginisation, vesiculobullous disease, or severe inflammatory dermatosis in the images reviewed.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Differential diagnosis</h4>
                    <p>Based on photographic assessment, the ranked diagnostic considerations were as follows.</p>
                    <p><strong>Tinea faciei approximately 80 percent likelihood</strong></p>
                    <p>Tinea faciei represents infection of facial skin by dermatophyte species, most commonly Trichophyton rubrum, Trichophyton mentagrophytes, or Microsporum species. The lesion morphology is consistent with a typical annular dermatophyte plaque demonstrating peripheral inflammatory activity and central clearing.</p>
                    <p><strong>Nummular dermatitis approximately 12 percent likelihood</strong></p>
                    <p>Nummular dermatitis may produce coin shaped erythematous plaques with scaling. However these lesions generally lack the sharply defined advancing border characteristic of dermatophyte infection and often demonstrate more uniform inflammation throughout the plaque.</p>
                    <p><strong>Granuloma annulare approximately 8 percent likelihood</strong></p>
                    <p>Granuloma annulare may produce annular plaques but typically presents with smooth dermal papules forming a ring and generally lacks surface scaling. The visible surface scale in this lesion makes granuloma annulare less likely.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Patient reported skincare products</h4>
                    <p>During the submission process the patient reported current use of the following skincare products.</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>CeraVe Moisturising Cream</li>
                      <li>Paula&apos;s Choice 2 percent BHA Liquid Exfoliant</li>
                      <li>Tea tree oil spot treatment</li>
                    </ul>
                    <p>These products were referenced only because the patient reported their use. SkinWiseApp has not recommended these products.</p>
                    <p>The patient was advised to temporarily discontinue exfoliating acids and essential oils due to the risk of irritant dermatitis or barrier disruption during active inflammation.</p>
                    <p>A simple moisturiser was considered acceptable for surrounding skin barrier support provided it is not applied directly to the active lesion.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">General advice given to the patient</h4>
                    <p>The patient was advised to simplify the skincare routine and avoid potentially irritating topical agents including:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>beta hydroxy acid exfoliants</li>
                      <li>essential oils</li>
                      <li>fragranced products</li>
                      <li>abrasive cleansers</li>
                    </ul>
                    <p>They were advised to maintain basic hygiene measures including avoiding sharing towels and changing pillowcases regularly, as dermatophyte transmission can occur through contaminated fabrics.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Clinical course and prognosis</h4>
                    <p>The patient was advised that dermatophyte infections of facial skin are typically responsive to antifungal therapy and generally resolve within approximately two to four weeks once appropriate treatment is initiated.</p>
                    <p>They were also advised that untreated lesions may gradually expand centrifugally and occasionally spread to adjacent skin areas.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Reason for medical review</h4>
                    <p>Given that the assessment was conducted remotely and definitive diagnosis cannot be confirmed without examination, the patient has been advised to seek evaluation by a Doctor or Dermatologist for:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>direct clinical examination</li>
                      <li>confirmation of diagnosis</li>
                      <li>consideration of potassium hydroxide microscopy or fungal culture if clinically indicated</li>
                      <li>initiation of appropriate antifungal therapy</li>
                    </ul>
                    <p>Typical management may include topical antifungal therapy such as terbinafine, clotrimazole, or ketoconazole, although treatment decisions are of course at the clinician&apos;s discretion.</p>
                    <p>If the diagnosis is confirmed clinically, treatment with topical antifungal therapy for approximately two to four weeks would typically be expected to result in resolution.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Red flag guidance</h4>
                    <p>The patient was advised to seek urgent care if there is rapid lesion expansion, marked inflammation, secondary infection, or extension toward the periorbital region.</p>
                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Closing summary</h4>
                    <p>In summary, the lesion morphology appears most consistent with tinea faciei, with other annular inflammatory dermatoses considered less likely based on the photographic findings.</p>
                    <p>We would be grateful for your clinical evaluation and management of this patient.</p>
                    <p>Please do not hesitate to contact SkinWiseApp if further information from the submission process would be helpful.</p>
                    <p className="pt-4">Kind regards,</p>
                    <p className="font-medium">SkinWiseApp Clinical Team</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Illustrative template for demonstration
                </p>
                <Button
                  onClick={() => setExampleModal(null)}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-sm py-2 px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 