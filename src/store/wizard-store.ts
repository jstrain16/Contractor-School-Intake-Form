import { create, type StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WizardData } from '@/lib/schemas'

interface WizardState {
  currentStep: number
  data: Partial<WizardData>
  applicationId?: string | null
  setApplicationId: (id: string | null) => void
  updateData: (step: keyof WizardData, data: any) => void
  nextStep: () => void
  prevStep: () => void
  setStep: (step: number) => void
  reset: () => void
}

const store: StateCreator<WizardState> = (set) => ({
  currentStep: 0,
  data: {},
  applicationId: null,
  setApplicationId: (id: string | null) => set({ applicationId: id }),
  updateData: (step: keyof WizardData, newData: any) =>
    set((state) => ({
      data: {
        ...state.data,
        [step]: { ...state.data[step as keyof WizardData], ...newData },
      },
    })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  setStep: (step: number) => set({ currentStep: step }),
  reset: () => set({ currentStep: 0, data: {}, applicationId: null }),
})

export const useWizardStore = create<WizardState>()(
  (typeof window !== 'undefined'
    ? persist<WizardState>(store, {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
      })
    : store) as any
)

