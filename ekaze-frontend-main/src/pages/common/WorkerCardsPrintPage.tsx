import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCode } from 'antd';
import { Printer, ChevronDown, Check, Download, Loader2, MapPin } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from '@/assets/dashboard logo.png';
import idCardBgFront from '@/assets/id card bg.jpeg';
import idCardBgBack from '@/assets/back bg.jpeg';
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
  company_logo?: string;
  profession: string;
  gender?: string;
  date_of_birth?: string;
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
  const orientation = 'landscape';
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

      const pageWidth = 256.8;
      const pageHeight = 162.0;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pageWidth, pageHeight],
      });

      for (let i = 0; i < cardElements.length; i++) {
        if (i > 0) {
          pdf.addPage([pageWidth, pageHeight], 'landscape');
        }
        const cardEl = cardElements[i] as HTMLElement;
        const canvas = await html2canvas(cardEl, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }

      const singleWorkerName = cards[0]?.name
        ? cards[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : 'worker';

      const fileName = cards.length === 1
        ? `service-card-${side}-${singleWorkerName}.pdf`
        : `service-cards-${side}.pdf`;

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
            size: 25.68cm 16.2cm;
            margin: 0;
          }
          .card-face-front, .card-face-back {
            width: 25.68cm !important;
            height: 16.2cm !important;
          }
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

        {/* Action Toolbar: Service Card (Landscape) & Print Button */}
        <div className="max-w-6xl mx-auto mt-2 px-4">
          <div
            className="bg-white rounded-[14px] border border-[#d5dbdb] shadow-[0_1px_1px_0_rgba(0,28,36,0.25),0_1px_12px_0_rgba(0,28,36,0.08)] py-3 px-5 sm:py-3.5 sm:px-6 flex items-center justify-between gap-3"
            style={{
              fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Service Card (Landscape) Title on the Left */}
            <div className="text-[14px] font-bold text-slate-800">
              Service Card (Landscape)
            </div>

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
          <div id="cards-print-container" className="flex flex-col items-center gap-10 w-full max-w-7xl px-2 print:gap-8 print:w-full print:p-0">
            {cards.map((worker) => {
              const baseOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
                ? window.location.origin
                : 'https://ekaze.benofinance.rw';
              const verifyUrl = `${baseOrigin}/verify-worker/${worker.id}`;

              return (
                <div
                  key={worker.id}
                  className="worker-card-row flex flex-col xl:flex-row justify-center items-center gap-6 xl:gap-8 w-full print:block print:w-full print:page-break-after-always print:mb-8"
                >
                  {/* Front Face (Landscape) */}
                  <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80 shrink-0">
                    <div className="absolute -top-3 w-10 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                    <div className="w-14 h-2 bg-slate-200 rounded-md border border-slate-300 mb-2 shadow-inner" />

                    <div
                      className="card-face-front w-[476px] h-[300px] min-w-[476px] min-h-[300px] max-w-[476px] max-h-[300px] shrink-0 rounded-none relative overflow-hidden bg-white text-slate-900 shadow-none border-0 select-none flex flex-col justify-between print:shadow-none p-3.5 font-sans"
                      style={{
                        backgroundImage: `url(${idCardBgFront})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {/* Top Row: Centered "Service Card" Title with Company Logo on Left */}
                      <div className="relative flex items-center justify-center z-10 pt-1 px-1 w-full min-h-[44px]">
                        <div className="absolute left-1 top-0.5">
                          <div className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-xs overflow-hidden flex items-center justify-center shrink-0">
                            {worker.company_logo ? (
                              <img
                                src={getFullPhotoUrl(worker.company_logo)}
                                alt={worker.company}
                                className="w-full h-full object-cover object-center"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = logo;
                                }}
                              />
                            ) : (
                              <img src={logo} alt="Ekaze" className="w-7 h-7 object-contain p-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Title: Service Card — Centered */}
                        <div className="text-[24px] font-black italic tracking-wide text-[#03142c] text-center font-sans">
                          Service Card
                        </div>
                      </div>

                      {/* Middle Content: Photo on Left, Details on Right (No Location) */}
                      <div className="flex items-start gap-3.5 px-1 z-10 -mt-1">
                        {/* Photo with rounded rectangular border */}
                        <div className="w-[120px] h-[120px] rounded-[18px] border-[2px] border-slate-900 overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                          <img
                            src={getFullPhotoUrl(worker.photo)}
                            alt={worker.name}
                            className="w-full h-full object-cover object-center"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>

                        {/* Details (No Location) */}
                        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1 space-y-1">
                          {/* Amazina/Names */}
                          <div>
                            <div className="text-[9.5px] text-slate-500 font-semibold leading-normal">Amazina/Names:</div>
                            <div className="text-[14.5px] font-extrabold text-slate-900 leading-normal overflow-visible">
                              {worker.name}
                            </div>
                          </div>

                          {/* Itariki y'amavuko/ Date of Birth */}
                          <div>
                            <div className="text-[9.5px] text-slate-500 font-semibold leading-normal">Itariki y'amavuko/ Date of Birth:</div>
                            <div className="text-[12px] font-bold text-slate-900 leading-normal">
                              {worker.date_of_birth || '01/10/1999'}
                            </div>
                          </div>

                          {/* Gender & Expiration row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[9.5px] text-slate-500 font-semibold leading-normal">Igitsina/Gender:</div>
                              <div className="text-[12px] font-bold text-slate-900 leading-normal">
                                {worker.gender || 'Gore/Female'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9.5px] text-slate-500 font-semibold leading-normal">Izarangira/Expiration:</div>
                              <div className="text-[12px] font-bold text-slate-900 leading-normal">
                                {worker.expiry_date}
                              </div>
                            </div>
                          </div>

                          {/* Ikigo/Company */}
                          <div>
                            <div className="text-[9.5px] text-slate-500 font-semibold leading-normal">Ikigo/Company:</div>
                            <div className="text-[12px] font-bold text-slate-900 leading-normal overflow-visible">
                              {worker.company}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Card ID No & QR Code */}
                      <div className="flex items-end justify-between px-3 z-10 pb-1">
                        <div className="text-[12px] font-extrabold text-slate-900 mb-8 pl-1">
                          Card ID No: {worker.card_number}
                        </div>

                        <div className="p-0.5 bg-white rounded-[7px] shadow-sm border border-slate-200/90 inline-flex items-center justify-center mb-1">
                          <QRCode value={verifyUrl} size={44} bordered={false} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back Face (Landscape) */}
                  <div className="relative flex flex-col items-center bg-white p-3.5 pt-4 rounded-[18px] shadow-[0_14px_34px_rgba(3,20,44,0.14)] border border-slate-200/80 shrink-0">
                    <div className="absolute -top-3 w-10 h-3.5 bg-gradient-to-b from-slate-400 to-slate-300 rounded-t border border-slate-500 border-b-0 shadow-inner" />
                    <div className="w-14 h-2 bg-slate-200 rounded-md border border-slate-300 mb-2 shadow-inner" />

                    <div
                      className="card-face-back w-[476px] h-[300px] min-w-[476px] min-h-[300px] max-w-[476px] max-h-[300px] shrink-0 rounded-none relative overflow-hidden bg-white text-slate-900 shadow-none border-0 select-none flex flex-col justify-between print:shadow-none p-3.5 font-sans"
                      style={{
                        backgroundImage: `url(${idCardBgBack})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {/* Top: Terms of Use Title */}
                      <div className="text-center pt-2 z-10">
                        <h3 className="text-[24px] font-black italic tracking-wide text-[#03142c] font-sans">
                          Terms of Use
                        </h3>
                      </div>

                      {/* Middle: 2x2 Grid of Rule Cards */}
                      <div className="grid grid-cols-2 gap-2.5 px-3 z-10 -mt-1">
                        {/* Rule 1 */}
                        <div className="bg-white/95 rounded-[12px] border border-slate-200/90 shadow-xs p-2.5 flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#005470] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            1
                          </div>
                          <p className="text-[10px] text-slate-700 leading-snug font-medium">
                            This card identifies the holder as a verified professional affiliated with {worker.company}.
                          </p>
                        </div>

                        {/* Rule 2 */}
                        <div className="bg-white/95 rounded-[12px] border border-slate-200/90 shadow-xs p-2.5 flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#005470] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            2
                          </div>
                          <p className="text-[10px] text-slate-700 leading-snug font-medium">
                            Carry it while working and show it whenever requested.
                          </p>
                        </div>

                        {/* Rule 3 */}
                        <div className="bg-white/95 rounded-[12px] border border-slate-200/90 shadow-xs p-2.5 flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#005470] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            3
                          </div>
                          <p className="text-[10px] text-slate-700 leading-snug font-medium">
                            It is not transferable and is valid until the expiration date shown on the front.
                          </p>
                        </div>

                        {/* Rule 4 */}
                        <div className="bg-white/95 rounded-[12px] border border-slate-200/90 shadow-xs p-2.5 flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#005470] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            4
                          </div>
                          <p className="text-[10px] text-slate-700 leading-snug font-medium">
                            Report a lost or damaged card to Beno Finance, Kimihurura immediately.
                          </p>
                        </div>
                      </div>

                      {/* Bottom Section: Blue Return Banner + Powered by Beno Finance */}
                      <div className="px-3 pb-0.5 z-10 flex flex-col gap-1.5">
                        <div className="w-full bg-[#005470] text-white py-2 px-3.5 rounded-[8px] flex items-center gap-2.5 text-[10.5px] font-medium shadow-xs">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>If found, please return to Beno Finance, Kimihurura.</span>
                        </div>

                        <div className="text-[9.5px] text-slate-500 font-medium select-none pl-1">
                          Powered by <span className="font-bold text-slate-800">Beno Finance</span>
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
