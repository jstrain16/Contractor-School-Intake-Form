import { 
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight, FileText, 
  AlertTriangle, Gavel, DollarSign, FileX, Upload, Download,
  Clock, Save, Check, Eye, History, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Types
export type IncidentCategory = 'BACKGROUND' | 'DISCIPLINE' | 'FINANCIAL' | 'BANKRUPTCY';

export type BackgroundSubtype = 'PENDING_CASE' | 'MISDEMEANOR' | 'FELONY' | 'OTHER';
export type DisciplineSubtype = 'DENIAL' | 'SUSPENSION' | 'REVOCATION' | 'PROBATION' | 'OTHER';
export type FinancialSubtype = 'LIEN' | 'JUDGMENT' | 'CHILD_SUPPORT' | 'OTHER';
export type BankruptcySubtype = 'CH7' | 'CH11' | 'CH13' | 'UNKNOWN';

export type SlotCode = 
  | 'POLICE_REPORT'
  | 'COURT_RECORDS'
  | 'SUPERVISION_PROOF'
  | 'PAYMENT_PROOF'
  | 'RECORDS_UNAVAILABLE_LETTER'
  | 'DISCIPLINARY_ORDER'
  | 'REINSTATEMENT_LETTER'
  | 'LIEN_DOCUMENT'
  | 'JUDGMENT_DOCUMENT'
  | 'CHILD_SUPPORT_COMPLIANCE'
  | 'BANKRUPTCY_PETITION'
  | 'DISCHARGE_ORDER'
  | 'DEBT_SCHEDULE_SUMMARY'
  | 'SUPPORTING_DOCUMENT'
  | 'NARRATIVE_UPLOAD_OPTION';

export type NarrativeType = 'PERSONAL_STATEMENT' | 'CAUSE_AND_RECOVERY';

export interface Incident {
  id: string;
  applicationId: string;
  category: IncidentCategory;
  subtype: string;
  jurisdiction: string;
  agency: string;
  court: string;
  caseNumber: string;
  incidentDate: string;
  resolutionDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequiredDocumentSlot {
  id: string;
  incidentId: string;
  slotCode: SlotCode;
  slotLabel: string;
  required: boolean;
  status: 'missing' | 'uploaded' | 'waived';
  waiveReason?: string;
  helpText?: string;
}

export interface Narrative {
  id: string;
  incidentId: string;
  type: NarrativeType;
  content: string;
  autosaveVersion: number;
  updatedAt: string;
}

export interface UploadedFile {
  id: string;
  slotId: string;
  originalFilename: string;
  systemFilename: string;
  version: number;
  storagePath: string;
  mimeType: string;
  size: number;
  isActive: boolean;
  replacedByFileId?: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface SupportingMaterialsPlan {
  id: string;
  applicationId: string;
  status: 'draft' | 'in_progress' | 'complete';
  generatedAt: string;
  updatedAt: string;
  incidents: Incident[];
}

interface SupportingMaterialsWorkflowProps {
  applicationId: string;
  screeningAnswers: {
    priorDiscipline: string;
    pendingCharges: string;
    misdemeanors: string;
    felonies: string;
    judgments: string;
    bankruptcy: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

export function SupportingMaterialsWorkflow({
  applicationId,
  screeningAnswers,
  onComplete,
  onBack
}: SupportingMaterialsWorkflowProps) {
  const [view, setView] = useState<'hub' | 'incident'>('hub');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [plan, setPlan] = useState<SupportingMaterialsPlan | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [documentSlots, setDocumentSlots] = useState<Record<string, RequiredDocumentSlot[]>>({});
  const [narratives, setNarratives] = useState<Record<string, Narrative>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Generate incidents based on screening answers
  useEffect(() => {
    generateSupportingMaterialsPlan();
  }, []);

  const generateSupportingMaterialsPlan = () => {
    const newIncidents: Incident[] = [];
    let incidentCounter = 1;

    // BACKGROUND incidents
    if (screeningAnswers.pendingCharges === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'BACKGROUND', 'PENDING_CASE'));
    }
    if (screeningAnswers.misdemeanors === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'BACKGROUND', 'MISDEMEANOR'));
    }
    if (screeningAnswers.felonies === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'BACKGROUND', 'FELONY'));
    }

    // DISCIPLINE incidents
    if (screeningAnswers.priorDiscipline === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'DISCIPLINE', 'OTHER'));
    }

    // FINANCIAL incidents
    if (screeningAnswers.judgments === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'FINANCIAL', 'JUDGMENT'));
    }

    // BANKRUPTCY incidents
    if (screeningAnswers.bankruptcy === 'yes') {
      newIncidents.push(createIncident(incidentCounter++, 'BANKRUPTCY', 'UNKNOWN'));
    }

    setIncidents(newIncidents);

    // Generate document slots for each incident
    const slots: Record<string, RequiredDocumentSlot[]> = {};
    newIncidents.forEach(incident => {
      slots[incident.id] = generateDocumentSlots(incident);
    });
    setDocumentSlots(slots);

    // Initialize narratives
    const initialNarratives: Record<string, Narrative> = {};
    newIncidents.forEach(incident => {
      if (incident.category === 'BACKGROUND' || incident.category === 'DISCIPLINE') {
        initialNarratives[`${incident.id}_PERSONAL_STATEMENT`] = {
          id: `narr_${incident.id}_ps`,
          incidentId: incident.id,
          type: 'PERSONAL_STATEMENT',
          content: '',
          autosaveVersion: 0,
          updatedAt: new Date().toISOString()
        };
      }
      if (incident.category === 'BANKRUPTCY') {
        initialNarratives[`${incident.id}_CAUSE_AND_RECOVERY`] = {
          id: `narr_${incident.id}_cr`,
          incidentId: incident.id,
          type: 'CAUSE_AND_RECOVERY',
          content: '',
          autosaveVersion: 0,
          updatedAt: new Date().toISOString()
        };
      }
    });
    setNarratives(initialNarratives);

    // Create plan
    const newPlan: SupportingMaterialsPlan = {
      id: `plan_${applicationId}`,
      applicationId,
      status: newIncidents.length > 0 ? 'in_progress' : 'complete',
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      incidents: newIncidents
    };
    setPlan(newPlan);
  };

  const createIncident = (
    counter: number,
    category: IncidentCategory,
    subtype: string
  ): Incident => {
    return {
      id: `INC-${counter.toString().padStart(2, '0')}`,
      applicationId,
      category,
      subtype,
      jurisdiction: '',
      agency: '',
      court: '',
      caseNumber: '',
      incidentDate: '',
      resolutionDate: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const generateDocumentSlots = (incident: Incident): RequiredDocumentSlot[] => {
    const slots: RequiredDocumentSlot[] = [];
    let slotCounter = 1;

    const createSlot = (
      code: SlotCode,
      label: string,
      required: boolean,
      helpText?: string
    ): RequiredDocumentSlot => ({
      id: `${incident.id}_SLOT_${slotCounter++}`,
      incidentId: incident.id,
      slotCode: code,
      slotLabel: label,
      required,
      status: 'missing',
      helpText
    });

    switch (incident.category) {
      case 'BACKGROUND':
        slots.push(
          createSlot('POLICE_REPORT', 'Police Report', true, 'Official police report or incident documentation'),
          createSlot('COURT_RECORDS', 'Court Records', true, 'Complete court documentation including charges and disposition'),
          createSlot('SUPERVISION_PROOF', 'Proof of Supervision Completion', false, 'Required if probation or parole was ordered'),
          createSlot('PAYMENT_PROOF', 'Proof of Financial Obligations', false, 'Evidence of fines, restitution, or fees paid'),
          createSlot('RECORDS_UNAVAILABLE_LETTER', 'Records Unavailable Letter', false, 'Official letter if records cannot be obtained')
        );
        break;

      case 'DISCIPLINE':
        slots.push(
          createSlot('DISCIPLINARY_ORDER', 'Disciplinary Order', true, 'Official order or decision from licensing board'),
          createSlot('REINSTATEMENT_LETTER', 'Reinstatement Letter', false, 'Required if license was reinstated'),
          createSlot('SUPPORTING_DOCUMENT', 'Supporting Documentation', false, 'Additional relevant documents')
        );
        break;

      case 'FINANCIAL':
        if (incident.subtype === 'LIEN') {
          slots.push(
            createSlot('LIEN_DOCUMENT', 'Lien Documentation', true, 'Official lien filing or notice'),
            createSlot('PAYMENT_PROOF', 'Proof of Payment or Resolution', true, 'Evidence lien was paid or released')
          );
        } else if (incident.subtype === 'JUDGMENT') {
          slots.push(
            createSlot('JUDGMENT_DOCUMENT', 'Judgment Documentation', true, 'Court judgment or order'),
            createSlot('PAYMENT_PROOF', 'Proof of Payment or Resolution', true, 'Payment records or satisfaction of judgment')
          );
        } else if (incident.subtype === 'CHILD_SUPPORT') {
          slots.push(
            createSlot('CHILD_SUPPORT_COMPLIANCE', 'Child Support Compliance', true, 'Current compliance letter from agency'),
            createSlot('PAYMENT_PROOF', 'Payment Records', true, 'Recent payment history')
          );
        }
        break;

      case 'BANKRUPTCY':
        slots.push(
          createSlot('BANKRUPTCY_PETITION', 'Bankruptcy Petition', true, 'Original bankruptcy filing petition'),
          createSlot('DISCHARGE_ORDER', 'Discharge Order or Current Status', true, 'Discharge order if complete, or current status letter'),
          createSlot('DEBT_SCHEDULE_SUMMARY', 'Debt Schedule Summary', false, 'Summary of debts included in bankruptcy')
        );
        break;
    }

    return slots;
  };

  const getIncidentCategoryLabel = (category: IncidentCategory): string => {
    switch (category) {
      case 'BACKGROUND': return 'Background Review Items';
      case 'DISCIPLINE': return 'Prior Licensing Items';
      case 'FINANCIAL': return 'Financial Review Items';
      case 'BANKRUPTCY': return 'Bankruptcy Items';
    }
  };

  const getIncidentIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'BACKGROUND': return FileText;
      case 'DISCIPLINE': return Gavel;
      case 'FINANCIAL': return DollarSign;
      case 'BANKRUPTCY': return FileX;
    }
  };

  const getIncidentsByCategory = (category: IncidentCategory) => {
    return incidents.filter(inc => inc.category === category && inc.isActive);
  };

  const getIncidentCompletionStatus = (incidentId: string): {
    complete: boolean;
    total: number;
    completed: number;
  } => {
    const slots = documentSlots[incidentId] || [];
    const requiredSlots = slots.filter(s => s.required);
    const completedSlots = requiredSlots.filter(s => s.status === 'uploaded' || s.status === 'waived');
    
    // Check narratives
    let narrativeComplete = true;
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      if (incident.category === 'BACKGROUND' || incident.category === 'DISCIPLINE') {
        const narrative = narratives[`${incidentId}_PERSONAL_STATEMENT`];
        narrativeComplete = narrative && narrative.content.length > 100;
      }
      if (incident.category === 'BANKRUPTCY') {
        const narrative = narratives[`${incidentId}_CAUSE_AND_RECOVERY`];
        narrativeComplete = narrative && narrative.content.length > 100;
      }
    }
    
    const total = requiredSlots.length + (narrativeComplete !== undefined ? 1 : 0);
    const completed = completedSlots.length + (narrativeComplete ? 1 : 0);
    
    return {
      complete: completed === total && total > 0,
      total,
      completed
    };
  };

  const getCategoryCompletionStatus = (category: IncidentCategory) => {
    const categoryIncidents = getIncidentsByCategory(category);
    const total = categoryIncidents.length;
    const completed = categoryIncidents.filter(inc => 
      getIncidentCompletionStatus(inc.id).complete
    ).length;
    
    return { total, completed, allComplete: total > 0 && completed === total };
  };

  const updateIncident = (incidentId: string, updates: Partial<Incident>) => {
    setIncidents(prev =>
      prev.map(inc =>
        inc.id === incidentId
          ? { ...inc, ...updates, updatedAt: new Date().toISOString() }
          : inc
      )
    );
    triggerAutosave();
  };

  const updateNarrative = (key: string, content: string) => {
    setNarratives(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        content,
        autosaveVersion: prev[key].autosaveVersion + 1,
        updatedAt: new Date().toISOString()
      }
    }));
    triggerAutosave();
  };

  const handleFileUpload = (slotId: string, file: File) => {
    const slot = Object.values(documentSlots)
      .flat()
      .find(s => s.id === slotId);
    
    if (!slot) return;

    // Get current version for this slot
    const existingFiles = uploadedFiles[slotId] || [];
    const maxVersion = existingFiles.reduce((max, f) => Math.max(max, f.version), 0);
    const newVersion = maxVersion + 1;

    // Generate system filename
    const incident = incidents.find(i => i.id === slot.incidentId);
    const ext = file.name.split('.').pop();
    const systemFilename = `APP-${applicationId}_${slot.incidentId}_${slot.slotCode}_v${newVersion.toString().padStart(2, '0')}.${ext}`;

    // Create uploaded file record
    const newFile: UploadedFile = {
      id: `file_${Date.now()}`,
      slotId,
      originalFilename: file.name,
      systemFilename,
      version: newVersion,
      storagePath: `supporting-materials/user_${applicationId}/${applicationId}/${slot.incidentId}/${slot.slotCode}/v${newVersion}-${Date.now()}.${ext}`,
      mimeType: file.type,
      size: file.size,
      isActive: true,
      uploadedAt: new Date().toISOString(),
      uploadedByUserId: 'current_user_id'
    };

    // Mark previous version as inactive
    if (existingFiles.length > 0) {
      const previousActive = existingFiles.find(f => f.isActive);
      if (previousActive) {
        previousActive.isActive = false;
        previousActive.replacedByFileId = newFile.id;
      }
    }

    // Update uploaded files
    setUploadedFiles(prev => ({
      ...prev,
      [slotId]: [...(prev[slotId] || []), newFile]
    }));

    // Update slot status
    setDocumentSlots(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(incidentId => {
        updated[incidentId] = updated[incidentId].map(s =>
          s.id === slotId ? { ...s, status: 'uploaded' as const } : s
        );
      });
      return updated;
    });

    triggerAutosave();
  };

  const getActiveFileForSlot = (slotId: string): UploadedFile | null => {
    const files = uploadedFiles[slotId] || [];
    return files.find(f => f.isActive) || null;
  };

  const triggerAutosave = () => {
    setSaveStatus('saving');
    // Simulate autosave delay
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);
  };

  const canComplete = () => {
    return incidents.every(inc => getIncidentCompletionStatus(inc.id).complete);
  };

  if (!plan || incidents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">No Supporting Materials Required</h2>
          <p className="text-gray-600 mb-6">
            Based on your screening answers, no additional documentation is needed at this time.
          </p>
          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg w-full"
          >
            Continue to Next Phase
          </button>
        </div>
      </div>
    );
  }

  // Hub View
  if (view === 'hub') {
    const categories: IncidentCategory[] = ['BACKGROUND', 'DISCIPLINE', 'FINANCIAL', 'BANKRUPTCY'];
    const categoriesWithIncidents = categories.filter(cat => getIncidentsByCategory(cat).length > 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Application
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900 mb-2">Supporting Materials</h1>
                <p className="text-gray-600">
                  Complete all sections to satisfy disclosure requirements
                </p>
              </div>
              {saveStatus !== 'idle' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {saveStatus === 'saving' && (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">
                  <strong>Required Documentation</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Based on your screening responses, you need to provide supporting materials 
                  for {incidents.length} incident{incidents.length !== 1 ? 's' : ''}. All information 
                  is automatically saved as you work.
                </p>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="space-y-4">
            {categoriesWithIncidents.map(category => {
              const categoryIncidents = getIncidentsByCategory(category);
              const Icon = getIncidentIcon(category);
              const status = getCategoryCompletionStatus(category);
              const missingCount = status.total - status.completed;

              return (
                <div
                  key={category}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Category Header */}
                  <div className={`p-6 ${status.allComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          status.allComplete
                            ? 'bg-green-600'
                            : 'bg-gradient-to-br from-orange-400 to-orange-600'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 mb-1">
                            {getIncidentCategoryLabel(category)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={status.allComplete ? 'text-green-700' : 'text-gray-600'}>
                              {status.completed} of {status.total} complete
                            </span>
                            {missingCount > 0 && (
                              <span className="text-orange-600 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                {missingCount} incomplete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {status.allComplete && (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Incident List */}
                  <div className="divide-y divide-gray-200">
                    {categoryIncidents.map((incident, index) => {
                      const incidentStatus = getIncidentCompletionStatus(incident.id);
                      return (
                        <button
                          key={incident.id}
                          onClick={() => {
                            setSelectedIncidentId(incident.id);
                            setView('incident');
                          }}
                          className="w-full p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              incidentStatus.complete
                                ? 'bg-green-100'
                                : 'bg-orange-100'
                            }`}>
                              {incidentStatus.complete ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="text-gray-900 mb-1">
                                {category} Item #{index + 1}
                                {incident.caseNumber && ` - ${incident.caseNumber}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                {incidentStatus.completed} of {incidentStatus.total} items complete
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onComplete}
              disabled={!canComplete()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canComplete() ? 'Complete Supporting Materials' : 'Complete All Items to Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Incident Detail View
  const selectedIncident = incidents.find(inc => inc.id === selectedIncidentId);
  if (!selectedIncident) return null;

  const slots = documentSlots[selectedIncident.id] || [];
  const narrativeKey = selectedIncident.category === 'BANKRUPTCY'
    ? `${selectedIncident.id}_CAUSE_AND_RECOVERY`
    : `${selectedIncident.id}_PERSONAL_STATEMENT`;
  const narrative = narratives[narrativeKey];
  const narrativeType = selectedIncident.category === 'BANKRUPTCY'
    ? 'Cause and Recovery Explanation'
    : 'Personal Statement';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Supporting Materials Hub
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">
                {getIncidentCategoryLabel(selectedIncident.category)} - {selectedIncident.id}
              </h1>
              <p className="text-gray-600">
                Provide complete information and upload required documents
              </p>
            </div>
            {saveStatus !== 'idle' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {saveStatus === 'saving' && (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Incident Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Incident Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Jurisdiction / State</Label>
              <Input
                value={selectedIncident.jurisdiction}
                onChange={(e) =>
                  updateIncident(selectedIncident.id, { jurisdiction: e.target.value })
                }
                placeholder="e.g., Utah"
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Agency / Court</Label>
              <Input
                value={selectedIncident.court || selectedIncident.agency}
                onChange={(e) =>
                  updateIncident(selectedIncident.id, {
                    court: e.target.value,
                    agency: e.target.value
                  })
                }
                placeholder="e.g., Third District Court"
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Case Number</Label>
              <Input
                value={selectedIncident.caseNumber}
                onChange={(e) =>
                  updateIncident(selectedIncident.id, { caseNumber: e.target.value })
                }
                placeholder="e.g., 2023-CR-12345"
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Incident Date</Label>
              <Input
                type="date"
                value={selectedIncident.incidentDate}
                onChange={(e) =>
                  updateIncident(selectedIncident.id, { incidentDate: e.target.value })
                }
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Resolution Date (if applicable)</Label>
              <Input
                type="date"
                value={selectedIncident.resolutionDate}
                onChange={(e) =>
                  updateIncident(selectedIncident.id, { resolutionDate: e.target.value })
                }
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Type / Subtype</Label>
              <Select
                value={selectedIncident.subtype}
                onValueChange={(value: string) =>
                  updateIncident(selectedIncident.id, { subtype: value })
                }
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedIncident.category === 'BACKGROUND' && (
                    <>
                      <SelectItem value="PENDING_CASE">Pending Case</SelectItem>
                      <SelectItem value="MISDEMEANOR">Misdemeanor</SelectItem>
                      <SelectItem value="FELONY">Felony</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                  {selectedIncident.category === 'DISCIPLINE' && (
                    <>
                      <SelectItem value="DENIAL">License Denial</SelectItem>
                      <SelectItem value="SUSPENSION">Suspension</SelectItem>
                      <SelectItem value="REVOCATION">Revocation</SelectItem>
                      <SelectItem value="PROBATION">Probation</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                  {selectedIncident.category === 'FINANCIAL' && (
                    <>
                      <SelectItem value="LIEN">Lien</SelectItem>
                      <SelectItem value="JUDGMENT">Judgment</SelectItem>
                      <SelectItem value="CHILD_SUPPORT">Child Support</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                  {selectedIncident.category === 'BANKRUPTCY' && (
                    <>
                      <SelectItem value="CH7">Chapter 7</SelectItem>
                      <SelectItem value="CH11">Chapter 11</SelectItem>
                      <SelectItem value="CH13">Chapter 13</SelectItem>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        {narrative && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">{narrativeType}</h3>
              <span className="text-sm text-gray-600">
                {narrative.content.length} / 100 characters minimum
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {selectedIncident.category === 'BANKRUPTCY'
                ? 'Explain what caused the bankruptcy and how you have recovered financially since then.'
                : 'Provide a detailed explanation of the incident, your actions, and lessons learned.'}
            </p>
            <Textarea
              value={narrative.content}
              onChange={(e) => updateNarrative(narrativeKey, e.target.value)}
              placeholder="Begin typing your explanation..."
              className="bg-gray-50 min-h-[200px]"
            />
            {narrative.content.length >= 100 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Narrative requirement satisfied</span>
              </div>
            )}
          </div>
        )}

        {/* Document Slots */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Required Documentation</h3>
          <div className="space-y-4">
            {slots.map(slot => {
              const activeFile = getActiveFileForSlot(slot.id);
              const allFiles = uploadedFiles[slot.id] || [];

              return (
                <div
                  key={slot.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{slot.slotLabel}</span>
                        {slot.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {slot.status === 'uploaded' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Uploaded
                          </span>
                        )}
                      </div>
                      {slot.helpText && (
                        <p className="text-sm text-gray-600">{slot.helpText}</p>
                      )}
                    </div>
                  </div>

                  {activeFile ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {activeFile.systemFilename}
                            </div>
                            <div className="text-xs text-gray-500">
                              Version {activeFile.version} • Uploaded{' '}
                              {new Date(activeFile.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Download logic
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-3">No file uploaded</div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all text-sm">
                      <Upload className="w-4 h-4" />
                      <span>{activeFile ? 'Replace (New Version)' : 'Upload File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(slot.id, file);
                          }
                        }}
                      />
                    </label>

                    {allFiles.length > 1 && (
                      <button
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        onClick={() => {
                          // Show version history
                        }}
                      >
                        <History className="w-4 h-4" />
                        View History ({allFiles.length} versions)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-between">
          <button
            onClick={() => setView('hub')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Back to Hub
          </button>
          <button
            onClick={() => setView('hub')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
