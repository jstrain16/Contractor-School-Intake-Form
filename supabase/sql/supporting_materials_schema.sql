-- Supporting Materials schema (Phase 4)
-- Assumes existing `user_profiles` (id uuid, user_id text) and `contractor_applications` (id uuid, user_id text).
-- Adjust types as needed to match your Supabase instance.

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  status text not null default 'draft',
  license_classification text,
  course_hours_required int,
  exam_required boolean,
  risk_tier text,
  assistance_package text,
  phase_completed jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on applications (user_id);

create table if not exists supporting_materials_plan (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  status text not null default 'draft',
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supporting_materials_plan_app_idx on supporting_materials_plan (application_id);

create type incident_category as enum ('BACKGROUND', 'DISCIPLINE', 'FINANCIAL', 'BANKRUPTCY');
create type incident_subtype as enum ('PENDING_CASE', 'MISDEMEANOR', 'FELONY', 'OTHER', 'DENIAL', 'SUSPENSION', 'REVOCATION', 'PROBATION', 'LIEN', 'JUDGMENT', 'CHILD_SUPPORT', 'CH7', 'CH11', 'CH13', 'UNKNOWN');

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  category incident_category not null,
  subtype incident_subtype,
  jurisdiction text,
  agency text,
  court text,
  case_number text,
  incident_date date,
  resolution_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incidents_app_idx on incidents (application_id);
create index if not exists incidents_active_idx on incidents (application_id, is_active);

create type slot_code as enum (
  'POLICE_REPORT',
  'COURT_RECORDS',
  'SUPERVISION_PROOF',
  'PAYMENT_PROOF',
  'RECORDS_UNAVAILABLE_LETTER',
  'DISCIPLINARY_ORDER',
  'REINSTATEMENT_LETTER',
  'LIEN_DOCUMENT',
  'JUDGMENT_DOCUMENT',
  'CHILD_SUPPORT_COMPLIANCE',
  'BANKRUPTCY_PETITION',
  'DISCHARGE_ORDER',
  'DEBT_SCHEDULE_SUMMARY',
  'SUPPORTING_DOCUMENT',
  'NARRATIVE_UPLOAD_OPTION'
);

create table if not exists required_document_slots (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  slot_code slot_code not null,
  required boolean not null default true,
  status text not null default 'missing', -- missing | uploaded | waived
  waive_reason text,
  updated_at timestamptz not null default now()
);

create index if not exists required_document_slots_incident_idx on required_document_slots (incident_id);

create type narrative_type as enum ('PERSONAL_STATEMENT', 'CAUSE_AND_RECOVERY');

create table if not exists narratives (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  type narrative_type not null,
  content text,
  autosave_version int not null default 1,
  updated_at timestamptz not null default now(),
  unique (incident_id, type)
);

create table if not exists uploaded_files (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references required_document_slots(id) on delete cascade,
  original_filename text not null,
  system_filename text not null,
  version int not null,
  storage_path text not null,
  mime_type text,
  size bigint,
  is_active boolean not null default true,
  replaced_by_file_id uuid references uploaded_files(id),
  uploaded_at timestamptz not null default now(),
  uploaded_by_user_id text
);

create index if not exists uploaded_files_slot_idx on uploaded_files (slot_id, is_active);
create index if not exists uploaded_files_slot_version_idx on uploaded_files (slot_id, version desc);

-- Bucket (create manually in Supabase UI/CLI): storage bucket `supporting-materials`
-- RLS policies should restrict by user_id/application ownership.

