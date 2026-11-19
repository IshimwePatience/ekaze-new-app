import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import personImg from "@/assets/hero_person_report.jpg";
import { ArrowRight, Check, ShieldCheck, FileText, Sparkles, Clock, CheckCircle2 } from "lucide-react";

export const WhoWeAre = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRw = language === "kin";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleContactClick = () => {
    window.dispatchEvent(new CustomEvent("open-landing-help"));
  };

  return (
    <div
      className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div>
        <Header />

        {/* ══════════════════════════════════════════════════════════════════════════
            PRICING & AGREEMENTS SECTION (Worker Category / Ekaze Design Style)
        ══════════════════════════════════════════════════════════════════════════ */}
        <section
          className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden border-b border-slate-100"
          style={{
            fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl">

            {/* ══════════════════════════════════════════════════════════════════════════
                PREVIOUS UPPER 2-COLUMN SHOWCASE (HIDDEN PER USER REQUEST)
            ══════════════════════════════════════════════════════════════════════════ */}
            {/*
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-12 sm:mb-16">
              
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none flex items-center justify-center">
                  <img
                    src={personImg}
                    alt={isRw ? "Ibiciro n'Amasezerano - Ekaze" : "Pricing & Agreements - Ekaze"}
                    className="w-full max-h-[380px] sm:max-h-[460px] object-cover object-top rounded-2xl shadow-lg border border-slate-200/80 transition-all duration-300"
                  />
                  
                  <div className="absolute -bottom-4 sm:-bottom-5 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#0062b8] shrink-0" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">
                        {isRw ? "Amasezerano Yizewe 100%" : "100% Legal Contracts"}
                      </p>
                      <p className="text-[9.5px] text-slate-500 font-medium">
                        {isRw ? "Bihuje n'amategeko y'u Rwanda" : "Compliant with Rwandan law"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
                <p className="text-[#005a9c] font-semibold text-sm sm:text-base tracking-normal">
                  {isRw ? "Ibiciro by'Ifatabuguzi n'Amasezerano" : "Subscription Pricing & Agreements"}
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-slate-900 tracking-tight leading-[1.15]">
                  {isRw ? "Ibiciro n'Amasezerano" : "Pricing & Agreements"}
                </h1>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  {isRw
                    ? "Ekaze itanga uburyo bwiza bwo kwishyura no guha akazi abashoferi b'umwuga b'amakamyo n'imodoka mu buryo bworoshye. Dufite ifatabuguzi rya buri Kwezi (Monthly) n'iry'Umwaka (Annual), ndetse n'ibiciro by'ubumvikane ku gihe runaka (Dealing Price). Buri gahunda iherekezwa n'amasezerano y'ikoranabuhanga yizewe."
                    : "Ekaze delivers transparent, flexible pricing tailored for commercial transport, logistics fleets, and personal vehicle drivers. Choose from Monthly or Annual subscriptions, or agree on custom Dealing Prices for specific contract durations. Every engagement is backed by legally verified digital agreements."}
                </p>

                <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-4 sm:p-5 flex items-start gap-3.5 max-w-2xl">
                  <div className="w-8 h-8 rounded-lg bg-[#0062b8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">
                      {isRw ? "Igeragezwa ry'Ubuntu (Ku Masezerano)" : "Free Trial Available (On Agreement)"}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {isRw
                        ? "Dutanga igihe cyo kugerageza serivisi zacu z'abashoferi ku buntu mbere yo kwiyemeza. Igeragezwa ritangwa gusa habayeho gusinya amasezerano y'igeragezwa (Trial Agreement) arinda impande zombi."
                        : "We offer a risk-free trial period to experience our verified driver network and payroll system before committing. The free trial is activated upon signing our formal mutual trial agreement."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <button
                    onClick={handleContactClick}
                    className="bg-[#005a9c] hover:bg-[#00487c] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer border-0"
                  >
                    <span>{isRw ? "Saba Amasezerano cyangwa Ikaze" : "Request Agreement & Pricing"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate("/search-worker")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer border-0"
                  >
                    <span>{isRw ? "Shaka Umushoferi" : "Find Driver"}</span>
                  </button>
                </div>
              </div>

            </div>
            */}

            {/* ── PRICING & AGREEMENTS (EXACT SAME DESIGN AS GENERAL TERMS AND CONDITIONS) ── */}
            <div className="pt-2">
              <div className="max-w-6xl mx-auto mb-8 sm:mb-10 text-left">
                {/* PREVIOUS BLUE EYEBROW (PRESERVED):
                <p className="text-[#005a9c] font-semibold text-xs sm:text-sm mb-2">
                  {isRw ? "Ibiciro n'Amasezerano" : "Pricing & Agreements"}
                </p>
                */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  {isRw ? "Ibiciro n'Amasezerano" : "Pricing & Agreements"}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                  {isRw
                    ? "Ifatabuguzi rya buri kwezi (Monthly) n'iry'umwaka (Annual), ndetse n'ibiciro by'ubumvikane ku gihe runaka (Dealing Price). Dutanga n'igeragezwa ry'ubuntu ariko bishingiye ku masezerano."
                    : "Monthly and annual subscriptions, and custom dealing prices for a certain time. We also provide a free trial on agreement."}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 
        ══════════════════════════════════════════════════════════════════════════
        PREVIOUS "OUR STORY / WHO WE ARE" SECTION (PRESERVED IN COMMENTS):
        ══════════════════════════════════════════════════════════════════════════
        <section className="hidden py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <h1>Our Story</h1>
            <p>Ekaze (a Beno Finance Ltd platform) was launched with a mission to provide universal access to fast, reliable, and verified domestic staffing across Rwanda...</p>
          </div>
        </section>
        */}
      </div>

      <Footer />
    </div>
  );
};

export default WhoWeAre;
