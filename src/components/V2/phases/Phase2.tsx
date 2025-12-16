import { CheckCircle, Award, ChevronDown, ChevronUp, Info, ArrowRight } from 'lucide-react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase2({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 2;

  const handleLicenseSelection = (value: string) => {
    const requiresExam = ['R100', 'B100', 'E100'].includes(value);
    const classType = requiresExam ? '30-hour' : '25-hour';
    
    setFormData({
      ...formData,
      licenseType: value,
      requiresExam,
      classType
    });
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
                <Award className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 2: License Type Selection</h3>
              <p className="text-sm text-gray-600">
                Choose your contractor classification
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">
                  <strong>License Classification Determines:</strong>
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Class type (25 or 30 hours)</li>
                  <li>• Whether PSI exam is required (R100, B100, E100 require exam)</li>
                  <li>• Course requirements and scheduling</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Select License Classification</Label>
              <p className="text-sm text-gray-600 mb-4">
                Choose the classification you intend to apply for
              </p>
              
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-3">
                    General & Exam Required (30 Hours)
                  </h4>
                  <RadioGroup
                    value={formData.licenseType}
                    onValueChange={handleLicenseSelection}
                    className="space-y-2"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="R100" id="R100" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="R100" className="cursor-pointer">
                          <span className="text-gray-900">R100 - General Residential</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Requires PSI exam | 30-hour course
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="B100" id="B100" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="B100" className="cursor-pointer">
                          <span className="text-gray-900">B100 - General Building</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Requires PSI exam | 30-hour course
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="E100" id="E100" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="E100" className="cursor-pointer">
                          <span className="text-gray-900">E100 - General Engineering</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Requires PSI exam | 30-hour course
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-3">
                    Specialty Classifications (25 Hours, No Exam)
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    All S-Series specialty contractor classifications
                  </p>
                  <RadioGroup
                    value={formData.licenseType}
                    onValueChange={handleLicenseSelection}
                    className="space-y-2"
                  >
                    {[
                      { value: 'S-02', label: 'S-02 - Asbestos Abatement' },
                      { value: 'S-03', label: 'S-03 - Boiler, Hot-Water Heating and Steam Fitting' },
                      { value: 'S-05', label: 'S-05 - Ceramic and Wall Tile' },
                      { value: 'S-06', label: 'S-06 - Concrete' },
                      { value: 'S-07', label: 'S-07 - Drywall' },
                      { value: 'S-08', label: 'S-08 - Fire Protection Systems' },
                      { value: 'S-09', label: 'S-09 - Floor Covering' },
                      { value: 'S-11', label: 'S-11 - Glazing' },
                      { value: 'S-13', label: 'S-13 - Insulation and Weather Stripping' },
                      { value: 'S-14', label: 'S-14 - Lathing and Plastering' },
                      { value: 'S-15', label: 'S-15 - Lock and Security Equipment' },
                      { value: 'S-17', label: 'S-17 - Ornamental Metals' },
                      { value: 'S-18', label: 'S-18 - Painting and Decorating' },
                      { value: 'S-19', label: 'S-19 - Parking and Highway Improvement' },
                      { value: 'S-20', label: 'S-20 - Pipeline' },
                      { value: 'S-22', label: 'S-22 - Refrigeration' },
                      { value: 'S-25', label: 'S-25 - Swimming Pool' },
                      { value: 'S-27', label: 'S-27 - Warm-Air Heating, Ventilating and Air-Conditioning' },
                      { value: 'S-28', label: 'S-28 - Water Conditioning' },
                      { value: 'S-33', label: 'S-33 - Sanitation System' },
                      { value: 'S-34', label: 'S-34 - Well Drilling' },
                    ].map((option) => (
                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="cursor-pointer">
                            <span className="text-gray-900">{option.label}</span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            No exam required | 25-hour course
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {formData.licenseType && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-900">
                    <strong>Selected:</strong> {formData.licenseType}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {formData.requiresExam ? 'PSI Exam Required' : 'No Exam Required'} • {formData.classType}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.licenseType}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Class Selection
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
