import React, { useRef, useEffect } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface RegisterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

const GeometricMotif = ({ color }: { color: 'red' | 'blue' | 'green' }) => {
  const colorStyles = {
    red: 'text-red-500',
    blue: 'text-[#1677ff]',
    green: 'text-emerald-500',
  };

  return (
    <div className={`w-8 h-8 sm:w-9 sm:h-9 ${colorStyles[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
        <g transform="translate(50,50)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path
                d="M -9,-24 C -16,-24 -17,-38 0,-40 C 17,-38 16,-24 9,-24 Z"
              />
              <circle cx="0" cy="-14" r="3" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export const RegisterDropdown: React.FC<RegisterDropdownProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { language } = useLanguage();
  const isRw = language === "kin";
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const registrationOptions = [
    {
      key: 'worker',
      color: 'red' as const,
      label: isRw ? "Ku bakozi" : "for Workers",
      desc: isRw ? "Iyandikishe nk'umukozi ubone akazi" : "Find jobs & build verified track record",
      hoverBorder: 'hover:border-red-500 hover:ring-2 hover:ring-red-500/10',
      hoverText: 'group-hover:text-red-500',
    },
    {
      key: 'employer',
      color: 'blue' as const,
      label: isRw ? "Ku bakoresha" : "for Employers",
      desc: isRw ? "Shaka kandi uhembe abakozi bo mu rugo" : "Hire & pay verified household staff",
      hoverBorder: 'hover:border-[#1677ff] hover:ring-2 hover:ring-[#1677ff]/10',
      hoverText: 'group-hover:text-[#1677ff]',
    },
    {
      key: 'company',
      color: 'green' as const,
      label: isRw ? "Kuri sosiyete" : "for Companies",
      desc: isRw ? "Ubugenzuzi bw'ibigo bitanga abakozi" : "Agency workforce management",
      hoverBorder: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/10',
      hoverText: 'group-hover:text-emerald-500',
    },
  ];

  return (
    <>
      {/* Semi-transparent backdrop for mobile/desktop focus */}
      <div
        className="fixed inset-0 z-40 bg-black/10 md:bg-transparent"
        onClick={onClose}
      />

      {/* ══════════════════════════════════════════════════════════════════════════
          REGISTER DROPDOWN CARD: EXACT CLONE OF LOGINDROPDOWN LAYOUT
      ══════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 z-50 w-[95vw] sm:w-[740px] max-w-[95vw] bg-white text-[#222222] rounded-lg shadow-2xl border border-slate-200 overflow-hidden text-left"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-8 sm:p-9 pb-6">

          {/* ──────────────────────────────────────────────────────────────────
              LEFT COLUMN: 3 REGISTRATION OPTIONS (WORKER, EMPLOYER, COMPANY)
          ────────────────────────────────────────────────────────────────── */}
          <div className="md:pr-8 pb-6 md:pb-0 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#222222] tracking-tight mb-1">
                {isRw ? "Fungura Konti" : "Create Account"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mb-5">
                {isRw
                  ? "Hitamo icyiciro cy'uburyo wifuza kwiyandikishamo:"
                  : "Choose how you want to join our platform:"}
              </p>

              {/* 3 Option Cards matching User's Image 1 */}
              <div className="space-y-3">
                {registrationOptions.map(({ key, color, label, desc, hoverBorder, hoverText }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/auth/register/${key}`);
                    }}
                    className={`group w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs ${hoverBorder} hover:shadow-md transition-all duration-200 text-left cursor-pointer`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <GeometricMotif color={color} />
                      <div className="min-w-0">
                        <span className={`block font-bold text-[15px] sm:text-base text-slate-900 ${hoverText} transition-colors leading-tight`}>
                          {label}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-500 block truncate mt-0.5">
                          {desc}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-slate-400 ${hoverText} group-hover:translate-x-1 transition-all shrink-0 ml-2`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-text: Already have an account? */}
            <div className="pt-4 text-center md:text-left text-xs text-slate-500">
              {isRw ? "Ubusanzwe ufite konti? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin?.();
                }}
                className="text-[#005a9c] font-bold hover:underline cursor-pointer"
              >
                {isRw ? "Injira hano" : "Log In"}
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              RIGHT COLUMN: EXACT RWANDAIR "REGISTER TO IHIRWE AND ENJOY:"
          ────────────────────────────────────────────────────────────────── */}
          <div className="md:pl-8 pt-6 md:pt-0 relative flex flex-col justify-between">

            {/* Top Close '✕' Button (Thin crisp black cross matching Login) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-0 right-0 text-slate-700 hover:text-black p-1 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div>
              {/* Header: Register to Ihirwe and enjoy: */}
              <h3 className="text-[26px] font-bold text-[#222222] leading-tight mb-6 pr-8">
                {isRw ? (
                  <>
                    Iyandikishe kuri <br />
                    Ihirwe wishimire:
                  </>
                ) : (
                  <>
                    Register to <br />
                    Ihirwe and enjoy:
                  </>
                )}
              </h3>

              {/* Exact Checkmark Bullet Items with blue tick ✔ (no circle) */}
              <ul className="space-y-3.5 mb-7">
                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Abakozi b'umwuga bujuje ibyangombwa" : "Free tickets & verified workers"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Kwishyura imishahara kuri MoMo & Banki" : "Instant salary payments"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Amasezerano yemewe & RSSB" : "Extra protection & RSSB"}</span>
                </li>

                <li className="flex items-center gap-3 text-[#333333] text-[15px] font-normal">
                  <Check className="w-5 h-5 text-[#005a9c] stroke-[3.5] shrink-0" />
                  <span>{isRw ? "Ubufasha bwihuse bwa 24/7" : "Partners deals & 24/7 support"}</span>
                </li>
              </ul>

              {/* Already a member? Log In */}
              <div className="text-[13px] text-[#444444] mb-6">
                <span>{isRw ? "Ubusanzwe ufite konti? " : "Already a member? "}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin?.();
                  }}
                  className="font-medium text-[#005a9c] underline hover:text-[#004780] cursor-pointer"
                >
                  {isRw ? "Injira Ubu" : "Log In"}
                </button>
              </div>
            </div>

            {/* Stylized Script Branding for Ihirwe */}
            <div className="pt-2 select-none">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-3xl font-bold italic tracking-tight text-[#005a9c]"
                  style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif" }}
                >
                  Ihirwe Pay
                </span>
                <span className="text-[11px] text-slate-400 font-sans font-semibold">™</span>
              </div>
              <p className="text-xs text-[#005a9c] font-medium tracking-tight">
                {isRw ? "Genzura n'uhembe abakozi bo mu rugo igihe cyose" : "Earn trust whenever you manage with us"}
              </p>
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            BOTTOM BAR: "ALREADY HAVE AN ACCOUNT? LOG IN"
        ══════════════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-slate-200 px-8 py-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[14px] text-[#333333] font-normal">
            {isRw ? "Ubusanzwe ufite konti?" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin?.();
            }}
            className="h-9 px-5 bg-[#005a9c] hover:bg-[#004780] text-white font-semibold text-xs sm:text-sm rounded-[6px] transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center"
          >
            {isRw ? "Injira" : "Log In"}
          </button>
        </div>

      </div>
    </>
  );
};
