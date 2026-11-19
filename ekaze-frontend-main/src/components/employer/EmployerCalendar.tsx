import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Check,
  X,
  AlertTriangle,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ShiftRequest {
  id: number;
  worker_id: number;
  worker_name: string;
  worker_photo: string | null;
  slot_id: number;
  action: "delete" | "change";
  current_day: string;
  current_time: string;
  proposed_day?: string;
  proposed_time?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface BookedShift {
  id: string;
  slot_id: number;
  worker_id: number;
  worker_name: string;
  worker_photo: string | null;
  worker_phone: string | null;
  day_index: number; // 0=Mon ... 6=Sun
  day_label: string;
  start_time: string;
  end_time: string;
  pending_request?: any;
}

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

export const EmployerCalendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<BookedShift[]>([]);
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [selectedShift, setSelectedShift] = useState<BookedShift | null>(null);
  const [isResponding, setIsResponding] = useState<number | null>(null);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const fetchData = async () => {
    try {
      const [shiftsRes, reqsRes] = await Promise.all([
        api.get("/employer/calendar/shifts").catch(() => ({ data: { data: [] } })),
        api.get("/employer/shifts/requests").catch(() => ({ data: { data: [] } })),
      ]);
      setShifts(shiftsRes.data?.data || []);
      setRequests(reqsRes.data?.data || []);
    } catch (error) {
      console.error("Failed to load employer calendar:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (requestId: number, status: "approved" | "rejected") => {
    setIsResponding(requestId);
    try {
      const res = await api.post(`/employer/shifts/requests/${requestId}/respond`, { status });
      if (res.data?.success) {
        toast({
          variant: status === "approved" ? "default" : "default",
          title: status === "approved" ? "Shift Request Approved" : "Shift Request Declined",
          description: status === "approved"
            ? "The worker schedule has been updated automatically."
            : "The shift request was declined. The scheduled shift remains unchanged.",
        });
        fetchData();
        setSelectedShift(null);
      }
    } catch {
      toast({
        title: "Action Failed",
        description: "Could not process shift request.",
        variant: "destructive",
      });
    } finally {
      setIsResponding(null);
    }
  };

  // Calculate week dates
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

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Red line indicator
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startDayMin = 7 * 60; // 7 AM
  const totalDayMin = 14 * 60; // 14 hours (7 AM - 9 PM)
  const redLinePercent = Math.max(0, Math.min(100, ((currentMin - startDayMin) / totalDayMin) * 100));

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

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans text-slate-800">
      
      {/* ── 1. GOOGLE CALENDAR TOP NAVBAR ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white shrink-0">
        {/* Left Section: Logo Badge + Today + Nav */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 mr-4 cursor-pointer"
            onClick={handleToday}
          >
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-9 px-4 text-xs font-semibold border-slate-300 rounded-full text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Today
          </Button>

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

          <h2 className="text-base font-bold text-slate-800 ml-2">
            {dateHeaderRange}
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2" />
      </div>


      {/* ── 2. MAIN BODY (CALENDAR GRID) ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* Header Row: GMT + 7 Day Columns */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="p-2 text-[10px] font-semibold text-slate-400 text-center border-r border-slate-200 flex items-end justify-center pb-2">
              GMT+02
            </div>

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
                // Backend day_index: 0=Mon ... 6=Sun. Sun column in UI is 0.
                // Formula to match WorkerSchedule: (day_index + 1) % 7 === dateObj.getDay()
                const shiftsForDay = shifts.filter((s) => (s.day_index + 1) % 7 === dateObj.getDay());

                return (
                  <div
                    key={dayIdx}
                    className="border-r border-slate-200 last:border-r-0 relative bg-white hover:bg-slate-50/30 transition-colors"
                  >
                    {/* Hour grid lines */}
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-16 border-b border-slate-100 cursor-default"
                      />
                    ))}

                    {/* Red line for current time */}
                    {isTodayColumn && (
                      <div
                        className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                        style={{ top: `${redLinePercent}%` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 -ml-2 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse border-2 border-white" />
                        <div className="h-[2px] w-full bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-xs" />
                      </div>
                    )}

                    {/* Shifts rendered as absolute vertical blocks */}
                    {shiftsForDay.map((shift) => {
                      const startMin = timeToMinutes(shift.start_time);
                      const endMin = timeToMinutes(shift.end_time);
                      const topPercent = Math.max(0, ((startMin - startDayMin) / totalDayMin) * 100);
                      const durationMin = Math.max(30, endMin - startMin);
                      const heightPercent = (durationMin / totalDayMin) * 100;

                      return (
                        <div
                          key={shift.id}
                          onClick={() => {
                            setSelectedShift(shift);
                            setConfirmationInput("");
                          }}
                          style={{
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                          }}
                          className="absolute left-1 right-1 rounded-lg p-2 border text-xs font-semibold cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:z-20 z-10 bg-[#208b3a] text-white border-l-4 border-l-[#156027] border-[#1b7a32] shadow-md shadow-emerald-500/20"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate">Hired Shift</span>
                            <span className="text-[9px] opacity-90 whitespace-nowrap font-mono">
                              {shift.start_time} - {shift.end_time}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-90 truncate mt-0.5">
                            {shift.worker_name}
                          </p>
                          {shift.pending_request && (
                            <div className="text-[9px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded mt-1 inline-block">
                              Request Pending
                            </div>
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

      {/* ── 3. VIEW SHIFT DETAILS MODAL (EXACT GOOGLE CALENDAR FORM DESIGN) ── */}
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
                onClick={() => {
                  setSelectedShift(null);
                  setConfirmationInput("");
                }}
                className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Main Title Line with Blue Underline */}
            <div className="pt-1 pb-3 shrink-0">
              <div className="w-full bg-transparent text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8] truncate">
                Hired Shift Slot
              </div>
            </div>

            {/* Category Pills Row */}
            <div className="flex items-center gap-2 pt-1 pb-3 text-[13px] font-medium flex-wrap shrink-0">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#c2e7ff] text-[#001d35] font-semibold text-xs capitalize">
                Hired Shift
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium">
                Scheduled Shift
              </span>
            </div>

            {/* Scrollable Content Body with Numbered Steps */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs text-[#444746]">
              {/* Step 1: Worker (with photo) */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    Assigned Worker
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {selectedShift.worker_photo ? (
                      <img
                        src={selectedShift.worker_photo}
                        alt={selectedShift.worker_name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#2478b8] shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#208b3a] text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {selectedShift.worker_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate">{selectedShift.worker_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedShift.worker_phone ? `Phone: ${selectedShift.worker_phone}` : "Hired Part-Time Professional"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Time Slot */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    Shift Working Hours
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    {selectedShift.start_time} – {selectedShift.end_time}
                  </p>
                </div>
              </div>

              {/* Step 3: Working Day */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    Working Day
                  </p>
                  <p className="text-xs text-slate-600">
                    {selectedShift.day_label}
                  </p>
                </div>
              </div>

              {/* Worker Request Prompt: Clean gray text with PowerShell-style type 'yes' confirmation */}
              {selectedShift.pending_request && (
                <div className="pt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                  <p className="text-slate-600 font-medium">
                    Worker requested to {selectedShift.pending_request.action === "delete" ? "cancel this shift" : "change shift hours"}.
                  </p>
                  {selectedShift.pending_request.reason && (
                    <p className="text-slate-500 italic text-[11px]">
                      "{selectedShift.pending_request.reason}"
                    </p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = confirmationInput.trim().toLowerCase();
                      if (val === "yes" || val === "y") {
                        handleRespond(selectedShift.pending_request.request_id, "approved");
                      } else if (val === "no" || val === "n") {
                        handleRespond(selectedShift.pending_request.request_id, "rejected");
                      }
                    }}
                    className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-slate-600"
                  >
                    <span className="text-slate-500 font-mono">
                      Type "yes" to agree (or "no" to decline):
                    </span>
                    <input
                      type="text"
                      autoFocus
                      disabled={isResponding === selectedShift.pending_request.request_id}
                      value={confirmationInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfirmationInput(val);
                        const clean = val.trim().toLowerCase();
                        if (clean === "yes") {
                          handleRespond(selectedShift.pending_request.request_id, "approved");
                        } else if (clean === "no") {
                          handleRespond(selectedShift.pending_request.request_id, "rejected");
                        }
                      }}
                      placeholder="yes / no"
                      className="w-20 px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 rounded border border-slate-300 text-slate-800 outline-none focus:border-slate-500 focus:bg-white"
                    />
                    {isResponding === selectedShift.pending_request.request_id && (
                      <span className="text-[11px] text-slate-400 font-sans">Processing...</span>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirmed &amp; Active Shift</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedShift(null);
                  setConfirmationInput("");
                }}
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

export default EmployerCalendar;
