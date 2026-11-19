import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import ihirweChefHero from "@/assets/ihirwe_chef_hero.jpg";
import logo from "@/assets/reallogo.png";
import { CheckCircle2, Smartphone, ShieldCheck, Zap, Globe, PhoneCall } from "lucide-react";

export const HowItWorksPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRw = language === "kin";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

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
            HERO BANNER: 100% FULL-WIDTH SEAMLESS CLONE OF REFERENCE DESIGN
        ══════════════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full overflow-hidden bg-[#15120f] min-h-[440px] sm:min-h-[490px] lg:min-h-[530px] xl:min-h-[550px] flex items-center mb-10 select-none border-b border-slate-900/30">

          {/* Background Chef Photo (Pinned to Top to prevent head clipping) */}
          <img
            src={ihirweChefHero}
            alt="Chef seasoning food - Ihirwe Workforce"
            className="absolute inset-0 w-full h-full object-cover object-[80%_top] sm:object-[78%_top] md:object-[82%_top] select-none pointer-events-none"
          />

          {/* Left Warm Gradient Overlay for Clean Typography Contrast */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(90deg, rgba(12, 10, 8, 0.95) 0%, rgba(14, 11, 9, 0.86) 38%, rgba(18, 14, 11, 0.50) 62%, rgba(20, 16, 12, 0.12) 80%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          {/* Mobile Vertical Gradient for Perfect Contrast */}
          <div
            className="absolute inset-0 pointer-events-none z-10 sm:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(12, 10, 8, 0.25) 0%, rgba(12, 10, 8, 0.86) 60%, rgba(12, 10, 8, 0.98) 100%)",
            }}
          />

          {/* Full Container for Content Layer (Aligned with Page Content) */}
          <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl relative z-20 py-6 sm:py-8 lg:py-10 flex items-center min-h-[440px] sm:min-h-[490px] lg:min-h-[530px] xl:min-h-[550px]">
            <div className="w-full max-w-2xl text-left flex flex-col justify-between h-full space-y-4 sm:space-y-5">

              {/* Headline & Subtitle (Straight Bold Modern Type - No Italic) */}
              <div className="py-1">
                <h1
                  className="text-2xl sm:text-4xl lg:text-[46px] font-black text-white leading-[1.05] tracking-tight uppercase drop-shadow-md"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isRw ? (
                    <>
                      Kora <br />
                      Uhemberwe ku gihe
                    </>
                  ) : (
                    <>
                      Work and <br />
                      Get paid on time
                    </>
                  )}
                </h1>

                <p
                  className="text-base sm:text-xl lg:text-[22px] font-normal text-white/95 mt-1.5 sm:mt-2 drop-shadow-sm tracking-wide"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isRw ? "Ni iki tugiye gukora uyu munsi?" : "What are we doing today?"}
                </p>
              </div>

              {/* Bottom App Download Callout & Badges */}
              <div className="pt-1">
                <p
                  className="text-[11px] sm:text-xs font-bold text-white tracking-wider uppercase mb-2.5 opacity-95 drop-shadow-xs"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isRw ? "Kuramo porogaramu yawe ya Ihirwe" : "Download your Ihirwe app"}
                </p>

                {/* Badges Row (Google Play / App Store / USSD) */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">

                  {/* Badge 2: Google Play */}
                  <button
                    type="button"
                    onClick={() => navigate("/download")}
                    className="bg-black/70 hover:bg-black/90 text-white border border-white/25 hover:border-white/50 px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-xs group"
                  >
                    <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none">
                      <path d="M3.6 2.4L13.8 12.6L3.6 22.8C3.2 22.3 3 21.6 3 20.8V4.4C3 3.6 3.2 2.9 3.6 2.4Z" fill="#00D2FF" />
                      <path d="M17.4 9.0L14.7 11.7L13.8 12.6L14.7 13.5L17.4 16.2L20.8 14.3C21.7 13.8 22.2 13.0 22.2 12.6C22.2 12.2 21.7 11.4 20.8 10.9L17.4 9.0Z" fill="#FFD400" />
                      <path d="M14.7 13.5L3.6 22.8C4.1 23.3 4.9 23.5 5.7 23.1L17.4 16.2L14.7 13.5Z" fill="#FF3333" />
                      <path d="M14.7 11.7L17.4 9.0L5.7 2.1C4.9 1.7 4.1 1.9 3.6 2.4L14.7 11.7Z" fill="#00E676" />
                    </svg>
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] uppercase tracking-wider text-white/70 font-semibold">
                        Download From
                      </span>
                      <span className="block text-xs font-bold text-white tracking-tight">
                        Google Play
                      </span>
                    </div>
                  </button>

                  {/* Badge 3: App Store */}
                  <button
                    type="button"
                    onClick={() => navigate("/download")}
                    className="bg-black/70 hover:bg-black/90 text-white border border-white/25 hover:border-white/50 px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-xs group"
                  >
                    <svg className="w-5 h-5 shrink-0 fill-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.64-1.24z" />
                    </svg>
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] uppercase tracking-wider text-white/70 font-semibold">
                        Download From
                      </span>
                      <span className="block text-xs font-bold text-white tracking-tight">
                        App Store
                      </span>
                    </div>
                  </button>

                  {/* Badge 4: Offline USSD */}
                  <div className="bg-[#0062b8] text-white border border-blue-400/30 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg select-none backdrop-blur-xs">
                    <PhoneCall className="w-4 h-4 text-white" />
                    <div className="text-left leading-tight">
                      <span className="block text-[9px] uppercase tracking-wider font-semibold text-white/80">
                        Offline USSD
                      </span>
                      <span className="block text-xs font-bold text-white tracking-tight">
                        *182# / *185#
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        <main className="container mx-auto px-6 lg:px-12 pb-16 max-w-6xl">
          {/* 2-Column System Architecture & Payment Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm text-slate-700 leading-relaxed mb-12 pt-4">

            {/* Column 1: Mobile Money & USSD Integration */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isRw ? "1. MTN, Airtel & USSD API Integration" : "1. MTN, Airtel & USSD Gateway Integration"}
              </h3>
              <ul className="space-y-3.5 list-disc pl-5 text-slate-600">
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Instant Direct Disbursements: " : "Instant Direct Disbursements: "}
                  </strong>
                  {isRw
                    ? "Abakoresha n'ibigo bishyura abakozi ku buryo bwihuse bakoresheje konti zabo za MTN MoMo cyangwa Airtel Money mu Rwanda."
                    : "Employers and placement agencies can trigger instant salary payouts directly to verified domestic workers using MTN MoMo or Airtel Money."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Offline USSD Quick Dial (*182# & *185#): " : "Offline USSD Quick Dial (*182# & *185#): "}
                  </strong>
                  {isRw
                    ? "Abakozi badafite telefone zigezweho bashobora kwemeza ihemba no kubikuza bakoresheje kode za USSD z'ibigo by'itumanaho bitagombereye interineti."
                    : "Domestic workers and employers with basic feature phones can view balances, approve payouts, and confirm receipt offline using simple telecom USSD menus."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Secure Open API Protocols: " : "Secure Open API Protocols: "}
                  </strong>
                  {isRw
                    ? "Sisitemu ihura neza n'ibipimo bya MTN Open API Merchant Gateway na Airtel Money Open API gukora ihererekanya ryizewe."
                    : "Ihirwe communicates via encrypted RESTful APIs with MTN Open API Merchant Gateway and Airtel Money Merchant APIs to process real-time payment approvals."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Automated Receipting: " : "Automated Receipting: "}
                  </strong>
                  {isRw
                    ? "Buri kwihembera gutanga inyemezabwishyu ya elektronike ifite nimero y'ihererekanya (Transaction ID) ibikwa muri sisitemu."
                    : "Every payment generates a digital receipt with a unique transaction reference stored for tax and compliance auditing."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Transparent Fee Schedules: " : "Transparent Fee Schedules: "}
                  </strong>
                  {isRw
                    ? "Ibiciro by'ihererekanya birazwi kandi nta kiguzi gihabanye n'amategeko gicibwa umukozi mu kubikuza."
                    : "Zero hidden charges. Workers receive 100% of their net salary without unauthorized deductions or platform cut-offs."}
                </li>
              </ul>
            </div>

            {/* Column 2: Escrow & OTP Security */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isRw ? "2. Escrow & SMS OTP Security" : "2. Escrow & SMS OTP Security"}
              </h3>
              <ul className="space-y-3.5 list-disc pl-5 text-slate-600">
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Escrow Lock Protocol: " : "Escrow Lock Protocol: "}
                  </strong>
                  {isRw
                    ? "Amafaranga y'umukoresha abikwa mu buryo bwizewe n'urubuga (Escrow Hold) kugeza igihe umukozi arangije inshingano z'ukwezi cyangwa igihe cyumvikanyweho kigeze."
                    : "Salary funds deposited by employers are held safely in a regulated escrow account until employment tasks or milestone dates are met."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Multi-Factor SMS OTP Verification: " : "Multi-Factor SMS OTP Verification: "}
                  </strong>
                  {isRw
                    ? "Ihererekanya n'ihemba bisaba kwemeza nimero ya kode (OTP) yoherejwe kuri telefone ya nyir'ubwite yanditse kuri NIDA."
                    : "Before funds are released, a one-time password (OTP) is dispatched via SMS to the recipient's registered NIDA-verified phone line."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "Dispute Resolution & Refunds: " : "Dispute Resolution & Refunds: "}
                  </strong>
                  {isRw
                    ? "Mu gihe habaye amakimbirane cyangwa umukozi atabonetse, amafaranga asubizwa umukoresha mu buryo bw'amategeko binyuze muri konti ye."
                    : "If a contract terminates prematurely or a dispute arises, our automated resolution system evaluates logs and processes refunds."}
                </li>
                <li>
                  <strong className="text-slate-900 font-semibold">
                    {isRw ? "SSL & End-to-End Encryption: " : "SSL & End-to-End Encryption: "}
                  </strong>
                  {isRw
                    ? "Amakuru yose ya konti n'ihererekanya arabikwa mu buryo bwa encryption bwa 256-bit SSL."
                    : "All payment credentials and mobile wallet handshakes are protected with 256-bit SSL transport layer security."}
                </li>
              </ul>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
