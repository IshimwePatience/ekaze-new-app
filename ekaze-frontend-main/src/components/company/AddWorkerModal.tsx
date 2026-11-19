import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User, Phone, MapPin, Briefcase, Shield,
  CreditCardIcon, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Select from 'react-select';
import type { MultiValue, SingleValue } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  useProvinces, useDistricts, useSectors, useCells, useVillages,
} from '@/hooks/useLocations';
import { useNidaCheck, useNidaVerify } from '@/hooks/useNida';
import type { NewWorkerRegistrationPayload } from '@/types/company.types';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewWorkerRegistrationPayload) => void;
  isLoading?: boolean;
  companyId?: number;
}

interface WorkerFormValues extends NewWorkerRegistrationPayload {
  password: string;
  password_confirmation: string;
}

type InsuranceType = 'MITUELLE_DE_SANTE' | 'OTHERS' | null;

const LANGUAGES  = ['Kinyarwanda', 'English', 'French', 'Swahili'];
const WORK_TYPES = ['full_time', 'part_time', 'contract', 'temporary'];
const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'expert',       label: 'Expert (3+ years)' },
];

const AddWorkerModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  companyId,
}: AddWorkerModalProps) => {
  const { t } = useLanguage();

  // ── Form ──────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<WorkerFormValues>();

  // ── NIDA state ────────────────────────────────────────────────────────
  const [nidCheckPassed,  setNidCheckPassed]  = useState(false);
  const [nidaVerified,    setNidaVerified]    = useState(false);
  const [nidaVerifyField, setNidaVerifyField] = useState<'fullname' | 'date_of_birth'>('fullname');
  const [nidaVerifyValue, setNidaVerifyValue] = useState('');
  const [nidaVerifyDob,   setNidaVerifyDob]   = useState<Date | null>(null);
  const [nidaError,       setNidaError]       = useState('');
  const prevNidRef = useRef('');

  const { mutateAsync: nidaCheck,   isPending: nidaCheckLoading  } = useNidaCheck();
  const { mutate: nidaVerifyMutate, isPending: nidaVerifyLoading } = useNidaVerify();

  // ── Insurance ─────────────────────────────────────────────────────────
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(null);

  // ── Other state ───────────────────────────────────────────────────────
  const [selectedLanguages,  setSelectedLanguages]  = useState<string[]>([]);
  const [selectedWorkTypes,  setSelectedWorkTypes]  = useState<string[]>([]);
  const [selectedDistricts,  setSelectedDistricts]  = useState<string[]>([]);
  const [selectAllDistricts, setSelectAllDistricts] = useState(false);
  const [photoPreview,       setPhotoPreview]       = useState<string | null>(null);
  const [dateOfBirth,        setDateOfBirth]        = useState<Date | null>(null);

  // Controlled select state (needed to clear on reset)
  const [provinceOption, setProvinceOption] = useState<{ value: number; label: string } | null>(null);
  const [districtOption, setDistrictOption] = useState<{ value: number; label: string } | null>(null);
  const [sectorOption,   setSectorOption]   = useState<{ value: number; label: string } | null>(null);
  const [cellOption,     setCellOption]     = useState<{ value: number; label: string } | null>(null);
  const [villageOption,  setVillageOption]  = useState<{ value: number; label: string } | null>(null);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId,   setSelectedSectorId]   = useState<number | undefined>();
  const [selectedCellId,     setSelectedCellId]     = useState<number | undefined>();

  const { data: provincesData }    = useProvinces();
  const { data: districtsData }    = useDistricts(selectedProvinceId);
  const { data: sectorsData }      = useSectors(selectedDistrictId);
  const { data: cellsData }        = useCells(selectedSectorId);
  const { data: villagesData }     = useVillages(selectedCellId);
  const { data: allDistrictsData } = useDistricts();

  const nidWatch = watch('national_id') ?? '';

  // ── Auto-check NID at 16 chars — same pattern as WorkerRegistrationForm ─
  useEffect(() => {
    const current = nidWatch;
    const prev    = prevNidRef.current;
    if (current === prev) return;
    prevNidRef.current = current;

    // Reset when NID is edited after a prior check/verify
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
      setInsuranceType(null);
      setValue('insurance_type',     undefined);
      setValue('insurance_provider', '');
      setValue('insurance_number',   '');
    }

    if (current.length === 16) {
      triggerNidaCheck(current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nidWatch]);

  // ── Reset everything when modal closes ───────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setNidCheckPassed(false);
      setNidaVerified(false);
      setNidaVerifyValue('');
      setNidaVerifyDob(null);
      setNidaError('');
      setInsuranceType(null);
      setSelectedLanguages([]);
      setSelectedWorkTypes([]);
      setSelectedDistricts([]);
      setSelectAllDistricts(false);
      setPhotoPreview(null);
      setDateOfBirth(null);
      setProvinceOption(null); setDistrictOption(null);
      setSectorOption(null);   setCellOption(null); setVillageOption(null);
      setSelectedProvinceId(undefined); setSelectedDistrictId(undefined);
      setSelectedSectorId(undefined);   setSelectedCellId(undefined);
      prevNidRef.current = '';
    }
  }, [isOpen]);

  // ── NIDA auto-check ───────────────────────────────────────────────────
  const triggerNidaCheck = async (nid: string) => {
    setNidaError('');
    try {
      const json = await nidaCheck(nid);
      if (json.success && json.exists) {
        const field = Math.random() < 0.5 ? 'fullname' : 'date_of_birth';
        setNidaVerifyField(field as 'fullname' | 'date_of_birth');
        setNidaVerifyValue('');
        setNidaVerifyDob(null);
        setNidaError('');
        setNidCheckPassed(true);
      } else {
        setNidaError(json.message || 'NID not found. Please check the number.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setNidaError(err?.response?.data?.message || 'Failed to check NID. Please try again.');
    }
  };

  // ── NIDA verify ───────────────────────────────────────────────────────
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
          const d     = json.data;
          const names = (d.fullname || '').split(' ');
          setValue('first_name', names[0] || '');
          setValue('last_name',  names.slice(1).join(' ') || '');
          setValue('national_id', nid);
          if (d.dob) {
            const dobDate = new Date(d.dob);
            setDateOfBirth(dobDate);
            setValue('date_of_birth', d.dob);
          }
          if (d.gender) setValue('gender', d.gender.toLowerCase());
          setNidCheckPassed(false);
          setNidaVerified(true);
          setNidaError('');
        } else {
          setNidaError(json.message || 'Verification failed. Please try again.');
        }
      },
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        setNidaError(err?.response?.data?.message || 'Failed to verify. Please try again.');
      },
    });
  };

  // ── Insurance toggle — identical to WorkerRegistrationForm ────────────
  const handleInsuranceTypeChange = (type: 'MITUELLE_DE_SANTE' | 'OTHERS') => {
    setInsuranceType(type);
    setValue('insurance_type', type);
    if (type === 'MITUELLE_DE_SANTE') {
      setValue('insurance_provider', 'MUTUELLE DE SANTE');
      setValue('insurance_number',   watch('national_id') || '');
    } else {
      setValue('insurance_provider', '');
      setValue('insurance_number',   '');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (l: string[]) => void,
    field: keyof WorkerFormValues,
  ) => {
    const next = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setter(next);
    setValue(field, next as never);
  };

  const getWorkTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      full_time: t('company.workersContent.addWorkerModal.full_time'),
      part_time: t('company.workersContent.addWorkerModal.part_time'),
      contract:  t('company.workersContent.addWorkerModal.contract'),
      temporary: t('company.workersContent.addWorkerModal.temporary'),
    };
    return map[type] || type;
  };

  const onFormSubmit = (data: WorkerFormValues) => {
    const payload: NewWorkerRegistrationPayload = { ...data };
    (payload as unknown as Record<string, unknown>).has_insurance = insuranceType !== null ? 1 : 0;
    if (companyId) {
      (payload as unknown as Record<string, unknown>).company_id = companyId;
    }
    onSubmit(payload);
  };

  // ── Styles — same as WorkerRegistrationForm ───────────────────────────
  const cardStyle = { borderRadius: '8px' };
  const cardClass = 'border border-border/60 shadow-sm';

  const verifyDisabled =
    nidaVerifyLoading ||
    (nidaVerifyField === 'fullname'      && !nidaVerifyValue.trim()) ||
    (nidaVerifyField === 'date_of_birth' && !nidaVerifyDob);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50">
          <DialogTitle className="text-base font-semibold">
            {t('company.workersContent.addWorkerModal.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ScrollArea className="h-[640px]">
            <div className="px-6 py-5 space-y-4">

              {/* ── NID Card — auto-checks at 16 chars ──────────────────── */}
              <Card style={cardStyle} className={cardClass}>
                <CardContent className="pt-5 pb-5">

                  <div className="flex items-center gap-2 mb-3">
                    <CreditCardIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">
                      {t('company.workersContent.addWorkerModal.nationalId')} *
                    </h3>
                  </div>

                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        {...register('national_id', {
                          required: t('company.workersContent.addWorkerModal.required'),
                          minLength: { value: 16, message: t('company.workersContent.addWorkerModal.nationalIdLength') },
                          maxLength: { value: 16, message: t('company.workersContent.addWorkerModal.nationalIdLength') },
                        })}
                        placeholder={t('company.workersContent.addWorkerModal.nationalIdPlaceholder')}
                        maxLength={16}
                        disabled={nidaVerified}
                        className={[
                          nidWatch.length > 0 && nidWatch.length < 16
                            ? 'border-destructive focus-visible:ring-destructive'
                            : '',
                          nidaVerified ? 'bg-muted cursor-not-allowed' : '',
                        ].join(' ')}
                      />
                      {nidWatch.length > 0 && nidWatch.length < 16 && (
                        <p className="text-xs text-destructive mt-1">
                          {t('company.workersContent.addWorkerModal.nationalIdLength')}
                        </p>
                      )}
                    </div>

                    {nidaVerified && (
                      <Badge variant="default" className="px-3 py-1.5 gap-1 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    )}

                    {nidaCheckLoading && (
                      <div className="mt-2 shrink-0">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Inline verify — slides down exactly like WorkerRegistrationForm */}
                  <div
                    className={[
                      'overflow-hidden transition-all duration-500 ease-in-out',
                      nidCheckPassed ? 'max-h-80 opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0',
                    ].join(' ')}
                  >
                    <div className="border-t border-border/50 pt-4 space-y-3">

                      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-md">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {nidaVerifyField === 'fullname'
                            ? t('registration.worker.personalInfo.nidaNameCheck') + '.'
                            : t('registration.worker.personalInfo.nidaDobCheck')}
                        </p>
                      </div>

                      {nidaVerifyField === 'fullname' ? (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">
                            {t('registration.worker.personalInfo.name')} *
                          </Label>
                          <Input
                            value={nidaVerifyValue}
                            onChange={e => { setNidaVerifyValue(e.target.value); setNidaError(''); }}
                            placeholder="e.g. name"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">
                            {t('registration.worker.personalInfo.dob')} *
                          </Label>
                          <DatePicker
                            selected={nidaVerifyDob}
                            onChange={(date: Date | null) => { setNidaVerifyDob(date); setNidaError(''); }}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                            maxDate={new Date()}
                            className="w-full px-3 py-2 border border-input rounded-sm text-sm"
                            wrapperClassName="w-full"
                            autoFocus
                          />
                        </div>
                      )}

                      {nidaError && (
                        <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/30 rounded-md">
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                          <p className="text-sm text-destructive">{nidaError}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          onClick={handleNidaVerify}
                          disabled={verifyDisabled}
                          className="px-6"
                        >
                          {nidaVerifyLoading && <Loader2 className="animate-spin mr-1.5 h-4 w-4" />}
                          {nidaVerifyLoading
                            ? t('registration.worker.personalInfo.verifying')
                            : t('registration.worker.personalInfo.verifyIdentity')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* NID check error before verify step */}
                  {nidaError && !nidCheckPassed && (
                    <div className="flex items-center gap-2 p-2.5 mt-3 bg-destructive/10 border border-destructive/30 rounded-md">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{nidaError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Remaining sections — slide-expand after verified ─────── */}
              <div
                className={[
                  'space-y-4 overflow-hidden transition-all duration-500 ease-in-out',
                  nidaVerified ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
              >

                {/* Personal Information */}
                <Card style={cardStyle} className={cardClass}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">
                        {t('company.workersContent.addWorkerModal.stepPersonal')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.firstName')} *</Label>
                        <Input
                          {...register('first_name', { required: t('company.workersContent.addWorkerModal.required') })}
                          readOnly disabled className="bg-muted cursor-not-allowed mt-1"
                        />
                        {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>}
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.lastName')} *</Label>
                        <Input
                          {...register('last_name', { required: t('company.workersContent.addWorkerModal.required') })}
                          readOnly disabled className="bg-muted cursor-not-allowed mt-1"
                        />
                        {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.gender')} *</Label>
                        <select
                          {...register('gender', { required: t('company.workersContent.addWorkerModal.required') })}
                          className="w-full px-3 py-2 border border-input rounded-sm bg-muted cursor-not-allowed mt-1"
                          disabled
                        >
                          <option value="">{t('company.workersContent.addWorkerModal.selectGender')}</option>
                          <option value="male">{t('company.workersContent.addWorkerModal.male')}</option>
                          <option value="female">{t('company.workersContent.addWorkerModal.female')}</option>
                        </select>
                        {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender.message}</p>}
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.dateOfBirth')}</Label>
                        <DatePicker
                          selected={dateOfBirth}
                          onChange={() => { /* locked — from NIDA */ }}
                          dateFormat="dd/MM/yyyy"
                          showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                          className="w-full px-3 py-2 border border-input rounded-sm bg-muted cursor-not-allowed mt-1"
                          wrapperClassName="w-full"
                          readOnly disabled
                        />
                      </div>
                    </div>

                    <div>
                      <Label>{t('company.workersContent.addWorkerModal.profilePhoto')}</Label>
                      <Input
                        type="file" accept="image/jpeg,image/png,image/jpg"
                        onChange={handlePhotoChange}
                        className="mt-1"
                      />
                      {photoPreview && (
                        <img src={photoPreview} alt="preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card style={cardStyle} className={cardClass}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">
                        {t('company.workersContent.addWorkerModal.stepAccount')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.phoneNumber')} *</Label>
                        <Input
                          {...register('phone', { required: t('company.workersContent.addWorkerModal.required') })}
                          placeholder={t('company.workersContent.addWorkerModal.phonePlaceholder')}
                          maxLength={10}
                          className="mt-1"
                        />
                        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <Label>
                          {t('company.workersContent.addWorkerModal.email')}
                          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                        </Label>
                        <Input
                          type="email"
                          {...register('email')}
                          placeholder={t('company.workersContent.addWorkerModal.emailPlaceholder')}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.password')} *</Label>
                        <Input
                          type="password"
                          {...register('password', {
                            required: t('company.workersContent.addWorkerModal.required'),
                            minLength: { value: 8, message: t('company.workersContent.addWorkerModal.minLength8') },
                          })}
                          placeholder="••••••••"
                          className="mt-1"
                        />
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.confirmPassword')} *</Label>
                        <Input
                          type="password"
                          {...register('password_confirmation', {
                            required: t('company.workersContent.addWorkerModal.required'),
                            validate: v => v === watch('password') || t('company.workersContent.addWorkerModal.passwordsDoNotMatch'),
                          })}
                          placeholder="••••••••"
                          className="mt-1"
                        />
                        {errors.password_confirmation && (
                          <p className="text-xs text-destructive mt-1">{errors.password_confirmation.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card style={cardStyle} className={cardClass}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">
                        {t('company.workersContent.addWorkerModal.stepLocation')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.province')}</Label>
                        <Select
                          value={provinceOption}
                          options={provincesData?.map(p => ({ value: p.id, label: p.name })) || []}
                          onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                            setProvinceOption(opt ?? null);
                            setSelectedProvinceId(opt?.value);
                            (setValue as (name: string, value: unknown) => void)('province', opt?.label || '');
                            setDistrictOption(null); setSelectedDistrictId(undefined);
                            setSectorOption(null);   setSelectedSectorId(undefined);
                            setCellOption(null);     setSelectedCellId(undefined);
                            setVillageOption(null);
                            setValue('district', ''); setValue('sector', '');
                            setValue('cell', '');     setValue('village', '');
                          }}
                          placeholder={t('company.workersContent.addWorkerModal.selectProvince')}
                          isClearable className="react-select-container mt-1" classNamePrefix="react-select"
                        />
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.district')} *</Label>
                        <Select
                          value={districtOption}
                          options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                          onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                            setDistrictOption(opt ?? null);
                            setSelectedDistrictId(opt?.value);
                            setValue('district', opt?.label || '');
                            setSectorOption(null); setSelectedSectorId(undefined);
                            setCellOption(null);   setSelectedCellId(undefined);
                            setVillageOption(null);
                            setValue('sector', ''); setValue('cell', ''); setValue('village', '');
                          }}
                          placeholder={t('company.workersContent.addWorkerModal.selectDistrict')}
                          isDisabled={!selectedProvinceId} isClearable
                          className="react-select-container mt-1" classNamePrefix="react-select"
                        />
                        {errors.district && <p className="text-xs text-destructive mt-1">{errors.district.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.sector')} *</Label>
                        <Select
                          value={sectorOption}
                          options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                          onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                            setSectorOption(opt ?? null);
                            setSelectedSectorId(opt?.value);
                            setValue('sector', opt?.label || '');
                            setCellOption(null); setSelectedCellId(undefined);
                            setVillageOption(null);
                            setValue('cell', ''); setValue('village', '');
                          }}
                          placeholder={t('company.workersContent.addWorkerModal.selectSector')}
                          isDisabled={!selectedDistrictId} isClearable
                          className="react-select-container mt-1" classNamePrefix="react-select"
                        />
                        {errors.sector && <p className="text-xs text-destructive mt-1">{errors.sector.message}</p>}
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.cell')}</Label>
                        <Select
                          value={cellOption}
                          options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                          onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                            setCellOption(opt ?? null);
                            setSelectedCellId(opt?.value);
                            setValue('cell', opt?.label || '');
                            setVillageOption(null);
                            setValue('village', '');
                          }}
                          placeholder={t('company.workersContent.addWorkerModal.selectCell')}
                          isDisabled={!selectedSectorId} isClearable
                          className="react-select-container mt-1" classNamePrefix="react-select"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>{t('company.workersContent.addWorkerModal.village')}</Label>
                      <Select
                        value={villageOption}
                        options={villagesData?.map(v => ({ value: v.id, label: v.name })) || []}
                        onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                          setVillageOption(opt ?? null);
                          setValue('village', opt?.label || '');
                        }}
                        placeholder={t('company.workersContent.addWorkerModal.selectVillage')}
                        isDisabled={!selectedCellId} isClearable
                        className="react-select-container mt-1" classNamePrefix="react-select"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Work Preferences */}
                <Card style={cardStyle} className={cardClass}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">
                        {t('company.workersContent.addWorkerModal.stepWork')}
                      </h3>
                    </div>

                    <div>
                      <Label>{t('company.workersContent.addWorkerModal.experienceLevel')} *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EXPERIENCE_LEVELS.map(level => (
                          <Badge
                            key={level.value}
                            variant={watch('experience_level') === level.value ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5"
                            onClick={() => setValue('experience_level', level.value as 'beginner' | 'intermediate' | 'expert')}
                          >
                            {level.label}
                          </Badge>
                        ))}
                      </div>
                      {errors.experience_level && (
                        <p className="text-xs text-destructive mt-1">{errors.experience_level.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>{t('company.workersContent.addWorkerModal.languagesSpoken')} *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {LANGUAGES.map(lang => (
                          <Badge
                            key={lang}
                            variant={selectedLanguages.includes(lang) ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5"
                            onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages, 'languages_spoken')}
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>{t('company.workersContent.addWorkerModal.workTypes')} *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {WORK_TYPES.map(type => (
                          <Badge
                            key={type}
                            variant={selectedWorkTypes.includes(type) ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5"
                            onClick={() => {
                              setSelectedWorkTypes([type]);
                              setValue('work_type_preferences', [type], { shouldValidate: true });
                            }}
                          >
                            {getWorkTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>{t('company.workersContent.addWorkerModal.preferredWorkDistricts')} *</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="modal_select_all_districts"
                            checked={selectAllDistricts}
                            onCheckedChange={(checked) => {
                              setSelectAllDistricts(checked as boolean);
                              if (checked) {
                                const all = allDistrictsData?.map(d => d.name) || [];
                                setSelectedDistricts(all); setValue('preferred_districts', all);
                              } else {
                                setSelectedDistricts([]); setValue('preferred_districts', []);
                              }
                            }}
                          />
                          <Label htmlFor="modal_select_all_districts" className="cursor-pointer text-sm font-normal">
                            {t('company.workersContent.addWorkerModal.allDistricts')}
                          </Label>
                        </div>
                      </div>
                      <Select
                        isMulti
                        value={selectedDistricts.map(d => ({ value: d, label: d }))}
                        options={allDistrictsData?.map(d => ({ value: d.name, label: d.name })) || []}
                        onChange={(opts: MultiValue<{ value: string; label: string }>) => {
                          const sel = opts.map(o => o.value);
                          setSelectedDistricts(sel);
                          setValue('preferred_districts', sel);
                          setSelectAllDistricts(sel.length === (allDistrictsData?.length || 0));
                        }}
                        placeholder={t('company.workersContent.addWorkerModal.searchDistricts')}
                        className="react-select-container" classNamePrefix="react-select"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.minSalary')} *</Label>
                        <Input
                          type="number"
                          {...register('min_salary', {
                            required: t('company.workersContent.addWorkerModal.required'),
                            min: { value: 0, message: t('company.workersContent.addWorkerModal.positiveNumber') },
                          })}
                          placeholder={t('company.workersContent.addWorkerModal.minSalaryPlaceholder')}
                          className="mt-1"
                        />
                        {errors.min_salary && <p className="text-xs text-destructive mt-1">{errors.min_salary.message}</p>}
                      </div>
                      <div>
                        <Label>{t('company.workersContent.addWorkerModal.maxSalary')} *</Label>
                        <Input
                          type="number"
                          {...register('max_salary', { required: t('company.workersContent.addWorkerModal.required') })}
                          placeholder={t('company.workersContent.addWorkerModal.maxSalaryPlaceholder')}
                          className="mt-1"
                        />
                        {errors.max_salary && <p className="text-xs text-destructive mt-1">{errors.max_salary.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ── Health Insurance — identical markup to WorkerRegistrationForm ── */}
                <Card style={cardStyle} className={cardClass}>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">
                        {t('registration.worker.personalInfo.insurance.title')}
                      </h3>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm">
                        {t('registration.worker.personalInfo.insurance.selectType')} *
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleInsuranceTypeChange('MITUELLE_DE_SANTE')}
                          className={[
                            'flex flex-col items-start gap-1 px-4 py-3 rounded-md border-2 text-left transition-all duration-200',
                            insuranceType === 'MITUELLE_DE_SANTE'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50',
                          ].join(' ')}
                        >
                          <span className={[
                            'font-semibold text-sm',
                            insuranceType === 'MITUELLE_DE_SANTE' ? 'text-primary' : 'text-foreground',
                          ].join(' ')}>
                            {t('registration.worker.personalInfo.insurance.mutuelleLabel')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('registration.worker.personalInfo.insurance.mutuelleDesc')}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInsuranceTypeChange('OTHERS')}
                          className={[
                            'flex flex-col items-start gap-1 px-4 py-3 rounded-md border-2 text-left transition-all duration-200',
                            insuranceType === 'OTHERS'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50',
                          ].join(' ')}
                        >
                          <span className={[
                            'font-semibold text-sm',
                            insuranceType === 'OTHERS' ? 'text-primary' : 'text-foreground',
                          ].join(' ')}>
                            {t('registration.worker.personalInfo.insurance.othersLabel')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('registration.worker.personalInfo.insurance.othersDesc')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* MUTUELLE — auto-filled, read-only */}
                    <div className={[
                      'overflow-hidden transition-all duration-400 ease-in-out',
                      insuranceType === 'MITUELLE_DE_SANTE' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0',
                    ].join(' ')}>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <Label>{t('registration.worker.personalInfo.insurance.provider')}</Label>
                          <Input
                            {...register('insurance_provider')}
                            readOnly disabled className="bg-muted cursor-not-allowed mt-1"
                          />
                        </div>
                        <div>
                          <Label>{t('registration.worker.personalInfo.insurance.number')}</Label>
                          <Input
                            {...register('insurance_number')}
                            readOnly disabled className="bg-muted cursor-not-allowed mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* OTHERS — manual entry */}
                    <div className={[
                      'overflow-hidden transition-all duration-400 ease-in-out',
                      insuranceType === 'OTHERS' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0',
                    ].join(' ')}>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <Label>{t('registration.worker.personalInfo.insurance.provider')} *</Label>
                          <Input
                            {...register('insurance_provider')}
                            placeholder={t('registration.worker.personalInfo.insurance.providerPlaceholder')}
                            className="mt-1"
                          />
                          {errors.insurance_provider && (
                            <p className="text-xs text-destructive mt-1">{errors.insurance_provider.message}</p>
                          )}
                        </div>
                        <div>
                          <Label>{t('registration.worker.personalInfo.insurance.number')} *</Label>
                          <Input
                            {...register('insurance_number')}
                            placeholder={t('registration.worker.personalInfo.insurance.numberPlaceholder')}
                            className="mt-1"
                          />
                          {errors.insurance_number && (
                            <p className="text-xs text-destructive mt-1">{errors.insurance_number.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pb-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t('company.workersContent.addWorkerModal.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="px-8">
                    {isLoading && <Loader2 className="animate-spin mr-1 h-4 w-4" />}
                    {isLoading
                      ? t('company.workersContent.addWorkerModal.registering')
                      : t('company.workersContent.addWorkerModal.registerWorker')}
                  </Button>
                </div>

              </div>{/* end animated section */}

            </div>
          </ScrollArea>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerModal;