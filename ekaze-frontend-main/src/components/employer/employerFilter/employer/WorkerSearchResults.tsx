import { Worker } from '../types/worker';
import { WorkerCard } from './WorkerCard';
import { Skeleton } from '../ui/skeleton';

export interface WorkerSearchResultsTranslations {
  workersMatch: string;
  workersFound: string;
  basedOnSearch: string;
  available: string;
  verified: string;
  rated: string;
  whyChoose: string;
  featureVerified: string;
  featureVerifiedDesc: string;
  featureProfiles: string;
  featureProfilesDesc: string;
  featureSearch: string;
  featureSearchDesc: string;
  featureConnect: string;
  featureConnectDesc: string;
  loginToView: string;
  subscribe: string;
  haveAccount: string;
  loginLink: string;
  forEmployers: string;
  forEmployersDesc: string;
  benefits: string;
  benefitsDesc: string;
  showing: string;
  of: string;
  sortLatest: string;
  sortTopRated: string;
  sortSalaryLow: string;
  sortSalaryHigh: string;
  sortExperience: string;
  noWorkersFound: string;
  adjustFilters: string;
  loading: string;
  next: string;
}

interface WorkerSearchResultsProps {
  workers: Worker[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (worker: Worker) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isAuthenticated?: boolean;
  t: WorkerSearchResultsTranslations;
}

const WorkerCardSkeleton = () => {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full aspect-square rounded-[8px] sm:rounded-[10px]" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <Skeleton className="h-3.5 w-3/4 rounded-sm" />
        <Skeleton className="h-3 w-1/2 rounded-sm" />
      </div>
    </div>
  );
};

export const WorkerSearchResults = ({
  workers,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading = false,
  t,
}: WorkerSearchResultsProps) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Render Connected Pagination matching User's Image 4
  const renderPaginationItems = () => {
    const items: (number | string)[] = [];
    const delta = 2; // number of pages around current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) {
        items.push('...');
      }

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push('...');
      }
      items.push(totalPages);
    }

    return items;
  };

  return (
    <div
      className="flex-1 space-y-6"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Worker Grid Container (Spotify 5-column Card Grid Layout) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <WorkerCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="py-12 sm:py-16 text-center max-w-lg mx-auto bg-transparent select-none">
          {/* ── ARTISTIC CHARACTER LINE-ART EMPTY STATE (GitHub Style on Pure White) ── */}
          <div className="w-full max-w-[340px] sm:max-w-[400px] mx-auto mb-5 flex justify-center">
            <svg
              viewBox="0 0 500 230"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Silhouette: Soft layered forest trees */}
              <path
                d="M 50 175 L 80 110 L 95 130 L 120 90 L 145 140 L 170 100 L 200 175 Z"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M 160 175 L 190 120 L 210 138 L 235 95 L 260 145 L 280 115 L 310 175 Z"
                fill="#edf4fe"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M 280 175 L 310 130 L 330 145 L 355 105 L 380 150 L 410 175 Z"
                fill="#f1f5f9"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Ground Path Line */}
              <path
                d="M 20 188 C 120 184, 250 192, 480 188"
                stroke="#0062b8"
                strokeWidth="2"
                strokeDasharray="6 8"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* Little companion animal on the left */}
              <g transform="translate(115, 138)">
                {/* Tail */}
                <path
                  d="M 14 34 C 4 24, 0 8, 12 2 C 22 -3, 30 12, 28 27"
                  stroke="#64748b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="#f8fafc"
                />
                {/* Body */}
                <ellipse cx="36" cy="35" rx="14" ry="9" stroke="#64748b" strokeWidth="2.5" fill="#ffffff" />
                {/* Head */}
                <circle cx="48" cy="28" r="6.5" stroke="#64748b" strokeWidth="2.5" fill="#ffffff" />
                {/* Ear */}
                <path d="M 46 22 L 48 17 L 51 23" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" fill="#e2e8f0" />
                {/* Eye */}
                <circle cx="50" cy="27" r="1.3" fill="#334155" />
                {/* Paws */}
                <path d="M 30 43 L 28 48 M 42 43 L 44 48" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Small Rock & flora on right */}
              <g transform="translate(390, 162)">
                <path
                  d="M 10 24 C 12 14, 24 10, 35 13 C 44 17, 49 23, 45 28 C 39 31, 16 30, 10 24 Z"
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M 4 26 C 6 19, 8 17, 7 13" stroke="#0062b8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 8 26 C 11 20, 14 18, 15 15" stroke="#0062b8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <circle cx="7" cy="12" r="1.8" fill="#0062b8" opacity="0.7" />
                <circle cx="15" cy="14" r="1.8" fill="#0062b8" opacity="0.7" />
              </g>

              {/* Main Character Walking in Blue Outline Style */}
              <g transform="translate(255, 42)">
                {/* Ground Shadow */}
                <ellipse cx="50" cy="146" rx="38" ry="5.5" fill="#0062b8" opacity="0.1" />

                {/* Walking Staff / Pole */}
                <line
                  x1="88"
                  y1="10"
                  x2="6"
                  y2="146"
                  stroke="#475569"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Back Leg in stride */}
                <path
                  d="M 40 96 C 30 113, 20 124, 14 133 C 10 140, 2 142, 2 142 C 8 142, 24 138, 28 133 C 34 126, 44 114, 48 98"
                  stroke="#0062b8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#edf4fe"
                />

                {/* Front Leg walking forward */}
                <path
                  d="M 52 96 C 55 110, 60 123, 66 134 C 70 140, 78 142, 84 140 C 84 136, 76 132, 72 126 C 66 118, 62 106, 60 96"
                  stroke="#0062b8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#edf4fe"
                />

                {/* Cape / Backpack on Back */}
                <path
                  d="M 28 52 C 10 56, -6 72, -14 88 C -18 96, -10 100, -2 96 C 14 88, 24 74, 32 64"
                  stroke="#0062b8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#e0edff"
                />
                <circle cx="-2" cy="84" r="3" stroke="#0062b8" strokeWidth="2" fill="white" />
                <circle cx="-7" cy="92" r="2.5" stroke="#0062b8" strokeWidth="1.8" fill="white" />

                {/* Body / Torso */}
                <path
                  d="M 34 53 C 32 66, 34 86, 38 96 C 45 100, 58 100, 64 96 C 66 86, 66 66, 64 53 Z"
                  stroke="#0062b8"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  fill="#ffffff"
                />

                {/* Arm grasping the walking staff */}
                <path
                  d="M 44 58 C 50 66, 58 72, 68 68 C 74 66, 76 58, 72 52 C 66 48, 56 48, 48 52"
                  stroke="#0062b8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#edf4fe"
                />
                {/* Hand wrapped around staff */}
                <circle cx="68" cy="60" r="5" stroke="#0062b8" strokeWidth="2.5" fill="#ffffff" />

                {/* Head */}
                <path
                  d="M 36 26 C 34 14, 42 4, 56 4 C 70 4, 78 14, 76 26 C 74 38, 68 44, 56 44 C 44 44, 38 38, 36 26 Z"
                  stroke="#0062b8"
                  strokeWidth="3"
                  fill="#ffffff"
                />

                {/* Cute Ears / Cap (Image 2 style) */}
                <path d="M 42 8 C 40 2, 44 -4, 48 0 C 50 4, 48 8, 48 8" stroke="#0062b8" strokeWidth="2.5" strokeLinecap="round" fill="#e0edff" />
                <path d="M 64 8 C 64 2, 68 -4, 72 0 C 74 4, 70 8, 70 8" stroke="#0062b8" strokeWidth="2.5" strokeLinecap="round" fill="#e0edff" />

                {/* Expressive Eye & Mouth */}
                <circle cx="60" cy="22" r="2.8" stroke="#0062b8" strokeWidth="2.5" fill="#ffffff" />
                <circle cx="62" cy="30" r="2" stroke="#0062b8" strokeWidth="2" fill="none" />
                {/* Whisker accents */}
                <line x1="68" y1="22" x2="74" y2="21" stroke="#0062b8" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="68" y1="26" x2="74" y2="27" stroke="#0062b8" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {t.noWorkersFound}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t.adjustFilters}
          </p>

          {/* PREVIOUS SIMPLE EMPTY BOX (PRESERVED):
          <div className="hidden py-16 text-center max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{t.noWorkersFound}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              {t.adjustFilters}
            </p>
          </div>
          */}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* ── PAGINATION BAR (Exact match to User's Image 4) ── */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-8 pb-4 flex justify-center items-center">
          <div className="inline-flex rounded-lg border border-slate-200 shadow-2xs overflow-hidden divide-x divide-slate-200 bg-white">
            
            {/* Prev Button `<` */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
            >
              &lsaquo;
            </button>

            {/* Page numbers and ellipsis */}
            {renderPaginationItems().map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-400 bg-white select-none flex items-center justify-center"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = item as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer border-0 ${
                    isActive
                      ? 'bg-[#0062b8] text-white hover:bg-[#00509a]'
                      : 'bg-white text-[#0062b8] hover:bg-blue-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button `>` */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
            >
              &rsaquo;
            </button>

          </div>
        </div>
      )}
    </div>
  );
};