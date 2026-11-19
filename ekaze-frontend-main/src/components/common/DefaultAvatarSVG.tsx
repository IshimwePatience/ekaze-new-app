import React from "react";

export const DefaultAvatarSVG = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
    <circle cx="50" cy="36" r="18" fill="#94A3B8" />
    <path d="M18 84C18 65 32 58 50 58C67 58 82 65 82 84V100H18V84Z" fill="#94A3B8" />
  </svg>
);
