import Link from "next/link"
import { Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-10 w-auto"
          />
        </Link>
        <div className="ml-auto">
          <BackButton className="text-sm text-slate-600 hover:text-brand-blue">
            Back to Home
          </BackButton>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-brand-blue">
              Terms of Service & Privacy Policy
            </h1>
            <p className="text-slate-600">
              Legal information and privacy practices for SkinWise
            </p>
          </div>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-brand-blue">
                Unified Terms of Service and Privacy Policy for SkinWise
              </CardTitle>
              <p className="text-center text-sm text-slate-600">
                <em>Last Updated: 28th July 2025</em>
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 mb-2">
                  IMPORTANT NOTICE: PLEASE READ CAREFULLY BEFORE USING THIS SERVICE.
                </p>
                <p className="text-sm text-yellow-700">
                  By accessing, browsing, registering for, or using the SkinWise platform ("Service"), 
                  including all content, features, and functionalities available via skinwise.app and 
                  related services, you ("User") agree to be legally bound by the following Terms of 
                  Service and Privacy Policy ("Agreement"). If you do not agree with any of these 
                  terms or conditions, you must not use the Service.
                </p>
              </div>

              <div className="space-y-8">
                {/* Section 1: Eligibility */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    1. Eligibility
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      The Service is intended solely for individuals who are <strong>18 years of age or older</strong>. 
                      By using the Service, you affirm that you are at least 18 years old.
                    </li>
                    <li>
                      Individuals under the age of 18 are <strong>strictly prohibited</strong> from using the platform.
                    </li>
                    <li>
                      The Company reserves the right to refuse service, terminate accounts, or cancel orders at its sole discretion.
                    </li>
                  </ul>
                </section>

                {/* Section 2: No Medical Advice */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    2. No Medical Advice
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      The Service is designed to provide general information and ethically guided wellness 
                      insights based on submitted photographs and descriptions.
                    </li>
                    <li>
                      <strong>SkinWise does not provide medical advice, diagnosis, or treatment</strong>. 
                      The content on this platform is for <strong>informational purposes only</strong>.
                    </li>
                    <li>Use of the Service does not establish a doctor-patient relationship.</li>
                    <li>
                      Users are <strong>urged to consult with a licensed medical professional</strong> before 
                      taking any action based on information obtained from the platform.
                    </li>
                  </ul>
                </section>

                {/* Section 3: Limitation of Liability */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    3. Limitation of Liability
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      The Service and all related content are provided on an <strong>"AS IS" and "AS AVAILABLE"</strong> 
                      basis without warranties of any kind, express or implied.
                    </li>
                    <li>
                      <strong>SkinWise, its owners, employees, affiliates, or contractors shall not be liable</strong> 
                      for any direct, indirect, incidental, special, or consequential damages arising from or 
                      relating to the use of the Service.
                    </li>
                    <li>
                      The Company assumes <strong>no liability for data loss, delays, service interruptions</strong>, 
                      or any inaccuracies in outputs generated by the AI or human reviewers.
                    </li>
                  </ul>
                </section>

                {/* Section 4: Privacy and Data Collection */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    4. Privacy and Data Collection
                  </h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold">SkinWise collects and processes data as outlined below:</h3>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                          <strong>Personal Data</strong>: including names, email addresses, and payment information 
                          via secure third-party processors (e.g., Stripe).
                        </li>
                        <li>
                          <strong>Uploaded Content</strong>: photographs and user-submitted descriptions are stored 
                          in encrypted and access-restricted Firebase Storage.
                        </li>
                        <li>
                          <strong>Analytics and Usage Data</strong>: collected via cookies, logs, and third-party 
                          services for platform improvement and security.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Data Usage:</h3>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Submitted content may be reviewed manually for quality assurance.</li>
                        <li>
                          No user content will be shared with third parties without explicit consent, 
                          except as required by law.
                        </li>
                        <li>
                          Stripe handles all payment processing and retains minimal transactional metadata 
                          in compliance with applicable data protection laws.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold">User Rights:</h3>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                          Users may request data deletion or export by emailing{" "}
                          <a href="mailto:sill.namson@gmx.com" className="text-brand-blue hover:underline">
                            sill.namson@gmx.com
                          </a>.
                        </li>
                        <li>
                          Users in the UK/EU have rights under the UK GDPR/EU GDPR including access, 
                          rectification, and objection.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 5: Intellectual Property */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    5. Intellectual Property
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      All content, trademarks, logos, and code on the Service are the <strong>exclusive property 
                      of SkinWise</strong> or its licensors.
                    </li>
                    <li>
                      Users may not copy, modify, distribute, or reverse engineer any part of the platform 
                      without written permission.
                    </li>
                  </ul>
                </section>

                {/* Section 6: Prohibited Conduct */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    6. Prohibited Conduct
                  </h2>
                  <p className="mt-4">Users agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Upload or distribute content that is illegal, defamatory, obscene, or harmful;</li>
                    <li>Interfere with platform operations via hacking, scraping, or DDOS attacks;</li>
                    <li>Misrepresent identity or provide false information;</li>
                    <li>Use the Service for any unlawful or unauthorized purpose.</li>
                  </ul>
                </section>

                {/* Section 7: Modifications */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    7. Modifications to This Agreement
                  </h2>
                  <p className="mt-4">
                    SkinWise reserves the right to modify or replace this Agreement at any time. Users will be 
                    notified of material changes via the Service. Continued use of the platform after such 
                    changes constitutes acceptance of the updated terms.
                  </p>
                </section>

                {/* Section 8: Governing Law */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    8. Governing Law and Jurisdiction
                  </h2>
                  <p className="mt-4">
                    This Agreement shall be governed by and construed in accordance with the laws of{" "}
                    <strong>England and Wales</strong>, without regard to conflict of law principles. 
                    Any disputes shall be subject to the <strong>exclusive jurisdiction</strong> of the 
                    courts located in London, UK.
                  </p>
                </section>

                {/* Section 9: Contact Information */}
                <section>
                  <h2 className="text-xl font-semibold text-brand-blue border-b border-slate-200 pb-2">
                    9. Contact Information
                  </h2>
                  <div className="mt-4">
                    <p>For any questions, complaints, or requests, please contact:</p>
                    <div className="mt-2 space-y-1">
                      <p>
                        <strong>Email</strong>:{" "}
                        <a href="mailto:sill.namson@gmx.com" className="text-brand-blue hover:underline">
                          sill.namson@gmx.com
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Final Agreement */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <p className="font-semibold text-slate-800">
                    By using SkinWise, you acknowledge that you have read, understood, and agree to be 
                    legally bound by this Unified Terms of Service and Privacy Policy.
                  </p>
                </div>

                <div className="text-center text-sm text-slate-500 font-medium">
                  <strong>End of Document</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 