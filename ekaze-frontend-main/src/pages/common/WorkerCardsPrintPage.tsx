import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCode } from 'antd';
import { Printer, ChevronDown, Check, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from '@/assets/reallogo.png';
import { api } from '@/lib/api';

const getFullPhotoUrl = (photoUrl?: string) => {
  if (!photoUrl) return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:')) {
    return photoUrl;
  }
  const apiBase = import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_API_URL || 'https://ekaze.benofinance.rw/api/v1')
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');
  const origin = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${origin}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
};

// AWS-Style Isometric Floating Amber Cubes Background Vector from mfa-setup
const AwsCubesBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Left Stacked Clusters */}
      <g transform="translate(40, 80) scale(1.1)" opacity="0.45">
        <polygon points="50,10 90,32 50,54 10,32" fill="url(#cubeTop)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="10,32 50,54 50,98 10,76" fill="url(#cubeLeft)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="50,54 90,32 90,76 50,98" fill="url(#cubeRight)" stroke="#FED7AA" strokeWidth="0.8" />
      </g>
      <g transform="translate(120, 200) scale(1.3)" opacity="0.35">
        <polygon points="50,10 90,32 50,54 10,32" fill="url(#cubeTop)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="10,32 50,54 50,98 10,76" fill="url(#cubeLeft)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="50,54 90,32 90,76 50,98" fill="url(#cubeRight)" stroke="#FED7AA" strokeWidth="0.8" />
      </g>
      <g transform="translate(30, 360) scale(1.4)" opacity="0.3">
        <polygon points="50,10 90,32 50,54 10,32" fill="url(#cubeTop)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="10,32 50,54 50,98 10,76" fill="url(#cubeLeft)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="50,54 90,32 90,76 50,98" fill="url(#cubeRight)" stroke="#FED7AA" strokeWidth="0.8" />
      </g>

      {/* Right Stacked Clusters */}
      <g transform="translate(1100, 60) scale(1.2)" opacity="0.4">
        <polygon points="50,10 90,32 50,54 10,32" fill="url(#cubeTop)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="10,32 50,54 50,98 10,76" fill="url(#cubeLeft)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="50,54 90,32 90,76 50,98" fill="url(#cubeRight)" stroke="#FED7AA" strokeWidth="0.8" />
      </g>
      <g transform="translate(1220, 220) scale(1.4)" opacity="0.35">
        <polygon points="50,10 90,32 50,54 10,32" fill="url(#cubeTop)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="10,32 50,54 50,98 10,76" fill="url(#cubeLeft)" stroke="#FED7AA" strokeWidth="0.8" />
        <polygon points="50,54 90,32 90,76 50,98" fill="url(#cubeRight)" stroke="#FED7AA" strokeWidth="0.8" />
      </g>
    </svg>
  </div>
);

interface WorkerCardData {
  id: number;
  name: string;
  card_number: string;
  ekaze_id?: string;
  photo: string;
  phone: string;
  email: string;
  national_id: string;
  masked_nid: string;
  district: string;
  province: string;
  company: string;
  profession: string;
  issue_date: string;
  expiry_date: string;
  verify_url: string;
}

const formatProfession = (prof?: string): string => {
  if (!prof) return '';
  return prof.replace(/[•·]/g, ',').replace(/\s*,\s*/g, ', ');
};

const formatEkazeId = (id: number | string | undefined, existingId?: string): string => {
  if (existingId && /^\d{10}$/.test(existingId)) return existingId;
  const num = parseInt(String(id || '10').replace(/\D/g, ''), 10) || 10;
  return `100${String(num).padStart(7, '0')}`;
};

export const WorkerCardsPrintPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get('ids') || '10';

  const [cards, setCards] = useState<WorkerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [lang, setLang] = useState<'eng' | 'kin'>('eng');
  const [downloadingSide, setDownloadingSide] = useState<'front' | 'back' | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/company/workers/business-cards/data?ids=${idsParam}`);
        const data = res.data;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCards(data.data);
        }
      } catch (err) {
        console.error('Failed to load card data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [idsParam]);

  const handleDownloadPdf = async (side: 'front' | 'back') => {
    const container = document.getElementById('cards-print-container');
    if (!container) return;

    setDownloadingSide(side);
    try {
      const selector = side === 'front' ? '.card-face-front' : '.card-face-back';
      const cardElements = container.querySelectorAll(selector);
      if (!cardElements.length) return;

      const isPortrait = orientation === 'portrait';
      let pdf: jsPDF;
      let pageWidth: number;
      let pageHeight: number;

      if (!isPortrait) {
        // Landscape card exact dimensions requested:
        // W: 25.68 cm = 256.8 mm (10.11 Inc)
        // H: 16.2 cm = 162.0 mm (6.377 Inc)
        pageWidth = 256.8;
        pageHeight = 162.0;
        pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [pageWidth, pageHeight],
        });
      } else {
        pageWidth = 210;
        pageHeight = 297;
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      }

      for (let i = 0; i < cardElements.length; i++) {
        if (i > 0) {
          if (!isPortrait) {
            pdf.addPage([pageWidth, pageHeight], 'landscape');
          } else {
            pdf.addPage('a4', 'portrait');
          }
        }
        const cardEl = cardElements[i] as HTMLElement;
        const canvas = await html2canvas(cardEl, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');

        if (!isPortrait) {
          // Exact full card bleed to 25.68 cm x 16.2 cm
          pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
        } else {
          const margin = 16;
          const maxW = pageWidth - margin * 2;
          const maxH = pageHeight - margin * 2;
          let rW = maxW;
          let rH = (canvas.height * rW) / canvas.width;
          if (rH > maxH) {
            rH = maxH;
            rW = (canvas.width * rH) / canvas.height;
          }
          const posX = (pageWidth - rW) / 2;
          const posY = (pageHeight - rH) / 2;
          pdf.addImage(imgData, 'PNG', posX, posY, rW, rH, undefined, 'FAST');
        }
      }

      const singleWorkerName = cards[0]?.name
        ? cards[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : 'worker';

      const fileName = cards.length === 1
        ? `ekaze-${side}-${singleWorkerName}.pdf`
        : `ekaze-workers-${side}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloadingSide(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#fbfbfb] text-[#16191f] flex flex-col justify-between relative selection:bg-[#0073bb]/20 print:bg-white print:p-0"
      style={{
        fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        @media print {
          @page {
            size: ${orientation === 'landscape' ? '25.68cm 16.2cm' : 'a4 portrait'};
            margin: 0;
          }
          ${orientation === 'landscape' ? `
            .card-face-front, .card-face-back {
              width: 25.68cm !important;
              height: 16.2cm !important;
            }
          ` : ''}
        }
      `}</style>

      <AwsCubesBackground />

      {/* Top Header with Language Dropdown (English & Kinyarwanda) and Centered Ekaze Logo */}
      <header className="relative z-10 w-full px-6 pt-5 pb-2 print:hidden">
        {/* Top Right Language Selector */}
        <div className="flex justify-end max-w-6xl mx-auto">
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-[14px] text-[#0073bb] hover:underline cursor-pointer select-none font-medium bg-transparent border-none p-0 focus:outline-none"
            >
              <span>{lang === 'eng' ? 'English' : 'Kinyarwanda'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Selection Dropdown Menu */}
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-[6px] border border-[#d5dbdb] shadow-md py-1 z-50 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setLang('eng');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-[13px] flex items-center justify-between transition-colors ${lang === 'eng' ? 'bg-[#f2f8fd] text-[#0073bb] font-bold' : 'text-[#16191f] hover:bg-slate-50'
                    }`}
                >
                  <span>English</span>
                  {lang === 'eng' && <Check className="w-3.5 h-3.5 text-[#0073bb]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('kin');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-[13px] flex items-center justify-between transition-colors ${lang === 'kin' ? 'bg-[#f2f8fd] text-[#0073bb] font-bold' : 'text-[#16191f] hover:bg-slate-50'
                    }`}
                >
                  <span>Kinyarwanda</span>
                  {lang === 'kin' && <Check className="w-3.5 h-3.5 text-[#0073bb]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Centered Ekaze Brand Logo */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div
            className="flex flex-col items-center select-none cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate('/')}
            title="Ekaze"
          >
            <img src={logo} alt="Ekaze" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
        </div>

        {/* Action Toolbar: Compact Height with Orientation Switcher & Print Button */}
        <div className="max-w-4xl mx-auto mt-2 px-4">
          <div
            className="bg-white rounded-[14px] border border-[#d5dbdb] shadow-[0_1px_1px_0_rgba(0,28,36,0.25),0_1px_12px_0_rgba(0,28,36,0.08)] py-3 px-5 sm:py-3.5 sm:px-6 flex items-center justify-between gap-3"
            style={{
              fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Orientation Switcher Pill (Portrait / Landscape) on the Left */}
            <div
              className="inline-flex rounded-full border border-[#0073bb] p-0.5 bg-white h-[36px] items-center shrink-0"
              style={{
                fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`h-[28px] px-3.5 rounded-full text-[13px] font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${orientation === 'portrait'
                  ? 'bg-[#0073bb] text-white shadow-sm'
                  : 'bg-transparent text-[#0073bb] hover:bg-[#f2f8fd]'
                  }`}
                style={{
                  fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                </svg>
                <span>{lang === 'kin' ? 'Uruhagararo' : 'Portrait'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`h-[28px] px-3.5 rounded-full text-[13px] font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${orientation === 'landscape'
                  ? 'bg-[#0073bb] text-white shadow-sm'
                  : 'bg-transparent text-[#0073bb] hover:bg-[#f2f8fd]'
                  }`}
                style={{
                  fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                </svg>
                <span>{lang === 'kin' ? 'Urubariro' : 'Landscape'}</span>
              </button>
            </div>

            {orientation === 'landscape' && (
              <div className="hidden md:flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <span className="text-[#0073bb]">Dimensions:</span>
                <span>W: 25.68 cm × H: 16.2 cm (10.11" × 6.377")</span>
              </div>
            )}

            {/* Save Buttons on the Right */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Save Front PDF button */}
              <button
                type="button"
                onClick={() => handleDownloadPdf('front')}
                disabled={downloadingSide !== null}
                className="h-[36px] px-4 rounded-full bg-[#0073bb] hover:bg-[#005f9e] disabled:opacity-75 text-white text-[13px] font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 border-none shadow-sm shrink-0"
                style={{
                  fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
              >
                {downloadingSide === 'front' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'kin' ? 'Bika Imbere...' : 'Saving Front...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{lang === 'kin' ? 'Bika Imbere (PDF)' : 'Save Front PDF'}</span>
                  </>
                )}
              </button>

              {/* Save Back PDF button */}
              <button
                type="button"
                onClick={() => handleDownloadPdf('back')}
                disabled={downloadingSide !== null}
                className="h-[36px] px-4 rounded-full bg-white hover:bg-[#f2f8fd] disabled:opacity-75 text-[#0073bb] border border-[#0073bb] text-[13px] font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                style={{
                  fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
              >
                {downloadingSide === 'back' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'kin' ? 'Bika Inyuma...' : 'Saving Back...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{lang === 'kin' ? 'Bika Inyuma (PDF)' : 'Save Back PDF'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Badges Content Sheet */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 print:p-0">
        {loading ? (
          <div className="text-center py-20 text-[#545b64]">
            <div className="w-8 h-8 border-3 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px]">Loading worker identification cards...</p>
          </div>
        ) : (
          <div id="cards-print-container" className="flex flex-col items-center gap-10 w-full max-w-5xl print:gap-8 print:w-full">
            {cards.map((worker) => {
              const baseOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
                ? window.location.origin
                : 'https://ekaze.benofinance.rw';
              const verifyUrl = `${baseOrigin}/verify-worker/${worker.id}`;

              if (orientation === 'landscape') {
                /* ═══════════════════════════════════════════════════
                   LANDSCAPE (HORIZONTAL) BADGES
                   ═══════════════════════════════════════════════════ */
                return (
                  <div
                    key={worker.id}
                    className="worker-card-row flex flex-wrap justify-center items-center gap-8 w-full print:page-break-after-always print:mb-8"
                  >
                    {/* Front Face (Landscape) */}
                    <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80">
                      <div className="absolute -top-3 w-10 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                      <div className="w-14 h-2 bg-slate-200 rounded-md border border-slate-300 mb-2 shadow-inner" />

                      <div
                        className="card-face-front w-[475px] h-[300px] rounded-[14px] relative overflow-hidden bg-[#03142c] text-white shadow-xl border border-slate-800/80 select-none flex print:shadow-none"
                        style={{ aspectRatio: '25.68 / 16.2' }}
                      >
                        {/* Left Side: Photo, Logo, 10-digit Ekaze ID */}
                        <div className="w-[160px] shrink-0 px-2 py-3.5 flex flex-col items-center justify-between z-10 border-r border-slate-700/60 bg-[#03142c]">
                          <div className="flex items-center">
                            <img src={logo} alt="Ekaze" className="h-[20px] w-auto object-contain" />
                          </div>

                          <div
                            className="w-[105px] h-[105px] rounded-full p-1.5 flex items-center justify-center my-0.5"
                            style={{
                              background:
                                'radial-gradient(circle, rgba(0, 209, 255, 0.85) 0%, rgba(0, 163, 196, 0.45) 50%, rgba(3, 20, 44, 0) 70%)',
                            }}
                          >
                            <img
                              src={getFullPhotoUrl(worker.photo)}
                              alt={worker.name}
                              className="w-[92px] h-[92px] rounded-full object-cover border-2 border-white shadow-xl bg-slate-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>

                          <span className="text-[11px] font-sans font-bold text-white tracking-normal text-center whitespace-nowrap">
                            Ekaze ID Nº {formatEkazeId(worker.id, worker.ekaze_id)}
                          </span>
                        </div>

                        {/* Right Side: Details, Swoosh, Dot Matrix - Centered in the middle */}
                        <div className="flex-1 px-6 py-4 relative overflow-hidden flex flex-col justify-center gap-4 z-10">
                          {/* Curving Swoosh */}
                          <svg className="absolute top-0 right-0 w-full h-[150px] z-0 pointer-events-none" viewBox="0 0 300 150" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="tealSwooshLand" x1="0%" y1="0%" x2="100%" y2="80%">
                                <stop offset="0%" stopColor="#00a3c4" />
                                <stop offset="45%" stopColor="#008faf" stopOpacity="0.95" />
                                <stop offset="85%" stopColor="#05284e" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#03142c" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d="M 0,0 L 300,0 L 300,60 C 200,120 100,60 0,110 Z" fill="url(#tealSwooshLand)" />
                          </svg>

                          <div className="relative z-10">
                            <h2 className="text-[19px] font-normal text-white uppercase tracking-wide leading-tight">
                              {worker.name}
                            </h2>
                            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
                              {formatProfession(worker.profession)}
                            </p>
                            <div className="w-20 h-[2.5px] bg-[#ffd000] rounded-sm mt-1.5" />
                          </div>

                          <div className="relative z-10 flex flex-col gap-2 text-[11px] text-slate-300">
                            <div>
                              <span className="text-slate-300 block text-[11px] font-normal tracking-normal mb-0.5">Company:</span>
                              <span className="font-semibold text-white text-[12px] block leading-tight">{worker.company}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div>
                                <span className="text-slate-300 block text-[11px] font-normal tracking-normal mb-0.5">Phone:</span>
                                <span className="font-semibold text-white text-[12px] block leading-tight">{worker.company_phone || '+250 788 123 456'}</span>
                              </div>
                              <div>
                                <span className="text-slate-300 block text-[11px] font-normal tracking-normal mb-0.5">Location:</span>
                                <span className="font-semibold text-white text-[12px] block leading-tight">{worker.company_address || `${worker.district}, ${worker.province}`}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Right Lime Bar & Dots */}
                          <div className="absolute bottom-3 right-4 grid grid-cols-4 gap-1 z-10">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <span key={i} className="w-1 h-1 bg-[#cbf310] rounded-full" />
                            ))}
                          </div>
                          <div className="absolute bottom-3 right-0 w-1.5 h-8 bg-[#cbf310] rounded-l z-10" />
                        </div>
                      </div>
                    </div>

                    {/* Back Face (Landscape) */}
                    <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80">
                      <div className="absolute -top-3 w-10 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                      <div className="w-14 h-2 bg-slate-200 rounded-md border border-slate-300 mb-2 shadow-inner" />

                      <div
                        className="card-face-back w-[475px] h-[300px] rounded-[14px] relative overflow-hidden bg-white text-[#16191f] shadow-xl border border-slate-200 select-none flex print:shadow-none"
                        style={{ aspectRatio: '25.68 / 16.2' }}
                      >
                      {/* Left Side: Logo, Contact List & Notice */}
                      <div className="flex-1 p-5 flex flex-col justify-between z-10">
                        <div className="flex items-center">
                          <img src={logo} alt="Ekaze" className="h-[22px] w-auto object-contain" />
                        </div>

                        <div className="flex flex-col gap-2.5 text-[11.5px] text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-[11.5px] text-slate-800">{worker.company_phone || '+250 788 123 456'}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-[11.5px] text-slate-800">{worker.company_address || `${worker.district}, ${worker.province}`}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-[11.5px] text-slate-800">{worker.company_email || 'contact@kigalisecurity.rw'}</span>
                            </div>
                          </div>

                          <p className="text-[9.5px] text-slate-500 leading-snug">
                            If found, please return to {worker.company} or any Ekaze counter.
                          </p>
                        </div>

                        {/* Right Side: QR Code & Verification link */}
                        <div className="w-[170px] shrink-0 p-4 flex flex-col items-center justify-center z-10 bg-[#03142c] text-white rounded-r-[14px]">
                          <a
                            href={verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-[72px] h-[72px] bg-white p-1 rounded-md shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                            title={`Scan or click to verify worker credentials (${verifyUrl})`}
                          >
                            <QRCode value={verifyUrl} size={64} bordered={false} color="#03142c" />
                          </a>
                          <span className="text-[7.5px] font-extrabold tracking-wider text-[#cbf310] uppercase mt-1.5">
                            SCAN TO VERIFY
                          </span>

                          <div className="grid grid-cols-4 gap-1 my-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <span key={i} className="w-1 h-1 bg-[#cbf310] rounded-full" />
                            ))}
                          </div>

                          <a
                            href={verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-white tracking-tight hover:underline"
                          >
                            ekaze.benofinance.rw
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              /* ═══════════════════════════════════════════════════
                 PORTRAIT (VERTICAL) BADGES (DEFAULT)
                 ═══════════════════════════════════════════════════ */
              return (
                <div
                  key={worker.id}
                  className="worker-card-row flex flex-wrap justify-center items-center gap-8 w-full print:page-break-after-always print:mb-8"
                >
                  {/* Front Face (Portrait) */}
                  <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80">
                    <div className="absolute -top-3 w-8 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                    <div className="w-12 h-2.5 bg-slate-200 rounded-md border border-slate-300 mb-2.5 shadow-inner" />

                    <div className="card-face-front w-[300px] h-[476px] rounded-[14px] relative overflow-hidden bg-[#03142c] text-white shadow-xl select-none print:shadow-none">
                      <div className="absolute top-5 left-5 z-10 flex items-center">
                      <img src={logo} alt="Ekaze" className="h-[22px] w-auto object-contain" />
                    </div>

                      <svg className="absolute top-0 left-0 w-full h-[170px] z-[1]" viewBox="0 0 300 170" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="tealSwoosh" x1="0%" y1="0%" x2="100%" y2="80%">
                            <stop offset="0%" stopColor="#00a3c4" />
                            <stop offset="45%" stopColor="#008faf" stopOpacity="0.95" />
                            <stop offset="85%" stopColor="#05284e" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#03142c" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0,0 L 300,0 L 300,75 C 220,180 120,120 0,165 Z" fill="url(#tealSwoosh)" />
                      </svg>

                      <div
                        className="absolute top-[155px] left-6 w-11 h-4 opacity-20 z-[2]"
                        style={{
                          background: 'repeating-linear-gradient(-45deg, #ffffff, #ffffff 1.5px, transparent 1.5px, transparent 4px)',
                        }}
                      />
                      <div
                        className="absolute top-[265px] right-7 w-12 h-5 opacity-20 z-[2]"
                        style={{
                          background: 'repeating-linear-gradient(-45deg, #ffffff, #ffffff 1.5px, transparent 1.5px, transparent 4px)',
                        }}
                      />

                      <div className="absolute top-[105px] left-1/2 -translate-x-1/2 z-[5]">
                        <div
                          className="w-[176px] h-[176px] rounded-full p-2 flex items-center justify-center"
                          style={{
                            background:
                              'radial-gradient(circle, rgba(0, 209, 255, 0.85) 0%, rgba(0, 163, 196, 0.45) 50%, rgba(3, 20, 44, 0) 70%)',
                          }}
                        >
                          <img
                            src={getFullPhotoUrl(worker.photo)}
                            alt={worker.name}
                            className="w-[156px] h-[156px] rounded-full object-cover border-4 border-white shadow-2xl bg-slate-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-[54px] left-0 w-full flex flex-col items-center text-center px-5 z-[6]">
                        <span className="text-[12.5px] font-sans font-bold text-white tracking-normal whitespace-nowrap mb-1">
                          Ekaze ID Nº {formatEkazeId(worker.id, worker.ekaze_id)}
                        </span>
                        <h2 className="text-[19px] font-normal text-white uppercase tracking-wide leading-tight mb-1">
                          {worker.name}
                        </h2>
                        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">
                          {formatProfession(worker.profession)}
                        </p>
                        <div className="w-24 h-[2.5px] bg-[#ffd000] rounded-sm mb-2" />
                        <div className="text-[11px] text-slate-300 font-normal max-w-[260px] truncate">
                          Company: <span className="font-semibold text-white ml-1">{worker.company}</span>
                        </div>
                      </div>

                      <div className="absolute bottom-5 right-5 grid grid-cols-4 gap-1.5 z-[6]">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span key={i} className="w-1 h-1 bg-[#cbf310] rounded-full" />
                        ))}
                      </div>

                      <div className="absolute bottom-4 right-0 w-1.5 h-10 bg-[#cbf310] rounded-l z-[6]" />
                    </div>
                  </div>

                  {/* Back Face (Portrait) */}
                  <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80">
                    <div className="absolute -top-3 w-8 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                    <div className="w-12 h-2.5 bg-slate-200 rounded-md border border-slate-300 mb-2.5 shadow-inner" />

                    <div className="card-face-back w-[300px] h-[476px] rounded-[14px] relative overflow-hidden bg-white text-[#16191f] shadow-xl border border-slate-200 select-none print:shadow-none">
                      <div className="absolute top-0 left-0 w-full h-[125px] z-[1]">
                        <svg className="w-full h-full" viewBox="0 0 300 125" preserveAspectRatio="none">
                          <path d="M 0,0 L 300,0 L 300,105 C 210,135 120,60 0,120 Z" fill="#d3f5f5" />
                          <path d="M 0,0 L 300,0 L 300,90 C 200,120 110,45 0,105 Z" fill="#03142c" />
                        </svg>

                        <div className="absolute top-3.5 right-4 grid grid-cols-3 gap-1.5 z-[2]">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <span key={i} className="w-1 h-1 bg-[#cbf310] rounded-full" />
                          ))}
                        </div>
                      </div>

                      <div className="absolute top-[132px] left-1/2 -translate-x-1/2 z-[5] flex items-center justify-center">
                        <img src={logo} alt="Ekaze" className="h-[24px] w-auto object-contain" />
                      </div>

                      <div className="absolute top-[174px] left-0 w-full px-6 flex flex-col gap-2.5 z-[5]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                          </div>
                          <span className="text-[11.5px] font-semibold text-slate-800">{worker.company_phone || '+250 788 123 456'}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </div>
                          <span className="text-[11.5px] font-semibold text-slate-800">
                            {worker.company_address || `${worker.district}, ${worker.province}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#03142c] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                          </div>
                          <span className="text-[11.5px] font-semibold text-slate-800">{worker.company_email || 'contact@kigalisecurity.rw'}</span>
                        </div>

                        <p className="text-[9.5px] text-slate-500 leading-snug mt-1">
                          If found, please return to {worker.company} or any Ekaze counter.
                        </p>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full h-[115px] z-[2]">
                        <svg className="w-full h-full" viewBox="0 0 300 115" preserveAspectRatio="none">
                          <path d="M 0,45 C 90,0 200,60 300,10 L 300,115 L 0,115 Z" fill="#d3f5f5" />
                          <path d="M 0,60 C 100,15 210,75 300,25 L 300,115 L 0,115 Z" fill="#03142c" />
                        </svg>

                        <div className="absolute bottom-2.5 left-0 w-full px-5 flex items-end justify-between z-[5]">
                          <div className="flex flex-col items-center">
                            <a
                              href={verifyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-[60px] h-[60px] bg-white p-1 rounded-md shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                              title={`Scan or click to verify worker credentials (${verifyUrl})`}
                            >
                              <QRCode value={verifyUrl} size={52} bordered={false} color="#03142c" />
                            </a>
                            <span className="text-[7px] font-extrabold tracking-wider text-[#cbf310] uppercase mt-1">
                              SCAN TO VERIFY
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <div className="grid grid-cols-4 gap-1.5">
                              {Array.from({ length: 12 }).map((_, i) => (
                                <span key={i} className="w-1 h-1 bg-[#cbf310] rounded-full" />
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#03142c" strokeWidth="2.5">
                                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                  <circle cx="12" cy="12" r="4" />
                                </svg>
                              </span>
                              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="9" height="9" fill="#03142c">
                                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                              </span>
                              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="9" height="9" fill="#03142c">
                                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                                </svg>
                              </span>
                              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="9" height="9" fill="#03142c">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                              </span>
                            </div>

                            <a
                              href={verifyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-white tracking-tight hover:underline"
                            >
                              ekaze.benofinance.rw
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[12px] text-[#545b64] print:hidden">
        © 2026 Ekaze Ltd. All rights reserved. • Dual-Sided ID Badge Printing Service
      </footer>
    </div>
  );
};

export default WorkerCardsPrintPage;
