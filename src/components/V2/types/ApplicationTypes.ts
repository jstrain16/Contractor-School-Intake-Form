export interface Owner {
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

export interface ClassOption {
  id: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  location: string;
  description: string;
}

export interface IncidentDocument {
  id: number;
  originalFilename: string;
  systemFilename: string;
  version: number;
  size: number;
  uploadedAt: string;
  isActive: boolean;
}

export interface Incident {
  id: string;
  type: 'discipline' | 'pending' | 'misdemeanor' | 'felony' | 'judgment' | 'bankruptcy';
  description: string;
  date: string;
  jurisdiction: string;
  caseNumber: string;
  outcome: string;
  documentSlots?: any[];
  narrative?: string;
  narrativeSaveStatus?: string;
  documents: {
    BACKGROUND: IncidentDocument[];
    DISCIPLINE: IncidentDocument[];
    FINANCIAL: IncidentDocument[];
    BANKRUPTCY: IncidentDocument[];
  };
  narratives: {
    circumstances: string;
    resolution: string;
    rehabilitation: string;
  };
  isComplete: boolean;
}

export interface AttachmentMeta {
  id: string;
  bucket: string;
  path: string;
  originalName: string;
  fileType?: string;
  uploadedAt?: string;
}

export interface FormData {
  // Phase 1: User Authentication
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  clerkUserId: string;
  
  // Phase 2: License Type
  licenseType: string;
  requiresExam: boolean;
  classType: string;
  
  // Phase 3: Class Selection
  selectedClass: string;
  classPaymentComplete: boolean;
  
  // Phase 4: Criminal & Financial
  priorDiscipline: string;
  pendingCharges: string;
  misdemeanors: string;
  felonies: string;
  judgments: string;
  bankruptcy: string;
  riskLevel: string;
  requiredDocs: string[];
  
  // Phase 4.1: Incident Information (conditional)
  incidents: Incident[];
  incidentInformationComplete: boolean;
  
  // Phase 5: Assistance
  assistanceLevel: string;
  assistancePaymentComplete: boolean;
  
  // Phase 6: Pre-Class Tasks
  businessStatus: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessPhone: string;
  businessEmail: string;
  feinStatus: string;
  feinNumber: string;
  bankingStatus: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  businessDoc?: AttachmentMeta | null;
  feinDoc?: AttachmentMeta | null;
  bankAccountStatus?: string;
  bankDoc?: AttachmentMeta | null;
  
  // Phase 7-17 handled by Phases7to17 component
  owners: Owner[];
  workersCompStatus: string;
  hasEmployees?: string;
  needsWorkersComp?: boolean;
  wcProvider: string;
  wcPolicyNumber: string;
  wcExemptionReason: string;
  educationComplete: boolean;
  liabilityProvider: string;
  liabilityPolicyNumber: string;
  liabilityCoverage: string;
  experienceYears: string;
  qualifierName: string;
  qualifierLicense: string;
  qualifierIsApplicant?: boolean;
  qualifierInfo?: string;
  qualifierAffidavit?: AttachmentMeta | null;
  bondProvider: string;
  bondAmount: string;
  dcplApplicationNumber: string;
  dcplSubmissionDate: string;
  insuranceNotified?: boolean;
  insuranceCOI?: File | null;
  insuranceQuoteReceived?: boolean;
  insurancePaid?: boolean;
  insuranceAmount?: string;
  wcWaiverDocs?: string[];
  classCompleted?: boolean;
  classCompletedDate?: string;
  examStatus?: string;
  examPassLetter?: File | null;
  examPassedDate?: string;
  insuranceActive?: boolean;
  certificateOfInsurance?: File | null;
  wcWaiverSubmitted?: boolean;
  wcWaiverDoc?: File | null;
  doplApplicationReady?: boolean;
  salesforceCaseId?: string;
  assignedStaff?: string;
  staffReviewComplete?: boolean;
  doplSubmissionStatus?: string;
  doplSubmissionDate?: string;
  estimatedApprovalMin?: string;
  estimatedApprovalMax?: string;
}

export interface PhaseComponentProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onComplete?: () => void;
  expandedSections: number[];
  completedPhases: number[];
  toggleSection: (phaseId: number) => void;
  handleFileUpload?: (field: string, file: File | null) => void;
}
