import { CheckCircle, BookOpen, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function Phase11({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = 11;
  
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
                <BookOpen className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase 11: PSI Exam</h3>
              <p className="text-sm text-gray-600">
                Schedule and pass required exam
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
          {/* TODO: Extract from Phases7to17.tsx lines 528-700 */}
          <div className="text-center py-8 text-gray-500">
            Phase 11 content - Extract from Phases7to17.tsx
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Continue to Insurance Activation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
