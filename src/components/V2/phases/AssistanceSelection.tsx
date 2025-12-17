import { CheckCircle, DollarSign, ChevronDown, ChevronUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function AssistanceSelection({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  // Use a special ID for this unnumbered step, e.g., 4.5
  const phaseId = 4.5;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
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
                  : 'bg-blue-600'
              }`}
            >
              {completedPhases.includes(phaseId) ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <DollarSign className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Assistance Selection</h3>
              <p className="text-sm text-gray-600">
                Choose your level of application support
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Self-Serve Free */}
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  formData.assistanceLevel === 'free'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setFormData({ ...formData, assistanceLevel: 'free' })
                }
              >
                <div className="text-center">
                  <h4 className="text-gray-900 mb-2">Free Checklist</h4>
                  <div className="text-3xl text-gray-900 mb-4">FREE</div>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>✓ Document checklist</li>
                    <li>✓ Basic instructions</li>
                    <li>✓ Self-guided process</li>
                  </ul>
                </div>
              </div>

              {/* Premium Self-Service */}
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  formData.assistanceLevel === 'premium'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setFormData({ ...formData, assistanceLevel: 'premium' })
                }
              >
                <div className="text-center">
                  <h4 className="text-gray-900 mb-2">Premium App</h4>
                  <div className="text-3xl text-gray-900 mb-4">$20</div>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>✓ All Free features</li>
                    <li>✓ Advanced tracking</li>
                    <li>✓ Document templates</li>
                    <li>✓ Email reminders</li>
                  </ul>
                </div>
              </div>

              {/* Consultation */}
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  formData.assistanceLevel === 'consultation'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setFormData({ ...formData, assistanceLevel: 'consultation' })
                }
              >
                <div className="text-center">
                  <h4 className="text-gray-900 mb-2">Consultation</h4>
                  <div className="text-3xl text-gray-900 mb-4">$99</div>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>✓ All Premium features</li>
                    <li>✓ 1-hour consultation</li>
                    <li>✓ Expert guidance</li>
                    <li>✓ Q&A session</li>
                  </ul>
                </div>
              </div>

              {/* Full Assistance */}
              <div
                className={`border rounded-lg p-6 cursor-pointer transition-all relative ${
                  formData.assistanceLevel === 'full'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setFormData({ ...formData, assistanceLevel: 'full' })
                }
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full">
                  Popular
                </div>
                <div className="text-center">
                  <h4 className="text-gray-900 mb-2">Full Assistance</h4>
                  <div className="text-3xl text-gray-900 mb-4">$599</div>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>✓ Complete application</li>
                    <li>✓ Document preparation</li>
                    <li>✓ Human review</li>
                    <li>✓ DOPL submission</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>
              </div>
            </div>

            {formData.assistanceLevel && formData.assistanceLevel !== 'free' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">Payment</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assistancePayment"
                    checked={formData.assistancePaymentComplete}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        assistancePaymentComplete: checked as boolean
                      })
                    }
                  />
                  <Label
                    htmlFor="assistancePayment"
                    className="cursor-pointer text-sm"
                  >
                    I have completed payment for {formData.assistanceLevel} assistance
                  </Label>
                </div>
              </div>
            )}

            {formData.riskLevel === 'high' && formData.assistanceLevel === 'free' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900 mb-1">
                      <strong>Recommendation</strong>
                    </p>
                    <p className="text-sm text-yellow-700">
                      Based on your screening results, we recommend selecting paid 
                      assistance to ensure proper handling of required documentation. 
                      A Salesforce alert has been created for team follow-up.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={
                  !formData.assistanceLevel ||
                  (formData.assistanceLevel !== 'free' &&
                    !formData.assistancePaymentComplete)
                }
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
