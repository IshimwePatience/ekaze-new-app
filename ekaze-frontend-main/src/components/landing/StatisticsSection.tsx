import { useLanguage } from "@/contexts/LanguageContext";
import { useUsageStatistics } from "@/hooks/useUsage";
import { Menu, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const StatisticsSection = () => {
  const { language } = useLanguage();
  const { data: stats } = useUsageStatistics();
  const isRw = language === "kin";
  const currentDateStr = "22 Sep 2026";

  const mainChartData = [
    { name: "%", label: isRw ? "Abakozi Banditswe" : "Workers Registered", value: stats?.workers_registered ?? 0, color: "#005bb5" },
    { name: "%", label: isRw ? "Abakoresha Batekanye" : "Happy Employers", value: stats?.happy_employers ?? 0, color: "#e67e22" },
    { name: "%", label: isRw ? "Ibisosiyete Bafatanyije" : "Partner Companies", value: stats?.partner_companies ?? 0, color: "#00b4d8" },
    { name: "%", label: isRw ? "Kontaje Zagenzuwe" : "Verified Profiles", value: stats?.verified_profiles_percent ?? 0, color: "#48bb78" },
  ];

  return (
    <section id="statistics" className="py-16 bg-[#e8eff8] border-b border-[#d2e0f2] scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

        {/* Section Headline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2b2b2b] text-center tracking-tight mb-10">
          {isRw ? "Ibyavuye mu Bushakashatsi" : "Featured articles"}
        </h2>

        {/* Featured Article Container (No Border, No Shadow) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Recharts Bar Chart */}
          <div className="lg:col-span-7 space-y-4">

            {/* Top Bar: Title, Menu Icon, and Date */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#2b2b2b] tracking-tight">
                {isRw
                  ? "Ibipimo by'abakozi n'abakoresha kuri Ihirwe (%) mu Gihe cya B, 2026"
                  : "Ihirwe Platform Growth & Verification Metrics (%) in Season B, 2026"}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                <button className="p-1 text-slate-500 hover:text-slate-900 transition-colors" title="Options">
                  <Menu className="w-5 h-5" />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-[#4f687a]">
                  {currentDateStr}
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart + Side Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">

              {/* Bar Chart Canvas */}
              <div className="sm:col-span-8 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mainChartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 13, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Percentage"]}
                      contentStyle={{ borderRadius: "8px", borderColor: "#cbd5e1" }}
                    />
                    <Bar dataKey="value" barSize={42}>
                      {mainChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-xs font-bold text-slate-500 -mt-2">%</div>
              </div>

              {/* Legend List on Right of Bar Chart */}
              <div className="sm:col-span-4 space-y-3 pl-0 sm:pl-2 text-xs sm:text-sm">
                {mainChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[#4f687a] font-semibold leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Column: Article Details */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 lg:pl-10 text-center lg:text-left">
            <span className="text-xs sm:text-sm font-semibold text-[#4f687a]">
              {currentDateStr}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#2b2b2b] leading-snug tracking-tight">
              {isRw
                ? "Ubushakashatsi bw'Abakozi n'Abakoresha"
                : "Ihirwe Workforce & Verification Survey"}
            </h3>

            <p className="text-[#4f687a] text-sm sm:text-base leading-relaxed font-medium">
              {isRw
                ? `Ibipimo ${stats?.verified_profiles_percent ?? 0}% by'abakozi banditswe bamaze kugenzurwa imyirondoro n'indangamuntu kuri Ihirwe.`
                : `${stats?.verified_profiles_percent ?? 0} pct of registered workers completed NIDA identity verification and background check.`}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default StatisticsSection;
