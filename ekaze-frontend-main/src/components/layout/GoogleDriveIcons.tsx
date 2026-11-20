import React from "react";

// Google 4-Color Plus Icon
export const GooglePlusIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 36 36" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V-2h-4v14H2v4h14z" />
    <path fill="#34A853" d="M30 16H20v-4h10v4z" />
    <path fill="#4285F4" d="M16 16v10h4V16h-4z" />
    <path fill="#FBBC05" d="M16 6h4v10h-4V6z" />
    <path fill="#EA4335" d="M6 16h10v-4H6v4z" />
  </svg>
);

// Google Drive Canonical 3-Color Triangle Logo
export const GoogleDriveLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 87.3 78" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H1.8c0 1.6.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="M43.65 25 29.5 0c-1.4.8-2.5 1.9-3.3 3.2l-25 43.3c-.8 1.4-1.2 2.9-1.2 4.5h24.1z" fill="#00ac47" />
    <path d="m73.55 76.8c1.4-.8 2.5-1.9 3.2-3.2l3.85-6.65c.8-1.4 1.2-2.9 1.2-4.5H57.7l12.65 21.05c1.1-.3 2.2-.9 3.2-1.7z" fill="#ea4335" />
    <path d="M43.65 25 57.8 0c-1.6 0-3.1.4-4.5 1.2L29.5 25z" fill="#00832d" />
    <path d="M57.8 0H29.5l14.15 25z" fill="#2684fc" />
    <path d="m57.7 55.4-14.05-24.3-14.15 24.3z" fill="#ffba00" />
  </svg>
);

// Google Gemini 4-Point Gradient Sparkle Star
export const GoogleGeminiIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="driveGeminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1ba1e2" />
        <stop offset="35%" stopColor="#4285f4" />
        <stop offset="70%" stopColor="#9b51e0" />
        <stop offset="100%" stopColor="#ff7a00" />
      </linearGradient>
    </defs>
    <path
      d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z"
      fill="url(#driveGeminiGrad)"
    />
  </svg>
);

// Google 9-Dots Grid
export const GoogleAppsGridIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="12" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

// Google Calendar Icon (31)
export const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="3" fill="#ffffff" stroke="#1a73e8" strokeWidth="2" />
    <path d="M3 9h18" stroke="#1a73e8" strokeWidth="2" />
    <rect x="3" y="4" width="18" height="5" rx="2" fill="#1a73e8" />
    <text x="12" y="18" fill="#1a73e8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
      31
    </text>
  </svg>
);

// Google Keep Icon (Lightbulb)
export const GoogleKeepIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#fbbc04" />
    <path
      d="M12 6a4 4 0 0 0-2.83 6.83c.53.53.83 1.25.83 2h4c0-.75.3-1.47.83-2A4 4 0 0 0 12 6zm-1.5 10h3v1h-3zm.5 2h2v.5h-2z"
      fill="#ffffff"
    />
  </svg>
);

// Google Tasks Icon (Checkmark)
export const GoogleTasksIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#1a73e8" />
    <path d="m8 12 2.5 2.5L16 9" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Google Contacts Icon
export const GoogleContactsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="10" fill="#1a73e8" />
    <circle cx="12" cy="9" r="3" fill="#ffffff" />
    <path d="M6 18c0-3 3-4.5 6-4.5s6 1.5 6 4.5" fill="#ffffff" />
  </svg>
);

