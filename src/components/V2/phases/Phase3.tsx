import { CheckCircle, Calendar, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { PhaseComponentProps, ClassOption } from '../types/ApplicationTypes';

export function Phase3({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 3;
  
  // Mock class data from WooCommerce
  const mockClasses: ClassOption[] = [
    {
      id: '1',
      date: '2026-01-15',
      time: '9:00 AM - 5:00 PM',
      price: 599,
      seatsAvailable: 12,
      location: 'Salt Lake City, UT',
      description: 'General Building Contractor - 30 Hour Course'
    },
    {
      id: '2',
      date: '2026-01-22',
      time: '9:00 AM - 5:00 PM',
      price: 499,
      seatsAvailable: 8,
      location: 'Provo, UT',
      description: 'Residential Contractor - 25 Hour Course'
    },
    {
      id: '3',
      date: '2026-02-05',
      time: '9:00 AM - 4:00 PM',
      price: 449,
      seatsAvailable: 3,
      location: 'Ogden, UT',
      description: 'Specialty Contractor - 25 Hour Course'
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
              <h3 className="text-gray-900">Phase 3: Class Selection & Payment</h3>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">
                  <strong>WooCommerce Integration</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Class dates are pulled from WooCommerce API. Payment processing syncs 
                  your WooCommerce customer account with your Clerk user for single sign-on.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Available Classes</Label>
              <p className="text-sm text-gray-600">
                Select a class date that works for your schedule
              </p>

              <div className="space-y-3">
                {mockClasses.map((classOption) => (
                  <div
                    key={classOption.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.selectedClass === classOption.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, selectedClass: classOption.id })
                    }
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
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl text-gray-900">
                          ${classOption.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.selectedClass && (
                <div className="border border-gray-200 rounded-lg p-4 mt-6">
                  <h4 className="text-gray-900 mb-4">Payment</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Course Fee</span>
                      <span className="text-gray-900">
                        $
                        {
                          mockClasses.find((c) => c.id === formData.selectedClass)
                            ?.price
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="classPayment"
                        checked={formData.classPaymentComplete}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            classPaymentComplete: checked as boolean
                          })
                        }
                      />
                      <Label
                        htmlFor="classPayment"
                        className="cursor-pointer text-sm"
                      >
                        I have completed payment through WooCommerce
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Note: Payment is processed through WooCommerce. Confirmation email 
                      will be sent after enrollment.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.selectedClass || !formData.classPaymentComplete}
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
