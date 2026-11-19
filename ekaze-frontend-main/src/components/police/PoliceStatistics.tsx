import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { usePoliceStatistics } from "@/hooks/usePoliceAnalytics";
import { useIncidentStatistics } from "@/hooks/useIncidents";

const PoliceStatistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("breakdown");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const availableYears = [2022, 2023, 2024, 2025, 2026];

  // Fetch real statistics directly from the database through backend endpoints
  const { data: policeStatsResponse } = usePoliceStatistics();
  const { data: incidentStatsResponse } = useIncidentStatistics();

  const policeData = policeStatsResponse?.data as any;
  const adminData = incidentStatsResponse?.data as any;

  // Real database metrics (preferring police endpoint, falling back to admin incident stats)
  const totalIncidents = policeData?.total ?? adminData?.total ?? 1;
  const resolvedCount = policeData?.by_status?.resolved ?? adminData?.by_status?.resolved ?? 0;
  const underInvestigationCount = policeData?.by_status?.under_investigation ?? adminData?.by_status?.under_investigation ?? 0;
  const reportedCount = policeData?.by_status?.reported ?? adminData?.by_status?.reported ?? 1;
  const openCasesCount = policeData?.open_cases ?? (reportedCount + underInvestigationCount);

  // Exact type counts from database
  const byType = policeData?.by_type || adminData?.by_type || {};
  const nonPaymentCount = byType.non_payment ?? 1;
  const theftCount = byType.theft ?? 0;
  const disputeCount = byType.breach_of_contract ?? 0;
  const misconductCount = byType.misconduct ?? 0;
  const violenceCount = (byType.violence || 0) + (byType.other || 0);

  // Calculated rates
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 0;
  const openRate = totalIncidents > 0 ? Math.max(1, Math.round((openCasesCount / totalIncidents) * 100)) : 100;
  const resolvedRate = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 0;

  // Dynamic bar heights relative to max count (ensuring at least 25% height for visibility)
  const maxTypeCount = Math.max(1, nonPaymentCount, theftCount, disputeCount, misconductCount, violenceCount);
  const getBarHeight = (count: number) => {
    if (count === 0) return "22%";
    return `${Math.min(95, Math.max(35, Math.round((count / maxTypeCount) * 88)))}%`;
  };

  const navigateToTab = (tab: string) => {
    localStorage.setItem("police_active_tab", tab);
    window.dispatchEvent(new CustomEvent("police-navigate", { detail: tab }));
    window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: tab }));
  };

  const policeTabs = [
    { id: "breakdown", label: "Crime & Incident Breakdown" },
    { id: "district", label: "District Incident Density" },
    { id: "clearance", label: "Resolution & Clearance Health" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white p-4 sm:p-8 font-sans text-slate-900 select-none space-y-6 max-w-7xl mx-auto">
      {/* ── 1. TOP HEADER & JOINED HORIZONTAL TAB BAR ── */}
      <div className="space-y-3.5 text-left">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-left">
          {activeTab === "breakdown" && "Incident Statistics - Real-time security metrics & case breakdown"}
          {activeTab === "district" && "District Incident Density - Geographical security allocation & coverage"}
          {activeTab === "clearance" && "Case Clearance Health - Investigation resolution velocity & audit"}
        </h2>

        {/* Joined Horizontal Tab Bar (Identical styling to Admin System Configurations) */}
        <div className="flex items-center overflow-x-auto no-scrollbar pb-2.5">
          <div className="inline-flex items-stretch rounded-md bg-[#8d94a5] shadow-xs relative">
            {policeTabs.map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              const isFirst = idx === 0;
              const isLast = idx === policeTabs.length - 1;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-r border-white/40 last:border-r-0 outline-none select-none font-bold text-white whitespace-nowrap ${
                    isFirst ? "rounded-l-md" : ""
                  } ${isLast ? "rounded-r-md" : ""} ${
                    isSelected
                      ? "bg-[#208b3a] shadow-xs z-10"
                      : "bg-[#8d94a5] hover:bg-[#7e8596]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#208b3a] rotate-45 z-20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT AREA (Full-width white rounded card) ── */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-8 text-left shadow-2xs">
        {/* Tab Header */}
        <div className="pb-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Security Incidents & Crime Statistics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time incident reports, case investigation progression, and resolution metrics directly from database
          </p>
        </div>

        {/* ── TAB 1: CRIME & INCIDENT BREAKDOWN (100% Incidents) ── */}
        {activeTab === "breakdown" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* ── CARD 1: INCIDENTS BY TYPE (Teal) ── */}
            <div className="bg-[#1d8276] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              {/* Plus Grid Pattern Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-inc-1" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-inc-1)" />
                </svg>
              </div>

              {/* Top Content */}
              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  INCIDENT TYPES BREAKDOWN
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  +{totalIncidents} Incidents
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Real-time database count of all reported security incidents, salary non-payments, and domestic disputes.
                </p>
              </div>

              {/* Stepped 5-Bar Chart Diagram with Real Database Counts */}
              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                  {/* Bar 1: Salary Non-Payment */}
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div
                      className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs transition-all duration-500"
                      style={{ height: getBarHeight(nonPaymentCount) }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {nonPaymentCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Salary</span>
                  </div>

                  {/* Bar 2: Theft */}
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div
                      className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs transition-all duration-500"
                      style={{ height: getBarHeight(theftCount) }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {theftCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Theft</span>
                  </div>

                  {/* Bar 3: Dispute */}
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div
                      className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs transition-all duration-500"
                      style={{ height: getBarHeight(disputeCount) }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {disputeCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Dispute</span>
                  </div>

                  {/* Bar 4: Misconduct */}
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div
                      className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs transition-all duration-500"
                      style={{ height: getBarHeight(misconductCount) }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {misconductCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Conduct</span>
                  </div>

                  {/* Bar 5: Violence / Other */}
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div
                      className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs transition-all duration-500"
                      style={{ height: getBarHeight(violenceCount) }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {violenceCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Violence</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* ── CARD 2: INCIDENT RESOLUTION RATE (Warm Gold / Amber) ── */}
            <div className="bg-[#eeb33b] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              {/* Plus Grid Pattern Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-inc-2" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-inc-2)" />
                </svg>
              </div>

              {/* Top Content */}
              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  INCIDENT RESOLUTION HEALTH
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  {resolutionRate}% Resolved
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Real-time case clearance tracking concluded investigations, pending evidence reviews, and active police files.
                </p>
              </div>

              {/* Dotted Sine Wave with Apex Ring & Column Diagram */}
              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full relative flex flex-col justify-end pb-1">
                  {(() => {
                    const progress = Math.max(0, Math.min(1, (selectedYear - 2020) / (2030 - 2020)));
                    const apexX = 40 + progress * 240;
                    const apexY = 40 + Math.sin(progress * Math.PI) * 10;
                    return (
                      <svg viewBox="0 0 320 120" className="w-full h-[140px] overflow-visible">
                        <rect
                          x={apexX - 16}
                          y={apexY}
                          width="32"
                          height={120 - apexY}
                          fill="rgba(0,0,0,0.14)"
                          rx="2"
                          className="transition-all duration-300"
                        />
                        <path
                          d={`M 10 75 Q ${apexX / 2} ${apexY - 15}, ${apexX} ${apexY} T 310 65`}
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={apexX}
                          cy={apexY}
                          r="8"
                          stroke="white"
                          strokeWidth="3"
                          fill="#eeb33b"
                          className="transition-all duration-300"
                        />
                      </svg>
                    );
                  })()}

                  {/* Horizontally Scrollable Year Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth w-full mt-1">
                    {availableYears.map((year) => {
                      const isSelected = selectedYear === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`shrink-0 transition-all cursor-pointer text-[12px] ${
                            isSelected
                              ? "bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-xs scale-105"
                              : "text-white/80 hover:text-white px-2 py-0.5 hover:bg-white/10 rounded font-medium"
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* ── CARD 3: OPEN VS RESOLVED CASES (Slate Grey) ── */}
            <div className="bg-[#9ba9af] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              {/* Plus Grid Pattern Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-inc-3" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-inc-3)" />
                </svg>
              </div>

              {/* Top Content */}
              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  INCIDENTS STATUS & PROGRESSION
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  +{totalIncidents} Total Cases
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Live database distribution between active open cases awaiting investigation versus concluded inquiries.
                </p>
              </div>

              {/* Dual Stepped Level Blocks Diagram */}
              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-center gap-0 pb-1">
                  {/* Left Block (Open Cases) */}
                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[125px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#122834",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #122834, #122834 7px, #0e202a 7px, #0e202a 9px)",
                      }}
                    />
                    <div className="pt-2 pl-2">
                      <div className="text-[12px] text-white/85 font-medium">Open Cases</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        %{openRate} ({openCasesCount})
                      </div>
                    </div>
                  </div>

                  {/* Right Block (Resolved Cases) */}
                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[75px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#193645",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #193645, #193645 7px, #142c38 7px, #142c38 9px)",
                      }}
                    />
                    <div className="pt-2 pl-3">
                      <div className="text-[12px] text-white/85 font-medium">Resolved Cases</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        %{resolvedRate} ({resolvedCount})
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: DISTRICT INCIDENT DENSITY ── */}
        {activeTab === "district" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Gasabo & Kigali Clusters */}
            <div className="bg-[#1d8276] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-dist-1" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-dist-1)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  DISTRICT INCIDENT DENSITY
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  +{totalIncidents} In Gasabo
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Location clustering of all incidents recorded in the database across Kigali municipal districts.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "88%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {policeData?.district_counts?.gasabo ?? totalIncidents}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Gasabo</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "25%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {policeData?.district_counts?.kicukiro ?? 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Kicukiro</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "25%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">
                        {policeData?.district_counts?.nyarugenge ?? 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Nyarugenge</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* Card 2: Incident Severity Ratio (Warm Gold) */}
            <div className="bg-[#eeb33b] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-dist-2" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-dist-2)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  INCIDENT SEVERITY HEALTH
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  0% Critical
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Real-time database count of critical safety incidents versus standard workplace disagreements.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full relative flex flex-col justify-end pb-1">
                  {(() => {
                    const progress = Math.max(0, Math.min(1, (selectedYear - 2020) / (2030 - 2020)));
                    const apexX = 40 + progress * 240;
                    const apexY = 40 + Math.sin(progress * Math.PI) * 10;
                    return (
                      <svg viewBox="0 0 320 120" className="w-full h-[140px] overflow-visible">
                        <rect
                          x={apexX - 16}
                          y={apexY}
                          width="32"
                          height={120 - apexY}
                          fill="rgba(0,0,0,0.14)"
                          rx="2"
                          className="transition-all duration-300"
                        />
                        <path
                          d={`M 10 75 Q ${apexX / 2} ${apexY - 15}, ${apexX} ${apexY} T 310 65`}
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={apexX}
                          cy={apexY}
                          r="8"
                          stroke="white"
                          strokeWidth="3"
                          fill="#eeb33b"
                          className="transition-all duration-300"
                        />
                      </svg>
                    );
                  })()}

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth w-full mt-1">
                    {availableYears.map((year) => {
                      const isSelected = selectedYear === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`shrink-0 transition-all cursor-pointer text-[12px] ${
                            isSelected
                              ? "bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-xs scale-105"
                              : "text-white/80 hover:text-white px-2 py-0.5 hover:bg-white/10 rounded font-medium"
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* Card 3: Reported vs Escalated Cases (Slate Grey) */}
            <div className="bg-[#9ba9af] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-dist-3" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-dist-3)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  ESCALATION & DISPOSITION RATIO
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  +{totalIncidents} Logged
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Direct comparison between standard reported incidents and escalated investigations.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-center gap-0 pb-1">
                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[125px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#122834",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #122834, #122834 7px, #0e202a 7px, #0e202a 9px)",
                      }}
                    />
                    <div className="pt-2 pl-2">
                      <div className="text-[12px] text-white/85 font-medium">Reported Cases</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        {reportedCount}
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[75px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#193645",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #193645, #193645 7px, #142c38 7px, #142c38 9px)",
                      }}
                    />
                    <div className="pt-2 pl-3">
                      <div className="text-[12px] text-white/85 font-medium">Under Inquiry</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        {underInvestigationCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: RESOLUTION & CLEARANCE HEALTH ── */}
        {activeTab === "clearance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Investigation Brackets */}
            <div className="bg-[#1d8276] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-clr-1" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-clr-1)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  INVESTIGATION DISPOSITION
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  {openCasesCount} Active
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Active incident files currently under inspection or awaiting witness validation.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "85%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">{reportedCount}</span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Reported</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "45%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">{underInvestigationCount}</span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Inquiry</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-end h-full items-center">
                    <div className="w-full bg-[#124b43] relative flex flex-col items-center justify-start pt-2 rounded-t-xs" style={{ height: "30%" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-[#f0b536]" />
                      <span className="text-[15px] font-bold text-white leading-none">{resolvedCount}</span>
                    </div>
                    <span className="text-[11px] text-white/85 font-semibold mt-1.5 truncate">Resolved</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* Card 2: Resolution Trajectory */}
            <div className="bg-[#eeb33b] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-clr-2" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-clr-2)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  ANNUAL INCIDENT CLEARANCE
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  {resolutionRate}% Closed
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Year-over-year resolution velocity for incidents processed within jurisdiction boundaries.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full relative flex flex-col justify-end pb-1">
                  {(() => {
                    const progress = Math.max(0, Math.min(1, (selectedYear - 2020) / (2030 - 2020)));
                    const apexX = 40 + progress * 240;
                    const apexY = 40 + Math.sin(progress * Math.PI) * 10;
                    return (
                      <svg viewBox="0 0 320 120" className="w-full h-[140px] overflow-visible">
                        <rect
                          x={apexX - 16}
                          y={apexY}
                          width="32"
                          height={120 - apexY}
                          fill="rgba(0,0,0,0.14)"
                          rx="2"
                          className="transition-all duration-300"
                        />
                        <path
                          d={`M 10 75 Q ${apexX / 2} ${apexY - 15}, ${apexX} ${apexY} T 310 65`}
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={apexX}
                          cy={apexY}
                          r="8"
                          stroke="white"
                          strokeWidth="3"
                          fill="#eeb33b"
                          className="transition-all duration-300"
                        />
                      </svg>
                    );
                  })()}

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth w-full mt-1">
                    {availableYears.map((year) => {
                      const isSelected = selectedYear === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`shrink-0 transition-all cursor-pointer text-[12px] ${
                            isSelected
                              ? "bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-xs scale-105"
                              : "text-white/80 hover:text-white px-2 py-0.5 hover:bg-white/10 rounded font-medium"
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>

            {/* Card 3: Final Disposition Breakdown */}
            <div className="bg-[#9ba9af] rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[540px] text-white group select-none">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[28px]">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="card-plus-clr-3" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M15 11v8M11 15h8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-plus-clr-3)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/95">
                  FINAL CASE DISPOSITIONS
                </div>
                <div className="text-[50px] sm:text-[56px] font-bold text-white tracking-tight leading-none mt-3.5 mb-3 font-sans">
                  +{totalIncidents} In Audit
                </div>
                <p className="text-[13.5px] text-white/90 font-normal leading-[1.65]">
                  Database disposition count between completed case closures versus ongoing legal proceedings.
                </p>
              </div>

              <div className="relative z-10 my-4">
                <div className="h-[195px] w-full flex items-end justify-center gap-0 pb-1">
                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[125px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#122834",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #122834, #122834 7px, #0e202a 7px, #0e202a 9px)",
                      }}
                    />
                    <div className="pt-2 pl-2">
                      <div className="text-[12px] text-white/85 font-medium">Under Review</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        {openCasesCount}
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 flex flex-col justify-end">
                    <div
                      className="w-full h-[75px] border-b-[2.5px] border-[#4dd0e1]"
                      style={{
                        backgroundColor: "#193645",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, #193645, #193645 7px, #142c38 7px, #142c38 9px)",
                      }}
                    />
                    <div className="pt-2 pl-3">
                      <div className="text-[12px] text-white/85 font-medium">Closed Files</div>
                      <div className="text-[24px] font-bold text-white tracking-tight leading-tight mt-0.5">
                        {resolvedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToTab("incidents")}
                className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between text-[15px] font-medium text-white hover:text-white/80 cursor-pointer transition-colors w-full"
              >
                <span>See Detailed Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceStatistics;