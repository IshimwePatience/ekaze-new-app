import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { authApi } from "@/api/authApi";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = isMinLength && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.setInitialPassword({
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully! Welcome to your dashboard.");
        
        // Update user state across query cache and localStorage
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });

        const storedUser = localStorage.getItem("ekaze_user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.must_change_password = false;
            localStorage.setItem("ekaze_user", JSON.stringify(parsed));
          } catch (e) {
            // ignore
          }
        }

        window.dispatchEvent(new Event("user_updated"));
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 z-[9999]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0b57d0] flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            Set Your Permanent Password
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 leading-relaxed font-normal">
            Welcome to Ekaze! Because you logged in with a temporary password and completed 2-step verification, please set your new secure password to access your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                className="pr-10 h-10 rounded-xl text-sm border-slate-300 focus-visible:ring-[#0b57d0]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className="pr-10 h-10 rounded-xl text-sm border-slate-300 focus-visible:ring-[#0b57d0]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Validation Requirements */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px]">
            <div className={`flex items-center gap-2 ${isMinLength ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 6 characters long</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatching ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full h-11 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-sm cursor-pointer transition-colors shadow-sm"
          >
            {isLoading ? "Securing Account..." : "Set Password & Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetInitialPasswordModal;
