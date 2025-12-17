import { createPortal } from 'react-dom';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Circle, GraduationCap, User, 
  Building2, FileText, DollarSign, Briefcase, Shield, Calendar,
  ClipboardCheck, Send, AlertCircle, Upload, ChevronDown, ChevronUp,
  Users, CreditCard, BookOpen, Award, TrendingUp, Info, FileX, Trash2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { Phase1 } from './phases/Phase1';
import { Phase2 } from './phases/Phase2';
import { Phase3 } from './phases/Phase3';
import { Phase4 } from './phases/Phase4';
import { Phase5 } from './phases/Phase5';
import { AssistanceSelection } from './phases/AssistanceSelection';
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
const logoImage = "/favicon.ico";
import { FormData as AppFormData } from './types/ApplicationTypes';
import { LoaderThreeFullScreen } from '@/components/ui/loader';

interface ApplicationFormProps {
  onBack: () => void;
  initialPhase?: number;
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

import { createClient } from '@supabase/supabase-js';

// ... imports ...

export function ApplicationForm({ onBack, initialPhase }: ApplicationFormProps) {
  const { user } = useUser();
  const startingPhase = initialPhase && initialPhase > 0 ? initialPhase : 1;
  
  const [currentPhase, setCurrentPhase] = useState(startingPhase);
  const [completedPhases, setCompletedPhases] = useState<number[]>([1]); // Phase 1 complete by default (Clerk authentication)
  const [expandedSections, setExpandedSections] = useState<number[]>([startingPhase]);
  const [showSupportingMaterials, setShowSupportingMaterials] = useState(false);
  const [supportingMaterialsComplete, setSupportingMaterialsComplete] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loadingApp, setLoadingApp] = useState<boolean>(true);
  const phaseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Form data state
  const [formData, setFormData] = useState<AppFormData>({
    // Phase 1: User Authentication
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    clerkUserId: '',
    
    // Phase 2: License Type
    licenseType: '',
    requiresExam: false,
    classType: '',
    
    // Phase 3: Class Selection
    educationMethod: 'new_class',
    selectedClass: '',
    classPaymentComplete: false,
    externalProviderName: '',
    externalClassDate: '',
    externalClassCompletionDate: '',
    externalCertificateDoc: null,
    externalBookingDoc: null,
    
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
    businessDoc: null,
    feinStatus: '',
    feinDoc: null,
    bankAccountStatus: '',
    bankDoc: null,
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
    qualifierAffidavit: null,
    
    // Phase 8 & 9: Insurance & WC Waiver
    insuranceNotified: false,
    insuranceCOI: null,
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
    examPassLetter: null,
    examPassedDate: '',
    
    // Phase 12: Insurance Activation
    insuranceActive: false,
    certificateOfInsurance: null,
    
    // Phase 13: WC Waiver Submission
    wcWaiverSubmitted: false,
    wcWaiverDoc: null,
    
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

  // Load application from backend on mount
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/application', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to load application');
        const json = await res.json();
        if (!active) return;
        setApplicationId(json.applicationId ?? null);
        const savedData = json.data ?? {};

        const mergedFormData = {
          ...formData,
          ...(savedData.formData || {}), // Load legacy/flat data first
          ...(savedData.phase1 || {}),
          ...(savedData.phase2 || {}),
          ...(savedData.phase3 || {}),
          ...(savedData.phase4 || {}),
          ...(savedData.phase5 || {}),
          ...(savedData.phase6 || {}),
          ...(savedData.phase7 || {}),
          ...(savedData.phase8 || {}),
          ...(savedData.phase9 || {}),
          ...(savedData.phase10 || {}),
          ...(savedData.phase11 || {}),
          ...(savedData.phase12 || {}),
          ...(savedData.phase13 || {}),
          ...(savedData.phase14 || {}),
          ...(savedData.phase15 || {}),
          ...(savedData.phase16 || {}),
          ...(savedData.phase17 || {}),
        };

        setFormData(mergedFormData);
        const savedCompleted = Array.isArray(savedData.completedPhases) ? savedData.completedPhases : null;
        if (savedCompleted) setCompletedPhases(savedCompleted);
        const savedActive = typeof savedData.active_phase === 'number' ? savedData.active_phase : null;
        const targetPhase = initialPhase && initialPhase > 0 ? initialPhase : savedActive || currentPhase || 1;
        setCurrentPhase(targetPhase);
        setExpandedSections([targetPhase]);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingApp(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Hydrate phase 1 fields from Clerk user (and ensure clerkUserId matches)
  useEffect(() => {
    if (!user) return;
    const emailFromClerk = user.primaryEmailAddress?.emailAddress ?? '';
    const phoneFromClerk = user.primaryPhoneNumber?.phoneNumber ?? '';
    const firstFromClerk = user.firstName ?? '';
    const lastFromClerk = user.lastName ?? '';

    setFormData((prev) => {
      const isDifferentUser = prev.clerkUserId && prev.clerkUserId !== user.id;
      return {
        ...prev,
        clerkUserId: user.id,
        firstName: isDifferentUser || !prev.firstName ? firstFromClerk : prev.firstName,
        lastName: isDifferentUser || !prev.lastName ? lastFromClerk : prev.lastName,
        email: isDifferentUser || !prev.email ? emailFromClerk : prev.email,
        phone: isDifferentUser || !prev.phone ? phoneFromClerk : prev.phone,
      };
    });
  }, [user]);

  // Realtime subscription for auto-updating payment status
  useEffect(() => {
    if (!applicationId) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`app-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contractor_applications',
          filter: `id=eq.${applicationId}`,
        },
        (payload) => {
          const newData = payload.new.data as any;
          if (newData?.phase3?.classPaymentComplete === true) {
            setFormData((prev) => ({
              ...prev,
              classPaymentComplete: true,
              // Merge other payment details if needed
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  // Auto-save on changes
  useEffect(() => {
    if (!applicationId) return;
    const buildPhases = (f: AppFormData) => ({
      phase1: {
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
        email: f.email,
        clerkUserId: f.clerkUserId,
      },
      phase2: {
        licenseType: f.licenseType,
        requiresExam: f.requiresExam,
        classType: f.classType,
      },
      phase3: {
        educationMethod: f.educationMethod,
        selectedClass: f.selectedClass,
        classPaymentComplete: f.classPaymentComplete,
        externalProviderName: f.externalProviderName,
        externalClassDate: f.externalClassDate,
        externalClassCompletionDate: f.externalClassCompletionDate,
        externalCertificateDoc: f.externalCertificateDoc,
        externalBookingDoc: f.externalBookingDoc,
      },
      phase4: {
        priorDiscipline: f.priorDiscipline,
        pendingCharges: f.pendingCharges,
        misdemeanors: f.misdemeanors,
        felonies: f.felonies,
        judgments: f.judgments,
        bankruptcy: f.bankruptcy,
        riskLevel: f.riskLevel,
        requiredDocs: f.requiredDocs,
        incidents: f.incidents,
        incidentInformationComplete: f.incidentInformationComplete,
      },
      phase5: {
        assistanceLevel: f.assistanceLevel,
        assistancePaymentComplete: f.assistancePaymentComplete,
      },
      phase6: {
        businessStatus: f.businessStatus,
        businessName: f.businessName,
        businessType: f.businessType,
        businessAddress: f.businessAddress,
        businessCity: f.businessCity,
        businessState: f.businessState,
        businessZip: f.businessZip,
        businessPhone: f.businessPhone,
        businessEmail: f.businessEmail,
        feinStatus: f.feinStatus,
        feinNumber: f.feinNumber,
        bankingStatus: f.bankingStatus,
        bankName: f.bankName,
        accountNumber: f.accountNumber,
        routingNumber: f.routingNumber,
        businessDoc: f.businessDoc,
        feinDoc: f.feinDoc,
        bankAccountStatus: f.bankAccountStatus,
        bankDoc: f.bankDoc,
        owners: f.owners,
        hasEmployees: f.hasEmployees,
        needsWorkersComp: f.needsWorkersComp,
        workersCompStatus: f.workersCompStatus,
        wcProvider: f.wcProvider,
        wcPolicyNumber: f.wcPolicyNumber,
        wcExemptionReason: f.wcExemptionReason,
      },
      phase7: {
        qualifierIsApplicant: f.qualifierIsApplicant,
        qualifierName: f.qualifierName,
        qualifierLicense: f.qualifierLicense,
        qualifierInfo: f.qualifierInfo,
        qualifierAffidavit: f.qualifierAffidavit,
      },
      phase8: {
        insuranceNotified: f.insuranceNotified,
        insuranceQuoteReceived: f.insuranceQuoteReceived,
        insurancePaid: f.insurancePaid,
        insuranceAmount: f.insuranceAmount,
        insuranceCOI: f.insuranceCOI,
        insuranceActive: f.insuranceActive,
        certificateOfInsurance: f.certificateOfInsurance,
        liabilityProvider: f.liabilityProvider,
        liabilityPolicyNumber: f.liabilityPolicyNumber,
        liabilityCoverage: f.liabilityCoverage,
      },
      phase9: {
        wcWaiverSubmitted: f.wcWaiverSubmitted,
        wcWaiverDoc: f.wcWaiverDoc,
        wcWaiverDocs: f.wcWaiverDocs,
        needsWorkersComp: f.needsWorkersComp,
        workersCompStatus: f.workersCompStatus,
        wcProvider: f.wcProvider,
        wcPolicyNumber: f.wcPolicyNumber,
        wcExemptionReason: f.wcExemptionReason,
      },
      phase10: {
        classCompleted: f.classCompleted,
        classCompletedDate: f.classCompletedDate,
        educationComplete: f.educationComplete,
      },
      phase11: {
        examStatus: f.examStatus,
        examPassLetter: f.examPassLetter,
        examPassedDate: f.examPassedDate,
      },
      phase12: {
        insuranceActive: f.insuranceActive,
        certificateOfInsurance: f.certificateOfInsurance,
      },
      phase13: {
        wcWaiverSubmitted: f.wcWaiverSubmitted,
        wcWaiverDoc: f.wcWaiverDoc,
      },
      phase14: {
        doplApplicationReady: f.doplApplicationReady,
        bondProvider: f.bondProvider,
        bondAmount: f.bondAmount,
        experienceYears: f.experienceYears,
      },
      phase15: {
        salesforceCaseId: f.salesforceCaseId,
        assignedStaff: f.assignedStaff,
        staffReviewComplete: f.staffReviewComplete,
      },
      phase16: {
        doplSubmissionStatus: f.doplSubmissionStatus,
        doplSubmissionDate: f.doplSubmissionDate,
        dcplApplicationNumber: f.dcplApplicationNumber,
        dcplSubmissionDate: f.dcplSubmissionDate,
      },
      phase17: {
        estimatedApprovalMin: f.estimatedApprovalMin,
        estimatedApprovalMax: f.estimatedApprovalMax,
      },
    });

    const timer = setTimeout(() => {
      const progress = Math.round((completedPhases.length / phases.length) * 100);
      const phasePayload = buildPhases(formData);
      const payload = {
        applicationId,
        data: {
          formData,
          completedPhases,
          active_phase: currentPhase,
          progress,
          ...phasePayload,
        },
        progress,
        activePhase: currentPhase,
        licenseType: formData.licenseType ?? null,
        primaryTrade: formData.classType ?? null,
        hasEmployees: formData.hasEmployees ?? null,
      };
      fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch((err) => console.error('autosave error', err));
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, completedPhases, currentPhase, applicationId]);

  // Determine if user answered "yes" to any Phase 4 screening questions
  const hasIncidents = formData.priorDiscipline === 'yes' || 
    formData.pendingCharges === 'yes' || 
    formData.misdemeanors === 'yes' || 
    formData.felonies === 'yes' || 
    formData.judgments === 'yes' || 
    formData.bankruptcy === 'yes';

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
    // Phase 5 (Incidents) only appears if required
    ...(hasIncidents ? [{ id: 5, name: 'Incident Info', icon: AlertCircle, description: 'Required Documentation' }] : []),
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

  // Scroll to current phase when it changes or expands
  useEffect(() => {
    // Handle floating phase ID (4.5) by scrolling to specific ref if exists, else fallback
    const el = phaseRefs.current[currentPhase] || phaseRefs.current[Math.floor(currentPhase)];
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [currentPhase, expandedSections]);

  const toggleSection = (phaseId: number) => {
    setExpandedSections(prev => 
      prev.includes(phaseId) 
        ? [] // Close the section if it's already open
        : [phaseId] // Open only this section (accordion behavior)
    );
    // Also update current phase to match
    if (!completedPhases.includes(phaseId)) {
        setCurrentPhase(phaseId);
    }
  };

  const completePhase = (phaseId: number) => {
    if (!completedPhases.includes(phaseId)) {
      setCompletedPhases([...completedPhases, phaseId]);
    }
    
    // After Phase 4, go to Assistance Selection (4.5)
    if (phaseId === 4) {
      setCurrentPhase(4.5);
      setExpandedSections([4.5]);
      return;
    }
    
    // After Assistance Selection (4.5)
    if (phaseId === 4.5) {
      if (hasIncidents) {
        // Go to Incident Information
        setCurrentPhase(5);
        setExpandedSections([5]);
      } else {
        // Skip Incident Information, go to Business Setup
        setCurrentPhase(6);
        setExpandedSections([6]);
      }
      return;
    }

    // After Incident Information (5), go to Business Setup (6)
    if (phaseId === 5) {
      setCurrentPhase(6);
      setExpandedSections([6]);
      return;
    }
    
    // Auto-advance to next phase for standard linear flow
    const currentIndex = phases.findIndex(p => p.id === phaseId);
    if (currentIndex !== -1 && currentIndex < phases.length - 1) {
      const nextPhaseId = phases[currentIndex + 1].id;
      setCurrentPhase(nextPhaseId);
      setExpandedSections([nextPhaseId]);
    } else if (phaseId < 17) {
        // Fallback for gaps (like if we are at 3 and want to go to 4)
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

  // File upload handler to Supabase via API
  const handleFileUpload = async (field: string, file: File | null) => {
    if (!file || !applicationId) {
      console.warn("Missing file or applicationId for upload");
      return;
    }

    const step = field === "qualifierAffidavit" ? 7 : 6;
    const form = new FormData();
    form.append("file", file);
    form.append("applicationId", applicationId);
    form.append("step", String(step));
    form.append("fileType", field);

    try {
      const res = await fetch("/api/upload-attachment", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        console.error("upload failed", await res.text());
        return;
      }
      const json = await res.json();
      const attachment = json.attachment;
      if (!attachment?.id) return;
      setFormData((prev) => ({
        ...prev,
        [field]: {
          id: attachment.id,
          bucket: attachment.bucket,
          path: attachment.path,
          originalName: attachment.metadata?.originalName || file.name,
          fileType: attachment.file_type,
          uploadedAt: attachment.created_at || new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error("upload error", err);
    }
  };

  const getPhaseStatus = (phaseId: number) => {
    if (completedPhases.includes(phaseId)) return 'complete';
    if (phaseId === currentPhase) return 'active';
    return 'pending';
  };

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('application-header-portal'));
  }, []);

  if (loadingApp) {
    return <LoaderThreeFullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Portal for Header Content */}
      {portalTarget && createPortal(
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium hidden sm:inline">
            Phase {currentPhase} of {phases.length}
          </span>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>,
        portalTarget
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Overview with Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          {/* Logo and Progress Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
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
        <div ref={(el) => { phaseRefs.current[1] = el; }}>
          <Phase1
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(1)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        {/* Phase 2: License Type Selection */}
        <div ref={(el) => { phaseRefs.current[2] = el; }}>
          <Phase2
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(2)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        {/* Phase 3: Class Selection & Payment */}
        <div ref={(el) => { phaseRefs.current[3] = el; }}>
          <Phase3
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(3)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
            applicationId={applicationId || undefined}
            handleFileUpload={handleFileUpload}
          />
        </div>

        {/* Phase 4: Criminal & Financial Screening */}
        <div ref={(el) => { phaseRefs.current[4] = el; }}>
          <Phase4
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(4)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        {/* Assistance Selection (Unnumbered Step 4.5) */}
        <div ref={(el) => { if (el) phaseRefs.current[4.5] = el; }}>
          <AssistanceSelection
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(4.5)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        {/* Phase 5: Incident Information (Conditional) */}
        {hasIncidents && (
          <div ref={(el) => { phaseRefs.current[5] = el; }}>
            <Phase5
              formData={formData}
              setFormData={setFormData}
              onComplete={() => completePhase(5)}
              expandedSections={expandedSections}
              completedPhases={completedPhases}
              toggleSection={toggleSection}
              onBack={() => {
                setCurrentPhase(4.5);
                setExpandedSections([4.5]);
              }}
            />
          </div>
        )}

        {/* Phase 6: Business Setup (Pre-Class Tasks) */}
        <div ref={(el) => { phaseRefs.current[6] = el; }}>
          <Phase6
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(6)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
            handleFileUpload={handleFileUpload}
          />
        </div>

        {/* PHASES 7-17 - Individual Components */}
        <div ref={(el) => { phaseRefs.current[7] = el; }}>
          <Phase7
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(7)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
            handleFileUpload={handleFileUpload}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[8] = el; }}>
          <Phase8
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(8)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[9] = el; }}>
          <Phase9
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(9)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[10] = el; }}>
          <Phase10
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(10)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        {/* Conditional Phase 11 - Only for exam-required licenses */}
        {['R100', 'B100', 'E100'].includes(formData.licenseType) && (
          <div ref={(el) => { phaseRefs.current[11] = el; }}>
            <Phase11
              formData={formData}
              setFormData={setFormData}
              onComplete={() => completePhase(11)}
              expandedSections={expandedSections}
              completedPhases={completedPhases}
              toggleSection={toggleSection}
            />
          </div>
        )}

        <div ref={(el) => { phaseRefs.current[12] = el; }}>
          <Phase12
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(12)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
            handleFileUpload={handleFileUpload}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[13] = el; }}>
          <Phase13
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(13)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
            handleFileUpload={handleFileUpload}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[14] = el; }}>
          <Phase14
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(14)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[15] = el; }}>
          <Phase15
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(15)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[16] = el; }}>
          <Phase16
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(16)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>

        <div ref={(el) => { phaseRefs.current[17] = el; }}>
          <Phase17
            formData={formData}
            setFormData={setFormData}
            onComplete={() => completePhase(17)}
            expandedSections={expandedSections}
            completedPhases={completedPhases}
            toggleSection={toggleSection}
          />
        </div>
      </main>
    </div>
  );
}

export default ApplicationForm;