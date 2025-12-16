import { CheckCircle, Users, ChevronDown, ChevronUp, ArrowRight, Upload } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { PhaseComponentProps } from '../types/ApplicationTypes';

interface Phase7Props extends PhaseComponentProps {
  handleFileUpload: (field: string, file: File | null) => void;
}

export function Phase7({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  handleFileUpload
}: Phase7Props) {
  const phaseId = 7;
  
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
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 7: Qualifier Requirements</h3>
              <p className="text-sm text-gray-600">
                Identify business qualifier
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
              <p className="text-sm text-blue-900">
                <strong>Default Assumption:</strong> The person completing the class is the qualifier.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Is the applicant the qualifier?</Label>
              <RadioGroup
                value={formData.qualifierIsApplicant ? 'yes' : 'no'}
              onValueChange={(value: string) =>
                  setFormData({ ...formData, qualifierIsApplicant: value === 'yes' })
                }
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="yes" id="qualifier-yes" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="qualifier-yes" className="cursor-pointer">
                      Yes, I am the qualifier
                    </Label>
                    {formData.qualifierIsApplicant && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-900">
                          You will need to sign the Qualifier Affidavit after class completion.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="no" id="qualifier-no" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="qualifier-no" className="cursor-pointer">
                      No, someone else is the qualifier
                    </Label>
                    {!formData.qualifierIsApplicant && (
                      <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-sm">Qualifier Full Name</Label>
                          <Input
                            value={formData.qualifierName}
                            onChange={(e) =>
                              setFormData({ ...formData, qualifierName: e.target.value })
                            }
                            placeholder="John Smith"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Qualifier Contact Information</Label>
                          <Textarea
                            value={formData.qualifierInfo}
                            onChange={(e) =>
                              setFormData({ ...formData, qualifierInfo: e.target.value })
                            }
                            placeholder="Email, phone, and relationship to business"
                            className="bg-white"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <Label className="text-sm text-gray-700 mb-2 block">
                Qualifier Affidavit (Upload after class completion)
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                This document must be signed after completing your contractor class
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload('qualifierAffidavit', e.target.files?.[0] || null)
                    }
                  />
                </label>
                {formData.qualifierAffidavit && (
                  <span className="text-sm text-green-600">
                    ✓ {formData.qualifierAffidavit.originalName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.qualifierIsApplicant && !formData.qualifierName}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Insurance Preparation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
