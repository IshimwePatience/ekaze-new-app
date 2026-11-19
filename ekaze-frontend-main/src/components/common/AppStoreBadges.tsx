import React from "react";

export const AppStoreBadges: React.FC = () => {
  const handleOpenDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("/download", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pt-6 border-t border-slate-100 text-center space-y-3">
      <p className="text-sm font-bold text-slate-900 tracking-tight">
        Get the app!
      </p>
      <div className="flex items-center justify-center gap-3">
        {/* App Store Badge */}
        <a
          href="/download"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenDownload}
          className="flex items-center gap-2 bg-black hover:bg-slate-900 active:scale-95 text-white px-3.5 py-1.5 rounded-lg border border-black shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.19-9.35-11.13-20.08-14.82-32.18-3.69-12.1-5.54-23.47-5.54-34.1 0-14.75 3.69-26.79 11.07-36.14 7.38-9.35 16.59-14.15 27.63-14.42 4.12 0 8.91 1.08 14.38 3.24 5.46 2.16 9.4 3.24 11.83 3.24 2.11 0 6.13-1.14 12.06-3.41 5.93-2.27 10.74-3.35 14.42-3.24 10.63.53 19.46 4.48 26.5 11.83-9.35 5.66-13.91 13.43-13.68 23.32.23 7.82 3.17 14.53 8.81 20.13 5.65 5.6 12.44 8.78 20.39 9.54-2.12 6.53-4.58 12.87-7.39 19.01zM119.22 31.84c0-7.39 2.65-14.34 7.95-20.86 5.3-6.52 11.78-10.45 19.44-11.79.11 1.28.16 2.44.16 3.49 0 7.28-2.65 14.18-7.95 20.7-5.3 6.52-11.89 10.51-19.76 11.96.11-1.16.16-2.33.16-3.5z" />
          </svg>
          <div className="text-left">
            <p className="text-[8px] uppercase tracking-wider text-slate-300 leading-tight">Download on the</p>
            <p className="text-xs font-bold leading-tight">App Store</p>
          </div>
        </a>

        {/* Google Play Badge */}
        <a
          href="/download"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenDownload}
          className="flex items-center gap-2 bg-black hover:bg-slate-900 active:scale-95 text-white px-3.5 py-1.5 rounded-lg border border-black shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M3.6 1.8l11.3 11.3-3.2 3.2L1.5 3.9c-.3.4-.4.9-.4 1.4v13.4c0 .5.1 1 .4 1.4l10.2-12.4L3.6 1.8z" />
            <path fill="#34A853" d="M18.8 9.5L14.9 7.2 11.7 10.4l3.2 3.2 3.9-2.2c1.1-.6 1.1-1.6 0-2.1z" />
            <path fill="#FBBC05" d="M1.5 20.1c.4.4.9.6 1.5.6.5 0 1-.2 1.5-.4l10.4-5.9-3.2-3.2L1.5 20.1z" />
            <path fill="#EA4335" d="M14.9 7.2L4.5 1.3C4 1 3.5.9 3 .9c-.6 0-1.1.2-1.5.6l10.2 8.9 3.2-3.2z" />
          </svg>
          <div className="text-left">
            <p className="text-[8px] uppercase tracking-wider text-slate-300 leading-tight">GET IT ON</p>
            <p className="text-xs font-bold leading-tight">Google Play</p>
          </div>
        </a>
      </div>
    </div>
  );
};
