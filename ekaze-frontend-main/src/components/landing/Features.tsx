import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Truck, Globe, Package, Car, HardHat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DriverCategoryCard {
  id: string;
  categoryFilter: string;
  title: string;
  titleRw: string;
  description: string;
  descriptionRw: string;
  icon: typeof Truck;
}

const driverCategoryCards: DriverCategoryCard[] = [
  {
    id: "heavy-truck",
    categoryFilter: "heavy_truck",
    title: "Heavy Commercial",
    titleRw: "Amakamyo Manini",
    description: "Certified drivers for heavy freight, semi-trailers, and long-haul interstate logistics.",
    descriptionRw: "Abashoferi b'amakamyo manini n'iromoroki bafite impushya za E na F mu bwikorezi buremereye.",
    icon: Truck,
  },
  {
    id: "cross-border",
    categoryFilter: "cross_border",
    title: "Cross-Border Transit",
    titleRw: "Ubwikorezi bw'Imipaka",
    description: "Experienced regional freight haulers across Rwanda, Tanzania, Kenya, Uganda and DRC.",
    descriptionRw: "Inzobere mu gutwara imizigo ihuza u Rwanda n'ibihugu byo mu Karere k'Ibiyaga Bigari.",
    icon: Globe,
  },
  {
    id: "delivery-van",
    categoryFilter: "light_cargo",
    title: "Light Cargo & Van",
    titleRw: "Daihatsu & Van",
    description: "Punctual city distribution, express couriers, and warehouse-to-store last-mile delivery.",
    descriptionRw: "Gukwirakwiza ibicuruzwa n'imitwaro mu mijyi no mu masoko mu buryo bwihuse kandi bunoze.",
    icon: Package,
  },
  {
    id: "corporate-fleet",
    categoryFilter: "corporate_chauffeur",
    title: "Corporate & VIP",
    titleRw: "Abashoferi b'Ibigo",
    description: "World-class executive chauffeurs, VIP transport, total discretion and fluent bilingual service.",
    descriptionRw: "Abashoferi b'umwuga bo gutwara abayobozi b'ibigo, abashyitsi bakomeye n'imishinga.",
    icon: Car,
  },
  {
    id: "construction-truck",
    categoryFilter: "construction_tipper",
    title: "Tipper & Mining",
    titleRw: "Amakamyo ya Benne",
    description: "Heavy dump truck drivers, quarry site haulage and rugged infrastructure construction machinery.",
    descriptionRw: "Gupakira no gutwara ibikoresho by'ubwubatsi, umucanga n'amabuye mu mishinga minini.",
    icon: HardHat,
  },
];

const Features = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalCards = driverCategoryCards.length;

  // Auto-scroll loop advancing one card at a time
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % totalCards);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, totalCards]);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % totalCards);
  };

  // Get indices for responsive cards (3 on desktop, 2 on tablet, 1 on mobile)
  const card1 = driverCategoryCards[startIndex % totalCards];
  const card2 = driverCategoryCards[(startIndex + 1) % totalCards];
  const card3 = driverCategoryCards[(startIndex + 2) % totalCards];

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-white scroll-mt-20 overflow-hidden"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 max-w-6xl">

        {/* ── TOP CATEGORY QUICK NAV (MTN Style Icons Bar) ── */}
        <div className="mb-12 sm:mb-16 flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-10 lg:gap-12 overflow-x-auto no-scrollbar py-2 px-2 max-w-full">
            {driverCategoryCards.map((item, idx) => {
              const isActive = startIndex === idx;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStartIndex(idx)}
                  className="flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border-none bg-transparent select-none focus:outline-none group shrink-0"
                  aria-label={isRw ? item.titleRw : item.title}
                >
                  {isActive ? (
                    /* Active filled PERFECT circle (Brand Blue #005973) */
                    <div className="w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] min-w-[96px] min-h-[96px] sm:min-w-[112px] sm:min-h-[112px] rounded-full aspect-square bg-[#005973] text-white flex flex-col items-center justify-center p-2.5 shadow-lg transform scale-105 transition-transform duration-300 shrink-0">
                      <IconComp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2] mb-1 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight tracking-tight max-w-[76px] sm:max-w-[88px]">
                        {isRw ? item.titleRw : item.title}
                      </span>
                    </div>
                  ) : (
                    /* Inactive outline icon and label */
                    <div className="w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] min-w-[96px] min-h-[96px] sm:min-w-[112px] sm:min-h-[112px] rounded-full aspect-square flex flex-col items-center justify-center p-2 text-slate-700 group-hover:text-[#005973] transition-colors shrink-0">
                      <IconComp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6] mb-1.5 text-slate-600 group-hover:text-[#005973] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-center leading-tight tracking-tight text-slate-800 group-hover:text-[#005973] max-w-[76px] sm:max-w-[88px]">
                        {isRw ? item.titleRw : item.title}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3-CARD CAROUSEL SLIDER (Exact match to Picture 2 with Orange Accents) ── */}
        <div className="relative flex items-center justify-between gap-3 sm:gap-6 select-none">
          
          {/* Left Arrow Button (Exact Orange #f97316 with Crisp White Chevron) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Cards"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold flex items-center justify-center shadow-md cursor-pointer border-0 transition-transform hover:scale-105 active:scale-95 shrink-0 z-10"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Cards Display Grid (Exact 3-card layout matching Picture 2, no pictures) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 flex-1 w-full">
            
            {/* Card 1 */}
            <div className="bg-[#787c80] rounded-3xl p-7 sm:p-9 min-h-[260px] sm:min-h-[290px] flex flex-col items-center justify-center text-center shadow-xs transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight mb-3 sm:mb-4 leading-snug">
                {isRw ? card1.titleRw : card1.title}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed max-w-[280px]">
                {isRw ? card1.descriptionRw : card1.description}
              </p>
            </div>

            {/* Card 2 (hidden on mobile, visible on md and lg) */}
            <div className="hidden md:flex bg-[#787c80] rounded-3xl p-7 sm:p-9 min-h-[260px] sm:min-h-[290px] flex-col items-center justify-center text-center shadow-xs transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight mb-3 sm:mb-4 leading-snug">
                {isRw ? card2.titleRw : card2.title}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed max-w-[280px]">
                {isRw ? card2.descriptionRw : card2.description}
              </p>
            </div>

            {/* Card 3 (hidden on mobile and tablet, visible on lg) */}
            <div className="hidden lg:flex bg-[#787c80] rounded-3xl p-7 sm:p-9 min-h-[260px] sm:min-h-[290px] flex-col items-center justify-center text-center shadow-xs transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight mb-3 sm:mb-4 leading-snug">
                {isRw ? card3.titleRw : card3.title}
              </h3>
              <p className="text-white/95 text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed max-w-[280px]">
                {isRw ? card3.descriptionRw : card3.description}
              </p>
            </div>

          </div>

          {/* Right Arrow Button (Exact Orange #f97316 with Crisp White Chevron) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Cards"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold flex items-center justify-center shadow-md cursor-pointer border-0 transition-transform hover:scale-105 active:scale-95 shrink-0 z-10"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>

        </div>

        {/* ── PAGINATION DOTS (Orange Active Dot + Gray Dots) ── */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
          {driverCategoryCards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStartIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer border-0 ${
                startIndex === idx
                  ? "w-3 h-3 bg-[#f97316] scale-110"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
