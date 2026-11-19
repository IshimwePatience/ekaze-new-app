import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Sparkles, X, CornerDownLeft, Bot, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRoleSearchPlaceholder } from "@/components/layout/DashboardNavbar";
import {
  ConsoleClockIcon,
  ConsoleSparkleIcon,
  ConsoleCpuIcon,
  ConsoleShieldUserIcon,
  ConsoleBillingIcon,
  ConsoleBuildingIcon,
  ConsoleUserCheckIcon,
  ConsoleAgentIcon,
  ConsoleAlertIcon,
  ConsoleGridIcon,
  ConsoleSlidersIcon,
  ConsoleUsersIcon,
  ConsoleBriefcaseIcon,
  ConsoleCalendarIcon,
  ConsoleBarChartIcon,
} from "@/components/ui/ConsoleSidebarIcons";

export interface SearchItem {
  id: string;
  title: string;
  desc: string;
  path: string;
  icon?: any;
  category?: string;
  keywords?: string[];
  type?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userId?: string | number;
  onOpenAiChat?: (prompt?: string) => void;
}

// ─────────────────────────────────────────────────────────────
// ROLE-SPECIFIC SEARCH CATALOG (STRICTLY SCOPED PER USER ROLE)
// ─────────────────────────────────────────────────────────────

const ROLE_SEARCH_CATALOG: Record<string, { recommended: SearchItem[]; allItems: SearchItem[] }> = {
  employer: {
    recommended: [
      {
        id: "e-workers",
        title: "Workers",
        desc: "Review your hired domestic workers, daily duties and agreements",
        path: "/employer?tab=active",
        icon: ConsoleUserCheckIcon,
        keywords: ["workers", "active", "hired", "staff", "employees"],
      },
      {
        id: "e-payments",
        title: "Payments & Ledger",
        desc: "Domestic worker salary disbursements, MoMo and bank history",
        path: "/employer?tab=payments",
        icon: ConsoleBillingIcon,
        keywords: ["payments", "salary", "ledger", "momo", "wages", "history"],
      },
      {
        id: "e-incidents",
        title: "Incident Reports",
        desc: "Household dispute logs, safety assistance and escalations",
        path: "/employer?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incident", "reports", "dispute", "safety", "police"],
      },
      {
        id: "e-profile",
        title: "Employer Settings",
        desc: "Household account details, address, phone and contacts",
        path: "/employer?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["settings", "profile", "account", "address", "phone"],
      },
      {
        id: "e-overview",
        title: "Dashboard",
        desc: "Household overview summary, active workers count and stats",
        path: "/employer?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "overview"],
      },
    ],
    allItems: [
      {
        id: "e-overview",
        title: "Dashboard",
        desc: "Household overview summary, active workers count and stats",
        path: "/employer?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "overview"],
      },
      {
        id: "e-workers",
        title: "Workers",
        desc: "Review your hired domestic workers, daily duties and agreements",
        path: "/employer?tab=active",
        icon: ConsoleUserCheckIcon,
        keywords: ["workers", "active", "hired", "staff", "employees"],
      },
      {
        id: "e-payments",
        title: "Payments & Ledger",
        desc: "Domestic worker salary disbursements, MoMo and bank history",
        path: "/employer?tab=payments",
        icon: ConsoleBillingIcon,
        keywords: ["payments", "salary", "ledger", "momo", "wages", "history"],
      },
      {
        id: "e-incidents",
        title: "Incident Reports",
        desc: "Household dispute logs, safety assistance and escalations",
        path: "/employer?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incident", "reports", "dispute", "safety", "police"],
      },
      {
        id: "e-profile",
        title: "Employer Settings",
        desc: "Household account details, address, phone and contacts",
        path: "/employer?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["settings", "profile", "account", "address", "phone"],
      },
    ],
  },

  worker: {
    recommended: [
      {
        id: "w-dash",
        title: "Dashboard",
        desc: "Summary of stats, active status and shifts",
        path: "/worker?tab=dashboard",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "overview"],
      },
      {
        id: "w-wallet",
        title: "My Wallet",
        desc: "Monthly wages, tips, and MTN MoMo disbursements",
        path: "/worker?tab=wallet",
        icon: ConsoleBillingIcon,
        keywords: ["wallet", "salary", "momo", "payout", "money", "earnings", "wages"],
      },
      {
        id: "w-history",
        title: "Work History",
        desc: "Completed jobs, previous employers & verified ratings",
        path: "/worker?tab=work-history",
        icon: ConsoleBriefcaseIcon,
        keywords: ["history", "jobs", "contracts", "experience", "employers"],
      },
      {
        id: "w-incidents",
        title: "Incident Reports",
        desc: "Report workplace issues and security assistance",
        path: "/worker?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "dispute", "report", "police", "safety", "help"],
      },
      {
        id: "w-schedule",
        title: "Calendar",
        desc: "View working hours, days of week and availability slots",
        path: "/worker?tab=schedule",
        icon: ConsoleCalendarIcon,
        keywords: ["calendar", "hours", "shifts", "timetable", "availability"],
      },
      {
        id: "w-profile",
        title: "My Profile",
        desc: "National ID verification, skills and security clearance",
        path: "/worker?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "national id", "nida", "identity", "skills"],
      },
    ],
    allItems: [
      {
        id: "w-dash",
        title: "Dashboard",
        desc: "Summary of stats, active status and shifts",
        path: "/worker?tab=dashboard",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "overview"],
      },
      {
        id: "w-wallet",
        title: "My Wallet",
        desc: "Monthly wages, tips, and MTN MoMo disbursements",
        path: "/worker?tab=wallet",
        icon: ConsoleBillingIcon,
        keywords: ["wallet", "salary", "momo", "payout", "money", "earnings", "wages"],
      },
      {
        id: "w-history",
        title: "Work History",
        desc: "Completed jobs, previous employers & verified ratings",
        path: "/worker?tab=work-history",
        icon: ConsoleBriefcaseIcon,
        keywords: ["history", "jobs", "contracts", "experience", "employers"],
      },
      {
        id: "w-incidents",
        title: "Incident Reports",
        desc: "Report workplace issues and security assistance",
        path: "/worker?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "dispute", "report", "police", "safety", "help"],
      },
      {
        id: "w-schedule",
        title: "Calendar",
        desc: "View working hours, days of week and availability slots",
        path: "/worker?tab=schedule",
        icon: ConsoleCalendarIcon,
        keywords: ["calendar", "hours", "shifts", "timetable", "availability"],
      },
      {
        id: "w-profile",
        title: "My Profile",
        desc: "National ID verification, skills and security clearance",
        path: "/worker?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "national id", "nida", "identity", "skills"],
      },
    ],
  },

  company: {
    recommended: [
      {
        id: "c-overview",
        title: "Company Overview",
        desc: "Fleet workforce metrics and driver deployment",
        path: "/company?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "metrics", "stats"],
      },
      {
        id: "c-workers",
        title: "Registered Drivers",
        desc: "Company driver roster and verified badges",
        path: "/company?tab=workers",
        icon: ConsoleUserCheckIcon,
        keywords: ["drivers", "workers", "directory", "staff", "roster"],
      },
      {
        id: "c-revenue",
        title: "Revenue & Earnings",
        desc: "Fleet payouts, escrow and financial history",
        path: "/company?tab=revenue",
        icon: ConsoleBillingIcon,
        keywords: ["revenue", "earnings", "escrow", "fees", "finance"],
      },
      {
        id: "c-incidents",
        title: "Incident Management",
        desc: "Manage fleet incident reports and disputes",
        path: "/company?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "disputes", "safety", "complaints"],
      },
      {
        id: "c-profile",
        title: "Company Profile",
        desc: "Fleet company profile, registration and details",
        path: "/company?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "settings", "company", "tin", "details"],
      },
    ],
    allItems: [
      {
        id: "c-overview",
        title: "Company Overview",
        desc: "Fleet workforce metrics and driver deployment",
        path: "/company?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "metrics", "stats"],
      },
      {
        id: "c-workers",
        title: "Registered Drivers",
        desc: "Company driver roster and verified badges",
        path: "/company?tab=workers",
        icon: ConsoleUserCheckIcon,
        keywords: ["drivers", "workers", "directory", "staff", "roster"],
      },
      {
        id: "c-revenue",
        title: "Revenue & Earnings",
        desc: "Fleet payouts, escrow and financial history",
        path: "/company?tab=revenue",
        icon: ConsoleBillingIcon,
        keywords: ["revenue", "earnings", "escrow", "fees", "finance"],
      },
      {
        id: "c-incidents",
        title: "Incident Management",
        desc: "Manage fleet incident reports and disputes",
        path: "/company?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "disputes", "safety", "complaints"],
      },
      {
        id: "c-profile",
        title: "Company Profile",
        desc: "Fleet company profile, registration and details",
        path: "/company?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "settings", "company", "tin", "details"],
      },
    ],
  },

  admin: {
    recommended: [
      {
        id: "a-users",
        title: "User Access & Roles",
        desc: "Employers, workers, agencies, permissions & roles",
        path: "/admin?tab=users",
        icon: ConsoleUsersIcon,
        keywords: ["users", "roles", "permissions", "iam", "accounts", "admin"],
      },
      {
        id: "a-companies",
        title: "Companies & Employers",
        desc: "Staffing agencies, company accreditation and corporate clients",
        path: "/admin?tab=companies",
        icon: ConsoleBuildingIcon,
        keywords: ["companies", "agencies", "employers", "accreditation"],
      },
      {
        id: "a-payments",
        title: "Transactions & Revenue",
        desc: "System-wide transactions, MoMo fees & escrow audit",
        path: "/admin?tab=payments",
        icon: ConsoleBillingIcon,
        keywords: ["payments", "transactions", "finance", "ledger", "revenue"],
      },
      {
        id: "a-incidents",
        title: "Incident Reports",
        desc: "Platform security alerts, disputes & police escalations",
        path: "/admin?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "safety", "police", "alerts", "escalations"],
      },
      {
        id: "a-overview",
        title: "Dashboard",
        desc: "Platform high-level analytics, operational health and growth",
        path: "/admin?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "analytics", "health"],
      },
      {
        id: "a-settings",
        title: "System Configurations",
        desc: "Platform settings, escrow thresholds and fee rates",
        path: "/admin?tab=settings",
        icon: ConsoleSlidersIcon,
        keywords: ["settings", "configs", "fees", "thresholds"],
      },
    ],
    allItems: [
      {
        id: "a-overview",
        title: "Dashboard",
        desc: "Platform high-level analytics, operational health and growth",
        path: "/admin?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["dashboard", "home", "stats", "analytics", "health"],
      },
      {
        id: "a-companies",
        title: "Companies & Employers",
        desc: "Staffing agencies, company accreditation and corporate clients",
        path: "/admin?tab=companies",
        icon: ConsoleBuildingIcon,
        keywords: ["companies", "agencies", "employers", "accreditation"],
      },
      {
        id: "a-users",
        title: "User Access & Roles",
        desc: "Employers, workers, agencies, permissions & roles",
        path: "/admin?tab=users",
        icon: ConsoleUsersIcon,
        keywords: ["users", "roles", "permissions", "iam", "accounts", "admin"],
      },
      {
        id: "a-incidents",
        title: "Incident Reports",
        desc: "Platform security alerts, disputes & police escalations",
        path: "/admin?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "safety", "police", "alerts", "escalations"],
      },
      {
        id: "a-payments",
        title: "Transactions & Revenue",
        desc: "System-wide transactions, MoMo fees & escrow audit",
        path: "/admin?tab=payments",
        icon: ConsoleBillingIcon,
        keywords: ["payments", "transactions", "finance", "ledger", "revenue"],
      },
      {
        id: "a-settings",
        title: "System Configurations",
        desc: "Platform settings, escrow thresholds and fee rates",
        path: "/admin?tab=settings",
        icon: ConsoleSlidersIcon,
        keywords: ["settings", "configs", "fees", "thresholds"],
      },
    ],
  },

  police: {
    recommended: [
      {
        id: "p-incidents",
        title: "Incident Reports",
        desc: "Active crime investigations and household safety reports",
        path: "/police?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "crime", "investigation", "dispute", "report"],
      },
      {
        id: "p-statistics",
        title: "Crime Statistics",
        desc: "District dispute numbers, safety metrics and statistics",
        path: "/police?tab=statistics",
        icon: ConsoleBarChartIcon,
        keywords: ["statistics", "metrics", "crime", "reports"],
      },
      {
        id: "p-overview",
        title: "Inspectorate Overview",
        desc: "Police command station overview and open cases",
        path: "/police?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "cases", "station"],
      },
      {
        id: "p-profile",
        title: "Officer Profile",
        desc: "Officer credentials, rank, badge and station details",
        path: "/police?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "badge", "officer", "station"],
      },
    ],
    allItems: [
      {
        id: "p-overview",
        title: "Inspectorate Overview",
        desc: "Police command station overview and open cases",
        path: "/police?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "cases", "station"],
      },
      {
        id: "p-incidents",
        title: "Incident Reports",
        desc: "Active crime investigations and household safety reports",
        path: "/police?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "crime", "investigation", "dispute", "report"],
      },
      {
        id: "p-statistics",
        title: "Crime Statistics",
        desc: "District dispute numbers, safety metrics and statistics",
        path: "/police?tab=statistics",
        icon: ConsoleBarChartIcon,
        keywords: ["statistics", "metrics", "crime", "reports"],
      },
      {
        id: "p-profile",
        title: "Officer Profile",
        desc: "Officer credentials, rank, badge and station details",
        path: "/police?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "badge", "officer", "station"],
      },
    ],
  },

  supervisor: {
    recommended: [
      {
        id: "s-incidents",
        title: "District Incidents",
        desc: "District security incident reports, jurisdiction cases and disputes",
        path: "/supervisor?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "district", "crimes", "cases", "disputes", "safety"],
      },
      {
        id: "s-workforce",
        title: "District Workforce",
        desc: "District workers directory, freelance & agency affiliations, employer assignments",
        path: "/supervisor?tab=workforce",
        icon: ConsoleUsersIcon,
        keywords: ["workers", "workforce", "district", "freelance", "company", "employers"],
      },
      {
        id: "s-overview",
        title: "Supervisor Overview",
        desc: "District supervisor dashboard and jurisdiction statistics",
        path: "/supervisor?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "stats"],
      },
      {
        id: "s-profile",
        title: "Supervisor Settings",
        desc: "Assigned district jurisdiction and supervisor account profile",
        path: "/supervisor?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "settings", "district", "jurisdiction", "account"],
      },
    ],
    allItems: [
      {
        id: "s-overview",
        title: "Supervisor Overview",
        desc: "District supervisor dashboard and jurisdiction statistics",
        path: "/supervisor?tab=overview",
        icon: ConsoleGridIcon,
        keywords: ["overview", "dashboard", "stats"],
      },
      {
        id: "s-incidents",
        title: "District Incidents",
        desc: "District security incident reports, jurisdiction cases and disputes",
        path: "/supervisor?tab=incidents",
        icon: ConsoleAlertIcon,
        keywords: ["incidents", "district", "crimes", "cases", "disputes", "safety"],
      },
      {
        id: "s-workforce",
        title: "District Workforce",
        desc: "District workers directory, freelance & agency affiliations, employer assignments",
        path: "/supervisor?tab=workforce",
        icon: ConsoleUsersIcon,
        keywords: ["workers", "workforce", "district", "freelance", "company", "employers"],
      },
      {
        id: "s-profile",
        title: "Supervisor Settings",
        desc: "Assigned district jurisdiction and supervisor account profile",
        path: "/supervisor?tab=profile",
        icon: ConsoleSlidersIcon,
        keywords: ["profile", "settings", "district", "jurisdiction", "account"],
      },
    ],
  },
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  userRole = "employer",
  userId,
  onOpenAiChat,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [backendResults, setBackendResults] = useState<SearchItem[]>([]);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);

  // Strict role detection: URL route priority ensures 100% match with what user has on screen!
  const currentPath = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const roleFromPath =
    currentPath.includes("/admin") ? "admin" :
    currentPath.includes("/worker") ? "worker" :
    currentPath.includes("/company") ? "company" :
    currentPath.includes("/police") ? "police" :
    currentPath.includes("/supervisor") ? "supervisor" :
    currentPath.includes("/employer") ? "employer" : null;

  const normalizedRole = (roleFromPath || userRole || "employer").toLowerCase();
  const { language } = useLanguage();
  const isRw = language === "kin" || (language as string) === "rw";
  const searchPlaceholder = getRoleSearchPlaceholder(normalizedRole, isRw);

  // Storage key for session-based recent searches
  const storageKey = `ekaze_recent_searches_${userId || normalizedRole}`;

  // Read catalog strictly for this role
  const catalog = ROLE_SEARCH_CATALOG[normalizedRole] || ROLE_SEARCH_CATALOG.employer;

  // Initialize role-based recents from session/local storage
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: SearchItem) => {
            const found = catalog.allItems.find((c) => c.id === item.id);
            return {
              ...item,
              icon: found?.icon || ConsoleClockIcon,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Error reading recent searches:", e);
    }

    // No hardcoded items: start empty until user actually visits/searches resources
    return [];
  });

  // Reset search query when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setBackendResults([]);
    }
  }, [isOpen]);

  // Debounced Live Backend Database Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setBackendResults([]);
      setIsSearchingBackend(false);
      return;
    }

    setIsSearchingBackend(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/search", { params: { q } });
        if (res.data?.success && Array.isArray(res.data?.results)) {
          const mapped = res.data.results.map((r: any) => ({
            id: r.id,
            title: r.title,
            desc: r.desc,
            path: r.path,
            category: r.category || "Database Record",
            icon:
              r.type === "worker"
                ? ConsoleUserCheckIcon
                : r.type === "contract"
                ? ConsoleAgentIcon
                : r.type === "incident"
                ? ConsoleAlertIcon
                : ConsoleBillingIcon,
          }));
          setBackendResults(mapped);
        }
      } catch (err) {
        // Silently fallback to catalog on network error
      } finally {
        setIsSearchingBackend(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Persist recents to storage
  const saveRecentSearch = (item: SearchItem) => {
    try {
      const filtered = recentSearches.filter((r) => r.id !== item.id && r.title !== item.title);
      const updated = [{ ...item, icon: ConsoleClockIcon }, ...filtered].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(
        storageKey,
        JSON.stringify(updated.map(({ icon, ...rest }) => rest))
      );
    } catch (e) {}
  };

  const removeRecentSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r.id !== id);
    setRecentSearches(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated.map(({ icon, ...rest }) => rest)));
    } catch (e) {}
  };

  const clearAllRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const handleSelectItem = (item: SearchItem) => {
    saveRecentSearch(item);
    onClose();
    if (item.path) {
      navigate(item.path);
      const tabMatch = item.path.match(/tab=([a-zA-Z0-9_-]+)/);
      if (tabMatch && tabMatch[1]) {
        window.dispatchEvent(new CustomEvent("employer-navigate", { detail: tabMatch[1] }));
        window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: tabMatch[1] }));
        window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: tabMatch[1] }));
      }
    }
  };

  // Live matching filtered results strictly for this role
  const catalogResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return catalog.allItems.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.desc.toLowerCase().includes(q);
      const inKeywords = (item.keywords || []).some((kw) => kw.toLowerCase().includes(q));
      return inTitle || inDesc || inKeywords;
    });
  }, [searchQuery, catalog]);

  // Combined Results: Backend Database Records + Role Catalog Items (Deduplicated)
  const combinedResults = useMemo(() => {
    const map = new Map<string, SearchItem>();
    backendResults.forEach((b) => map.set(b.id, b));
    catalogResults.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, c);
      }
    });
    return Array.from(map.values());
  }, [backendResults, catalogResults]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && combinedResults.length > 0) {
      handleSelectItem(combinedResults[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="sm:max-w-2xl bg-white text-slate-900 border border-slate-200/90 rounded-2xl p-0 shadow-2xl z-[99999] overflow-hidden"
      >
        {/* Top Header: Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between h-10 px-4 rounded-xl border border-slate-300 bg-white focus-within:border-[#2478b8] focus-within:ring-2 focus-within:ring-[#2478b8]/20 transition-all shadow-2xs">
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-500 bg-transparent outline-none"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 shrink-0 pl-2 select-none">
              {isSearchingBackend ? (
                <Loader2 className="w-4 h-4 text-[#2478b8] animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-600 stroke-[2]" />
              )}
              <span>{isRw ? "Shakisha" : "Search"}</span>
            </div>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-5 space-y-6 bg-white overflow-y-auto max-h-[500px]">
          {searchQuery.trim().length > 0 ? (
            /* ── Search Results View (Filtered strictly for role & backend session) ── */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2478b8]" />
                  {isSearchingBackend ? "Searching resources..." : `Search results (${combinedResults.length})`}
                </h4>
                <span className="text-[11px] text-slate-400 capitalize">
                  {normalizedRole} portal
                </span>
              </div>

              {isSearchingBackend ? (
                <LoadingSpinner size="md" className="min-h-[160px] p-6" text="Searching your verified database..." />
              ) : combinedResults.length > 0 ? (
                <div className="rounded-xl border border-slate-200/90 divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
                  {combinedResults.map((item) => {
                    const IconComp = item.icon || ConsoleGridIcon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="flex items-start justify-between gap-3.5 p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <IconComp className="w-4 h-4 text-slate-500 group-hover:text-[#2478b8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#2478b8] group-hover:underline truncate">
                                {item.title}
                              </p>
                              {item.category && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <CornerDownLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2478b8] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 px-4 text-center space-y-3 bg-white">
                  <p className="text-xs text-slate-600">
                    No matching resources found for "<strong>{searchQuery}</strong>" in your{" "}
                    <span className="capitalize font-semibold">{normalizedRole}</span> account.
                  </p>
                  {onOpenAiChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAiChat(searchQuery);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2478b8] hover:underline cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Ask Ekaze AI about "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── Default View: Recents + Recommended (Matching Design 100%) ── */
            <>
              {/* Recently Visited */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-700">
                      Recently visited
                    </h4>
                    <button
                      type="button"
                      onClick={clearAllRecents}
                      className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Rounded Card Group with subtle divider */}
                  <div className="rounded-xl border border-slate-200/90 divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
                    {recentSearches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="flex items-start justify-between gap-3.5 p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <ConsoleClockIcon className="w-4 h-4 text-slate-400 group-hover:text-[#2478b8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2478b8] group-hover:underline truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, item.id)}
                          title="Remove from recents"
                          className="p-1 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Searches (Role-tailored) */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2478b8]" />
                  Recommended searches
                </h4>

                {/* Rounded Card Group */}
                <div className="rounded-xl border border-slate-200/90 divide-y divide-slate-100 bg-white overflow-hidden shadow-2xs">
                  {catalog.recommended.map((item) => {
                    const IconComp = item.icon || ConsoleSparkleIcon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="flex items-start gap-3.5 p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <IconComp className="w-4 h-4 text-slate-500 group-hover:text-[#2478b8] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2478b8] group-hover:underline truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default GlobalSearchModal;
