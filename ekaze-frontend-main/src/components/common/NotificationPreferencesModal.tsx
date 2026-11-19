import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Bell,
  Calendar,
  CreditCard,
  ShieldAlert,
  PiggyBank,
  Sparkles,
  Smartphone,
  Mail,
  Check,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: string;
}

export const NotificationPreferencesModal = ({
  open,
  onOpenChange,
  userRole = "employer",
}: NotificationPreferencesModalProps) => {
  const isWorker = userRole.toLowerCase() === "worker";
  const isEmployer = userRole.toLowerCase() === "employer";

  // Load preferences from localStorage or use defaults
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("ihirwe_notification_preferences");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      payrollReminders: true,
      paymentsAndWithdrawals: true,
      savingsVault: true,
      sessionSecurity: true,
      systemUpdates: true,
      channelInApp: true,
      channelSms: true,
      channelEmail: false,
    };
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("ihirwe_notification_preferences", JSON.stringify(prefs));
      toast.success("Notification preferences saved successfully");
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl">
        {/* Header Banner */}
        <div className="bg-[#2076b8] text-white px-6 py-5 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                Notification Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-white/85 mt-0.5 font-normal">
                Control which telecom alerts and system updates you receive across web and mobile.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Informational Callout */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Info className="w-4 h-4 text-[#2076b8] shrink-0 mt-0.5" />
            <p>
              Notifications are formatted in clear telecom wording (MTN MoMo / Airtel Money style) with verified transaction IDs and instant timestamping.
            </p>
          </div>

          {/* Delivery Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Delivery Channels
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggle("channelInApp")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prefs.channelInApp
                    ? "border-[#2076b8] bg-blue-50/50 text-[#2076b8]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Bell className="w-4 h-4" />
                  {prefs.channelInApp && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold">In-App</span>
                <span className="text-[10px] text-slate-500">Dashboard bell</span>
              </button>

              <button
                type="button"
                onClick={() => toggle("channelSms")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prefs.channelSms
                    ? "border-[#2076b8] bg-blue-50/50 text-[#2076b8]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Smartphone className="w-4 h-4" />
                  {prefs.channelSms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold">MoMo SMS</span>
                <span className="text-[10px] text-slate-500">Instant texts</span>
              </button>

              <button
                type="button"
                onClick={() => toggle("channelEmail")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prefs.channelEmail
                    ? "border-[#2076b8] bg-blue-50/50 text-[#2076b8]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Mail className="w-4 h-4" />
                  {prefs.channelEmail && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold">Email Digest</span>
                <span className="text-[10px] text-slate-500">Weekly summaries</span>
              </button>
            </div>
          </div>

          {/* Notification Topics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Notification Topics
            </h4>
            <div className="space-y-2.5">
              {/* 5-Day Payroll Reminder */}
              {isEmployer && (
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        5-Day Upcoming Payroll Reminder
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Get alerted 5 days before worker salary payout is due on both web and mobile.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.payrollReminders}
                    onChange={() => toggle("payrollReminders")}
                    className="w-4 h-4 rounded text-[#2076b8] focus:ring-[#2076b8] cursor-pointer mt-1"
                  />
                </div>
              )}

              {/* Payments & Withdrawals */}
              <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Payments & MoMo Cash-Outs
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instant telecom notifications for money received, payments sent, and withdrawals.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.paymentsAndWithdrawals}
                  onChange={() => toggle("paymentsAndWithdrawals")}
                  className="w-4 h-4 rounded text-[#2076b8] focus:ring-[#2076b8] cursor-pointer mt-1"
                />
              </div>

              {/* Savings Vault */}
              <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Savings vs Payment Deposits
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Clear separation of salary payments vs savings vault contributions with interest updates.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.savingsVault}
                  onChange={() => toggle("savingsVault")}
                  className="w-4 h-4 rounded text-[#2076b8] focus:ring-[#2076b8] cursor-pointer mt-1"
                />
              </div>

              {/* Session Security */}
              <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2076b8] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      User Session & Security Alerts
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instant alerts whenever a new browser session or device logs into your account.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.sessionSecurity}
                  onChange={() => toggle("sessionSecurity")}
                  className="w-4 h-4 rounded text-[#2076b8] focus:ring-[#2076b8] cursor-pointer mt-1"
                />
              </div>

              {/* System Updates */}
              <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      System Updates & Announcements
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      New feature releases, scheduled maintenance windows, and policy notices.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.systemUpdates}
                  onChange={() => toggle("systemUpdates")}
                  className="w-4 h-4 rounded text-[#2076b8] focus:ring-[#2076b8] cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#2076b8] hover:bg-[#1a649d] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Save Preferences
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
