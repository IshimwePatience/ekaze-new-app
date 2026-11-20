import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SetInitialPasswordModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const SetInitialPasswordModal: React.FC<SetInitialPasswordModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(isOpen);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = isMinLength && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation password must match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.setInitialPassword({
        new_password: newPassword,
        confirm_password: confirmPassword,
        user_id: user?.id,
      });

      if (res.success) {
        toast.success("Password updated successfully! Welcome to your dashboard.");

        // 1. Immediately close modal locally
        setOpen(false);

        // 2. Update user in localStorage & sessionStorage under standard keys ('user' and 'ekaze_user')
        ['user', 'ekaze_user'].forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.must_change_password = false;
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          } catch (e) {}

          try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.must_change_password = false;
              sessionStorage.setItem(key, JSON.stringify(parsed));
            }
          } catch (e) {}
        });

        // 3. Update query cache
        queryClient.setQueryData(["user"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            must_change_password: false,
            user: { ...(old.user || {}), must_change_password: false },
          };
        });
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // 4. Trigger events & callback
        window.dispatchEvent(new Event("user_updated"));
        if (onSuccess) onSuccess();
      } else {
        const msg = res.message || "Failed to update password. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        hideCloseButton={true}
        className="sm:max-w-md bg-white rounded-[8px] p-6 shadow-xl border border-slate-200 z-[9999] [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Change Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ensure your account is using a strong password to protect your data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-left">
          {error && (
            <div className="p-3 rounded-[6px] bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-slate-700 font-sans text-left">
              New Password <span className="text-red-500 font-bold">*</span>
            </label>
            <Input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
              }}
              className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-slate-700 font-sans text-left">
              Confirm New Password <span className="text-red-500 font-bold">*</span>
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              className="h-11 px-3.5 rounded-[6px] bg-[#EEF2F6] border border-transparent focus:bg-white focus:ring-2 focus:ring-[#2478b8]/30 focus:border-[#2478b8] text-sm font-normal text-slate-800 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Validation helper text */}
          <div className="text-[11px] space-y-1 pt-0.5">
            <p className={isMinLength ? "text-emerald-600 font-medium" : "text-slate-400"}>
              • Password must be at least 6 characters
            </p>
            {confirmPassword && (
              <p className={isMatching ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                {isMatching ? "• Passwords match" : "• Passwords do not match"}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-[#2478b8] hover:bg-[#1b6296] active:bg-[#154d76] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold h-11 px-8 rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetInitialPasswordModal;
