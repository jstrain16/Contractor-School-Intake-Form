import { z } from "zod"

export const licenseTypeSchema = z.enum(["specialty", "general"])
export const contactMethodSchema = z.enum(["email", "phone", "text"])
export const entityTypeSchema = z.enum(["LLC", "Corporation", "Sole Proprietorship", "Partnership", "Other"])

export const step0Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email"),
  preferredContact: contactMethodSchema.default("email"),
  // legacy licenseType kept for backwards compatibility; derived from selections
  licenseType: licenseTypeSchema.optional(),
  generalLicenses: z.array(z.string()).default([]),
  specialtyLicenses: z.array(z.string()).max(3, "You can only select up to 3 specialties").default([]),
  trade: z.string().optional(),
  hasEmployees: z.boolean().default(false),
  employeeCount: z.number().optional(),
})

export const step1Schema = z.object({
  preLicensureCompleted: z.boolean().default(false),
  courseProvider: z.string().optional(),
  dateCompleted: z.string().optional(),
  certificateNumber: z.string().optional(),
  exemptions: z.array(z.string()).default([]),
  // For file uploads, we'll store metadata or dummy string for this MVP
  certificateFile: z.any().optional(),
  degreeFile: z.any().optional(),
})

export const step2Schema = z.object({
  hasEntityRegistered: z.boolean().default(false),
  legalBusinessName: z.string().optional(),
  entityType: entityTypeSchema.optional(),
  stateOfIncorporation: z.string().optional(),
  utahEntityNumber: z.string().optional(),
  dateRegistered: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email("Invalid email").optional(),
  physicalAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  mailingAddressSame: z.boolean().default(true),
  mailingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  hasEin: z.boolean().default(false),
  federalEin: z.string().optional(),
  hasBusinessBankAccount: z.boolean().default(false),
  
  // Files
  registrationProofFile: z.any().optional(),
  operatingAgreementFile: z.any().optional(),
  einLetterFile: z.any().optional(),
  voidedCheckFile: z.any().optional(),
})

export const step3Schema = z.object({
  hasGlInsurance: z.boolean().default(false),
  glCarrier: z.string().optional(),
  glPolicyNumber: z.string().optional(),
  glEffectiveDate: z.string().optional(),
  glExpirationDate: z.string().optional(),
  glLimits: z.string().optional(),
  contactInsurancePartner: z.boolean().optional(),
  insuranceContactRequested: z.boolean().default(false),
  
  hasWorkersComp: z.boolean().default(false),
  wcCarrier: z.string().optional(),
  wcPolicyNumber: z.string().optional(),
  wcEffectiveDate: z.string().optional(),
  wcExpirationDate: z.string().optional(),
  
  hasWcWaiver: z.boolean().default(false),
  
  // Files
  glCertificateFile: z.any().optional(),
  wcCertificateFile: z.any().optional(),
  wcWaiverFile: z.any().optional(),
})

export const experienceEntrySchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  hoursPerWeek: z.number().min(1),
  responsibilities: z.string().min(1, "Description is required"),
})

export const step4Schema = z.object({
  qualifierDob: z.string().min(1, "DOB is required"),
  hasExperience: z.boolean().default(false),
  totalYearsExperience: z.number().optional(),
  primaryTrade: z.string().optional(),
  experienceEntries: z.array(experienceEntrySchema).default([]),
  hasEmployeeWorkersComp: z.boolean().default(false),
  wantsInsuranceQuote: z.boolean().default(false),
})

export const step5Schema = z.object({
  examStatus: z.enum(["scheduled", "passed", "not_scheduled"]).default("not_scheduled"),
  examDate: z.string().optional(),
  examLocation: z.string().optional(),
  examPassedDate: z.string().optional(),
  examId: z.string().optional(),
  planToTakeExam: z.boolean().optional(),
  
  // Files
  examScoreFile: z.any().optional(),
})

export const step6Schema = z.object({
  doplAppCompleted: z.boolean().default(false),
  reviewRequested: z.boolean().default(false),
  doplDeliveryAck: z.boolean().optional(),
  
  // Files
  doplAppFile: z.any().optional(),
})

export const step7Schema = z.object({
  attested: z.literal(true, { message: "You must certify this information" }),
  signature: z.string().min(1, "Signature is required"),
  signatureDate: z.string().min(1),
})

export const wizardSchema = z.object({
  step0: step0Schema,
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
})

export type WizardData = z.infer<typeof wizardSchema>
export type Step0Data = z.infer<typeof step0Schema>
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>
export type Step6Data = z.infer<typeof step6Schema>
export type Step7Data = z.infer<typeof step7Schema>

// Form input types (schema input shape) for react-hook-form + zodResolver
export type Step0FormValues = z.input<typeof step0Schema>
export type Step1FormValues = z.input<typeof step1Schema>
export type Step2FormValues = z.input<typeof step2Schema>
export type Step3FormValues = z.input<typeof step3Schema>
export type Step4FormValues = z.input<typeof step4Schema>
export type Step5FormValues = z.input<typeof step5Schema>
export type Step6FormValues = z.input<typeof step6Schema>
export type Step7FormValues = z.input<typeof step7Schema>

export const incidentSchema = z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  category: z.enum(["BACKGROUND", "DISCIPLINE", "FINANCIAL", "BANKRUPTCY"]),
  subtype: z
    .enum([
      "PENDING_CASE",
      "MISDEMEANOR",
      "FELONY",
      "OTHER",
      "DENIAL",
      "SUSPENSION",
      "REVOCATION",
      "PROBATION",
      "LIEN",
      "JUDGMENT",
      "CHILD_SUPPORT",
      "CH7",
      "CH11",
      "CH13",
      "UNKNOWN",
    ])
    .nullable()
    .optional(),
  jurisdiction: z.string().nullable().optional(),
  agency: z.string().nullable().optional(),
  court: z.string().nullable().optional(),
  case_number: z.string().nullable().optional(),
  incident_date: z.string().nullable().optional(),
  resolution_date: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export const narrativeSchema = z.object({
  id: z.string().uuid(),
  incident_id: z.string().uuid(),
  type: z.enum(["PERSONAL_STATEMENT", "CAUSE_AND_RECOVERY"]),
  content: z.string().nullable().optional(),
  autosave_version: z.number().default(1),
})

export const slotSchema = z.object({
  id: z.string().uuid(),
  incident_id: z.string().uuid(),
  slot_code: z.enum([
    "POLICE_REPORT",
    "COURT_RECORDS",
    "SUPERVISION_PROOF",
    "PAYMENT_PROOF",
    "RECORDS_UNAVAILABLE_LETTER",
    "DISCIPLINARY_ORDER",
    "REINSTATEMENT_LETTER",
    "LIEN_DOCUMENT",
    "JUDGMENT_DOCUMENT",
    "CHILD_SUPPORT_COMPLIANCE",
    "BANKRUPTCY_PETITION",
    "DISCHARGE_ORDER",
    "DEBT_SCHEDULE_SUMMARY",
    "SUPPORTING_DOCUMENT",
    "NARRATIVE_UPLOAD_OPTION",
  ]),
  required: z.boolean().default(true),
  status: z.enum(["missing", "uploaded", "waived"]).default("missing"),
  waive_reason: z.string().nullable().optional(),
})

export const uploadedFileSchema = z.object({
  id: z.string().uuid(),
  slot_id: z.string().uuid(),
  original_filename: z.string(),
  system_filename: z.string(),
  version: z.number(),
  storage_path: z.string(),
  mime_type: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  is_active: z.boolean(),
  replaced_by_file_id: z.string().uuid().nullable().optional(),
  uploaded_at: z.string().optional(),
  uploaded_by_user_id: z.string().nullable().optional(),
})
