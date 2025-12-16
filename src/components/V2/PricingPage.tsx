import { 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  FileText, 
  Shield, 
  Clock,
  Users,
  Star,
  ChevronRight,
  CheckCircle,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { useState } from 'react';

interface PricingPageProps {
  onBack: () => void;
  onSelectPlan?: (plan: string) => void;
}

export function PricingPage({ onBack, onSelectPlan }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    if (onSelectPlan) {
      onSelectPlan(planName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Application Services</h1>
                <p className="text-sm text-gray-600">Let us handle the details</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Professional Application Services</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl text-white mb-6">
            Focus on Your Business,<br />We'll Handle Your License
          </h2>
          
          <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
            Getting licensed shouldn't be overwhelming. Choose the level of support that's right for you—from full-service application management to expert review.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Review and Send - Basic */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              
              <h3 className="text-2xl text-gray-900 mb-2">Review & Send</h3>
              <p className="text-gray-600 mb-6">Perfect for those who've done the prep work</p>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl text-gray-900">$149</span>
                  <span className="text-gray-600">one-time</span>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPlan('Review & Send')}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mb-8"
              >
                Get Started
              </button>

              <div className="space-y-4">
                <div className="text-sm text-gray-900 uppercase tracking-wide mb-4">What's included:</div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Expert review of your completed application</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Document verification and formatting</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Professional submission to DOPL</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Email support during review process</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">2-3 business day turnaround</div>
                </div>

                <div className="flex items-start gap-3 opacity-40">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-500">Workers comp assistance</div>
                </div>

                <div className="flex items-start gap-3 opacity-40">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-500">Document preparation</div>
                </div>

                <div className="flex items-start gap-3 opacity-40">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-500">Dedicated account manager</div>
                </div>
              </div>
            </div>
          </div>

          {/* Review and Secure Workers Comp - Popular */}
          <div className="bg-white rounded-2xl border-2 border-orange-500 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
            {/* Popular Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-sm font-medium">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                Most Popular
              </div>
            </div>
            
            <div className="p-8 pt-16">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              
              <h3 className="text-2xl text-gray-900 mb-2">Review & Workers Comp</h3>
              <p className="text-gray-600 mb-6">We handle the tricky insurance part</p>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">$299</span>
                  <span className="text-gray-600">one-time</span>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPlan('Review & Workers Comp')}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 mb-8"
              >
                Get Started
              </button>

              <div className="space-y-4">
                <div className="text-sm text-gray-900 uppercase tracking-wide mb-4">Everything in Review & Send, plus:</div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Workers compensation waiver secured</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Insurance documentation assistance</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">General liability verification</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Priority email support</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">1-2 business day turnaround</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">Follow-up with DOPL if needed</div>
                </div>

                <div className="flex items-start gap-3 opacity-40">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-500">Full application preparation</div>
                </div>

                <div className="flex items-start gap-3 opacity-40">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-500">Business entity formation help</div>
                </div>
              </div>
            </div>
          </div>

          {/* We Do It All - Premium */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
            {/* Premium Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-center py-2 text-sm font-medium">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 fill-current" />
                White Glove Service
              </div>
            </div>
            
            <div className="p-8 pt-16">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-gray-900" />
              </div>
              
              <h3 className="text-2xl text-white mb-2">We Do It All</h3>
              <p className="text-gray-400 mb-6">Sit back while we handle everything</p>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">$799</span>
                  <span className="text-gray-400">one-time</span>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPlan('We Do It All')}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 mb-8"
              >
                Get Started
              </button>

              <div className="space-y-4">
                <div className="text-sm text-white uppercase tracking-wide mb-4">Everything in Review & Workers Comp, plus:</div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Complete application preparation from start to finish</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">All document gathering and organization</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Business entity guidance and FEIN assistance</div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Insurance procurement assistance</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Dedicated account manager</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Phone & email support throughout process</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Priority processing (24-48 hours)</div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">Money-back guarantee if not approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl text-gray-900 mb-4">Compare All Plans</h3>
          <p className="text-gray-600">Choose the right level of support for your needs</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm text-gray-900">Features</th>
                  <th className="text-center px-6 py-4 text-sm text-gray-900">Review & Send</th>
                  <th className="text-center px-6 py-4 text-sm text-orange-600 bg-orange-50">Review & Workers Comp</th>
                  <th className="text-center px-6 py-4 text-sm text-gray-900">We Do It All</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Expert Application Review</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><Check className="w-5 h-5 text-orange-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Professional DOPL Submission</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><Check className="w-5 h-5 text-orange-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Workers Comp Waiver</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><Check className="w-5 h-5 text-orange-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Insurance Assistance</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><Check className="w-5 h-5 text-orange-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Complete Application Preparation</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Document Gathering Service</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Business Entity Guidance</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Dedicated Account Manager</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center bg-orange-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Turnaround Time</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">2-3 days</td>
                  <td className="px-6 py-4 text-center bg-orange-50 text-sm text-gray-600">1-2 days</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">24-48 hrs</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">Price</td>
                  <td className="px-6 py-4 text-center text-gray-900">$149</td>
                  <td className="px-6 py-4 text-center bg-orange-50 text-orange-600">$299</td>
                  <td className="px-6 py-4 text-center text-gray-900">$799</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl text-gray-900 mb-4">Frequently Asked Questions</h3>
          <p className="text-gray-600">Everything you need to know about our services</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-gray-900 mb-2">How long does the licensing process take?</h4>
            <p className="text-sm text-gray-600">While processing times vary by service tier, DOPL typically reviews applications within 2-4 weeks after submission. Our services ensure your application is complete and accurate, reducing delays.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-gray-900 mb-2">What if my application is rejected?</h4>
            <p className="text-sm text-gray-600">With our "We Do It All" package, we offer a money-back guarantee. For all tiers, we'll work with you to address any issues and resubmit at no additional cost.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-gray-900 mb-2">Do I still need to complete the licensing course?</h4>
            <p className="text-sm text-gray-600">Yes, completing the pre-licensure education course is required by Utah law. Our services help with the application process after you've completed your education.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-gray-900 mb-2">Can I upgrade my service package later?</h4>
            <p className="text-sm text-gray-600">Absolutely! You can upgrade to a higher tier at any time. We'll credit what you've already paid toward the upgraded service.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl text-white mb-4">Ready to Get Licensed?</h3>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of contractors who trusted us with their licensing journey
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => handleSelectPlan('We Do It All')}
              className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Your Application
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white rounded-lg hover:bg-white/20 transition-colors">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
