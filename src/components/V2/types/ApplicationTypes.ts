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
  
  // Phase 7-17 handled by Phases7to17 component
  owners: Owner[];
  workersCompStatus: string;
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
  bondProvider: string;
  bondAmount: string;
  dcplApplicationNumber: string;
  dcplSubmissionDate: string;
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
