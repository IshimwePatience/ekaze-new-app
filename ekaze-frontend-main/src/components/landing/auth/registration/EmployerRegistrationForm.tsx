import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRegisterEmployer, useRegistrationPrefill } from '@/hooks/useRegistration';
import type { EmployerRegistrationRequest } from '@/types/auth.types';
import {
  User, Phone, MapPin, Lock, Shield,
  CreditCardIcon, Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RotateCcw
} from 'lucide-react';
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from '@/hooks/useLocations';
import { useNidaCheck, useNidaVerify } from '@/hooks/useNida';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/hooks/use-toast';
import { CloudPhotoUpload } from '@/components/common/CloudPhotoUpload';

interface EmployerRegistrationFormProps {
  onSuccess: () => void;
}

const SESSION_KEY = 'ekaze_employer_reg_full_draft';

export const EmployerRegistrationForm = ({ onSuccess }: EmployerRegistrationFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register, handleSubmit, watch, setValue, trigger, formState: { errors }
  } = useForm<EmployerRegistrationRequest>({ mode: 'onChange' });

  const { mutate: registerEmployer, isPending } = useRegisterEmployer();

  // ── Step Navigation ───────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ── NIDA state ─────────────────────────────────────────────────────────
  const [nidCheckPassed, setNidCheckPassed] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaVerifyField, setNidaVerifyField] = useState<'fullname' | 'date_of_birth'>('fullname');
  const [nidaVerifyValue, setNidaVerifyValue] = useState('');
  const [nidaVerifyDob, setNidaVerifyDob] = useState<Date | null>(null);
  const [nidaError, setNidaError] = useState('');

  const { mutateAsync: nidaCheck, isPending: nidaCheckLoading } = useNidaCheck();
  const { mutate: nidaVerifyMutate, isPending: nidaVerifyLoading } = useNidaVerify();

  // ── Prefill state ──────────────────────────────────────────────────────
  const [hasExistingData, setHasExistingData] = useState(false);
  const [prefillData, setPrefillData] = useState<Record<string, unknown> | null>(null);
  const { mutate: fetchPrefill } = useRegistrationPrefill();

  // ── Location state ─────────────────────────────────────────────────────
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
      setValue('name', '');
      setValue('gender', '');
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
            setValue(k as keyof EmployerRegistrationRequest, v as any);
          }
        });
      }

      if (data.provinceOption) { setProvinceOption(data.provinceOption); setSelectedProvinceId(data.provinceOption.value); }
      if (data.districtOption) { setDistrictOption(data.districtOption); setSelectedDistrictId(data.districtOption.value); }
      if (data.sectorOption) { setSectorOption(data.sectorOption); setSelectedSectorId(data.sectorOption.value); }
      if (data.cellOption) { setCellOption(data.cellOption); setSelectedCellId(data.cellOption.value); }
      if (data.villageOption) setVillageOption(data.villageOption);
    } catch (e) {
      console.error('Failed to parse employer draft:', e);
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
        name: watch('name'),
        gender: watch('gender'),
        phone: watch('phone'),
        email: watch('email'),
        province: watch('province'),
        district: watch('district'),
        sector: watch('sector'),
        cell: watch('cell'),
        village: watch('village'),
        disclaimer_accepted: watch('disclaimer_accepted')
      }
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(draft));
  }, [
    currentStep, nidaVerified, provinceOption, districtOption, sectorOption, cellOption, villageOption,
    watch('national_id'), watch('name'), watch('gender'), watch('phone'), watch('email'),
    watch('province'), watch('district'), watch('sector'), watch('cell'), watch('village'), watch('disclaimer_accepted')
  ]);

  const handleClearDraft = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentStep(1);
    setNidCheckPassed(false);
    setNidaVerified(false);
    setValue('national_id', '');
    setValue('name', '');
    setValue('gender', '');
    setValue('phone', '');
    setValue('email', '');
    setProvinceOption(null); setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null);
    setSelectedProvinceId(undefined); setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined);
    toast({ title: "Form Reset", description: "Employer registration draft cleared." });
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
          setValue('name', names.join(' '));
          if (d.gender) setValue('gender', d.gender.toLowerCase());
          setNidCheckPassed(false);
          setNidaVerified(true);

          fetchPrefill(nid, {
            onSuccess: (res) => {
              if (!res.success || !res.has_existing) return;
              const pd = res.data;
              setHasExistingData(true);
              setPrefillData(pd);
              if (pd.phone) setValue('phone', pd.phone);
              if (pd.email && !pd.email.endsWith('@ekaze.rw')) setValue('email', pd.email);
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

  // ── Step Navigation & Validation ──────────────────────────────────────
  const validateStep1 = () => {
    if (!nidaVerified) {
      toast({
        variant: "destructive",
        title: "Identity Verification Required",
        description: "Please enter a valid 16-digit National ID and confirm your identity to proceed."
      });
      return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    const isFormValid = await trigger(['phone', 'password', 'password_confirmation']);
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
        title: "Incomplete Account Info",
        description: "Please fill out all required fields in Step 2 before proceeding."
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const prov = watch('province');
    const dist = watch('district');
    const sec = watch('sector');
    const accepted = watch('disclaimer_accepted');

    if (!prov || !dist || !sec) {
      toast({
        variant: "destructive",
        title: "Location Details Required",
        description: "Please select your Province, District, and Sector."
      });
      return false;
    }
    if (!accepted) {
      toast({
        variant: "destructive",
        title: "Terms Agreement Required",
        description: "Please accept the legal terms and disclaimer to complete registration."
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

  const onSubmit = (data: EmployerRegistrationRequest) => {
    if (!validateStep3()) return;
    data.disclaimer_accepted = true;

    if (hasExistingData && !data.password) {
      const payload = data as EmployerRegistrationRequest & { keep_password: boolean };
      payload.keep_password = true;
      delete payload.password;
      delete payload.password_confirmation;
    }

    registerEmployer(data, {
      onSuccess: (response) => {
        sessionStorage.removeItem(SESSION_KEY);
        toast({
          title: "Registration Successful!",
          description: "Employer account registered. Proceeding to verification OTP & fee payment.",
        });
        navigate('/auth/verify-otp', {
          state: {
            phone: response.data?.phone || '',
            resends_remaining: response.data?.otp_resends_remaining || 0,
            role: 'employer',
            amount: response.data?.amount || 1000,
            transaction_id: response.data?.transaction_id,
          },
        });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: err?.response?.data?.message || "An error occurred during employer registration.",
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

      {/* ── UNTOUCHED EXACT ORIGINAL NOTE TEXT FOR EMPLOYER ──────────────── */}
      <div className="bg-[#f4f6f8] border border-slate-200/80 rounded-2xl p-4 text-left">
        <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
          <strong className="text-slate-900">{t("registration.employer.note")}</strong> {t("registration.employer.noteText")}
        </p>
      </div>

      {/* ── Multi-Step Progress Indicator ────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-3">
          <span className="uppercase tracking-wider text-slate-500 font-bold">Step {currentStep} of 3</span>
          <div className="flex items-center gap-3">
            <span className="text-[#0073bb] font-black">
              {currentStep === 1 && "1. Identity Verification"}
              {currentStep === 2 && "2. Account Security"}
              {currentStep === 3 && "3. Location & Agreement"}
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

      {/* ── STEP 1: IDENTITY VERIFICATION ───────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-4 text-left">
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t("registration.employer.personalInfo.nationalId")} *</h3>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex-1 text-left space-y-1">
                  <input
                    {...register('national_id', {
                      required: t("registration.employer.personalInfo.nationalIdRequired"),
                      minLength: { value: 16, message: t("registration.employer.personalInfo.nationalIdLength") },
                      maxLength: { value: 16, message: t("registration.employer.personalInfo.nationalIdLength") },
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
                    <p className="text-xs text-red-500 font-semibold mt-1">{t("registration.employer.personalInfo.nationalIdLength")}</p>
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

              {/* Verify expand (Only opens if 16 digits are valid and checked) */}
              <div className={['overflow-hidden transition-all duration-500 ease-in-out', nidCheckPassed && nidWatch.length === 16 ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'].join(' ')}>
                <div className="border-t border-slate-200/80 pt-4 space-y-4 text-left">
                  <div className="flex items-start gap-2.5 p-3.5 bg-[#f4f6f8] border border-slate-200 rounded-xl">
                    <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
                      {nidaVerifyField === 'fullname'
                        ? `${t("registration.worker.personalInfo.nidaNameCheck")}.`
                        : t("registration.worker.personalInfo.nidaDobCheck")}
                    </p>
                  </div>

                  {nidaVerifyField === 'fullname' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">{t("registration.worker.personalInfo.name")} *</label>
                      <input
                        value={nidaVerifyValue}
                        onChange={e => setNidaVerifyValue(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">{t("registration.worker.personalInfo.dob")} *</label>
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
                      {nidaVerifyLoading ? t("registration.worker.personalInfo.verifying") : t("registration.worker.personalInfo.verifyIdentity")}
                    </button>
                  </div>
                </div>
              </div>

              {nidaError && !nidCheckPassed && (
                <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 border border-red-200 rounded-xl text-left">
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
              <span>Next: Account Security</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: PERSONAL & ACCOUNT SECURITY ─────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Personal Info */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 space-y-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t("registration.employer.personalInfo.title")}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.personalInfo.fullName")} *</label>
                  <input id="name" {...register('name', { required: t("registration.employer.personalInfo.nameRequired") })} readOnly disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm" />
                  {errors.name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.personalInfo.gender")} *</label>
                  <select id="gender" {...register('gender', { required: t("registration.employer.personalInfo.genderRequired") })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm" disabled>
                    <option value="">{t("registration.employer.personalInfo.selectGender")}</option>
                    <option value="male">{t("registration.employer.personalInfo.male")}</option>
                    <option value="female">{t("registration.employer.personalInfo.female")}</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500 font-semibold mt-1">{errors.gender.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 space-y-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t("registration.employer.contactInfo.title")}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.contactInfo.phone")} *</label>
                  <input id="phone" {...register('phone', { required: t("registration.employer.contactInfo.phoneRequired") })} maxLength={10} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                  {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {t("registration.employer.contactInfo.email")}
                    <span className="text-slate-400 font-medium text-xs ml-1">(optional)</span>
                  </label>
                  <input id="email" type="email" {...register('email')} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none" />
                </div>
              </div>

              {/* Password Security */}
              <Card style={cardStyle} className={cardClass}>
                <CardContent className="p-0 space-y-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-slate-700" />
                    <h3 className="text-base font-extrabold text-[#2b2b2b]">{t("registration.employer.security.title")}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {t("registration.employer.security.password")} {!hasExistingData && '*'}
                      </label>
                      {hasExistingData && <p className="text-xs text-slate-500 mb-1">Leave blank to keep existing password</p>}
                      <input
                        id="password" type="password"
                        {...register('password', {
                          required: hasExistingData ? false : t("registration.employer.security.passwordRequired"),
                          minLength: { value: 8, message: t("registration.employer.security.passwordLength") },
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                      />
                      {errors.password && <p className="text-xs text-red-500 font-semibold mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {t("registration.employer.security.confirmPassword")} {!hasExistingData && '*'}
                      </label>
                      <input
                        id="password_confirmation" type="password"
                        {...register('password_confirmation', {
                          required: hasExistingData ? false : t("registration.employer.security.confirmRequired"),
                          validate: v => !v || v === watch('password') || t("registration.employer.security.passwordMismatch"),
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0073bb] focus:ring-2 focus:ring-[#0073bb]/20 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all outline-none"
                      />
                      {errors.password_confirmation && <p className="text-xs text-red-500 font-semibold mt-1">{errors.password_confirmation.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <span>Next: Location & Agreement</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: LOCATION & AGREEMENT ─────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">

          {/* Location Information */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 space-y-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-extrabold text-[#2b2b2b]">{t("registration.employer.location.title")}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.location.province")} *</label>
                  <Select
                    value={provinceOption}
                    options={provincesData?.map(p => ({ value: p.id, label: p.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setProvinceOption(opt);
                      setDistrictOption(null); setSectorOption(null); setCellOption(null); setVillageOption(null);
                      setSelectedDistrictId(undefined); setSelectedSectorId(undefined); setSelectedCellId(undefined);
                      if (opt) { setSelectedProvinceId(opt.value); setValue('province', opt.label); }
                      else { setSelectedProvinceId(undefined); setValue('province', ''); }
                      setValue('district', ''); setValue('sector', ''); setValue('cell', ''); setValue('village', '');
                    }}
                    placeholder={t("registration.employer.location.selectProvince")}
                    isClearable className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.location.district")} *</label>
                  <Select
                    value={districtOption}
                    options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setDistrictOption(opt);
                      setSectorOption(null); setCellOption(null); setVillageOption(null);
                      setSelectedSectorId(undefined); setSelectedCellId(undefined);
                      if (opt) { setSelectedDistrictId(opt.value); setValue('district', opt.label); }
                      else { setSelectedDistrictId(undefined); setValue('district', ''); }
                      setValue('sector', ''); setValue('cell', ''); setValue('village', '');
                    }}
                    placeholder={t("registration.employer.location.selectDistrict")}
                    isDisabled={!selectedProvinceId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.location.sector")} *</label>
                  <Select
                    value={sectorOption}
                    options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSectorOption(opt);
                      setCellOption(null); setVillageOption(null);
                      setSelectedCellId(undefined);
                      if (opt) { setSelectedSectorId(opt.value); setValue('sector', opt.label); }
                      else { setSelectedSectorId(undefined); setValue('sector', ''); }
                      setValue('cell', ''); setValue('village', '');
                    }}
                    placeholder={t("registration.employer.location.selectSector")}
                    isDisabled={!selectedDistrictId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.location.cell")}</label>
                  <Select
                    value={cellOption}
                    options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setCellOption(opt); setVillageOption(null);
                      if (opt) { setSelectedCellId(opt.value); setValue('cell', opt.label); }
                      else { setSelectedCellId(undefined); setValue('cell', ''); }
                      setValue('village', '');
                    }}
                    placeholder={t("registration.employer.location.selectCell")}
                    isDisabled={!selectedSectorId} isClearable
                    className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("registration.employer.location.village")}</label>
                <Select
                  value={villageOption}
                  options={villagesData?.map(v => ({ value: v.id, label: v.name })) || []}
                  onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                    setVillageOption(opt ?? null);
                    setValue('village', opt ? opt.label : '');
                  }}
                  placeholder={t("registration.employer.location.selectVillage")}
                  isDisabled={!selectedCellId} isClearable
                  className="react-select-container text-sm font-medium" classNamePrefix="react-select"
                />
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card style={cardStyle} className={cardClass}>
            <CardContent className="p-0 text-left">
              <div className="flex items-start gap-3 p-4 bg-[#f4f6f8] border border-slate-200 rounded-xl mb-4">
                <Shield className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-[#4f687a] leading-relaxed">
                  The personal information of domestic workers provided through this platform is strictly
                  for recruitment and employment purposes. Any use of this information for unauthorized
                  purposes may constitute a violation of applicable laws and may result in legal sanctions.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="disclaimer_accepted"
                  {...register('disclaimer_accepted', {
                    required: 'You must accept the disclaimer to continue.',
                  })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0073bb] focus:ring-[#0073bb] cursor-pointer"
                />
                <label htmlFor="disclaimer_accepted" className="text-sm font-semibold text-slate-700 leading-relaxed cursor-pointer">
                  I understand and agree that I will use domestic worker information solely for
                  recruitment and employment purposes in compliance with applicable laws of Rwanda.
                </label>
              </div>
              {errors.disclaimer_accepted && (
                <p className="text-xs text-red-500 font-semibold mt-2 ml-7">
                  {errors.disclaimer_accepted.message as string}
                </p>
              )}
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
                  {t("registration.employer.submit.registering")}
                </span>
              ) : (
                t("registration.employer.submit.register")
              )}
            </button>
          </div>

        </div>
      )}

    </form>
  );
};