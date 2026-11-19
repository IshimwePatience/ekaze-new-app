import React, { ReactNode } from "react";
import { X, Bold, Italic, Underline, List, ListOrdered, Link, Strikethrough } from "lucide-react";

export interface ModalTab {
  id: string;
  label: string;
  badge?: string;
}

export interface GoogleStyleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange?: (val: string) => void;
  titlePlaceholder?: string;
  tabs?: ModalTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  maxWidth?: string;
}

export const GoogleStyleFormModal: React.FC<GoogleStyleFormModalProps> = ({
  isOpen,
  onClose,
  title,
  onTitleChange,
  titlePlaceholder = "Add title",
  tabs,
  activeTab,
  onTabChange,
  children,
  primaryActionLabel = "Save",
  onPrimaryAction,
  secondaryActionLabel = "More options",
  onSecondaryAction,
  isLoading = false,
  maxWidth = "max-w-[490px]",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in-0 duration-200">
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Google Calendar Style Card Container (#EDF2FA background) */}
      <div
        className={`relative w-full ${maxWidth} bg-[#EDF2FA] text-[#1F1F1F] rounded-[32px] border border-slate-200/70 shadow-2xl flex flex-col font-sans overflow-hidden z-10 animate-in zoom-in-95 duration-200`}
      >
        {/* Top Header Bar with Equal / Drag Handle & Close X */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          {/* Drag Handle Icon (=) */}
          <div className="flex flex-col gap-[3px] py-1 cursor-grab">
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-[#444746] transition-colors cursor-pointer outline-none"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-7 py-2 space-y-4 max-h-[calc(85vh-90px)] overflow-y-auto">
          {/* Title Input Area */}
          <div className="pt-1 pb-1">
            {onTitleChange ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={titlePlaceholder}
                className="w-full text-2xl font-normal text-[#1F1F1F] placeholder-[#444746] bg-transparent border-b border-[#C7C7C7] focus:border-[#2478b8] focus:outline-none pb-1.5 transition-colors font-sans"
              />
            ) : (
              <h2 className="text-2xl font-normal text-[#1F1F1F] border-b border-[#C7C7C7] pb-1.5 font-sans">
                {title || titlePlaceholder}
              </h2>
            )}
          </div>

          {/* Segmented Control Pill Tabs (Matching Google Calendar: #C2E7FF active) */}
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-2 pt-1 pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#C2E7FF] text-[#041E49]"
                        : "text-[#444746] hover:bg-[#E1E8F5]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-[#2478b8] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ml-0.5">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Form Content Fields */}
          <div className="space-y-4 pt-1 pb-2">
            {children}
          </div>
        </div>

        {/* Bottom Action Bar Footer */}
        <div className="flex items-center justify-between px-7 py-4 bg-[#EDF2FA]">
          <div>
            {secondaryActionLabel && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="text-[#2478b8] hover:text-[#1b6296] text-sm font-medium transition-colors cursor-pointer px-1 py-1"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onPrimaryAction && (
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isLoading}
                className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white text-sm font-medium px-7 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? "Saving..." : primaryActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Reusable Form Row Wrapper with Left Icon */
export const ModalFormRow: React.FC<{
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}> = ({ icon, children, className = "" }) => {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {icon && <div className="text-[#444746] shrink-0 mt-3.5">{icon}</div>}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

/* Reusable Vertical Rounded Input Field (Matching Google Calendar "Add guests" filled container) */
export const ModalInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full bg-[#DDE3EA] text-[#1F1F1F] placeholder-[#444746] rounded-t-lg rounded-b-md px-3.5 py-3 text-sm font-normal outline-none border-b-2 border-[#0056D2] focus:border-[#0056D2] transition-none ${className}`}
      {...props}
    />
  );
});
ModalInput.displayName = "ModalInput";

/* Reusable Vertical Rounded Select Field */
export const ModalSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full bg-[#DDE3EA] text-[#1F1F1F] rounded-t-lg rounded-b-md px-3.5 py-3 text-sm font-normal outline-none border-b-2 border-[#0056D2] focus:border-[#0056D2] transition-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
ModalSelect.displayName = "ModalSelect";

/* Reusable Description Field Box with Formatting Toolbar (Matching "Add description" in image) */
export const ModalDescriptionBox: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}> = ({ value = "", onChange, placeholder = "Add description" }) => {
  return (
    <div className="w-full bg-[#DDE3EA] rounded-2xl p-3 space-y-2">
      {/* Format Toolbar (B, I, U, 123, bullet, link, clear) */}
      <div className="flex items-center gap-3 text-[#444746] pb-1 border-b border-[#C7C7C7]/50 text-xs font-semibold px-1">
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><Bold className="w-4 h-4" /></button>
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><Italic className="w-4 h-4" /></button>
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><Underline className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-[#C7C7C7]" />
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><ListOrdered className="w-4 h-4" /></button>
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><List className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-[#C7C7C7]" />
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><Link className="w-4 h-4" /></button>
        <button type="button" className="p-1 hover:text-[#041E49] hover:bg-[#C2E7FF]/50 rounded"><Strikethrough className="w-4 h-4" /></button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent text-[#1F1F1F] placeholder-[#444746] text-sm font-normal outline-none resize-none pt-1"
      />
    </div>
  );
};

export default GoogleStyleFormModal;
