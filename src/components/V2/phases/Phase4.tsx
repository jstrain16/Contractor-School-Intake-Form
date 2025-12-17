import { CheckCircle, ClipboardCheck, ChevronDown, ChevronUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase4({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 4;
  
  // Determine if user answered "yes" to any screening questions
  const hasIncidents = formData.priorDiscipline === 'yes' || 
    formData.pendingCharges === 'yes' || 
    formData.misdemeanors === 'yes' || 
    formData.felonies === 'yes' || 
    formData.judgments === 'yes' || 
    formData.bankruptcy === 'yes';
  
  // Criminal & Financial risk assessment
  const calculateRisk = () => {
    const hasIssues = [
      formData.priorDiscipline,
      formData.pendingCharges,
      formData.misdemeanors,
      formData.felonies,
      formData.judgments,
      formData.bankruptcy
    ].some(answer => answer === 'yes');

    if (hasIssues) {
      const docs = [
        'Court documents for all charges',
        'Disposition letters',
        'Payment plan documentation',
        'Bankruptcy discharge papers'
      ];
      setFormData({
        ...formData,
        riskLevel: 'high',
        requiredDocs: docs
      });
    } else {
      setFormData({
        ...formData,
        riskLevel: 'low',
        requiredDocs: []
      });
    }
  };
  
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
                <ClipboardCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">
                Phase 4: Criminal & Financial Screening
              </h3>
              <p className="text-sm text-gray-600">
                Identify risk factors and document requirements
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-900 mb-1">
                  <strong>Important Disclosure</strong>
                </p>
                <p className="text-sm text-yellow-700">
                  Answer all questions honestly. "Yes" answers will require detailed incident documentation in a later step.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Have you had prior license disciplinary action?
                </Label>
                <RadioGroup
                  value={formData.priorDiscipline}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, priorDiscipline: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="discipline-yes" />
                    <Label htmlFor="discipline-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="discipline-no" />
                    <Label htmlFor="discipline-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Do you have any pending criminal charges?
                </Label>
                <RadioGroup
                  value={formData.pendingCharges}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, pendingCharges: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="charges-yes" />
                    <Label htmlFor="charges-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="charges-no" />
                    <Label htmlFor="charges-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Any misdemeanor convictions within the last 10 years?
                </Label>
                <RadioGroup
                  value={formData.misdemeanors}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, misdemeanors: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="misdemeanor-yes" />
                    <Label htmlFor="misdemeanor-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="misdemeanor-no" />
                    <Label htmlFor="misdemeanor-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Any felony convictions?
                </Label>
                <RadioGroup
                  value={formData.felonies}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, felonies: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="felony-yes" />
                    <Label htmlFor="felony-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="felony-no" />
                    <Label htmlFor="felony-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Any judgments, liens, or child support delinquencies (last 8 years)?
                </Label>
                <RadioGroup
                  value={formData.judgments}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, judgments: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="judgments-yes" />
                    <Label htmlFor="judgments-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="judgments-no" />
                    <Label htmlFor="judgments-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-gray-900 mb-2">
                  Any bankruptcy in the last 7 years?
                </Label>
                <RadioGroup
                  value={formData.bankruptcy}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, bankruptcy: value })
                  }
                  className="flex gap-6 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="bankruptcy-yes" />
                    <Label htmlFor="bankruptcy-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="bankruptcy-no" />
                    <Label htmlFor="bankruptcy-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={calculateRisk}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Calculate Risk Assessment
              </button>
            </div>

            {formData.riskLevel && (
              <div
                className={`border rounded-lg p-4 ${
                  formData.riskLevel === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <h4
                  className={`mb-2 ${
                    formData.riskLevel === 'high' ? 'text-red-900' : 'text-green-900'
                  }`}
                >
                  Risk Assessment: {formData.riskLevel === 'high' ? 'High' : 'Low'}
                </h4>
                {formData.riskLevel === 'high' ? (
                  <>
                    <p className="text-sm text-red-700 mb-3">
                      Additional documentation will be required. A Salesforce alert has 
                      been created for Contractor School team review.
                    </p>
                    <div className="mt-3">
                      <Label className="text-red-900 mb-2 block">
                        Required Documents:
                      </Label>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {formData.requiredDocs.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-green-700">
                    No issues identified. You may proceed with standard application process.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.riskLevel}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Assistance Selection
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
