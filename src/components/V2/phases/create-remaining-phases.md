# Creating Remaining Phase Components

This document outlines how to complete the phase extraction from ApplicationForm.tsx and Phases7to17.tsx.

## Current Status

✅ **Complete:**
- Phase1.tsx - User Authentication
- Phase2.tsx - License Type Selection
- Phase7.tsx - Qualifier Requirements

⚠️ **Need to Extract:**
- Phase3.tsx - Class Booking
- Phase4.tsx - Background & Financial Screening  
- Phase4_1.tsx - Incident Information (conditional)
- Phase5.tsx - Assistance Selection
- Phase6.tsx - Business Entity, FEIN & Banking
- Phase8.tsx - Insurance Preparation
- Phase9.tsx - WC Waiver Preparation
- Phase10.tsx - Class Completion
- Phase11.tsx - PSI Exam (conditional for R100/B100/E100)
- Phase12.tsx - Insurance Activation
- Phase13.tsx - Workers Comp Waiver Submission
- Phase14.tsx - Qualifier Affidavit Signature
- Phase15.tsx - Bond Posting
- Phase16.tsx - DOPL Application Submission
- Phase17.tsx - Application Complete

## Source Files to Extract From

1. **ApplicationForm.tsx** (Phases 3-6):
   - Phase 3: Lines ~1142-1400
   - Phase 4: Lines ~1400-1700
   - Phase 5: Lines ~1700-1900
   - Phase 6: Lines ~1900-2200

2. **Phases7to17.tsx** (Phases 7-17):
   - Phase 7: Lines 44-188 ✅ (Complete)
   - Phase 8: Lines 190-299
   - Phase 9: Lines 301-416
   - Phase 10: Lines 418-526
   - Phase 11: Lines 528-700 (conditional)
   - Phase 12: Lines 702-850
   - Phase 13: Lines 852-1000
   - Phase 14: Lines 1002-1150
   - Phase 15: Lines 1152-1300
   - Phase 16: Lines 1302-1450
   - Phase 17: Lines 1452-end

## Extraction Pattern

For each phase, follow this template:

```typescript
import { CheckCircle, [ICON], ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { PhaseComponentProps } from '../types/ApplicationTypes';
// Add other imports as needed

export function PhaseX({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection 
}: PhaseComponentProps) {
  const phaseId = X;
  
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
                <[ICON] className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Phase X: [Title]</h3>
              <p className="text-sm text-gray-600">
                [Description]
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
          {/* COPY CONTENT FROM SOURCE FILE HERE */}
          
          <div className="flex justify-end pt-4">
            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Continue to [Next Phase]
                <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Steps to Complete

1. **For each phase** (3-17):
   - Create PhaseX.tsx file in `/components/phases/`
   - Copy the template above
   - Find the phase content in source file
   - Copy JSX from `expandedSections.includes(X) && (...)` section
   - Update imports for any UI components used
   - Test the component renders correctly

2. **Update ApplicationForm.tsx**:
   - Import all phase components
   - Replace old JSX with component calls:
     ```typescript
     <Phase3
       formData={formData}
       setFormData={setFormData}
       onComplete={() => completePhase(3)}
       expandedSections={expandedSections}
       completedPhases={completedPhases}
       toggleSection={toggleSection}
     />
     ```

3. **Remove old files**:
   - Delete `/components/Phases7to17.tsx`
   - Delete `/components/Phases12to17.tsx`
   - Remove imports from ApplicationForm.tsx

## Phase Icons Reference

- Phase 3: Calendar
- Phase 4: Shield
- Phase 4.1: AlertCircle
- Phase 5: DollarSign
- Phase 6: Building2
- Phase 7: Users
- Phase 8: Shield
- Phase 9: FileText
- Phase 10: GraduationCap
- Phase 11: BookOpen
- Phase 12: Shield
- Phase 13: FileText
- Phase 14: ClipboardCheck
- Phase 15: DollarSign
- Phase 16: Send
- Phase 17: CheckCircle

## Testing Checklist

After creating each phase:
- [ ] Component imports correctly
- [ ] No TypeScript errors
- [ ] Phase renders when clicked
- [ ] FormData updates work
- [ ] Completion button works
- [ ] Conditional logic (if any) works
- [ ] File uploads (if any) work
