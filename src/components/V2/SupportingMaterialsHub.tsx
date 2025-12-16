import { useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { SectionListView } from './SectionListView';

interface Section {
  id: string;
  title: string;
  incidentCount: number;
  missingCount: number;
  color: string;
}

interface SupportingMaterialsHubProps {
  onBack: () => void;
}

export function SupportingMaterialsHub({ onBack }: SupportingMaterialsHubProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'background-review',
      title: 'Background Review Items',
      incidentCount: 2,
      missingCount: 3,
      color: 'blue',
    },
    {
      id: 'prior-licensing',
      title: 'Prior Licensing Items',
      incidentCount: 0,
      missingCount: 0,
      color: 'purple',
    },
    {
      id: 'financial-review',
      title: 'Financial Review Items',
      incidentCount: 1,
      missingCount: 2,
      color: 'green',
    },
    {
      id: 'bankruptcy',
      title: 'Bankruptcy Items',
      incidentCount: 0,
      missingCount: 0,
      color: 'orange',
    },
  ];

  // Calculate overall status
  const totalIncidents = sections.reduce((sum, s) => sum + s.incidentCount, 0);
  const totalMissing = sections.reduce((sum, s) => sum + s.missingCount, 0);
  
  let overallStatus: 'not-started' | 'in-progress' | 'complete' = 'not-started';
  if (totalIncidents > 0 && totalMissing === 0) {
    overallStatus = 'complete';
  } else if (totalIncidents > 0 || totalMissing > 0) {
    overallStatus = 'in-progress';
  }

  // If a section is selected, show the list view
  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    return (
      <SectionListView
        section={section!}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-900">Supporting Materials</h1>
                <p className="text-sm text-gray-600">Step 2 of 2</p>
              </div>
            </div>
            
            {/* Status Pill */}
            <div>
              {overallStatus === 'complete' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </span>
              )}
              {overallStatus === 'in-progress' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  In Progress
                </span>
              )}
              {overallStatus === 'not-started' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  Not Started
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Missing Items Banner */}
        {totalMissing > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-900">
                  Missing {totalMissing} required item{totalMissing !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Please complete all required items to continue with your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Cards */}
        <div className="grid gap-4 mb-6">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onClick={() => setSelectedSection(section.id)}
            />
          ))}
        </div>

        {/* Global Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Return to Questions
            </button>
            <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200">
              Save & Continue Later
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Section Card Component
interface SectionCardProps {
  section: Section;
  onClick: () => void;
}

function SectionCard({ section, onClick }: SectionCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-white border-blue-100',
    purple: 'from-purple-50 to-white border-purple-100',
    green: 'from-green-50 to-white border-green-100',
    orange: 'from-orange-50 to-white border-orange-100',
  };

  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  const badgeColorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[section.color as keyof typeof colorClasses]} border rounded-xl p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${iconColorClasses[section.color as keyof typeof iconColorClasses]} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-gray-900 mb-1">{section.title}</h3>
            <p className="text-sm text-gray-600">
              {section.incidentCount === 0 
                ? 'No incidents recorded'
                : `${section.incidentCount} incident${section.incidentCount !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
        
        {section.missingCount > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            {section.missingCount} missing
          </span>
        )}
      </div>

      {/* Info Line */}
      <p className="text-xs text-gray-500 mb-4">
        Uploads are labeled automatically (slot + version).
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClick}
          className={`px-4 py-2 ${badgeColorClasses[section.color as keyof typeof badgeColorClasses]} rounded-lg hover:opacity-80 transition-opacity`}
        >
          Open
        </button>
      </div>
    </div>
  );
}
