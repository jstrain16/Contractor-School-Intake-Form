import { CheckCircle, GraduationCap, ChevronDown, ChevronUp, ArrowRight, Info, Calendar } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase10({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 10;
  const requiresExam = ['R100', 'B100', 'E100'].includes(formData.licenseType);
  
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
                <GraduationCap className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 10: Class Completion</h3>
              <p className="text-sm text-gray-600">
                Attendance verification
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
                  <p className="text-sm text-blue-900 mb-1">
                    <strong>Class Attendance Status</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Completion is verified through WooCommerce or manual admin update.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center py-8">
                {formData.classCompleted ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-gray-900 mb-2">Class Completed!</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Congratulations on completing your contractor class.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p className="mb-1">Completed: {formData.classCompletedDate}</p>
                      <p>Class: {formData.selectedClass}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-gray-900 mb-2">Awaiting Class Completion</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This status will update automatically when you complete your scheduled class.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Scheduled: {formData.selectedClass || 'Not selected'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 mb-2">
                <strong>After Class Completion, You Can:</strong>
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Sign the Qualifier Affidavit</li>
                <li>• Activate insurance coverage</li>
                <li>• Submit Workers Comp Waiver</li>
                {requiresExam && <li>• Schedule your PSI exam</li>}
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onComplete}
                disabled={!formData.classCompleted}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requiresExam ? 'Continue to Exam Scheduling' : 'Continue to Insurance Activation'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
