import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import api from "@/lib/api";

interface ShiftRequestItem {
  id: number | string;
  action?: string;
  proposed_day?: string;
  proposed_time?: string;
  reason?: string;
  worker_name?: string;
  current_day?: string;
  current_time?: string;
}

interface PaymentScheduleItem {
  id: number | string;
  status?: string;
  due_date?: string;
  payment_date?: string;
  scheduled_date?: string;
  worker?: {
    user?: {
      name?: string;
    };
  };
  worker_name?: string;
  agreed_salary?: number | string;
  amount?: number | string;
}

interface AlertItem {
  id: string;
  type: "shift_request" | "payment_overdue" | "payment_countdown" | "profile_incomplete";
  message: string;
  subtext?: string;
  workerName?: string;
  actionLabel?: string;
}

interface DashboardTopAlertBannerProps {
  role?: string;
  onTabChange?: (tabId: string) => void;
}

export const DashboardTopAlertBanner = ({ role = "employer", onTabChange }: DashboardTopAlertBannerProps) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: currentUserData, isLoading: isUserLoading, isFetching: isUserFetching } = useCurrentUser();
  const freshUser = currentUserData?.data?.user || currentUserData?.user || null;
  const user = freshUser || authUser || null;

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Check if user profile has incomplete required fields (only after fresh user data has loaded)
  const isProfileIncomplete = useMemo(() => {
    // Never flash while loading or before fresh API user payload arrives
    if (isUserLoading || isUserFetching || !freshUser) return false;

    const uRole = (freshUser.role || role || "").toLowerCase();
    // Only workers have post-registration profile completion steps; employers/companies/admins complete required info at registration
    if (uRole !== "worker") return false;

    const w = freshUser.worker || freshUser.role_profile || currentUserData?.data?.worker || currentUserData?.worker || {};
    const ext =
      typeof w.extended_profile === "string"
        ? (() => {
            try {
              return JSON.parse(w.extended_profile);
            } catch {
              return {};
            }
          })()
        : w.extended_profile || {};

    if (
      w.profile_completed ||
      freshUser.profile_completed ||
      Number(ext.profile_completion_percent) >= 80
    ) {
      return false;
    }

    const hasPhone = Boolean((freshUser.phone || w.phone) && String(freshUser.phone || w.phone).trim());
    const hasNationalId = Boolean(
      (freshUser.national_id || freshUser.nationalId || w.national_id) &&
        String(freshUser.national_id || freshUser.nationalId || w.national_id).trim()
    );
    const hasDistrict = Boolean((freshUser.district || w.district) && String(freshUser.district || w.district).trim());
    const hasProfessions =
      (Array.isArray(w.professions) && w.professions.length > 0) ||
      (Array.isArray(w.skills) && w.skills.length > 0);
    const hasLanguages =
      (Array.isArray(w.languages_spoken) && w.languages_spoken.length > 0) ||
      (Array.isArray(w.languages) && w.languages.length > 0);
    const hasSalary = Number(w.min_salary || w.expected_salary || w.max_salary) > 0;
    const bioVal = ext.bio || w.bio;
    const refVal = ext.referee_3_name || ext.referee_1_name || w.referee_1_name || w.referee_3_name;
    const hasBioAndRef = Boolean(bioVal && String(bioVal).trim()) && Boolean(refVal && String(refVal).trim());

    return !(
      hasPhone &&
      hasNationalId &&
      hasDistrict &&
      hasProfessions &&
      hasLanguages &&
      hasSalary &&
      hasBioAndRef
    );
  }, [freshUser, currentUserData, isUserLoading, isUserFetching, role]);

  // Fetch notices for employer/worker
  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const newAlerts: AlertItem[] = [];

        // 1. Fetch pending shift change/cancellation requests
        if (role.toLowerCase() === "employer") {
          try {
            const shiftRes = await api.get("/employer/shifts/requests");
            const shiftReqs = Array.isArray(shiftRes.data?.data) ? shiftRes.data.data : [];
            shiftReqs.forEach((req: ShiftRequestItem) => {
              const actionText = req.action === "delete" ? "cancel their shift" : "reschedule their shift";
              const timeDetails = req.action === "change" && req.proposed_day
                ? ` (Proposed: ${req.proposed_day} ${req.proposed_time || ""})`
                : "";
              const reasonText = req.reason ? ` — "${req.reason}"` : "";

              newAlerts.push({
                id: `req-${req.id}`,
                type: "shift_request",
                workerName: req.worker_name,
                message: `${req.worker_name || "A worker"} requested to ${actionText} on ${req.current_day || ""} (${req.current_time || ""})${timeDetails}.${reasonText}`,
              });
            });
          } catch {
            // ignore network or endpoint errors
          }

          // 2. Fetch payment schedules & overdue/countdown notices
          try {
            const schedRes = await api.get("/employer/payment-schedules");
            const rawSchedules = schedRes.data?.data?.data || schedRes.data?.data;
            const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            schedules.forEach((s: PaymentScheduleItem) => {
              if (s.status === "paid" || s.status === "confirmed") return;

              const dueDateStr = s.due_date || s.payment_date || s.scheduled_date;
              if (!dueDateStr) return;

              const dueDate = new Date(dueDateStr);
              dueDate.setHours(0, 0, 0, 0);

              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const workerName = s.worker?.user?.name || s.worker_name || "Contracted Professional";
              const salaryAmount = s.agreed_salary || s.amount ? ` (RWF ${Number(s.agreed_salary || s.amount).toLocaleString()})` : "";

              if (diffDays < 0 || s.status === "overdue") {
                // Overdue notice
                const daysOver = Math.abs(diffDays);
                newAlerts.push({
                  id: `overdue-${s.id}`,
                  type: "payment_overdue",
                  workerName,
                  message: `Salary payment for ${workerName}${salaryAmount} is overdue by ${daysOver} day${daysOver > 1 ? "s" : ""}. Please settle payment to maintain staff coverage.`,
                });
              } else if (diffDays >= 0 && diffDays <= 5) {
                // 5 days countdown down to 0 (today)
                let countdownLabel = "";
                if (diffDays === 0) {
                  countdownLabel = `Payment is due today for ${workerName}${salaryAmount}. Please complete MoMo transfer.`;
                } else if (diffDays === 1) {
                  countdownLabel = `1 day remaining until salary payment is due for ${workerName}${salaryAmount}.`;
                } else {
                  countdownLabel = `${diffDays} days remaining until salary payment is due for ${workerName}${salaryAmount}.`;
                }

                newAlerts.push({
                  id: `countdown-${s.id}`,
                  type: "payment_countdown",
                  workerName,
                  message: countdownLabel,
                });
              }
            });
          } catch {
            // ignore
          }
        }

        if (isMounted) {
          setAlerts(newAlerts);
        }
      } catch (e) {
        console.error("Dashboard alert fetch error:", e);
      }
    };

    fetchAlerts();
    const pollInterval = setInterval(fetchAlerts, 60 * 1000); // refresh every minute

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [role]);

  // Combine API alerts with profile incomplete notice
  const activeAlerts = useMemo(() => {
    const combined: AlertItem[] = [];
    if (isProfileIncomplete) {
      combined.push({
        id: "profile-incomplete",
        type: "profile_incomplete",
        message: "Your profile is incomplete. Please fill in all required fields to complete your registration.",
        actionLabel: "Complete",
      });
    }
    combined.push(...alerts);
    return combined.filter((a) => !dismissedIds.has(a.id));
  }, [isProfileIncomplete, alerts, dismissedIds]);

  // Rotate every 30 seconds
  useEffect(() => {
    if (activeAlerts.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
    }, 30 * 1000); // 30 seconds replacement

    return () => clearInterval(rotationInterval);
  }, [activeAlerts.length]);

  // Bound index safely
  const currentAlert = activeAlerts[currentIndex % (activeAlerts.length || 1)];

  if (!currentAlert || activeAlerts.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedIds((prev) => new Set(prev).add(currentAlert.id));
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, activeAlerts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  };

  const handleCompleteProfile = () => {
    const uRole = (user?.role || role || "employer").toLowerCase();
    if (onTabChange) {
      onTabChange("profile");
    }
    navigate(`/${uRole}?tab=profile&edit=true`);
  };

  return (
    <div className="w-full bg-white px-4 pt-2.5 pb-1 shrink-0 z-30 transition-all duration-300">
      <div className="flex items-stretch rounded-md overflow-hidden bg-[#2478b8] text-white shadow-xs border border-[#1b6296]/40 animate-in fade-in duration-300">
        {/* Left Dark Blue Icon Box with Italic Serif i */}
        <div className="w-11 bg-[#1b6296] flex items-center justify-center shrink-0 select-none">
          <span className="font-serif italic font-bold text-base text-white">i</span>
        </div>

        {/* Center Alert Message */}
        <div className="flex-1 px-3.5 py-2.5 text-xs leading-relaxed font-normal flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="truncate sm:whitespace-normal font-medium tracking-tight">
              {currentAlert.message}
            </p>
            {currentAlert.actionLabel && (
              <div>
                <button
                  type="button"
                  onClick={handleCompleteProfile}
                  className="px-3.5 py-1 rounded bg-white text-[#1b6296] hover:bg-blue-50 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {currentAlert.actionLabel}
                </button>
              </div>
            )}
          </div>

          {/* If multiple alerts, show indicators / controls */}
          {activeAlerts.length > 1 && (
            <div className="flex items-center gap-1 shrink-0 text-white/80">
              <span className="text-[10px] font-mono font-bold mr-1 hidden sm:inline-block">
                {((currentIndex % activeAlerts.length) + 1)}/{activeAlerts.length}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded hover:bg-black/15 transition-colors cursor-pointer"
                title="Previous notice"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded hover:bg-black/15 transition-colors cursor-pointer"
                title="Next notice"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Dismiss X Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 text-white/80 hover:text-white hover:bg-black/15 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DashboardTopAlertBanner;
