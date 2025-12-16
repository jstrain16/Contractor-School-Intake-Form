import { useState } from 'react';
import { ArrowLeft, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { IncidentDetailView } from './IncidentDetailView';

interface Incident {
  id: string;
  label: string;
  subtitle: string;
  requiredTotal: number;
  requiredComplete: number;
  missingCount: number;
}

interface Section {
  id: string;
  title: string;
  incidentCount: number;
  missingCount: number;
  color: string;
}

interface SectionListViewProps {
  section: Section;
  onBack: () => void;
}

export function SectionListView({ section, onBack }: SectionListViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-01',
      label: 'INC-01',
      subtitle: 'Misdemeanor (2019) — Salt Lake County',
      requiredTotal: 6,
      requiredComplete: 4,
      missingCount: 2,
    },
    {
      id: 'INC-02',
      label: 'INC-02',
      subtitle: 'Pending Legal Matter — District Court',
      requiredTotal: 5,
      requiredComplete: 3,
      missingCount: 2,
    },
  ]);

  const handleCreateIncident = (data: CreateIncidentData) => {
    const newIncident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(2, '0')}`,
      label: `INC-${String(incidents.length + 1).padStart(2, '0')}`,
      subtitle: `${data.subtype} ${data.incidentDate ? `(${data.incidentDate})` : ''} — ${data.jurisdiction}`,
      requiredTotal: 6,
      requiredComplete: 0,
      missingCount: 6,
    };
    setIncidents([...incidents, newIncident]);
    setShowCreateModal(false);
  };

  // If an incident is selected, show the detail view
  if (selectedIncident) {
    return (
      <IncidentDetailView
        incidentId={selectedIncident.id}
        incidentLabel={selectedIncident.label}
        onBack={() => setSelectedIncident(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="hover:text-gray-700 cursor-pointer" onClick={onBack}>
                  Supporting Materials
                </span>
                <span>→</span>
                <span className="text-gray-900">{section.title}</span>
              </div>
              <h1 className="text-gray-900">{section.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add {section.title.replace(' Items', ' Item')}
          </button>
        </div>

        {/* Incidents List */}
        {incidents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-6">
              Click "Add {section.title.replace(' Items', ' Item')}" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <IncidentTile 
                key={incident.id} 
                incident={incident}
                onOpen={() => setSelectedIncident(incident)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <CreateIncidentModal
          sectionTitle={section.title}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateIncident}
        />
      )}
    </div>
  );
}

// Incident Tile Component
interface IncidentTileProps {
  incident: Incident;
  onOpen: () => void;
}

function IncidentTile({ incident, onOpen }: IncidentTileProps) {
  const progress = (incident.requiredComplete / incident.requiredTotal) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              {incident.label}
            </span>
            {incident.missingCount > 0 && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                {incident.missingCount} missing
              </span>
            )}
          </div>
          <p className="text-gray-900 mb-3">{incident.subtitle}</p>
          
          {/* Completeness Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Required {incident.requiredComplete}/{incident.requiredTotal} done
              </span>
              <span className="text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-600" 
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={onOpen}
          className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
        >
          Open
        </button>
      </div>
    </div>
  );
}

// Create Incident Modal
interface CreateIncidentData {
  subtype: string;
  jurisdiction: string;
  incidentDate: string;
  caseReference: string;
}

interface CreateIncidentModalProps {
  sectionTitle: string;
  onClose: () => void;
  onCreate: (data: CreateIncidentData) => void;
}

function CreateIncidentModal({ sectionTitle, onClose, onCreate }: CreateIncidentModalProps) {
  const [formData, setFormData] = useState<CreateIncidentData>({
    subtype: '',
    jurisdiction: '',
    incidentDate: '',
    caseReference: '',
  });

  // Get friendly subtype options based on section
  const getSubtypeOptions = () => {
    if (sectionTitle.includes('Background')) {
      return [
        'Pending Legal Matter',
        'Misdemeanor',
        'Felony',
        'Other Background Item',
      ];
    } else if (sectionTitle.includes('Prior Licensing')) {
      return [
        'License Denial',
        'License Suspension',
        'License Revocation',
        'Probation',
      ];
    } else if (sectionTitle.includes('Financial')) {
      return [
        'Judgment',
        'Lien',
        'Child Support Delinquency',
        'Other Financial Matter',
      ];
    } else if (sectionTitle.includes('Bankruptcy')) {
      return [
        'Chapter 7 Bankruptcy',
        'Chapter 11 Bankruptcy',
        'Chapter 13 Bankruptcy',
      ];
    }
    return ['General Item'];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subtype && formData.jurisdiction) {
      onCreate(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-white">Create New Item</h2>
          <p className="text-sm text-orange-100 mt-1">{sectionTitle}</p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Subtype Dropdown */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Type <span className="text-orange-600">*</span>
              </label>
              <select
                value={formData.subtype}
                onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select a type...</option>
                {getSubtypeOptions().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Jurisdiction */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Jurisdiction <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                placeholder="e.g., Salt Lake County, District Court"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Incident Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Incident Date
              </label>
              <input
                type="month"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Month and year is sufficient</p>
            </div>

            {/* Case/Reference Number */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Case/Reference Number
              </label>
              <input
                type="text"
                value={formData.caseReference}
                onChange={(e) => setFormData({ ...formData, caseReference: e.target.value })}
                placeholder="Optional"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}