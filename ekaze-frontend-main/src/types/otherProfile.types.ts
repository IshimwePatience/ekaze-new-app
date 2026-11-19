export type EducationLevel =
  | 'none'
  | 'primary'
  | 'secondary'
  | 'advanced'
  | 'tvet'
  | 'bachelor'
  | 'masters'
  | 'phd';

export type PreferredWorkType =
  | 'live_in'
  | 'live_out'
  | 'part_time'
  | 'full_time'
  | 'flexible';

export type DrivingLicenceType = 'A' | 'B' | 'C' | 'none';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type PreferredSector =
  | 'hotel'
  | 'restaurant'
  | 'private_home'
  | 'hospital'
  | 'office'
  | 'school'
  | 'ngo'
  | 'other';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface PreviousEmployer {
  name: string;
  role?: string;
  duration?: string;
  location?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: number;
}

export interface SpokenLanguagesLevel {
  [language: string]: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface WorkerExtendedProfile {
  id: number;
  worker_id: number;

  // Education
  education_level: EducationLevel;
  education_option: string | null;
  education_institution: string | null;
  education_year_completed: number | null;

  // Experience
  past_experiences: string | null;
  years_of_experience: number;
  previous_employers: PreviousEmployer[] | null;

  // Services/Skills
  is_baby_sitter: boolean;
  accept_laundry: boolean;
  accept_ironing: boolean;
  accept_house_chores: boolean;
  accept_cooking: boolean;
  accept_gardening: boolean;
  accept_car_washing: boolean;
  accept_elderly_care: boolean;
  accept_childcare: boolean;
  accept_pet_care: boolean;
  accept_shopping: boolean;
  accept_driving: boolean;

  // Sector & work type
  preferred_sectors: PreferredSector[] | null;
  preferred_work_type: PreferredWorkType;

  // Schedule
  available_days: DayOfWeek[] | null;
  available_from: string | null;
  available_to: string | null;
  available_weekends: boolean;
  available_holidays: boolean;

  // Certificates
  has_driving_licence: boolean;
  driving_licence_type: DrivingLicenceType;
  has_cooking_certificate: boolean;
  has_first_aid_certificate: boolean;
  has_childcare_certificate: boolean;

  // Health
  is_physically_fit: boolean;
  has_medical_conditions: boolean;
  medical_conditions_details: string | null;

  // Extra referee
  referee_3_name: string | null;
  referee_3_phone: string | null;
  referee_3_relationship: string | null;

  // Social
  marital_status: MaritalStatus | null;
  number_of_dependents: number;
  religion: string | null;
  spoken_languages_level: SpokenLanguagesLevel | null;

  // Bio
  bio: string | null;
  special_skills: string | null;
  certifications: Certification[] | null;
  profile_completion_percent: number;

  created_at: string;
  updated_at: string;
}

// ── Request ──────────────────────────────────────────────────────
export interface UpdateExtendedProfileRequest {
  // Education
  education_level?: EducationLevel;
  education_option?: string;
  education_institution?: string;
  education_year_completed?: number;

  // Experience
  past_experiences?: string;
  years_of_experience?: number;
  previous_employers?: PreviousEmployer[];

  // Services
  is_baby_sitter?: boolean;
  accept_laundry?: boolean;
  accept_ironing?: boolean;
  accept_house_chores?: boolean;
  accept_cooking?: boolean;
  accept_gardening?: boolean;
  accept_car_washing?: boolean;
  accept_elderly_care?: boolean;
  accept_childcare?: boolean;
  accept_pet_care?: boolean;
  accept_shopping?: boolean;
  accept_driving?: boolean;

  // Sector & work type
  preferred_sectors?: PreferredSector[];
  preferred_work_type?: PreferredWorkType;

  // Schedule
  available_days?: DayOfWeek[];
  available_from?: string;
  available_to?: string;
  available_weekends?: boolean;
  available_holidays?: boolean;

  // Certificates
  has_driving_licence?: boolean;
  driving_licence_type?: DrivingLicenceType;
  has_cooking_certificate?: boolean;
  has_first_aid_certificate?: boolean;
  has_childcare_certificate?: boolean;

  // Health
  is_physically_fit?: boolean;
  has_medical_conditions?: boolean;
  medical_conditions_details?: string;

  // Extra referee
  referee_3_name?: string;
  referee_3_phone?: string;
  referee_3_relationship?: string;

  // Social
  marital_status?: MaritalStatus;
  number_of_dependents?: number;
  religion?: string;
  spoken_languages_level?: SpokenLanguagesLevel;

  // Bio
  bio?: string;
  special_skills?: string;
  certifications?: Certification[];
}

// ── Responses ────────────────────────────────────────────────────
export interface ExtendedProfileResponse {
  success: boolean;
  data: WorkerExtendedProfile;
}

export interface UpdateExtendedProfileResponse {
  success: boolean;
  message: string;
  data: WorkerExtendedProfile;
}