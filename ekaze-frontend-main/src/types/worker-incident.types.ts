import api from '@/lib/api';

export type WorkerIncidentType =
  | 'non_payment'
  | 'unsafe_conditions'
  | 'harassment'
  | 'breach_of_contract'
  | 'wrongful_termination'
  | 'other';

export interface CreateWorkerIncidentRequest {
  incident_type: WorkerIncidentType;
  incident_subtype?: string | null;
  description: string;
  incident_date: string;
  incident_location?: string | null;
  province_id?: number | null;
  district_id?: number | null;
  sector_id?: number | null;
  cell_id?: number | null;
  village_id?: number | null;
  evidence_files?: File[];
}

export interface CreateWorkerIncidentResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    incident_number: string;
    worker_id: number;
    employer_id: number;
    employment_id: number;
    incident_type: WorkerIncidentType;
    incident_subtype: string | null;
    description: string;
    incident_date: string;
    incident_location: string | null;
    status: WorkerIncidentStatus;
    evidence_files: string[];
    created_at: string;
    updated_at: string;
    employer: {
      id: number;
      user: {
        id: number;
        name: string;
        phone: string;
        email: string;
      };
    };
    employment: {
      id: number;
      start_date: string;
    };
  };
}

export type WorkerIncidentStatus =
  | 'reported'
  | 'under_investigation'
  | 'resolved'
  | 'dismissed'
  | 'escalated';

export interface WorkerIncident {
  id: number;
  incident_number: string;
  worker_id: number;
  employer_id: number;
  employment_id: number;
  incident_type: WorkerIncidentType;
  incident_subtype: string | null;
  description: string;
  incident_date: string;
  incident_location: string | null;
  status: WorkerIncidentStatus;
  evidence_files: string[] | null;
  created_at: string;
  updated_at: string;
  employer: {
    id: number;
    user: {
      id: number;
      name: string;
      phone: string;
      email: string;
      profile_photo?: string | null;
    };
  } | null;
  employment: {
    id: number;
    start_date: string;
  } | null;
}

export interface WorkerIncidentsListResponse {
  success: boolean;
  data: {
    data: WorkerIncident[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

export interface WorkerIncidentDetailResponse {
  success: boolean;
  data: WorkerIncident & {
    assignedOfficer?: {
      id: number;
      name: string;
    } | null;
  };
}

export interface WorkerIncidentFilters {
  status?: WorkerIncidentStatus | 'all';
  incident_type?: WorkerIncidentType | 'all';
  page?: number;
  per_page?: number;
}

// Subtypes — from employer's perspective (now flipped: worker reports against employer)
export const WORKER_INCIDENT_SUBTYPES: Record<WorkerIncidentType, { value: string; label: string }[]> = {
  non_payment: [
    { value: 'salary_withheld',     label: 'Salary Withheld' },
    { value: 'partial_payment',     label: 'Partial Payment' },
    { value: 'delayed_payment',     label: 'Delayed Payment' },
    { value: 'deductions_dispute',  label: 'Unauthorized Deductions' },
    { value: 'other',               label: 'Other' },
  ],
  unsafe_conditions: [
    { value: 'physical_hazard',     label: 'Physical Hazard' },
    { value: 'lack_of_equipment',   label: 'Lack of Safety Equipment' },
    { value: 'health_risk',         label: 'Health Risk / Exposure' },
    { value: 'overworking',         label: 'Overworking / Excessive Hours' },
    { value: 'other',               label: 'Other' },
  ],
  harassment: [
    { value: 'verbal_abuse',        label: 'Verbal Abuse / Threats' },
    { value: 'sexual_harassment',   label: 'Sexual Harassment' },
    { value: 'discrimination',      label: 'Discrimination' },
    { value: 'intimidation',        label: 'Intimidation / Bullying' },
    { value: 'other',               label: 'Other' },
  ],
  breach_of_contract: [
    { value: 'role_change',         label: 'Unauthorized Role Change' },
    { value: 'hours_violation',     label: 'Working Hours Violation' },
    { value: 'benefit_denial',      label: 'Benefits Denied' },
    { value: 'early_termination',   label: 'Early Termination' },
    { value: 'other',               label: 'Other' },
  ],
  wrongful_termination: [
    { value: 'no_notice',           label: 'Terminated Without Notice' },
    { value: 'retaliation',         label: 'Retaliatory Dismissal' },
    { value: 'unjust_cause',        label: 'Unjust Cause' },
    { value: 'other',               label: 'Other' },
  ],
  other: [
    { value: 'general',             label: 'General / Unclassified' },
  ],
};