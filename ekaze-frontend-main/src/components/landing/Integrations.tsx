import { useLanguage } from "@/contexts/LanguageContext";
import partnershipImg from "@/assets/partnership_services.jpg";
import { Send } from "lucide-react";

const Integrations = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  const handleContactClick = () => {
    // Open the help & support dialog (functionality untouched)
    window.dispatchEvent(new CustomEvent("open-landing-help"));
  };

  return (
    <section id="services" className="py-14 sm:py-20 bg-[#fafafa] relative overflow-hidden scroll-mt-20">
      <span id="integrations" className="absolute -top-20" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Cloned Card from Picture 1 (Clean white card with subtle border, edge-to-edge left photo & clean typography) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          
          {/* Left Column: Full-Height Partnership Image */}
          <div className="md:col-span-5 relative min-h-[280px] sm:min-h-[340px] md:min-h-[400px] bg-slate-100 overflow-hidden">
            <img
              src={partnershipImg}
              alt="Ekaze Fleet & Transport Services Partnership"
              className="w-full h-full object-cover object-center select-none"
            />
          </div>

          {/* Right Column: Title, Description & Action Button */}
          <div className="md:col-span-7 p-7 sm:p-10 lg:p-14 flex flex-col justify-center text-left space-y-6">
            <div>
              <h2
                className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 tracking-tight leading-[1.25]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {isRw ? (
                  <>
                    Beno Finance Serivisi z'Ubwikorezi <br />
                    <span className="font-semibold text-slate-800">n'Abashoferi b'Umwuga</span>
                  </>
                ) : (
                  <>
                    Beno Finance Fleet & Transport <br />
                    <span className="font-semibold text-slate-800">Services & Driver Solutions</span>
                  </>
                )}
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed mt-4 max-w-lg font-normal">
                {isRw
                  ? "Ha imbaraga ubucuruzi bwawe n'abashoferi b'umwuga bagenzuwe na Polisi na NIDA, amasezerano y'ikoranabuhanga n'uburyo bworoshye bwo kwishyura imishahara kuri MoMo na USSD mu Rwanda no mu Karere."
                  : "Empower your business with certified commercial drivers, automated digital contracts, fleet logistics, and on-demand transport solutions across Rwanda and East Africa."}
              </p>
            </div>

            {/* Action Area: Preserving exact functionality with clean Picture 1 styling */}
            <div className="pt-2 flex items-center">
              <button
                type="button"
                onClick={handleContactClick}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2478b8] hover:bg-[#1b6296] text-white font-semibold text-xs sm:text-sm px-7 py-3 transition-colors shadow-xs cursor-pointer border-0"
              >
                <span>{isRw ? "Twandikire" : "Contact us"}</span>
                <Send className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Integrations;
