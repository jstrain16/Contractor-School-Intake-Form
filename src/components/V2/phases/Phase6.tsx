import { CheckCircle, Building2, ChevronDown, ChevronUp, ArrowRight, Upload, Info, AlertCircle, Plus, Trash2, Users } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PhaseComponentProps } from '../types/ApplicationTypes';

interface Owner {
  id: string;
  name: string;
  dob: string;
  ssn: string;
  address: string;
  phone: string;
  citizenship: string;
  driverLicense: string;
  ownership: string;
}

interface Phase6Props extends PhaseComponentProps {
  handleFileUpload: (field: string, file: File | null) => void;
}

export function Phase6({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  handleFileUpload
}: Phase6Props) {
  const phaseId = 6;

  // Owner management functions
  const addOwner = () => {
    const newOwner: Owner = {
      id: Date.now().toString(),
      name: '',
      dob: '',
      ssn: '',
      address: '',
      phone: '',
      citizenship: '',
      driverLicense: '',
      ownership: ''
    };
    setFormData({
      ...formData,
      owners: [...(formData.owners || []), newOwner]
    });
  };

  const updateOwner = (id: string, field: keyof Owner, value: string) => {
    setFormData({
      ...formData,
      owners: (formData.owners || []).map(owner =>
        owner.id === id ? { ...owner, [field]: value } : owner
      )
    });
  };

  const removeOwner = (id: string) => {
    setFormData({
      ...formData,
      owners: (formData.owners || []).filter(owner => owner.id !== id)
    });
  };

  // Calculate total ownership percentage
  const totalOwnership = (formData.owners || []).reduce((sum, owner) => 
    sum + (parseFloat(owner.ownership) || 0), 0
  );

  // Check if all required fields are complete
  const isPhaseComplete = () => {
    const hasBusinessInfo = formData.businessStatus && formData.businessName && formData.businessType;
    const hasFein = formData.feinStatus;
    const hasBanking = formData.bankAccountStatus;
    const hasEmployeeChoice = formData.hasEmployees;
    const hasOwners = (formData.owners || []).length > 0;
    const ownersComplete = (formData.owners || []).every(owner => 
      owner.name && owner.dob && owner.ownership
    );
    const ownershipTotal = Math.abs(totalOwnership - 100) < 0.01; // Account for floating point

    return hasBusinessInfo && hasFein && hasBanking && hasEmployeeChoice && hasOwners && ownersComplete && ownershipTotal;
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
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
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 6: Business Entity, FEIN & Banking</h3>
              <p className="text-sm text-gray-600">
                Business formation and financial setup
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
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Pre-Class Business Setup</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Complete these business formation tasks before attending your contractor class. These are required for your license application.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Entity Formation */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Business Entity Formation
              </h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-status">Entity Formation Status *</Label>
                  <Select
                    value={formData.businessStatus}
                    onValueChange={(value) => setFormData({ ...formData, businessStatus: value })}
                  >
                    <SelectTrigger id="business-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Registered with Utah Division of Corporations</SelectItem>
                      <SelectItem value="in-progress">Registration in Progress</SelectItem>
                      <SelectItem value="need-assistance">Need Assistance with Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.businessStatus === 'need-assistance' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 mb-2">
                      <strong>Need Help Registering Your Business?</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mb-3">
                      You must register your business entity with the Utah Division of Corporations before attending class.
                    </p>
                    <a
                      href="https://corporations.utah.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Visit Utah Division of Corporations →
                    </a>
                  </div>
                )}

                <div>
                  <Label htmlFor="business-name">Legal Business Name *</Label>
                  <Input
                    id="business-name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="ABC Construction LLC"
                  />
                </div>

                <div>
                  <Label htmlFor="business-type">Entity Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  >
                    <SelectTrigger id="business-type">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="S-Corp">S-Corporation</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="business-address">Business Address *</Label>
                    <Input
                      id="business-address"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-city">City *</Label>
                    <Input
                      id="business-city"
                      value={formData.businessCity}
                      onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                      placeholder="Salt Lake City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-state">State *</Label>
                    <Input
                      id="business-state"
                      value={formData.businessState || 'UT'}
                      onChange={(e) => setFormData({ ...formData, businessState: e.target.value })}
                      placeholder="UT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-zip">ZIP Code *</Label>
                    <Input
                      id="business-zip"
                      value={formData.businessZip}
                      onChange={(e) => setFormData({ ...formData, businessZip: e.target.value })}
                      placeholder="84101"
                    />
                  </div>
                </div>

                {formData.businessStatus === 'registered' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <Label className="text-sm text-gray-700 mb-2 block">
                      Business Entity Documentation
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Upload your entity formation documents (Articles of Organization, Certificate of Incorporation, etc.)
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
                            handleFileUpload('businessDoc', e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {formData.businessDoc && (
                        <span className="text-sm text-green-600">
                          ✓ {formData.businessDoc.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FEIN/EIN */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Federal Employer Identification Number (FEIN/EIN)</h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fein-status">FEIN Status *</Label>
                  <Select
                    value={formData.feinStatus}
                    onValueChange={(value) => setFormData({ ...formData, feinStatus: value })}
                  >
                    <SelectTrigger id="fein-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="obtained">FEIN Obtained from IRS</SelectItem>
                      <SelectItem value="applied">Applied - Waiting for FEIN</SelectItem>
                      <SelectItem value="need-assistance">Need Help Obtaining FEIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.feinStatus === 'need-assistance' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 mb-2">
                      <strong>Need Help Getting Your FEIN?</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mb-3">
                      You can obtain an FEIN (also called EIN) from the IRS for free. It's required for your contractor license.
                    </p>
                    <a
                      href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Apply for FEIN on IRS.gov →
                    </a>
                  </div>
                )}

                {formData.feinStatus === 'obtained' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <Label className="text-sm text-gray-700 mb-2 block">
                      FEIN/EIN Letter from IRS
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Upload your EIN assignment letter or CP 575 notice from the IRS
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
                            handleFileUpload('feinDoc', e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {formData.feinDoc && (
                        <span className="text-sm text-green-600">
                          ✓ {formData.feinDoc.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Bank Account */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Business Bank Account</h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank-status">Bank Account Status *</Label>
                  <Select
                    value={formData.bankAccountStatus}
                    onValueChange={(value) => setFormData({ ...formData, bankAccountStatus: value })}
                  >
                    <SelectTrigger id="bank-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opened">Business Account Opened</SelectItem>
                      <SelectItem value="in-progress">In Process of Opening</SelectItem>
                      <SelectItem value="need-assistance">Need Help Opening Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.bankAccountStatus === 'need-assistance' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 mb-2">
                      <strong>Opening a Business Bank Account</strong>
                    </p>
                    <p className="text-sm text-yellow-700">
                      You'll need your business formation documents and FEIN to open a business bank account. Most banks require an in-person visit.
                    </p>
                  </div>
                )}

                {formData.bankAccountStatus === 'opened' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <Label className="text-sm text-gray-700 mb-2 block">
                      Bank Account Verification
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Upload a bank letter, void check, or account statement showing your business name
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
                            handleFileUpload('bankDoc', e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {formData.bankDoc && (
                        <span className="text-sm text-green-600">
                          ✓ {formData.bankDoc.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner/Officer Management */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Business Owners & Officers
                </h4>
                <button
                  onClick={addOwner}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Owner
                </button>
              </div>

              {(formData.owners || []).length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 mb-2">No Owners Added</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Add all owners, members, or officers with 20% or more ownership
                  </p>
                  <button
                    onClick={addOwner}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm text-sm"
                  >
                    Add First Owner
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {(formData.owners || []).map((owner, index) => (
                  <div key={owner.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-gray-900">Owner #{index + 1}</h5>
                      <button
                        onClick={() => removeOwner(owner.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Full Legal Name *</Label>
                        <Input
                          value={owner.name}
                          onChange={(e) => updateOwner(owner.id, 'name', e.target.value)}
                          placeholder="John Smith"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Date of Birth *</Label>
                        <Input
                          type="date"
                          value={owner.dob}
                          onChange={(e) => updateOwner(owner.id, 'dob', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Social Security Number</Label>
                        <Input
                          value={owner.ssn}
                          onChange={(e) => updateOwner(owner.id, 'ssn', e.target.value)}
                          placeholder="XXX-XX-XXXX"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Phone Number</Label>
                        <Input
                          value={owner.phone}
                          onChange={(e) => updateOwner(owner.id, 'phone', e.target.value)}
                          placeholder="(801) 555-1234"
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm">Address</Label>
                        <Input
                          value={owner.address}
                          onChange={(e) => updateOwner(owner.id, 'address', e.target.value)}
                          placeholder="123 Main St, City, State ZIP"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Citizenship Status</Label>
                        <Select
                          value={owner.citizenship}
                          onValueChange={(value) => updateOwner(owner.id, 'citizenship', value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US Citizen">U.S. Citizen</SelectItem>
                            <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                            <SelectItem value="Work Visa">Work Visa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Driver's License #</Label>
                        <Input
                          value={owner.driverLicense}
                          onChange={(e) => updateOwner(owner.id, 'driverLicense', e.target.value)}
                          placeholder="License number"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Ownership Percentage * (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={owner.ownership}
                          onChange={(e) => updateOwner(owner.id, 'ownership', e.target.value)}
                          placeholder="25.00"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(formData.owners || []).length > 0 && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  Math.abs(totalOwnership - 100) < 0.01 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Total Ownership:</span>
                    <span className={`${
                      Math.abs(totalOwnership - 100) < 0.01 
                        ? 'text-green-700' 
                        : 'text-orange-700'
                    }`}>
                      {totalOwnership.toFixed(2)}%
                    </span>
                  </div>
                  {Math.abs(totalOwnership - 100) >= 0.01 && (
                    <p className="text-xs text-orange-700 mt-2">
                      Total ownership must equal 100%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Workers Comp Determination */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-gray-900 mb-4">Workers Compensation</h4>
              
              <div className="space-y-4">
                <div>
                  <Label>Will you have employees? *</Label>
                  <RadioGroup
                    value={formData.hasEmployees}
                    onValueChange={(value) => {
                      const needsWC = value === 'yes';
                      setFormData({ 
                        ...formData, 
                        hasEmployees: value,
                        needsWorkersComp: needsWC
                      });
                    }}
                    className="space-y-3 mt-2"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="yes" id="employees-yes" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="employees-yes" className="cursor-pointer">
                          Yes, I will have employees
                        </Label>
                        {formData.hasEmployees === 'yes' && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900 mb-1">
                              <strong>Workers Comp Insurance Required</strong>
                            </p>
                            <p className="text-sm text-blue-700">
                              You'll need to obtain Workers Compensation insurance before your license can be issued.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="no" id="employees-no" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="employees-no" className="cursor-pointer">
                          No, I will not have employees
                        </Label>
                        {formData.hasEmployees === 'no' && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-900 mb-1">
                              <strong>Workers Comp Waiver Required</strong>
                            </p>
                            <p className="text-sm text-yellow-700">
                              You'll need to file a Workers Compensation Waiver with the state (completed in Phase 13).
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Completion Warning */}
            {!isPhaseComplete() && (formData.businessStatus || formData.feinStatus || formData.bankAccountStatus) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-900 mb-1">
                      <strong>Complete All Required Fields</strong>
                    </p>
                    <p className="text-sm text-orange-700">
                      Please ensure all business information is complete, at least one owner is added, and ownership totals 100% before continuing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isPhaseComplete() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900">
                      <strong>Business Setup Complete</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      All required business formation tasks are ready. You can proceed to qualifier setup.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!isPhaseComplete()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Qualifier Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
