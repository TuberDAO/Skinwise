'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, UserCheck, Stethoscope, Menu, X, ChevronDown, HelpCircle, Quote, User } from "lucide-react"
import { useState, useEffect } from "react"
import { detectUserCurrency, formatPrice, formatDermatologistPrice } from '@/lib/currency'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [userCurrency, setUserCurrency] = useState<'USD' | 'CHF' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SEK' | 'NOK' | 'DKK'>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)

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

  const getBasePrice = () => currencyLoading ? '£6' : formatPrice(userCurrency)
  const getDermatologistPrice = () => currencyLoading ? '£25' : formatDermatologistPrice(userCurrency)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

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
                className="h-7 w-auto"
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
              className="h-12 w-auto"
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
          <div className="text-center space-y-3 sm:space-y-4">
            {/* How to Use Graphic - Compact */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl mx-auto px-2 sm:px-0">
              <img 
                src="/how-to-use-skinwise.png" 
                alt="How to use SkinWise - Take a photo, Send securely, results reviewed by a human" 
                className="w-full h-auto object-contain max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-56 xl:max-h-64 drop-shadow-lg"
              />
            </div>

            {/* Headlines - Trust-forward, clinical */}
            <div className="space-y-1 sm:space-y-2 max-w-4xl mx-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                Fast skin photo assessment:{" "}
                <span className="text-teal-700">reviewed by a human</span>
              </h1>
              <h2 className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Upload 1 to 4 photos and a short description. We'll send a clear summary + a doctor-friendly note if needed.
              </h2>
            </div>

            {/* AI mention - demoted to secondary text */}
            <p className="text-xs text-gray-500 max-w-xl mx-auto">
              AI-assisted triage, then checked by a trained reviewer for clarity and safety.
            </p>

            {/* CTA Button - Compact */}
            <div className="max-w-sm mx-auto space-y-1.5">
              <Link href="/login">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm sm:text-base py-2.5 sm:py-3 px-6 shadow-lg transition-colors">
                  Start Skin Assessment
                </Button>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                {currencyLoading ? '£6' : formatPrice(userCurrency)} • Results in 2 to 4 hours
              </p>
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
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 col-span-2 sm:col-span-1">
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
                  q: "Can I get a certified dermatologist to review my case?",
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
    </div>
  )
} 