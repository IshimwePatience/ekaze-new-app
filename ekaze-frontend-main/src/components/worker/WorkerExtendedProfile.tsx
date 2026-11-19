import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  Briefcase,
  Heart,
  Clock,
  Award,
  Users,
  BookOpen,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ReactSelect, { MultiValue } from 'react-select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useExtendedProfile, useUpdateExtendedProfile } from '@/hooks/useExtendedProfile';
import type {
  UpdateExtendedProfileRequest,
  EducationLevel,
  PreferredWorkType,
  DrivingLicenceType,
  MaritalStatus,
  PreferredSector,
  DayOfWeek,
  PreviousEmployer,
  Certification,
} from '@/types/otherProfile.types';
import { useLanguage } from '@/contexts/LanguageContext';

// ── Constants ──────────────────────────────────────────────────────────────────

const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'none', label: 'No formal education' },
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary / O-Level' },
  { value: 'advanced', label: 'Advanced / A-Level' },
  { value: 'tvet', label: 'TVET / Technical Vocational' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
];

const WORK_TYPES: { value: PreferredWorkType; label: string }[] = [
  { value: 'live_in', label: 'Live-in (stay at employer home)' },
  { value: 'live_out', label: 'Live-out (come daily)' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'flexible', label: 'Flexible' },
];

const SECTOR_OPTIONS: { value: PreferredSector; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'private_home', label: 'Private Home' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'office', label: 'Office' },
  { value: 'school', label: 'School' },
  { value: 'ngo', label: 'NGO' },
  { value: 'other', label: 'Other' },
];

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const LICENCE_TYPES: { value: DrivingLicenceType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'A', label: 'Category A (Motorcycle)' },
  { value: 'B', label: 'Category B (Car)' },
  { value: 'C', label: 'Category C (Truck)' },
];

const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

// ── Section wrapper ─────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section = ({ title, icon, children, defaultOpen = true }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      {open && <CardContent className="pt-0 space-y-4">{children}</CardContent>}
    </Card>
  );
};

// ── Bool row ────────────────────────────────────────────────────────────────────

interface BoolRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const BoolRow = ({ label, description, checked, onChange }: BoolRowProps) => (
  <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ── Completion bar ──────────────────────────────────────────────────────────────

const CompletionBar = ({ percent }: { percent: number }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{t("worker.extendedProfile.completion.title")}</span>
        <span className="text-xs font-bold text-foreground">{percent}%</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────

const WorkerExtendedProfile = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useExtendedProfile();
  const updateMutation = useUpdateExtendedProfile();

  const [form, setForm] = useState<UpdateExtendedProfileRequest>({});
  const [previousEmployers, setPreviousEmployers] = useState<PreviousEmployer[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [formReady, setFormReady] = useState(false);
  
  // Populate form when data loads
  useEffect(() => {
    if (!data?.data) return;
    const p = data.data;

    setForm({
      education_level: p.education_level,
      education_option: p.education_option ?? '',
      education_institution: p.education_institution ?? '',
      education_year_completed: p.education_year_completed ?? undefined,

      past_experiences: p.past_experiences ?? '',
      years_of_experience: p.years_of_experience,

      is_baby_sitter: p.is_baby_sitter,
      accept_laundry: p.accept_laundry,
      accept_ironing: p.accept_ironing,
      accept_house_chores: p.accept_house_chores,
      accept_cooking: p.accept_cooking,
      accept_gardening: p.accept_gardening,
      accept_car_washing: p.accept_car_washing,
      accept_elderly_care: p.accept_elderly_care,
      accept_childcare: p.accept_childcare,
      accept_pet_care: p.accept_pet_care,
      accept_shopping: p.accept_shopping,
      accept_driving: p.accept_driving,

      preferred_sectors: p.preferred_sectors ?? [],
      preferred_work_type: p.preferred_work_type,

      available_days: p.available_days ?? [],
      available_from: p.available_from ?? '',
      available_to: p.available_to ?? '',
      available_weekends: p.available_weekends,
      available_holidays: p.available_holidays,

      has_driving_licence: p.has_driving_licence,
      driving_licence_type: p.driving_licence_type,
      has_cooking_certificate: p.has_cooking_certificate,
      has_first_aid_certificate: p.has_first_aid_certificate,
      has_childcare_certificate: p.has_childcare_certificate,

      is_physically_fit: p.is_physically_fit,
      has_medical_conditions: p.has_medical_conditions,
      medical_conditions_details: p.medical_conditions_details ?? '',

      referee_3_name: p.referee_3_name ?? '',
      referee_3_phone: p.referee_3_phone ?? '',
      referee_3_relationship: p.referee_3_relationship ?? '',

      marital_status: p.marital_status ?? undefined,
      number_of_dependents: p.number_of_dependents,
      religion: p.religion ?? '',

      bio: p.bio ?? '',
      special_skills: p.special_skills ?? '',
    });

    setPreviousEmployers(p.previous_employers ?? []);
    setCertifications(p.certifications ?? []);
    setIsDirty(false);
    setFormReady(true);
  }, [data]);

  // Generic field setter
  const set = <K extends keyof UpdateExtendedProfileRequest>(
    key: K,
    value: UpdateExtendedProfileRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  // Previous employers
  const addEmployer = () => {
    setPreviousEmployers((prev) => [...prev, { name: '', role: '', duration: '', location: '' }]);
    setIsDirty(true);
  };
  const updateEmployer = (i: number, field: keyof PreviousEmployer, val: string) => {
    setPreviousEmployers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
    setIsDirty(true);
  };
  const removeEmployer = (i: number) => {
    setPreviousEmployers((prev) => prev.filter((_, idx) => idx !== i));
    setIsDirty(true);
  };

  // Certifications
  const addCert = () => {
    setCertifications((prev) => [...prev, { name: '', issuer: '', year: undefined }]);
    setIsDirty(true);
  };
  const updateCert = (i: number, field: keyof Certification, val: string | number) => {
    setCertifications((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
    setIsDirty(true);
  };
  const removeCert = (i: number) => {
    setCertifications((prev) => prev.filter((_, idx) => idx !== i));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    await updateMutation.mutateAsync({
      ...form,
      previous_employers: previousEmployers,
      certifications,
    });
    setIsDirty(false);
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">{t("worker.extendedProfile.loadError")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("worker.extendedProfile.loadErrorHint")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completion = data.data.profile_completion_percent;

  // ── Derived react-select values ────────────────────────────
  const selectedSectorValues = SECTOR_OPTIONS.filter((o) =>
    (form.preferred_sectors ?? []).includes(o.value)
  );

  const selectedDayValues = DAY_OPTIONS.filter((o) =>
    (form.available_days ?? []).includes(o.value)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("worker.extendedProfile.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("worker.extendedProfile.subtitle")}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={handleSubmit}
          disabled={!isDirty || updateMutation.isPending}
        >
          <Save className="w-3 h-3" />
          {updateMutation.isPending ? t("worker.extendedProfile.saving") : t("worker.extendedProfile.saveChanges")}
        </Button>
      </div>

      {/* Completion bar */}
      <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
        <CardContent className="p-5">
          <CompletionBar percent={completion} />
        </CardContent>
      </Card>

      {/* ── Education ─────────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.education")} icon={<GraduationCap className="w-4 h-4 text-blue-600" />}>
        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.educationLevel")}</Label>
          <Select
            value={form.education_level}
            onValueChange={(v) => set('education_level', v as EducationLevel)}
          >
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.fieldOption")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.fieldOption")}
              value={form.education_option ?? ''}
              onChange={(e) => set('education_option', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.institution")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.institution")}
              value={form.education_institution ?? ''}
              onChange={(e) => set('education_institution', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.yearCompleted")}</Label>
          <Input
            type="number"
            min={1990}
            max={new Date().getFullYear()}
            placeholder={t("worker.extendedProfile.placeholders.year")}
            value={form.education_year_completed ?? ''}
            onChange={(e) => set('education_year_completed', parseInt(e.target.value))}
            className="text-sm w-40"
          />
        </div>
      </Section>

      {/* ── Experience ────────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.experience")} icon={<Briefcase className="w-4 h-4 text-purple-600" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.yearsOfExperience")}</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={form.years_of_experience ?? 0}
              onChange={(e) => set('years_of_experience', parseInt(e.target.value))}
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.pastExperiences")}</Label>
          {formReady ? (
            <RichTextEditor
              value={form.past_experiences ?? ''}
              onChange={(val) => set('past_experiences', val)}
              placeholder={t("worker.extendedProfile.placeholders.pastExperiences")}
              minHeight={150}
            />
          ) : (
            <div className="h-[150px] rounded-md border border-border/40 bg-muted/20 animate-pulse" />
          )}
        </div>

        {/* Previous Employers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t("worker.extendedProfile.fields.previousEmployers")}</Label>
            <Button type="button" variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={addEmployer}>
              <Plus className="w-3 h-3" /> {t("worker.extendedProfile.actions.add")}
            </Button>
          </div>
          {previousEmployers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border/50 rounded-lg">
              {t("worker.extendedProfile.empty.employers")}
            </p>
          )}
          {previousEmployers.map((emp, i) => (
            <div key={i} className="p-4 border border-border/40 rounded-xl space-y-3 relative">
              <button
                type="button"
                onClick={() => removeEmployer(i)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.employerName")} *</Label>
                  <Input
                    placeholder={t("worker.extendedProfile.placeholders.employerName")}
                    value={emp.name}
                    onChange={(e) => updateEmployer(i, 'name', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.yourRole")}</Label>
                  <Input
                    placeholder={t("worker.extendedProfile.placeholders.role")}
                    value={emp.role ?? ''}
                    onChange={(e) => updateEmployer(i, 'role', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.duration")}</Label>
                  <Input
                    placeholder={t("worker.extendedProfile.placeholders.duration")}
                    value={emp.duration ?? ''}
                    onChange={(e) => updateEmployer(i, 'duration', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.location")}</Label>
                  <Input
                    placeholder={t("worker.extendedProfile.placeholders.location")}
                    value={emp.location ?? ''}
                    onChange={(e) => updateEmployer(i, 'location', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Services / Skills ─────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.services")} icon={<Heart className="w-4 h-4 text-rose-600" />}>
        <p className="text-xs text-muted-foreground">{t("worker.extendedProfile.servicesHint")}</p>
        <div className="space-y-1">
          <BoolRow 
            label={t("worker.extendedProfile.services.babySitting")} 
            description={t("worker.extendedProfile.services.babySittingDesc")} 
            checked={form.is_baby_sitter ?? false} 
            onChange={(v) => set('is_baby_sitter', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.laundry")} 
            checked={form.accept_laundry ?? false} 
            onChange={(v) => set('accept_laundry', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.ironing")} 
            checked={form.accept_ironing ?? false} 
            onChange={(v) => set('accept_ironing', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.houseChores")} 
            description={t("worker.extendedProfile.services.houseChoresDesc")} 
            checked={form.accept_house_chores ?? false} 
            onChange={(v) => set('accept_house_chores', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.cooking")} 
            checked={form.accept_cooking ?? false} 
            onChange={(v) => set('accept_cooking', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.gardening")} 
            checked={form.accept_gardening ?? false} 
            onChange={(v) => set('accept_gardening', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.carWashing")} 
            checked={form.accept_car_washing ?? false} 
            onChange={(v) => set('accept_car_washing', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.elderlyCare")} 
            description={t("worker.extendedProfile.services.elderlyCareDesc")} 
            checked={form.accept_elderly_care ?? false} 
            onChange={(v) => set('accept_elderly_care', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.childcare")} 
            description={t("worker.extendedProfile.services.childcareDesc")} 
            checked={form.accept_childcare ?? false} 
            onChange={(v) => set('accept_childcare', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.petCare")} 
            checked={form.accept_pet_care ?? false} 
            onChange={(v) => set('accept_pet_care', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.shopping")} 
            description={t("worker.extendedProfile.services.shoppingDesc")} 
            checked={form.accept_shopping ?? false} 
            onChange={(v) => set('accept_shopping', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.services.driving")} 
            description={t("worker.extendedProfile.services.drivingDesc")} 
            checked={form.accept_driving ?? false} 
            onChange={(v) => set('accept_driving', v)} 
          />
        </div>
      </Section>

      {/* ── Preferred Sectors & Work Type ─────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.preferredWork")} icon={<Briefcase className="w-4 h-4 text-indigo-600" />}>
        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.preferredWorkType")}</Label>
          <Select
            value={form.preferred_work_type}
            onValueChange={(v) => set('preferred_work_type', v as PreferredWorkType)}
          >
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORK_TYPES.map((w) => (
                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.preferredSectors")}</Label>
          <ReactSelect
            isMulti
            options={SECTOR_OPTIONS}
            value={selectedSectorValues}
            onChange={(selected: MultiValue<{ value: PreferredSector; label: string }>) => {
              set('preferred_sectors', selected.map((s) => s.value));
            }}
            placeholder={t("worker.extendedProfile.placeholders.selectSectors")}
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </Section>

      {/* ── Availability / Schedule ───────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.availability")} icon={<Clock className="w-4 h-4 text-amber-600" />}>
        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.availableDays")}</Label>
          <ReactSelect
            isMulti
            options={DAY_OPTIONS}
            value={selectedDayValues}
            onChange={(selected: MultiValue<{ value: DayOfWeek; label: string }>) => {
              set('available_days', selected.map((d) => d.value));
            }}
            placeholder={t("worker.extendedProfile.placeholders.selectDays")}
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.availableFrom")}</Label>
            <Input
              type="time"
              value={form.available_from ?? ''}
              onChange={(e) => set('available_from', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.availableTo")}</Label>
            <Input
              type="time"
              value={form.available_to ?? ''}
              onChange={(e) => set('available_to', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <BoolRow 
            label={t("worker.extendedProfile.availability.weekends")} 
            checked={form.available_weekends ?? false} 
            onChange={(v) => set('available_weekends', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.availability.holidays")} 
            checked={form.available_holidays ?? false} 
            onChange={(v) => set('available_holidays', v)} 
          />
        </div>
      </Section>

      {/* ── Certificates ─────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.certificates")} icon={<Award className="w-4 h-4 text-green-600" />}>
        <div className="space-y-1">
          <BoolRow 
            label={t("worker.extendedProfile.certificates.hasDrivingLicence")} 
            checked={form.has_driving_licence ?? false} 
            onChange={(v) => set('has_driving_licence', v)} 
          />
          {form.has_driving_licence && (
            <div className="space-y-2 pl-2 pt-2">
              <Label className="text-xs">{t("worker.extendedProfile.fields.licenceCategory")}</Label>
              <Select
                value={form.driving_licence_type ?? 'none'}
                onValueChange={(v) => set('driving_licence_type', v as DrivingLicenceType)}
              >
                <SelectTrigger className="text-sm w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LICENCE_TYPES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <BoolRow 
            label={t("worker.extendedProfile.certificates.hasCooking")} 
            checked={form.has_cooking_certificate ?? false} 
            onChange={(v) => set('has_cooking_certificate', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.certificates.hasFirstAid")} 
            checked={form.has_first_aid_certificate ?? false} 
            onChange={(v) => set('has_first_aid_certificate', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.certificates.hasChildcare")} 
            checked={form.has_childcare_certificate ?? false} 
            onChange={(v) => set('has_childcare_certificate', v)} 
          />
        </div>

        {/* Certifications list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t("worker.extendedProfile.fields.otherCertifications")}</Label>
            <Button type="button" variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={addCert}>
              <Plus className="w-3 h-3" /> {t("worker.extendedProfile.actions.add")}
            </Button>
          </div>
          {certifications.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border/50 rounded-lg">
              {t("worker.extendedProfile.empty.certifications")}
            </p>
          )}
          {certifications.map((cert, i) => (
            <div key={i} className="p-3 border border-border/40 rounded-xl space-y-2 relative">
              <button
                type="button"
                onClick={() => removeCert(i)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                <div className="space-y-1">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.certificateName")} *</Label>
                  <Input 
                    placeholder={t("worker.extendedProfile.placeholders.certificateName")} 
                    value={cert.name} 
                    onChange={(e) => updateCert(i, 'name', e.target.value)} 
                    className="text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.issuer")}</Label>
                  <Input 
                    placeholder={t("worker.extendedProfile.placeholders.issuer")} 
                    value={cert.issuer ?? ''} 
                    onChange={(e) => updateCert(i, 'issuer', e.target.value)} 
                    className="text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("worker.extendedProfile.fields.year")}</Label>
                  <Input
                    type="number"
                    min={1990}
                    max={new Date().getFullYear()}
                    placeholder={t("worker.extendedProfile.placeholders.year")}
                    value={cert.year ?? ''}
                    onChange={(e) => updateCert(i, 'year', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Health ────────────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.health")} icon={<Heart className="w-4 h-4 text-red-500" />} defaultOpen={false}>
        <div className="space-y-1">
          <BoolRow 
            label={t("worker.extendedProfile.health.physicallyFit")} 
            description={t("worker.extendedProfile.health.physicallyFitDesc")} 
            checked={form.is_physically_fit ?? true} 
            onChange={(v) => set('is_physically_fit', v)} 
          />
          <BoolRow 
            label={t("worker.extendedProfile.health.hasMedicalConditions")} 
            description={t("worker.extendedProfile.health.medicalConditionsDesc")} 
            checked={form.has_medical_conditions ?? false} 
            onChange={(v) => set('has_medical_conditions', v)} 
          />
        </div>
        {form.has_medical_conditions && (
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.medicalDetails")}</Label>
            <RichTextEditor
              value={form.medical_conditions_details ?? ''}
              onChange={(val) => set('medical_conditions_details', val)}
              placeholder={t("worker.extendedProfile.placeholders.medicalDetails")}
              minHeight={120}
            />
          </div>
        )}
      </Section>

      {/* ── Personal / Social ─────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.personal")} icon={<Users className="w-4 h-4 text-cyan-600" />} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.maritalStatus")}</Label>
            <Select
              value={form.marital_status ?? ''}
              onValueChange={(v) => set('marital_status', v as MaritalStatus)}
            >
              <SelectTrigger className="text-sm"><SelectValue placeholder={t("worker.extendedProfile.placeholders.select")} /></SelectTrigger>
              <SelectContent>
                {MARITAL_STATUSES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.dependents")}</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={form.number_of_dependents ?? 0}
              onChange={(e) => set('number_of_dependents', parseInt(e.target.value))}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.religion")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.religion")}
              value={form.religion ?? ''}
              onChange={(e) => set('religion', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </Section>

      {/* ── Extra Referee ─────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.referee")} icon={<Users className="w-4 h-4 text-orange-500" />} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.refereeName")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.refereeName")}
              value={form.referee_3_name ?? ''}
              onChange={(e) => set('referee_3_name', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.refereePhone")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.phone")}
              value={form.referee_3_phone ?? ''}
              onChange={(e) => set('referee_3_phone', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("worker.extendedProfile.fields.refereeRelationship")}</Label>
            <Input
              placeholder={t("worker.extendedProfile.placeholders.relationship")}
              value={form.referee_3_relationship ?? ''}
              onChange={(e) => set('referee_3_relationship', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </Section>

      {/* ── Bio ───────────────────────────────────────────────── */}
      <Section title={t("worker.extendedProfile.sections.bio")} icon={<BookOpen className="w-4 h-4 text-violet-600" />} defaultOpen={false}>
        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.bio")}</Label>
          <RichTextEditor
            value={form.bio ?? ''}
            onChange={(val) => set('bio', val)}
            placeholder={t("worker.extendedProfile.placeholders.bio")}
            minHeight={180}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t("worker.extendedProfile.fields.specialSkills")}</Label>
          <RichTextEditor
            value={form.special_skills ?? ''}
            onChange={(val) => set('special_skills', val)}
            placeholder={t("worker.extendedProfile.placeholders.specialSkills")}
            minHeight={120}
          />
        </div>
      </Section>

      {/* Bottom Save */}
      <div className="flex justify-end pb-6">
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={handleSubmit}
          disabled={!isDirty || updateMutation.isPending}
        >
          <Save className="w-3 h-3" />
          {updateMutation.isPending ? t("worker.extendedProfile.saving") : t("worker.extendedProfile.saveAllChanges")}
        </Button>
      </div>

    </div>
  );
};

export default WorkerExtendedProfile;