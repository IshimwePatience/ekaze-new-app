import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import ekazeAppWomanHero from "@/assets/ekaze_app_woman_hero.jpg";
import scaniaHeroTruck from "@/assets/scania_truck_africa_hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRw = language === "kin";

  return (
    <div
      className="w-full relative overflow-hidden select-none"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <section className="relative w-full bg-[#121114] text-white overflow-hidden min-h-[440px] sm:min-h-[490px] lg:min-h-[530px] xl:min-h-[550px] flex items-center">

        {/* PREVIOUS BACKGROUND IMAGE (DOMESTIC WORKERS):
        <img
          src={ekazeAppWomanHero}
          alt="Rwandan woman managing domestic workers on Ekaze App"
          className="absolute inset-0 w-full h-full object-cover object-[82%_top] sm:object-[78%_top] md:object-[75%_top] select-none pointer-events-none"
        />
        */}

        {/* Background Image: Brand New Modern Heavy Truck Driving on African Highway at Golden Sunset (Truck on right with forward-facing SCANIA, trees on left) */}
        <img
          src={scaniaHeroTruck}
          alt="Brand new modern Scania truck driving in Africa at golden sunset"
          className="absolute inset-0 w-full h-full object-cover object-[center_center] select-none pointer-events-none"
        />

        {/* Dark Smooth Gradient Overlay for Contrast */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(14, 12, 10, 0.96) 0%, rgba(14, 12, 10, 0.88) 38%, rgba(16, 14, 12, 0.55) 60%, rgba(16, 14, 12, 0.15) 78%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Mobile Vertical Gradient */}
        <div
          className="absolute inset-0 pointer-events-none z-10 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(14, 12, 10, 0.25) 0%, rgba(14, 12, 10, 0.86) 55%, rgba(14, 12, 10, 0.98) 100%)",
          }}
        />

        {/* Main Content Container */}
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl relative z-20 py-6 sm:py-8 lg:py-10 flex flex-col justify-between min-h-[440px] sm:min-h-[490px] lg:min-h-[530px] xl:min-h-[550px]">

          {/* Top/Middle Area - Pushed down a little for comfortable spacing */}
          <div className="w-full max-w-xl text-left pt-4 sm:pt-6">

            {/* 1. Brand Blue Ribbon Folded Tag with Sparkles (Hidden per user request) */}
            {/*
            <div className="relative inline-block mb-3 select-none">
              <span className="absolute -top-2.5 -left-2.5 text-blue-200 font-black text-xs select-none">✦</span>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-blue-200 font-black text-xs select-none">✦</span>
              <span className="absolute -top-2 -right-2 text-blue-200 font-black text-xs select-none">✦</span>
              <span className="absolute -bottom-1 -left-2.5 text-blue-200 font-bold text-[10px] select-none">✦</span>
              <span className="absolute -bottom-1 -right-2 text-blue-200 font-bold text-[10px] select-none">✦</span>

              <div className="relative transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="bg-[#0062b8] text-white font-extrabold text-[11px] sm:text-[12px] px-3 py-1.5 rounded-xs shadow-lg uppercase tracking-tight text-center leading-tight border border-blue-400/40">
                  {isRw ? (
                    <>
                      Urubuga rw'Abashoferi <br />
                      <span className="text-[9px] font-bold text-white/90 normal-case">Biyandikishije kandi Bizerwa</span>
                    </>
                  ) : (
                    <>
                      Verified Driver Network <br />
                      <span className="text-[9px] font-bold text-white/90 normal-case">Truck & Commercial Drivers</span>
                    </>
                  )}
                </div>
                <div
                  className="w-0 h-0 border-t-[7px] border-t-[#004380] border-l-[7px] border-l-transparent absolute -bottom-1.5 left-0.5"
                />
              </div>
            </div>
            */}

            {/* 2. Headline with Straight Bold Modern Aesthetic & Golden Highlight */}
            <h1
              className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-white leading-[1.18] tracking-tight drop-shadow-md mb-2.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {/* PREVIOUS WORKER HEADLINE:
              {isRw ? (
                <>
                  Shaka n'Ohereze <br />
                  <span className="text-white">Abakozi Bishingiye ku Bwizerane</span>
                </>
              ) : (
                <>
                  Connect & Manage <br />
                  <span className="text-white">Workers with Confidence</span>
                </>
              )}
              */}
              {isRw ? (
                <>
                  Ha Akazi <br />
                  <span className="text-white">Abakozi b'Umwuga kandi Bizewe</span>
                </>
              ) : (
                <>
                  Hire Verified Drivers <br />
                  <span className="text-white">with Confidence</span>
                </>
              )}
            </h1>

            {/* 3. Subtext - Short 2-line concise driver description */}
            <p className="text-white/85 text-xs sm:text-sm lg:text-[15px] leading-snug mb-4 max-w-md font-normal drop-shadow-sm">
              {isRw ? (
                <>
                  Abashoferi b'umwuga n'abanyamwuga bizerwa. <br />
                  Bafite impushya kandi biteguye mu Rwanda hose.
                </>
              ) : (
                <>
                  Certified commercial and fleet drivers. <br />
                  Verified, licensed, and ready across Rwanda.
                </>
              )}
            </p>

            {/* PREVIOUS LONG SUBTEXT (PRESERVED):
            <p className="text-white/90 text-xs sm:text-sm lg:text-[15px] leading-relaxed mb-4 max-w-md font-medium drop-shadow-sm">
              {isRw
                ? "Ha imbaraga ubwikorezi bwawe n'abashoferi b'amakamyo n'ibinyabiziga bujuje ibyangombwa bya Polisi na NIDA mu Rwanda no mu Karere."
                : "Empower your transport and logistics operations with vetted, licensed commercial truck and fleet drivers across Rwanda and East Africa."}
            </p>
            */}

            {/* 4. App Store Badges & Download Text (Hidden per user request) */}
            {/*
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-2">
              <button
                type="button"
                onClick={() => navigate("/download")}
                className="bg-black/80 hover:bg-black text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md backdrop-blur-xs group"
              >
                <svg className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none">
                  <path d="M3.6 2.4L13.8 12.6L3.6 22.8C3.2 22.3 3 21.6 3 20.8V4.4C3 3.6 3.2 2.9 3.6 2.4Z" fill="#00D2FF" />
                  <path d="M17.4 9.0L14.7 11.7L13.8 12.6L14.7 13.5L17.4 16.2L20.8 14.3C21.7 13.8 22.2 13.0 22.2 12.6C22.2 12.2 21.7 11.4 20.8 10.9L17.4 9.0Z" fill="#FFD400" />
                  <path d="M14.7 13.5L3.6 22.8C4.1 23.3 4.9 23.5 5.7 23.1L17.4 16.2L14.7 13.5Z" fill="#FF3333" />
                  <path d="M14.7 11.7L17.4 9.0L5.7 2.1C4.9 1.7 4.1 1.9 3.6 2.4L14.7 11.7Z" fill="#00E676" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[8px] uppercase tracking-wider text-white/60 font-semibold">GET IT ON</span>
                  <span className="block text-[11px] font-bold text-white tracking-tight mt-0.5">Google Play</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/download")}
                className="bg-black/80 hover:bg-black text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md backdrop-blur-xs group"
              >
                <svg className="w-4 h-4 shrink-0 fill-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.64-1.24z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[8px] uppercase tracking-wider text-white/60 font-semibold">DOWNLOAD ON</span>
                  <span className="block text-[11px] font-bold text-white tracking-tight mt-0.5">App Store</span>
                </div>
              </button>
            </div>

            <p className="text-[11px] text-white/80 font-medium tracking-tight mb-2">
              {isRw ? (
                <>
                  Kuramo{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/download")}
                    className="text-[#0062b8] font-bold hover:underline cursor-pointer"
                  >
                    Ekaze App
                  </button>{" "}
                  cyangwa ukande <span className="text-[#0062b8] font-bold">*182#</span> kuri telefoni.
                </>
              ) : (
                <>
                  Download the{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/download")}
                    className="text-[#0062b8] font-bold hover:underline cursor-pointer"
                  >
                    Ekaze App
                  </button>{" "}
                  or dial <span className="text-[#0062b8] font-bold">*182#</span> on any phone.
                </>
              )}
            </p>
            */}

            {/* 5. Pill Button with "Pricing" text + White Right Arrow */}
            <button
              type="button"
              onClick={() => navigate("/who-we-are")}
              style={{ borderRadius: "9999px" }}
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white text-white font-medium text-sm sm:text-base px-7 py-2.5 bg-black hover:bg-neutral-900 transition-all cursor-pointer shadow-md group mt-3"
              title={isRw ? "Ibiciro" : "Pricing"}
              aria-label={isRw ? "Ibiciro" : "Pricing"}
            >
              {/* PREVIOUS LABELS:
              <span>{isRw ? "Abo Turi Bo" : "Who We Are"}</span>
              <span>{isRw ? "Ibiciro n'Amasezerano" : "Pricing & Agreements"}</span>
              */}
              <span>{isRw ? "Ibiciro" : "Pricing"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>



        </div>
      </section>
    </div>
  );
};

export default Hero;