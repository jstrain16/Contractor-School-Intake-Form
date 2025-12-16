import {
  AlertCircle, CheckCircle, ChevronDown, ChevronUp, FileText, Upload, Info, Calendar, DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface IncidentInformationProps {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}

interface Incident {
  id: string;
  type: 'priorDiscipline' | 'pendingCharges' | 'misdemeanor' | 'felony' | 'judgment' | 'bankruptcy';
  date: string;
  description: string;
  caseNumber: string;
  jurisdiction: string;
  resolution: string;
  documents: File[];
}

export function IncidentInformation({ formData, setFormData, onBack }: IncidentInformationProps) {
  const [expandedIncidents, setExpandedIncidents] = useState<string[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentIncident, setCurrentIncident] = useState<Partial<Incident>>({
    type: 'misdemeanor',
    date: '',
    description: '',
    caseNumber: '',
    jurisdiction: '',
    resolution: '',
    documents: []
  });

  // Determine which incident types need to be disclosed based on Phase 4 answers
  const requiredIncidentTypes = [];
  if (formData.priorDiscipline === 'yes') requiredIncidentTypes.push('priorDiscipline');
  if (formData.pendingCharges === 'yes') requiredIncidentTypes.push('pendingCharges');
  if (formData.misdemeanors === 'yes') requiredIncidentTypes.push('misdemeanor');
  if (formData.felonies === 'yes') requiredIncidentTypes.push('felony');
  if (formData.judgments === 'yes') requiredIncidentTypes.push('judgment');
  if (formData.bankruptcy === 'yes') requiredIncidentTypes.push('bankruptcy');

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      priorDiscipline: 'Prior License Discipline',
      pendingCharges: 'Pending Criminal Charges',
      misdemeanor: 'Misdemeanor Conviction',
      felony: 'Felony Conviction',
      judgment: 'Civil Judgment',
      bankruptcy: 'Bankruptcy Filing'
    };
    return labels[type] || type;
  };

  const toggleIncident = (id: string) => {
    setExpandedIncidents(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addIncident = () => {
    if (!currentIncident.type || !currentIncident.date || !currentIncident.description) {
      return;
    }
    const newIncident: Incident = {
      id: Date.now().toString(),
      type: currentIncident.type as Incident['type'],
      date: currentIncident.date || '',
      description: currentIncident.description || '',
      caseNumber: currentIncident.caseNumber || '',
      jurisdiction: currentIncident.jurisdiction || '',
      resolution: currentIncident.resolution || '',
      documents: currentIncident.documents || []
    };
    setIncidents([...incidents, newIncident]);
    setFormData({ ...formData, incidents: [...incidents, newIncident] });
    
    // Reset form
    setCurrentIncident({
      type: 'misdemeanor',
      date: '',
      description: '',
      caseNumber: '',
      jurisdiction: '',
      resolution: '',
      documents: []
    });
  };

  const removeIncident = (id: string) => {
    const updated = incidents.filter(i => i.id !== id);
    setIncidents(updated);
    setFormData({ ...formData, incidents: updated });
  };

  const handleFileUpload = (incidentId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const updated = incidents.map(incident => {
      if (incident.id === incidentId) {
        return { ...incident, documents: [...incident.documents, ...fileArray] };
      }
      return incident;
    });
    setIncidents(updated);
    setFormData({ ...formData, incidents: updated });
  };

  const handleCurrentFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setCurrentIncident({
      ...currentIncident,
      documents: [...(currentIncident.documents || []), ...fileArray]
    });
  };

  const allRequiredIncidentsDocumented = requiredIncidentTypes.every(type =>
    incidents.some(incident => incident.type === type)
  );

  const handleContinue = () => {
    if (allRequiredIncidentsDocumented) {
      setFormData({ ...formData, incidentInformationComplete: true });
      onBack(); // Return to main application form
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-1">Phase 4.1: Incident Information</h1>
              <p className="text-gray-600">
                Provide detailed information about disclosed incidents
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">
                  <strong>Full Disclosure Required</strong>
                </p>
                <p className="text-sm text-blue-700">
                  You answered "Yes" to one or more screening questions in Phase 4. 
                  DOPL requires complete documentation for each incident. Provide as much 
                  detail as possible to expedite your application review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Incident Types */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-gray-900 mb-4">Incidents Requiring Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredIncidentTypes.map(type => {
              const hasIncident = incidents.some(i => i.type === type);
              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${
                    hasIncident
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900">{getIncidentTypeLabel(type)}</p>
                    {hasIncident ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing Incidents */}
        {incidents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-gray-900 mb-4">Documented Incidents ({incidents.length})</h2>
            <div className="space-y-3">
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleIncident(incident.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900">{getIncidentTypeLabel(incident.type)}</p>
                        <p className="text-xs text-gray-600">{incident.date} • {incident.jurisdiction || 'No jurisdiction'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {incident.documents.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {incident.documents.length} doc{incident.documents.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeIncident(incident.id);
                        }}
                        className="text-red-600 hover:text-red-700 text-xs px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                      {expandedIncidents.includes(incident.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {expandedIncidents.includes(incident.id) && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Case Number</p>
                        <p className="text-sm text-gray-900">{incident.caseNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-900">{incident.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Resolution/Status</p>
                        <p className="text-sm text-gray-900">{incident.resolution || 'Not provided'}</p>
                      </div>
                      {incident.documents.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Documents</p>
                          <div className="space-y-1">
                            {incident.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                <FileText className="w-4 h-4" />
                                {doc.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Incident */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-gray-900 mb-4">Add Incident Details</h2>
          
          <div className="space-y-4">
            {/* Incident Type */}
            <div>
              <Label>Incident Type *</Label>
              <select
                value={currentIncident.type}
                onChange={(e) => setCurrentIncident({ ...currentIncident, type: e.target.value as Incident['type'] })}
                className="w-full mt-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {requiredIncidentTypes.map(type => (
                  <option key={type} value={type}>
                    {getIncidentTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <Label>Date of Incident *</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="date"
                  value={currentIncident.date}
                  onChange={(e) => setCurrentIncident({ ...currentIncident, date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Case Number */}
            <div>
              <Label>Case/File Number</Label>
              <Input
                type="text"
                placeholder="e.g., CR-2023-001234"
                value={currentIncident.caseNumber}
                onChange={(e) => setCurrentIncident({ ...currentIncident, caseNumber: e.target.value })}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">If applicable</p>
            </div>

            {/* Jurisdiction */}
            <div>
              <Label>Jurisdiction/Court</Label>
              <Input
                type="text"
                placeholder="e.g., Salt Lake County District Court"
                value={currentIncident.jurisdiction}
                onChange={(e) => setCurrentIncident({ ...currentIncident, jurisdiction: e.target.value })}
                className="mt-1.5"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Detailed Description *</Label>
              <Textarea
                placeholder="Provide a complete description of the incident, including circumstances, dates, and any relevant details..."
                value={currentIncident.description}
                onChange={(e) => setCurrentIncident({ ...currentIncident, description: e.target.value })}
                rows={4}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Be thorough - incomplete information may delay your application
              </p>
            </div>

            {/* Resolution */}
            <div>
              <Label>Resolution/Current Status *</Label>
              <Textarea
                placeholder="Describe how this was resolved, any penalties served, rehabilitation completed, current status, etc..."
                value={currentIncident.resolution}
                onChange={(e) => setCurrentIncident({ ...currentIncident, resolution: e.target.value })}
                rows={3}
                className="mt-1.5"
              />
            </div>

            {/* Supporting Documents */}
            <div>
              <Label>Supporting Documents</Label>
              <div className="mt-1.5 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Upload court records, disposition letters, bankruptcy discharge papers, etc.
                </p>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Choose Files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleCurrentFileUpload(e.target.files)}
                  />
                </label>
                {currentIncident.documents && currentIncident.documents.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {currentIncident.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {doc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={addIncident}
              disabled={!currentIncident.type || !currentIncident.date || !currentIncident.description}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Incident
            </button>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {allRequiredIncidentsDocumented ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-900 mb-1">
                    <strong>All Required Incidents Documented</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    You've provided information for all required incident types. You can now continue with your application.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-900 mb-1">
                    <strong>Additional Incidents Required</strong>
                  </p>
                  <p className="text-sm text-yellow-700">
                    You must document all incident types marked above before continuing.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Application
            </button>
            <button
              onClick={handleContinue}
              disabled={!allRequiredIncidentsDocumented}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Application
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
