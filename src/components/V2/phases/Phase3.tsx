import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, ChevronDown, ChevronUp, ArrowRight, Info, BookOpen, FileText, Building2, Upload, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { PhaseComponentProps, ClassOption } from '../types/ApplicationTypes';
import { LoaderThree } from '@/components/ui/loader';

export function Phase3({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  applicationId,
  handleFileUpload
}: PhaseComponentProps & { applicationId?: string }) { 
  const phaseId = 3;
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/woocommerce/products');
        if (!res.ok) throw new Error('Failed to fetch classes');
        const products = await res.json();
        
        // Map WooCommerce products to ClassOption
        const mapped: ClassOption[] = products.map((p: any) => {
            // Try to find attributes - case insensitive check
            const getAttr = (name: string) => 
              p.attributes?.find((a: any) => a.name.toLowerCase() === name.toLowerCase())?.options?.[0];

            return {
                id: String(p.id),
                sku: p.sku,
                description: p.name,
                price: parseFloat(p.price || '0'),
                seatsAvailable: p.stock_quantity ?? 20, // Default if not managed
                date: getAttr('date') || new Date().toISOString(), 
                time: getAttr('time') || '9:00 AM - 5:00 PM',
                location: getAttr('location') || 'Online / TBD'
            };
        });
        
        // Sort classes by date (soonest first)
        mapped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setClasses(mapped);
      } catch (err) {
        console.error(err);
        setError('Could not load live classes.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);
  
  // Mock class data from WooCommerce (Fallback)
  const mockClasses: ClassOption[] = [
    {
      id: '1',
      sku: 'PL30-MOCK-1',
      date: '2026-01-15',
      time: '9:00 AM - 5:00 PM',
      price: 599,
      seatsAvailable: 12,
      location: 'Salt Lake City, UT',
      description: 'General Building Contractor - 30 Hour Course'
    },
    {
      id: '2',
      sku: 'PL25-MOCK-1',
      date: '2026-01-22',
      time: '9:00 AM - 5:00 PM',
      price: 499,
      seatsAvailable: 8,
      location: 'Provo, UT',
      description: 'Residential Contractor - 25 Hour Course'
    },
    {
      id: '3',
      sku: 'PL25-MOCK-2',
      date: '2026-02-05',
      time: '9:00 AM - 4:00 PM',
      price: 449,
      seatsAvailable: 3,
      location: 'Ogden, UT',
      description: 'Specialty Contractor - 25 Hour Course'
    }
  ];

  const displayClasses = classes.length > 0 ? classes : mockClasses;

  // Validation Logic
  const isStepComplete = () => {
    if (formData.educationMethod === 'new_class') {
      return formData.selectedClass && formData.classPaymentComplete;
    }
    if (formData.educationMethod === 'already_completed') {
      return !!(
        formData.externalProviderName && 
        formData.externalClassCompletionDate && 
        formData.externalCertificateDoc
      );
    }
    if (formData.educationMethod === 'booked_external') {
      return !!(
        formData.externalProviderName && 
        formData.externalClassDate
      );
    }
    return false;
  };

  const methods = [
    {
      id: 'new_class',
      title: 'Book a New Class',
      description: 'Register for an upcoming contractor education course and pay online',
      icon: BookOpen
    },
    {
      id: 'already_completed',
      title: 'I Already Completed the Required Class',
      description: 'Upload your certificate of completion from a Utah-approved provider',
      icon: FileText
    },
    {
      id: 'booked_external',
      title: 'I Booked with Another Organization',
      description: 'Provide proof of booking with an external Utah-approved education provider',
      icon: Building2
    }
  ];
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleSection(phaseId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                completedPhases.includes(phaseId)
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`}
            >
              {completedPhases.includes(phaseId) ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Calendar className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 3: Contractor Education Requirement</h3>
              <p className="text-sm text-gray-600">
                Schedule your contractor education course
              </p>
            </div>
          </div>
          {expandedSections.includes(phaseId) ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      {expandedSections.includes(phaseId) && (
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-6">
            
            {/* Method Selection */}
            <div className="space-y-4">
              <Label className="text-base text-gray-900">How are you fulfilling the education requirement?</Label>
              <p className="text-sm text-gray-600">
                Utah requires contractor education before licensing. Choose your situation:
              </p>
              
              <div className="space-y-3">
                {methods.map((method) => {
                  const isSelected = formData.educationMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setFormData({ ...formData, educationMethod: method.id as any })}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-orange-500' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <method.icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                          <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {method.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Method 1: Book New Class */}
            {formData.educationMethod === 'new_class' && (
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <Label>{formData.classPaymentComplete ? 'Purchased Class' : 'Available Classes'}</Label>
                {!formData.classPaymentComplete && (
                  <p className="text-sm text-gray-600">
                    Select a class date that works for your schedule
                  </p>
                )}

                <div className="space-y-3">
                  {loading ? (
                    <div className="py-8"><LoaderThree /></div>
                  ) : (
                    displayClasses
                      .filter(c => {
                          // If payment is complete, only show the purchased class
                          if (formData.classPaymentComplete) {
                              return c.id === formData.selectedClass;
                          }
                          
                          // Filter based on license type requirement (30-hour vs 25-hour)
                          if (formData.classType === '30-hour') {
                              return c.sku?.includes('PL30');
                          } else if (formData.classType === '25-hour') {
                              return c.sku?.includes('PL25');
                          }
                          
                          // Fallback: show all if no specific type set or no SKU match found
                          return true;
                      })
                      .sort((a, b) => {
                        // Helper to parse date from SKU: PL25-SLC-DAY-2025-DEC-10
                        const getDateFromSku = (sku?: string) => {
                          if (!sku) return null;
                          const parts = sku.split('-');
                          if (parts.length < 6) return null; // Ensure we have enough parts
                          
                          // Format: TYPE-CITY-TIME-YEAR-MONTH-DAY
                          // Index: 0    1    2    3    4     5
                          const year = parseInt(parts[3]);
                          const monthStr = parts[4].toUpperCase();
                          const day = parseInt(parts[5]);
                          
                          const months: {[key: string]: number} = {
                            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                          };
                          
                          const month = months[monthStr];
                          
                          if (!isNaN(year) && month !== undefined && !isNaN(day)) {
                            return new Date(year, month, day).getTime();
                          }
                          return null;
                        };

                        const dateA = getDateFromSku(a.sku) || new Date(a.date).getTime();
                        const dateB = getDateFromSku(b.sku) || new Date(b.date).getTime();
                        
                        return dateA - dateB;
                      })
                      .map((classOption) => (
                    <div
                      key={classOption.id}
                      className={`border rounded-lg p-4 transition-all ${
                        formData.selectedClass === classOption.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!formData.classPaymentComplete) {
                          setFormData({ ...formData, selectedClass: classOption.id })
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">
                            {classOption.description}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                            <div>
                              <span className="text-gray-500">Date:</span>{' '}
                              {new Date(classOption.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span> {classOption.time}
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>{' '}
                              {classOption.location}
                            </div>
                            {!formData.classPaymentComplete && (
                              <div>
                                <span className="text-gray-500">Seats Available:</span>{' '}
                                <span
                                  className={
                                    classOption.seatsAvailable < 5
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }
                                >
                                  {classOption.seatsAvailable}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl text-gray-900">
                            ${classOption.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>

                {formData.selectedClass && (
                  <div className="border border-gray-200 rounded-lg p-4 mt-6">
                    {!formData.classPaymentComplete ? (
                        <>
                          <h4 className="text-gray-900 mb-4">Payment</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">Course Fee</span>
                              <span className="text-gray-900">
                                $
                                {
                                  displayClasses.find((c) => c.id === formData.selectedClass)
                                    ?.price
                                }
                              </span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label className="text-sm font-medium">Step 1: Complete Payment</Label>
                              <a 
                                href={`/api/checkout/start?productId=${formData.selectedClass}${applicationId ? `&appId=${applicationId}` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                                    applicationId ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                                }`}
                                onClick={(e) => {
                                  if (!applicationId) {
                                      e.preventDefault();
                                      alert("Application ID missing. Please refresh the page.");
                                  }
                                }}
                              >
                                Pay on Contractor School Store <ArrowRight className="h-4 w-4" />
                              </a>
                              <p className="text-xs text-gray-500 mt-1">
                                Opens in a new tab. You will be redirected to our secure checkout.
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 mt-2">
                              <Checkbox
                                id="classPayment"
                                checked={formData.classPaymentComplete}
                                disabled={true}
                              />
                              <Label
                                htmlFor="classPayment"
                                className={`text-sm ${formData.classPaymentComplete ? 'text-green-700 font-medium' : 'text-gray-500'}`}
                              >
                                Waiting for payment confirmation...
                              </Label>
                            </div>
                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                <span>Payment status updates automatically. You may need to refresh the page after checkout.</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Note: Payment is processed through WooCommerce. Confirmation email 
                              will be sent after enrollment.
                            </p>
                          </div>
                        </>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Payment Confirmed</p>
                                <p className="text-xs text-green-700">
                                    Your enrollment in {displayClasses.find(c => c.id === formData.selectedClass)?.description || "the class"} is confirmed.
                                </p>
                            </div>
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Method 2: Already Completed */}
            {formData.educationMethod === 'already_completed' && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-900 mb-1">
                        <strong>Certificate Verification</strong>
                      </p>
                      <p className="text-sm text-green-700">
                        Upload your certificate of completion. Our team will verify it meets Utah's requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">Education Provider Name *</Label>
                    <Input
                      id="provider-name"
                      placeholder="e.g., Utah Contractor School, ABC Education, etc."
                      value={formData.externalProviderName || ''}
                      onChange={(e) => setFormData({ ...formData, externalProviderName: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Name of the organization where you completed your contractor education</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completion-date">Completion Date *</Label>
                    <Input
                      id="completion-date"
                      type="date"
                      value={formData.externalClassCompletionDate || ''}
                      onChange={(e) => setFormData({ ...formData, externalClassCompletionDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Date shown on your certificate of completion</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Certificate of Completion *</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Upload your certificate (PDF, JPG, or PNG)
                      </p>
                      <label className="cursor-pointer">
                        <span className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm">
                          Choose File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0] && handleFileUpload) {
                              handleFileUpload('externalCertificateDoc', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {formData.externalCertificateDoc && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          <CheckCircle className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{formData.externalCertificateDoc.originalName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 mb-1">
                        <strong>Important:</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc pl-4 space-y-1">
                        <li>Certificate must be from a Utah-approved education provider</li>
                        <li>Course must meet hour requirements for your license type</li>
                        <li>Certificate must be clearly legible and include completion date</li>
                        <li>Admin will verify and may request additional documentation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Method 3: Booked External */}
            {formData.educationMethod === 'booked_external' && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 mb-1">
                        <strong>External Booking Verification</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        Provide your booking confirmation. We'll verify with the provider before your license application proceeds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ext-provider-name">Education Provider Name *</Label>
                    <Input
                      id="ext-provider-name"
                      placeholder="e.g., Utah Contractor School, ABC Education, etc."
                      value={formData.externalProviderName || ''}
                      onChange={(e) => setFormData({ ...formData, externalProviderName: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Name of the organization where you booked your class</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Scheduled Class Date *</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={formData.externalClassDate || ''}
                      onChange={(e) => setFormData({ ...formData, externalClassDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Date of your scheduled contractor education class</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Booking Confirmation (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Upload confirmation email or receipt (PDF, JPG, or PNG)
                      </p>
                      <label className="cursor-pointer">
                        <span className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm">
                          Choose File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0] && handleFileUpload) {
                              handleFileUpload('externalBookingDoc', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {formData.externalBookingDoc && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          <CheckCircle className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{formData.externalBookingDoc.originalName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 mb-1">
                        <strong>Important:</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc pl-4 space-y-1">
                        <li>Provider must be Utah-approved and recognized by DOPL</li>
                        <li>Your class must be scheduled before your license application deadline</li>
                        <li>Confirmation must show your name, class date, and provider details</li>
                        <li>You must complete the class and submit certificate before final license issuance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!isStepComplete()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Screening
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
