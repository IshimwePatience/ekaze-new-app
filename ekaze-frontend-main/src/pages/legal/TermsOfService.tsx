import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export const TermsOfService = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="container mx-auto px-6 lg:px-12 py-10 max-w-5xl">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {isRw ? "Amasezerano y'Imikoreshereze (Terms of Service)" : "Terms of Service"}
          </h1>

          {/* Intro Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            {isRw
              ? "Aya masezerano yo gukoresha urubuga rwa Ekaze (ikirango cya Beno Finance Ltd) asobanura imikorere n'inshingano z'abakoresha n'abakozi mu gushaka no guha akazi abakozi bakora mu ngo n'inzobere mu Rwanda. Urubuga rwacu rwiyemeje gukora mu mucyo n'umutekano w'amakuru bishingiye ku mategeko y'u Rwanda."
              : "This Terms of Service agreement outlines the commitment of Ekaze (a Beno Finance Ltd brand) to maintaining the highest standards of platform usage, worker placement, and service reliability across Rwanda. Ekaze provides digital verification, NIDA background authentication, and domestic staffing connection tools."}
          </p>

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isRw ? "Amabwiriza n'Ibisabwa" : "Policy Statements"}
          </h2>

          {/* 2-Column Policy Statements Layout (Matching Screenshot Design) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed mb-12">
            {/* Column 1: Information Security & Verification */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Umutekano n'Igenzura" : "Information Security & Verification"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Igenzura rya NIDA: " : "Identity Verification: "}
                  </strong>
                  {isRw
                    ? "Abakozi bose banyura mu igenzura ryo kwemeza irangamuntu binyuze mu mfashanyarubuga ya NIDA."
                    : "All workers and employers undergo official National Identity (NIDA) validation prior to full profile publication."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ugutangaza Amakuru: " : "Access Control: "}
                  </strong>
                  {isRw
                    ? "Amakuru y'ibigo n'abakozi arindwa mu buryo bugezweho gusa agahabwa abafite uburenganzira bwabyemererwa."
                    : "Access to detailed worker contacts and background reports is granted strictly to authenticated employers."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Cunga Incamugongo: " : "Risk & Dispute Management: "}
                  </strong>
                  {isRw
                    ? "Urwego rw'abapolisi n'abagenzuzi rukurikirana impanuka cyangwa amakimbirane yabera mu kazi."
                    : "Incident reporting tools are maintained to log and resolve workplace incidents transparently with local authorities."}
                </li>
              </ul>
            </div>

            {/* Column 2: Service Rules & User Rights */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Inshingano n'Uburenganzira" : "Service Rules & User Rights"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ubwizerane w'Amakuru: " : "Data Accuracy: "}
                  </strong>
                  {isRw
                    ? "Abakoresha n'abakozi bafite inshingano zo gutanga amakuru y'ukuri ku kintu cyose cyandikwa ku rubuga."
                    : "Users are required to submit truthful, up-to-date identification and professional service details."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ibipimo by'Umushahara: " : "Payment & Subscription Terms: "}
                  </strong>
                  {isRw
                    ? "Ubwikode bwo kureba abakozi cyangwa ikarita y'akazi byishyurwa mu buryo bwizerewe bwa Mobile Money."
                    : "Subscription fees for database access and worker business cards are processed securely via integrated Mobile Money APIs."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Guhagarika Konti: " : "Account Termination: "}
                  </strong>
                  {isRw
                    ? "Ekaze ifite uburenganzira bwo guhagarika konti iteza ibibazo cyangwa ikoresha amakuru y'ibinyoma."
                    : "Ekaze reserves the right to suspend any account violating safety guidelines or engaging in fraudulent activity."}
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

export default TermsOfService;
