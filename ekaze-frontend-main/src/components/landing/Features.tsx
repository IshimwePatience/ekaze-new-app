import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

import waitressImg from "@/assets/worker_waitress.png";
import housekeeperImg from "@/assets/worker_housekeeper.jpg";
import nannyImg from "@/assets/worker_nanny.jpg";
import chefImg from "@/assets/worker_chef.jpg";
import gardenerImg from "@/assets/worker_gardener.jpg";
import scaniaHeroTruck from "@/assets/scania_truck_africa_hero.jpg";
import tipperTruckImg from "@/assets/tipper_truck.jpg";

interface WorkerSlide {
  id: string;
  image: string;
  eyebrow: string;
  eyebrowRw: string;
  title: string;
  titleRw: string;
  description: {
    beforeBold: string;
    bold1: string;
    middle: string;
    bold2: string;
    middle2: string;
    bold3: string;
    afterBold: string;
    boldEvent?: string;
  };
  descriptionRw: string;
  categoryFilter: string;
}

/* PREVIOUS DOMESTIC WORKER SLIDES:
const workerSlides: WorkerSlide[] = [
  {
    id: "bartenders",
    image: waitressImg,
    eyebrow: "Bartenders and Catering Staff: Essential Role in Event Hospitality",
    eyebrowRw: "Abashinzwe Ibirori n'Ibyokurya: Uruhare Rukomeye mu Kwakira Abashyitsi",
    title: "Bartenders, Catering Staff and Service Staff",
    titleRw: "Abashinzwe Imitunganyirize, Ibyokurya n'Umutegarugoli mu Birori",
    description: {
      beforeBold: "In the bustling world of events, exhibitions, and conferences, our ",
      bold1: "Bartenders",
      middle: ", ",
      bold2: "Catering Staff",
      middle2: ", and ",
      bold3: "Service Staff",
      afterBold:
        " play an integral role in ensuring top-notch hospitality services. These professionals are adept in managing bars and refreshment corners, and in serving food and beverages. They are key to creating a welcoming and enjoyable atmosphere at any ",
      boldEvent: "event.",
    },
    descriptionRw:
      "Mu birori n'inama zikomeye, abakozi bacu b'umwuga bashinzwe kwakira abashyitsi, gutegura ibinyobwa n'amafunguro mu mucyo n'ikinyabupfura gihanitse.",
    categoryFilter: "catering",
  },
  {
    id: "housekeepers",
    image: housekeeperImg,
    eyebrow: "Housekeepers & Cleaners: Impeccable Hygiene & Daily Household Care",
    eyebrowRw: "Abakora Isuku yo mu Rugo: Isuku Itagira Amakemwa n'Ibyishimo mu Rugo",
    title: "Housekeepers, Cleaners and Domestic Staff",
    titleRw: "Abakora Isuku, Gutera Ipasi no Kumesa mu Rugo",
    description: {
      beforeBold: "Transforming homes with meticulous care, our certified ",
      bold1: "Housekeepers",
      middle: ", ",
      bold2: "Cleaners",
      middle2: ", and ",
      bold3: "Domestic Staff",
      afterBold:
        " maintain the highest sanitation standards. Trained in deep sanitization, delicate garment ironing, surface care, and continuous home organization for your absolute peace of ",
      boldEvent: "mind.",
    },
    descriptionRw:
      "Gusukura inzu, gukora isuku rusange, kumesa no gutera ipasi myenda mu buryo bugezweho kandi bwizewe 100%.",
    categoryFilter: "cleaning",
  },
  {
    id: "nannies",
    image: nannyImg,
    eyebrow: "Nannies & Babysitters: Compassionate Childcare & Early Development",
    eyebrowRw: "Abarezi b'Abana: Kwita ku Bato n'Urukundo Ruhoraho",
    title: "Nannies, Babysitters and Childcare Staff",
    titleRw: "Abarezi b'Abana bato n'Abanyamwuga mu Kurerera mu Rugo",
    description: {
      beforeBold: "Providing a nurturing and protective environment, our vetted ",
      bold1: "Nannies",
      middle: ", ",
      bold2: "Babysitters",
      middle2: ", and ",
      bold3: "Childcare Staff",
      afterBold:
        " supervise educational playtime, balanced nutritional meal schedules, school homework assistance, and safe bedtime routines with complete tenderness and family ",
      boldEvent: "trust.",
    },
    descriptionRw:
      "Uburere bwiza, kurinda abana bato, kubafasha mu masomo n'imikurire myiza n'umutekano wuzuye.",
    categoryFilter: "childcare",
  },
  {
    id: "chefs",
    image: chefImg,
    eyebrow: "Private Chefs & Cooks: Culinary Excellence & Healthy Nutrition",
    eyebrowRw: "Abateka b'Umwuga: Amafunguro Yose Arimo Intungamubiri z'Ubwoko Bwose",
    title: "Private Chefs, Cooks and Kitchen Staff",
    titleRw: "Abateka b'Inzobere mu Muryango no mu Mahoteli",
    description: {
      beforeBold: "Crafting wholesome meals tailored to your taste, our ",
      bold1: "Private Chefs",
      middle: ", ",
      bold2: "Home Cooks",
      middle2: ", and ",
      bold3: "Kitchen Staff",
      afterBold:
        " master both traditional Rwandan cuisine and international menus. Adept in fresh ingredient sourcing, personalized dietary plans, and fine dining presentation for any ",
      boldEvent: "occasion.",
    },
    descriptionRw:
      "Gutegura amafunguro aryoshye kandi arimo intungamubiri, haba iby'umuco n'amahanga, ku mabwiriza y'ubuzima.",
    categoryFilter: "cooking",
  },
  {
    id: "gardeners",
    image: gardenerImg,
    eyebrow: "Gardeners & Landscapers: Verdant Outdoor Spaces & Compound Care",
    eyebrowRw: "Abatunganya Ubusitani: Uburanga bwo Hanze n'Ubwatsi Butoshye",
    title: "Gardeners, Landscapers and Compound Staff",
    titleRw: "Abatunganya Ubusitani n'Ubuhinzi bwo mu Rugo",
    description: {
      beforeBold: "Cultivating lush green lawns and immaculate floral beds, our ",
      bold1: "Gardeners",
      middle: ", ",
      bold2: "Landscapers",
      middle2: ", and ",
      bold3: "Compound Staff",
      afterBold:
        " manage precision hedge trimming, tree pruning, soil fertilization, and perimeter upkeep so your residential grounds remain fresh and serene every ",
      boldEvent: "season.",
    },
    descriptionRw:
      "Gufungura no gukata ubwatsi, kubungabunga indabyo no kurimbisha imbuga y'urugo rwawe igahora itoshye.",
    categoryFilter: "gardening",
  },
];
*/

const workerSlides: WorkerSlide[] = [
  {
    id: "heavy-truck",
    image: scaniaHeroTruck,
    eyebrow: "Heavy Freight & Semi-Trailers: Long-Haul Logistics & Intercity Cargo",
    eyebrowRw: "Abashoferi b'Amakamyo Manini n'Iromoroki: Ubwikorezi bw'Imizigo Hagati y'Ibihugu",
    title: "Heavy Commercial Truck & Semi-Trailer Drivers",
    titleRw: "Abashoferi b'Amakamyo Manini n'Imodoka z'Imizigo (Class E & F)",
    description: {
      beforeBold: "Certified for cross-country and international freight corridors, our vetted ",
      bold1: "Heavy Truck Drivers",
      middle: ", ",
      bold2: "Trailer Operators",
      middle2: ", and ",
      bold3: "Cargo Transporters",
      afterBold:
        " ensure timely and secure freight delivery across East Africa. Trained in defensive driving, GPS route tracking, and heavy machinery safety for total peace of ",
      boldEvent: "mind.",
    },
    descriptionRw:
      "Abashoferi b'umwuga bafite impushya zo mu rwego rwa E na F, bazi neza imihanda yo mu Karere k'Ibiyaga Bigari no mu Rwanda, bafite uburambe n'ubunyangamugayo buzwi.",
    categoryFilter: "heavy_truck",
  },
  {
    id: "cross-border",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Regional Logistics & Cross-Border Cargo: Seamless Transit Across Borders",
    eyebrowRw: "Ubwikorezi bw'Ibicuruzwa Byambukiranya Imbibi: Umutekano ku Mipaka Yose",
    title: "Cross-Border Logistics & Freight Drivers",
    titleRw: "Abashoferi b'Imodoka z'Ubucuruzi Bwambukiranya Imbibi",
    description: {
      beforeBold: "Navigating international transit corridors seamlessly, our certified ",
      bold1: "Logistics Drivers",
      middle: ", ",
      bold2: "Cross-Border Haulers",
      middle2: ", and ",
      bold3: "Transit Operators",
      afterBold:
        " handle customs protocols, cargo safety checks, and long-range route monitoring for continuous operational ",
      boldEvent: "efficiency.",
    },
    descriptionRw:
      "Inzobere mu gutwara imizigo ihuza u Rwanda, Uganda, Tanzania, Kenya na DRC. Bazi neza inzira za gasutamo n'amategeko y'ubwikorezi mu karere.",
    categoryFilter: "cross_border",
  },
  {
    id: "delivery-van",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Urban Distribution & Light Freight: Rapid City & Last-Mile Delivery",
    eyebrowRw: "Ibinyabiziga Bikwirakwiza Imitwaro mu Mijyi: Bwangu kandi Bwizerwa",
    title: "Light Cargo, Van & Last-Mile Delivery Drivers",
    titleRw: "Abashoferi b'Imodoka zo mu Bwoko bwa Pickup, Daihatsu na Van",
    description: {
      beforeBold: "Powering city distribution and warehouse-to-store logistics, our licensed ",
      bold1: "Urban Delivery Drivers",
      middle: ", ",
      bold2: "Courier Operators",
      middle2: ", and ",
      bold3: "Light Cargo Chauffeurs",
      afterBold:
        " guarantee punctual deliveries, careful handling of fragile merchandise, and seamless digital receipt tracking across Kigali and beyond for any ",
      boldEvent: "business.",
    },
    descriptionRw:
      "Gukwirakwiza ibicuruzwa n'imitwaro mu Mujyi wa Kigali no mu zindi ntara, mu buryo bwihuse kandi buhendutse.",
    categoryFilter: "light_cargo",
  },
  {
    id: "corporate-fleet",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Executive Chauffeurs & Corporate Fleet: Punctuality, Discretion & Comfort",
    eyebrowRw: "Abashoferi b'Ibigo n'Abayobozi: Ubunyamwuga, Isuku n'Ubwitware Bwiza",
    title: "Corporate Fleet, VIP & Executive Chauffeurs",
    titleRw: "Abashoferi b'Ibigo by'Ubucuruzi, Imishinga n'Abanyacyubahiro",
    description: {
      beforeBold: "Delivering world-class executive travel, our thoroughly screened ",
      bold1: "Corporate Chauffeurs",
      middle: ", ",
      bold2: "VIP Drivers",
      middle2: ", and ",
      bold3: "Organization Drivers",
      afterBold:
        " offer unmatched professionalism, impeccable vehicle upkeep, English & French fluency, and strict discretion for high-profile business ",
      boldEvent: "travel.",
    },
    descriptionRw:
      "Abashoferi b'inzobere bo gutwara abayobozi b'ibigo, abashyitsi bakomeye, imishinga n'amashyirahamwe bafite imyitwarire n'ubunyamwuga bihebuje.",
    categoryFilter: "corporate_chauffeur",
  },
  {
    id: "construction-truck",
    image: tipperTruckImg,
    eyebrow: "Construction & Tipper Operators: Heavy Duty Earthmoving & Site Logistics",
    eyebrowRw: "Amakamyo ya Benne n'Imashini z'Ubwubatsi: Imirimo Iremereye n'Umusaruro",
    title: "Tipper Truck, Dumpers and Construction Vehicle Drivers",
    titleRw: "Abashoferi b'Amakamyo ya Benne n'Imashini Zikora mu Bwubatsi",
    description: {
      beforeBold: "Built for rugged quarry sites and infrastructure mega-projects, our experienced ",
      bold1: "Tipper Operators",
      middle: ", ",
      bold2: "Dump Truck Drivers",
      middle2: ", and ",
      bold3: "Heavy Equipment Drivers",
      afterBold:
        " excel in precision soil transit, gravel haulage, and site safety compliance for your construction and development ",
      boldEvent: "projects.",
    },
    descriptionRw:
      "Gupakira no gutwara ibikoresho by'ubwubatsi, umucanga, amabuye, n'ibindi mu bwubatsi bw'imihanda n'inyubako.",
    categoryFilter: "construction_tipper",
  },
];

const Features = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRw = language === "kin";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll loop advancing one slide at a time (like MTN progress)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % workerSlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + workerSlides.length) % workerSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % workerSlides.length);
  };

  const current = workerSlides[currentIndex];

  // Calculate progress percentage for the bottom MTN track
  const progressPercent = ((currentIndex + 1) / workerSlides.length) * 100;
  const thumbWidthPercent = (1 / workerSlides.length) * 100;
  const thumbOffsetPercent = (currentIndex / workerSlides.length) * 100;

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
      <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl">
        
        {/* ── SINGLE WORKER SHOWCASE CONTAINER (Exact match to User's Screenshot) ── */}
        <div className="min-h-[420px] sm:min-h-[480px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Worker Illustration Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none flex items-center justify-center">
              <img
                src={current.image}
                alt={current.title}
                key={current.id}
                className="w-full max-h-[380px] sm:max-h-[440px] object-contain transition-all duration-500 ease-in-out"
              />
            </div>
          </div>

          {/* Right Column: Eyebrow, Big Title, Body Description (Exact match to User's Image 1) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            
            {/* Yellow Eyebrow text */}
            <p className="text-[#C29300] font-bold text-sm sm:text-base tracking-normal">
              {isRw ? current.eyebrowRw : current.eyebrow}
            </p>

            {/* Giant Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-slate-900 tracking-tight leading-[1.15]">
              {isRw ? current.titleRw : current.title}
            </h2>

            {/* Paragraph with key roles in bold */}
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl">
              {isRw ? (
                current.descriptionRw
              ) : (
                <>
                  {current.description.beforeBold}
                  <strong className="font-bold text-slate-900">{current.description.bold1}</strong>
                  {current.description.middle}
                  <strong className="font-bold text-slate-900">{current.description.bold2}</strong>
                  {current.description.middle2}
                  <strong className="font-bold text-slate-900">{current.description.bold3}</strong>
                  {current.description.afterBold}
                  {current.description.boldEvent && (
                    <strong className="font-bold text-slate-900">{current.description.boldEvent}</strong>
                  )}
                </>
              )}
            </p>

            {/* Find Driver CTA Button */}
            <div className="pt-2 flex items-center gap-4">
              {/* PREVIOUS WORKER BUTTONS:
              <button
                onClick={() => navigate(`/search-worker?category=${current.categoryFilter}`)}
                className="bg-[#FFCC00] hover:bg-[#E6B800] text-[#111111] font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer border-0"
              >
                <span>{isRw ? "Shaka Uyu Mukozi" : `Find ${current.title.split(",")[0]}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/search-worker")}
                className="text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm hover:underline cursor-pointer bg-transparent border-0"
              >
                {isRw ? "Reba Abakozi Bose" : "Browse All Workers"}
              </button>
              */}
              <button
                onClick={() => navigate(`/search-worker?category=${current.categoryFilter}`)}
                className="bg-[#FFCC00] hover:bg-[#E6B800] text-[#111111] font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer border-0"
              >
                <span>{isRw ? "Shaka Uyu Mushoferi" : `Find ${current.title.split(",")[0]}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/search-worker")}
                className="text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm hover:underline cursor-pointer bg-transparent border-0"
              >
                {isRw ? "Reba Abashoferi Bose" : "Browse All Drivers"}
              </button>
            </div>

          </div>

        </div>

        {/* ── BOTTOM PROGRESS LINE (MTN Style Line to show scroll progress) ── */}
        <div className="mt-14 sm:mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
          
          {/* Slide counter */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            0{currentIndex + 1} / 0{workerSlides.length}
          </div>

          {/* MTN Progress Bar Track with sliding thumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              aria-label="Previous Worker"
              className="w-9 h-9 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* The MTN Line Track */}
            <div
              className="w-48 sm:w-64 h-1.5 sm:h-2 bg-[#d1d5db] rounded-full relative overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {/* Sliding brand yellow progress thumb */}
              <div
                className="h-full bg-[#FFCC00] rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${thumbWidthPercent}%`,
                  transform: `translateX(${thumbOffsetPercent * (100 / thumbWidthPercent)}%)`,
                }}
              />
            </div>

            <button
              onClick={handleNext}
              aria-label="Next Worker"
              className="w-9 h-9 rounded-full bg-[#FFCC00] text-[#111111] hover:bg-[#E6B800] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indicator dots */}
          <div className="flex items-center gap-2">
            {workerSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to ${slide.title}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                  currentIndex === idx ? "w-7 bg-[#FFCC00]" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Features;
