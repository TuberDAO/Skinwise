'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, UserCheck, Stethoscope, Menu, X, ChevronDown, HelpCircle } from "lucide-react"
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

  const getBasePrice = () => currencyLoading ? '$19.95 USD' : formatPrice(userCurrency)
  const getDermatologistPrice = () => currencyLoading ? '$149.95 USD' : formatDermatologistPrice(userCurrency)

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
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Improved Mobile Responsive */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* How to Use Graphic - Enhanced Mobile Hero */}
            <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 sm:px-0">
              <img 
                src="/how-to-use-skinwise.png" 
                alt="How to use SkinWise - Take a photo, Send securely, AI-assisted results in 24 hours" 
                className="w-full h-auto object-contain max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-80 xl:max-h-96 drop-shadow-lg"
              />
            </div>

            {/* Headlines - Better responsive text sizing */}
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                Concerned About a{" "}
                <span className="text-teal-700">Skin Change</span>?
              </h1>
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-700 leading-relaxed">
                Get Professional Assessment for Rashes, Moles, Lesions & Discoloration
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              AI-assisted analysis reviewed by healthcare professionals. We focus on identifying 
              potential health concerns and provide ethical guidance—not cosmetic advice or product sales.
            </p>

            {/* Key Points - Better Mobile Layout */}
            <div className="flex flex-col sm:flex-row sm:justify-center sm:flex-wrap gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-gray-600 py-2 px-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="whitespace-nowrap">24-48 hour analysis</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-gray-600 py-2 px-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="whitespace-nowrap">Professional review</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-gray-600 py-2 px-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="whitespace-nowrap">Ethical guidance only</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="max-w-sm mx-auto space-y-3">
              <Link href="/login">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 shadow-lg transition-colors">
                  Start Skin Assessment
                </Button>
              </Link>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                Secure assessment • {getBasePrice()} • Results within 24 hours
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row sm:justify-center sm:flex-wrap gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 py-2 px-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Private & Secure</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 py-2 px-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">No Product Partnerships</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 py-2 px-3">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Reviewed by Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Analysis Section - Fixed Mobile Layout */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-10">
            {/* Headlines */}
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                AI-Assisted Skin Analysis
              </h2>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-700">
                Concerned About a Skin Change?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Get a professional AI-powered assessment for rashes, moles, lesions, discoloration, or any other skin issue.
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Our AI-assisted analysis is built to identify potential medical concerns. For added peace of mind, 
              you can opt to have your case reviewed by a licensed online dermatologist. We offer ethical 
              guidance—no cosmetic upselling, ever.
            </p>

            {/* Features Grid - Better Mobile Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <div className="text-center space-y-4 p-4 md:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Results in 24 hours</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Fast, reliable analysis when you need answers</p>
                </div>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Optional professional review</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Licensed dermatologist consultation available</p>
                </div>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Private & ethical approach</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Confidential & no product upselling</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link href="/login">
                <Button className="bg-teal-700 hover:bg-teal-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-lg transition-colors">
                  Get Your Skin Analysis
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
                      "Or Any other Skin concern you have"
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
                    Share clear photos and describe your concern. All data is encrypted.
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
                    Advanced AI analyzes your skin concern, and we'll send you a clear, preliminary explanation of what it may be.
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
                    Referral summary will be downloadable & we can schedule an online dermatology appointment for you ({getDermatologistPrice()}).
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
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words hyphens-auto">No Product Sales</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words hyphens-auto">
                  We don't sell products or earn commissions. Our recommendations focus purely on your health.
                </p>
              </div>
              
              <div className="text-center space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-teal-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words hyphens-auto">Health-First Approach</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words hyphens-auto">
                  We prioritize identifying health concerns and root causes, not cosmetic improvements.
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
                Get answers to common questions about SkinWise
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              {[
                {
                  q: "What is SkinWise and how does it work?",
                  a: "SkinWise is a fast, affordable way to get a preliminary assessment of any visible skin concern — using expert-trained AI. You upload up to 4 photos and provide a brief description. Within 24 hours, you receive a clear, easy-to-read PDF explaining what the issue may be — plus a downloadable letter you can take to your dermatologist. It's not just for cosmetic concerns — SkinWise supports assessments for any skin condition, anywhere on the body."
                },
                {
                  q: `What do I get for ${getBasePrice()}?`,
                  a: "You'll receive:\nA personalised PDF report that includes an AI-assisted analysis based on your submitted photos and description, written in clear, everyday language to help you understand your skin concern.\nA medically formatted letter for your Doctor or dermatologist, written in professional clinical terminology\nResults delivered within 24 hours directly to your email"
                },
                {
                  q: "Can I get a dermatologist to review my case?",
                  a: `Yes. After your initial results, you can request a full review by a board-certified dermatologist for ${getDermatologistPrice()}. You'll receive an expert evaluation, clinical letter, and next steps — typically within 1–2 days. This is optional and can be requested after reviewing your AI assessment.`
                },
                {
                  q: "What kinds of skin problems can this help with?",
                  a: "SkinWise is designed for any visible skin concern — whether it's a rash, spot, mole, discolouration, irritation, swelling, or chronic condition. It is not limited to facial or beauty-related issues."
                },
                {
                  q: "Is this like those instant AI skin apps?",
                  a: "No — and that's intentional. Many apps give instant results that are often wrong. SkinWise takes up to 24 hours because your submission is carefully evaluated using medically informed AI workflows. Accuracy is our top priority — not speed."
                },
                {
                  q: "How long does it take to get results?",
                  a: "Your initial AI-assisted assessment is delivered within 24 hours. If you choose dermatologist review, that report usually arrives within 1–2 days."
                },
                {
                  q: "What if I'm not comfortable uploading photos?",
                  a: "We completely understand — your comfort and privacy come first. You can log in anonymously without providing an email address, and we never ask for your name or personal information.\n\nIf you're able to upload 1–4 clear photos (JPEG, PNG), it will help us provide a more accurate assessment.\n\nAll images are securely stored and never shared. Your payment is processed via Stripe, a trusted global provider, and we do not have access to any of your financial or personal details.\n\nYou're in control — always."
                },
                {
                  q: "Who can use SkinWise?",
                  a: "SkinWise is available globally, but only to individuals 18 years or older."
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
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line break-words hyphens-auto">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
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
              Join thousands who have already received professional guidance for their skin concerns
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
              © 2025 SkinWise. All rights reserved. Professional medical advice should always be sought for serious concerns.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 