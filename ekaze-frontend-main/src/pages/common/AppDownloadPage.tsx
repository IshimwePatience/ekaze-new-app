import React, { useMemo } from "react";
import { QRCode } from "antd";
import logo from "@/assets/reallogo.png";

export const AppDownloadPage: React.FC = () => {
  // Use current site URL or direct app download endpoint for the real QR code
  const downloadUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/download`;
    }
    return "https://ihirwepay.rw/download";
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 relative selection:bg-[#0073bb]/20">

      {/* Main Download Showcase Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-24 py-12">
        {/* Left Side: Mobile Phone Frame Mockup */}
        <div className="relative shrink-0">
          <div className="w-[280px] sm:w-[300px] h-[520px] sm:h-[550px] bg-white rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18),0_10px_25px_-5px_rgba(0,0,0,0.06)] border-[6px] border-white ring-1 ring-slate-200/70 p-6 flex flex-col items-center justify-center relative select-none">
            {/* Top Speaker / Dynamic Island Notch */}
            <div className="absolute top-4 w-20 h-4 bg-slate-100 rounded-full" />

            {/* Phone Screen App Card */}
            <div className="flex flex-col items-center text-center -mt-6">
              {/* App Icon */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] bg-gradient-to-tr from-[#005f9e] via-[#0073bb] to-[#2478b8] p-3 flex items-center justify-center shadow-[0_12px_28px_rgba(0,115,187,0.32)] mb-4 ring-1 ring-white/40">
                <div className="w-full h-full rounded-[18px] bg-white/95 flex items-center justify-center p-2.5 shadow-inner">
                  <img
                    src={logo}
                    alt="Ihirwe Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Subtitle Label */}
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                IHIRWE
              </p>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug max-w-[210px]">
                Ihirwe - Apps on Google Play
              </h2>
            </div>
          </div>
        </div>

        {/* Right Side: Scan to Download Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#0c2340] tracking-tight leading-tight">
            Scan to download<br className="hidden sm:inline" /> the app
          </h1>

          {/* Real QR Code Container */}
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 inline-block">
            <QRCode
              value={downloadUrl}
              size={168}
              bordered={false}
              color="#0f172a"
            />
          </div>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-3 w-full max-w-[240px]">
            <div className="h-px bg-slate-300/80 flex-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
            <div className="h-px bg-slate-300/80 flex-1" />
          </div>

          {/* App Store & Google Play Badges */}
          <div className="flex items-center gap-3">
            {/* App Store Badge */}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black hover:bg-slate-900 active:scale-95 text-white px-3.5 py-2 rounded-lg border border-black shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.19-9.35-11.13-20.08-14.82-32.18-3.69-12.1-5.54-23.47-5.54-34.1 0-14.75 3.69-26.79 11.07-36.14 7.38-9.35 16.59-14.15 27.63-14.42 4.12 0 8.91 1.08 14.38 3.24 5.46 2.16 9.4 3.24 11.83 3.24 2.11 0 6.13-1.14 12.06-3.41 5.93-2.27 10.74-3.35 14.42-3.24 10.63.53 19.46 4.48 26.5 11.83-9.35 5.66-13.91 13.43-13.68 23.32.23 7.82 3.17 14.53 8.81 20.13 5.65 5.6 12.44 8.78 20.39 9.54-2.12 6.53-4.58 12.87-7.39 19.01zM119.22 31.84c0-7.39 2.65-14.34 7.95-20.86 5.3-6.52 11.78-10.45 19.44-11.79.11 1.28.16 2.44.16 3.49 0 7.28-2.65 14.18-7.95 20.7-5.3 6.52-11.89 10.51-19.76 11.96.11-1.16.16-2.33.16-3.5z" />
              </svg>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-wider text-slate-300 leading-tight">
                  Download on the
                </p>
                <p className="text-xs font-bold leading-tight">App Store</p>
              </div>
            </a>

            {/* Google Play Badge */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black hover:bg-slate-900 active:scale-95 text-white px-3.5 py-2 rounded-lg border border-black shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.6 1.8l11.3 11.3-3.2 3.2L1.5 3.9c-.3.4-.4.9-.4 1.4v13.4c0 .5.1 1 .4 1.4l10.2-12.4L3.6 1.8z" />
                <path fill="#34A853" d="M18.8 9.5L14.9 7.2 11.7 10.4l3.2 3.2 3.9-2.2c1.1-.6 1.1-1.6 0-2.1z" />
                <path fill="#FBBC05" d="M1.5 20.1c.4.4.9.6 1.5.6.5 0 1-.2 1.5-.4l10.4-5.9-3.2-3.2L1.5 20.1z" />
                <path fill="#EA4335" d="M14.9 7.2L4.5 1.3C4 1 3.5.9 3 .9c-.6 0-1.1.2-1.5.6l10.2 8.9 3.2-3.2z" />
              </svg>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-wider text-slate-300 leading-tight">
                  Download on
                </p>
                <p className="text-xs font-bold leading-tight">Google play</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadPage;
