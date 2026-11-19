import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTA = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white">
      {/* Soft glow blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-6">
            <span>{t("cta.badge")}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            {t("cta.title1")} <span className="text-cyan-100">{t("cta.title2")}</span>
          </h2>

          {/* Subtitle */}
          <p className="text-base text-cyan-50/90 mb-8 leading-relaxed max-w-lg mx-auto font-medium">
            {t("cta.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-md font-bold px-8 h-11 text-sm rounded-full group transition-all"
              onClick={() => navigate("/search-worker")}
            >
              {t("cta.primaryBtn")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold px-8 h-11 text-sm rounded-full transition-all"
              onClick={() => navigate("/auth/login")}
            >
              {t("cta.secondaryBtn")}
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-cyan-100/70 tracking-wide font-medium">
            {t("cta.trustNote")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;