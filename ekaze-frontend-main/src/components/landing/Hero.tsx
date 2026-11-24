import { useLanguage } from "@/contexts/LanguageContext";
import scaniaHeroTruck from "@/assets/scania_hero_new.jpg";
import tipperTruckImg from "@/assets/tipper_truck.jpg";

const Hero = () => {
  const { language } = useLanguage();
  const isRw = language === "kin";

  return (
    <div id="hero" className="w-full relative bg-white overflow-hidden select-none">
      <section className="container mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: Short, Punchy Headline & Value Copy ── */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              {isRw ? (
                "Abashoferi b'Amakamyo n'Ubwikorezi bw'Imizigo"
              ) : (
                "Commercial Fleet & Heavy Driver Solutions"
              )}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isRw ? (
                <>
                  Bona byoroshye{" "}
                  <strong className="font-bold text-slate-900">
                    abashoferi b'amakamyo n'imizigo
                  </strong>{" "}
                  bagenzuwe neza mu Rwanda no mu Karere.
                </>
              ) : (
                <>
                  Easily hire{" "}
                  <strong className="font-bold text-slate-900">
                    verified commercial drivers
                  </strong>{" "}
                  for freight and cargo logistics across Rwanda and East Africa.
                </>
              )}
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isRw ? (
                <>
                  Kuva ku makamyo manini kugeza kuri van, duhuza ibigo n'
                  <strong className="font-bold text-slate-900">
                    abashoferi b'umwuga
                  </strong>{" "}
                  bafite amasezerano yizewe.
                </>
              ) : (
                <>
                  From heavy semi-trailers to city delivery vans, access{" "}
                  <strong className="font-bold text-slate-900">
                    screened professional drivers
                  </strong>{" "}
                  with automated digital contracts.
                </>
              )}
            </p>
          </div>

          {/* ── RIGHT COLUMN: Rounded Container with Two Side-by-Side Portrait Trucks ── */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="rounded-[32px] sm:rounded-[38px] bg-[#eef2f6] p-3 sm:p-4 shadow-xl border border-slate-200/80 w-full max-w-[490px]">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[320px] sm:h-[390px]">
                
                {/* Truck 1: Long-Haul Scania Semi-Trailer */}
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md relative h-full group bg-slate-200">
                  <img
                    src={scaniaHeroTruck}
                    alt="Heavy commercial semi-trailer truck"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Truck 2: Tipper / Construction Truck */}
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md relative h-full group bg-slate-200">
                  <img
                    src={tipperTruckImg}
                    alt="Heavy tipper and construction truck"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Hero;
