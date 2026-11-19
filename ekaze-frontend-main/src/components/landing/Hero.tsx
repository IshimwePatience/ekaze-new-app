import scaniaHeroTruck from "@/assets/scania_truck_africa_hero.jpg";

const Hero = () => {
  return (
    <div id="hero" className="w-full relative overflow-hidden select-none">
      <section className="relative w-full bg-[#121114] overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] xl:min-h-[680px]">
        {/* Full-bleed Hero Background Image */}
        <img
          src={scaniaHeroTruck}
          alt="Ekaze commercial fleet and verified drivers across Rwanda"
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        />

        {/* Subtle Top Scrim for Transparent Navbar Legibility */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none z-10"
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
        />
      </section>
    </div>
  );
};

export default Hero;
