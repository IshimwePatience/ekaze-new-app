import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SearchFilters as FilterType, Worker, DISTRICTS, LANGUAGES, EXPERIENCE_LEVELS, WORK_TYPES } from '../types/worker';
import { cn } from '../clsx/utils';
import locationsData from '@/data/locations.json';
import ReactSelect from 'react-select';
import type { MultiValue } from 'react-select';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface SearchFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  workerCounts: {
    districts: Record<string, number>;
    experience: Record<string, number>;
    languages: Record<string, number>;
    workTypes: Record<string, number>;
  };
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-3 sm:pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
      </button>
      {isOpen && <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">{children}</div>}
    </div>
  );
};

export const SearchFilters = ({ filters, onFiltersChange, workerCounts }: SearchFiltersProps) => {
  const { language } = useLanguage();
  const t = translations[language].searchFilters;

  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const updateFilter = <K extends keyof FilterType>(key: K, value: FilterType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'districts' | 'experience' | 'languages' | 'workTypes', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.gender !== 'all' ||
    filters.ageMin > 18 ||
    filters.ageMax < 60 ||
    filters.districts.length > 0 ||
    filters.salaryMin > 0 ||
    filters.salaryMax < 100000 ||
    filters.experience.length > 0 ||
    filters.languages.length > 0 ||
    filters.hasInsurance !== 'all' ||
    filters.workerType !== 'all' ||
    filters.workTypes.length > 0 ||
    filters.availableOnly;

  const allDistricts = locationsData.districts.map(d => d.name);
  const districtsWithWorkers = allDistricts.filter(d => (workerCounts.districts[d] || 0) > 0);
  const visibleLanguages = showAllLanguages ? LANGUAGES : LANGUAGES.slice(0, 3);

  return (
    <div className="bg-card rounded-lg border border-border p-3 sm:p-4 md:p-5 shadow-card">
      {/* Search Input */}
      <div className="relative mb-3 sm:mb-4 md:mb-5">
        <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.searchPlaceholder}
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="mb-3 sm:mb-4 w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-8 sm:h-9 text-xs sm:text-sm"
        >
          <X className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.clearFilters}
        </Button>
      )}

      <div className="space-y-3 sm:space-y-4">
        {/* Gender */}
        <FilterSection title={t.gender}>
          <Select value={filters.gender} onValueChange={(v) => updateFilter('gender', v as FilterType['gender'])}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder={t.genderOptions.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.genderOptions.all}</SelectItem>
              <SelectItem value="male">{t.genderOptions.male}</SelectItem>
              <SelectItem value="female">{t.genderOptions.female}</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Location */}
        <FilterSection title={t.location}>
          <ReactSelect
            isMulti
            value={filters.districts.map(d => ({ value: d, label: d }))}
            options={districtsWithWorkers.map(d => ({ value: d, label: d }))}
            onChange={(options: MultiValue<{ value: string; label: string }> | null) => {
              const selected = options ? options.map(opt => opt.value) : [];
              updateFilter('districts', selected);
            }}
            placeholder={t.locationPlaceholder}
            className="react-select-container text-xs sm:text-sm"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '32px',
                fontSize: '0.75rem',
                '@media (min-width: 640px)': {
                  minHeight: '36px',
                  fontSize: '0.875rem',
                }
              }),
            }}
          />
        </FilterSection>

        {/* Worker Type */}
        <FilterSection title={t.workerType}>
          <Select value={filters.workerType} onValueChange={(v) => updateFilter('workerType', v as FilterType['workerType'])}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder={t.workerTypeOptions.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.workerTypeOptions.all}</SelectItem>
              <SelectItem value="company">{t.workerTypeOptions.company}</SelectItem>
              <SelectItem value="freelance">{t.workerTypeOptions.freelance}</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Work Type */}
        <FilterSection title={t.workType}>
          <div className="space-y-1.5 sm:space-y-2">
            {WORK_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center justify-between text-xs sm:text-sm hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Checkbox
                    checked={filters.workTypes.includes(type.value)}
                    onCheckedChange={() => toggleArrayFilter('workTypes', type.value)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span>{type.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {workerCounts.workTypes[type.value] || 0}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Experience Level */}
        <FilterSection title={t.experience}>
          <div className="space-y-1.5 sm:space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level.value}
                className="flex cursor-pointer items-center justify-between text-xs sm:text-sm hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Checkbox
                    checked={filters.experience.includes(level.value)}
                    onCheckedChange={() => toggleArrayFilter('experience', level.value)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span>{level.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {workerCounts.experience[level.value] || 0}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Age Range */}
        <FilterSection title={t.ageRange}>
          <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <Slider
              value={[filters.ageMin, filters.ageMax]}
              min={18}
              max={60}
              step={1}
              onValueChange={([min, max]) => {
                updateFilter('ageMin', min);
                updateFilter('ageMax', max);
              }}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <span>{filters.ageMin} - {filters.ageMax}</span>
            </div>
          </div>
        </FilterSection>

        {/* Salary Range */}
        <FilterSection title={t.salary}>
          <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <Slider
              value={[filters.salaryMin, filters.salaryMax]}
              min={0}
              max={100000}
              step={5000}
              onValueChange={([min, max]) => {
                updateFilter('salaryMin', min);
                updateFilter('salaryMax', max);
              }}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                {filters.salaryMin.toLocaleString()} - {filters.salaryMax.toLocaleString()}
              </span>
            </div>
          </div>
        </FilterSection>

        {/* Languages */}
        <FilterSection title={t.languages}>
          <div className="space-y-1.5 sm:space-y-2">
            {visibleLanguages.map((lang) => (
              <label
                key={lang}
                className="flex cursor-pointer items-center justify-between text-xs sm:text-sm hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Checkbox
                    checked={filters.languages.includes(lang)}
                    onCheckedChange={() => toggleArrayFilter('languages', lang)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span>{lang}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {workerCounts.languages[lang] || 0}
                </span>
              </label>
            ))}
          </div>
          {LANGUAGES.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className="mt-1.5 sm:mt-2 w-full text-primary hover:text-primary h-7 sm:h-8 text-xs sm:text-sm"
            >
              {showAllLanguages ? t.showLess : t.showMore}
            </Button>
          )}
        </FilterSection>

        {/* Insurance */}
        <FilterSection title={t.insurance}>
          <Select value={filters.hasInsurance} onValueChange={(v) => updateFilter('hasInsurance', v as FilterType['hasInsurance'])}>
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder={t.insuranceOptions.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.insuranceOptions.all}</SelectItem>
              <SelectItem value="yes">{t.insuranceOptions.yes}</SelectItem>
              <SelectItem value="no">{t.insuranceOptions.no}</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Available Only */}
        <div className="pt-1 sm:pt-2">
          <label className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:text-primary transition-colors">
            <Checkbox
              checked={filters.availableOnly}
              onCheckedChange={(checked) => updateFilter('availableOnly', checked === true)}
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            />
            <span>{t.availableOnly}</span>
          </label>
        </div>
      </div>
    </div>
  );
};