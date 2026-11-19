import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export const GeneralTerms = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="container mx-auto px-6 lg:px-12 py-10 max-w-5xl">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {isRw ? "Amabwiriza Rusange n'Ibibenga (General Terms and Conditions)" : "General Terms and Conditions"}
          </h1>

          {/* Intro Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            {isRw
              ? "Aya mabwiriza rusange agenga imikoranire kati y'urubuga rwa Ihirwe, abashyira mu akazi, n'abakozi mu ngo n'inzobere mu Rwanda. Intego yacu ni ukwimakaza gukora neza, umutekano ku murimo, no korohereza buri wese gusora n'ikoranabuhanga ritanga icyizere."
              : "These General Terms and Conditions govern the operational framework between Ihirwe, employers, staffing agencies, and domestic workers across Rwanda. This framework provides rules for placement, identification verification, transparent hiring, and account responsibilities."}
          </p>

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isRw ? "Amabwiriza y'Imikorere" : "Policy Statements"}
          </h2>

          {/* 2-Column Policy Statements Layout (Matching Screenshot Design) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed mb-12">
            {/* Column 1: Platform Operations */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Imikorere y'Urubuga" : "Platform Operations & Placement"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Guhuza Abakozi n'Abakoresha: " : "Worker-Employer Matching: "}
                  </strong>
                  {isRw
                    ? "Ihirwe yorohereza abakoresha n'abakozi guhura no kumvikana ku kazi n'umushahara mu bwinyagamburiro."
                    : "Ihirwe serves as a digital staffing platform providing verified worker candidate profiles to employers."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Imirasire n'Ikarita y'Akazi: " : "Digital Business Cards: "}
                  </strong>
                  {isRw
                    ? "Abakozi bagenzuwe bahabwa ikarita yo gukoresha irimo kodhi ya QR mu kugaragaza imyirondoro yabo."
                    : "Verified workers receive digital QR business cards used for instant identity check by employers."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Igenzura ry'Inzobere: " : "Supervisor & Agency Roles: "}
                  </strong>
                  {isRw
                    ? "Ibigo byanditse n'abagenzuzi bafite uburenganzira bwo kwandika no gufasha abakozi n'abakoresha."
                    : "Registered placement agencies and local supervisors are authorized to register and verify worker profiles."}
                </li>
              </ul>
            </div>

            {/* Column 2: Legal & Liability */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Inshingano n'Umutekano" : "Liability & Compliance"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Kwitwararika Amategeko: " : "Legal Compliance: "}
                  </strong>
                  {isRw
                    ? "Abakoresha bategetswe kubahiriza amategeko y'umurimo mu Rwanda arimo kubahiriza umushahara n'isaha z'akazi."
                    : "Employers must comply with Rwandan labor laws regarding fair wages, working hours, and worker insurance."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ikoreshwa ry'Ikoranabuhanga: " : "Platform Integrity: "}
                  </strong>
                  {isRw
                    ? "Biromewe gukoresha amakuru gusa mu ntego zo gushaka no guha akazi abakozi mu buryo bw'amategeko."
                    : "User details obtained from the platform must be used solely for legitimate recruitment and employment purpose."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Gusobanura Ibibazo: " : "Dispute Resolution: "}
                  </strong>
                  {isRw
                    ? "Imbata n'amategeko y'u Rwanda niyo yakoreshwa mu gukemura impaka n'ibibazo bishingiye ku nshingano."
                    : "Any dispute arising from service usage shall be resolved in accordance with the laws of the Republic of Rwanda."}
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

export default GeneralTerms;
