'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, UserCheck, Heart, Award, Stethoscope, CheckCircle, AlertTriangle, Camera, ArrowRight, ChevronDown, HelpCircle, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from 'react'
import { detectUserCurrency, formatPrice, formatDermatologistPrice, getUserCurrencyFromLocale, convertPrice, SUPPORTED_CURRENCIES, type SupportedCurrency } from '@/lib/currency'

export default function LandingPage() {
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Detect user's currency for pricing display
    detectUserCurrency().then(currency => {
      setUserCurrency(currency)
      setCurrencyLoading(false)
    }).catch(() => {
      // Fallback to locale-based detection
      const fallbackCurrency = getUserCurrencyFromLocale()
      setUserCurrency(fallbackCurrency)
      setCurrencyLoading(false)
    })
  }, [])

  // Enhanced pricing helpers with currency localization
  const getBasePrice = () => currencyLoading ? '$19.95 USD' : formatPrice(userCurrency)
  const getDermatologistPrice = () => currencyLoading ? '$149.95 USD' : formatDermatologistPrice(userCurrency)
  
  // FAQ toggle handler
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white shadow-sm relative">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-20 w-auto"
          />
        </Link>
        
        {/* START: Brand Name and Tagline in Header - EASY ROLLBACK BLOCK */}
        {/* Desktop: Absolutely centered title */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 lg:text-2xl xl:text-3xl">
              SkinWise
            </h1>
            <p className="text-xs text-gray-500 lg:text-sm">
              Smart Skin Diagnostics.
            </p>
          </div>
        </div>
        
        {/* Mobile: Compact title next to logo */}
        <div className="md:hidden flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              SkinWise
            </h1>
            <p className="text-xs text-gray-500">
              Smart Skin Diagnostics.
            </p>
          </div>
        </div>
        {/* END: Brand Name and Tagline in Header - EASY ROLLBACK BLOCK */}
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6 ml-auto">
          <Link className="text-sm font-medium text-slate-600 hover:text-teal-700 underline-offset-4 hover:underline" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-teal-700 underline-offset-4 hover:underline" href="#when-to-use">
            When to Use
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-teal-700 underline-offset-4 hover:underline" href="#faq">
            FAQ
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-600" />
          ) : (
            <Menu className="h-6 w-6 text-slate-600" />
          )}
        </button>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-40">
            <nav className="flex flex-col py-4 px-4 space-y-4">
              <Link 
                className="text-sm font-medium text-slate-600 hover:text-teal-700 py-2" 
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                className="text-sm font-medium text-slate-600 hover:text-teal-700 py-2" 
                href="#when-to-use"
                onClick={() => setMobileMenuOpen(false)}
              >
                When to Use
              </Link>
              <Link 
                className="text-sm font-medium text-slate-600 hover:text-teal-700 py-2" 
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {/* START: Ultra-Compact Button-Visible Layout - EASY ROLLBACK BLOCK */}
      <section className="w-full pt-1 pb-6 md:pt-2 md:pb-8 lg:pt-3 lg:pb-10 bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-x-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-3 text-center max-w-5xl mx-auto">
            {/* START: How to Use SkinWise Instructional Graphic - Higher Position */}
            <div className="w-full max-w-6xl mb-0">
              <div className="relative">
                <img 
                  src="/how-to-use-skinwise.png" 
                  alt="How to use SkinWise - Take a photo, Send securely, AI-assisted results in 24 hours" 
                  className="w-full h-auto object-contain max-h-36 sm:max-h-44 md:max-h-52 lg:max-h-60 xl:max-h-68 mx-auto"
                />
              </div>
            </div>
            {/* END: How to Use SkinWise Instructional Graphic */}

            {/* Main Headline - Ultra Compact */}
            <div className="space-y-1">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl lg:text-3xl text-slate-900 leading-tight">
                Concerned About a 
                <span className="text-teal-700"> Skin Change</span>?
              </h1>
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-slate-700 leading-snug">
                Get Professional Assessment for Rashes, Moles, Lesions & Discoloration
              </h2>
            </div>

            {/* Subheadline - Ultra Compact */}
            <p className="mx-auto max-w-[500px] text-xs md:text-sm text-slate-600 leading-snug">
              AI-assisted analysis reviewed by healthcare professionals. We focus on identifying 
              potential health concerns and provide ethical guidance—not cosmetic advice or product sales.
            </p>

            {/* Key Points - Ultra Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full max-w-lg">
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <CheckCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
                <span>24-48 hour analysis</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <CheckCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
                <span>Professional review</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <CheckCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
                <span>Ethical guidance only</span>
              </div>
            </div>

            {/* CTA - Button Visible */}
            <div className="w-full max-w-sm space-y-1">
              <Link href="/login">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white shadow-md" size="default">
                  Start Skin Assessment
                </Button>
              </Link>
              <p className="text-xs text-slate-500">
                Secure assessment • {getBasePrice()} • Results within 24 hours
              </p>
            </div>

            {/* Trust Indicators - Ultra Compact */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs text-gray-800 pt-1">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3 text-teal-600" />
                <span className="font-medium">Private & Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-teal-600" />
                <span className="font-medium">No Product Partnerships</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserCheck className="h-3 w-3 text-teal-600" />
                <span className="font-medium">Reviewed by Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Ultra-Compact Button-Visible Layout - EASY ROLLBACK BLOCK */}

      {/* AI-Assisted Skin Analysis Section */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
            {/* Main Headline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                AI-Assisted Skin Analysis
              </h2>
              <h3 className="text-xl sm:text-2xl font-medium text-slate-700 leading-relaxed">
                Concerned About a Skin Change?
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                Get a professional AI-powered assessment for rashes, moles, lesions, discoloration, or any other skin issue.
              </p>
            </div>

            {/* Description */}
            <p className="mx-auto max-w-[700px] text-base text-slate-600 leading-relaxed">
              Our AI-assisted analysis is built to identify potential medical concerns. For added peace of mind, 
              you can opt to have your case reviewed by a licensed online dermatologist. We offer ethical 
              guidance—no cosmetic upselling, ever.
            </p>

            {/* Key Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl pt-4">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-teal-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Results in 24 hours</h4>
                  <p className="text-sm text-slate-600">Fast, reliable analysis when you need answers</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-teal-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Optional professional review</h4>
                  <p className="text-sm text-slate-600">Licensed dermatologist consultation available</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-teal-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Private & ethical approach</h4>
                  <p className="text-sm text-slate-600">Confidential & no product upselling</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link href="/login">
                <Button className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 text-lg font-medium shadow-lg">
                  Get Your Skin Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* When to Use Section */}
      <section id="when-to-use" className="w-full py-16 md:py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                When Should You Use SkinWise?
              </h2>
              <p className="text-lg text-slate-600">
                Our service is designed for concerning skin changes that need professional attention
              </p>
            </div>
          </div>
          
          <div className="mx-auto flex justify-center py-12 max-w-md">
            {/* Appropriate Uses */}
            <Card className="border-teal-200 bg-teal-50/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-teal-700" />
                  <CardTitle className="text-xl text-teal-900">Use SkinWise For:</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">New or changing moles or spots</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">Persistent rashes or skin irritation</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">Unusual discoloration or lesions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">Skin growths or bumps</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">Areas that won't heal or keep returning</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">Or Any other Skin concern you have</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-16 md:py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                Professional Assessment Process
              </h2>
              <p className="max-w-[900px] text-lg text-slate-600">
                Secure, professional analysis designed for healthcare-focused guidance
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-4 lg:gap-8">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <CardTitle className="text-xl text-slate-900">Secure Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Share clear photos and describe your concern. All data is encrypted.
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <CardTitle className="text-xl text-slate-900">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Advanced AI analyzes your skin concern, and we'll send you a clear, preliminary explanation of what it may be
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <CardTitle className="text-xl text-slate-900">Referral Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Referral summary will be downloadable & we can schedule an online dermatology appointment for you ({getDermatologistPrice()}).
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                <CardTitle className="text-xl text-slate-900">Pathway Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  If further attention is recommended, we offer clear next steps and referral guidance to ensure you can access professional care with ease and confidence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                Our Medical Ethics Promise
              </h2>
              <p className="max-w-[900px] text-lg text-slate-600">
                Healthcare-focused guidance without commercial bias or hidden agendas
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <Shield className="h-12 w-12 text-teal-700" />
              <h3 className="text-xl font-bold text-slate-900">No Product Sales</h3>
              <p className="text-slate-600">
                We don't sell products or earn commissions. Our recommendations focus purely on your health.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <UserCheck className="h-12 w-12 text-teal-700" />
              <h3 className="text-xl font-bold text-slate-900">Health-First Approach</h3>
              <p className="text-slate-600">
                We prioritize identifying health concerns and root causes, not cosmetic improvements.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <Stethoscope className="h-12 w-12 text-teal-700" />
              <h3 className="text-xl font-bold text-slate-900">Professional Standards</h3>
              <p className="text-slate-600">
                Every assessment follows established medical guidelines and professional standards of care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* START: FAQ Section - EASY ROLLBACK BLOCK */}
      <section id="faq" className="w-full py-16 md:py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <HelpCircle className="h-12 w-12 text-teal-700 mx-auto" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Get answers to common questions about SkinWise
              </p>
            </div>
            
            <div className="w-full max-w-3xl space-y-4">
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
                <Card key={index} className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader 
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left text-lg text-slate-900">{faq.q}</CardTitle>
                      <ChevronDown 
                        className={`h-5 w-5 text-teal-700 transition-transform duration-200 ${
                          openFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {openFAQ === index && (
                    <CardContent className="pt-0">
                      <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* END: FAQ Section - EASY ROLLBACK BLOCK */}

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-teal-700 to-teal-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Get Professional Peace of Mind
              </h2>
              <p className="max-w-[600px] text-lg text-teal-100">
                Join thousands who've received expert guidance for their skin health concerns
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <Link href="/login">
                <Button className="w-full bg-white text-teal-800 hover:bg-slate-50 shadow-lg" size="lg">
                  Start Professional Assessment
                </Button>
              </Link>
              <p className="text-sm text-teal-200">
                Secure • Professional • Results within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-slate-50">
        <p className="text-xs text-slate-600">
          © 2024 SkinWise. Professional skin health assessment platform.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  )
} 