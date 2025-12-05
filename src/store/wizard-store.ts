import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WizardData } from '@/lib/schemas'

interface WizardState {
  currentStep: number
  data: Partial<WizardData>
  updateData: (step: keyof WizardData, data: any) => void
  nextStep: () => void
  prevStep: () => void
  setStep: (step: number) => void
  reset: () => void
}

const store = (set: any) => ({
  currentStep: 0,
  data: {},
  updateData: (step: keyof WizardData, newData: any) =>
    set((state: any) => ({
      data: {
        ...state.data,
        [step]: { ...state.data[step], ...newData },
      },
    })),
  nextStep: () => set((state: any) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state: any) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  setStep: (step: number) => set({ currentStep: step }),
  reset: () => set({ currentStep: 0, data: {} }),
})

export const useWizardStore = create<WizardState>()(
  typeof window !== 'undefined'
    ? persist(store, {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
      })
    : store
)

