import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AnalyticsFilters, AnalyticsPeriod } from '@/types/fullanalytics.types';

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  extra?: React.ReactNode;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today',  label: 'Today'       },
  { value: 'week',   label: 'This week'   },
  { value: 'month',  label: 'This month'  },
  { value: 'year',   label: 'This year'   },
  { value: 'custom', label: 'Custom range' },
];

export function AnalyticsFilterBar({ filters, onChange, extra }: AnalyticsFilterBarProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate,   setToDate]   = useState<Date | undefined>();

  const isCustom = filters.period === 'custom';

  // Sync custom dates → parent
  useEffect(() => {
    if (isCustom && fromDate && toDate) {
      onChange({
        ...filters,
        start_date: format(fromDate, 'yyyy-MM-dd'),
        end_date:   format(toDate,   'yyyy-MM-dd'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  function handlePeriodChange(value: AnalyticsPeriod) {
    if (value !== 'custom') {
      setFromDate(undefined);
      setToDate(undefined);
      onChange({ ...filters, period: value, start_date: undefined, end_date: undefined });
    } else {
      onChange({ ...filters, period: value });
    }
  }

  function handleClear() {
    setFromDate(undefined);
    setToDate(undefined);
    onChange({ ...filters, period: 'month', start_date: undefined, end_date: undefined });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* Period selector */}
      <Select
        value={filters.period ?? 'month'}
        onValueChange={v => handlePeriodChange(v as AnalyticsPeriod)}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs gap-1.5">
          <Calendar className="w-3 h-3 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom range pickers */}
      {isCustom && (
        <>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/60">
            <Filter className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="text-[10px] text-muted-foreground font-medium">From</span>
            <DatePicker date={fromDate} onDateChange={setFromDate} placeholder="Start date" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] text-muted-foreground font-medium">To</span>
            <DatePicker
              date={toDate}
              onDateChange={setToDate}
              placeholder="End date"
              disabled={!fromDate}
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </>
      )}

      {/* Module-specific extra filters */}
      {extra}
    </div>
  );
}