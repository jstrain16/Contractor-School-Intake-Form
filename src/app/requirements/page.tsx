'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  Phone,
  Mail,
  BookOpen,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Getting Licensed Is Complicated.
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-8">
            We Make It Simple.
          </h2>
          <div className="max-w-3xl mx-auto text-lg text-slate-700 mb-12">
            <p>
              Utah requires <span className="font-bold text-slate-900">15 separate requirements</span> across personal identity, business formation, education, and insurance.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">Here's the reality:</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span>Most applicants miss critical documents or submit incomplete forms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span>A single error can delay your license by weeks or months.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span>The state doesn't tell you what you need until it's too late.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Short Version Section */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">What Utah Requires (The Short Version)</h2>
          <p className="text-lg text-slate-600">The licensing process covers 4 major areas with 15 specific requirements.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Personal & Business Identity</h3>
            <p className="text-sm text-slate-600 mb-4">Verify who you are and establish your business entity.</p>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">5 requirements</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Education & Experience</h3>
            <p className="text-sm text-slate-600 mb-4">Complete required training and prove your industry experience.</p>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">3 requirements</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Insurance & Compliance</h3>
            <p className="text-sm text-slate-600 mb-4">Secure proper coverage and meet state regulations.</p>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">4 requirements</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Application & Approval</h3>
            <p className="text-sm text-slate-600 mb-4">Submit documentation and pass background checks.</p>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">3 requirements</span>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}>
            See all 15 requirements in detail <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Contractor School Simplifies Everything</h2>
            <p className="text-lg text-slate-300">We've guided thousands of contractors through this exact process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Step-by-Step Guidance</h3>
                  <p className="text-slate-300 mb-4">Our portal tells you exactly what you need, when you need it.</p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Clear checklists for each requirement</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Real-time progress tracking</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Automatic document organization</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">State-Approved Education</h3>
                  <p className="text-slate-300 mb-4">Complete your required pre-licensure course with us.</p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Approved by Utah DOPL</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Flexible scheduling options</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Certificate delivered immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Expert Review Before Submission</h3>
                  <p className="text-slate-300 mb-4">Choose our Assisted Review option and have licensing pros check your work.</p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Catch errors before the state sees them</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Verify all documentation matches</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Avoid costly delays and rejections</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Personal Support When You Need It</h3>
                  <p className="text-slate-300 mb-4">Questions? Stuck on a requirement? Our licensing specialists are here.</p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Phone and email support</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Assistance with complex situations</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Guidance on background disclosures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 1 */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Don't navigate this complex process alone. Let us guide you to your license.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/application">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto font-bold">
                Start Your Application <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/application?phase=3">
              <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-700 w-full sm:w-auto">
                Book a Class
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200">
            Or <button onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })} className="underline hover:text-white">scroll down to see all 15 requirements in detail</button>
          </p>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section id="breakdown" className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Requirements Breakdown</h2>
          <p className="text-lg text-slate-600">Here's everything the state requires, organized and explained.</p>
        </div>

        <div className="space-y-8">
          <RequirementItem 
            number="1"
            title="Personal Information & Identity Verification"
            description="Every application starts with confirming who you are."
            items={[
              "Full legal name",
              "Date of birth",
              "Contact information (phone & email)",
              "Government-issued photo ID",
              "Citizenship or lawful presence confirmation"
            ]}
            why="The license is issued to a real, verified person who is legally present in the US."
          />
          <RequirementItem 
            number="2"
            title="License Classification Selection"
            description="Your license type determines everything that follows."
            items={[
              "R100 – General Residential Contractor",
              "B100 – General Building Contractor",
              "E100 – Electrical Contractor",
              "S-Series – Specialty Trade Licenses (Plumbing, HVAC, etc.)"
            ]}
            why="Choosing the wrong classification is one of the most common reasons for rejection."
          />
          <RequirementItem 
            number="3"
            title="Pre-Licensure Education"
            description="All Utah contractor applicants must complete a state-approved course."
            items={[
              "25 or 30 hours (depending on license type)",
              "State-approved provider",
              "Certificate of completion"
            ]}
            why="The state will not review your application without this certificate."
          />
          <RequirementItem 
            number="4"
            title="Business Entity Formation"
            description="Contractor licenses are issued to a business entity, not just an individual."
            items={[
              "Legal business name",
              "Entity type (LLC, Corporation, Partnership, Sole Prop)",
              "State of formation",
              "Business address",
              "Certificate of Organization or Articles of Incorporation",
              "DBA filing (if applicable)"
            ]}
            why="Your license must match your registered business entity exactly."
          />
          <RequirementItem 
            number="5"
            title="Federal Employer Identification Number (FEIN)"
            description="Most applicants need a Federal Employer Identification Number."
            items={[
              "FEIN/EIN number",
              "IRS confirmation letter (CP-575 or equivalent)"
            ]}
            why="A FEIN is required for workers' compensation, insurance, and banking."
          />
          <RequirementItem 
            number="6"
            title="Business Bank Account"
            description="The state requires proof that your business has a dedicated financial account."
            items={[
              "Voided business check",
              "Bank letter confirming account ownership",
              "Recent business account statement"
            ]}
            why="This confirms your business is financially established separate from you personally."
          />
          <RequirementItem 
            number="7"
            title="Ownership & Officer Information"
            description="If your business has multiple owners, the state requires details on all of them."
            items={[
              "Full legal name (for each owner with 20%+ ownership)",
              "Date of birth",
              "Residential address",
              "Ownership percentage",
              "Citizenship status",
              "Background disclosure"
            ]}
            why="Total ownership must equal 100%."
          />
          <RequirementItem 
            number="8"
            title="Qualifier Designation"
            description="Every contractor license must have a qualifier—the person responsible for the work."
            items={[
              "Qualifier's personal information",
              "Signed qualifier affidavit (completed after class)",
              "Qualifier's background and experience verification"
            ]}
            why="Often, the person taking the class is the qualifier, but not always."
          />
          <RequirementItem 
            number="9"
            title="Experience Verification"
            description="Many license types require proof of hands-on industry experience."
            items={[
              "Experience affidavits from previous employers or clients",
              "Detailed employment history",
              "Project descriptions and dates",
              "Supporting documents (tax records, W-2s, employer letters)"
            ]}
            why="The state must confirm you meet minimum experience requirements (usually 2-4 years)."
          />
          <RequirementItem 
            number="10"
            title="Criminal & Financial Background Disclosure"
            description="All applicants and qualifiers must answer detailed screening questions."
            items={[
              "Prior license discipline or sanctions",
              "Pending legal matters",
              "Criminal history (felony or misdemeanor)",
              "Financial judgments, liens, or collections",
              "Bankruptcy filings (past 7 years)"
            ]}
            why="Answering 'yes' does not automatically disqualify you, but requires detailed documentation."
          />
          <RequirementItem 
            number="11"
            title="State Examination (If Required)"
            description="Certain license classifications require passing a trade or law exam."
            items={[
              "Exam scheduled through PSI Testing Centers",
              "Proof of passing score",
              "Exam must align with your license classification"
            ]}
            why="No exam = no license for R100, B100, E100, and other key trades."
          />
          <RequirementItem 
            number="12"
            title="Insurance Requirements"
            description="All contractors must provide proof of required insurance coverage."
            items={[
              "Workers' Compensation Insurance (if you have employees)",
              "General Liability Insurance (coverage amounts vary by trade)",
              "Certificate of Insurance (COI) from a licensed provider"
            ]}
            why="Insurance protects you, your employees, and your clients."
          />
          <RequirementItem 
            number="13"
            title="Workers' Compensation Waiver (If Applicable)"
            description="If you won't have employees, you may qualify for a waiver."
            items={[
              "Completed business registration",
              "Federal EIN (FEIN)",
              "Business bank account documentation",
              "Proof of general liability insurance",
              "Waiver application through Utah Labor Commission"
            ]}
            why="Waiver approval is a separate process that must be completed before applying to DOPL."
          />
          <RequirementItem 
            number="14"
            title="Final Application Assembly"
            description="Once all requirements are met, your application package is assembled."
            items={[
              "Business and ownership documentation",
              "Education certificate and experience verification",
              "Background and financial disclosures",
              "Insurance and/or workers' comp waiver",
              "Exam results (if required)",
              "All required affidavits and notarized forms"
            ]}
            why="This is the stage where missing documents are most likely to cause delays."
          />
          <RequirementItem 
            number="15"
            title="Application Review & Submission"
            description="You have options for how much support you need."
            items={[
              "Self-Service Option: Submit on your own using our checklist",
              "Assisted Review Option: Have professionals review your package"
            ]}
            why="Processing time varies based on application completeness and accuracy."
          />
        </div>
      </section>

      {/* Delays Section */}
      <section className="py-20 bg-orange-50 border-y border-orange-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Most Applications Get Delayed</h2>
            <p className="text-lg text-slate-600">These are the mistakes that cost applicants weeks of waiting.</p>
          </div>

          <div className="bg-white rounded-xl border border-orange-200 p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Common pitfalls we help you avoid:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Missing or incomplete documents</span>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Information doesn't match across forms</span>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Background disclosures were incomplete or inaccurate</span>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Business setup wasn't finished early enough</span>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Wrong license type selected</span>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-700">Workers' comp waiver not approved in time</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-orange-100 text-center">
              <p className="text-lg text-slate-800">
                <span className="font-bold text-orange-600">Contractor School catches these issues before you submit,</span> so you get licensed faster, not later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Stop Stressing. Start Building.</h2>
          <p className="text-lg text-slate-600 mb-8">
            The licensing process doesn't have to be overwhelming. We're here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/application">
              <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto font-bold">
                Start Your Application
              </Button>
            </Link>
            <Link href="/application?phase=3">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto">
                Book a Class
              </Button>
            </Link>
            <Link href="/#support">
              <Button size="lg" variant="ghost" className="text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                Talk to a Specialist
              </Button>
            </Link>
          </div>
          
          <div className="border-t border-slate-200 pt-8">
            <p className="text-slate-600 mb-2">Questions? We're here to help.</p>
            <div className="flex justify-center items-center gap-4 text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> (801) 467-1800</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@beacontractor.com</span>
            </div>
          </div>
        </div>
      </section>
      
      <div className="bg-slate-50 py-4 text-center text-xs text-slate-500 italic">
        Contractor School is an approved education provider.
      </div>
    </div>
  );
}

function RequirementItem({ number, title, description, items, why }: { 
  number: string, 
  title: string, 
  description: string, 
  items: string[], 
  why: string 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xl text-slate-400">
          {number}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
        
        <div className="bg-slate-50 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">You'll need:</h4>
          <ul className="grid sm:grid-cols-2 gap-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-3 text-sm">
          <span className="font-bold text-slate-900 flex-shrink-0">Why it matters:</span>
          <span className="text-slate-600">{why}</span>
        </div>
      </div>
    </div>
  );
}

