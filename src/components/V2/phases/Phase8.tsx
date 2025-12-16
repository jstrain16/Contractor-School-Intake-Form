import { CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase8({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 8;
  
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
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 8: Insurance Preparation</h3>
              <p className="text-sm text-gray-600">
                Begin quoting process (pre-class)
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Insurance Quote Preparation</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    We'll begin preparing your insurance quote. Coverage will NOT be activated until after class completion.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Insurance Partner Notification</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">
                      <strong>Integrated Insurance Solutions</strong>
                    </p>
                    <p className="text-xs text-gray-600">
                      Portal access provided for COI upload after activation
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.insuranceNotified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Notified
                      </span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFormData({ ...formData, insuranceNotified: true });
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  disabled={formData.insuranceNotified}
                >
                  {formData.insuranceNotified ? 'Insurance Team Notified' : 'Notify Insurance Team'}
                </button>

                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>What happens next:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Salesforce opportunity created automatically</li>
                    <li>• IIS receives your application summary</li>
                    <li>• Quote prepared but NOT activated</li>
                    <li>• Insurance activates after class completion</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.insuranceNotified}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to WC Waiver Preparation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
