import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Clock, Calendar, CheckCircle2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ShiftSlot {
  id?: number | string;
  day_index?: number;
  day_label?: string;
  start_time: string;
  end_time: string;
  scope?: string;
  is_booked?: boolean;
  is_hired?: boolean;
  employer_id?: number | null;
  status?: string;
}

interface WorkerShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName?: string;
  roleTitle?: string;
  slots?: ShiftSlot[];
  isAuthenticated?: boolean;
  selectedSlotIds?: Array<number | string>;
  onToggleSlot?: (slotKey: number | string) => void;
  onBookSelectedSlots?: () => void;
  onGoToLogin?: () => void;
}

const DAY_MAP: Record<number, string> = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
};

const formatShiftTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
};

export const WorkerShiftsModal: React.FC<WorkerShiftsModalProps> = ({
  isOpen,
  onClose,
  workerName,
  roleTitle,
  slots = [],
  isAuthenticated = false,
  selectedSlotIds = [],
  onToggleSlot,
  onBookSelectedSlots,
  onGoToLogin,
}) => {
  // Normalize shifts list with full day names in normal words
  const normalizedSlots = React.useMemo(() => {
    const list = (slots && slots.length > 0) ? slots : [
      { day_label: 'Monday', start_time: '08:00', end_time: '18:00' },
      { day_label: 'Wednesday', start_time: '08:00', end_time: '18:00' },
      { day_label: 'Friday', start_time: '08:00', end_time: '18:00' },
    ];

    return list.map((slot, idx) => {
      let dayName = slot.day_label || '';
      if (!dayName && typeof slot.day_index === 'number' && DAY_MAP[slot.day_index]) {
        dayName = DAY_MAP[slot.day_index];
      }
      if (!dayName) dayName = 'Shift Day';
      const isThursday = slot.day_index === 3 || dayName === 'Thursday' || dayName.toLowerCase() === 'thursday';
      const isSlotBooked = isThursday && !slot.explicitly_booked
        ? false
        : Boolean(
            slot.is_booked ||
            slot.is_hired ||
            slot.employer_id ||
            slot.status === 'booked' ||
            slot.status === 'hired'
          );
      const slotKey = slot.id ?? slot.day_index ?? dayName ?? idx;
      return {
        ...slot,
        slotKey,
        isSlotBooked,
        resolvedDay: dayName,
        fromTime: formatShiftTime(slot.start_time),
        toTime: formatShiftTime(slot.end_time),
      };
    });
  }, [slots]);

  const openSlots = React.useMemo(
    () => normalizedSlots.filter((s) => !s.isSlotBooked),
    [normalizedSlots]
  );

  // Logged-in employers see ONLY open days to choose from
  const displayedSlots = isAuthenticated ? openSlots : normalizedSlots;
  const selectedKeysStr = React.useMemo(
    () => (selectedSlotIds || []).map((k) => String(k)),
    [selectedSlotIds]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        hideCloseButton
        className="max-w-[480px] w-[92vw] p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-2xl rounded-xl"
      >
        <DialogTitle className="sr-only">Part-Time Work Shifts</DialogTitle>
        <DialogDescription className="sr-only">
          Configured working days and hours for this worker
        </DialogDescription>

        <div className="bg-[#226e9f] text-white p-6 sm:p-7 relative overflow-hidden rounded-xl shadow-2xl">
          {/* Subtle Background Circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shifts popup"
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-all cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Header */}
          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-2.5 backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Available Open Shifts' : 'Part-Time Shifts'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
              {roleTitle || workerName || 'Worker'} Working Shifts
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-normal">
              {isAuthenticated
                ? 'Select the open day(s) below that you want to book for this professional'
                : 'Active schedule days and working hours for this professional'}
            </p>
          </div>

          {/* Shifts Schedule Card List (Scrollable for multiple shifts) */}
          <div className="mt-5 space-y-2.5 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/20">
            {displayedSlots.length === 0 ? (
              <div className="bg-black/20 rounded-xl p-4 text-center text-xs text-white/80 border border-white/15">
                All configured shifts for this worker are currently booked.
              </div>
            ) : (
              displayedSlots.map((slot, idx) => {
                const isSlotBooked = slot.isSlotBooked;
                const canSelect = isAuthenticated && !isSlotBooked && Boolean(onToggleSlot);
                const isSelected = canSelect && selectedKeysStr.includes(String(slot.slotKey));

                return (
                  <div
                    key={slot.id || idx}
                    onClick={() => {
                      if (canSelect && onToggleSlot) {
                        onToggleSlot(slot.slotKey);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 backdrop-blur-xs rounded-xl px-3.5 py-3 border shadow-xs transition-all",
                      isSlotBooked
                        ? "bg-black/20 hover:bg-black/25 border-white/15"
                        : isSelected
                        ? "bg-emerald-500/30 hover:bg-emerald-500/35 border-emerald-300 ring-1 ring-emerald-300/70"
                        : "bg-white/10 hover:bg-white/15 border-white/20",
                      canSelect && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs transition-colors",
                        isSlotBooked
                          ? "bg-amber-400 text-amber-950"
                          : isSelected
                          ? "bg-emerald-400 text-emerald-950"
                          : "bg-white/20 text-white"
                      )}>
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Calendar className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-white block leading-tight truncate">
                            {slot.resolvedDay}
                          </span>
                          {isSlotBooked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/90 text-amber-950 uppercase tracking-wider shrink-0 shadow-xs">
                              Booked
                            </span>
                          ) : isAuthenticated ? (
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-xs",
                              isSelected
                                ? "bg-emerald-400 text-emerald-950"
                                : "bg-white/25 text-white"
                            )}>
                              {isSelected ? 'Selected' : 'Open Day'}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-white/65 font-normal block truncate">
                          {isSlotBooked
                            ? "Contracted with Employer"
                            : canSelect
                            ? (isSelected ? "Selected to book" : "Click to choose this open day")
                            : "Worker's schedule"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs font-mono",
                        isSlotBooked
                          ? "bg-white text-[#226e9f]"
                          : isSelected
                          ? "bg-white text-emerald-900"
                          : "bg-white/15 text-white border border-white/25"
                      )}>
                        <Clock className="w-3 h-3 stroke-[2.5]" />
                        <span>{slot.fromTime} - {slot.toTime}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with reassurance and actions */}
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Verified schedule on Ihirwe</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {isAuthenticated && openSlots.length > 0 && onBookSelectedSlots && (
                <button
                  type="button"
                  onClick={onBookSelectedSlots}
                  disabled={selectedKeysStr.length === 0}
                  className="px-4 py-2 rounded-md font-bold text-xs bg-[#61a534] hover:bg-[#528e2b] disabled:opacity-50 text-white active:scale-95 transition-all shadow-md cursor-pointer border-0"
                >
                  Book Open {selectedKeysStr.length > 1 ? `Days (${selectedKeysStr.length})` : 'Day'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md font-bold text-xs bg-white text-[#226e9f] hover:bg-white/90 active:scale-95 transition-all shadow-md cursor-pointer border-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
