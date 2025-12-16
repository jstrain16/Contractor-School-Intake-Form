import { 
  ArrowLeft, ArrowRight, CheckCircle, Circle, GraduationCap, User, 
  Building2, FileText, DollarSign, Briefcase, Shield, Calendar,
  ClipboardCheck, Send, AlertCircle, Upload, ChevronDown, ChevronUp,
  Users, CreditCard, BookOpen, Award, TrendingUp, Info, FileX, Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SupportingMaterialsWorkflow } from './SupportingMaterialsWorkflow';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { IncidentDocumentSlots } from './IncidentDocumentSlots';
import { Phase1 } from './phases/Phase1';
import { Phase2 } from './phases/Phase2';
import { Phase3 } from './phases/Phase3';
import { Phase4 } from './phases/Phase4';
import { Phase5 } from './phases/Phase5';
import { Phase6 } from './phases/Phase6';
import { Phase7 } from './phases/Phase7';
import { Phase8 } from './phases/Phase8';
import { Phase9 } from './phases/Phase9';
import { Phase10 } from './phases/Phase10';
import { Phase11 } from './phases/Phase11';
import { Phase12 } from './phases/Phase12';
import { Phase13 } from './phases/Phase13';
import { Phase14 } from './phases/Phase14';
import { Phase15 } from './phases/Phase15';
import { Phase16 } from './phases/Phase16';
import { Phase17 } from './phases/Phase17';
import logoImage from 'figma:asset/414fa9992179aa5ea488b45fcd1c60891fa1bfd6.png';
import { FormData as AppFormData } from './types/ApplicationTypes';

interface ApplicationFormProps {
  onBack: () => void;
}

interface Owner {
  id: string;
  name: string;
  dob: string;
  ssn: string;
  address: string;
  phone: string;
  citizenship: string;
  driverLicense: string;
  ownership: string;
}

interface ClassOption {
  id: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  location: string;
  description: string;
}

export function ApplicationForm({ onBack }: ApplicationFormProps) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [completedPhases, setCompletedPhases] = useState<number[]>([1]); // Phase 1 complete by default (Clerk authentication)
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [showSupportingMaterials, setShowSupportingMaterials] = useState(false);
  const [supportingMaterialsComplete, setSupportingMaterialsComplete] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<AppFormData>({
    // Phase 1: User Authentication
    firstName: 'Matt',
    lastName: 'Armstrong',
    phone: '8013814416',
    email: 'jdkarmstrong@gmail.com',
    clerkUserId: 'clerk_user_12345',
    
    // Phase 2: License Type
    licenseType: '',
    requiresExam: false,
    classType: '',
    
    // Phase 3: Class Selection
    selectedClass: '',
    classPaymentComplete: false,
    
    // Phase 4: Criminal & Financial
    priorDiscipline: '',
    pendingCharges: '',
    misdemeanors: '',
    felonies: '',
    judgments: '',
    bankruptcy: '',
    riskLevel: 'low',
    requiredDocs: [] as string[],
    
    // Phase 4.1: Incident Information (conditional)
    incidents: [] as any[],
    incidentInformationComplete: false,
    
    // Phase 5: Assistance
    assistanceLevel: '',
    assistancePaymentComplete: false,
    
    // Phase 6: Pre-Class Tasks
    businessStatus: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessCity: '',
    businessState: 'UT',
    businessZip: '',
    businessPhone: '',
    businessEmail: '',
    bankingStatus: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    feinNumber: '',
    businessDoc: null as File | null,
    feinStatus: '',
    feinDoc: null as File | null,
    bankAccountStatus: '',
    bankDoc: null as File | null,
    owners: [] as Owner[],
    hasEmployees: '',
    needsWorkersComp: false,
    workersCompStatus: '',
    wcProvider: '',
    wcPolicyNumber: '',
    wcExemptionReason: '',
    
    // Phase 7: Qualifier
    qualifierIsApplicant: true,
    qualifierName: '',
    qualifierLicense: '',
    qualifierInfo: '',
    qualifierAffidavit: null as File | null,
    
    // Phase 8 & 9: Insurance & WC Waiver
    insuranceNotified: false,
    insuranceCOI: null as File | null,
    insuranceQuoteReceived: false,
    insurancePaid: false,
    insuranceAmount: '',
    wcWaiverDocs: [] as string[],
    
    // Phase 10: Class Completion
    classCompleted: false,
    classCompletedDate: '',
    educationComplete: false,
    
    // Phase 11: Exam (conditional)
    examStatus: '',
    examPassLetter: null as File | null,
    examPassedDate: '',
    
    // Phase 12: Insurance Activation
    insuranceActive: false,
    certificateOfInsurance: null as File | null,
    
    // Phase 13: WC Waiver Submission
    wcWaiverSubmitted: false,
    wcWaiverDoc: null as File | null,
    
    // Phase 14: DOPL Assembly
    doplApplicationReady: false,
    liabilityProvider: '',
    liabilityPolicyNumber: '',
    liabilityCoverage: '',
    bondProvider: '',
    bondAmount: '',
    experienceYears: '',
    
    // Phase 15: Review
    salesforceCaseId: '',
    assignedStaff: '',
    staffReviewComplete: false,
    
    // Phase 16: Submission
    doplSubmissionStatus: '',
    doplSubmissionDate: '',
    dcplApplicationNumber: '',
    dcplSubmissionDate: '',
    
    // Phase 17: Tracking
    estimatedApprovalMin: '',
    estimatedApprovalMax: '',
  });

  // Mock class data from WooCommerce
  const mockClasses: ClassOption[] = [
    {
      id: '1',
      date: '2026-01-15',
      time: '9:00 AM - 5:00 PM',
      price: 599,
      seatsAvailable: 12,
      location: 'Salt Lake City, UT',
      description: 'General Building Contractor - 30 Hour Course'
    },
    {
      id: '2',
      date: '2026-01-22',
      time: '9:00 AM - 5:00 PM',
      price: 499,
      seatsAvailable: 8,
      location: 'Provo, UT',
      description: 'Residential Contractor - 25 Hour Course'
    },
    {
      id: '3',
      date: '2026-02-05',
      time: '9:00 AM - 5:00 PM',
      price: 599,
      seatsAvailable: 15,
      location: 'Ogden, UT',
      description: 'Electrical Contractor - 30 Hour Course'
    }
  ];

  const phases = [
    { id: 1, name: 'Authentication', icon: User, description: 'Basic Information' },
    { id: 2, name: 'License Type', icon: Award, description: 'Select Classification' },
    { id: 3, name: 'Class Booking', icon: Calendar, description: 'Schedule & Payment' },
    { id: 4, name: 'Screening', icon: ClipboardCheck, description: 'Criminal & Financial' },
    { id: 5, name: 'Assistance', icon: DollarSign, description: 'Support Level' },
    { id: 6, name: 'Business Setup', icon: Building2, description: 'Pre-Class Tasks' },
    { id: 7, name: 'Qualifier', icon: Users, description: 'Identification' },
    { id: 8, name: 'Insurance Prep', icon: Shield, description: 'Initial Setup' },
    { id: 9, name: 'WC Waiver Prep', icon: FileText, description: 'Documentation' },
    { id: 10, name: 'Class Complete', icon: GraduationCap, description: 'Attendance Verified' },
    { id: 11, name: 'Exam', icon: BookOpen, description: 'PSI Testing (If Required)' },
    { id: 12, name: 'Insurance Active', icon: Shield, description: 'Coverage Activated' },
    { id: 13, name: 'WC Submit', icon: Send, description: 'Waiver Submission' },
    { id: 14, name: 'DOPL Assembly', icon: Briefcase, description: 'Application Package' },
    { id: 15, name: 'Review', icon: ClipboardCheck, description: 'AI or Human Review' },
    { id: 16, name: 'Submission', icon: Send, description: 'Submit to DOPL' },
    { id: 17, name: 'Tracking', icon: TrendingUp, description: 'Status Updates' },
  ];

  const toggleSection = (phaseId: number) => {
    setExpandedSections(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const completePhase = (phaseId: number) => {
    if (!completedPhases.includes(phaseId)) {
      setCompletedPhases([...completedPhases, phaseId]);
    }
    
    // After Phase 4, check if incident information is needed
    if (phaseId === 4 && hasIncidents) {
      // Go to Phase 4.1 (Incident Information)
      setCurrentPhase(4.1);
      setExpandedSections([4.1]);
      return;
    }
    
    // After Phase 4.1, go to Phase 5
    if (phaseId === 4.1) {
      setCurrentPhase(5);
      setExpandedSections([5]);
      return;
    }
    
    // Auto-advance to next phase
    if (phaseId < phases.length) {
      setCurrentPhase(phaseId + 1);
      setExpandedSections([phaseId + 1]);
    }
  };

  const goToPhase = (phaseId: number) => {
    setCurrentPhase(phaseId);
    setExpandedSections([phaseId]);
  };

  // License type logic
  const handleLicenseSelection = (type: string) => {
    const requiresExam = ['R100', 'B100', 'E100'].includes(type);
    const classHours = requiresExam ? 30 : 25;
    setFormData({
      ...formData,
      licenseType: type,
      requiresExam,
      classType: `${classHours} hours`
    });
  };

  // Criminal & Financial risk assessment
  const calculateRisk = () => {
    const hasIssues = [
      formData.priorDiscipline,
      formData.pendingCharges,
      formData.misdemeanors,
      formData.felonies,
      formData.judgments,
      formData.bankruptcy
    ].some(answer => answer === 'yes');

    if (hasIssues) {
      const docs = [
        'Court documents for all charges',
        'Disposition letters',
        'Payment plan documentation',
        'Bankruptcy discharge papers'
      ];
      setFormData({
        ...formData,
        riskLevel: 'high',
        requiredDocs: docs
      });
    } else {
      setFormData({
        ...formData,
        riskLevel: 'low',
        requiredDocs: []
      });
    }
  };

  // Add owner
  const addOwner = () => {
    const newOwner: Owner = {
      id: Date.now().toString(),
      name: '',
      dob: '',
      ssn: '',
      address: '',
      phone: '',
      citizenship: '',
      driverLicense: '',
      ownership: ''
    };
    setFormData({
      ...formData,
      owners: [...formData.owners, newOwner]
    });
  };

  // Update owner
  const updateOwner = (id: string, field: keyof Owner, value: string) => {
    setFormData({
      ...formData,
      owners: formData.owners.map(owner =>
        owner.id === id ? { ...owner, [field]: value } : owner
      )
    });
  };

  // Remove owner
  const removeOwner = (id: string) => {
    setFormData({
      ...formData,
      owners: formData.owners.filter(owner => owner.id !== id)
    });
  };

  // Calculate total ownership
  const totalOwnership = formData.owners.reduce((sum, owner) => 
    sum + (parseFloat(owner.ownership) || 0), 0
  );

  // File upload handler
  const handleFileUpload = (field: string, file: File | null) => {
    setFormData({
      ...formData,
      [field]: file
    });
  };

  const getPhaseStatus = (phaseId: number) => {
    if (completedPhases.includes(phaseId)) return 'complete';
    if (phaseId === currentPhase) return 'active';
    return 'pending';
  };

  // Determine if user answered "yes" to any Phase 4 screening questions
  const hasIncidents = formData.priorDiscipline === 'yes' || 
    formData.pendingCharges === 'yes' || 
    formData.misdemeanors === 'yes' || 
    formData.felonies === 'yes' || 
    formData.judgments === 'yes' || 
    formData.bankruptcy === 'yes';

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

  // Helper function to add new incident
  const addIncident = (incident: any) => {
    setFormData({
      ...formData,
      incidents: [...formData.incidents, { 
        ...incident, 
        id: Date.now().toString(),
        category: incident.category || 'BACKGROUND',
        subtype: incident.subtype || '',
        narrative: '',
        documentSlots: generateDocumentSlots(incident.category || 'BACKGROUND', incident.subtype || ''),
        narrativeSaveStatus: 'saved'
      }]
    });
  };

  // Helper function to remove incident
  const removeIncident = (incidentId: string) => {
    setFormData({
      ...formData,
      incidents: formData.incidents.filter((inc: any) => inc.id !== incidentId)
    });
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-gray-900">CONTRACTORS SCHOOL</div>
              <div className="text-xs text-gray-500">Licensing Application Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden sm:inline">
              Phase {currentPhase} of {phases.length}
            </span>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-gray-900 mb-2">Contractor Licensing Application</h1>
          <p className="text-gray-600">
            Complete all 17 phases to submit your application to DOPL
          </p>
        </div>

        {/* Progress Overview with Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          {/* Logo and Progress Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={typeof logoImage === 'string' ? logoImage : (logoImage as any).src}
                alt="Contractors School"
                className="h-10 w-auto"
              />
              <div>
                <h2 className="text-gray-900">Application Progress</h2>
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {completedPhases.length} of {phases.length} phases complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedPhases.length / phases.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Phase Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase.id);
              return (
                <React.Fragment key={phase.id}>
                  <button
                    onClick={() => goToPhase(phase.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      status === 'complete'
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : status === 'active'
                        ? 'bg-orange-50 border-orange-300 hover:bg-orange-100 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <phase.icon
                      className={`w-5 h-5 ${
                        status === 'complete'
                          ? 'text-green-600'
                          : status === 'active'
                          ? 'text-orange-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-xs text-center ${
                        status === 'complete'
                          ? 'text-green-700'
                          : status === 'active'
                          ? 'text-orange-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {phase.name}
                    </span>
                  </button>
                  
                  {/* Phase 4.1: Incident Information (Conditional - appears right after Phase 4) */}
                  {phase.id === 4 && hasIncidents && (
                    <button
                      onClick={() => {
                        setCurrentPhase(4.1);
                        setExpandedSections([4.1]);
                      }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.incidentInformationComplete
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : currentPhase === 4.1
                          ? 'bg-orange-50 border-orange-400 hover:bg-orange-100 shadow-md'
                          : 'bg-orange-50/50 border-orange-300 hover:bg-orange-100'
                      }`}
                    >
                      <FileX
                        className={`w-5 h-5 ${
                          formData.incidentInformationComplete
                            ? 'text-green-600'
                            : currentPhase === 4.1
                            ? 'text-orange-600'
                            : 'text-orange-500'
                        }`}
                      />
                      <span
                        className={`text-xs text-center ${
                          formData.incidentInformationComplete
                            ? 'text-green-700'
                            : currentPhase === 4.1
                            ? 'text-orange-700'
                            : 'text-orange-600'
                        }`}
                      >
                        Incident Info
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-200 text-orange-800 rounded-full">
                        REQ
                      </span>
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Phase 1: User Authentication */}
        <Phase1
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(1)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Phase 2: License Type Selection */}
        <Phase2
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(2)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Phase 3: Class Selection & Payment */}
        <Phase3
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(3)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Phase 4: Criminal & Financial Screening */}
        <Phase4
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(4)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Phase 4.1: Incident Information (Conditional - only if hasIncidents) */}
        {hasIncidents && (
          <div className="bg-white rounded-xl border-2 border-orange-300 shadow-sm mb-4">
            <div
              className={`p-6 cursor-pointer ${ 
                currentPhase === 4.1 ? 'bg-gradient-to-r from-orange-50 to-orange-100' : 'bg-orange-50/50'
              }`}
              onClick={() => toggleSection(4.1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      completedPhases.includes(4.1) || formData.incidentInformationComplete
                        ? 'bg-green-600'
                        : currentPhase === 4.1
                        ? 'bg-orange-600'
                        : 'bg-orange-400'
                    }`}
                  >
                    {completedPhases.includes(4.1) || formData.incidentInformationComplete ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <FileX className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900">
                      Phase 4.1: Incident Information
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        REQUIRED
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Document each incident identified in screening
                    </p>
                  </div>
                </div>
                {expandedSections.includes(4.1) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
            {expandedSections.includes(4.1) && (
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
                  <h4 className="text-gray-900 mb-4">Add Incident Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Incident Category *</Label>
                      <Select
                        value=""
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
                            resolution: ''
                          };
                          addIncident(newIncident);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident category & type to add" />
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
                      
                      return (
                        <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                  {displayLabel}
                                </span>
                                <span className="text-sm text-gray-500">Incident #{index + 1}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeIncident(incident.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
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
                    onClick={() => {
                      setCurrentPhase(4);
                      setExpandedSections([4]);
                    }}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Screening
                  </button>
                  <button
                    onClick={() => {
                      if (allIncidentsDocumented() && formData.incidents.length > 0) {
                        setFormData({ ...formData, incidentInformationComplete: true });
                        completePhase(4.1);
                      }
                    }}
                    disabled={!allIncidentsDocumented() || formData.incidents.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Assistance Selection
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 5: Assistance Selection */}
        <Phase5
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(5)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Phase 6: Business Setup (Pre-Class Tasks) */}
        <Phase6
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(6)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
          handleFileUpload={handleFileUpload}
        />

        {/* PHASES 7-17 - Individual Components */}
        <Phase7
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(7)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
          handleFileUpload={handleFileUpload}
        />

        <Phase8
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(8)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        <Phase9
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(9)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        <Phase10
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(10)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        {/* Conditional Phase 11 - Only for exam-required licenses */}
        {['R100', 'B100', 'E100'].includes(formData.licenseType) && (
          <Phase11
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(11)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        )}

        <Phase12
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(12)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
          handleFileUpload={handleFileUpload}
        />

        <Phase13
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(13)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
          handleFileUpload={handleFileUpload}
        />

        <Phase14
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(14)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        <Phase15
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(15)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        <Phase16
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(16)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />

        <Phase17
          formData={formData}
          setFormData={setFormData}
          onComplete={() => completePhase(17)}
          expandedSections={expandedSections}
          completedPhases={completedPhases}
          toggleSection={toggleSection}
        />
      </main>
    </div>
  );
}

export default ApplicationForm;