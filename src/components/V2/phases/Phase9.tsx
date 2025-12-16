import { CheckCircle, FileText, ChevronDown, ChevronUp, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase9({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 9;
  
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
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 9: WC Waiver Preparation</h3>
              <p className="text-sm text-gray-600">
                Ensure documentation ready
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-900 mb-1">
                    <strong>Waiver Cannot Be Submitted Yet</strong>
                  </p>
                  <p className="text-sm text-yellow-700">
                    Workers Comp Waiver can only be submitted after class completion and insurance activation.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Required Documentation Checklist</h4>
              <div className="space-y-3">
                {[
                  {
                    name: 'Business Registration',
                    status: formData.businessStatus === 'formed' && formData.businessDoc,
                  },
                  {
                    name: 'FEIN (CP 575)',
                    status: formData.feinStatus === 'have-fein' && formData.feinDoc,
                  },
                  {
                    name: 'Business Bank Account',
                    status: formData.bankAccountStatus === 'have-account' && formData.bankDoc,
                  },
                  {
                    name: 'Certificate of Insurance (COI)',
                    status: formData.insuranceCOI,
                    note: 'Uploaded by insurance team after activation',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm text-gray-900">{item.name}</p>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                      )}
                    </div>
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Future Enhancement Note:</strong>
              </p>
              <p className="text-sm text-blue-700">
                Exploring AI/RPA tools and inbox OAuth integration for automated waiver submission.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Documentation Prepared - Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
