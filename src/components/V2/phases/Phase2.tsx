import { useState } from 'react';
import { CheckCircle, Award, ChevronDown, ChevronUp, Info, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { PhaseComponentProps } from '../types/ApplicationTypes';

const AccordionSection = ({
  title,
  description,
  options,
  selected,
  onSelect,
  selectedSpecialties,
  onToggleSpecialty,
  specialtyLimit,
  type,
}: {
  title: string;
  description: string;
  options: { code: string; name: string; desc?: string }[];
  selected?: string;
  onSelect?: (code: string) => void;
  selectedSpecialties?: string[];
  onToggleSpecialty?: (code: string) => void;
  specialtyLimit?: number;
  type: 'general' | 'ep' | 'specialty';
}) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        onClick={toggle}
      >
        <div className="text-left">
          <div className="text-gray-900 font-semibold">{title}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-gray-200 p-3 space-y-2">
          {type !== 'specialty' &&
            options.map((opt) => (
              <label
                key={opt.code}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                  selected === opt.code ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
                onClick={() => onSelect?.(opt.code)}
              >
                <input
                  type="radio"
                  className="mt-1 h-4 w-4"
                  checked={selected === opt.code}
                  onChange={() => onSelect?.(opt.code)}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {opt.code} — {opt.name}
                  </div>
                  {opt.desc && <div className="text-xs text-gray-600 mt-0.5">{opt.desc}</div>}
                </div>
              </label>
            ))}
          {type === 'specialty' &&
            options.map((opt) => {
              const isChecked = selectedSpecialties?.includes(opt.code);
              const disabled = !isChecked && (selectedSpecialties?.length || 0) >= (specialtyLimit || 3);
              return (
                <label
                  key={opt.code}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                    isChecked ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && onToggleSpecialty?.(opt.code)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => !disabled && onToggleSpecialty?.(opt.code)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {opt.code} — {opt.name}
                    </div>
                    {opt.desc && <div className="text-xs text-gray-600 mt-0.5">{opt.desc}</div>}
                  </div>
                </label>
              );
            })}
          {type === 'specialty' && (
            <div className="text-xs text-gray-600">
              Selected {selectedSpecialties?.length || 0}/{specialtyLimit} (max 3)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function Phase2({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 2;
  const specialtyLimit = 3;

  const generalOptions = [
    { code: 'B100', name: 'General Building Contractor', desc: 'Supervise or perform construction of buildings.' },
    { code: 'E100', name: 'General Engineering Contractor', desc: 'Fixed works like bridges, tunnels, flood control.' },
    { code: 'R100', name: 'Residential/Small Commercial Contractor', desc: 'Single-family, small multi-family, commercial ≤3 stories/20k sq ft.' },
  ];

  const epOptions = [
    { code: 'E200', name: 'General Electrical', desc: 'General electrical contracting.' },
    { code: 'E201', name: 'Residential Electrical', desc: 'Residential electrical contracting.' },
    { code: 'P200', name: 'General Plumbing', desc: 'General plumbing contracting.' },
    { code: 'P201', name: 'Residential Plumbing', desc: 'Residential plumbing contracting.' },
  ];

  const specialtyOptions = [
    { code: 'S202', name: 'Solar Photovoltaic' },
    { code: 'S220', name: 'Carpentry & Flooring' },
    { code: 'S230', name: 'Masonry, Siding, Stucco, Glass, Gutters' },
    { code: 'S280', name: 'Roofing' },
    { code: 'S310', name: 'Foundation, Excavation, Demolition' },
    { code: 'S350', name: 'HVAC (Heating, Ventilation, Air Conditioning)' },
    { code: 'S370', name: 'Fire Suppression Systems' },
    { code: 'S410', name: 'Boiler, Pipeline, Wastewater' },
    { code: 'S700', name: 'Specialty License Contractor (unique scopes)' },
  ];

  const handleGeneralSelect = (code: string) => {
    setFormData({
      ...formData,
      licenseType: code,
      requiresExam: ['R100', 'B100', 'E100'].includes(code),
      classType: ['R100', 'B100', 'E100'].includes(code) ? '30-hour' : '25-hour',
      specialtyLicenses: [],
    });
  };

  const handleEPSelect = (code: string) => {
    setFormData({
      ...formData,
      licenseType: code,
      requiresExam: ['R100', 'B100', 'E100'].includes(code),
      classType: ['R100', 'B100', 'E100'].includes(code) ? '30-hour' : '25-hour',
      specialtyLicenses: [],
    });
  };

  const handleSpecialtyToggle = (code: string) => {
    const current = formData.specialtyLicenses || [];
    const isSelected = current.includes(code);
    if (isSelected) {
      setFormData({
        ...formData,
        specialtyLicenses: current.filter((c) => c !== code),
      });
      return;
    }
    if (current.length >= specialtyLimit) {
      return;
    }
    setFormData({
      ...formData,
      licenseType: code, // last specialty selected becomes primary display
      requiresExam: false,
      classType: '25-hour',
      specialtyLicenses: [...current, code],
    });
  };

  const specialtyCount = (formData.specialtyLicenses || []).length;

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

              <div className="space-y-4">
                {/* General */}
                <AccordionSection
                  title="General Contractor Classifications"
                  description="B100, E100, R100"
                  options={generalOptions}
                  selected={formData.licenseType}
                  onSelect={handleGeneralSelect}
                  type="general"
                />

                {/* Electrical & Plumbing */}
                <AccordionSection
                  title="Electrical & Plumbing (General & Residential)"
                  description="E200/E201, P200/P201"
                  options={epOptions}
                  selected={formData.licenseType}
                  onSelect={handleEPSelect}
                  type="ep"
                />

                {/* Specialty */}
                <AccordionSection
                  title="Specialty License Classifications (S-Codes)"
                  description="Up to 3 specialty licenses"
                  options={specialtyOptions}
                  selectedSpecialties={formData.specialtyLicenses || []}
                  onToggleSpecialty={handleSpecialtyToggle}
                  specialtyLimit={specialtyLimit}
                  type="specialty"
                />
              </div>

              {formData.licenseType && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-900">
                    <strong>Selected:</strong> {formData.licenseType}
                  </p>
                  {formData.specialtyLicenses && formData.specialtyLicenses.length > 0 && (
                    <p className="text-sm text-green-800 mt-1">
                      Specialty licenses: {formData.specialtyLicenses.join(", ")} (max 3)
                    </p>
                  )}
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
