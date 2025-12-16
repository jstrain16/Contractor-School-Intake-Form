import { CheckCircle, FileText, ChevronDown, ChevronUp, ArrowRight, Upload, Info } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

interface Phase13Props extends PhaseComponentProps {
  handleFileUpload?: (field: string, file: File | null) => void;
}

export function Phase13({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  handleFileUpload
}: Phase13Props) {
  const phaseId = 13;
  
  // Only show if user selected "no employees" which requires WC waiver
  const needsWcWaiver = formData.hasEmployees === 'no';
  
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
              <h3 className="text-gray-900">Phase 13: WC Waiver Submission</h3>
              <p className="text-sm text-gray-600">
                {needsWcWaiver ? 'Submit Workers Comp Waiver to state' : 'Not required (has employees)'}
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
            {needsWcWaiver ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>Workers Comp Waiver Required</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        Since you indicated no employees, you'll need to submit a Workers Compensation Waiver to the state.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-gray-900 mb-4">Waiver Submission</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>What is the WC Waiver?</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        If you don't plan to have employees, you can file a Workers' Compensation Waiver with the state.
                        This waiver must be approved before your license can be issued.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Upload Completed WC Waiver</strong>
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload the completed and signed Workers Comp Waiver document
                      </p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Choose File</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileUpload?.('wcWaiverDoc', e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        {formData.wcWaiverDoc && (
                          <span className="text-sm text-green-600">
                            ✓ {formData.wcWaiverDoc.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {formData.wcWaiverDoc && !formData.wcWaiverSubmitted && (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, wcWaiverSubmitted: true });
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Submit WC Waiver to State
                      </button>
                    )}

                    {formData.wcWaiverSubmitted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <p className="text-sm">
                            <strong>WC Waiver Submitted</strong>
                          </p>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          Your Workers Comp Waiver has been submitted to the state for approval.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 mb-2">
                  <strong>WC Waiver Not Required</strong>
                </p>
                <p className="text-sm text-gray-600">
                  You indicated you will have employees, so Workers Comp Insurance is required instead of a waiver.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={needsWcWaiver && (!formData.wcWaiverDoc || !formData.wcWaiverSubmitted)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Qualifier Affidavit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
