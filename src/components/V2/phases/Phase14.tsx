import { CheckCircle, FileCheck, ChevronDown, ChevronUp, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase14({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 14;
  
  const requiredDocuments = [
    { name: 'Business Entity Docs', completed: !!formData.businessStatus },
    { name: 'FEIN Documentation', completed: !!formData.feinStatus },
    { name: 'Bank Account Verification', completed: !!formData.bankAccountStatus },
    { name: 'Certificate of Insurance', completed: !!formData.certificateOfInsurance },
    { name: 'Qualifier Affidavit', completed: !!formData.qualifierAffidavit },
    { name: 'Class Completion Certificate', completed: formData.classCompleted },
  ];

  // Check if exam required licenses need exam pass letter
  const requiresExam = ['R100', 'B100', 'E100'].includes(formData.licenseType);
  if (requiresExam) {
    requiredDocuments.push({ 
      name: 'Exam Pass Letter', 
      completed: !!formData.examPassLetter 
    });
  }

  // Check if WC waiver required
  const needsWcWaiver = formData.hasEmployees === 'no';
  if (needsWcWaiver) {
    requiredDocuments.push({ 
      name: 'WC Waiver Document', 
      completed: formData.wcWaiverSubmitted 
    });
  }

  const allDocsComplete = requiredDocuments.every(doc => doc.completed);
  
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
                <FileCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 14: DOPL Application Assembly</h3>
              <p className="text-sm text-gray-600">
                Verify all documents and prepare submission
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
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Application Assembly</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    We're assembling all your documents for submission to the Utah Division of Professional Licensing (DOPL).
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Document Checklist</h4>
              <div className="space-y-3">
                {requiredDocuments.map((doc, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      doc.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {doc.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                      <span className={`text-sm ${doc.completed ? 'text-green-900' : 'text-gray-700'}`}>
                        {doc.name}
                      </span>
                    </div>
                    <span className={`text-xs ${doc.completed ? 'text-green-600' : 'text-orange-600'}`}>
                      {doc.completed ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {allDocsComplete && !formData.doplApplicationReady && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-green-900">
                      <strong>All Documents Complete</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      Your application package is ready for final assembly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({ ...formData, doplApplicationReady: true });
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  Assemble DOPL Application Package
                </button>
              </div>
            )}

            {formData.doplApplicationReady && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm">
                    <strong>Application Package Ready</strong>
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Your DOPL application package has been assembled and is ready for staff review.
                </p>
              </div>
            )}

            {!allDocsComplete && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-900">
                      <strong>Missing Documents</strong>
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Please complete all required documents before proceeding to staff review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.doplApplicationReady}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Staff Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
