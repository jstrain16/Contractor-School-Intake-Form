import { CheckCircle, User, ChevronDown, ChevronUp, Info, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase1({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 1;
  
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
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 1: User Authentication</h3>
              <p className="text-sm text-gray-600">
                Basic information auto-filled from Clerk
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
                  <strong>Identity Provider: Clerk</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Your account information is automatically populated from Clerk authentication. 
                  SMS verification is enabled through Clerk for security.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="mb-2">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200"
                  disabled
                />
                <p className="text-xs text-gray-500">Auto-filled from Clerk</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="mb-2">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200"
                  disabled
                />
                <p className="text-xs text-gray-500">Auto-filled from Clerk</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="mb-2">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200"
                  disabled
                />
                <p className="text-xs text-gray-500">Auto-filled from Clerk</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="mb-2">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-white border-gray-200"
                />
                <p className="text-xs text-gray-500">
                  SMS verification enabled through Clerk
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Continue to License Selection
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
