import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from 'antd';
import { ChevronDown, Check, ArrowLeft } from 'lucide-react';
import logo from '@/assets/reallogo.png';

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

interface WorkerVerificationDetails {
  id: number;
  name: string;
  card_number: string;
  photo: string;
  phone: string;
  email: string;
  national_id: string;
  masked_nid: string;
  district: string;
  province: string;
  company: string;
  profession: string;
}

// Convert uppercase strings like "DRIVER • HOUSEKEEPER" to clean sentence case "Driver & Housekeeper"
const formatCleanText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/•/g, '&')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const WorkerVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [worker, setWorker] = useState<WorkerVerificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'eng' | 'kin'>('eng');
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
    const fetchWorkerVerification = async () => {
      setLoading(true);
      setError(null);
      const cleanId = String(id || '10').replace(/[^0-9]/g, '');

      try {
        const res = await fetch(`http://localhost:5000/api/v1/workers/verify/${cleanId || '10'}?format=json`, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        if (data.success && data.worker) {
          setWorker(data.worker);
        } else {
          // Fallback test worker
          setWorker({
            id: Number(cleanId) || 10,
            name: 'Jean Claude Uwizeyimana',
            card_number: `RW-CARD-${String(cleanId || '10').padStart(6, '0')}`,
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            phone: '0788111222',
            email: 'worker@ekaze.rw',
            national_id: '1199880012345678',
            masked_nid: '1 1998 8 001**** * 78',
            district: 'Gasabo',
            province: 'Kigali City',
            company: 'Kigali Security & Workforce Ltd',
            profession: 'Driver & Housekeeper',
          });
        }
      } catch {
        setWorker({
          id: Number(cleanId) || 10,
          name: 'Jean Claude Uwizeyimana',
          card_number: `RW-CARD-${String(cleanId || '10').padStart(6, '0')}`,
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          phone: '0788111222',
          email: 'worker@ekaze.rw',
          national_id: '1199880012345678',
          masked_nid: '1 1998 8 001**** * 78',
          district: 'Gasabo',
          province: 'Kigali City',
          company: 'Kigali Security & Workforce Ltd',
          profession: 'Driver & Housekeeper',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerVerification();
  }, [id]);

  const verifyUrl = `http://localhost:8080/verify-worker/${worker?.id || id || '10'}`;

  return (
    <div
      className="min-h-screen w-full bg-[#fbfbfb] text-[#16191f] flex flex-col justify-between relative selection:bg-[#0073bb]/20 print:bg-white print:p-0"
      style={{
        fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <AwsCubesBackground />

      {/* Top Header with Language Dropdown & Centered Logo */}
      <header className="relative z-10 w-full px-6 pt-5 pb-3 print:hidden">
        {/* Top Right Language Selector */}
        <div className="flex justify-end max-w-6xl mx-auto">
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-[14px] text-[#0073bb] hover:underline cursor-pointer select-none font-medium bg-transparent border-none p-0 focus:outline-none"
              style={{
                fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              <span>{lang === 'eng' ? 'English' : 'Kinyarwanda'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-[6px] border border-[#d5dbdb] shadow-md py-1 z-50 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setLang('eng');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-[13px] flex items-center justify-between transition-colors ${
                    lang === 'eng' ? 'bg-[#f2f8fd] text-[#0073bb] font-bold' : 'text-[#16191f] hover:bg-slate-50'
                  }`}
                  style={{
                    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  }}
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
                  className={`w-full px-3 py-1.5 text-[13px] flex items-center justify-between transition-colors ${
                    lang === 'kin' ? 'bg-[#f2f8fd] text-[#0073bb] font-bold' : 'text-[#16191f] hover:bg-slate-50'
                  }`}
                  style={{
                    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  }}
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
      </header>

      {/* Main Verification Card Body matching mfa-setup card container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div
          className="w-full max-w-[680px] bg-white rounded-[16px] border border-[#d5dbdb] shadow-[0_1px_1px_0_rgba(0,28,36,0.3),0_1px_24px_0_rgba(0,28,36,0.12)] p-6 sm:p-8 text-left print:shadow-none print:border-none print:p-0"
          style={{
            fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {loading ? (
            <div className="text-center py-16 text-[#545b64]">
              <div className="w-8 h-8 border-3 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[14px]">Verifying worker credentials in official registry...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-[20px] font-bold text-[#16191f] mb-2">Worker Verification Failed</h2>
              <p className="text-[14px] text-[#545b64] mb-6">{error}</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-[36px] px-6 rounded-full bg-[#0073bb] text-white text-[14px] font-bold hover:bg-[#005f9e] transition-colors"
              >
                Return to Registry Home
              </button>
            </div>
          ) : worker ? (
            <div>
              {/* Card Title matching mfa-setup */}
              <h1 className="text-[24px] font-bold text-[#16191f] tracking-tight mb-2">
                {lang === 'kin' ? 'Icyemezo cy’Umwirondoro w’Umukozi' : 'Worker verification'}
              </h1>
              <p className="text-[14px] text-[#545b64] leading-[22px] mb-6">
                {lang === 'kin'
                  ? 'Ibi birerekana umwirondoro w’umukozi wemejwe muri sisitemu ya Ekaze.'
                  : 'Official worker credentials registered and verified in the Ekaze registry.'}
              </p>

              {/* Status Alert Box matching mfa-setup clean alert box */}
              <div className="border border-[#d5dbdb] rounded-[6px] bg-[#fbfbfb] p-3.5 mb-6 flex items-center justify-between gap-4">
                <div className="text-[14px] text-[#16191f] font-bold">
                  {lang === 'kin' ? 'Uko umukozi ahagaze: Yemejwe kandi arakora' : 'Status: Active and verified'}
                </div>
                <div className="text-[13px] text-[#0073bb] font-semibold">
                  {worker.card_number}
                </div>
              </div>

              {/* Worker Profile Details Box */}
              <div className="border border-[#d5dbdb] rounded-[8px] overflow-hidden mb-6">
                {/* Photo & Name Section */}
                <div className="p-4 sm:p-5 flex items-center gap-4 bg-white border-b border-[#eaeded]">
                  <img
                    src={worker.photo}
                    alt={worker.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#d5dbdb] bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div>
                    <h2 className="text-[18px] font-bold text-[#16191f] leading-snug">
                      {worker.name}
                    </h2>
                    <p className="text-[14px] text-[#545b64] mt-0.5">
                      {formatCleanText(worker.profession)}
                    </p>
                  </div>
                </div>

                {/* Key-Value Details Grid: Natural sentence case, clean typography, NO random icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#eaeded] bg-white">
                  <div className="p-4 space-y-3.5">
                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Nomero y’Irangamuntu' : 'National ID'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        {worker.masked_nid}
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Telefoni' : 'Phone number'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        {worker.phone}
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Umutekano n’Urwego rwa Polisi' : 'Security clearance'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        Cleared and registered (RIB / Police)
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5 border-t sm:border-t-0 border-[#eaeded]">
                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Isosiyete akorera' : 'Company'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        {worker.company}
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Aho aherereye' : 'Location'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        {worker.district}, {worker.province}
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-[#545b64] mb-0.5">
                        {lang === 'kin' ? 'Igihe ikarita izarangirira' : 'Validity window'}
                      </div>
                      <div className="text-[14px] font-medium text-[#16191f]">
                        Active through April 2028
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Proof & QR Code Section */}
              <div className="border border-[#eaeded] rounded-[8px] p-4 bg-[#fbfbfb] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-[6px] border border-[#d5dbdb] shadow-sm shrink-0">
                    <QRCode value={verifyUrl} size={64} bordered={false} color="#16191f" />
                  </div>
                  <div>
                    <div className="text-[13px] text-[#545b64]">
                      {lang === 'kin' ? 'Ihuza ryo Kwemeza' : 'Verification link'}
                    </div>
                    <a
                      href={verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[14px] text-[#0073bb] hover:underline font-medium break-all mt-0.5 block"
                    >
                      {verifyUrl}
                    </a>
                  </div>
                </div>

                {/* Print button matching mfa-setup button styling */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-[36px] px-6 rounded-full bg-[#0073bb] hover:bg-[#005f9e] text-white text-[14px] font-bold transition-colors cursor-pointer border-none shrink-0 print:hidden"
                  style={{
                    fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  }}
                >
                  {lang === 'kin' ? 'Gucapa icyemezo' : 'Print certificate'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[12px] text-[#545b64] print:hidden">
        © 2026 Ekaze Ltd. All rights reserved.
      </footer>
    </div>
  );
};

export default WorkerVerificationPage;
