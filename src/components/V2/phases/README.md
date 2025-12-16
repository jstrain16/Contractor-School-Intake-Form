# Application Form Phases

This directory contains modular phase components for the contractor license application workflow.

## Structure

Each phase is a separate `.tsx` file that can be independently modified and reordered:

- **Phase1.tsx** - User Authentication (Clerk) ✅ Complete
- **Phase2.tsx** - License Type Selection ✅ Complete  
- **Phase3.tsx** - Class Booking ⚠️ TODO: Extract from ApplicationForm
- **Phase4.tsx** - Background & Financial Screening ⚠️ TODO: Extract from ApplicationForm
- **Phase4_1.tsx** - Incident Information (conditional) ⚠️ TODO: Create
- **Phase5.tsx** - Assistance Selection ⚠️ TODO: Extract from ApplicationForm
- **Phase6.tsx** - Business Entity, FEIN & Banking ⚠️ TODO: Extract from ApplicationForm
- **Phases 7-17** - Currently handled by Phases7to17.tsx component

## Benefits

- **Modularity**: Each phase can be edited independently
- **Reusability**: Phases can be reused across different workflows
- **Maintainability**: Easier to find and update specific sections
- **Flexibility**: Simple to reorder phases by changing import order in ApplicationForm

## Phase Component Props

All phase components receive the same props interface:

```typescript
interface PhaseComponentProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onComplete?: () => void;
  expandedSections: number[];
  completedPhases: number[];
  toggleSection: (phaseId: number) => void;
}
```

## Usage in ApplicationForm

```typescript
import { Phase1 } from './phases/Phase1';
import { Phase2 } from './phases/Phase2';
// ... other phases

// In the component JSX:
<Phase1
  formData={formData}
  setFormData={setFormData}
  onComplete={() => completePhase(1)}
  expandedSections={expandedSections}
  completedPhases={completedPhases}
  toggleSection={toggleSection}
/>

<Phase2
  formData={formData}
  setFormData={setFormData}
  onComplete={() => completePhase(2)}
  expandedSections={expandedSections}
  completedPhases={completedPhases}
  toggleSection={toggleSection}
/>
```

## Reordering Phases

To change the order of phases:

1. Update the phase numbers in each component (phaseId constant)
2. Reorder the import statements in ApplicationForm.tsx
3. Reorder the JSX elements in ApplicationForm.tsx
4. Update the steps array in Dashboard.tsx to match

## TODO: Complete Extraction

The following phases need their content extracted from ApplicationForm.tsx:

1. Phase3 - Class booking UI (lines ~1244-1400)
2. Phase4 - Background questionnaire (lines ~1400-1700)  
3. Phase4_1 - Incident information (needs to be created as conditional component)
4. Phase5 - Assistance selection (lines ~1700-1900)
5. Phase6 - Business setup forms (lines ~1900-2200)

Each extraction should:
- Copy the relevant JSX from ApplicationForm.tsx
- Paste into the phase component's expanded section
- Test that formData and handlers work correctly
- Remove the original code from ApplicationForm.tsx
