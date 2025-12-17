import { CheckCircle, Clock, ChevronDown, ChevronUp, PartyPopper, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase17({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 17;
  
  const isApproved = formData.doplSubmissionStatus === 'approved';
  
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
                <Clock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 17: License Status Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor approval timeline and next steps
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
            {!isApproved ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>Approval Timeline</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        Track the status of your license application and estimated approval timeline from DOPL.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-gray-900 mb-4">Estimated Approval Timeline</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="approval-min" className="text-sm text-gray-700 mb-2">
                          Minimum (weeks)
                        </Label>
                        <Input
                          id="approval-min"
                          type="number"
                          placeholder="4"
                          value={formData.estimatedApprovalMin}
                          onChange={(e) =>
                            setFormData({ ...formData, estimatedApprovalMin: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approval-max" className="text-sm text-gray-700 mb-2">
                          Maximum (weeks)
                        </Label>
                        <Input
                          id="approval-max"
                          type="number"
                          placeholder="8"
                          value={formData.estimatedApprovalMax}
                          onChange={(e) =>
                            setFormData({ ...formData, estimatedApprovalMax: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {formData.estimatedApprovalMin && formData.estimatedApprovalMax && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Expected Timeline:</strong>
                        </p>
                        <p className="text-sm text-gray-600">
                          Your license approval is estimated to take{' '}
                          <strong className="text-gray-900">
                            {formData.estimatedApprovalMin} - {formData.estimatedApprovalMax} weeks
                          </strong>{' '}
                          from the submission date.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-gray-900 mb-4">Current Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Submission Status</span>
                      <span className="text-sm text-gray-900">
                        {formData.doplSubmissionStatus === 'submitted' && 'Awaiting Review'}
                        {formData.doplSubmissionStatus === 'under-review' && 'Under Review'}
                        {formData.doplSubmissionStatus === 'additional-info-required' && 'Info Required'}
                        {!formData.doplSubmissionStatus && 'Not Submitted'}
                      </span>
                    </div>
                    {formData.doplSubmissionDate && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Submitted Date</span>
                        <span className="text-sm text-gray-900">
                          {new Date(formData.doplSubmissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 mb-2">
                        <strong>What's Next?</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• DOPL will review your complete application</li>
                        <li>• You may be contacted if additional information is needed</li>
                        <li>• Once approved, you'll receive your license number</li>
                        <li>• You'll be able to verify your license on the DOPL website</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8">
                  <div className="text-center">
                    <PartyPopper className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl text-green-900 mb-3">
                      Congratulations!
                    </h3>
                    <p className="text-green-700 mb-6">
                      Your contractor license has been approved by DOPL!
                    </p>
                    <div className="bg-white rounded-lg p-6 mb-6">
                      <p className="text-sm text-gray-700 mb-4">
                        <strong>What You Can Do Now:</strong>
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Verify your license on the DOPL website</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Begin operating your contracting business</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Keep your insurance and bonds current</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Track license renewal dates</span>
                        </li>
                      </ul>
                    </div>
                    <a
                      href="https://dopl.utah.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verify License on DOPL
                    </a>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-gray-900 mb-4">License Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">License Type</span>
                      <span className="text-sm text-gray-900">{formData.licenseType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Approval Date</span>
                      <span className="text-sm text-gray-900">
                        {formData.doplSubmissionDate && new Date(formData.doplSubmissionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Business Name</span>
                      <span className="text-sm text-gray-900">{formData.businessName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {isApproved ? 'Complete Application' : 'Mark as Tracking'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
