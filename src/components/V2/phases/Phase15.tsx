import { CheckCircle, UserCheck, ChevronDown, ChevronUp, ArrowRight, Info, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase15({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 15;
  
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
                <UserCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 15: Staff Review</h3>
              <p className="text-sm text-gray-600">
                Internal quality check before submission
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
                    <strong>Staff Review Process</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Our team will review your complete application package to ensure all documents are correct before submission to DOPL.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Review Status</h4>
              <div className="space-y-4">
                {!formData.salesforceCaseId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-900">
                          <strong>Creating Review Case</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          A Salesforce case will be created and assigned to a staff member for review.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.salesforceCaseId && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-sm text-gray-700">Salesforce Case ID</Label>
                      <p className="text-sm text-gray-900 mt-1">{formData.salesforceCaseId}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700">Assigned Staff Member</Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formData.assignedStaff || 'Assigning...'}
                      </p>
                    </div>
                  </div>
                )}

                {formData.staffReviewComplete && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <p className="text-sm">
                        <strong>Review Complete</strong>
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Your application has been reviewed and approved for submission to DOPL.
                    </p>
                  </div>
                )}

                {!formData.staffReviewComplete && (
                  <div className="space-y-3">
                    {!formData.salesforceCaseId && (
                      <button
                        onClick={() => {
                          const caseId = `SF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                          const staffMembers = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim'];
                          const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
                          
                          setFormData({ 
                            ...formData, 
                            salesforceCaseId: caseId,
                            assignedStaff: randomStaff
                          });
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Create Review Case
                      </button>
                    )}

                    {formData.salesforceCaseId && !formData.staffReviewComplete && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Review Checklist:</strong>
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• All required documents uploaded</li>
                            <li>• Business entity formation verified</li>
                            <li>• Insurance coverage confirmed</li>
                            <li>• Background screening passed</li>
                            <li>• Qualifier information complete</li>
                            <li>• Class completion verified</li>
                          </ul>
                        </div>

                        {/* Admin-only button to mark review complete */}
                        <button
                          onClick={() => {
                            setFormData({ ...formData, staffReviewComplete: true });
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Mark Review as Complete (Admin)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.staffReviewComplete}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to DOPL Submission
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
