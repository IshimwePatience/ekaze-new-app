import { useState } from 'react';
import { Worker } from '../types/worker';

interface WorkerCardProps {
  worker: Worker;
  onViewDetails: (worker: Worker) => void;
  onBookmark?: (worker: Worker) => void;
  isBookmarked?: boolean;
}

export const WorkerCard = ({ worker, onViewDetails }: WorkerCardProps) => {
  const [imageError, setImageError] = useState(false);

  const slots = Array.isArray((worker as any).availability_slots) ? (worker as any).availability_slots : [];
  const openSlots = slots.filter((s: any) => {
    const isThursday = s.day_index === 3 || s.day_label === 'Thursday' || String(s.day_label || '').toLowerCase() === 'thursday';
    if (isThursday && !s.explicitly_booked) return true;
    return !(s.is_booked || s.is_hired || s.employer_id);
  });
  const isPartTimeWithOpenDays =
    ((worker as any).shift_type === 'part_time' || (worker as any).shift_type === 'partial' || slots.length > 0) &&
    openSlots.length > 0;

  const isHired = isPartTimeWithOpenDays
    ? false
    : (worker.availability_status === 'hired' || Boolean(worker.is_hired));
  const isUnavailable = !isHired && !isPartTimeWithOpenDays && (worker.availability_status === 'unavailable' || worker.isAvailable === false);

  const isCompanyWorker = worker.type === 'company' || Boolean((worker as any).company_id || (worker as any).companyName || (worker as any).company);
  const companyTitle = (worker as any).companyName || (worker as any).company?.company_name || '';

  const displayType = isCompanyWorker 
    ? (companyTitle ? `Company (${companyTitle})` : 'Company') 
    : 'Freelance';

  // PREVIOUS DOMESTIC WORKER ROLE FALLBACK (PRESERVED):
  // const roleTitle = worker.workTypes && worker.workTypes.length > 0 
  //   ? worker.workTypes.map(w => w.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ')
  //   : (isCompanyWorker ? `Company (${companyTitle})` : 'Domestic Professional');

  // DRIVERS-ONLY PLATFORM ROLE TITLE:
  const roleTitle = worker.workTypes && worker.workTypes.length > 0 
    ? worker.workTypes.map(w => {
        const lower = w.toLowerCase();
        if (lower.includes('truck')) return 'Heavy Truck Driver';
        if (lower.includes('vip')) return 'VIP & Executive Driver';
        if (lower.includes('tipper')) return 'Tipper & Construction Driver';
        if (lower.includes('delivery')) return 'Delivery Van Driver';
        if (lower.includes('bus')) return 'Bus & Coach Driver';
        return 'Professional Driver';
      }).join(', ')
    : (isCompanyWorker ? `Company (${companyTitle})` : 'Professional Driver');

  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || roleTitle;

  const locationText = [worker.district, worker.sector].filter(Boolean).join(', ');

  // Format experience from DB
  const rawYears = worker.experience_years ?? (worker as any).years_of_experience;
  const experienceText = rawYears != null && Number(rawYears) > 0
    ? (Number(rawYears) === 1 ? '1 year' : Number(rawYears) >= 3 ? `More than ${rawYears} years` : `${rawYears} years`)
    : worker.experience === 'expert'
    ? 'More than 3 years'
    : worker.experience === 'intermediate'
    ? '1 - 2 years'
    : worker.experience === 'fresher' || worker.experience === 'beginner'
    ? 'Under 1 year'
    : 'Experienced';

  // Subtitle list matching Spotify's "With Artist, Artist, Artist..." format
  const detailsList = [roleTitle, locationText, experienceText].filter(Boolean).join(', ');

  return (
    <div
      onClick={() => onViewDetails(worker)}
      className="group cursor-pointer select-none flex flex-col transition-transform duration-150"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── 1. SPOTIFY TILE (Rounded Alone in gray-50) ── */}
      <div className="w-full aspect-square bg-gray-50 border border-gray-200/70 rounded-[8px] sm:rounded-[10px] overflow-hidden relative shadow-xs group-hover:shadow-md transition-all duration-200">
        
        {/* Top-Left: Availability Status Dot */}
        <div className="absolute top-3 left-3 z-10 flex items-center">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isHired ? 'bg-rose-500' : isUnavailable ? 'bg-slate-400' : 'bg-emerald-500'
            }`}
            title={isHired ? 'Taken' : isUnavailable ? 'Unavailable' : 'Available'}
          />
        </div>

        {/* Top-Right: Exact RADIO Word Design saying AVAILABLE or TAKEN */}
        <span className="absolute top-2.5 right-2.5 z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.14em] text-black">
          {isHired ? 'TAKEN' : isUnavailable ? 'TAKEN' : 'AVAILABLE'}
        </span>

        {/* Center: Large Circular Photo of Worker (Matching Spotify Artist Avatar Circles) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-7">
          <div className="w-[105px] h-[105px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden shadow-md bg-white border-2 border-white/70 shrink-0">
            {worker.photo && !imageError ? (
              <img
                src={worker.photo}
                alt={displayType}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-700 font-bold text-xl sm:text-2xl">
                {displayType.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Bottom of Tile: Freelance or Company (Names hidden, not bold) */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none">
          <h3 className="font-medium text-[#1e293b] text-[15px] sm:text-[16px] tracking-normal leading-tight truncate">
            {displayType}
          </h3>
        </div>


      </div>

      {/* ── 2. WORDS BELOW (NOT IN BORDERS, exact font size and gray color from Spotify) ── */}
      <div className="mt-2 px-0.5">
        <p className="text-[13px] sm:text-[14px] text-[#6a6a6a] font-medium leading-[1.35] line-clamp-2 hover:text-[#333333] transition-colors">
          With {detailsList}
        </p>
      </div>

    </div>
  );
};