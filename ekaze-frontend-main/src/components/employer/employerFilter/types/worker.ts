export interface Worker {
  fee: number;
  id: string;
  uuid?: string;
  firstName: string;
  lastName: string;
  photo: string;
  gender: 'male' | 'female';
  age: number;
  district: string;
  sector: string;
  salaryMin: number;
  salaryMax: number;
  experience: 'no-experience' | 'fresher' | 'intermediate' | 'expert';
  experience_years?: number;
  languages: string[];
  hasInsurance: boolean;
  type: 'company' | 'freelance';
  companyName?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  availability_status?: 'available' | 'hired' | 'unavailable' | string;
  is_hired?: boolean;
  workTypes: ('full-time' | 'part-time' | 'live-in')[];
  shift_type?: 'full_time' | 'part_time';
  availability_slots?: Array<{
    id?: number | string;
    day_index?: number;
    day_label?: string;
    start_time: string;
    end_time: string;
    scope?: string;
  }>;
  registeredAt: Date;
  createdAt: Date;
}

export type WorkType = 'full-time' | 'part-time' | 'live-in';

export interface SearchFilters {
  searchQuery: string;
  gender: 'all' | 'male' | 'female';
  ageMin: number;
  ageMax: number;
  districts: string[];
  salaryMin: number;
  salaryMax: number;
  experience: string[];
  languages: string[];
  hasInsurance: 'all' | 'yes' | 'no';
  workerType: 'all' | 'company' | 'freelance';
  workTypes: string[];
  availableOnly: boolean;
}

export const DISTRICTS = [
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
];

export const LANGUAGES = [
  'Kinyarwanda',
  'English',
  'French',
  'Swahili',
];

export const EXPERIENCE_LEVELS = [
  { value: 'no-experience', label: 'No Experience' },
  { value: 'fresher', label: 'Fresher (< 1 year)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'expert', label: 'Expert (3+ years)' },
];

export const WORK_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'live-in', label: 'Live-In' },
];
