import React from "react";

interface IconProps {
  className?: string;
}

// 1. Grid / Dashboard icon (2x2 solid blocks)
export const ConsoleGridIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.85" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.85" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

// 2. Sliders / Settings / Controls icon (Horizontal sliders with filled control knobs)
export const ConsoleSlidersIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M3 6h4m6 0h8M3 12h10m6 0h2M3 18h2m6 0h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="9" cy="6" r="2.8" fill="currentColor" />
    <circle cx="16" cy="12" r="2.8" fill="currentColor" />
    <circle cx="7" cy="18" r="2.8" fill="currentColor" />
  </svg>
);

// 3. BarChart / Analytics icon (3 vertical filled bars)
export const ConsoleBarChartIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="3" y="11" width="4.5" height="10" rx="1" />
    <rect x="9.75" y="3" width="4.5" height="18" rx="1" />
    <rect x="16.5" y="7" width="4.5" height="14" rx="1" />
  </svg>
);

// 4. Clock / Schedules / History icon
export const ConsoleClockIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" />
    <polyline points="12 7 12 12 15.5 15.5" />
  </svg>
);

// 5. Billing / CreditCard / Ledger icon
export const ConsoleBillingIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="2" y="4" width="20" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <rect x="2" y="8" width="20" height="4" fill="currentColor" />
    <rect x="5.5" y="14.5" width="4" height="2.5" rx="0.5" fill="currentColor" />
  </svg>
);

// 6. Shield & User / NIDA & IAM Verification icon
export const ConsoleShieldUserIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L3.5 5.5v6c0 5.8 4 10.8 8.5 12.5 4.5-1.7 8.5-6.7 8.5-12.5v-6L12 2z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.3" fill="currentColor" />
    <path d="M8.2 16.5c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 7. Shopping Cart with Diamond icon (Marketplace / Products)
export const ConsoleCartIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M1 2h3.27l.94 2H20a1 1 0 0 1 .94 1.34l-2.5 5A1 1 0 0 1 17.5 11H7.5l-.9 2H19v2H6a1 1 0 0 1-.94-1.34L6 11.3 4.25 4.5 3.32 2.5H1V2z" />
    <circle cx="8" cy="19" r="1.8" />
    <circle cx="16" cy="19" r="1.8" />
    <polygon points="12,4 14.5,7 12,9.5 9.5,7" fill="currentColor" />
  </svg>
);

// 8. API typography icon
export const ConsoleApiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <text x="0" y="17" fontSize="12" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5px">API</text>
  </svg>
);

// 9. Sparkle / AI / Platform icon
export const ConsoleSparkleIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 1.5L14.7 9.3L22.5 12L14.7 14.7L12 22.5L9.3 14.7L1.5 12L9.3 9.3L12 1.5z" />
  </svg>
);

// 10. CPU / System Metrics icon
export const ConsoleCpuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="5.5" y="5.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// 11. Company / Building icon
export const ConsoleBuildingIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M3 21h18v-2H3v2zm2-4h14V3H5v14zm3-12h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zm6-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z" />
  </svg>
);

// 12. Verified Worker / User Check icon
export const ConsoleUserCheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm-7 18a7 7 0 0 1 14 0z" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M15.5 10.5l2 2 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 13. Users / Access Roles icon
export const ConsoleUsersIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

// 14. Agent Management / Branch Agents icon (Solid Agent Badge User Icon)
export const ConsoleAgentIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 11c-4.42 0-8 2.24-8 5v2.5h16V18c0-2.76-3.58-5-8-5z" />
    <polygon points="18,2 19.2,4.5 22,4.9 20,6.9 20.5,9.7 18,8.4 15.5,9.7 16,6.9 14,4.9 16.8,4.5" fill="currentColor" />
  </svg>
);
export const ConsoleLayersIcon = ConsoleAgentIcon;

// 15. Incident / Alert Triangle icon
export const ConsoleAlertIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L1 21h22L12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z" />
  </svg>
);

// 16. Briefcase / Hiring Requests icon
export const ConsoleBriefcaseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" />
    <rect x="9" y="11" width="6" height="4" rx="1" fill="currentColor" />
  </svg>
);

// 17. MapPin icon
export const ConsoleMapPinIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// 18. FileText / History icon
export const ConsoleFileTextIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

// 19. Calendar icon
export const ConsoleCalendarIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1.2" fill="currentColor" />
    <circle cx="12" cy="14" r="1.2" fill="currentColor" />
    <circle cx="16" cy="14" r="1.2" fill="currentColor" />
    <circle cx="8" cy="18" r="1.2" fill="currentColor" />
    <circle cx="12" cy="18" r="1.2" fill="currentColor" />
  </svg>
);
