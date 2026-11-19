// active-workers.types.ts

// ==================== BASE TYPES ====================

export interface CurrentEmployment {
  id: number;
  agreed_salary: number;
  subscription_fee: number;
  start_date: string;
  end_date: string | null;
  duration_days: number;
  formatted_duration: string;
  work_description: string;
  status: string;
  next_payment_date: string | null;
  days_employed: number;
}

// ==================== OTP VERIFICATION TYPES ====================

export interface OtpRequest {
  national_id: string;
}

export interface OtpVerifyRequest {
  national_id: string;
  otp_code: string;
}

export interface RejectWorkerRequest {
  national_id: string;
  rejection_reason: string;
}

// ==================== WORKER VERIFICATION RESPONSE ====================

export interface WorkerVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    // OTP Request Response (Step 1)
    worker_preview?: {
      id: number;
      name: string;
      national_id: string;
      phone: string;
    };
    otp?: string; // FOR DEVELOPMENT ONLY
    otp_expires_in?: string;
    expires_at?: string;
    
    // Verification Response - Full Worker Details (Step 2)
    verified?: boolean;
    worker?: {
      id: number;
      full_name: string;
      first_name: string;
      last_name: string;
      age: number;
      gender: string;
      national_id: string;
      phone: string;
      email: string;
      photo: string | null;
      address: string;
      district: string;
      sector: string;
      cell: string;
      village: string;
      
      // Legacy fields for backward compatibility
      card_id?: string;
      name?: string;
      experience_level?: string;
      availability_status?: string;
      has_insurance?: boolean;
      insurance_provider?: string | null;
      average_rating?: number;
      total_ratings?: number;
      currently_employed?: boolean;
      verified_at?: string;
      
      // Company info (can be either format)
      company?: {
        name: string;
        phone: string;
        id?: number;
        email?: string;
      } | null;
    };
    
    // Professional Info
    professional_info?: {
      experience_level: string;
      languages_spoken: string[];
      work_type_preferences: string[];
      preferred_districts: string[];
      preferred_sectors: string[];
      salary_range: string;
      availability_status: string;
    };
    
    // Verification Status
    verification_status?: {
      nida_verified: boolean;
      nida_verified_at: string | null;
      has_insurance: boolean;
      insurance_provider: string | null;
      insurance_number: string | null;
    };
    
    // Company Info
    company?: {
      id: number;
      name: string;
      phone: string;
      email: string;
    } | null;
    
    // Assignment Info
    assignment?: {
      assigned_to_me: boolean;
      assigned_employer: {
        id: number;
        name: string;
      } | null;
    };
    
    // Ratings
    ratings?: {
      average_rating: number;
      total_ratings: number;
      rating_stars: string;
      recent_ratings: Array<{
        rating: number;
        comment: string;
        reviewer: string;
        created_at: string;
      }>;
    };
    
    // Employment History
    employment_history?: {
      total_employments: number;
      current_employment: CurrentEmployment | null;
      recent_employments: Array<{
        employer_name: string;
        duration_days: number;
        duration_formatted: string | null;
        start_date: string;
        end_date: string | null;
        status: string;
        agreed_salary: number;
      }>;
    };
    
    // Incidents
    incidents?: {
      total_incidents: number;
      unresolved_count: number;
      recent_incidents: Array<{
        type: string;
        severity: string;
        description: string;
        status: string;
        reported_at: string;
      }>;
    };
    
    // Referees
    referees?: Array<{
      name: string | null;
      phone: string | null;
      relationship: string | null;
    }>;
    
    // Background Check
    background_check?: {
      nida_verified: boolean;
      total_incidents: number;
      unresolved_incidents: number;
      total_employments: number;
      average_rating: number;
    };
    
    // Statistics
    statistics?: {
      employment_success_rate: number;
      average_employment_duration: number;
      incident_rate: number;
    };
  };
}

// ==================== ACTIVE WORKER TYPES ====================

export interface ActiveWorker {
  // Basic info
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number;
  gender: string;
  profile_photo: string | null;

  // Contact
  phone: string;
  email: string;
  national_id: string;

  // Location
  district: string;
  sector: string;
  cell: string;
  village: string;

  // Work details
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: number;
  max_salary: number;

  // Status
  availability_status: string;
  average_rating: number;
  total_ratings: number;
  nida_verified: boolean;
  nida_verified_at: string | null;

  // Company
  company: {
    id: number;
    business_name: string;
  } | null;

  // Current employment
  current_employment: CurrentEmployment | null;

  // References
  referee_1_name: string | null;
  referee_1_phone: string | null;
  referee_1_relationship: string | null;
  referee_2_name: string | null;
  referee_2_phone: string | null;
  referee_2_relationship: string | null;

  // Statistics
  total_employments: number;
  total_incidents: number;

  // Timestamps
  created_at: string;
  date_of_birth: string | null;
}

export interface ActiveWorkersFilters {
  search?: string;
  sort_by?: 'recent' | 'oldest' | 'name' | 'rating';
  page?: number;
  per_page?: number;
}

export interface ActiveWorkersResponse {
  success: boolean;
  message: string;
  data: {
    data: ActiveWorker[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
}

// ==================== ID CARD TYPES ====================

export interface IdCardGenerateResponse {
  success: boolean;
  message: string;
  data: {
    card_id: string;
    card_url: string;
    download_url: string;
    pdf_url: string;
    qr_download_url: string;
    qr_verify_url: string;
    worker: {
      id: number;
      name: string;
      company: string;
    };
  };
}

export interface WorkerCard {
  url: string;
  filename: string;
  size: number;
  created_at: string;
}

export interface WorkerCardsResponse {
  success: boolean;
  data: {
    worker_id: number;
    worker_name: string;
    total_cards: number;
    cards: WorkerCard[];
  };
}

export interface BulkGenerateRequest {
  worker_ids: number[];
}

export interface BulkGenerateResult {
  worker_id: number;
  worker_name?: string;
  success: boolean;
  card_url?: string;
  message?: string;
}

export interface BulkGenerateResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    success_count: number;
    fail_count: number;
    results: BulkGenerateResult[];
  };
}