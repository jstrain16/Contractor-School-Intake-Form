import { useState, useEffect } from 'react';
import { CheckCircle, FileX, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, ArrowRight, Circle, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IncidentDocumentSlots } from '../IncidentDocumentSlots';
import { PhaseComponentProps } from '../types/ApplicationTypes';

// Generate document slots based on incident category and subtype
const generateDocumentSlots = (category: string, subtype: string) => {
  const slots: any[] = [];
  
  if (category === 'BACKGROUND') {
    slots.push(
      { slotCode: 'PERSONAL_STATEMENT', label: 'Personal Written Statement', required: true, files: [] },
      { slotCode: 'POLICE_REPORT', label: 'Police Report', required: true, files: [] },
      { slotCode: 'COURT_RECORDS', label: 'Court Records/Disposition', required: true, files: [] }
    );
    if (subtype === 'PENDING_CASE') {
      slots.push({ slotCode: 'CURRENT_STATUS', label: 'Current Case Status', required: true, files: [] });
    }
    if (['PROBATION', 'PAROLE'].includes(subtype)) {
      slots.push({ slotCode: 'SUPERVISION_PROOF', label: 'Proof of Supervision Completion', required: true, files: [] });
    }
    slots.push(
      { slotCode: 'PAYMENT_PROOF', label: 'Proof of Payment (fines/restitution)', required: false, files: [] },
      { slotCode: 'RECORDS_UNAVAILABLE_LETTER', label: 'Records Unavailable Letter (if applicable)', required: false, files: [] }
    );
  } else if (category === 'DISCIPLINE') {
    slots.push(
      { slotCode: 'DISCIPLINARY_ORDER', label: 'Disciplinary Order/Letter', required: true, files: [] },
      { slotCode: 'PERSONAL_STATEMENT', label: 'Personal Written Statement', required: true, files: [] }
    );
    if (subtype === 'REINSTATEMENT') {
      slots.push({ slotCode: 'REINSTATEMENT_LETTER', label: 'Reinstatement Documentation', required: true, files: [] });
    }
  } else if (category === 'FINANCIAL') {
    if (subtype === 'LIEN') {
      slots.push(
        { slotCode: 'LIEN_DOCUMENT', label: 'Lien Documentation', required: true, files: [] },
        { slotCode: 'PAYMENT_PROOF', label: 'Proof of Payment/Resolution', required: true, files: [] }
      );
    } else if (subtype === 'JUDGMENT') {
      slots.push(
        { slotCode: 'JUDGMENT_DOCUMENT', label: 'Judgment Documentation', required: true, files: [] },
        { slotCode: 'PAYMENT_PROOF', label: 'Proof of Payment/Settlement', required: true, files: [] }
      );
    } else if (subtype === 'CHILD_SUPPORT') {
      slots.push(
        { slotCode: 'CHILD_SUPPORT_COMPLIANCE', label: 'Child Support Compliance Letter', required: true, files: [] },
        { slotCode: 'PAYMENT_PROOF', label: 'Proof of Current Payments', required: true, files: [] }
      );
    }
  } else if (category === 'BANKRUPTCY') {
    slots.push(
      { slotCode: 'BANKRUPTCY_PETITION', label: 'Bankruptcy Petition', required: true, files: [] },
      { slotCode: 'DISCHARGE_ORDER', label: 'Discharge Order or Current Status', required: true, files: [] },
      { slotCode: 'DEBT_SCHEDULE_SUMMARY', label: 'Debt Schedule Summary', required: false, files: [] },
      { slotCode: 'CAUSE_AND_RECOVERY', label: 'Cause & Recovery Narrative', required: true, files: [] }
    );
  }
  
  return slots;
};

export function Phase5({ 
  formData, 
  setFormData, 
  onComplete, 
  expandedSections, 
  completedPhases, 
  toggleSection,
  onBack
}: PhaseComponentProps & { onBack?: () => void }) {
  const phaseId = 5;
  const [selectKey, setSelectKey] = useState(0);
  const [expandedIncidentIds, setExpandedIncidentIds] = useState<string[]>([]);

  // Automatically create incidents based on screening answers
  useEffect(() => {
    let newIncidents = [...formData.incidents];
    let added = false;
    const newIds: string[] = [];

    const hasIncident = (cat: string, sub?: string) => 
      newIncidents.some(i => i.category === cat && (!sub || i.subtype === sub));

    const createIncident = (type: string, category: string, subtype: string, label: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const incident = {
        id,
        customName: label,
        type,
        category,
        subtype,
        date: '',
        caseNumber: '',
        jurisdiction: '',
        description: '',
        resolution: '',
        outcome: '', // Ensure 'outcome' property is included
        documentSlots: generateDocumentSlots(category, subtype),
        narrativeSaveStatus: 'saved'
      };
      newIncidents.unshift(incident);
      newIds.push(id);
      added = true;
    };

    // 1. Prior Discipline
    if (formData.priorDiscipline === 'yes' && !hasIncident('DISCIPLINE')) {
      createIncident('priorDiscipline', 'DISCIPLINE', 'SUSPENSION', 'Prior License Discipline');
    }

    // 2. Pending Charges
    if (formData.pendingCharges === 'yes' && !hasIncident('BACKGROUND', 'PENDING_CASE')) {
      createIncident('pendingCharges', 'BACKGROUND', 'PENDING_CASE', 'Pending Criminal Charge');
    }

    // 3. Misdemeanors
    if (formData.misdemeanors === 'yes' && !hasIncident('BACKGROUND', 'MISDEMEANOR')) {
      createIncident('misdemeanor', 'BACKGROUND', 'MISDEMEANOR', 'Misdemeanor Conviction');
    }

    // 4. Felonies
    if (formData.felonies === 'yes' && !hasIncident('BACKGROUND', 'FELONY')) {
      createIncident('felony', 'BACKGROUND', 'FELONY', 'Felony Conviction');
    }

    // 5. Financial (Judgments/Liens)
    if (formData.judgments === 'yes' && !hasIncident('FINANCIAL')) {
      createIncident('judgment', 'FINANCIAL', 'JUDGMENT', 'Financial Judgment/Lien');
    }

    // 6. Bankruptcy
    if (formData.bankruptcy === 'yes' && !hasIncident('BANKRUPTCY')) {
      createIncident('bankruptcy', 'BANKRUPTCY', 'CH7', 'Bankruptcy');
    }

    if (added) {
      setFormData(prev => ({
        ...prev,
        incidents: newIncidents
      }));
      setExpandedIncidentIds(prev => [...newIds, ...prev]);
    }
  }, [
    formData.priorDiscipline,
    formData.pendingCharges,
    formData.misdemeanors,
    formData.felonies,
    formData.judgments,
    formData.bankruptcy,
    // We include incidents.length to detect if user deleted one, but we might want to respect deletion?
    // If we want to strictly ENFORCE presence, we include it. 
    // If we only want to add on initial load, we might omit. 
    // User requested "automatic creation", usually implies if it's missing it should be there.
    // If user deletes it, it might pop back. This might be annoying.
    // However, if the screening says "Yes", they MUST document it. 
    // So if they delete it, they are in an invalid state anyway. 
    // It's better to recreate it to prompt them.
    formData.incidents.length 
  ]);

  // Helper function to add new incident
  const addIncident = (incident: any) => {
    const newId = Date.now().toString();
    setFormData({
      ...formData,
      incidents: [{ 
        ...incident, 
        id: newId,
        customName: incident.customName || '',
        category: incident.category || 'BACKGROUND',
        subtype: incident.subtype || '',
        narrative: '',
        documentSlots: generateDocumentSlots(incident.category || 'BACKGROUND', incident.subtype || ''),
        narrativeSaveStatus: 'saved'
      }, ...formData.incidents]
    });
    // Automatically expand the new incident
    setExpandedIncidentIds(prev => [newId, ...prev]);
  };

  // Helper function to remove incident
  const removeIncident = (incidentId: string) => {
    setFormData({
      ...formData,
      incidents: formData.incidents.filter((inc: any) => inc.id !== incidentId)
    });
  };

  const toggleIncident = (incidentId: string) => {
    setExpandedIncidentIds(prev => 
      prev.includes(incidentId) 
        ? prev.filter(id => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  // Upload file to a specific document slot
  const uploadFileToSlot = (incidentId: string, slotCode: string, files: FileList) => {
    const incident = formData.incidents.find((inc: any) => inc.id === incidentId);
    if (!incident) return;

    const slot = incident.documentSlots?.find((s: any) => s.slotCode === slotCode);
    if (!slot) return;

    const currentVersion = slot.files.length > 0 
      ? Math.max(...slot.files.map((f: any) => f.version)) 
      : 0;

    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      originalFilename: file.name,
      systemFilename: `APP-${formData.clerkUserId.slice(-4)}_INC-${incidentId.slice(-4)}_${slotCode}_v${String(currentVersion + index + 1).padStart(2, '0')}.${file.name.split('.').pop()}`,
      version: currentVersion + index + 1,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      isActive: true
    }));

    const updatedIncidents = formData.incidents.map((inc: any) => {
      if (inc.id === incidentId) {
        const updatedSlots = inc.documentSlots.map((s: any) => {
          if (s.slotCode === slotCode) {
            // Mark previous files as inactive
            const inactiveFiles = s.files.map((f: any) => ({ ...f, isActive: false }));
            return {
              ...s,
              files: [...inactiveFiles, ...newFiles],
              status: 'uploaded'
            };
          }
          return s;
        });
        return { ...inc, documentSlots: updatedSlots };
      }
      return inc;
    });

    setFormData({ ...formData, incidents: updatedIncidents });
  };

  // Remove file from slot
  const removeFileFromSlot = (incidentId: string, slotCode: string, fileId: number) => {
    const updatedIncidents = formData.incidents.map((inc: any) => {
      if (inc.id === incidentId) {
        const updatedSlots = inc.documentSlots.map((s: any) => {
          if (s.slotCode === slotCode) {
            return {
              ...s,
              files: s.files.filter((f: any) => f.id !== fileId),
              status: s.files.filter((f: any) => f.id !== fileId).length === 0 ? 'missing' : 'uploaded'
            };
          }
          return s;
        });
        return { ...inc, documentSlots: updatedSlots };
      }
      return inc;
    });

    setFormData({ ...formData, incidents: updatedIncidents });
  };

  // Update incident narrative with autosave
  const updateIncidentNarrative = (incidentId: string, narrative: string) => {
    const updatedIncidents = formData.incidents.map((inc: any) => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          narrative,
          narrativeSaveStatus: 'saving'
        };
      }
      return inc;
    });

    setFormData({ ...formData, incidents: updatedIncidents });

    // Simulate autosave with a timeout
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        incidents: prev.incidents.map((inc: any) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              narrativeSaveStatus: 'saved'
            };
          }
          return inc;
        })
      }));
    }, 1000);
  };

  // Check if all required incidents are documented
  const getRequiredIncidentTypes = () => {
    const types: string[] = [];
    if (formData.priorDiscipline === 'yes') types.push('priorDiscipline');
    if (formData.pendingCharges === 'yes') types.push('pendingCharges');
    if (formData.misdemeanors === 'yes') types.push('misdemeanor');
    if (formData.felonies === 'yes') types.push('felony');
    if (formData.judgments === 'yes') types.push('judgment');
    if (formData.bankruptcy === 'yes') types.push('bankruptcy');
    return types;
  };

  const getDocumentedIncidentTypes = () => {
    return [...new Set(formData.incidents.map((inc: any) => inc.type))];
  };

  const allIncidentsDocumented = () => {
    const required = getRequiredIncidentTypes();
    const documented = getDocumentedIncidentTypes();
    
    // Check that all required types are documented
    const allTypesDocumented = required.every(type => documented.includes(type));
    
    // Check that each incident has all required slots filled
    const allIncidentsComplete = formData.incidents.every((incident: any) => {
      // Check if using new slot-based system
      if (incident.documentSlots) {
        // Check all required slots have at least one active file
        const allRequiredSlotsFilled = incident.documentSlots.every((slot: any) => 
          !slot.required || slot.files.some((f: any) => f.isActive)
        );
        
        // Check narrative if required for this category
        const narrativeRequired = ['BACKGROUND', 'DISCIPLINE', 'BANKRUPTCY'].includes(incident.category);
        const narrativeComplete = !narrativeRequired || (incident.narrative && incident.narrative.length > 0);
        
        return allRequiredSlotsFilled && narrativeComplete;
      } else {
        // Fallback to old system for backwards compatibility
        return incident.documents && incident.documents.length > 0;
      }
    });
    
    return allTypesDocumented && allIncidentsComplete;
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleSection(phaseId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                completedPhases.includes(phaseId) || formData.incidentInformationComplete
                  ? 'bg-green-600'
                  : 'bg-orange-600'
              }`}
            >
              {completedPhases.includes(phaseId) || formData.incidentInformationComplete ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <FileX className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">
                Phase 5: Incident Information
                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  REQUIRED
                </span>
              </h3>
              <p className="text-sm text-gray-600">
                Document each incident identified in screening
              </p>
            </div>
          </div>
          {expandedSections.includes(phaseId) ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      {expandedSections.includes(phaseId) && (
        <div className="p-6 border-t border-orange-200">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-900 mb-1">
                  <strong>Incident Documentation Required</strong>
                </p>
                <p className="text-sm text-orange-700">
                  You must provide detailed information for each incident type you answered "yes" to in Phase 4.
                </p>
              </div>
            </div>
          </div>

          {/* Incident Type Checklist */}
          <div className="mb-6">
            <Label className="text-gray-900 mb-3 block">Required Incident Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getRequiredIncidentTypes().map((type) => {
                const isDocumented = getDocumentedIncidentTypes().includes(type);
                const typeLabels: Record<string, string> = {
                  priorDiscipline: 'Prior License Discipline',
                  pendingCharges: 'Pending Charges',
                  misdemeanor: 'Misdemeanor',
                  felony: 'Felony',
                  judgment: 'Judgment',
                  bankruptcy: 'Bankruptcy'
                };
                return (
                  <div
                    key={type}
                    className={`p-3 rounded-lg border ${
                      isDocumented
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                }`}
              >
                    <div className="flex items-center gap-2">
                      {isDocumented ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{typeLabels[type]}</span>
                    </div>
                  </div>
                );
              })}
                </div>
              </div>

          {/* Add New Incident Form */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h4 className="text-gray-900 mb-2">Add New Incident</h4>
            <p className="text-sm text-gray-600 mb-4">
              Select a category below to add a new incident record to your list. You can then fill in the details.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Incident Category *</Label>
                <Select
                  key={selectKey}
                  onValueChange={(categorySubtype: string) => {
                    const [category, subtype] = categorySubtype.split('|');
                    // Map old type to category for backwards compatibility
                    let mappedType = '';
                    if (category === 'BACKGROUND') {
                      if (subtype === 'PENDING_CASE') mappedType = 'pendingCharges';
                      else if (subtype === 'MISDEMEANOR') mappedType = 'misdemeanor';
                      else if (subtype === 'FELONY') mappedType = 'felony';
                    } else if (category === 'DISCIPLINE') {
                      mappedType = 'priorDiscipline';
                    } else if (category === 'FINANCIAL') {
                      mappedType = 'judgment';
                    } else if (category === 'BANKRUPTCY') {
                      mappedType = 'bankruptcy';
                    }
                    
                    const newIncident = {
                      type: mappedType,
                      category,
                      subtype,
                      date: '',
                      caseNumber: '',
                      jurisdiction: '',
                      description: '',
                      resolution: '',
                      outcome: '',
                      documentSlots: generateDocumentSlots(category, subtype),
                      narrativeSaveStatus: 'saved'
                    };
                    addIncident(newIncident);
                    setSelectKey(prev => prev + 1);
                  }}
              >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Incident Category & Type to Add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKGROUND|PENDING_CASE">Background - Pending Legal Matter</SelectItem>
                    <SelectItem value="BACKGROUND|MISDEMEANOR">Background - Misdemeanor</SelectItem>
                    <SelectItem value="BACKGROUND|FELONY">Background - Felony</SelectItem>
                    <SelectItem value="DISCIPLINE|DENIAL">Discipline - License Denial</SelectItem>
                    <SelectItem value="DISCIPLINE|SUSPENSION">Discipline - License Suspension</SelectItem>
                    <SelectItem value="DISCIPLINE|REVOCATION">Discipline - License Revocation</SelectItem>
                    <SelectItem value="DISCIPLINE|PROBATION">Discipline - Probation</SelectItem>
                    <SelectItem value="FINANCIAL|LIEN">Financial - Tax Lien</SelectItem>
                    <SelectItem value="FINANCIAL|JUDGMENT">Financial - Civil Judgment</SelectItem>
                    <SelectItem value="FINANCIAL|CHILD_SUPPORT">Financial - Child Support Delinquency</SelectItem>
                    <SelectItem value="BANKRUPTCY|CH7">Bankruptcy - Chapter 7</SelectItem>
                    <SelectItem value="BANKRUPTCY|CH11">Bankruptcy - Chapter 11</SelectItem>
                    <SelectItem value="BANKRUPTCY|CH13">Bankruptcy - Chapter 13</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-green-600 mt-2">
                  {selectKey > 0 && "✅ Incident added below. Please fill out the details."}
                </p>
              </div>
            </div>
          </div>

          {/* Documented Incidents List */}
          {formData.incidents.length > 0 && (
            <div className="space-y-4 mb-6">
              <Label className="text-gray-900">Documented Incidents ({formData.incidents.length})</Label>
              {formData.incidents.map((incident: any, index: number) => {
                const typeLabels: Record<string, string> = {
                  priorDiscipline: 'Prior License Discipline',
                  pendingCharges: 'Pending Charges',
                  misdemeanor: 'Misdemeanor',
                  felony: 'Felony',
                  judgment: 'Civil Judgment',
                  bankruptcy: 'Bankruptcy'
                };
                
                const categoryLabels: Record<string, string> = {
                  BACKGROUND: 'Background Review',
                  DISCIPLINE: 'Prior Licensing',
                  FINANCIAL: 'Financial Responsibility',
                  BANKRUPTCY: 'Bankruptcy'
                };
                
                const subtypeLabels: Record<string, string> = {
                  PENDING_CASE: 'Pending Case',
                  MISDEMEANOR: 'Misdemeanor',
                  FELONY: 'Felony',
                  DENIAL: 'Denial',
                  SUSPENSION: 'Suspension',
                  REVOCATION: 'Revocation',
                  PROBATION: 'Probation',
                  LIEN: 'Tax Lien',
                  JUDGMENT: 'Civil Judgment',
                  CHILD_SUPPORT: 'Child Support',
                  CH7: 'Chapter 7',
                  CH11: 'Chapter 11',
                  CH13: 'Chapter 13'
                };
                
                const displayLabel = incident.category 
                  ? `${categoryLabels[incident.category] || incident.category}${incident.subtype ? ' - ' + (subtypeLabels[incident.subtype] || incident.subtype) : ''}`
                  : typeLabels[incident.type] || incident.type;
                
                const isExpanded = expandedIncidentIds.includes(incident.id);
                
                return (
                  <div key={incident.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden transition-all duration-200">
                    {/* Incident Header / Toggle */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-gray-50/50 border-b border-gray-100"
                      onClick={() => toggleIncident(incident.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {incident.customName || `Incident #${formData.incidents.length - index}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full whitespace-nowrap">
                              {displayLabel}
                            </span>
                            {/* Show document status in header if collapsed */}
                            {!isExpanded && (
                              <span className="text-xs text-gray-500">
                                {incident.date || 'No date'} • {incident.resolution || 'No status'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeIncident(incident.id);
                        }}
                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Incident"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Incident Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label className="text-sm">Incident Name / Label (Optional)</Label>
                            <Input
                              value={incident.customName || ''}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, customName: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                              placeholder="e.g. 2018 Traffic Violation, 2020 Bankruptcy"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Date of Incident</Label>
                            <Input
                              type="date"
                              value={incident.date}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, date: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Case/File Number</Label>
                            <Input
                              value={incident.caseNumber}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, caseNumber: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                              placeholder="Case number or reference"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Jurisdiction/Court</Label>
                            <Input
                              value={incident.jurisdiction}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, jurisdiction: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                              placeholder="City, county, or court"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Current Status/Resolution</Label>
                            <Input
                              value={incident.resolution}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, resolution: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                              placeholder="e.g., Resolved, Pending, Discharged"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm">Detailed Description</Label>
                            <Textarea
                              value={incident.description}
                              onChange={(e) => {
                                const updated = formData.incidents.map((inc: any) =>
                                  inc.id === incident.id ? { ...inc, description: e.target.value } : inc
                                );
                                setFormData({ ...formData, incidents: updated });
                              }}
                              placeholder="Provide a complete explanation of the incident, circumstances, and outcome..."
                              rows={4}
                            />
                </div>
              </div>

                        {/* Category and Subtype Display */}
                        {incident.category && (
                          <div className="mt-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {incident.category}
                              {incident.subtype && ` - ${incident.subtype.replace('_', ' ')}`}
                            </span>
                </div>
                        )}

                        {/* Slot-Based Document Upload Section */}
                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <IncidentDocumentSlots
                            incident={incident}
                            appShortId={formData.clerkUserId.slice(-4)}
                            onUploadFile={uploadFileToSlot}
                            onRemoveFile={removeFileFromSlot}
                            onUpdateNarrative={updateIncidentNarrative}
                          />
                </div>
              </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Completion Status */}
          {allIncidentsDocumented() && formData.incidents.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-900">
                    <strong>All Required Incidents Documented</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    You've provided information and supporting documents for all {getRequiredIncidentTypes().length} required incident type(s).
                  </p>
                </div>
                </div>
              </div>
            )}

          {/* Warning if documents are missing */}
          {formData.incidents.length > 0 && !allIncidentsDocumented() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                  <p className="text-sm text-orange-900 mb-1">
                    <strong>Action Required</strong>
                    </p>
                  <p className="text-sm text-orange-700">
                    Please ensure each incident has detailed information filled out and at least one supporting document uploaded before continuing.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onBack}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assistance Selection
            </button>
              <button
              onClick={() => {
                if (allIncidentsDocumented() && formData.incidents.length > 0) {
                  setFormData({ ...formData, incidentInformationComplete: true });
                  onComplete?.();
                }
              }}
              disabled={!allIncidentsDocumented() || formData.incidents.length === 0}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Business Setup
                <ArrowRight className="w-4 h-4" />
              </button>
          </div>
        </div>
      )}
    </div>
  );
}

