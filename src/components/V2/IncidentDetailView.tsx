import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Upload, Download, History, X, FileText } from 'lucide-react';

interface DocumentVersion {
  version: string;
  filename: string;
  uploadedAt: string;
  size: string;
  isActive: boolean;
}

interface DocumentSlot {
  slotCode: string;
  label: string;
  required: boolean;
  status: 'missing' | 'uploaded' | 'waived';
  currentFile?: {
    filename: string;
    uploadedAt: string;
    size: string;
    version: string;
  };
  versions: DocumentVersion[];
  canWaive: boolean;
}

interface IncidentInfo {
  jurisdiction: string;
  agencyCourt: string;
  caseReference: string;
  incidentDate: string;
  resolutionDate: string;
  notes: string;
}

interface IncidentDetailViewProps {
  incidentId: string;
  incidentLabel: string;
  onBack: () => void;
}

export function IncidentDetailView({ incidentId, incidentLabel, onBack }: IncidentDetailViewProps) {
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingNarrative, setIsSavingNarrative] = useState(false);
  const [lastSavedInfo, setLastSavedInfo] = useState<Date | null>(null);
  const [lastSavedNarrative, setLastSavedNarrative] = useState<Date | null>(null);
  const [useNarrativeUpload, setUseNarrativeUpload] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState<DocumentSlot | null>(null);
  const [showWaiveModal, setShowWaiveModal] = useState<DocumentSlot | null>(null);

  const [incidentInfo, setIncidentInfo] = useState<IncidentInfo>({
    jurisdiction: 'Salt Lake County',
    agencyCourt: 'District Court',
    caseReference: '2019-CR-12345',
    incidentDate: '2019-06',
    resolutionDate: '2020-03',
    notes: '',
  });

  const [narrative, setNarrative] = useState('');
  const [narrativeFile, setNarrativeFile] = useState<File | null>(null);

  const [documentSlots, setDocumentSlots] = useState<DocumentSlot[]>([
    {
      slotCode: 'COURT_RECORDS',
      label: 'Court Records',
      required: true,
      status: 'uploaded',
      currentFile: {
        filename: 'APP-1042_INC-03_COURT_RECORDS_v02.pdf',
        uploadedAt: '2025-12-10 14:30',
        size: '2.4 MB',
        version: 'v02',
      },
      versions: [
        {
          version: 'v02',
          filename: 'APP-1042_INC-03_COURT_RECORDS_v02.pdf',
          uploadedAt: '2025-12-10 14:30',
          size: '2.4 MB',
          isActive: true,
        },
        {
          version: 'v01',
          filename: 'APP-1042_INC-03_COURT_RECORDS_v01.pdf',
          uploadedAt: '2025-12-08 10:15',
          size: '2.1 MB',
          isActive: false,
        },
      ],
      canWaive: true,
    },
    {
      slotCode: 'DISPOSITION_LETTER',
      label: 'Disposition Letter',
      required: true,
      status: 'missing',
      versions: [],
      canWaive: true,
    },
    {
      slotCode: 'CHARACTER_REFERENCE',
      label: 'Character Reference',
      required: false,
      status: 'missing',
      versions: [],
      canWaive: false,
    },
  ]);

  // Calculate overall status
  const requiredSlots = documentSlots.filter(slot => slot.required);
  const completedRequired = requiredSlots.filter(
    slot => slot.status === 'uploaded' || slot.status === 'waived'
  ).length;
  const hasNarrative = narrative.trim().length > 0 || narrativeFile !== null;
  
  let overallStatus: 'missing' | 'in-progress' | 'complete' = 'missing';
  if (completedRequired === requiredSlots.length && hasNarrative) {
    overallStatus = 'complete';
  } else if (completedRequired > 0 || hasNarrative) {
    overallStatus = 'in-progress';
  }

  const saveIncidentInfo = async (data: IncidentInfo) => {
    setIsSavingInfo(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSavingInfo(false);
    setLastSavedInfo(new Date());
  };

  const saveNarrative = async (text: string) => {
    setIsSavingNarrative(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSavingNarrative(false);
    setLastSavedNarrative(new Date());
  };

  const handleInfoChange = (field: keyof IncidentInfo, value: string) => {
    const updatedInfo = { ...incidentInfo, [field]: value };
    setIncidentInfo(updatedInfo);
    saveIncidentInfo(updatedInfo);
  };

  const handleNarrativeChange = (text: string) => {
    setNarrative(text);
    saveNarrative(text);
  };

  const handleFileUpload = (slot: DocumentSlot, file: File) => {
    // Simulate file upload
    const nextVersion = slot.versions.length + 1;
    const versionString = `v${String(nextVersion).padStart(2, '0')}`;
    const filename = `APP-1042_${incidentId}_${slot.slotCode}_${versionString}.pdf`;

    const newVersion: DocumentVersion = {
      version: versionString,
      filename,
      uploadedAt: new Date().toLocaleString(),
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      isActive: true,
    };

    setDocumentSlots(slots =>
      slots.map(s => {
        if (s.slotCode === slot.slotCode) {
          // Mark all previous versions as inactive
          const updatedVersions = s.versions.map(v => ({ ...v, isActive: false }));
          return {
            ...s,
            status: 'uploaded' as const,
            currentFile: {
              filename: newVersion.filename,
              uploadedAt: newVersion.uploadedAt,
              size: newVersion.size,
              version: newVersion.version,
            },
            versions: [...updatedVersions, newVersion],
          };
        }
        return s;
      })
    );
  };

  const handleWaiveDocument = (slot: DocumentSlot, reason: string) => {
    setDocumentSlots(slots =>
      slots.map(s => {
        if (s.slotCode === slot.slotCode) {
          return { ...s, status: 'waived' as const };
        }
        return s;
      })
    );
    setShowWaiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
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
                <div className="flex items-center gap-3">
                  <h1 className="text-gray-900">{incidentId}</h1>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {incidentLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Background Item</p>
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
              {overallStatus === 'missing' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Missing
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Incident Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900">Incident Information</h2>
                {isSavingInfo ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : lastSavedInfo ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Saved
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Jurisdiction</label>
                <input
                  type="text"
                  value={incidentInfo.jurisdiction}
                  onChange={(e) => handleInfoChange('jurisdiction', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Agency / Court</label>
                <input
                  type="text"
                  value={incidentInfo.agencyCourt}
                  onChange={(e) => handleInfoChange('agencyCourt', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Case/Reference #</label>
                <input
                  type="text"
                  value={incidentInfo.caseReference}
                  onChange={(e) => handleInfoChange('caseReference', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Incident Date</label>
                <input
                  type="month"
                  value={incidentInfo.incidentDate}
                  onChange={(e) => handleInfoChange('incidentDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Resolution Date</label>
                <input
                  type="month"
                  value={incidentInfo.resolutionDate}
                  onChange={(e) => handleInfoChange('resolutionDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Notes</label>
                <textarea
                  value={incidentInfo.notes}
                  onChange={(e) => handleInfoChange('notes', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional internal notes"
                />
              </div>
            </div>
          </div>

          {/* Narrative Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-gray-900">Written Explanation</h2>
                  {hasNarrative && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                {isSavingNarrative ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : lastSavedNarrative ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Saved
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Briefly explain what happened and the outcome.
              </p>
              
              {/* Toggle for upload option */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNarrativeUpload}
                  onChange={(e) => setUseNarrativeUpload(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Upload an explanation instead</span>
              </label>

              {!useNarrativeUpload ? (
                <textarea
                  value={narrative}
                  onChange={(e) => handleNarrativeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={6}
                  placeholder="Type your explanation here..."
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="narrative-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNarrativeFile(e.target.files[0]);
                      }
                    }}
                  />
                  {narrativeFile ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900">{narrativeFile.name}</span>
                      </div>
                      <button
                        onClick={() => setNarrativeFile(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="narrative-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-700 mb-1">Click to upload explanation document</p>
                      <p className="text-xs text-gray-500">PDF, DOC, or DOCX</p>
                    </label>
                  )}
                </div>
              )}

              {/* Completion indicator */}
              {hasNarrative && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {narrative.trim().length > 0 ? 'Met (text saved)' : 'Met (uploaded file)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Required Documents Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Required Documents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {documentSlots.map((slot) => (
                <DocumentSlotRow
                  key={slot.slotCode}
                  slot={slot}
                  incidentId={incidentId}
                  onUpload={(file) => handleFileUpload(slot, file)}
                  onViewHistory={() => setShowVersionHistory(slot)}
                  onWaive={() => setShowWaiveModal(slot)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryModal
          slot={showVersionHistory}
          onClose={() => setShowVersionHistory(null)}
        />
      )}

      {/* Waive Document Modal */}
      {showWaiveModal && (
        <WaiveDocumentModal
          slot={showWaiveModal}
          onClose={() => setShowWaiveModal(null)}
          onWaive={(reason) => handleWaiveDocument(showWaiveModal, reason)}
        />
      )}
    </div>
  );
}

// Document Slot Row Component
interface DocumentSlotRowProps {
  slot: DocumentSlot;
  incidentId: string;
  onUpload: (file: File) => void;
  onViewHistory: () => void;
  onWaive: () => void;
}

function DocumentSlotRow({ slot, incidentId, onUpload, onViewHistory, onWaive }: DocumentSlotRowProps) {
  const fileInputId = `file-${slot.slotCode}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-gray-900">{slot.label}</h3>
            <span className={`px-2.5 py-0.5 rounded text-xs ${
              slot.required 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {slot.required ? 'Required' : 'Optional'}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs ${
              slot.status === 'uploaded' 
                ? 'bg-green-100 text-green-700'
                : slot.status === 'waived'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {slot.status === 'uploaded' && 'Uploaded'}
              {slot.status === 'waived' && 'Waived'}
              {slot.status === 'missing' && 'Missing'}
            </span>
          </div>

          {/* Current File Display */}
          {slot.currentFile && (
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-900">{slot.currentFile.filename}</p>
                    <p className="text-xs text-gray-500">
                      {slot.currentFile.uploadedAt} • {slot.currentFile.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  {slot.versions.length > 1 && (
                    <button
                      onClick={onViewHistory}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm flex items-center gap-1"
                    >
                      <History className="w-4 h-4" />
                      History ({slot.versions.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {slot.status !== 'waived' && (
          <>
            <input
              type="file"
              id={fileInputId}
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor={fileInputId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors cursor-pointer text-sm border border-orange-200"
            >
              <Upload className="w-4 h-4" />
              {slot.status === 'uploaded' ? 'Replace' : 'Upload'}
            </label>
          </>
        )}
        
        {slot.canWaive && slot.status !== 'waived' && (
          <button
            onClick={onWaive}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          >
            Mark as Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

// Version History Modal
interface VersionHistoryModalProps {
  slot: DocumentSlot;
  onClose: () => void;
}

function VersionHistoryModal({ slot, onClose }: VersionHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white">Version History</h2>
            <p className="text-sm text-blue-100 mt-1">{slot.label}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-3">
            {slot.versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No versions available
              </div>
            ) : (
              slot.versions.map((version) => (
                <div
                  key={version.version}
                  className={`p-4 rounded-lg border-2 ${
                    version.isActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900">{version.filename}</p>
                          {version.isActive && (
                            <span className="px-2 py-0.5 bg-green-600 text-white rounded text-xs">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {version.uploadedAt} • {version.size}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Waive Document Modal
interface WaiveDocumentModalProps {
  slot: DocumentSlot;
  onClose: () => void;
  onWaive: (reason: string) => void;
}

function WaiveDocumentModal({ slot, onClose, onWaive }: WaiveDocumentModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onWaive(reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <h2 className="text-white">Mark Document as Unavailable</h2>
          <p className="text-sm text-orange-100 mt-1">{slot.label}</p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-orange-900">
                You'll need to upload a letter explaining why this document is unavailable.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Reason <span className="text-orange-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select a reason...</option>
              <option value="records-unavailable">Records Unavailable</option>
              <option value="records-destroyed">Records Destroyed</option>
              <option value="agency-unresponsive">Agency Unresponsive</option>
              <option value="other">Other</option>
            </select>
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
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
