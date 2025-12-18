import { useState, useEffect } from 'react';
import { CheckCircle, Download, ArrowUpCircle, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { PhaseComponentProps } from '../types/ApplicationTypes';

export function InteractiveChecklist({ 
  formData, 
  setFormData,
  onUpgrade 
}: PhaseComponentProps & { onUpgrade: () => void }) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  // Initialize progress from formData if available (assuming we add checklistProgress to formData later)
  // For now local state or if we add it to FormData
  useEffect(() => {
    if ((formData as any).checklistProgress) {
      setProgress((formData as any).checklistProgress);
    }
  }, []);

  const handleCheck = (id: string, checked: boolean) => {
    const newProgress = { ...progress, [id]: checked };
    setProgress(newProgress);
    // Persist to formData
    setFormData({
      ...formData,
      // @ts-ignore - temporary untyped field until we update types
      checklistProgress: newProgress
    });
  };

  const checklistItems = [
    {
      title: 'Business Entity Setup',
      items: [
        { id: 'biz_1', label: 'Register business entity with Utah Division of Corporations' },
        { id: 'biz_2', label: 'Obtain EIN (Federal Employer Identification Number) from IRS' },
        { id: 'biz_3', label: 'Open business bank account' },
        { id: 'biz_4', label: 'Register with Utah State Tax Commission' }
      ]
    },
    {
      title: 'Qualifier & Experience',
      items: [
        { id: 'qual_1', label: 'Identify the Qualifier for the license' },
        { id: 'qual_2', label: 'Verify 2 years of W-2 experience (or 4 years self-employed)' },
        { id: 'qual_3', label: 'Complete Qualifier Affidavit' },
        { id: 'qual_4', label: 'Upload photo ID of Qualifier' }
      ]
    },
    {
      title: 'Insurance & Bonding',
      items: [
        { id: 'ins_1', label: 'Obtain General Liability Insurance ($100k/$300k min)' },
        { id: 'ins_2', label: 'Obtain Workers Compensation Insurance (or Waiver)' },
        { id: 'ins_3', label: 'Obtain License Bond (if required for specific trades)' }
      ]
    },
    {
      title: 'Education & Testing',
      items: [
        { id: 'edu_1', label: 'Complete 25h or 30h Pre-License Course' },
        { id: 'edu_2', label: 'Pass Utah Business & Law Exam (if required)' },
        { id: 'edu_3', label: 'Pass Trade Exam (if required)' }
      ]
    },
    {
      title: 'DOPL Submission',
      items: [
        { id: 'sub_1', label: 'Complete DOPL Application Form' },
        { id: 'sub_2', label: 'Pay DOPL Application Fee' },
        { id: 'sub_3', label: 'Submit Application to DOPL' }
      ]
    }
  ];

  const totalItems = checklistItems.reduce((acc, group) => acc + group.items.length, 0);
  const completedItems = Object.values(progress).filter(Boolean).length;
  const percentComplete = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
      <div className="p-6 border-b border-gray-200 bg-orange-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Checklist Is Ready</h2>
              <p className="text-sm text-gray-600">
                Follow this guide to submit your application on your own.
              </p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Unlock Full App
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-700">
            <span>Progress</span>
            <span>{percentComplete}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-8">
          {checklistItems.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                {group.title}
              </h3>
              <div className="space-y-3 pl-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={item.id}
                      checked={!!progress[item.id]}
                      onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer ${progress[item.id] ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                      >
                        {item.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg max-w-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              This checklist is a guide. You are responsible for ensuring all DOPL requirements are met. 
              Upgrade to the Premium App for automated tracking, document generation, and human review.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

