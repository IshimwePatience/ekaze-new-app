import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="container mx-auto px-6 lg:px-12 py-10 max-w-5xl">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {isRw ? "Politiki y'Isuhuzabya no Kurinda Amakuru (Privacy Policy)" : "Privacy & Information Security Policy"}
          </h1>

          {/* Intro Description matching Screenshot Text format */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            {isRw
              ? "Iyi Politiki y'Kurinda Amakuru n'Umutekano isobanura ubwiyemezi bwa Ihirwe (ikirango cya Beno Finance Ltd) mu kurinda no kubungabunga amakuru bwite y'abakoresha n'abakozi bishingiye ku mategeko arinda amakuru y'umuntu mu Rwanda. Ihirwe izirikana igiciro n'agaciro k'amakuru n'uburenganzira bw'abantu."
              : "This Information Security and Privacy Policy outlines the commitment of Ihirwe (a Beno Finance Ltd brand) to maintaining the highest standards of information security and privacy in line with the requirements of Information Security and Privacy standards. Ihirwe recognizes the importance of safeguarding information assets and respecting individuals' privacy rights. This policy applies to all systems, processes, personnel, and third parties that access or process data on Ihirwe."}
          </p>

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {isRw ? "Amabwiriza y'Isuhuzabya" : "Policy Statements"}
          </h2>

          {/* 2-Column Policy Statements Layout (Exact Matching Screenshot Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed mb-12">
            
            {/* Column 1: Information Security */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Umutekano w'Amakuru (Information Security)" : "Information Security"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ibyiciro by'Amakuru: " : "Information Classification: "}
                  </strong>
                  {isRw
                    ? "Ihirwe igabanyamo amakuru ibyiciro nka Ibanga, Ikoreshwa ry'Imbere, n'Amakuru Rusange. Urwego rw'amakuru rugena uburyo bwo kuyarinda n'ubushobozi bwo kuyageraho."
                    : "Ihirwe classifies information into categories such as Confidential, Internal Use, and Public. The classification level determines the appropriate handling, access controls, and encryption measures."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Uburenganzira bwo Kugeraho: " : "Access Control: "}
                  </strong>
                  {isRw
                    ? "Uburenganzira bwo kureba amakuru burindwa bikomeye bishingiye ku nshingano za buri mukoresha ku urubuga."
                    : "Access to information is granted based on the principle of least privilege. Users are granted access only to the information necessary for their specific roles."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Gucunga Ibyago: " : "Risk Management: "}
                  </strong>
                  {isRw
                    ? "Igenzura rya buri gihe rikorwa mu gutahura n'okukumira inkeke no guhashya ibibazo mu bwikode no mu mutekano."
                    : "Regular risk assessments are conducted to identify, assess, and mitigate potential threats and vulnerabilities to safeguard user records."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Hahugurwa ku Umutekano: " : "Security Awareness & Training: "}
                  </strong>
                  {isRw
                    ? "Ihirwe itanga amahugurwa arambuye ku bakozi mu kurinda amakuru n'umutekano w'urubuga."
                    : "Ihirwe provides ongoing security awareness training to all personnel and partners to ensure informed security decisions."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Gucunga Impanuka: " : "Incident Management: "}
                  </strong>
                  {isRw
                    ? "Gahunda yo gukurikirana n'okukemura amakimbirane n'ibibazo by'umutekano ibaho kugira ngo birindwe vuba."
                    : "An incident response plan is in place to effectively manage and respond to security or data privacy incidents swiftly."}
                </li>
              </ul>
            </div>

            {/* Column 2: Privacy */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {isRw ? "Kurinda Amakuru Bwite (Privacy)" : "Privacy"}
              </h3>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Kurinda Amakuru: " : "Data Protection: "}
                  </strong>
                  {isRw
                    ? "Ihirwe ikurikiza amategeko y'u Rwanda arinda amakuru bwite. Amakuru yakusanyijwe arindwa mu mucyo no mu bwinyagamburiro."
                    : "Ihirwe complies with all relevant Rwandan data protection laws and regulations. Personal data is collected, processed, and stored lawfully and transparently."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Ubwumvikane (Consent): " : "Consent: "}
                  </strong>
                  {isRw
                    ? "Urubuga rusaba ubwumvikane bw'umukoresha mbere yo gukusanya cyangwa gukoresha amakuru ye."
                    : "When required, Ihirwe obtains explicit and informed consent from users before collecting or processing personal information."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Gukoresha Amakuru Akenewe Gusa: " : "Data Minimization: "}
                  </strong>
                  {isRw
                    ? "Amakuru yakusanyijwe ni ayo gusa akenewe mu gushaka no kumenya imyirondoro y'abakozi n'abakoresha."
                    : "Personal data is collected and processed only for specific and legitimate domestic staffing recruitment purposes."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Umutekano w'Amakuru: " : "Data Security: "}
                  </strong>
                  {isRw
                    ? "Uburyo bugezweho bwo kubika n'okurinda amakuru mu byuma bwa SSL & PostgreSQL burakoreshwa."
                    : "Appropriate technical and organizational measures (encryption, role authorization) are implemented to protect personal data from unauthorized access."}
                </li>
                <li>
                  <strong className="text-slate-900">
                    {isRw ? "Yohererezwa rya Amakuru: " : "Data Transfer: "}
                  </strong>
                  {isRw
                    ? "Amakuru ntatangwa ku bandi bantu atari mu rwego rwo kwemeza no gukurikirana iby'irangamuntu n'akazi."
                    : "Before sharing data with verified identity verification partners (such as NIDA), adequate safeguards are implemented."}
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

export default PrivacyPolicy;
