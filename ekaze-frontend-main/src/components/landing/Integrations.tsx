import { useLanguage } from "@/contexts/LanguageContext";
import { Truck } from "lucide-react";

const Integrations = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  const handleContactClick = () => {
    // Open the help & support dialog (functionality untouched)
    window.dispatchEvent(new CustomEvent("open-landing-help"));
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-20">
      <span id="integrations" className="absolute -top-20" aria-hidden="true" />

      {/* Subtle organic curved background shape (Cloning Picture 1 background wave) */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none select-none overflow-hidden z-0">
        <svg
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover text-[#f4f7f9] opacity-70"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0H1440V70C1280 120 1020 170 720 150C420 130 180 50 0 90V0Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: Typography & Content (Cloned from Picture 1) ── */}
          <div className="lg:col-span-6 text-left space-y-5">
            {/* Category / Sub-label */}
            <span className="text-slate-500 font-medium text-sm sm:text-[15px] tracking-wide block">
              {isRw ? "Serivisi z'Ubwikorezi & Amakuru" : "Services & Fleet update"}
            </span>

            {/* Serif Bold Headline */}
            <h2
              className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#11314d] tracking-tight leading-[1.16]"
              style={{ fontFamily: "'Georgia', 'Merriweather', 'Times New Roman', serif" }}
            >
              {isRw ? (
                <>Witeguye gukorana na <br />Beno Finance Fleet?</>
              ) : (
                <>Ready for Beno Finance <br />Fleet Solutions?</>
              )}
            </h2>

            {/* Paragraph with selective bold accents */}
            <p className="text-slate-600 text-sm sm:text-[15px] lg:text-[16px] leading-relaxed max-w-xl font-normal">
              {isRw ? (
                <>
                  Fungura amarembo yo gukorana n’<strong>abashoferi b’umwuga bagenzuwe</strong> na Polisi na NIDA, amasezerano y’ikoranabuhanga n’uburyo bwizewe bwo gucunga imodoka n’imitwaro mu Rwanda no mu Karere. Ikipe yacu ya Beno Finance irahari kugufasha buri munsi.
                </>
              ) : (
                <>
                  Empower your enterprise with <strong>certified commercial drivers</strong>, automated digital contracts, fleet logistics, and on-demand transport management across Rwanda and East Africa. Our specialized team is dedicated to streamlining your fleet operations and driver placement.
                </>
              )}
            </p>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleContactClick}
                className="inline-flex items-center justify-center rounded-md bg-[#005973] hover:bg-[#00475d] text-white font-semibold text-xs sm:text-sm px-7 py-3 transition-colors shadow-xs cursor-pointer border-0"
              >
                <span>{isRw ? "Twandikire" : "Contact us"}</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Cloned Teal Banner Card (Exact match to Picture 1) ── */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl sm:rounded-3xl bg-[#005973] text-white shadow-xl overflow-hidden relative p-6 sm:p-8 md:p-9 min-h-[340px] flex flex-col justify-between">
              
              {/* Header row inside card: Pill Badge on Left, Logo on Right */}
              <div className="flex items-center justify-between relative z-10">
                <span className="bg-white text-[#005973] font-bold text-xs sm:text-[13px] px-4 py-1 rounded-full shadow-sm">
                  {isRw ? "Serivisi Nyamukuru" : "Fleet Solutions"}
                </span>

                <div className="flex items-center gap-1.5 select-none">
                  <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                    beno<span className="text-[#f59e0b]">.</span>finance
                  </span>
                </div>
              </div>

              {/* Main Content inside card */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10 mt-6 sm:mt-8">
                {/* Text Content inside card */}
                <div className="sm:col-span-7 space-y-4 text-left">
                  <h3 className="text-xl sm:text-[22px] font-bold text-white leading-snug tracking-tight">
                    {isRw
                      ? "Waba ushaka kwagura fleet yawe? Inzira zizewe zo kubona abashoferi b'umwuga"
                      : "Scaling your fleet? Key decisions for hiring verified drivers"}
                  </h3>

                  {/* Golden-bordered pill badge */}
                  <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-[#f59e0b] text-[#fef3c7] text-xs font-medium tracking-wide">
                    {isRw ? "Rwanda & Akarere | 24/7 Abashoferi" : "Rwanda & East Africa | 24/7 Verified Fleet"}
                  </div>
                </div>

                {/* Right Visual inside card: Full Laptop Graphic over Cyan Circular Backdrop */}
                <div className="sm:col-span-5 relative flex items-center justify-center sm:justify-end pt-2 sm:pt-0">
                  {/* Cyan Circular background backdrop */}
                  <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[#008fae] -right-6 -bottom-10 pointer-events-none select-none z-0 opacity-90" />

                  {/* Full Laptop Mockup (Uncut, complete display & base matching Picture 2) */}
                  <div className="relative z-10 flex flex-col items-center select-none">
                    {/* Laptop Screen & Bezel */}
                    <div className="w-[210px] sm:w-[240px] h-[135px] sm:h-[155px] bg-white rounded-t-xl border-[2.5px] border-slate-200/90 shadow-2xl p-2 sm:p-2.5 flex flex-col justify-between relative">
                      {/* Top Bezel Webcam */}
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-auto" />

                      {/* Screen Content: Circles + Arrow */}
                      <div className="flex-1 flex items-center justify-center gap-2.5 sm:gap-3.5 my-auto">
                        {/* Driver / Truck Orange Circle */}
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-sm shrink-0">
                          <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                        </div>

                        {/* Transition Arrow (Bold, prominent arrow matching reference) */}
                        <div className="text-slate-700 flex items-center shrink-0">
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                            <path d="M4 11h10.17l-3.58-3.59L12 6l6 6-6 6-1.41-1.41L14.17 13H4v-2z" />
                          </svg>
                        </div>

                        {/* Beno Finance Fleet Blue Circle */}
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#005973] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-sm shrink-0">
                          B
                        </div>
                      </div>

                      {/* Screen bottom subtle spacer */}
                      <div className="h-0.5" />
                    </div>

                    {/* Laptop Keyboard Base (Wider than screen with center opening lip) */}
                    <div className="w-[234px] sm:w-[268px] h-2.5 sm:h-3 bg-slate-200 rounded-b-lg border-t border-slate-300 shadow-md flex justify-center relative">
                      {/* Center Opening Notch */}
                      <div className="w-10 sm:w-12 h-1 bg-slate-400/80 rounded-b-sm" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Integrations;
