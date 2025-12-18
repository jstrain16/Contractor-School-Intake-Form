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
  Users, 
  Phone,
  Mail,
  BookOpen,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section 
        className="relative pt-[80px] pb-[160px] px-4 overflow-hidden"
        style={{ backgroundImage: "linear-gradient(152.35deg, #155DFC 0%, #193CB8 100%)" }}
      >
        <div className="max-w-[896px] mx-auto text-center relative z-10">
          <h1 className="text-[40px] md:text-[60px] leading-[1.1] font-normal text-white mb-6">
            Getting Licensed Is Complicated.
          </h1>
          <h2 className="text-[28px] md:text-[36px] leading-[1.2] font-normal text-[#DBEAFE] mb-8">
            We Make It Simple.
          </h2>
          
          <div className="max-w-[768px] mx-auto mb-12">
            <p className="text-[18px] md:text-[20px] text-[#DBEAFE] leading-[1.4]">
              Utah requires <span className="font-bold text-white">15 separate requirements</span> across personal identity, business formation, education, insurance, and compliance—all with specific documentation that must match perfectly.
            </p>
          </div>
          
          <div className="bg-white/10 border border-white/20 rounded-[16px] p-8 text-left max-w-[672px] mx-auto backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-white" />
              <span className="text-[20px] text-white">Here's the reality:</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-[18px] text-[#EFF6FF]">Most applicants miss critical documents or submit mismatched information</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-[18px] text-[#EFF6FF]">A single error can delay your license by weeks or months</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="text-[18px] text-[#EFF6FF]">The state doesn't tell you what you need until it's too late</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Short Version Section */}
      <section className="py-[80px] px-4 max-w-[1207px] mx-auto">
        <div className="mb-[40px]">
          <h2 className="text-[36px] text-[#101828] text-center mb-4 font-normal">What Utah Requires (The Short Version)</h2>
          <p className="text-[20px] text-[#4A5565] text-center">The licensing process covers 4 major areas with 15 total requirements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card 
            icon={<Users className="w-6 h-6 text-white" />}
            gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
            title="Personal & Business Identity"
            description="Verify who you are and establish your business entity"
            count="5 requirements"
          />
          <Card 
            icon={<GraduationCap className="w-6 h-6 text-white" />}
            gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
            title="Education & Experience"
            description="Complete required training and prove your industry knowledge"
            count="3 requirements"
          />
          <Card 
            icon={<ShieldCheck className="w-6 h-6 text-white" />}
            gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
            title="Insurance & Compliance"
            description="Secure proper coverage and meet state regulations"
            count="4 requirements"
          />
          <Card 
            icon={<FileText className="w-6 h-6 text-white" />}
            gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
            title="Application & Approval"
            description="Submit documentation and pass background checks"
            count="3 requirements"
          />
        </div>

        <div className="text-center">
          <button 
            onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-[#155DFC] text-[18px] hover:underline"
          >
            See all 15 requirements in detail <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Value Prop Section */}
      <section 
        className="py-[80px] px-4"
        style={{ backgroundImage: "linear-gradient(142.48deg, #EFF6FF 0%, #FFFFFF 100%)" }}
      >
        <div className="max-w-[1207px] mx-auto">
          <div className="mb-12">
            <h2 className="text-[36px] text-[#101828] text-center mb-4 font-normal">How Contractor School Simplifies Everything</h2>
            <p className="text-[20px] text-[#4A5565] text-center">We've guided thousands of contractors through this process</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[1024px] mx-auto">
            <ValueCard 
              icon={<CheckSquare className="w-7 h-7 text-white" />}
              iconBg="linear-gradient(135deg, #00C950 0%, #00A63E 100%)"
              title="Step-by-Step Guidance"
              description="Our portal tells you exactly what you need, when you need it, and in what order. No guessing. No confusion."
              items={[
                "Clear checklists for each requirement",
                "Real-time progress tracking",
                "Automatic document organization"
              ]}
            />
            <ValueCard 
              icon={<ShieldCheck className="w-7 h-7 text-white" />}
              iconBg="linear-gradient(135deg, #FF6900 0%, #F54900 100%)"
              title="Expert Review Before Submission"
              description="Choose our Assisted Review option and have licensing professionals check everything before you submit."
              items={[
                "Catch errors before the state sees them",
                "Verify all documentation matches",
                "Avoid costly delays and rejections"
              ]}
            />
            <ValueCard 
              icon={<BookOpen className="w-7 h-7 text-white" />}
              iconBg="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)"
              title="State-Approved Education"
              description="Complete your required pre-licensure course with us and automatically check off one of the biggest requirements."
              items={[
                "Approved by Utah DOPL",
                "Flexible scheduling options",
                "Certificate delivered immediately"
              ]}
            />
            <ValueCard 
              icon={<Phone className="w-7 h-7 text-white" />}
              iconBg="linear-gradient(135deg, #AD46FF 0%, #9810FA 100%)"
              title="Personal Support When You Need It"
              description="Questions? Stuck on a requirement? Our licensing specialists are here to help every step of the way."
              items={[
                "Phone and email support",
                "Assistance with complex situations",
                "Guidance on background disclosures"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA 1 */}
      <section className="py-[80px] px-4 text-center bg-white">
        <div className="max-w-[896px] mx-auto">
          <h2 className="text-[36px] text-[#101828] mb-6 font-normal">Ready to Get Started?</h2>
          <p className="text-[20px] text-[#4A5565] mb-8">
            Don't navigate this complex process alone. Let us guide you to your license.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/application">
              <Button size="lg" className="bg-[#155DFC] hover:bg-[#155DFC]/90 text-white h-[60px] px-8 text-[18px] rounded-[8px]">
                Start Your Application <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/application?phase=3">
              <Button size="lg" variant="outline" className="border-[#E5E7EB] text-[#344054] hover:bg-gray-50 h-[60px] px-8 text-[18px] rounded-[8px]">
                Book a Class
              </Button>
            </Link>
          </div>
          <p className="text-[#155DFC] text-[16px]">
            Or <button onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })} className="underline hover:text-[#155DFC]/80">scroll down to see all 15 requirements in detail</button>
          </p>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section id="breakdown" className="py-[80px] px-4 max-w-[1207px] mx-auto">
        <div className="mb-[60px]">
          <h2 className="text-[36px] text-[#101828] text-center mb-4 font-normal">Complete Requirements Breakdown</h2>
          <p className="text-[20px] text-[#4A5565] text-center">Here's everything the state requires, organized and explained.</p>
        </div>

        <div className="space-y-[40px]">
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
      <section 
        className="py-[80px] px-4"
        style={{ backgroundImage: "linear-gradient(152.22deg, #FFF7ED 0%, #FEF2F2 100%)" }}
      >
        <div className="max-w-[896px] mx-auto">
          <div className="text-center mb-12">
            <div className="w-[64px] h-[64px] bg-[#FF6900]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#FF6900]" />
            </div>
            <h2 className="text-[36px] text-[#101828] mb-4 font-normal">Why Most Applications Get Delayed</h2>
            <p className="text-[20px] text-[#4A5565]">These are the mistakes that cost applicants weeks or months</p>
          </div>

          <div 
            className="bg-white/50 border border-[#FFD6A7] rounded-[14px] p-8"
            style={{ backgroundImage: "linear-gradient(152.22deg, #FFF7ED 0%, #FEF2F2 100%)" }}
          >
            <h3 className="text-[20px] text-[#101828] mb-6">Common pitfalls we help you avoid:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <DelayCard text="Missing or incomplete documents" />
              <DelayCard text="Information doesn't match across forms" />
              <DelayCard text="Background disclosures were incomplete or inaccurate" />
              <DelayCard text="Business setup wasn't finished early enough" />
              <DelayCard text="Wrong license type selected" />
              <DelayCard text="Workers' comp waiver not approved in time" />
            </div>
            
            <div className="mt-8 border-2 border-[#155DFC] rounded-[10px] p-6 bg-white">
              <p className="text-[16px] text-[#101828] text-center">
                <span className="font-bold text-[#155DFC]">Contractor School catches these issues before you submit—</span> so you get licensed faster, not later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-[80px] px-4 text-center bg-white">
        <div className="max-w-[896px] mx-auto">
          <h2 className="text-[36px] text-[#101828] mb-6 font-normal">Stop Stressing. Start Building.</h2>
          <p className="text-[20px] text-[#4A5565] mb-8">
            The licensing process doesn't have to be overwhelming. We're here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/application">
              <Button size="lg" className="bg-[#155DFC] hover:bg-[#155DFC]/90 text-white h-[60px] px-8 text-[18px] rounded-[8px]">
                Start Your Application <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/application?phase=3">
              <Button size="lg" variant="outline" className="border-[#E5E7EB] text-[#344054] hover:bg-gray-50 h-[60px] px-8 text-[18px] rounded-[8px]">
                Book a Class
              </Button>
            </Link>
            <Link href="/#support">
              <Button size="lg" variant="outline" className="border-[#E5E7EB] text-[#344054] hover:bg-gray-50 h-[60px] px-8 text-[18px] rounded-[8px]">
                Talk to a Specialist
              </Button>
            </Link>
          </div>
          
          <div className="border-t border-[#E5E7EB] pt-8">
            <p className="text-[#4A5565] mb-2">Questions? We're here to help.</p>
            <div className="flex justify-center items-center gap-4 text-sm font-semibold text-[#101828]">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> (801) 467-1800</span>
              <span className="text-[#D0D5DD]">|</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@beacontractor.com</span>
            </div>
          </div>
        </div>
      </section>
      
      <div className="bg-[#F9FAFB] py-4 text-center text-xs text-[#667085] italic">
        Contractor School is an approved education provider.
      </div>
    </div>
  );
}

function Card({ icon, gradient, title, description, count }: { 
  icon: React.ReactNode, 
  gradient: string, 
  title: string, 
  description: string, 
  count: string 
}) {
  return (
    <div 
      className="border-2 border-[#E5E7EB] rounded-[14px] p-6 h-full flex flex-col items-start"
      style={{ backgroundImage: "linear-gradient(137.5deg, #F9FAFB 0%, #FFFFFF 100%)" }}
    >
      <div 
        className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center mb-4 flex-shrink-0"
        style={{ backgroundImage: gradient }}
      >
        {icon}
      </div>
      <h3 className="text-[20px] text-[#101828] mb-2 font-normal leading-[1.4]">{title}</h3>
      <p className="text-[16px] text-[#4A5565] mb-4 flex-grow leading-[1.5]">{description}</p>
      <span className="text-[14px] text-[#155DFC]">{count}</span>
    </div>
  );
}

function ValueCard({ icon, iconBg, title, description, items }: { 
  icon: React.ReactNode, 
  iconBg: string, 
  title: string, 
  description: string, 
  items: string[] 
}) {
  return (
    <div className="bg-white border border-[#BEDBFF] rounded-[14px] p-8 shadow-sm h-full flex flex-col items-start">
      <div 
        className="w-[56px] h-[56px] rounded-[14px] flex items-center justify-center mb-6 flex-shrink-0"
        style={{ backgroundImage: iconBg }}
      >
        {icon}
      </div>
      <h3 className="text-[24px] text-[#101828] mb-4 font-normal leading-[1.3]">{title}</h3>
      <p className="text-[16px] text-[#4A5565] mb-6 leading-[1.5]">{description}</p>
      <ul className="space-y-2 mt-auto">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[16px] text-[#364153]">
            <CheckSquare className="w-5 h-5 text-[#155DFC] flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0 w-[64px] flex justify-center">
        <span className="text-[32px] text-[#101828] font-normal">{number}</span>
      </div>
      <div className="flex-grow border-b border-[#E5E7EB] pb-8 last:border-0">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-[32px] text-[#101828] mb-4 font-normal leading-[1.2]">{title}</h3>
            <p className="text-[24px] text-[#4A5565] leading-[1.4] mb-4">{description}</p>
          </div>
          
          <div className="flex-1 bg-[#F9FAFB] rounded-[12px] p-6">
            <h4 className="text-[16px] font-bold text-[#101828] uppercase tracking-wide mb-4">You'll need:</h4>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[16px] text-[#344054]">
                  <CheckSquare className="w-5 h-5 text-[#155DFC] mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2 items-start">
          <span className="font-bold text-[#101828] text-[16px] flex-shrink-0">Why it matters:</span>
          <span className="text-[#4A5565] text-[16px]">{why}</span>
        </div>
      </div>
    </div>
  );
}

function DelayCard({ text }: { text: string }) {
  return (
    <div className="bg-white border border-[#FFEDD4] rounded-[10px] p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-[#FF6900] mt-0.5 flex-shrink-0" />
      <span className="text-[16px] text-[#364153]">{text}</span>
    </div>
  );
}
