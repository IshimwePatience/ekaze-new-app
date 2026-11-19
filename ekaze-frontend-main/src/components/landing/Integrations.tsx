import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import scaniaHeroTruck from "@/assets/scania_truck_africa_hero.jpg";

const Integrations = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRw = language === "kin";

  const handleContactClick = () => {
    // Open the help & support dialog
    window.dispatchEvent(new CustomEvent("open-landing-help"));
  };

  return (
    <section id="services" className="py-14 sm:py-20 bg-[#fafafa] relative overflow-hidden scroll-mt-20">
      <span id="integrations" className="absolute -top-20" aria-hidden="true" />

      <div className="container mx-auto px-5 sm:px-8 lg:px-12 max-w-7xl">
        {/* Main Outer Rounded Emerald Green Banner Card (#059669) */}
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#059669] text-white p-7 sm:p-10 lg:p-12 shadow-2xl border border-emerald-400/30 overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Heading, Subtitle & White Pill Button */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-6">
              
              <div>
                {/* Two-Line Title: Bold Top Line + Lighter Second Line */}
                <h2
                  className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white tracking-tight leading-[1.2]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isRw ? (
                    <>
                      Ekaze Serivisi z'Ubwikorezi <br />
                      <span className="font-normal text-white/95">n'Abashoferi b'Umwuga</span>
                    </>
                  ) : (
                    <>
                      Ekaze Fleet & Transport <br />
                      <span className="font-normal text-white/95">Services & Driver Solutions</span>
                    </>
                  )}
                </h2>

                {/* Body Description */}
                <p className="text-white/90 text-xs sm:text-sm lg:text-[14.5px] leading-relaxed mt-6 max-w-md font-normal">
                  {isRw
                    ? "Ha imbaraga ubucuruzi bwawe n'abashoferi b'umwuga bagenzuwe na Polisi na NIDA, amasezerano y'ikoranabuhanga n'uburyo bworoshye bwo kwishyura imishahara kuri MoMo na USSD mu Rwanda no mu Karere."
                    : "Empower your business with certified commercial drivers, automated digital contracts, fleet logistics, and on-demand transport solutions across Rwanda and East Africa."}
                </p>
              </div>

              {/* White Pill Button with Emerald Text */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="inline-flex items-center justify-center rounded-full bg-white hover:bg-emerald-50 text-[#059669] font-bold text-xs sm:text-sm px-8 py-3 transition-all shadow-md hover:shadow-lg cursor-pointer border-0"
                >
                  {isRw ? "Twandikire" : "Contact us"}
                </button>
              </div>

            </div>

            {/* Right Column: Large Inner Rounded Image Card */}
            <div className="lg:col-span-7 h-full flex items-center justify-center">
              <div className="w-full rounded-[20px] sm:rounded-[26px] overflow-hidden shadow-2xl border border-white/10 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] max-h-[420px] bg-slate-900">
                <img
                  src={scaniaHeroTruck}
                  alt="Ekaze Transport & Fleet Services"
                  className="w-full h-full object-cover object-[center_center] select-none pointer-events-none hover:scale-102 transition-transform duration-700"
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 
      ══════════════ PREVIOUS 3-COLUMN SERVICES DESIGN (PRESERVED) ══════════════
      <div className="hidden">
        <div className="mb-2">
          <p className="text-[#005a9c] font-bold text-base sm:text-lg tracking-tight">Ekaze Services</p>
        </div>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 tracking-tight">Our services</h2>
        </div>
      </div>
      */}
    </section>
  );
};

export default Integrations;
