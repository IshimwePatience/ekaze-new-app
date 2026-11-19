import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useRegisterCompany, useRegistrationPrefill } from '@/hooks/useRegistration';
import type { CompanyRegistrationRequest } from '@/types/auth.types';
import {
  Building2, MapPin, Lock, Loader2,
  CreditCardIcon, Shield, AlertCircle, CheckCircle2, User, Info, Phone, ArrowRight, ArrowLeft, RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from '@/hooks/useLocations';
import { useNidaCheck, useNidaVerify } from '@/hooks/useNida';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/hooks/use-toast';
import { CloudPhotoUpload } from '@/components/common/CloudPhotoUpload';

interface CompanyRegistrationFormProps {
  onSuccess: () => void;
}

const SESSION_KEY = 'ekaze_company_reg_full_draft';

export const CompanyRegistrationForm = ({ onSuccess }: CompanyRegistrationFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors },
  } = useForm<CompanyRegistrationRequest>({ mode: 'onChange' });

  const { mutate: registerCompany, isPending } = useRegisterCompany();
  const { mutate: fetchPrefill } = useRegistrationPrefill();

  // ── Step Navigation ───────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ── Prefill / existing-data state ──────────────────────────────────────
  const [hasExistingData, setHasExistingData] = useState(false);
  const [prefillData, setPrefillData] = useState<Record<string, unknown> | null>(null);

  // ── NIDA state ────────────────────────────────────────────────────────
  const [nidCheckPassed, setNidCheckPassed] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaVerifyField, setNidaVerifyField] = useState<'fullname' | 'date_of_birth'>('fullname');
  const [nidaVerifyValue, setNidaVerifyValue] = useState('');
  const [nidaVerifyDob, setNidaVerifyDob] = useState<Date | null>(null);
  const [nidaError, setNidaError] = useState('');

  const [activeAccountError, setActiveAccountError] = useState('');

  const { mutateAsync: nidaCheck, isPending: nidaCheckLoading } = useNidaCheck();
  const { mutate: nidaVerifyMutate, isPending: nidaVerifyLoading } = useNidaVerify();

  // ── Location state ────────────────────────────────────────────────────
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();

  const [provinceOption, setProvinceOption] = useState<{ value: number; label: string } | null>(null);
  const [districtOption, setDistrictOption] = useState<{ value: number; label: string } | null>(null);
  const [sectorOption, setSectorOption] = useState<{ value: number; label: string } | null>(null);
  const [cellOption, setCellOption] = useState<{ value: number; label: string } | null>(null);
  const [villageOption, setVillageOption] = useState<{ value: number; label: string } | null>(null);

  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);

  const nidWatch = watch('national_id') ?? '';
  const prevNidRef = useRef('');

  // ── Auto-check NID at 16 chars ─────────────────────────────────────────
  useEffect(() => {
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
      setActiveAccountError('');
      setValue('owner_name', '');
    }
    if (current.length === 16) triggerNidaCheck(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nidWatch]);

  // ── Session persistence & auto-restore ──────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.currentStep) setCurrentStep(data.currentStep);
      if (data.nidaVerified) setNidaVerified(data.nidaVerified);

      if (data.formValues) {
        Object.entries(data.formValues).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            setValue(k as keyof CompanyRegistrationRequest, v as any);
          }
        });
      }

      if (data.provinceOption) { setProvinceOption(data.provinceOption); setSelectedProvinceId(data.provinceOption.value); }
      if (data.districtOption) { setDistrictOption(data.districtOption); setSelectedDistrictId(data.districtOption.value); }
      if (data.sectorOption) { setSectorOption(data.sectorOption); setSelectedSectorId(data.sectorOption.value); }
      if (data.cellOption) { setCellOption(data.cellOption); setSelectedCellId(data.cellOption.value); }
      if (data.villageOption) setVillageOption(data.villageOption);
    } catch (e) {
      console.error('Failed to parse company draft:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const draft = {
      currentStep,
      nidaVerified,
      provinceOption,
      districtOption,
      sectorOption,
      cellOption,
      villageOption,
      formValues: {
        national_id: watch('national_id'),
        owner_name: watch('owner_name'),
        company_name: watch('company_name'),
        tin_number: watch('tin_number'),
        rdb_registration_number: watch('rdb_registration_number'),
        company_phone: watch('company_phone'),
        company_email: watch('company_email'),
        owner_phone: watch('owner_phone'),
        owner_email: watch('owner_email'),
        province: watch('province'),
        district: watch('district'),
        sector: watch('sector'),
        cell: watch('cell'),
        village: watch('village'),
      }
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(draft));
  }, [
    currentStep, nidaVerified, provinceOption, districtOption, sectorOption, cellOption, villageOption,
    watch('national_id'), watch('owner_name'), watch('company_name'), watch('tin_number'),
    watch('rdb_registration_number'), watch('company_phone'), watch('company_email'),
    watch('owner_phone'), watch('owner_email'), watch('province'), watch('district'), watch('sector'), watch('cell'), watch('village')
  ]);

  const handleClearDraft = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentStep(1);
    setNidCheckPassed(false);
    setNidaVerified(false);
    setValue('national_id', '');
    setValue('owner_name', '');
    setValue('company_name', '');
    setValue('tin_number', '');
    setProvinceOption(null); setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null);
    setSelectedProvinceId(undefined); setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined);
    toast({ title: "Form Reset", description: "Company registration draft cleared." });
  };

  // ── Location cascade effects ───────────────────────────────────────────
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
    setActiveAccountError('');
    try {
      const json = await nidaCheck(nid);
      if (json.success && json.exists) {
        setNidaVerifyField(Math.random() < 0.5 ? 'fullname' : 'date_of_birth');
        setNidaVerifyValue(''); setNidaVerifyDob(null); setNidaError('');
        setNidCheckPassed(true);
      } else {
        setNidaError(json.message || 'NID not found.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setNidaError(err?.response?.data?.message || 'Failed to check NID.');
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
          setValue('owner_name', names.join(' '));
          setNidCheckPassed(false);
          setNidaVerified(true);

          fetchPrefill(nid, {
            onSuccess: (res) => {
              if (!res.success || !res.has_existing) return;
              const pd = res.data;
              setHasExistingData(true);
              setPrefillData(pd);
              if (pd.phone) setValue('owner_phone', pd.phone);
              if (pd.email && !pd.email.endsWith('@ekaze.rw')) setValue('owner_email', pd.email);
            },
          });
        } else {
          setNidaError(json.message || 'Verification failed. Please try again.');
        }
      },
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        setNidaError(err?.response?.data?.message || 'Failed to verify.');
      },
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Step Validation ────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!nidaVerified) {
      toast({
        variant: "destructive",
        title: "Owner Verification Required",
        description: "Please enter a valid 16-digit National ID and confirm owner identity to proceed."
      });
      return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    const isFormValid = await trigger(['company_name', 'tin_number', 'company_phone', 'owner_phone', 'password', 'password_confirmation']);
    const phoneVal = watch('company_phone') || watch('owner_phone') || '';
    if (!isFormValid) {
      toast({
        variant: "destructive",
        title: "Incomplete Company Info",
        description: "Please fill out all required company & contact details in Step 2 before proceeding."
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const prov = watch('province');
    const dist = watch('district');
    const sec = watch('sector');

    if (!prov || !dist || !sec) {
      toast({
        variant: "destructive",
        title: "Location Details Required",
        description: "Please select company Province, District, and Sector."
      });
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await validateStep2();
      if (valid) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const onSubmit = (data: CompanyRegistrationRequest) => {
    if (!validateStep3()) return;

    if (hasExistingData && !data.password) {
      const payload = data as CompanyRegistrationRequest & { keep_password: boolean };
      payload.keep_password = true;
      delete payload.password;
      delete payload.password_confirmation;
    }

    registerCompany(data, {
      onSuccess: (response) => {
        sessionStorage.removeItem(SESSION_KEY);
        toast({
          title: "Registration Submitted!",
          description: "Company registration submitted for review.",
        });
        navigate('/auth/verify-otp', {
          state: {
            phone: response.data?.phone || response.data?.owner_phone || '',
            resends_remaining: response.data?.otp_resends_remaining || 0,
            role: 'company',
          },
        });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: err?.response?.data?.message || "An error occurred during company registration.",
        });
      }
    });
  };

  const verifyDisabled =
    nidaVerifyLoading ||
    (nidaVerifyField === 'fullname' && !nidaVerifyValue.trim()) ||
    (nidaVerifyField === 'date_of_birth' && !nidaVerifyDob);

  const cardStyle = {};
  const cardClass = 'bg-transparent border-0 shadow-none p-0';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">

      {/* ── UNTOUCHED EXACT ORIGINAL NOTE TEXT FOR COMPANY ───────────────── */}
      <div className="bg-[#f4f6f8] border border-slate-200/80 rounded-2xl p-4 text-left">
        <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
          <strong className="text-slate-900">{t("registration.company.note")}</strong> {t("registration.company.noteText")}
        </p>
      </div>

      {/* ── Multi-Step Progress Indicator ────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-3">
          <span className="uppercase tracking-wider text-slate-500 font-bold">Step {currentStep} of 3</span>
          <div className="flex items-center gap-3">
            <span className="text-[#0073bb] font-black">
              {currentStep === 1 && "1. Owner Identity Verification"}
              {currentStep === 2 && "2. Company & Contact Info"}
              {currentStep === 3 && "3. Company Location"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-[#0073bb]' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 1: OWNER IDENTITY VERIFICATION ─────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-extrabold text-[#2b2b2b]">Amakuru ya Nyir'ubwite</h3>
              </div>

              {/* Active account block */}
              {activeAccountError && (
                <div className="flex items-start gap-2.5 p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-red-600">Account Already Exists</p>
                    <p className="text-xs font-semibold text-red-600">{activeAccountError}</p>
                    <button
                      type="button"
                      className="text-xs font-bold underline text-red-700 hover:text-red-900 cursor-pointer"
                      onClick={() => navigate('/auth/login')}
                    >
                      Go to Login →
                    </button>
                  </div>
                </div>
              )}

              {/* National ID + NIDA check */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-xs font-bold text-slate-800">Indangamuntu *</label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1">
                    <input
                      id="national_id"
                      {...register('national_id', {
                        required: 'Indangamuntu irakenewe',
                        minLength: { value: 16, message: 'Indangamuntu igomba kuba imibare 16' },
                        maxLength: { value: 16, message: 'Indangamuntu igomba kuba imibare 16' },
                      })}
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
                      <p className="text-xs text-red-500 font-semibold mt-1">Indangamuntu igomba kuba imibare 16</p>
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
              </div>

              {/* NIDA verify expand (Only opens if 16 digits are valid and checked) */}
              <div className={[
                'overflow-hidden transition-all duration-500 ease-in-out',
                nidCheckPassed && nidWatch.length === 16 ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0',
              ].join(' ')}>
                <div className="border-t border-slate-200/80 pt-4 space-y-4">
                  <div className="flex items-start gap-2.5 p-3.5 bg-[#f4f6f8] border border-slate-200 rounded-xl">
                    <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
                      {nidaVerifyField === 'fullname'
                        ? 'Andika amazina yanditse kuri Indangamuntu yawe kugira ngo twemeze.'
                        : 'Andika itariki yamavuko yawe kugira ngo twemeze.'}
                    </p>
                  </div>

                  {nidaVerifyField === 'fullname' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">Amazina *</label>
                      <input
                        value={nidaVerifyValue}
                        onChange={e => setNidaVerifyValue(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">Itariki y'amavuko *</label>
                      <DatePicker
                        selected={nidaVerifyDob}
                        onChange={(date: Date | null) => setNidaVerifyDob(date)}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                        maxDate={new Date()}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073bb]/20"
                        wrapperClassName="w-full"
                        autoFocus
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
                      {nidaVerifyLoading ? 'Emeza...' : 'Emeza Indangamuntu'}
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

          {/* STEP 1 NEXT BUTTON */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!nidaVerified}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs border-0 ${!nidaVerified
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-[#0073bb] hover:bg-[#005f9e] text-white"
                }`}
            >
              <span>Next: Company Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: COMPANY & CONTACT INFORMATION ───────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Owner Info */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">Owner Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Owner Full Name *</label>
                  <input id="owner_name" {...register('owner_name')} readOnly disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Owner Phone *</label>
                  <input id="owner_phone" {...register('owner_phone', { required: 'Owner phone required' })} maxLength={10} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Business Details */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">Business Registration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Company Name *</label>
                  <input id="company_name" {...register('company_name', { required: 'Company name is required' })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">TIN Number *</label>
                  <input id="tin_number" {...register('tin_number', { required: 'TIN number is required' })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">RDB Reg. Number (Optional)</label>
                  <input id="rdb_registration_number" {...register('rdb_registration_number')} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Company Phone *</label>
                  <input id="company_phone" {...register('company_phone', { required: 'Company phone is required' })} maxLength={10} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">Account Security</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Password *</label>
                  <input id="password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be 8+ chars' } })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Confirm Password *</label>
                  <input id="password_confirmation" type="password" {...register('password_confirmation', { required: 'Confirm password', validate: v => v === watch('password') || 'Passwords do not match' })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
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
              <span>Next: Company Location</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 3: COMPANY LOCATION ─────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">Company Location</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Province *</label>
                  <Select
                    value={provinceOption}
                    options={provincesData?.map(p => ({ value: p.id, label: p.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setProvinceOption(opt);
                      setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null);
                      setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined);
                      if (opt) { setSelectedProvinceId(opt.value); setValue('province', opt.label); }
                      else { setSelectedProvinceId(undefined); setValue('province', ''); }
                    }}
                    placeholder="Select Province"
                    isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">District *</label>
                  <Select
                    value={districtOption}
                    options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setDistrictOption(opt);
                      setSectorOption(null); setCellOption(null); setVillageOption(null);
                      setSelectedSectorId(undefined); setSelectedCellId(undefined);
                      if (opt) { setSelectedDistrictId(opt.value); setValue('district', opt.label); }
                      else { setSelectedDistrictId(undefined); setValue('district', ''); }
                    }}
                    placeholder="Select District"
                    isDisabled={!selectedProvinceId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Sector *</label>
                  <Select
                    value={sectorOption}
                    options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSectorOption(opt);
                      setCellOption(null); setVillageOption(null);
                      setSelectedCellId(undefined);
                      if (opt) { setSelectedSectorId(opt.value); setValue('sector', opt.label); }
                      else { setSelectedSectorId(undefined); setValue('sector', ''); }
                    }}
                    placeholder="Select Sector"
                    isDisabled={!selectedDistrictId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Cell</label>
                  <Select
                    value={cellOption}
                    options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setCellOption(opt); setVillageOption(null);
                      if (opt) { setSelectedCellId(opt.value); setValue('cell', opt.label); }
                      else { setSelectedCellId(undefined); setValue('cell', ''); }
                    }}
                    placeholder="Select Cell"
                    isDisabled={!selectedSectorId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 3 SUBMIT BUTTON */}
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
                  Registering Company...
                </span>
              ) : (
                "Complete Company Registration"
              )}
            </button>
          </div>

        </div>
      )}

    </form>
  );
};