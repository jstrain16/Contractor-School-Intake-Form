import { CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

interface Phase12Props extends PhaseComponentProps {
  handleFileUpload?: (field: string, file: File | null) => void;
}

export function Phase12({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  handleFileUpload
}: Phase12Props) {
  const phaseId = 12;
  
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
              <h3 className="text-gray-900">Phase 12: Insurance Activation</h3>
              <p className="text-sm text-gray-600">
                Activate coverage and upload COI
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
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Insurance Activation</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    After completing your class, your insurance coverage will be activated. You'll need to upload your Certificate of Insurance (COI).
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Insurance Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">
                      <strong>Coverage Status</strong>
                    </p>
                    <p className="text-xs text-gray-600">
                      {formData.insuranceActive ? 'Coverage is active' : 'Waiting for activation'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.insuranceActive ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </div>
                </div>

                {!formData.insuranceActive && (
                  <button
                    onClick={() => {
                      setFormData({ ...formData, insuranceActive: true });
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Activate Insurance Coverage
                  </button>
                )}

                {formData.insuranceActive && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Upload Certificate of Insurance (COI)</strong>
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Upload your COI provided by the insurance company
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
                            handleFileUpload?.('certificateOfInsurance', e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {formData.certificateOfInsurance && (
                        <span className="text-sm text-green-600">
                          ✓ {formData.certificateOfInsurance.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.insuranceActive || !formData.certificateOfInsurance}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to WC Waiver Submission
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
