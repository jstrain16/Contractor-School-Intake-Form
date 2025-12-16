import React from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface DocumentFile {
  id: number;
  originalFilename: string;
  systemFilename: string;
  version: number;
  size: number;
  uploadedAt: string;
  isActive: boolean;
}

interface DocumentSlot {
  slotCode: string;
  label: string;
  required: boolean;
  files: DocumentFile[];
  status?: string;
}

interface IncidentDocumentSlotsProps {
  incident: any;
  appShortId: string;
  onUploadFile: (incidentId: string, slotCode: string, files: FileList) => void;
  onRemoveFile: (incidentId: string, slotCode: string, fileId: number) => void;
  onUpdateNarrative: (incidentId: string, narrative: string) => void;
}

export function IncidentDocumentSlots({
  incident,
  appShortId,
  onUploadFile,
  onRemoveFile,
  onUpdateNarrative
}: IncidentDocumentSlotsProps) {
  const getActiveFile = (slot: DocumentSlot) => {
    return slot.files.find(f => f.isActive);
  };

  const getFileVersionHistory = (slot: DocumentSlot) => {
    return slot.files.filter(f => !f.isActive).sort((a, b) => b.version - a.version);
  };

  // Determine if narrative is required based on category
  const narrativeRequired = ['BACKGROUND', 'DISCIPLINE', 'BANKRUPTCY'].includes(incident.category);

  return (
    <div className="space-y-6">
      {/* Narrative Section */}
      {narrativeRequired && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-gray-900">
              {incident.category === 'BANKRUPTCY' ? 'Cause & Recovery Explanation' : 'Personal Written Statement'}
            </Label>
            <div className="flex items-center gap-2">
              {incident.narrativeSaveStatus === 'saving' && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Saving...
                </span>
              )}
              {incident.narrativeSaveStatus === 'saved' && incident.narrative && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                Required
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            {incident.category === 'BANKRUPTCY'
              ? 'Explain the circumstances that led to bankruptcy and demonstrate your financial recovery and stability.'
              : 'Provide a detailed explanation of the incident, your role, and any rehabilitation or lessons learned.'}
          </p>
          <Textarea
            value={incident.narrative || ''}
            onChange={(e) => onUpdateNarrative(incident.id, e.target.value)}
            placeholder="Type your statement here... (minimum 200 characters recommended)"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            {incident.narrative?.length || 0} characters
          </p>
        </div>
      )}

      {/* Document Slots */}
      <div className="space-y-4">
        <Label className="text-gray-900">Required Supporting Documents</Label>
        {incident.documentSlots && incident.documentSlots.map((slot: DocumentSlot) => {
          const activeFile = getActiveFile(slot);
          const versionHistory = getFileVersionHistory(slot);
          const hasFiles = activeFile !== undefined;

          return (
            <div
              key={slot.slotCode}
              className={`border rounded-lg p-4 ${
                hasFiles ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-sm text-gray-900">{slot.label}</Label>
                    {slot.required && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                        Required
                      </span>
                    )}
                    {hasFiles && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {slot.slotCode === 'POLICE_REPORT' && 'Upload the official police report or incident report'}
                    {slot.slotCode === 'COURT_RECORDS' && 'Upload court disposition, judgment, or certified records'}
                    {slot.slotCode === 'SUPERVISION_PROOF' && 'Upload proof of probation/parole completion'}
                    {slot.slotCode === 'PAYMENT_PROOF' && 'Upload receipts or payment confirmation'}
                    {slot.slotCode === 'RECORDS_UNAVAILABLE_LETTER' && 'Upload letter from agency stating records unavailable'}
                    {slot.slotCode === 'DISCIPLINARY_ORDER' && 'Upload the official disciplinary order or notice'}
                    {slot.slotCode === 'REINSTATEMENT_LETTER' && 'Upload proof of license reinstatement'}
                    {slot.slotCode === 'LIEN_DOCUMENT' && 'Upload lien documentation or notice'}
                    {slot.slotCode === 'JUDGMENT_DOCUMENT' && 'Upload civil judgment documentation'}
                    {slot.slotCode === 'CHILD_SUPPORT_COMPLIANCE' && 'Upload compliance letter from state agency'}
                    {slot.slotCode === 'BANKRUPTCY_PETITION' && 'Upload the bankruptcy petition filing'}
                    {slot.slotCode === 'DISCHARGE_ORDER' && 'Upload discharge order or current status document'}
                    {slot.slotCode === 'DEBT_SCHEDULE_SUMMARY' && 'Upload debt schedule from bankruptcy filing'}
                    {slot.slotCode === 'PERSONAL_STATEMENT' && 'Upload your written statement if you prefer not to type'}
                    {slot.slotCode === 'CAUSE_AND_RECOVERY' && 'Upload your cause & recovery explanation document'}
                    {slot.slotCode === 'CURRENT_STATUS' && 'Upload current case status or court docket'}
                  </p>
                </div>
              </div>

              {/* Current Active File */}
              {activeFile && (
                <div className="mb-3 p-3 bg-white border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate" title={activeFile.systemFilename}>
                          {activeFile.systemFilename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(activeFile.size / 1024).toFixed(1)} KB • v{String(activeFile.version).padStart(2, '0')} • {new Date(activeFile.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile(incident.id, slot.slotCode, activeFile.id)}
                      className="text-red-600 hover:text-red-700 p-1 ml-2 flex-shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Version History */}
              {versionHistory.length > 0 && (
                <details className="mb-3">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 mb-2">
                    View previous versions ({versionHistory.length})
                  </summary>
                  <div className="space-y-1 pl-4">
                    {versionHistory.map((file) => (
                      <div key={file.id} className="text-xs text-gray-500 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span className="truncate flex-1">{file.systemFilename}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Upload/Replace Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {hasFiles ? 'Replace with new version' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  PDF, DOC, JPG, PNG (max 10MB per file)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  id={`upload-${incident.id}-${slot.slotCode}`}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onUploadFile(incident.id, slot.slotCode, e.target.files);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById(`upload-${incident.id}-${slot.slotCode}`)?.click();
                  }}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {hasFiles ? 'Replace File (creates v' + String(activeFile.version + 1).padStart(2, '0') + ')' : 'Select File'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Check */}
      {incident.documentSlots && (
        <div className="mt-4">
          {incident.documentSlots.every((slot: DocumentSlot) => 
            !slot.required || slot.files.some(f => f.isActive)
          ) && (!narrativeRequired || (incident.narrative && incident.narrative.length > 0)) ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-900">
                All required documents and information completed for this incident
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-medium mb-1">Missing Required Items:</p>
                <ul className="list-disc list-inside space-y-1 text-orange-700">
                  {narrativeRequired && (!incident.narrative || incident.narrative.length === 0) && (
                    <li>Personal written statement required</li>
                  )}
                  {incident.documentSlots.filter((slot: DocumentSlot) => 
                    slot.required && !slot.files.some(f => f.isActive)
                  ).map((slot: DocumentSlot) => (
                    <li key={slot.slotCode}>{slot.label}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
