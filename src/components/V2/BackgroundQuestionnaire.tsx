import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { SupportingMaterialsHub } from './SupportingMaterialsHub';

interface QuestionnaireData {
  priorLicensingDenied: boolean | null;
  pendingLegalMatters: boolean | null;
  misdemeanorMatters: boolean | null;
  felonyMatters: boolean | null;
  judgmentsLiens: boolean | null;
  bankruptcyFilings: boolean | null;
}

interface BackgroundQuestionnaireProps {
  onBack: () => void;
}

export function BackgroundQuestionnaire({ onBack }: BackgroundQuestionnaireProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSupportingMaterials, setShowSupportingMaterials] = useState(false);
  const [data, setData] = useState<QuestionnaireData>({
    priorLicensingDenied: null,
    pendingLegalMatters: null,
    misdemeanorMatters: null,
    felonyMatters: null,
    judgmentsLiens: null,
    bankruptcyFilings: null,
  });

  // If showing supporting materials, render that component
  if (showSupportingMaterials) {
    return <SupportingMaterialsHub onBack={() => setShowSupportingMaterials(false)} />;
  }

  // Simulate autosave functionality
  const saveData = async (updatedData: QuestionnaireData) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setLastSaved(new Date());
  };

  const handleToggle = (field: keyof QuestionnaireData, value: boolean) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    saveData(updatedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-900">Background & Financial Review</h1>
                <p className="text-sm text-gray-600">Step 1 of 2</p>
              </div>
            </div>
            
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Saved</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">Step 1 of 2</span>
          </div>
        </div>

        {/* Intro Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 mb-2">
                Please answer the following questions truthfully.
              </p>
              <p className="text-sm text-gray-700">
                If you answer "Yes" to any question, you'll be able to provide details and upload supporting materials on the next screen.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Prior Licensing */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Prior Licensing Items</h2>
            </div>
            <div className="p-6">
              <QuestionToggle
                question="Have you ever had a professional license denied, suspended, revoked, or placed on probation?"
                value={data.priorLicensingDenied}
                onChange={(value) => handleToggle('priorLicensingDenied', value)}
              />
            </div>
          </div>

          {/* Section 2: Background Review */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Background Review Items</h2>
            </div>
            <div className="p-6 space-y-6">
              <QuestionToggle
                question="Do you have any pending legal matters?"
                value={data.pendingLegalMatters}
                onChange={(value) => handleToggle('pendingLegalMatters', value)}
              />
              <div className="border-t border-gray-100"></div>
              <QuestionToggle
                question="Any misdemeanor matters in the last 10 years?"
                value={data.misdemeanorMatters}
                onChange={(value) => handleToggle('misdemeanorMatters', value)}
              />
              <div className="border-t border-gray-100"></div>
              <QuestionToggle
                question="Any felony matters at any time?"
                value={data.felonyMatters}
                onChange={(value) => handleToggle('felonyMatters', value)}
              />
            </div>
          </div>

          {/* Section 3: Financial Review */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Financial Review Items</h2>
            </div>
            <div className="p-6">
              <QuestionToggle
                question="Any judgments, liens, or child support delinquencies in the last 8 years?"
                value={data.judgmentsLiens}
                onChange={(value) => handleToggle('judgmentsLiens', value)}
              />
            </div>
          </div>

          {/* Section 4: Bankruptcy */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Bankruptcy Items</h2>
            </div>
            <div className="p-6">
              <QuestionToggle
                question="Any bankruptcy filings in the last 7 years?"
                value={data.bankruptcyFilings}
                onChange={(value) => handleToggle('bankruptcyFilings', value)}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => setShowSupportingMaterials(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Continue to Supporting Materials
          </button>
        </div>
      </main>
    </div>
  );
}

// Question Toggle Component
interface QuestionToggleProps {
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

function QuestionToggle({ question, value, onChange }: QuestionToggleProps) {
  return (
    <div>
      <p className="text-gray-900 mb-4">{question}</p>
      <div className="flex gap-3">
        <button
          onClick={() => onChange(false)}
          className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all ${
            value === false
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="block mb-1">No</span>
          {value === false && (
            <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
          )}
        </button>
        <button
          onClick={() => onChange(true)}
          className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all ${
            value === true
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="block mb-1">Yes</span>
          {value === true && (
            <CheckCircle className="w-5 h-5 mx-auto text-orange-600" />
          )}
        </button>
      </div>
      
      {/* Conditional Note when "Yes" is selected */}
      {value === true && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <p className="text-sm text-orange-900">
              You'll be able to add details and upload materials on the next screen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}