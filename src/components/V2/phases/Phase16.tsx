import { CheckCircle, Send, ChevronDown, ChevronUp, ArrowRight, Calendar, Info } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase16({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 16;
  
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
                <Send className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 16: DOPL Submission</h3>
              <p className="text-sm text-gray-600">
                Submit application to state licensing board
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
                    <strong>DOPL Submission</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Your complete application package will be submitted to the Utah Division of Professional Licensing (DOPL).
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Submission Details</h4>
              <div className="space-y-4">
                {!formData.doplSubmissionStatus && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Ready to Submit</strong>
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      Your application has been reviewed and is ready for submission to DOPL. Click below to submit.
                    </p>
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setFormData({ 
                          ...formData, 
                          doplSubmissionStatus: 'submitted',
                          doplSubmissionDate: today
                        });
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Application to DOPL
                    </button>
                  </div>
                )}

                {formData.doplSubmissionStatus && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <CheckCircle className="w-5 h-5" />
                        <p className="text-sm">
                          <strong>Application Submitted</strong>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">
                            Submitted: {new Date(formData.doplSubmissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Submission Status</strong>
                      </p>
                      <RadioGroup
                        value={formData.doplSubmissionStatus}
                        onValueChange={(value) =>
                          setFormData({ ...formData, doplSubmissionStatus: value })
                        }
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="submitted" id="status-submitted" />
                          <Label htmlFor="status-submitted" className="text-sm cursor-pointer">
                            Submitted - Awaiting DOPL Review
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="under-review" id="status-review" />
                          <Label htmlFor="status-review" className="text-sm cursor-pointer">
                            Under Review by DOPL
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="additional-info-required" id="status-info" />
                          <Label htmlFor="status-info" className="text-sm cursor-pointer">
                            Additional Information Required
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="approved" id="status-approved" />
                          <Label htmlFor="status-approved" className="text-sm cursor-pointer">
                            Approved - License Issued
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.doplSubmissionStatus === 'approved' && (
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                          <p className="text-green-900 mb-2">
                            <strong>Congratulations!</strong>
                          </p>
                          <p className="text-sm text-green-700">
                            Your contractor license has been approved by DOPL!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.doplSubmissionStatus}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to License Tracking
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
