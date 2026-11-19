import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRegisterWorker } from '@/hooks/useRegistration';
import type { WorkerRegistrationRequest } from '@/types/auth.types';
import {
  User, Phone, MapPin, Briefcase, Shield,
  CreditCardIcon, Loader2, CheckCircle2, AlertCircle, Globe, Check,
  ArrowRight, ArrowLeft, RotateCcw
} from 'lucide-react';
import { useRegistrationPrefill } from '@/hooks/useRegistration';
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from '@/hooks/useLocations';
import { useCountries } from '@/hooks/useCountries';
import { useNidaCheck, useNidaVerify } from '@/hooks/useNida';
import Select from 'react-select';
import type { MultiValue, SingleValue } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TranslationPath, useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { CloudPhotoUpload } from '@/components/common/CloudPhotoUpload';

interface WorkerRegistrationFormProps {
  onSuccess: () => void;
}

const LANGUAGES = ['Kinyarwanda', 'English', 'French', 'Swahili'];
const WORK_TYPES = ['full_time', 'part_time', 'contract', 'temporary'];
const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'expert', label: 'Expert (3+ years)' },
];
const WORKER_PROFESSIONS = [
  'Housekeeper / Maid',
  'Nanny / Babysitter',
  'Cook / Chef',
  'Driver',
  'Security Guard',
  'Gardener',
  'Electrician',
  'Plumber',
  'Construction Worker / Mason',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Waiter / Waitress',
  'Welder',
  'Tailor',
  'Caregiver / Elderly Care',
  'Mechanic',
  'Accountant / Cashier',
  'IT Support',
  'Other Skills'
];

type InsuranceType = 'MITUELLE_DE_SANTE' | 'OTHERS' | null;
type DocumentType = 'nida' | 'passport';

const SESSION_KEY = 'ihirwe_worker_reg_full_draft';

export const WorkerRegistrationForm = ({ onSuccess }: WorkerRegistrationFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register, handleSubmit, watch, setValue, trigger, formState: { errors },
  } = useForm<WorkerRegistrationRequest>({
    mode: 'onChange'
  });

  const { mutate: registerWorker, isPending } = useRegisterWorker();

  // ── Step Navigation ───────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // ── Document type (Persisted across refresh) ───────────────────────────
  const [documentType, setDocumentType] = useState<DocumentType>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.documentType) return parsed.documentType;
      }
    } catch { }
    return 'nida';
  });
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState<Date | null>(null);
  const [passportReady, setPassportReady] = useState(false);

  // ── Local state ────────────────────────────────────────────────────────
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [selectAllDistricts, setSelectAllDistricts] = useState(false);

  const [hasExistingData, setHasExistingData] = useState(false);
  const [prefillData, setPrefillData] = useState<Record<string, unknown> | null>(null);
  const { mutate: fetchPrefill } = useRegistrationPrefill();

  const [provinceOption, setProvinceOption] = useState<{ value: number; label: string } | null>(null);
  const [districtOption, setDistrictOption] = useState<{ value: number; label: string } | null>(null);
  const [sectorOption, setSectorOption] = useState<{ value: number; label: string } | null>(null);
  const [cellOption, setCellOption] = useState<{ value: number; label: string } | null>(null);
  const [villageOption, setVillageOption] = useState<{ value: number; label: string } | null>(null);

  // NIDA step flags
  const [nidCheckPassed, setNidCheckPassed] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaVerifyField, setNidaVerifyField] = useState<'fullname' | 'date_of_birth'>('fullname');
  const [nidaVerifyValue, setNidaVerifyValue] = useState('');
  const [nidaVerifyDob, setNidaVerifyDob] = useState<Date | null>(null);
  const [nidaError, setNidaError] = useState('');

  const { mutateAsync: nidaCheck, isPending: nidaCheckLoading } = useNidaCheck();
  const { mutate: nidaVerifyMutate, isPending: nidaVerifyLoading } = useNidaVerify();

  const [insuranceType, setInsuranceType] = useState<InsuranceType>(null);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();

  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);
  const { data: allDistrictsData } = useDistricts();
  const { data: countriesData } = useCountries();
  const [countryOption, setCountryOption] = useState<{ value: number; label: string; code?: string } | null>(null);

  const nidWatch = watch('national_id') ?? '';
  const prevNidRef = useRef('');

  // ── Derived: is the identity step complete? ────────────────────────────
  const identityVerified = documentType === 'nida' ? nidaVerified : passportReady;

  // ── Reset document-type-specific state on toggle ───────────────────────
  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    setNidCheckPassed(false);
    setNidaVerified(false);
    setNidaVerifyValue('');
    setNidaVerifyDob(null);
    setNidaError('');
    setValue('national_id', '');
    setValue('first_name', '');
    setValue('last_name', '');
    setValue('gender', '');
    setValue('date_of_birth', '');
    setDateOfBirth(null);
    setPassportNumber('');
    setPassportExpiry(null);
    setCountryOption(null);
    setPassportReady(false);
  };

  // ── Auto-check NID at 16 chars ─────────────────────────────────────────
  useEffect(() => {
    if (documentType !== 'nida') return;
    const current = nidWatch;
    const prev = prevNidRef.current;
    if (current === prev) return;
    prevNidRef.current = current;

    if (nidCheckPassed || nidaVerified) {
      setNidCheckPassed(false);
      setNidaVerified(false);
      setNidaVerifyValue('');
      setNidaVerifyDob(null);
      setNidaError('');
      setValue('first_name', '');
      setValue('last_name', '');
      setValue('gender', '');
      setValue('date_of_birth', '');
      setDateOfBirth(null);
    }
    if (current.length === 16) triggerNidaCheck(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nidWatch, documentType]);

  // ── Session persistence & auto-restore ──────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.currentStep) setCurrentStep(data.currentStep);
      if (data.documentType) setDocumentType(data.documentType);
      if (data.nidaVerified) setNidaVerified(data.nidaVerified);
      if (data.passportReady) setPassportReady(data.passportReady);
      if (data.passportNumber) setPassportNumber(data.passportNumber);
      if (data.passportExpiry) setPassportExpiry(new Date(data.passportExpiry));
      if (data.countryOption) setCountryOption(data.countryOption);

      if (data.formValues) {
        Object.entries(data.formValues).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            setValue(k as keyof WorkerRegistrationRequest, v as any);
          }
        });
      }

      if (data.dateOfBirth) setDateOfBirth(new Date(data.dateOfBirth));
      if (data.selectedProfessions) setSelectedProfessions(data.selectedProfessions);
      if (data.selectedLanguages) setSelectedLanguages(data.selectedLanguages);
      if (data.selectedWorkTypes) setSelectedWorkTypes(data.selectedWorkTypes);
      if (data.selectedDistricts) setSelectedDistricts(data.selectedDistricts);
      if (data.insuranceType) setInsuranceType(data.insuranceType);
      if (data.provinceOption) { setProvinceOption(data.provinceOption); setSelectedProvinceId(data.provinceOption.value); }
      if (data.districtOption) { setDistrictOption(data.districtOption); setSelectedDistrictId(data.districtOption.value); }
      if (data.sectorOption) { setSectorOption(data.sectorOption); setSelectedSectorId(data.sectorOption.value); }
      if (data.cellOption) { setCellOption(data.cellOption); setSelectedCellId(data.cellOption.value); }
      if (data.villageOption) setVillageOption(data.villageOption);
    } catch (e) {
      console.error('Failed to parse saved registration draft:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft state to sessionStorage whenever state changes
  useEffect(() => {
    const draft = {
      currentStep,
      documentType,
      nidaVerified,
      passportReady,
      passportNumber,
      passportExpiry: passportExpiry?.toISOString(),
      countryOption,
      dateOfBirth: dateOfBirth?.toISOString(),
      insuranceType,
      selectedProfessions,
      selectedLanguages,
      selectedWorkTypes,
      selectedDistricts,
      provinceOption,
      districtOption,
      sectorOption,
      cellOption,
      villageOption,
      formValues: {
        national_id: watch('national_id'),
        first_name: watch('first_name'),
        last_name: watch('last_name'),
        gender: watch('gender'),
        phone: watch('phone'),
        email: watch('email'),
        province: watch('province'),
        district: watch('district'),
        sector: watch('sector'),
        cell: watch('cell'),
        village: watch('village'),
        experience_level: watch('experience_level'),
        min_salary: watch('min_salary'),
        max_salary: watch('max_salary'),
        insurance_provider: watch('insurance_provider'),
        insurance_number: watch('insurance_number'),
      }
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(draft));
  }, [
    currentStep, documentType, nidaVerified, passportReady, passportNumber, passportExpiry,
    countryOption, dateOfBirth, insuranceType, selectedLanguages, selectedWorkTypes,
    selectedDistricts, provinceOption, districtOption, sectorOption, cellOption, villageOption,
    watch('national_id'), watch('first_name'), watch('last_name'), watch('gender'),
    watch('phone'), watch('email'), watch('province'), watch('district'), watch('sector'),
    watch('cell'), watch('village'), watch('experience_level'), watch('min_salary'), watch('max_salary')
  ]);

  const handleClearDraft = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentStep(1);
    handleDocumentTypeChange('nida');
    setSelectedLanguages([]);
    setSelectedWorkTypes([]);
    setSelectedProfessions([]);
    setSelectedDistricts([]);
    setInsuranceType(null);
    setProvinceOption(null); setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null);
    setSelectedProvinceId(undefined); setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined);
    toast({ title: "Form Reset", description: "Registration draft cleared successfully." });
  };

  // ── Location cascade ───────────────────────────────────────────────────
  useEffect(() => {
    if (!prefillData?.province || !provincesData) return;
    const match = provincesData.find(p => p.name === prefillData.province);
    if (match) { setProvinceOption({ value: match.id, label: match.name }); setSelectedProvinceId(match.id); setValue('province', match.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provincesData, prefillData]);

  useEffect(() => {
    if (!prefillData?.district || !districtsData) return;
    const match = districtsData.find(d => d.name === prefillData.district);
    if (match) { setDistrictOption({ value: match.id, label: match.name }); setSelectedDistrictId(match.id); setValue('district', match.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtsData, prefillData]);

  useEffect(() => {
    if (!prefillData?.sector || !sectorsData) return;
    const match = sectorsData.find(s => s.name === prefillData.sector);
    if (match) { setSectorOption({ value: match.id, label: match.name }); setSelectedSectorId(match.id); setValue('sector', match.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorsData, prefillData]);

  useEffect(() => {
    if (!prefillData?.cell || !cellsData) return;
    const match = cellsData.find(c => c.name === prefillData.cell);
    if (match) { setCellOption({ value: match.id, label: match.name }); setSelectedCellId(match.id); setValue('cell', match.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellsData, prefillData]);

  useEffect(() => {
    if (!prefillData?.village || !villagesData) return;
    const match = villagesData.find(v => v.name === prefillData.village);
    if (match) { setVillageOption({ value: match.id, label: match.name }); setValue('village', match.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villagesData, prefillData]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const triggerNidaCheck = async (nid: string) => {
    setNidaError('');
    try {
      const json = await nidaCheck(nid);
      if (json.success && json.exists) {
        const field = Math.random() < 0.5 ? 'fullname' : 'date_of_birth';
        setNidaVerifyField(field as 'fullname' | 'date_of_birth');
        setNidaVerifyValue(''); setNidaVerifyDob(null); setNidaError('');
        setNidCheckPassed(true);
      } else {
        setNidaError(json.message || 'NID not found. Please check the number.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setNidaError(err?.response?.data?.message || 'Failed to check NID. Please try again.');
    }
  };

  const handleNidaVerify = () => {
    const nid = watch('national_id');
    setNidaError('');
    const payload: { nid: string; fullname?: string; date_of_birth?: string } = { nid };
    if (nidaVerifyField === 'fullname') {
      payload.fullname = nidaVerifyValue;
    } else {
      payload.date_of_birth = nidaVerifyDob
        ? `${nidaVerifyDob.getFullYear()}-${String(nidaVerifyDob.getMonth() + 1).padStart(2, '0')}-${String(nidaVerifyDob.getDate()).padStart(2, '0')}`
        : '';
    }

    nidaVerifyMutate(payload, {
      onSuccess: (json) => {
        if (json.success && json.verified) {
          const d = json.data;
          const names = (d.fullname || '').split(' ');
          setValue('first_name', names[0] || '');
          setValue('last_name', names.slice(1).join(' ') || '');
          if (d.dob) { const dobDate = new Date(d.dob); setDateOfBirth(dobDate); setValue('date_of_birth', d.dob); }
          if (d.gender) setValue('gender', d.gender.toLowerCase());
          if (d.district) setValue('district', d.district);
          setNidCheckPassed(false);
          setNidaVerified(true);

          fetchPrefill(nid, {
            onSuccess: (res) => {
              if (!res.success || !res.has_existing) return;
              const pd = res.data;
              setHasExistingData(true);
              setPrefillData(pd);
              if (pd.phone) setValue('phone', pd.phone);
              if (pd.email && !pd.email.endsWith('@ihirwe.rw')) setValue('email', pd.email);
              if (pd.experience_level) setValue('experience_level', pd.experience_level);
              if (pd.min_salary) setValue('min_salary', pd.min_salary);
              if (pd.max_salary) setValue('max_salary', pd.max_salary);
              if (pd.languages_spoken) { setSelectedLanguages(pd.languages_spoken); setValue('languages_spoken', pd.languages_spoken); }
              if (pd.work_type_preferences) { 
                const singlePref = Array.isArray(pd.work_type_preferences) && pd.work_type_preferences.length > 0 
                  ? [pd.work_type_preferences[0]] 
                  : (typeof pd.work_type_preferences === 'string' && pd.work_type_preferences ? [pd.work_type_preferences] : ['full_time']);
                setSelectedWorkTypes(singlePref); 
                setValue('work_type_preferences', singlePref); 
              }
              if (pd.preferred_districts) { setSelectedDistricts(pd.preferred_districts); setValue('preferred_districts', pd.preferred_districts); }
              if (pd.insurance_type) handleInsuranceTypeChange(pd.insurance_type);
            },
          });
        } else {
          setNidaError(json.message || 'Verification failed. Please try again.');
        }
      },
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        setNidaError(err?.response?.data?.message || 'Verification failed. Please try again.');
      },
    });
  };

  const handlePassportConfirm = () => {
    if (!passportNumber.trim() || !passportExpiry || !dateOfBirth || !countryOption) return;
    setValue('registration_document_type', 'passport');
    setValue('passport_number', passportNumber.toUpperCase());
    setValue('passport_expiry_date', `${passportExpiry.getFullYear()}-${String(passportExpiry.getMonth() + 1).padStart(2, '0')}-${String(passportExpiry.getDate()).padStart(2, '0')}`);
    setPassportReady(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInsuranceTypeChange = (type: InsuranceType) => {
    setInsuranceType(type);
    setValue('insurance_type', type || undefined);
    if (type === 'MITUELLE_DE_SANTE') {
      setValue('insurance_provider', 'RSSB - Mutuelle de Santé');
      const nid = watch('national_id') || '0000000000000000';
      setValue('insurance_number', `MUT-${nid.substring(0, 8)}`);
    } else if (type === 'OTHERS') {
      setValue('insurance_provider', '');
      setValue('insurance_number', '');
    } else {
      setValue('insurance_provider', undefined);
      setValue('insurance_number', undefined);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (l: string[]) => void,
    field: keyof WorkerRegistrationRequest,
  ) => {
    const next = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setter(next);
    setValue(field, next);
  };

  // ── Step Navigation & Strict Section Validation ───────────────────────
  const validateStep1 = () => {
    if (!identityVerified) {
      toast({
        variant: "destructive",
        title: "Identity Verification Required",
        description: documentType === 'nida'
          ? "Please enter a valid 16-digit National ID and confirm your identity to proceed."
          : "Please complete and confirm your Passport details before proceeding."
      });
      return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    const isFormValid = await trigger(['first_name', 'last_name', 'gender', 'phone', 'password', 'password_confirmation']);
    if (!dateOfBirth) {
      toast({
        variant: "destructive",
        title: "Date of Birth Required",
        description: "Please select your date of birth to proceed."
      });
      return false;
    }
    const phoneVal = watch('phone') || '';
    if (phoneVal.length !== 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits (e.g. 0788000000)."
      });
      return false;
    }
    if (!isFormValid) {
      toast({
        variant: "destructive",
        title: "Incomplete Personal Info",
        description: "Please fill out all required fields in Step 2 before proceeding."
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const prov = watch('province');
    const dist = watch('district');

    if (documentType === 'nida') {
      const sec = watch('sector');
      const cel = watch('cell');
      const vil = watch('village');

      if (!prov || !dist || !sec || !cel || !vil) {
        toast({
          variant: "destructive",
          title: "Location Details Required",
          description: "Please select your complete residence address (Province, District, Sector, Cell, and Village)."
        });
        return false;
      }
    } else {
      if (!prov || !dist) {
        toast({
          variant: "destructive",
          title: "Location Details Required",
          description: "Please select your Province and District of residence in Rwanda."
        });
        return false;
      }
    }
    return true;
  };

  const validateStep4 = () => {
    const exp = watch('experience_level');
    const minSal = watch('min_salary');
    const maxSal = watch('max_salary');

    if (selectedProfessions.length === 0) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select at least one profession or skill that you do." });
      return false;
    }
    if (!exp) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select your experience level." });
      return false;
    }
    if (selectedLanguages.length === 0) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select at least one language spoken." });
      return false;
    }
    if (selectedWorkTypes.length === 0) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select at least one work type preference." });
      return false;
    }
    if (selectedDistricts.length === 0) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select at least one preferred work district." });
      return false;
    }
    if (!minSal || Number(minSal) <= 0) {
      toast({ variant: "destructive", title: "Required Field", description: "Please enter a valid minimum expected salary." });
      return false;
    }
    if (!maxSal || Number(maxSal) < Number(minSal)) {
      toast({ variant: "destructive", title: "Invalid Salary Range", description: "Maximum salary must be greater than or equal to minimum salary." });
      return false;
    }
    if (!insuranceType) {
      toast({ variant: "destructive", title: "Required Field", description: "Please select your health insurance type." });
      return false;
    }
    if (insuranceType === 'OTHERS') {
      const provider = watch('insurance_provider');
      const num = watch('insurance_number');
      if (!provider || !num) {
        toast({ variant: "destructive", title: "Insurance Details Required", description: "Please enter your insurance provider name and number." });
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await validateStep2();
      if (valid) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const onSubmit = (data: WorkerRegistrationRequest) => {
    if (!validateStep4()) return;

    data.registration_document_type = documentType;
    data.professions = selectedProfessions;
    data.skills = selectedProfessions;

    if (documentType === 'nida') {
      data.country_id = 1;
      delete (data as Record<string, unknown>).passport_number;
      delete (data as Record<string, unknown>).nationality;
      delete (data as Record<string, unknown>).passport_expiry_date;
    } else {
      delete (data as Record<string, unknown>).national_id;
    }

    if (hasExistingData && !data.password) {
      const payload = data as WorkerRegistrationRequest & { keep_password: boolean };
      payload.keep_password = true;
      delete payload.password;
      delete payload.password_confirmation;
    }

    registerWorker(data, {
      onSuccess: (response) => {
        sessionStorage.removeItem(SESSION_KEY);
        toast({
          title: "Registration Successful!",
          description: "Your worker account has been created. Verification OTP sent.",
        });
        navigate('/auth/verify-otp', {
          state: {
            phone: response.data?.phone || '',
            resends_remaining: response.data?.otp_resends_remaining || 0,
            role: 'worker',
          },
        });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: err?.response?.data?.message || "An error occurred during worker registration.",
        });
      }
    });
  };

  const cardStyle = {};
  const cardClass = 'bg-transparent border-0 shadow-none p-0';

  const verifyDisabled =
    nidaVerifyLoading ||
    (nidaVerifyField === 'fullname' && !nidaVerifyValue.trim()) ||
    (nidaVerifyField === 'date_of_birth' && !nidaVerifyDob);

  const passportConfirmDisabled =
    !passportNumber.trim() || !passportExpiry || !dateOfBirth || !countryOption;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">

      {/* ── Note Callout Box (Icyitonderwa) ─────────────────────────────── */}
      <div className="bg-[#f4f6f8] border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left mb-2">
        <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
          <strong className="text-slate-900 font-extrabold">Note (Icyitonderwa):</strong>{' '}
          Your worker registration will be verified through NIDA or Passport identity verification. Please ensure all details match your official identification document.
        </p>
      </div>

      {/* ── Multi-Step Progress Indicator ────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-3">
          <span className="uppercase tracking-wider text-slate-500 font-bold">Step {currentStep} of 4</span>
          <div className="flex items-center gap-3">
            <span className="text-[#0073bb] font-black">
              {currentStep === 1 && "1. Identity Verification"}
              {currentStep === 2 && "2. Personal & Account"}
              {currentStep === 3 && "3. Residence Location"}
              {currentStep === 4 && "4. Preferences & Insurance"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-[#0073bb]' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 1: IDENTITY VERIFICATION ───────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Document Type Switcher */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left">
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Nationality / Document Type</label>
              <div className="flex flex-wrap items-center gap-6 py-1">
                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange('nida')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === 'nida' ? (
                    <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0 group-hover:border-slate-700" />
                  )}
                  <span className="font-bold text-sm text-slate-900">Rwandan Citizen (National ID)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDocumentTypeChange('passport')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {documentType === 'passport' ? (
                    <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-slate-400 bg-transparent shrink-0 group-hover:border-slate-700" />
                  )}
                  <span className="font-bold text-sm text-slate-900">Foreign Worker (Passport)</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* NIDA Card */}
          {documentType === 'nida' && (
            <Card style={cardStyle} className={cardClass}>
              <CardContent className="p-0 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base font-extrabold text-[#2b2b2b]">
                    {t('registration.worker.personalInfo.nationalId')} *
                  </h3>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1">
                    <input
                      id="national_id"
                      {...register('national_id')}
                      onChange={(e) => {
                        const cleanDigits = e.target.value.replace(/\D/g, '');
                        setValue('national_id', cleanDigits);
                        if (cleanDigits.length !== 16) {
                          setNidCheckPassed(false);
                          setNidaVerified(false);
                        }
                      }}
                      maxLength={16}
                      disabled={nidaVerified}
                      className={[
                        "w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none",
                        nidWatch.length > 0 && nidWatch.length < 16 ? 'border-red-500' : '',
                        nidaVerified ? 'bg-slate-100 cursor-not-allowed border-emerald-400' : '',
                      ].join(' ')}
                    />
                    {nidWatch.length > 0 && nidWatch.length < 16 && (
                      <p className="text-xs text-red-500 font-semibold mt-1">{t('registration.worker.personalInfo.nationalIdLength')}</p>
                    )}
                  </div>

                  {/* COURSERA BLUE VERIFIED BADGE */}
                  {nidaVerified && (
                    <Badge variant="default" className="px-3.5 py-3 rounded-xl gap-1.5 shrink-0 bg-[#0073bb] text-white font-bold text-xs shadow-xs">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </Badge>
                  )}

                  {nidaCheckLoading && (
                    <div className="mt-2 shrink-0"><Loader2 className="h-5 w-5 animate-spin text-[#0073bb]" /></div>
                  )}
                </div>

                {/* NIDA verify expand (Only opens if 16 digits are valid and checked) */}
                <div className={['overflow-hidden transition-all duration-500 ease-in-out', nidCheckPassed && nidWatch.length === 16 ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'].join(' ')}>
                  <div className="border-t border-slate-200/80 pt-4 space-y-4">
                    <div className="flex items-start gap-2.5 p-3.5 bg-[#f4f6f8] border border-slate-200 rounded-xl">
                      <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
                        {nidaVerifyField === 'fullname'
                          ? `${t('registration.worker.personalInfo.nidaNameCheck')}.`
                          : t('registration.worker.personalInfo.nidaDobCheck')}
                      </p>
                    </div>

                    {nidaVerifyField === 'fullname' ? (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{t('registration.worker.personalInfo.name')} *</label>
                        <input
                          value={nidaVerifyValue}
                          onChange={e => setNidaVerifyValue(e.target.value)}
                          autoFocus
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">{t('registration.worker.personalInfo.dob')} *</label>
                        <DatePicker
                          selected={nidaVerifyDob}
                          onChange={(date: Date | null) => setNidaVerifyDob(date)}
                          dateFormat="dd/MM/yyyy"
                          showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                          maxDate={new Date()}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20"
                          wrapperClassName="w-full" autoFocus
                        />
                      </div>
                    )}

                    {nidaError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <p className="text-xs font-semibold text-red-600">{nidaError}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleNidaVerify}
                        disabled={verifyDisabled}
                        className={`px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs border-0 ${verifyDisabled
                            ? "bg-[#d1d5db] text-slate-600 cursor-not-allowed"
                            : "bg-[#0073bb] hover:bg-[#005f9e] text-white"
                          }`}
                      >
                        {nidaVerifyLoading ? t('registration.worker.personalInfo.verifying') : t('registration.worker.personalInfo.verifyIdentity')}
                      </button>
                    </div>
                  </div>
                </div>

                {nidaError && !nidCheckPassed && (
                  <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-xs font-semibold text-red-600">{nidaError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Passport Path */}
          {documentType === 'passport' && (
            <Card style={cardStyle} className={cardClass}>
              <CardContent className="p-0 text-left space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-extrabold text-[#2b2b2b]">Passport Details</h3>
                </div>

                {passportReady ? (
                  <div className="flex items-center justify-between gap-2 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl font-semibold text-slate-800 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0073bb] shrink-0" />
                      <span className="font-bold">{passportNumber.toUpperCase()}</span>
                      <span className="text-slate-400">·</span>
                      <span>{countryOption?.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassportReady(false)}
                      className="text-xs font-bold underline text-[#0073bb] hover:text-[#005f9e]"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Passport Number *</label>
                      <input
                        value={passportNumber}
                        onChange={e => setPassportNumber(e.target.value.toUpperCase())}
                        maxLength={20}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">Passport Expiry Date *</label>
                        <DatePicker
                          selected={passportExpiry}
                          onChange={(date: Date | null) => setPassportExpiry(date)}
                          dateFormat="dd/MM/yyyy"
                          minDate={new Date()}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20"
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">Date of Birth *</label>
                        <DatePicker
                          selected={dateOfBirth}
                          onChange={(date: Date | null) => setDateOfBirth(date)}
                          dateFormat="dd/MM/yyyy"
                          showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20"
                          wrapperClassName="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Country *</label>
                      <Select
                        value={countryOption}
                        options={countriesData?.map(c => ({ value: c.id, label: c.name, code: c.code })) || []}
                        formatOptionLabel={(option: { value: number; label: string; code?: string }) => (
                          <div className="flex items-center gap-2.5">
                            {option.code && (
                              <img
                                src={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png`}
                                alt={option.label}
                                className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shadow-xs flex-shrink-0"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            )}
                            <span className="font-medium text-slate-800">{option.label}</span>
                          </div>
                        )}
                        onChange={(opt: SingleValue<{ value: number; label: string; code?: string }>) => {
                          setCountryOption(opt ?? null);
                          if (opt) setValue('country_id', opt.value);
                        }}
                        placeholder="Search country..."
                        isClearable
                        isSearchable
                        className="react-select-container text-sm font-medium"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handlePassportConfirm}
                        disabled={passportConfirmDisabled}
                        className={`px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${passportConfirmDisabled
                            ? "bg-[#d1d5db] text-slate-600 cursor-not-allowed"
                            : "bg-[#0073bb] hover:bg-[#005f9e] text-white"
                          }`}
                      >
                        Confirm Passport Details
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 1 NEXT BUTTON */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!identityVerified}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs border-0 ${!identityVerified
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-[#0073bb] hover:bg-[#005f9e] text-white"
                }`}
            >
              <span>Next: Personal & Account Info</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 2: PERSONAL & ACCOUNT INFORMATION ───────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Personal Info Card */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t('registration.worker.personalInfo.title')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.firstName')} *</label>
                  <input
                    id="first_name"
                    {...register('first_name', { required: t('registration.worker.personalInfo.firstNameRequired') })}
                    readOnly={documentType === 'nida'}
                    disabled={documentType === 'nida'}
                    className={documentType === 'nida' ? 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm' : 'w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] text-sm font-medium text-slate-800 bg-white'}
                  />
                  {errors.first_name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.lastName')} *</label>
                  <input
                    id="last_name"
                    {...register('last_name', { required: t('registration.worker.personalInfo.lastNameRequired') })}
                    readOnly={documentType === 'nida'}
                    disabled={documentType === 'nida'}
                    className={documentType === 'nida' ? 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm' : 'w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] text-sm font-medium text-slate-800 bg-white'}
                  />
                  {errors.last_name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.gender')} *</label>
                  <select
                    id="gender"
                    {...register('gender', { required: t('registration.worker.personalInfo.genderRequired') })}
                    className={['w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm', documentType === 'nida' ? 'bg-slate-100 cursor-not-allowed' : 'bg-white border-slate-300'].join(' ')}
                    disabled={documentType === 'nida'}
                  >
                    <option value="">{t('registration.worker.personalInfo.selectGender')}</option>
                    <option value="male">{t('registration.worker.personalInfo.male')}</option>
                    <option value="female">{t('registration.worker.personalInfo.female')}</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500 font-semibold mt-1">{errors.gender.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.dateOfBirth')} *</label>
                  <DatePicker
                    selected={dateOfBirth}
                    onChange={documentType === 'passport' ? (d) => setDateOfBirth(d) : () => { }}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    className={['w-full px-4 py-3 border rounded-xl text-sm font-medium', documentType === 'nida' ? 'bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200' : 'bg-white border-slate-300 text-slate-800'].join(' ')}
                    wrapperClassName="w-full"
                    readOnly={documentType === 'nida'}
                    disabled={documentType === 'nida'}
                  />
                </div>
              </div>

              <div>
                <CloudPhotoUpload
                  label={t('registration.worker.personalInfo.photo')}
                  photoPreview={photoPreview}
                  onPhotoChange={(_file, previewUrl) => setPhotoPreview(previewUrl)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t('registration.worker.accountInfo.title')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.accountInfo.phone')} *</label>
                  <input id="phone" {...register('phone', { required: t('registration.worker.accountInfo.phoneRequired') })} maxLength={10} minLength={10} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.accountInfo.email')} <span className="text-slate-400 font-medium text-xs ml-1">(optional)</span></label>
                  <input id="email" type="email" {...register('email')} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.accountInfo.password')} {!hasExistingData && '*'}</label>
                  {hasExistingData && <p className="text-xs text-slate-500 mb-1">Leave blank to keep existing password</p>}
                  <input
                    id="password" type="password"
                    {...register('password', {
                      required: hasExistingData ? false : t('registration.worker.accountInfo.passwordRequired'),
                      minLength: { value: 8, message: t('registration.worker.accountInfo.passwordLength') },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                  />
                  {errors.password && <p className="text-xs text-red-500 font-semibold mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.accountInfo.confirmPassword')} {!hasExistingData && '*'}</label>
                  <input
                    id="password_confirmation" type="password"
                    {...register('password_confirmation', {
                      required: hasExistingData ? false : t('registration.worker.accountInfo.confirmRequired'),
                      validate: v => !v || v === watch('password') || t('registration.worker.accountInfo.passwordMismatch'),
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                  />
                  {errors.password_confirmation && <p className="text-xs text-red-500 font-semibold mt-1">{errors.password_confirmation.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2 NAV BUTTONS */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#0073bb] hover:bg-[#005f9e] text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs border-0"
            >
              <span>Next: Residence Location</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 3: RESIDENCE LOCATION ───────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t('registration.worker.location.title')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.location.province')} *</label>
                  <Select
                    value={provinceOption}
                    options={provincesData?.map(p => ({ value: p.id, label: p.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      if (opt) { setProvinceOption(opt); setSelectedProvinceId(opt.value); setValue('province', opt.label); setDistrictOption(null); setSelectedDistrictId(undefined); setSectorOption(null); setSelectedSectorId(undefined); setCellOption(null); setSelectedCellId(undefined); setVillageOption(null); setValue('district', ''); setValue('sector', ''); setValue('cell', ''); setValue('village', ''); }
                      else { setProvinceOption(null); setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null); setSelectedProvinceId(undefined); setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined); setValue('province', ''); setValue('district', ''); setValue('sector', ''); setValue('cell', ''); setValue('village', ''); }
                    }}
                    placeholder={t('registration.worker.location.selectProvince')} isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.location.district')} *</label>
                  <Select
                    value={districtOption}
                    options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      if (opt) { setDistrictOption(opt); setSelectedDistrictId(opt.value); setValue('district', opt.label); setSectorOption(null); setSelectedSectorId(undefined); setCellOption(null); setSelectedCellId(undefined); setVillageOption(null); setValue('sector', ''); setValue('cell', ''); setValue('village', ''); }
                      else { setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null); setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined); setValue('district', ''); setValue('sector', ''); setValue('cell', ''); setValue('village', ''); }
                    }}
                    placeholder={t('registration.worker.location.selectDistrict')} isDisabled={!selectedProvinceId} isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.location.sector')} *</label>
                  <Select
                    value={sectorOption}
                    options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      if (opt) { setSectorOption(opt); setSelectedSectorId(opt.value); setValue('sector', opt.label); setCellOption(null); setSelectedCellId(undefined); setVillageOption(null); setValue('cell', ''); setValue('village', ''); }
                      else { setSectorOption(null); setCellOption(null); setVillageOption(null); setSelectedSectorId(undefined); setSelectedCellId(undefined); setValue('sector', ''); setValue('cell', ''); setValue('village', ''); }
                    }}
                    placeholder={t('registration.worker.location.selectSector')} isDisabled={!selectedDistrictId} isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.location.cell')} *</label>
                  <Select
                    value={cellOption}
                    options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      if (opt) { setCellOption(opt); setSelectedCellId(opt.value); setValue('cell', opt.label); setVillageOption(null); setValue('village', ''); }
                      else { setCellOption(null); setVillageOption(null); setSelectedCellId(undefined); setValue('cell', ''); setValue('village', ''); }
                    }}
                    placeholder={t('registration.worker.location.selectCell')} isDisabled={!selectedSectorId} isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.location.village')} *</label>
                <Select
                  value={villageOption}
                  options={villagesData?.map(v => ({ value: v.id, label: v.name })) || []}
                  onChange={(opt: SingleValue<{ value: number; label: string }>) => { setVillageOption(opt ?? null); setValue('village', opt ? opt.label : ''); }}
                  placeholder={t('registration.worker.location.selectVillage')} isDisabled={!selectedCellId} isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                />
              </div>
            </CardContent>
          </Card>

          {/* STEP 3 NAV BUTTONS */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#0073bb] hover:bg-[#005f9e] text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs border-0"
            >
              <span>Next: Preferences & Insurance</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 4: WORK PREFERENCES & INSURANCE ─────────────────────────── */}
      {currentStep === 4 && (
        <div className="space-y-5 pb-12 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Work Preferences */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t('registration.worker.workPreferences.title')}</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Professions & Skills (What work do you do?) *</label>
                <p className="text-xs text-slate-500 mb-2.5">Tick all options that apply to you (you can select more than one):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {WORKER_PROFESSIONS.map(prof => {
                    const isSelected = selectedProfessions.includes(prof);
                    return (
                      <button
                        key={prof}
                        type="button"
                        onClick={() => toggleSelection(prof, selectedProfessions, setSelectedProfessions, 'professions')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0073bb] bg-[#0073bb]/5 text-[#0073bb] font-bold"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium"
                        }`}
                      >
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded border-2 border-slate-400 bg-transparent shrink-0" />
                        )}
                        <span className="text-xs leading-snug">{prof}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.workPreferences.experienceLevel')} *</label>
                <div className="flex flex-wrap items-center gap-5 mt-2">
                  {EXPERIENCE_LEVELS.map(level => {
                    const isSelected = watch('experience_level') === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setValue('experience_level', level.value as 'beginner' | 'intermediate' | 'expert')}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded border-2 border-slate-600 bg-transparent shrink-0 group-hover:border-slate-800" />
                        )}
                        <span className="text-sm font-semibold text-slate-800">
                          {t(`registration.worker.workPreferences.levels.${level.value}` as TranslationPath)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.workPreferences.languages')} *</label>
                <div className="flex flex-wrap items-center gap-5 mt-2">
                  {LANGUAGES.map(lang => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages, 'languages_spoken')}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded border-2 border-slate-600 bg-transparent shrink-0 group-hover:border-slate-800" />
                        )}
                        <span className="text-sm font-semibold text-slate-800">{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.workPreferences.workTypes')} *</label>
                <div className="flex flex-wrap items-center gap-5 mt-2">
                  {WORK_TYPES.map(type => {
                    const isSelected = selectedWorkTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedWorkTypes([type]);
                          setValue('work_type_preferences', [type], { shouldValidate: true });
                        }}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-[#0073bb] flex items-center justify-center shrink-0 shadow-2xs">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-500 bg-transparent shrink-0 group-hover:border-slate-800" />
                        )}
                        <span className="text-sm font-semibold text-slate-800">
                          {t(`registration.worker.workPreferences.types.${type}` as TranslationPath)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">{t('registration.worker.workPreferences.preferredDistricts')} *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="select_all_districts"
                      checked={selectAllDistricts}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAllDistricts(checked);
                        if (checked) { const all = allDistrictsData?.map(d => d.name) || []; setSelectedDistricts(all); setValue('preferred_districts', all); }
                        else { setSelectedDistricts([]); setValue('preferred_districts', []); }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb] cursor-pointer"
                    />
                    <label htmlFor="select_all_districts" className="cursor-pointer text-xs font-semibold text-slate-700">{t('registration.worker.workPreferences.selectAll')}</label>
                  </div>
                </div>
                <Select
                  isMulti
                  value={selectedDistricts.map(d => ({ value: d, label: d }))}
                  options={allDistrictsData?.map(d => ({ value: d.name, label: d.name })) || []}
                  onChange={(opts: MultiValue<{ value: string; label: string }>) => {
                    const sel = opts.map(o => o.value);
                    setSelectedDistricts(sel); setValue('preferred_districts', sel);
                    setSelectAllDistricts(sel.length === (allDistrictsData?.length || 0));
                  }}
                  placeholder={t('registration.worker.workPreferences.selectDistricts')} className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.workPreferences.minSalary')} *</label>
                  <input id="min_salary" type="number" {...register('min_salary', { required: t('registration.worker.workPreferences.salaryRequired'), min: { value: 0, message: t('registration.worker.workPreferences.salaryPositive') } })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  {errors.min_salary && <p className="text-xs text-red-500 font-semibold mt-1">{errors.min_salary.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.workPreferences.maxSalary')} *</label>
                  <input id="max_salary" type="number" {...register('max_salary', { required: t('registration.worker.workPreferences.salaryRequired') })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  {errors.max_salary && <p className="text-xs text-red-500 font-semibold mt-1">{errors.max_salary.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Insurance */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t('registration.worker.personalInfo.insurance.title')}</h3>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-800">{t('registration.worker.personalInfo.insurance.selectType')} *</label>
                <div className="flex flex-wrap items-center gap-6 py-1">
                  <button
                    type="button"
                    onClick={() => handleInsuranceTypeChange('MITUELLE_DE_SANTE')}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    {insuranceType === 'MITUELLE_DE_SANTE' ? (
                      <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-slate-600 bg-transparent shrink-0 group-hover:border-slate-800" />
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-sm text-slate-800">{t('registration.worker.personalInfo.insurance.mutuelleLabel')}</span>
                      <span className="text-xs text-slate-500 font-medium">{t('registration.worker.personalInfo.insurance.mutuelleDesc')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsuranceTypeChange('OTHERS')}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    {insuranceType === 'OTHERS' ? (
                      <div className="w-5 h-5 rounded bg-[#0073bb] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-slate-600 bg-transparent shrink-0 group-hover:border-slate-800" />
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-sm text-slate-800">{t('registration.worker.personalInfo.insurance.othersLabel')}</span>
                      <span className="text-xs text-slate-500 font-medium">{t('registration.worker.personalInfo.insurance.othersDesc')}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className={['overflow-hidden transition-all duration-400 ease-in-out', insuranceType === 'MITUELLE_DE_SANTE' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.insurance.provider')}</label>
                    <input {...register('insurance_provider')} readOnly disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.insurance.number')}</label>
                    <input {...register('insurance_number')} readOnly disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm" />
                  </div>
                </div>
              </div>

              <div className={['overflow-hidden transition-all duration-400 ease-in-out', insuranceType === 'OTHERS' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.insurance.provider')} *</label>
                    <input {...register('insurance_provider')} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('registration.worker.personalInfo.insurance.number')} *</label>
                    <input {...register('insurance_number')} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 4 SUBMIT & BACK BUTTONS */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3.5 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={`px-10 py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 ${isPending
                  ? "bg-[#d1d5db] text-slate-600 cursor-not-allowed"
                  : "bg-[#0073bb] hover:bg-[#005f9e] text-white"
                }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('registration.worker.submit.registering')}
                </span>
              ) : (
                t('registration.worker.submit.register')
              )}
            </button>
          </div>

        </div>
      )}

    </form>
  );
};