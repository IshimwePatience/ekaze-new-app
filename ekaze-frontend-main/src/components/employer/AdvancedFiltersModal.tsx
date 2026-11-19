import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react';

export interface AdvancedFilters {
  services: string[];
  education_level: string;
  min_years_experience: number | null;
  max_years_experience: number | null;
  available_days: string[];
  available_weekends: boolean | null;
  available_holidays: boolean | null;
  has_driving_licence: boolean | null;
  has_cooking_certificate: boolean | null;
  has_first_aid_certificate: boolean | null;
  has_childcare_certificate: boolean | null;
  preferred_work_type: string;
  is_physically_fit: boolean | null;
  marital_status: string;
}

export const defaultAdvancedFilters: AdvancedFilters = {
  services: [],
  education_level: 'all',
  min_years_experience: null,
  max_years_experience: null,
  available_days: [],
  available_weekends: null,
  available_holidays: null,
  has_driving_licence: null,
  has_cooking_certificate: null,
  has_first_aid_certificate: null,
  has_childcare_certificate: null,
  preferred_work_type: 'all',
  is_physically_fit: null,
  marital_status: 'all',
};

interface Props {
  open: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
}

export const AdvancedFiltersModal = ({ open, onClose, filters, onApply }: Props) => {
  const { language } = useLanguage();
  const t = translations[language].advancedFilters;

  const [local, setLocal] = useState<AdvancedFilters>(filters);
  const [expandedSection, setExpandedSection] = useState<string | null>("services");

  const SERVICE_OPTIONS = [
    { value: 'is_baby_sitter',      label: t.services.babySitter },
    { value: 'accept_laundry',      label: t.services.laundry },
    { value: 'accept_ironing',      label: t.services.ironing },
    { value: 'accept_house_chores', label: t.services.houseChores },
    { value: 'accept_cooking',      label: t.services.cooking },
    { value: 'accept_gardening',    label: t.services.gardening },
    { value: 'accept_car_washing',  label: t.services.carWashing },
    { value: 'accept_elderly_care', label: t.services.elderlyCare },
    { value: 'accept_childcare',    label: t.services.childcare },
    { value: 'accept_pet_care',     label: t.services.petCare },
    { value: 'accept_shopping',     label: t.services.shopping },
    { value: 'accept_driving',      label: t.services.driving },
  ];

  const DAY_OPTIONS = [
    { value: 'monday',    label: t.days.monday },
    { value: 'tuesday',   label: t.days.tuesday },
    { value: 'wednesday', label: t.days.wednesday },
    { value: 'thursday',  label: t.days.thursday },
    { value: 'friday',    label: t.days.friday },
    { value: 'saturday',  label: t.days.saturday },
    { value: 'sunday',    label: t.days.sunday },
  ];

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? null : sec);
  };

  const toggleService = (val: string) => {
    setLocal(prev => ({
      ...prev,
      services: prev.services.includes(val)
        ? prev.services.filter(s => s !== val)
        : [...prev.services, val],
    }));
  };

  const toggleDay = (val: string) => {
    setLocal(prev => ({
      ...prev,
      available_days: prev.available_days.includes(val)
        ? prev.available_days.filter(d => d !== val)
        : [...prev.available_days, val],
    }));
  };

  const toggleBool = (key: keyof AdvancedFilters, val: boolean) => {
    setLocal(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  };

  const handleReset = () => {
    setLocal(defaultAdvancedFilters);
    onApply(defaultAdvancedFilters);
    onClose();
  };

  const activeCount = [
    local.services.length > 0,
    local.education_level !== 'all',
    local.min_years_experience !== null || local.max_years_experience !== null,
    local.available_days.length > 0,
    local.available_weekends !== null,
    local.available_holidays !== null,
    local.has_driving_licence !== null,
    local.has_cooking_certificate !== null,
    local.has_first_aid_certificate !== null,
    local.has_childcare_certificate !== null,
    local.preferred_work_type !== 'all',
    local.is_physically_fit !== null,
    local.marital_status !== 'all',
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full h-[70vh] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 flex flex-col overflow-hidden font-sans border-0 [&>button]:hidden text-slate-800">
        
        {/* Cookie Consent Modal Header - Single X Button */}
        <div className="px-8 pt-6 pb-2 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Customise Consent Preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Description */}
        <div className="px-8 py-2 text-left space-y-1.5 shrink-0">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Select specific preferences to refine your worker search and find candidates matching your exact domestic staffing requirements.
          </p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Options categorised as "Services" and "Certificates" allow you to view pre-screened professionals in Rwanda.
          </p>
        </div>

        {/* Accordion List (Cookie Consent Scroll Area) */}
        <div className="px-8 py-4 overflow-y-auto space-y-3 text-left flex-1 min-h-0">

          {/* 1. Services Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div
              onClick={() => toggleSection("services")}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSection === "services" ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-900">{t.sectionServices}</span>
              </div>

              {local.services.length > 0 && (
                <span className="text-xs font-bold text-[#1677ff] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {local.services.length} Selected
                </span>
              )}
            </div>

            {expandedSection === "services" && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40">
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(s => {
                    const isSelected = local.services.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        onClick={() => toggleService(s.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Education & Experience Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div
              onClick={() => toggleSection("education")}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSection === "education" ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-900">{t.sectionEducation} & {t.sectionExperience}</span>
              </div>
            </div>

            {expandedSection === "education" && (
              <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    {t.sectionEducation}
                  </label>
                  <Select
                    value={local.education_level}
                    onValueChange={v => setLocal(p => ({ ...p, education_level: v }))}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder={t.education.all} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.education.all}</SelectItem>
                      <SelectItem value="none">{t.education.none}</SelectItem>
                      <SelectItem value="primary">{t.education.primary}</SelectItem>
                      <SelectItem value="secondary">{t.education.secondary}</SelectItem>
                      <SelectItem value="advanced">{t.education.advanced}</SelectItem>
                      <SelectItem value="tvet">{t.education.tvet}</SelectItem>
                      <SelectItem value="bachelor">{t.education.bachelor}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    {t.sectionExperience} (Years)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      placeholder={t.experienceMin}
                      value={local.min_years_experience ?? ''}
                      onChange={e => setLocal(p => ({
                        ...p,
                        min_years_experience: e.target.value ? +e.target.value : null,
                      }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs"
                    />
                    <span className="text-slate-400 text-xs">–</span>
                    <input
                      type="number"
                      min={0}
                      placeholder={t.experienceMax}
                      value={local.max_years_experience ?? ''}
                      onChange={e => setLocal(p => ({
                        ...p,
                        max_years_experience: e.target.value ? +e.target.value : null,
                      }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Certificates & Verification Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div
              onClick={() => toggleSection("certificates")}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSection === "certificates" ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-900">{t.sectionCertificates}</span>
              </div>
            </div>

            {expandedSection === "certificates" && (
              <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'has_driving_licence'       as keyof AdvancedFilters, label: t.certificates.driving },
                    { key: 'has_cooking_certificate'   as keyof AdvancedFilters, label: t.certificates.cooking },
                    { key: 'has_first_aid_certificate' as keyof AdvancedFilters, label: t.certificates.firstAid },
                    { key: 'has_childcare_certificate' as keyof AdvancedFilters, label: t.certificates.childcare },
                  ].map(({ key, label }) => {
                    const isChecked = local[key] === true;
                    return (
                      <div
                        key={key}
                        onClick={() => toggleBool(key, true)}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-all"
                      >
                        <span className="text-xs font-bold text-slate-800">{label}</span>
                        <div className="flex items-center gap-2 cursor-pointer">
                          {isChecked ? (
                            <div className="w-5 h-5 rounded border border-[#1677ff] bg-[#1677ff] text-white flex items-center justify-center font-bold shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white hover:border-slate-400 transition-all" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Cookie Consent Footer Buttons (Reject All / Save My Preferences / Accept All style) */}
        <div className="px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-full border-2 border-[#1677ff] text-[#1677ff] bg-white hover:bg-blue-50 text-xs font-extrabold transition-all cursor-pointer"
          >
            {t.resetButton || 'Reject All'}
          </button>
          <button
            type="button"
            onClick={() => { onApply(local); onClose(); }}
            className="px-6 py-2.5 rounded-full bg-[#1677ff] text-white hover:bg-blue-600 shadow-md text-xs font-extrabold transition-all cursor-pointer"
          >
            {t.applyButton || 'Save My Preferences'} {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};