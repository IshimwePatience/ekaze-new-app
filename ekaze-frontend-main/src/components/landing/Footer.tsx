import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

const languages = [
  { code: "kin" as const, label: "Kinyarwanda" },
  { code: "eng" as const, label: "English" },
];

const Footer = () => {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find((l) => l.code === language);

  return (
    <footer className="w-full bg-[#111111] text-white pt-10 pb-0 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 space-y-8">

        {/* Middle Row: Language Selector Pill on Left, Social Circles on Right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Language Picker Pill */}
          <CustomDropdown
            align="start"
            widthClass="w-36 min-w-[9rem]"
            trigger={
              <button
                type="button"
                className="bg-[#1C1C1F] hover:bg-[#27272A] text-white font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/15 shadow-2xs select-none"
              >
                <Languages className="w-4 h-4 text-[#FFCC00]" />
                <span>{currentLanguage?.label || "English"}</span>
              </button>
            }
            items={languages.map((lang) => ({
              label: lang.label,
              active: language === lang.code,
              onClick: () => setLanguage(lang.code),
            }))}
          />

          {/* Circular Social Media Buttons */}
          <div className="flex items-center gap-2.5">
            {[
              { name: "Facebook", icon: "fb", svg: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              { name: "Instagram", icon: "ig", svg: "M16 4H8C5.79 4 4 5.79 4 8v8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-4 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4.5-7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" },
              { name: "Twitter", icon: "tw", svg: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
              { name: "LinkedIn", icon: "li", svg: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
            ].map((item) => (
              <a
                key={item.name}
                href="#"
                aria-label={item.name}
                className="w-9 h-9 rounded-full bg-[#1C1C1F] text-white hover:bg-[#FFCC00] hover:text-[#111111] border border-white/15 flex items-center justify-center transition-all shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d={item.svg} />
                </svg>
              </a>
            ))}
          </div>

        </div>

        {/* Bottom Legal Links & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/15 text-xs sm:text-sm font-medium text-white/70">
          <p>© {new Date().getFullYear()} ekaze.rw, a Beno Finance Ltd brand</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/90 font-semibold">
            <a href="/who-we-are" className="hover:text-[#FFCC00] transition-colors">Pricing</a>
            <a href="/terms-of-service" className="hover:text-[#FFCC00] transition-colors">Terms of Service</a>
            <a href="/terms-and-conditions" className="hover:text-[#FFCC00] transition-colors">General Terms and Conditions</a>
            <a href="/privacy-policy" className="hover:text-[#FFCC00] transition-colors">Privacy Policy</a>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))} className="hover:text-[#FFCC00] transition-colors cursor-pointer">Cookie Policy</button>
          </div>
        </div>

      </div>

      {/* Massive Wordmark in Brand Yellow */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-6 sm:mt-10 flex items-end justify-center leading-none">
        <span
          style={{ fontFamily: '"Outfit", "Plus Jakarta Sans", "Inter", sans-serif' }}
          className="text-[#FFCC00] font-black text-[15.5vw] leading-[0.76] tracking-tighter uppercase block w-full text-center whitespace-nowrap select-none"
        >
          ekazefleet
        </span>
      </div>
    </footer>
  );
};

export default Footer;