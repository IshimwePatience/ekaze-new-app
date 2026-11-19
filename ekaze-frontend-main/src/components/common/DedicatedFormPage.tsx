import React, { ReactNode, useState } from "react";
import { User, Camera, Check } from "lucide-react";
import logo from "@/assets/reallogo.png";
import { NavbarUserMenu } from "@/components/common/NavbarUserMenu";

export interface FormStep {
  id: string | number;
  stepNumber?: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface DedicatedFormPageProps {
  onBack: () => void;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  steps?: FormStep[];
  currentStep?: number;
  onStepClick?: (stepIndex: number) => void;
  summaryTitle?: string;
  summaryItems?: { label: string; value: ReactNode; highlight?: boolean }[];
  summaryNotice?: string;
  primaryActionLabel?: string;
  primaryActionIcon?: ReactNode;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: ReactNode;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  isPrimaryDisabled?: boolean;
  children: ReactNode;
  rightCardExtra?: ReactNode;
  profileAvatar?: {
    src?: string | null;
    name?: string;
    role?: string;
    onPhotoChange?: (file: File) => void;
    disabled?: boolean;
  };
  completionPercentage?: number;
  headerRight?: ReactNode;
}

export const DedicatedFormPage: React.FC<DedicatedFormPageProps> = ({
  onBack,
  backLabel = "Cancel",
  title,
  subtitle,
  steps,
  currentStep,
  onStepClick,
  summaryTitle,
  summaryItems = [],
  summaryNotice,
  primaryActionLabel = "Save",
  primaryActionIcon,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
  isLoading = false,
  isPrimaryDisabled = false,
  children,
  rightCardExtra,
  profileAvatar,
  completionPercentage = 25,
  headerRight,
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const activeStepIndex = currentStep !== undefined ? currentStep : internalStep;

  const handleStepClick = (index: number, stepId: string | number) => {
    setInternalStep(index);
    if (onStepClick) {
      onStepClick(index);
    }
    const el = document.getElementById(`section-${stepId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const hasSteps = steps && steps.length > 0;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-white text-slate-900 font-sans overflow-y-auto animate-in fade-in duration-200">

      {/* ── Top Header Bar ──── */}
      <div className="w-full bg-white px-6 sm:px-12 py-3.5 flex items-center justify-between sticky top-0 z-20 border-b border-[#eaeded]">
        {/* Left: Ekaze Brand Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Ekaze" className="h-9 w-auto object-contain cursor-pointer" onClick={onBack} />
        </div>

        {/* Right: Custom headerRight or Dashboard Navbar User Menu */}
        {headerRight !== undefined ? (
          headerRight
        ) : (
          <NavbarUserMenu onNavigateAction={onBack} />
        )}
      </div>

      {/* ── Content Container ──── */}
      <div className={`w-full ${hasSteps ? "max-w-6xl" : "max-w-5xl"} mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6`}>

        {/* Subheader: Profile Completion & Cancel */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-normal text-slate-800 tracking-tight">
              {title ? `${title}` : `Profile completion: ${completionPercentage}%`}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              {subtitle || "All fields with a red asterisk * are mandatory to complete your profile"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="bg-white hover:bg-[#f2f8fd] active:bg-slate-100 border border-[#d5dbdb] text-slate-700 hover:text-[#0073bb] text-xs sm:text-sm font-medium px-5 py-2 rounded-[6px] shadow-2xs transition-colors cursor-pointer"
            >
              {backLabel}
            </button>
          </div>
        </div>

        {/* ── Mobile Horizontal Compact Stepper (shown on small screens) ── */}
        {hasSteps && (
          <div className="flex md:hidden items-center justify-between gap-2 overflow-x-auto pb-2">
            {steps.map((st, i) => {
              const isActive = i === activeStepIndex;
              const isCompleted = Boolean(st.completed);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStepClick(i, st.id)}
                  className="flex items-center gap-2 shrink-0 cursor-pointer text-left"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-[#0073bb] text-white"
                        : isActive
                          ? "border-2 border-[#0073bb] bg-[#f0f7fc] text-[#0073bb]"
                          : "bg-[#eceff1] text-slate-600"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : i + 1}
                  </span>
                  <span className={`text-xs whitespace-nowrap ${isActive ? "text-[#0073bb] font-semibold" : "text-slate-600"}`}>
                    {st.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Main Layout: Vertical Numbered Steps on Left + White Form Card on Right ──── */}
        <div className={hasSteps ? "flex flex-col md:flex-row md:items-start gap-8 lg:gap-10" : ""}>

          {/* Vertical Numbered Stepper (Left Sidebar) */}
          {hasSteps && (
            <nav aria-label="Form steps" className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 pt-4 select-none">
              {steps.map((st, i) => {
                const isActive = i === activeStepIndex;
                const isCompleted = Boolean(st.completed);
                const isLast = i === steps.length - 1;

                return (
                  <div key={st.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleStepClick(i, st.id)}
                      className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all shrink-0 ${
                          isCompleted
                            ? `bg-[#0073bb] text-white ${isActive ? "ring-4 ring-[#0073bb]/20" : ""}`
                            : isActive
                              ? "border-[1.5px] border-[#0073bb] bg-[#eef6fc] text-[#0073bb]"
                              : "bg-[#eceff1] text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : i + 1}
                      </span>
                      <span
                        className={`text-sm transition-colors ${
                          isActive
                            ? "text-[#0073bb] font-medium"
                            : isCompleted
                              ? "text-slate-800 font-medium group-hover:text-[#0073bb]"
                              : "text-slate-600 font-normal group-hover:text-slate-900"
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>

                    {!isLast && (
                      <div className="w-9 flex justify-center py-1.5">
                        <div className={`w-[1.5px] h-10 transition-colors ${isCompleted ? "bg-[#0073bb]/50" : "bg-slate-300"}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {/* ── Main White Form Card ──── */}
          <div className={`${hasSteps ? "flex-1 min-w-0" : "w-full"} bg-white rounded-[16px] p-6 sm:p-10 border border-[#d5dbdb] shadow-[0_1px_1px_0_rgba(0,28,36,0.3),0_1px_24px_0_rgba(0,28,36,0.12)] space-y-8`}>

            {/* Centered Avatar Area with Upload Picture Button */}
            {profileAvatar && (
              <div className="flex items-center justify-center gap-5 pb-2">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#D9DDE2] flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-2xs">
                    {profileAvatar.src ? (
                      <img
                        src={profileAvatar.src}
                        alt={profileAvatar.name || "Profile Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#D9DDE2]">
                        <User className="w-14 h-14 text-white fill-white/80" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Picture Button */}
                {profileAvatar.onPhotoChange && (
                  <div className="flex flex-col items-start gap-1">
                    {profileAvatar.disabled ? (
                      <div className="bg-slate-100 border border-slate-200 text-slate-500 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-[6px] inline-flex items-center gap-2 cursor-not-allowed select-none">
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span>Upload Picture *</span>
                      </div>
                    ) : (
                      <label className="bg-[#0073bb] hover:bg-[#005f9e] active:bg-[#004e82] text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-[6px] shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2">
                        <Camera className="w-4 h-4 text-white" />
                        <span>Upload Picture *</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && profileAvatar.onPhotoChange) {
                              profileAvatar.onPhotoChange(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    {profileAvatar.src ? (
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Photo uploaded
                      </span>
                    ) : (
                      <span className="text-[11px] font-normal text-rose-500">
                        Profile photo mandatory *
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form Content (Columns) */}
            <div className="w-full">
              {children}
            </div>

            {/* Bottom Action Buttons */}
            {(onPrimaryAction || (secondaryActionLabel && onSecondaryAction)) && (
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                {secondaryActionLabel && onSecondaryAction && (
                  <button
                    type="button"
                    onClick={onSecondaryAction}
                    className="bg-white hover:bg-[#f2f8fd] active:bg-slate-100 border border-[#d5dbdb] text-slate-700 hover:text-[#0073bb] text-sm font-semibold h-11 px-7 rounded-[6px] shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {secondaryActionIcon}
                    <span>{secondaryActionLabel}</span>
                  </button>
                )}

                {onPrimaryAction && (
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    disabled={isLoading || isPrimaryDisabled}
                    className="w-full max-w-[280px] sm:max-w-[320px] bg-[#0073bb] hover:bg-[#005f9e] active:bg-[#004e82] disabled:opacity-40 text-white text-sm font-semibold h-11 px-8 rounded-[6px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {primaryActionIcon}
                        <span>{primaryActionLabel}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {rightCardExtra}

          </div>

        </div>

      </div>
    </div>
  );
};

/* Form Section Wrapper */
export const FormSection: React.FC<{
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}> = ({ id, title, subtitle, children, className = "" }) => {
  return (
    <div id={id} className={`space-y-4 text-left scroll-mt-24 ${className}`}>
      {title && (
        <div className="pb-1 text-left">
          <h3 className="text-sm sm:text-base font-normal text-slate-800 font-sans text-left">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-normal mt-0.5 text-left">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4 text-left pt-1">{children}</div>
    </div>
  );
};

/* Form Field Label & Box Wrapper */
export const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}> = ({ label, required, children, className = "" }) => {
  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      <label className="block text-xs font-medium text-slate-700 mb-1 font-sans text-left">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      {children}
    </div>
  );
};

/* Form Static Read-Only Field (for View Details) */
export const FormStaticField: React.FC<{
  label: string;
  value: ReactNode;
  className?: string;
}> = ({ label, value, className = "" }) => {
  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      <label className="block text-xs font-medium text-slate-700 mb-1 font-sans text-left">
        {label}
      </label>
      <div className="w-full px-3.5 min-h-[44px] h-auto py-2.5 flex items-center rounded-[6px] bg-[#E9ECF0] text-sm font-medium text-slate-800 text-left break-words whitespace-normal leading-relaxed">
        {value || "N/A"}
      </div>
    </div>
  );
};

/* Soft Grey Tinted Form Input */
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3.5 h-11 rounded-[6px] bg-[#E9ECF0] focus:bg-white focus:ring-2 focus:ring-[#0073bb]/30 focus:border-[#0073bb] text-sm font-normal text-slate-800 placeholder-slate-400 border border-transparent transition-all outline-none text-left ${className}`}
      {...props}
    />
  );
});
FormInput.displayName = "FormInput";

/* Soft Grey Tinted Form Select */
export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full px-3.5 h-11 rounded-[6px] bg-[#E9ECF0] focus:bg-white focus:ring-2 focus:ring-[#0073bb]/30 focus:border-[#0073bb] text-sm font-normal text-slate-800 border border-transparent transition-all outline-none cursor-pointer text-left ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
FormSelect.displayName = "FormSelect";

export default DedicatedFormPage;
