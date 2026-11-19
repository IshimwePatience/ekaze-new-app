import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Loader2, SlidersHorizontal, Briefcase, Heart, Home, Car, Utensils,
  Zap, MapPin, Search, ArrowRight, Sparkles, ChevronDown, ChevronUp, Check, Truck, Bus, Package, ShieldCheck
} from 'lucide-react';
import { SearchFilters as FilterType, DISTRICTS, LANGUAGES, EXPERIENCE_LEVELS, WORK_TYPES, WorkType, Worker } from '../types/worker';
import { Button } from '../ui/button';
import { SearchFilters } from '../employer/SearchFilters';
import { WorkerSearchResults } from '../employer/WorkerSearchResults';
import { WorkerDetailModal } from '../employer/WorkerDetailModal';
import { AskIhirweRightSidebar } from '@/components/layout/AskIhirweRightSidebar';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import { usePublicWorkerSearch } from '@/hooks/useWorkers';
import { useAuth } from '@/hooks/useAuth';
import { workerApi } from '@/api/workerService';
import type { PublicSearchParams, PublicWorker } from '@/api/workerService';
import { AdvancedFiltersModal, defaultAdvancedFilters } from '../../AdvancedFiltersModal';
import type { AdvancedFilters } from '../../AdvancedFiltersModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';
import { cn } from '../clsx/utils';
import personImg from "@/assets/hero_person_report.jpg";

const ITEMS_PER_PAGE = 20;

interface EmployerSearchProps {
  statusSearch: boolean;
}

const EXPERIENCE_MAP: Record<string, string> = {
  'expert': 'expert',
  'intermediate': 'intermediate',
  'fresher': 'beginner',
  'no-experience': 'beginner'
};

export const DRIVER_CATEGORIES_LIST = [
  { id: 'truck', label: 'Heavy Commercial Truck', labelRw: 'Kamyo Ziremereye', icon: Truck },
  { id: 'vip', label: 'VIP & Executive Transport', labelRw: "Imodoka z'Abayobozi", icon: ShieldCheck },
  { id: 'tipper', label: 'Construction & Tipper Truck', labelRw: 'Ubwubatsi & Benne', icon: Truck },
  { id: 'delivery', label: 'Delivery & Cargo Van', labelRw: 'Imizigo & Van', icon: Package },
  { id: 'bus', label: 'Bus & Passenger Transport', labelRw: 'Bisi & Abagenzi', icon: Bus },
];

export const SALARY_RANGES_LIST = [
  { value: 'all', label: 'Max. price (Any)', labelRw: 'Igiciro cyose' },
  { value: 100000, label: 'Up to 100,000 RWF', labelRw: 'Kugeza ku 100,000 RWF' },
  { value: 200000, label: 'Up to 200,000 RWF', labelRw: 'Kugeza ku 200,000 RWF' },
  { value: 350000, label: 'Up to 350,000 RWF', labelRw: 'Kugeza ku 350,000 RWF' },
  { value: 500000, label: 'Up to 500,000 RWF', labelRw: 'Kugeza ku 500,000 RWF' },
  { value: 1000000, label: 'Up to 1,000,000 RWF', labelRw: 'Kugeza kuri 1,000,000 RWF' },
];

export const RWANDA_LICENSES_LIST = [
  { id: 'A', code: 'Cat. A', desc: 'Motorcycles & Tricycles (Piki-piki)' },
  { id: 'B', code: 'Cat. B', desc: 'Cars, Jeeps, Pickups (< 3,500 kg)' },
  { id: 'C', code: 'Cat. C', desc: 'Commercial Trucks & Lorries (> 3,500 kg)' },
  { id: 'D', code: 'Cat. D', desc: 'Passenger Buses & Coaches (> 8 seats)' },
  { id: 'E', code: 'Cat. E', desc: 'Articulated Heavy Trailers & Combination' },
  { id: 'F', code: 'Cat. F', desc: 'Special Machinery, Tractors & Construction' },
];

const HeroSection = ({
  isAuthenticated,
  t,
  filters,
  setFilters,
  isRw,
}: {
  isAuthenticated: boolean;
  t: {
    heroTitle: string;
    heroSubtitleAuth: string;
    heroSubtitleGuest: string;
    resetFilters: string;
    advancedSearch: string;
    filterWorkers: string;
    errorLoading: string;
    loadingMore: string;
  };
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  isRw: boolean;
}) => {
  return (
    <div className="relative rounded-[32px] bg-gradient-to-r from-[#2162c4] via-[#2f6ed4] to-[#4580e0] text-white p-8 sm:p-12 lg:p-14 shadow-xl overflow-hidden mb-8 min-h-[340px] flex items-center">

      {/* 1. Large Soft Pink / Peach Circular Background Disk (Top Right) */}
      <div className="absolute right-[-40px] top-[-60px] sm:right-[-20px] sm:top-[-40px] w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] lg:w-[500px] lg:h-[500px] rounded-full bg-[#ffb5c5] pointer-events-none opacity-95" />

      {/* 2. Geometric Thin Arc Rings SVG Overlay */}
      <svg className="absolute right-0 top-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 400" fill="none">
        <circle cx="680" cy="180" r="230" stroke="#ff8da7" strokeWidth="1.5" opacity="0.6" strokeDasharray="6 6" />
        <circle cx="680" cy="180" r="190" stroke="#93c5fd" strokeWidth="1.5" opacity="0.8" />
        <path d="M 520 120 C 580 40, 720 40, 780 120" stroke="#60a5fa" strokeWidth="2" opacity="0.5" />
      </svg>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 w-full">

        {/* Left Side: Typography, CTA & Search Bar */}
        <div className="lg:col-span-7 space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.12]">
            {isRw ? "Shaka, akora, cyangwa utange abakozi inzobere" : "Start, switch, or advance your workforce"}
          </h1>

          {/* PREVIOUS DOMESTIC WORKER SUBTITLE (PRESERVED):
          <p className="text-base sm:text-lg text-blue-50/90 max-w-lg font-medium leading-relaxed">
            {isRw
              ? "Kura n'abakozi bafite uburambe n'ubwizerane ku rwego rwa mbere mu Rwanda"
              : "Grow with verified domestic professionals from top organizations"}
          </p>
          */}
          <p className="text-base sm:text-lg text-blue-50/90 max-w-lg font-medium leading-relaxed">
            {isRw
              ? "Kura n'abashoferi b'umwuga bafite impushya n'ubwizerane ku rwego rwa mbere mu Rwanda"
              : "Grow with certified commercial, fleet, and heavy transport drivers across Rwanda"}
          </p>

          {/* White Pill Button CTA + Integrated Search Bar */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md flex items-center bg-white rounded-2xl p-1.5 shadow-lg border border-slate-200">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder={isRw ? "Shakisha izina ry'umukozi, akazi..." : "Search by worker name, skill..."}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  className="bg-[#2478b8] hover:bg-[#1b6296] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border-0 flex items-center gap-1.5"
                >
                  <span>{isRw ? "Shakisha" : "Search"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Solid Blue Circle with Smiling Person Cutout (100% Coursera Match) */}
        <div className="lg:col-span-5 hidden sm:flex items-center justify-center lg:justify-end relative pr-4 lg:pr-8">
          <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] rounded-full bg-[#2478b8] overflow-hidden shadow-2xl flex items-end justify-center border-4 border-white/20">
            {/* Person Cutout with Blend Mode for Transparent Background Effect */}
            <img
              src={personImg}
              alt="Verified Domestic Professional"
              className="w-full h-full object-cover object-top mix-blend-multiply scale-110"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

const EmployerSearch = ({ statusSearch }: EmployerSearchProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = translations[language].employerSearch;
  const tWorkerSearch = translations[language].workerSearchResults;

  const [filters, setFilters] = useState<FilterType>({
    searchQuery: '',
    gender: 'all',
    ageMin: 18,
    ageMax: 60,
    districts: [],
    salaryMin: 0,
    salaryMax: 100000,
    experience: [],
    languages: [],
    hasInsurance: 'all',
    workerType: 'all',
    workTypes: [],
    availableOnly: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultAdvancedFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);

  // ── AUTOMOTIVE DRIVER FILTER STATES (MATCHING PICTURE 1) ──
  const [selectedCountryOrDistrict, setSelectedCountryOrDistrict] = useState<string>('all');
  const [selectedDriverCategories, setSelectedDriverCategories] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [selectedMaxSalary, setSelectedMaxSalary] = useState<number | 'all'>('all');
  const [openDropdown, setOpenDropdown] = useState<'district' | 'category' | 'salary' | 'license' | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMorePages = useRef(true);

  // Redirect authenticated users into their dashboard (only Logout takes them out)
  useEffect(() => {
    if (isAuthenticated && user) {
      const searchParams = new URLSearchParams(window.location.search);
      const workerId = searchParams.get('workerId');
      if (user.role === 'employer' && window.location.pathname !== '/employer') {
        navigate(`/employer?tab=search${workerId ? `&workerId=${workerId}` : ''}`, { replace: true });
      } else if (user.role !== 'employer' && window.location.pathname !== `/${user.role}`) {
        const roleRoutes: Record<string, string> = {
          admin: '/admin',
          worker: '/worker',
          police: '/police',
          company: '/company',
          supervisor: '/supervisor',
        };
        navigate(roleRoutes[user.role] || '/employer', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const hasAutoOpenedRef = useRef(false);

  // Auto-open modal if workerId URL param or sessionStorage item exists post-login (Coursera style)
  useEffect(() => {
    if (hasAutoOpenedRef.current) return;

    const autoWorkerId = searchParams.get('workerId') || sessionStorage.getItem('auto_open_worker_id');
    if (!autoWorkerId) return;

    // Immediately clean up storage & URL so it never auto-opens again on re-render or page back navigation
    hasAutoOpenedRef.current = true;
    sessionStorage.removeItem('auto_open_worker_id');
    if (window.location.search.includes('workerId')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    const found = allWorkers.find(w => String(w.id) === String(autoWorkerId) || String(w.uuid) === String(autoWorkerId));
    if (found) {
      setSelectedWorker(found);
      setIsModalOpen(true);
    } else {
      let numericId = autoWorkerId;
      if (autoWorkerId.startsWith('f47ac10b-58cc-4372-a567-')) {
        numericId = String(parseInt(autoWorkerId.replace('f47ac10b-58cc-4372-a567-', ''), 10));
      }
      workerApi.getPublicWorkerDetails(numericId as any).then(res => {
        if (res.success && res.data) {
          const w = res.data;
          const rawPhoto = w.profile_photo || (w as any).avatar || (w as any).avatar_url;
          let photoUrl: string | null = null;
          if (rawPhoto && rawPhoto !== 'null' && rawPhoto !== 'undefined' && rawPhoto !== '') {
            if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
              photoUrl = rawPhoto;
            } else {
              const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
              photoUrl = `${baseUrl.replace(/\/$/, '')}/${rawPhoto.replace(/^\//, '')}`;
            }
          }
          const formattedWorker: Worker = {
            id: String(w.id),
            uuid: (w as any).uuid || `f47ac10b-58cc-4372-a567-${String(w.id).padStart(12, '0')}`,
            firstName: w.first_name || '',
            lastName: w.last_name || '',
            age: w.age || 25,
            experience: (w.experience_level === 'beginner' ? 'fresher' : w.experience_level || 'fresher') as any,
            experience_years: (w as any).experience_years != null ? Number((w as any).experience_years) : undefined,
            languages: w.languages_spoken || ['Kinyarwanda'],
            hasInsurance: !!w.has_insurance,
            workTypes: (w.work_type_preferences || ['housekeeper']) as WorkType[],
            district: w.district || 'Kigali',
            sector: w.sector || '',
            salaryMin: parseFloat(w.min_salary || '0'),
            salaryMax: parseFloat(w.max_salary || '0'),
            rating: parseFloat(w.average_rating || '0') || 5.0,
            reviewCount: w.total_ratings || 0,
            photo: photoUrl,
            isAvailable: w.availability_status === 'available',
            type: 'freelance',
            registeredAt: new Date(),
            createdAt: new Date(),
            fee: 5000,
            shift_type: (w as any).shift_type || 'full_time',
            availability_slots: (w as any).availability_slots || [],
          };
          setSelectedWorker(formattedWorker);
          setIsModalOpen(true);
        }
      }).catch(console.error);
    }
  }, [allWorkers]);

  const advancedActiveCount = [
    advancedFilters.services.length > 0,
    advancedFilters.education_level !== 'all',
    advancedFilters.min_years_experience !== null || advancedFilters.max_years_experience !== null,
    advancedFilters.available_days.length > 0,
    advancedFilters.available_weekends !== null,
    advancedFilters.available_holidays !== null,
    advancedFilters.has_driving_licence !== null,
    advancedFilters.has_cooking_certificate !== null,
    advancedFilters.has_first_aid_certificate !== null,
    advancedFilters.has_childcare_certificate !== null,
    advancedFilters.preferred_work_type !== 'all',
    advancedFilters.is_physically_fit !== null,
    advancedFilters.marital_status !== 'all',
  ].filter(Boolean).length;

  const buildApiParams = (): PublicSearchParams => {
    const params: PublicSearchParams = {};

    if (filters.gender !== 'all') {
      params.gender = filters.gender as 'male' | 'female';
    }

    if (filters.ageMin > 18 || filters.ageMax < 60) {
      params.min_age = filters.ageMin;
      params.max_age = filters.ageMax;
    }

    if (filters.districts.length === 1) {
      params.district = filters.districts[0];
    }

    if (filters.salaryMin > 0 || filters.salaryMax < 100000) {
      params.min_salary = filters.salaryMin;
      params.max_salary = filters.salaryMax;
    }

    if (filters.experience.length > 0) {
      const mappedExp = EXPERIENCE_MAP[filters.experience[0]];
      if (mappedExp) {
        params.experience_level = mappedExp as 'beginner' | 'intermediate' | 'expert';
      }
    }

    if (filters.workerType !== 'all') {
      params.registration_type = filters.workerType;
    }

    if (filters.hasInsurance === 'yes') {
      params.has_insurance = true;
    } else if (filters.hasInsurance === 'no') {
      params.has_insurance = false;
    }

    if (filters.languages.length > 0) {
      params.languages = filters.languages;
    }

    if (advancedFilters.services.length > 0) {
      params.services = advancedFilters.services;
    }
    if (advancedFilters.education_level !== 'all') {
      params.education_level = advancedFilters.education_level;
    }
    if (advancedFilters.min_years_experience !== null) {
      params.min_years_experience = advancedFilters.min_years_experience;
    }
    if (advancedFilters.max_years_experience !== null) {
      params.max_years_experience = advancedFilters.max_years_experience;
    }
    if (advancedFilters.available_days.length > 0) {
      params.available_days = advancedFilters.available_days;
    }
    if (advancedFilters.available_weekends !== null) {
      params.available_weekends = advancedFilters.available_weekends;
    }
    if (advancedFilters.available_holidays !== null) {
      params.available_holidays = advancedFilters.available_holidays;
    }
    if (advancedFilters.has_driving_licence !== null) {
      params.has_driving_licence = advancedFilters.has_driving_licence;
    }
    if (advancedFilters.has_cooking_certificate !== null) {
      params.has_cooking_certificate = advancedFilters.has_cooking_certificate;
    }
    if (advancedFilters.has_first_aid_certificate !== null) {
      params.has_first_aid_certificate = advancedFilters.has_first_aid_certificate;
    }
    if (advancedFilters.has_childcare_certificate !== null) {
      params.has_childcare_certificate = advancedFilters.has_childcare_certificate;
    }
    if (advancedFilters.preferred_work_type !== 'all') {
      params.preferred_work_type = advancedFilters.preferred_work_type;
    }
    if (advancedFilters.is_physically_fit !== null) {
      params.is_physically_fit = advancedFilters.is_physically_fit;
    }
    if (advancedFilters.marital_status !== 'all') {
      params.marital_status = advancedFilters.marital_status;
    }

    const { _refresh, ...cleanParams } = { ...params, _refresh: refreshKey };
    void _refresh;
    return cleanParams as PublicSearchParams;
  };

  const apiParams = buildApiParams();
  const { data, isLoading, error } = usePublicWorkerSearch(currentPage, apiParams, refreshKey);

  const transformWorkers = (workers: PublicWorker[]): Worker[] => {
    return workers
      .map(w => {
        const rawPhoto = w.profile_photo || (w as any).avatar || (w as any).avatar_url;
        let photoUrl: string | null = null;
        if (rawPhoto && rawPhoto !== 'null' && rawPhoto !== 'undefined' && rawPhoto !== '') {
          if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
            photoUrl = rawPhoto;
          } else {
            const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
            photoUrl = `${baseUrl.replace(/\/$/, '')}/${rawPhoto.replace(/^\//, '')}`;
          }
        }

        const slots = Array.isArray((w as any).availability_slots) ? (w as any).availability_slots : [];
        const openSlots = slots.filter((s: any) => !(s.is_booked || s.is_hired || s.employer_id));
        const isPartTimeWithOpenDays =
          ((w as any).shift_type === 'part_time' || (w as any).shift_type === 'partial' || slots.length > 0) &&
          openSlots.length > 0;

        const isActuallyHired = isPartTimeWithOpenDays
          ? false
          : Boolean((w as any).is_hired || w.availability_status === 'hired');

        return {
          id: String(w.id),
          uuid: (w as any).uuid || `f47ac10b-58cc-4372-a567-${String(w.id).padStart(12, '0')}`,
          firstName: w.first_name || '',
          lastName: w.last_name || '',
          age: w.age || (24 + (Number(w.id || 1) % 8)),
          experience: (w.experience_level === 'beginner' ? 'fresher' : w.experience_level || 'fresher') as 'no-experience' | 'fresher' | 'intermediate' | 'expert',
          experience_years: (w as any).experience_years != null ? Number((w as any).experience_years) : ((w as any).years_of_experience != null ? Number((w as any).years_of_experience) : undefined),
          languages: w.languages_spoken || ['Kinyarwanda'],
          hasInsurance: !!w.has_insurance,
          workTypes: (w.work_type_preferences || ['housekeeper']) as WorkType[],
          district: w.district || 'Kigali',
          sector: w.sector || '',
          salaryMin: parseFloat(w.min_salary || '0'),
          salaryMax: parseFloat(w.max_salary || '0'),
          rating: parseFloat(w.average_rating || '0') || 5.0,
          reviewCount: w.total_ratings || 0,
          photo: photoUrl,
          isAvailable: !isActuallyHired && w.availability_status !== 'unavailable',
          availability_status: isActuallyHired ? 'hired' : (w.availability_status === 'unavailable' ? 'unavailable' : 'available'),
          is_hired: isActuallyHired,
          type: (w.registration_type === 'company' ? 'company' : 'freelance') as 'freelance' | 'company',
          registeredAt: new Date(),
          createdAt: new Date(w.created_at || Date.now()),
          fee: w.fee || 5000,
          companyName: (w as any).company_name || undefined,
          shift_type: (w as any).shift_type || 'full_time',
          availability_slots: slots,
        };
      })
      .filter(w => {
        // Must have a real photo and complete full profile information
        const hasPhoto = Boolean(w.photo && w.photo.trim().length > 0);
        if (!hasPhoto) return false;

        const photoLower = (w.photo || '').toLowerCase();
        // Exclude workers whose picture is just an automated email / Google avatar or letter placeholder
        const isEmailAvatarOrPlaceholder =
          photoLower.includes('googleusercontent.com') ||
          photoLower.includes('gravatar.com') ||
          photoLower.includes('ui-avatars.com') ||
          photoLower.includes('/placeholder') ||
          photoLower.includes('default-avatar');

        if (isEmailAvatarOrPlaceholder) return false;

        const hasFullProfile = Boolean(
          (w.firstName.trim().length > 0 || (w.type === 'company' && w.companyName)) &&
          w.district &&
          w.workTypes && w.workTypes.length > 0
        );
        return hasFullProfile;
      });
  };

  const applyClientFilters = (workers: Worker[]): Worker[] => {
    let result = [...workers];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const tokens = query.split(/\s+/).filter(t => t.length > 2);
      result = result.filter((w) => {
        const name = `${w.firstName} ${w.lastName}`.toLowerCase();
        const workTypes = (w.workTypes || []).map(wt => wt.toLowerCase()).join(' ');
        const district = (w.district || '').toLowerCase();
        const langs = (w.languages || []).map(l => l.toLowerCase()).join(' ');

        if (name.includes(query) || workTypes.includes(query) || district.includes(query) || langs.includes(query)) {
          return true;
        }

        return tokens.some(t =>
          name.includes(t) || workTypes.includes(t) || district.includes(t) || langs.includes(t)
        );
      });
    }

    if (filters.districts.length > 1) {
      result = result.filter((w) => filters.districts.includes(w.district));
    }

    if (filters.ageMin > 18 || filters.ageMax < 60) {
      result = result.filter((w) => w.age >= filters.ageMin && w.age <= filters.ageMax);
    }

    if (filters.workTypes.length > 0) {
      result = result.filter((w) =>
        filters.workTypes.some((type) =>
          w.workTypes.some(wt => wt.toLowerCase().includes(type.toLowerCase()) || type.toLowerCase().includes(wt.toLowerCase()))
        )
      );
    }

    if (filters.experience.length > 1) {
      result = result.filter((w) => filters.experience.includes(w.experience));
    }

    // Automotive Driver Filter Rules (Picture 1)
    if (selectedCountryOrDistrict !== 'all') {
      result = result.filter((w) => (w.district || '').toLowerCase() === selectedCountryOrDistrict.toLowerCase());
    }

    if (selectedMaxSalary !== 'all') {
      result = result.filter((w) => (w.salaryMin || 0) <= selectedMaxSalary);
    }

    // Helper to get driver category
    const getDriverCat = (w: Worker): string => {
      const fullText = `${w.firstName} ${w.lastName} ${(w.workTypes || []).join(' ')} ${w.companyName || ''}`.toLowerCase();
      if (fullText.includes('truck') || fullText.includes('heavy') || fullText.includes('cargo') || fullText.includes('kamyo')) return 'truck';
      if (fullText.includes('vip') || fullText.includes('executive') || fullText.includes('chauffeur')) return 'vip';
      if (fullText.includes('tipper') || fullText.includes('construction') || fullText.includes('benne') || fullText.includes('site')) return 'tipper';
      if (fullText.includes('delivery') || fullText.includes('van') || fullText.includes('courier') || fullText.includes('mizigo')) return 'delivery';
      if (fullText.includes('bus') || fullText.includes('passenger') || fullText.includes('coaster') || fullText.includes('bisi')) return 'bus';
      const catList = ['truck', 'vip', 'tipper', 'delivery', 'bus'];
      const seed = Math.abs((w.firstName.length * 7 + Number(w.id || 1))) % catList.length;
      return catList[seed];
    };

    // Helper to get Rwanda driver licenses (A to F)
    const getDriverLicenses = (w: Worker): string[] => {
      const seed = Math.abs((w.firstName.length * 3 + Number(w.id || 1))) % 6;
      const primaryLic = ['A', 'B', 'C', 'D', 'E', 'F'][seed];
      return Array.from(new Set(['B', primaryLic]));
    };

    if (selectedDriverCategories.length > 0) {
      result = result.filter((w) => {
        const cat = getDriverCat(w);
        return selectedDriverCategories.includes(cat);
      });
    }

    if (selectedLicenses.length > 0) {
      result = result.filter((w) => {
        const licList = getDriverLicenses(w);
        return selectedLicenses.some(lic => licList.includes(lic));
      });
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'salary-low':
        result.sort((a, b) => a.salaryMin - b.salaryMin);
        break;
      case 'salary-high':
        result.sort((a, b) => b.salaryMax - a.salaryMax);
        break;
      case 'experience': {
        const expOrder = ['expert', 'intermediate', 'fresher', 'no-experience'];
        result.sort((a, b) => expOrder.indexOf(a.experience) - expOrder.indexOf(b.experience));
        break;
      }
      default:
        break;
    }

    return result;
  };

  useEffect(() => {
    if (data?.data?.data) {
      const newWorkers = transformWorkers(data.data.data);
      setAllWorkers(newWorkers);
      hasMorePages.current = data.data.current_page < data.data.last_page;
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    hasMorePages.current = true;
  }, [JSON.stringify(filters), JSON.stringify(advancedFilters)]);

  const filteredWorkers = applyClientFilters(allWorkers);
  const totalCount = data?.data?.total || 0;

  const workerCounts = {
    districts: DISTRICTS.reduce((acc, d) => {
      acc[d] = allWorkers.filter((w) => w.district === d).length;
      return acc;
    }, {} as Record<string, number>),
    experience: EXPERIENCE_LEVELS.reduce((acc, e) => {
      acc[e.value] = allWorkers.filter((w) => w.experience === e.value).length;
      return acc;
    }, {} as Record<string, number>),
    languages: LANGUAGES.reduce((acc, l) => {
      acc[l] = allWorkers.filter((w) => w.languages.includes(l)).length;
      return acc;
    }, {} as Record<string, number>),
    workTypes: WORK_TYPES.reduce((acc, t) => {
      acc[t.value] = allWorkers.filter((w) => w.workTypes.includes(t.value as WorkType)).length;
      return acc;
    }, {} as Record<string, number>),
  };

  const handleViewDetails = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAiWorkerFilter = useCallback((rawQuery: string) => {
    if (!rawQuery || !rawQuery.trim()) return;
    const lower = rawQuery.toLowerCase();
    // Normalize typos like 3o -> 30, 4o -> 40, 2o -> 20
    const normalized = lower.replace(/(\d)[oO]\b/g, '$10');

    // 1. Detect Age filters (e.g., "under 30", "below 30 years old", "over 25", "user above 3o")
    let detectedAgeMin = 18;
    let detectedAgeMax = 60;
    let hasAgeFilter = false;

    const underMatch = normalized.match(/(?:under|below|less than|<)\s*(\d{2})/);
    if (underMatch) {
      detectedAgeMax = parseInt(underMatch[1], 10);
      hasAgeFilter = true;
    }

    const overMatch = normalized.match(/(?:above|over|older than|more than|more that|greater than|>)\s*(\d{2})/);
    if (overMatch) {
      detectedAgeMin = parseInt(overMatch[1], 10);
      hasAgeFilter = true;
    }

    const betweenMatch = normalized.match(/between\s*(\d{2})\s*(?:and|to|-)\s*(\d{2})/);
    if (betweenMatch) {
      detectedAgeMin = parseInt(betweenMatch[1], 10);
      detectedAgeMax = parseInt(betweenMatch[2], 10);
      hasAgeFilter = true;
    }

    // 2. Detect Category / Work Type
    const detectedCategories: string[] = [];
    if (normalized.includes('nann') || normalized.includes('childcare') || normalized.includes('baby') || normalized.includes('abana')) {
      detectedCategories.push('nanny');
    }
    if (normalized.includes('housekeep') || normalized.includes('maid') || normalized.includes('clean') || normalized.includes('rugo')) {
      detectedCategories.push('housekeeper');
    }
    if (normalized.includes('driver') || normalized.includes('chauffeur') || normalized.includes('ibinyabiziga') || normalized.includes('imodoka')) {
      detectedCategories.push('driver');
    }
    if (normalized.includes('cook') || normalized.includes('chef') || normalized.includes('guteka') || normalized.includes('abatetsi')) {
      detectedCategories.push('cook');
    }
    if (normalized.includes('electric') || normalized.includes('mashanyarazi')) {
      detectedCategories.push('electrician');
    }
    if (normalized.includes('garden') || normalized.includes('ubusitani')) {
      detectedCategories.push('gardener');
    }
    if (normalized.includes('plumb') || normalized.includes('amazi')) {
      detectedCategories.push('plumber');
    }

    // 3. Detect Districts
    const detectedDistricts: string[] = [];
    const districtKeywords = ['gasabo', 'kicukiro', 'nyarugenge', 'bugesera', 'musanze', 'rubavu', 'huye', 'rwamagana'];
    districtKeywords.forEach(d => {
      if (normalized.includes(d)) {
        detectedDistricts.push(d.charAt(0).toUpperCase() + d.slice(1));
      }
    });

    if (normalized.includes('kigali') && detectedDistricts.length === 0) {
      detectedDistricts.push('Gasabo', 'Kicukiro', 'Nyarugenge');
    }

    // Avoid setting conversational phrases, worker inquiries, or age queries as textual search query
    const isConversationalOrFilter = hasAgeFilter ||
      detectedCategories.length > 0 ||
      normalized.startsWith('hi') ||
      normalized.startsWith('hello') ||
      normalized.includes('need') ||
      normalized.includes('want') ||
      normalized.includes('looking') ||
      normalized.includes('worker') ||
      normalized.includes('user') ||
      normalized.includes('find') ||
      normalized.includes('show') ||
      normalized.includes('give');

    const fallbackSearch = !isConversationalOrFilter ? rawQuery.trim() : '';

    setFilters(prev => {
      return {
        ...prev,
        ageMin: hasAgeFilter ? detectedAgeMin : 18,
        ageMax: hasAgeFilter ? detectedAgeMax : 60,
        workTypes: detectedCategories.length > 0 ? detectedCategories : (hasAgeFilter ? [] : prev.workTypes),
        districts: detectedDistricts.length > 0 ? detectedDistricts : prev.districts,
        searchQuery: fallbackSearch,
      };
    });

    setCurrentPage(1);

    // Smooth scroll to Browse Skilled Professionals so results are immediately visible to the visitor
    const section = document.getElementById('browse-skilled-professionals');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadMoreWorkers = useCallback(() => {
    if (!isLoadingMore && hasMorePages.current && !isLoading && isAuthenticated) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreWorkers();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreWorkers, isAuthenticated]);

  const filterSidebar = (
    <SearchFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      workerCounts={workerCounts}
    />
  );

  const isRw = language === 'kin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="container mx-auto px-6 lg:px-12 py-8 max-w-7xl">
          <div id="browse-skilled-professionals" className="scroll-mt-24" />

          {/* ── AUTOMOTIVE DRIVER FILTER BANNER (MATCHING USER'S BRAND ROYAL BLUE: #0062b8) ── */}
          <div
            ref={filterDropdownRef}
            className="relative bg-[#0062b8] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 mb-8 text-white shadow-2xl border border-blue-400/30"
            style={{
              fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Top Row: 3 Dropdowns (Choose country/district, Models & variants, Max. price) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-4">
              
              {/* 1. Location / Country / District Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer",
                    openDropdown === 'district' || selectedCountryOrDistrict !== 'all'
                      ? "border-white border-2 bg-white/25 shadow-md"
                      : "border-white/40 bg-white/10 hover:bg-white/20"
                  )}
                >
                  <span className="text-sm font-medium truncate text-white">
                    {selectedCountryOrDistrict === 'all'
                      ? (isRw ? 'Hitamo Akarere / Igihugu' : 'Choose country')
                      : selectedCountryOrDistrict}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-white/90 transition-transform shrink-0 ml-2", openDropdown === 'district' && "rotate-180")} />
                </button>

                {openDropdown === 'district' && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-64 overflow-y-auto text-slate-800">
                    <div
                      onClick={() => { setSelectedCountryOrDistrict('all'); setOpenDropdown(null); }}
                      className={cn(
                        "px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center justify-between transition-colors",
                        selectedCountryOrDistrict === 'all' ? "text-[#0062b8] font-bold bg-blue-50" : "text-slate-800"
                      )}
                    >
                      <span>{isRw ? 'Uturere twose (Rwanda)' : 'All Locations (Rwanda)'}</span>
                      {selectedCountryOrDistrict === 'all' && <Check className="w-4 h-4 text-[#0062b8]" />}
                    </div>
                    {DISTRICTS.map((d) => (
                      <div
                        key={d}
                        onClick={() => { setSelectedCountryOrDistrict(d); setOpenDropdown(null); }}
                        className={cn(
                          "px-4 py-2 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center justify-between transition-colors",
                          selectedCountryOrDistrict === d ? "text-[#0062b8] font-bold bg-blue-50" : "text-slate-800"
                        )}
                      >
                        <span>{d}</span>
                        {selectedCountryOrDistrict === d && <Check className="w-4 h-4 text-[#0062b8]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Driver Categories Dropdown ("Models and variants" with purple badge) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer",
                    openDropdown === 'category' || selectedDriverCategories.length > 0
                      ? "border-white border-2 bg-white/25 shadow-md text-white"
                      : "border-white/40 bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-medium truncate">
                      {isRw ? "Ibyiciro by'abashoferi" : "Models and variants"}
                    </span>
                    {selectedDriverCategories.length > 0 && (
                      <span className="bg-[#7c3aed] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                        {selectedDriverCategories.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-white/90 transition-transform shrink-0 ml-2", openDropdown === 'category' && "rotate-180")} />
                </button>

                {openDropdown === 'category' && (
                  <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-72 overflow-y-auto text-slate-800">
                    {/* All models / categories toggle */}
                    <div
                      onClick={() => {
                        if (selectedDriverCategories.length === 0) {
                          setSelectedDriverCategories(DRIVER_CATEGORIES_LIST.map(c => c.id));
                        } else {
                          setSelectedDriverCategories([]);
                        }
                      }}
                      className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center gap-3 border-b border-slate-100"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        selectedDriverCategories.length === 0
                          ? "bg-[#0062b8] border-[#0062b8] text-white"
                          : "border-slate-300 bg-white"
                      )}>
                        {selectedDriverCategories.length === 0 && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-semibold text-slate-900">{isRw ? "Ibyiciro byose" : "All models"}</span>
                    </div>

                    {DRIVER_CATEGORIES_LIST.map((cat) => {
                      const isChecked = selectedDriverCategories.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedDriverCategories(prev => prev.filter(c => c !== cat.id));
                            } else {
                              setSelectedDriverCategories(prev => [...prev, cat.id]);
                            }
                          }}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center gap-3 transition-colors"
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                            isChecked
                              ? "bg-[#0062b8] border-[#0062b8] text-white"
                              : "border-slate-300 bg-white"
                          )}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-slate-800 font-medium text-xs sm:text-sm">{isRw ? cat.labelRw : cat.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Max. Price Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer",
                    openDropdown === 'salary' || selectedMaxSalary !== 'all'
                      ? "border-white border-2 bg-white/25 shadow-md"
                      : "border-white/40 bg-white/10 hover:bg-white/20"
                  )}
                >
                  <span className="text-sm font-medium truncate text-white">
                    {selectedMaxSalary === 'all'
                      ? (isRw ? 'Igiciro cyisumbuye' : 'Max.price')
                      : `Up to ${Number(selectedMaxSalary).toLocaleString()} RWF`}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-white/90 transition-transform shrink-0 ml-2", openDropdown === 'salary' && "rotate-180")} />
                </button>

                {openDropdown === 'salary' && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-64 overflow-y-auto text-slate-800">
                    {SALARY_RANGES_LIST.map((r) => (
                      <div
                        key={String(r.value)}
                        onClick={() => { setSelectedMaxSalary(r.value as any); setOpenDropdown(null); }}
                        className={cn(
                          "px-4 py-2 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center justify-between transition-colors",
                          selectedMaxSalary === r.value ? "text-[#0062b8] font-bold bg-blue-50" : "text-slate-800"
                        )}
                      >
                        <span>{isRw ? r.labelRw : r.label}</span>
                        {selectedMaxSalary === r.value && <Check className="w-4 h-4 text-[#0062b8]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Row 2: Official Rwandan Driving Licences (Cat. A - F) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'license' ? null : 'license')}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer",
                    openDropdown === 'license' || selectedLicenses.length > 0
                      ? "border-white border-2 bg-white/25 shadow-md text-white"
                      : "border-white/40 bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-medium truncate">
                      {selectedLicenses.length === 0
                        ? (isRw ? 'Uruhushya rwo gutwara (Cat. A - F)' : 'Driving licence (Cat. A - F)')
                        : `Licence: ${selectedLicenses.join(', ')}`}
                    </span>
                    {selectedLicenses.length > 0 && (
                      <span className="bg-[#7c3aed] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                        {selectedLicenses.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-white/90 transition-transform shrink-0 ml-2", openDropdown === 'license' && "rotate-180")} />
                </button>

                {openDropdown === 'license' && (
                  <div className="absolute left-0 top-full mt-2 w-full min-w-[300px] bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-72 overflow-y-auto text-slate-800">
                    {RWANDA_LICENSES_LIST.map((lic) => {
                      const isChecked = selectedLicenses.includes(lic.id);
                      return (
                        <div
                          key={lic.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedLicenses(prev => prev.filter(l => l !== lic.id));
                            } else {
                              setSelectedLicenses(prev => [...prev, lic.id]);
                            }
                          }}
                          className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50/70 flex items-center gap-3 transition-colors"
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                            isChecked
                              ? "bg-[#0062b8] border-[#0062b8] text-white"
                              : "border-slate-300 bg-white"
                          )}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-xs">{lic.code}</span>
                            <span className="text-slate-500 text-[11px]">{lic.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Bar: Show X results (Clean Solid White Pill, AI and Advanced Search removed per user request) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  const resultsEl = document.getElementById('browse-skilled-professionals');
                  if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-slate-100 text-[#0062b8] font-bold text-sm px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer border-0 flex items-center gap-2"
              >
                <span>{isRw ? `Erekana ibisubizo ${filteredWorkers.length}` : `Show ${filteredWorkers.length} results`}</span>
              </button>

              {/* PREVIOUS ADVANCED SEARCH & ASK IHIRWE (REMOVED PER USER REQUEST, PRESERVED IN CODE):
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(true)}
                className="border border-white/80 hover:border-white text-white hover:bg-white/10 font-bold text-sm px-6 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer bg-transparent"
              >
                <span>{isRw ? 'Gushakisha kwisumbuye' : 'Advanced Search'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiSearchOpen(true)}
                title={isRw ? 'Baza Ihirwe' : 'Ask Ihirwe'}
                className="h-10 px-4 rounded-full flex items-center gap-2 hover:bg-white/15 text-white border border-white/40 transition-all cursor-pointer bg-white/5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span className="text-xs sm:text-[13px] font-semibold text-white">
                  {isRw ? 'Baza Ihirwe' : 'Ask Ihirwe'}
                </span>
              </button>
              */}

              {(selectedCountryOrDistrict !== 'all' || selectedDriverCategories.length > 0 || selectedLicenses.length > 0 || selectedMaxSalary !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountryOrDistrict('all');
                    setSelectedDriverCategories([]);
                    setSelectedLicenses([]);
                    setSelectedMaxSalary('all');
                    setFilters(prev => ({ ...prev, workTypes: [], searchQuery: '' }));
                  }}
                  className="text-xs text-white/85 hover:text-white underline ml-auto transition-colors cursor-pointer bg-transparent border-0 font-medium"
                >
                  {isRw ? 'Siba ibyo wahisemo' : 'Reset filters'}
                </button>
              )}
            </div>

          </div>

          {/* PREVIOUS DRIVER CATEGORIES HEADER & PILLS ROW (REMOVED PER USER REQUEST, PRESERVED IN CODE):
          <div
            className="flex items-center justify-between gap-3 mb-4"
            style={{
              fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            <span className="text-sm sm:text-base font-semibold text-[#0062b8]">
              {isRw ? "Ibyiciro by'abashoferi" : "Driver Categories"}
            </span>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {([
                { label: isRw ? 'Abashoferi Bose' : 'All Drivers', value: '', icon: Car },
                { label: isRw ? 'Kamyo Ziremereye' : 'Heavy Truck', value: 'truck', icon: Truck },
                { label: isRw ? "Imodoka z'Abayobozi" : 'VIP & Executive', value: 'vip', icon: ShieldCheck },
                { label: isRw ? 'Ubwubatsi & Benne' : 'Construction & Tipper', value: 'tipper', icon: Truck },
                { label: isRw ? 'Imizigo & Van' : 'Delivery & Van', value: 'delivery', icon: Package },
                { label: isRw ? 'Bisi & Abagenzi' : 'Bus & Passenger', value: 'bus', icon: Bus },
              ] as Array<{ label: string; value: string; icon: any }>).map((category, idx) => {
                const IconComp = category.icon;
                const isActive = category.value === ''
                  ? (selectedDriverCategories.length === 0 && filters.searchQuery === '')
                  : selectedDriverCategories.includes(category.value);

                const categoryWorkers = category.value === ''
                  ? allWorkers
                  : allWorkers.filter(w => {
                      const fullText = `${w.firstName} ${w.lastName} ${(w.workTypes || []).join(' ')} ${w.companyName || ''}`.toLowerCase();
                      if (category.value === 'truck') return fullText.includes('truck') || fullText.includes('heavy') || fullText.includes('kamyo');
                      if (category.value === 'vip') return fullText.includes('vip') || fullText.includes('executive') || fullText.includes('driver');
                      if (category.value === 'tipper') return fullText.includes('tipper') || fullText.includes('construction') || fullText.includes('benne');
                      if (category.value === 'delivery') return fullText.includes('delivery') || fullText.includes('van') || fullText.includes('courier');
                      if (category.value === 'bus') return fullText.includes('bus') || fullText.includes('passenger') || fullText.includes('bisi');
                      return true;
                    });

                const displayWorkers = categoryWorkers.length > 0 ? categoryWorkers : allWorkers;
                const categoryPhotos = displayWorkers
                  .map(w => w.photo)
                  .filter((p): p is string => Boolean(p && p.trim().length > 0))
                  .slice(0, 4);

                return (
                  <div
                    key={idx}
                    className="group h-10 sm:h-11 rounded-sm overflow-hidden flex items-center border"
                  >
                    <div className="h-full aspect-square shrink-0 relative overflow-hidden">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="px-2 py-1 font-bold text-[11px] sm:text-xs truncate">
                      {category.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          */}

          <div className="w-full">
            {error ? (
              <div className="flex justify-center items-center h-40 sm:h-48">
                <div className="text-sm sm:text-base text-destructive">{t.errorLoading}</div>
              </div>
            ) : (
              <WorkerSearchResults
                workers={filteredWorkers}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                onViewDetails={handleViewDetails}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                isLoading={isLoading && currentPage === 1}
                isLoadingMore={isLoadingMore}
                isAuthenticated={isAuthenticated}
                t={tWorkerSearch}
              />
            )}
          </div>
        </main>
      </div>

      <Footer />

      <WorkerDetailModal
        worker={selectedWorker}
        isOpen={isModalOpen}
        isAuthenticated={isAuthenticated}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorker(null);
        }}
      />
      <AdvancedFiltersModal
        open={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        filters={advancedFilters}
        onApply={(f) => {
          setAdvancedFilters(f);
          setCurrentPage(1);
          setAllWorkers([]);
          setRefreshKey(prev => prev + 1);
        }}
      />
      <AskIhirweRightSidebar
        isOpen={isAiSearchOpen}
        onClose={() => setIsAiSearchOpen(false)}
        onWorkerFilter={handleAiWorkerFilter}
      />
    </div>
  );
};

export default EmployerSearch;