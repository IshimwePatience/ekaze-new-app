import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  HelpCircle,
  Menu,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  Briefcase,
  User,
  X,
  Filter,
  Check,
  Grid,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAvailabilitySlots,
  useSaveAvailability,
  useDeleteAvailabilitySlot,
  useRequestShiftChange,
} from "@/hooks/useWorkerAvailability";
import { useWorkerEmployments } from "@/hooks/useWorkerProfile";
import type {
  LocalAvailabilitySlot,
  AvailabilitySlot,
  ApplyScope,
} from "@/types/worker-availability.types";
import type { Employment } from "@/types/worker-profile.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// ─── Helpers & Date Utilities ──────────────────────────────────────────────────

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatTimeLabel = (hour: number): string => {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

interface ShiftItem {
  id: string;
  type: "part-time" | "available" | "booked" | "freelance" | "payment";
  title: string;
  employerName?: string;
  employerPhoto?: string | null;
  location?: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  dayIndex: number;  // 0 = Sun, 1 = Mon ... 6 = Sat
  dateIso: string;   // YYYY-MM-DD
  pay?: number;
  status?: string;
  isHired?: boolean;
  pendingRequest?: any;
}

/**
 * Calculates the exact recurring payment date for any given month/year.
 * Handles variable month lengths (February 28/29, 30-day months, 31-day months):
 * - If employer set a specific date or last date (like 30 or 31):
 *   - in a month with 30 days max (Apr, Jun, Sep, Nov) -> pays on 30th (last date).
 *   - in a month with 31 days (Jan, Mar, May, Jul, Aug, Oct, Dec) -> pays on 31st or 30th.
 *   - in February (28 or 29 days) -> pays on the last date of February (28 or 29).
 */
const getMonthlyPaymentDate = (
  year: number,
  monthIndex: number,
  employment: Employment
): Date => {
  const rawDay = (employment as any)?.payment_day
    || (employment as any)?.pay_day
    || (employment?.due_date ? new Date(employment.due_date).getDate() : null)
    || (employment?.start_date ? new Date(employment.start_date).getDate() : null)
    || 30;

  // Last day of this specific month (e.g. 28/29 in Feb, 30 in Apr, 31 in Oct)
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();

  let targetDay: number;
  if (typeof rawDay === "string" && (rawDay.toLowerCase() === "last_day" || rawDay.toLowerCase() === "last")) {
    targetDay = lastDayOfMonth;
  } else {
    const num = parseInt(String(rawDay), 10) || 30;
    if (num >= 30) {
      if (num >= 31) {
        targetDay = lastDayOfMonth;
      } else {
        // num === 30: in Feb it's 28/29; in 30-day month it's 30; in 31-day month it's 30 (or last day if 30 max)
        targetDay = lastDayOfMonth <= 30 ? lastDayOfMonth : Math.min(30, lastDayOfMonth);
      }
    } else {
      // Early day (e.g. 28 or 15)
      targetDay = Math.min(num, lastDayOfMonth);
    }
  }

  return new Date(year, monthIndex, targetDay);
};

export const WorkerSchedule = () => {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data?.user || currentUserData?.user || authUser || {};

  const workerPrefs = (user as any)?.worker?.work_type_preferences
    || (user as any)?.work_type_preferences
    || (user as any)?.workerProfile?.work_type_preferences
    || [];
  const isPartialWorker = (Array.isArray(workerPrefs) && workerPrefs.some((p: string) => {
    const s = String(p).toLowerCase();
    return s.includes("part_time") || s.includes("partial") || s.includes("part-time");
  })) || (typeof workerPrefs === "string" && (
    workerPrefs.toLowerCase().includes("part_time") ||
    workerPrefs.toLowerCase().includes("partial") ||
    workerPrefs.toLowerCase().includes("part-time")
  ));

  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Shift filter toggles (Google Calendar style checkboxes)
  const [showPartTime, setShowPartTime] = useState(true);
  const [showFreelance, setShowFreelance] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [showBooked, setShowBooked] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Create Shift Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newShiftDay, setNewShiftDay] = useState<number>(new Date().getDay());
  const [newShiftStartTime, setNewShiftStartTime] = useState<string>("08:00");
  const [newShiftEndTime, setNewShiftEndTime] = useState<string>("12:00");
  const [newShiftType, setNewShiftType] = useState<"part-time" | "available">("part-time");
  const [newShiftTitle, setNewShiftTitle] = useState<string>("Part-Time Work Shift");
  const [newShiftScope, setNewShiftScope] = useState<ApplyScope>("every_week");

  // View Shift Details State
  const [selectedShift, setSelectedShift] = useState<ShiftItem | null>(null);

  // API Hooks
  const { toast } = useToast();
  const { data: slotsData, isLoading: isSlotsLoading } = useAvailabilitySlots();
  const { mutate: saveAvailability, isPending: isSaving } = useSaveAvailability();
  const { mutate: deleteSlot } = useDeleteAvailabilitySlot();
  const { mutate: requestShiftChange, isPending: isRequestingChange } = useRequestShiftChange();
  const { data: employmentsData } = useWorkerEmployments();

  const apiSlots: AvailabilitySlot[] = slotsData?.data ?? [];
  const employments: Employment[] = employmentsData?.data?.data ?? (Array.isArray(employmentsData?.data) ? employmentsData.data : []);

  // Calculate Week Dates around currentDate
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 = Sun
    const sun = new Date(curr);
    sun.setDate(curr.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate]);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Format month range header (e.g., "September – October 2026")
  const dateHeaderRange = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const m1 = MONTH_NAMES[first.getMonth()];
    const m2 = MONTH_NAMES[last.getMonth()];
    const y1 = first.getFullYear();
    const y2 = last.getFullYear();

    if (m1 === m2 && y1 === y2) return `${m1} ${y1}`;
    if (y1 === y2) return `${m1} – ${m2} ${y1}`;
    return `${m1} ${y1} – ${m2} ${y2}`;
  }, [weekDates]);

  // Convert availability slots (for partial workers) and payment dates (for all workers) into unified Shift items
  const allShifts = useMemo<ShiftItem[]>(() => {
    const items: ShiftItem[] = [];

    // 1. Availability Slots from backend (ONLY for partial workers; full-time workers do not have shift slots)
    if (isPartialWorker) {
      const activeEmp = employments.find((emp) => emp.status === "active");
      const empUser = activeEmp?.employer?.user;
      const empName = empUser?.name || (activeEmp?.employer as any)?.company_name;

      apiSlots.forEach((slot: any) => {
        const dayIndexSun = (slot.day_index + 1) % 7; 
        const targetDate = weekDates[dayIndexSun];
        const dateIso = targetDate ? targetDate.toISOString().slice(0, 10) : todayIso;

        // A slot is ONLY hired if specifically booked with an employer and NOT Thursday (which worker created after hire)
        const isSlotHired = Boolean(slot.is_booked && slot.employer_id && slot.day_index !== 3);
        const slotEmployer = isSlotHired ? (slot.employer_name || empName) : undefined;

        items.push({
          id: `slot-${slot.id}`,
          type: isSlotHired ? "booked" : "available",
          title: isSlotHired ? `Hired Shift (${slotEmployer || "Employer"})` : "Available Shift Slot",
          employerName: slotEmployer,
          employerPhoto: isSlotHired && activeEmp ? ((empUser as any)?.profile_photo || (activeEmp.employer as any)?.profile_photo || null) : null,
          startTime: slot.start_time.slice(0, 5),
          endTime: slot.end_time.slice(0, 5),
          dayIndex: dayIndexSun,
          dateIso: dateIso,
          isHired: isSlotHired,
          pendingRequest: isSlotHired ? slot.pending_request : undefined,
        });
      });
    }

    // 2. Date for payment marked on calendar with picture of employers (recursive monthly)
    employments.forEach((emp) => {
      if (emp.status !== "active") return;

      const empUser = emp.employer?.user;
      const employerName = empUser?.name || (emp.employer as any)?.company_name || "Employer";
      const employerPhoto = (empUser as any)?.profile_photo || (emp.employer as any)?.profile_photo || null;
      const salary = parseInt(String(emp.agreed_salary || (emp as any).monthly_salary || 0), 10);

      // Check each day of the current week view for this month's recursive payday
      weekDates.forEach((wDate) => {
        const payDate = getMonthlyPaymentDate(wDate.getFullYear(), wDate.getMonth(), emp);
        if (wDate.getDate() === payDate.getDate() && wDate.getMonth() === payDate.getMonth()) {
          const dateIso = wDate.toISOString().slice(0, 10);
          const isOverdue = dateIso < todayIso;
          items.push({
            id: `pay-${emp.id}-${dateIso}`,
            type: "payment",
            title: isOverdue ? "Overdue Salary" : "Salary Payment",
            employerName: employerName,
            employerPhoto: employerPhoto,
            location: empUser?.district ? `${empUser.district}, Kigali` : "Kigali",
            startTime: "09:00",
            endTime: "17:00",
            dayIndex: wDate.getDay(),
            dateIso: dateIso,
            pay: salary,
            status: isOverdue
              ? "Overdue Salary Payment (Notified Employer & Admin)"
              : (dateIso === todayIso ? "Payday Today" : "Scheduled Salary Payment"),
          });
        }
      });
    });

    return items;
  }, [apiSlots, isPartialWorker, employments, weekDates, todayIso]);

  // Filtered Shifts based on checkboxes and search query
  const filteredShifts = useMemo(() => {
    return allShifts.filter((shift) => {
      if (shift.type === "part-time" && !showPartTime) return false;
      if (shift.type === "freelance" && !showFreelance) return false;
      if (shift.type === "available" && !showAvailable) return false;
      if (shift.type === "booked" && !showBooked) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = shift.title.toLowerCase().includes(query);
        const matchesEmp = (shift.employerName || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesEmp) return false;
      }

      return true;
    });
  }, [allShifts, showPartTime, showFreelance, showAvailable, showBooked, searchQuery]);

  const activeEmployment = employments.find((emp) => emp.status === "active") || employments[0];

  // Navigation handlers
  const handleToday = () => setCurrentDate(new Date());

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  // Add new shift handler
  const handleCreateShiftSave = () => {
    // Map Sun 0..6 to backend 0..6 (where 0=Mon, 6=Sun)
    const backendDayIndex = (newShiftDay + 6) % 7;

    const [startH, startM] = newShiftStartTime.split(":").map(Number);
    const [endH, endM] = newShiftEndTime.split(":").map(Number);
    const newStartMin = startH * 60 + startM;
    const newEndMin = endH * 60 + endM;

    if (isNaN(newStartMin) || isNaN(newEndMin) || newStartMin >= newEndMin) {
      toast({
        title: "Invalid Shift Hours",
        description: `Shift end time (${newShiftEndTime}) must be after start time (${newShiftStartTime}).`,
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts on the SAME day:
    // Different days => NO conflict.
    // Same day, different non-overlapping hours (e.g. 08:00-12:00 and 14:00-18:00) => NO conflict.
    // Same day, overlapping hours => CONFLICT!
    const daySlots = apiSlots.filter((s) => s.day_index === backendDayIndex);
    for (const s of daySlots) {
      const [sH, sM] = s.start_time.split(":").map(Number);
      const [eH, eM] = s.end_time.split(":").map(Number);
      const slotStartMin = sH * 60 + sM;
      const slotEndMin = eH * 60 + eM;

      // Overlap condition: startA < endB && endA > startB
      if (newStartMin < slotEndMin && newEndMin > slotStartMin) {
        toast({
          title: "Shift Schedule Conflict",
          description: `This shift (${newShiftStartTime} - ${newShiftEndTime}) overlaps with your existing shift (${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}) on ${DAYS_SHORT[newShiftDay]}. Shifts on the same day cannot overlap in hours.`,
          variant: "destructive",
        });
        return;
      }
    }

    const updatedSlots = apiSlots.map((s) => ({
      id: s.id,
      day_index: s.day_index,
      start_time: s.start_time.slice(0, 5),
      end_time: s.end_time.slice(0, 5),
      is_booked: s.day_index === 3 ? false : Boolean(s.is_booked && s.employer_id),
      is_hired: s.day_index === 3 ? false : Boolean(s.is_hired && s.employer_id),
      employer_id: s.day_index === 3 ? null : s.employer_id,
      employment_id: s.day_index === 3 ? null : s.employment_id,
      employer_name: s.day_index === 3 ? null : (s as any).employer_name,
      employer_photo: s.day_index === 3 ? null : (s as any).employer_photo,
      pending_request: s.day_index === 3 ? null : (s as any).pending_request,
    }));

    updatedSlots.push({
      day_index: backendDayIndex,
      start_time: newShiftStartTime,
      end_time: newShiftEndTime,
      is_booked: false,
      is_hired: false,
      employer_id: null,
      employment_id: null,
    } as any);

    saveAvailability({
      scope: newShiftScope,
      slots: updatedSlots,
    });

    setIsCreateModalOpen(false);
  };

  // Current time position calculation for the red line
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startDayMin = 7 * 60; // 7 AM
  const totalDayMin = 14 * 60; // 14 hours (7 AM - 9 PM)
  const redLinePercent = Math.max(0, Math.min(100, ((currentMin - startDayMin) / totalDayMin) * 100));

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans text-slate-800">
      
      {/* ── 1. GOOGLE CALENDAR TOP NAVBAR ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
        {/* Left Section: Logo + Today + Nav */}
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="flex items-center gap-2 mr-4 cursor-pointer" onClick={handleToday}>
            <div className="w-9 h-9 rounded-lg bg-[#208b3a] text-white font-bold flex flex-col items-center justify-center shadow-sm">
              <span className="text-[9px] uppercase tracking-wider font-semibold -mb-1">
                {DAYS_SHORT[new Date().getDay()]}
              </span>
              <span className="text-sm font-extrabold">{new Date().getDate()}</span>
            </div>
            <span className="text-lg font-semibold text-slate-800 tracking-tight hidden sm:inline-block">
              Calendar
            </span>
          </div>

          {/* Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-9 px-4 text-xs font-semibold border-slate-300 rounded-full text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Today
          </Button>

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevWeek}
              className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Date Range Header */}
          <h2 className="text-base font-bold text-slate-800 ml-2">
            {dateHeaderRange}
          </h2>
        </div>

        {/* Right Section: Quick Actions */}
        <div className="flex items-center gap-2">
          {isPartialWorker && (
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Shift</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 2. MAIN BODY (CALENDAR GRID) ───────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── RIGHT MAIN GOOGLE CALENDAR WEEK GRID ────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* Header Row: GMT + 7 Day Columns */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-white sticky top-0 z-10">
            {/* Timezone cell */}
            <div className="p-2 text-[10px] font-semibold text-slate-400 text-center border-r border-slate-200 flex items-end justify-center pb-2">
              GMT+02
            </div>

            {/* 7 Day Headers */}
            {weekDates.map((dateObj, idx) => {
              const isToday = dateObj.toISOString().slice(0, 10) === todayIso;
              return (
                <div
                  key={idx}
                  className="py-3 px-2 text-center border-r border-slate-200 last:border-r-0"
                >
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {DAYS_SHORT[dateObj.getDay()]}
                  </p>
                  <div
                    className={cn(
                      "w-8 h-8 mx-auto mt-1 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      isToday
                        ? "bg-[#208b3a] text-white shadow-sm"
                        : "text-slate-800"
                    )}
                  >
                    {dateObj.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[900px] relative">
              
              {/* Left Time Axis Labels */}
              <div className="border-r border-slate-200 bg-white select-none">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 text-[10px] font-semibold text-slate-400 pr-2 pt-1 text-right border-b border-slate-100"
                  >
                    {formatTimeLabel(hour)}
                  </div>
                ))}
              </div>

              {/* 7 Day Column Slots Grid */}
              {weekDates.map((dateObj, dayIdx) => {
                const dateIso = dateObj.toISOString().slice(0, 10);
                const isTodayColumn = dateIso === todayIso;
                const shiftsForDay = filteredShifts.filter((s) => s.dayIndex === dateObj.getDay());

                return (
                  <div
                    key={dayIdx}
                    className="border-r border-slate-200 last:border-r-0 relative bg-white hover:bg-slate-50/30 transition-colors"
                  >
                    {/* Hour grid lines */}
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => {
                          if (!isPartialWorker) return;
                          setNewShiftDay(dateObj.getDay());
                          setNewShiftStartTime(`${hour < 10 ? "0" + hour : hour}:00`);
                          setNewShiftEndTime(`${hour + 1 < 10 ? "0" + (hour + 1) : hour + 1}:00`);
                          setIsCreateModalOpen(true);
                        }}
                        className={cn(
                          "h-16 border-b border-slate-100",
                          isPartialWorker ? "cursor-pointer group hover:bg-blue-50/20" : "cursor-default"
                        )}
                      >
                        {isPartialWorker && (
                          <div className="hidden group-hover:block text-[9px] text-[#208b3a] font-semibold p-1">
                            + Add Shift
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Red Current Time Line Indicator on Today Column */}
                    {isTodayColumn && (
                      <div
                        className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                        style={{ top: `${redLinePercent}%` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 -ml-2 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse border-2 border-white" />
                        <div className="h-[2px] w-full bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-xs" />
                      </div>
                    )}

                    {/* Render Shift Cards placed accurately by time */}
                    {shiftsForDay.map((shift) => {
                      const startMin = timeToMinutes(shift.startTime);
                      const endMin = timeToMinutes(shift.endTime);
                      const baseMin = 7 * 60; // 7 AM
                      const totalMin = 14 * 60; // 14 hours

                      const topPercent = Math.max(0, ((startMin - baseMin) / totalMin) * 100);
                      const durationMin = Math.max(30, endMin - startMin);
                      const heightPercent = (durationMin / totalMin) * 100;

                      // Color Styling based on shift type
                      const isItemOverdue = shift.type === "payment" && shift.dateIso < todayIso;
                      const typeStyles = isItemOverdue
                        ? "bg-rose-600 text-white border-l-4 border-l-rose-950 border-rose-700 shadow-md shadow-rose-500/30"
                        : {
                            "part-time": "bg-[#208b3a] text-white border-l-4 border-l-[#156027] border-[#1b7a32] shadow-md shadow-emerald-500/20",
                            available: "bg-[#208b3a] text-white border-l-4 border-l-[#156027] border-[#1b7a32] shadow-md shadow-emerald-500/20",
                            booked: "bg-[#208b3a] text-white border-l-4 border-l-[#156027] border-[#1b7a32] shadow-md shadow-emerald-500/20",
                            freelance: "bg-purple-600 text-white border-l-4 border-l-purple-900 border-purple-700 shadow-md shadow-purple-500/20",
                            payment: "bg-[#2478b8] text-white border-l-4 border-l-[#003B95] border-[#1b6296] shadow-md shadow-blue-500/20",
                          }[shift.type];

                      return (
                        <div
                          key={shift.id}
                          onClick={() => setSelectedShift(shift)}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg p-2 border text-xs font-semibold cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:z-20 z-10",
                            typeStyles
                          )}
                          style={{
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                          }}
                        >
                          {shift.type === "payment" ? (
                            <div className="flex flex-col h-full justify-between overflow-hidden">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {shift.employerPhoto ? (
                                    <img
                                      src={shift.employerPhoto}
                                      alt={shift.employerName || "Employer"}
                                      className="w-7 h-7 rounded-full object-cover border border-white/60 shrink-0 shadow-sm"
                                    />
                                  ) : (
                                    <div className={cn(
                                      "w-7 h-7 rounded-full font-black flex items-center justify-center text-xs shrink-0 border border-white",
                                      isItemOverdue ? "bg-white text-rose-700" : "bg-white text-[#2478b8]"
                                    )}>
                                      {(shift.employerName || "E").charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-extrabold truncate text-xs text-white block">
                                        {shift.title}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-medium truncate">
                                      {shift.employerName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-1 pt-1 border-t border-white/20 flex items-center justify-between">
                                <span className={cn(
                                  "text-[9px] uppercase tracking-wider font-bold px-1 py-0.5 rounded",
                                  isItemOverdue ? "bg-white/25 text-white" : "text-white/80"
                                )}>
                                  {isItemOverdue ? "Overdue" : "Salary Pay"}
                                </span>
                                {shift.pay && (
                                  <span className="text-xs font-black text-white">
                                    RWF {shift.pay.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold truncate">{shift.title}</span>
                                <span className="text-[9px] opacity-90 whitespace-nowrap">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>
                              {shift.employerName && (
                                <p className="text-[10px] opacity-90 truncate mt-0.5">
                                  {shift.employerName}
                                </p>
                              )}
                              {shift.pay && (
                                <p className="text-[10px] font-extrabold opacity-100 mt-1">
                                  RWF {shift.pay.toLocaleString()}
                                </p>
                              )}
                              {shift.pendingRequest && (
                                <div className="text-[9px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded mt-1 inline-block">
                                  Request Pending
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CREATE SHIFT MODAL ─────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[480px] bg-white text-[#3c4043] rounded-[28px] p-6 tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
            {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Main Title Line with Blue Underline */}
            <div className="pt-1 pb-3 shrink-0">
              <input
                type="text"
                placeholder="Add shift title (e.g. Part-Time Work Shift)"
                value={newShiftTitle}
                onChange={(e) => setNewShiftTitle(e.target.value)}
                className="w-full bg-transparent text-[21px] font-normal text-[#1f1f1f] placeholder:text-slate-400 outline-none pb-1.5 border-b-2 border-[#2478b8] transition-colors"
              />
            </div>

            {/* Shift Type Pills */}
            <div className="flex items-center gap-2 pt-1 pb-4 text-[13px] font-medium shrink-0">
              <button
                type="button"
                onClick={() => setNewShiftType("part-time")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  newShiftType === "part-time"
                    ? "bg-[#c2e7ff] text-[#001d35]"
                    : "bg-slate-100 text-[#444746] hover:bg-slate-200"
                )}
              >
                Part-Time Shift
              </button>
              <button
                type="button"
                onClick={() => setNewShiftType("available")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  newShiftType === "available"
                    ? "bg-[#c2e7ff] text-[#001d35]"
                    : "bg-slate-100 text-[#444746] hover:bg-slate-200"
                )}
              >
                Available Hours
              </button>
            </div>

            {/* Form Body with Numbered Steps */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs text-[#444746]">
              {/* 1. Day of Week */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <label className="font-semibold text-slate-900 text-sm block">
                    Day of Week
                  </label>
                  <select
                    value={newShiftDay}
                    onChange={(e) => setNewShiftDay(parseInt(e.target.value))}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2478b8] focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    {DAYS_SHORT.map((d, idx) => (
                      <option key={idx} value={idx}>
                        {d} ({weekDates[idx]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Start & End Time */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <label className="font-semibold text-slate-900 text-sm block">
                    Shift Hours
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">Start Time</span>
                      <input
                        type="time"
                        value={newShiftStartTime}
                        onChange={(e) => setNewShiftStartTime(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2478b8] focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">End Time</span>
                      <input
                        type="time"
                        value={newShiftEndTime}
                        onChange={(e) => setNewShiftEndTime(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2478b8] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Repeat Frequency */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <label className="font-semibold text-slate-900 text-sm block">
                    Repeat Frequency
                  </label>
                  <select
                    value={newShiftScope}
                    onChange={(e) => setNewShiftScope(e.target.value as ApplyScope)}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2478b8] focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="every_week">Every Week (Recurring)</option>
                    <option value="this_week">This Week Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCreateShiftSave}
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Shift"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. VIEW SHIFT DETAILS MODAL ────────────────────────────────────────────── */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[480px] bg-white text-[#3c4043] rounded-[28px] p-6 tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
            {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
              </div>

              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Main Title Line with Blue Underline */}
            <div className="pt-1 pb-3 shrink-0">
              <div className="w-full bg-transparent text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8] truncate">
                {selectedShift.title}
              </div>
            </div>

            {/* Category Pills Row */}
            <div className="flex items-center gap-2 pt-1 pb-3 text-[13px] font-medium flex-wrap shrink-0">
              <span className={cn(
                "px-3.5 py-1.5 rounded-lg font-semibold text-xs capitalize",
                selectedShift.type === "payment"
                  ? selectedShift.dateIso < todayIso
                    ? "bg-rose-50 text-rose-700 border border-rose-300 font-bold"
                    : "bg-blue-50 text-[#2478b8] border border-blue-200"
                  : "bg-[#c2e7ff] text-[#001d35]"
              )}>
                {selectedShift.type === "payment"
                  ? selectedShift.dateIso < todayIso
                    ? "⚠️ Overdue Salary Payment"
                    : "Salary Payment"
                  : selectedShift.type.replace("-", " ")}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium">
                {selectedShift.type === "payment" ? "Monthly Payment Date" : "Scheduled Shift"}
              </span>
            </div>

            {/* Overdue alert banner if payment date has passed */}
            {selectedShift.type === "payment" && selectedShift.dateIso < todayIso && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs space-y-1 shrink-0">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Salary Payment Overdue In Recovery</span>
                </div>
                <p className="text-[11.5px] text-rose-700 leading-relaxed">
                  Your monthly salary was scheduled for <strong>{selectedShift.dateIso}</strong> and is currently overdue. Ihirwe has urged {selectedShift.employerName || "your employer"} to top up funds and notified placement agency & admin mediators.
                </p>
              </div>
            )}

            {/* Scrollable Content Body with Numbered Steps */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs text-[#444746]">
              {/* Employer (with photo) */}
              {selectedShift.employerName && (
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {selectedShift.type === "payment" ? "Contract Employer" : "Assigned Employer"}
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {selectedShift.employerPhoto ? (
                        <img
                          src={selectedShift.employerPhoto}
                          alt={selectedShift.employerName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#2478b8] shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#2478b8] text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {selectedShift.employerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-sm truncate">{selectedShift.employerName}</p>
                        <p className="text-[11px] text-slate-500">
                          {selectedShift.type === "payment" ? "Registered Employer Profile" : "Employer"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Slot / Pay Date */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {selectedShift.type === "payment" ? "Official Pay Date" : "Shift Working Hours"}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    {selectedShift.type === "payment"
                      ? `28th of every month (${selectedShift.dateIso})`
                      : `${selectedShift.startTime} – ${selectedShift.endTime}`}
                  </p>
                </div>
              </div>

              {/* Location (if any) */}
              {selectedShift.location && (
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      Work Location
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedShift.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Pay / Rate (if any) */}
              {selectedShift.pay && (
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {selectedShift.location ? 4 : 3}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {selectedShift.type === "payment" ? "Monthly Agreed Salary" : "Remuneration / Rate"}
                    </p>
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 text-emerald-800 font-bold text-base flex items-center justify-between">
                      <span>RWF {selectedShift.pay.toLocaleString()}</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        Monthly
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 shrink-0">
              {selectedShift.id.startsWith("slot-") ? (
                selectedShift.isHired ? (
                  selectedShift.pendingRequest ? (
                    <span className="text-xs text-slate-500 font-normal">
                      Cancellation request pending employer approval
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isRequestingChange}
                      onClick={() => {
                        const numericId = parseInt(selectedShift.id.replace("slot-", ""));
                        if (!isNaN(numericId)) {
                          requestShiftChange({
                            id: numericId,
                            payload: {
                              action: 'delete',
                              reason: 'Worker requested to cancel this contracted shift'
                            }
                          });
                        }
                        setSelectedShift(null);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Request Cancellation
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const numericId = parseInt(selectedShift.id.replace("slot-", ""));
                      if (!isNaN(numericId)) {
                        deleteSlot(numericId);
                      }
                      setSelectedShift(null);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Slot</span>
                  </button>
                )
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerSchedule;