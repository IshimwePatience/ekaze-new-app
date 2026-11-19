import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Eye,
  CheckCircle2,
  Building2,
  Briefcase,
  HardHat,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck,
  ChevronDown,
  X,
  ShieldCheck,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import api from "@/lib/api";

interface CompanyInfo {
  id: number;
  name: string;
  registration_number?: string;
  tin_number?: string;
  phone?: string;
  contact_person?: string;
}

interface AssignedEmployer {
  id: number;
  status: string;
  monthly_salary: string | number;
  start_date: string;
  employer_name: string;
  employer_phone: string;
  employer_type: string;
}

interface DistrictWorker {
  id: number;
  worker_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  profile_photo: string | null;
  gender: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  skills: string[];
  professions: string[];
  experience_years: number;
  availability_status: string;
  user_status: string;
  is_verified: boolean;
  is_freelance: boolean;
  employment_type: 'freelance' | 'company';
  contract_status?: string;
  company: CompanyInfo | null;
  assigned_employers: AssignedEmployer[];
}

export const DistrictWorkforce = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'freelance', 'company'
  const [workerTab, setWorkerTab] = useState<"hired" | "terminated">("hired");
  const [tabCounts, setTabCounts] = useState({ hired: 0, terminated: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<DistrictWorker | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [workers, setWorkers] = useState<DistrictWorker[]>([]);
  const [districtName, setDistrictName] = useState("Gasabo");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 20,
    last_page: 1,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    let isCurrent = true;

    const loadWorkers = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", perPage.toString());
        params.append("tab", workerTab);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (typeFilter !== "all") params.append("employment_type", typeFilter);

        const res = await api.get(`/supervisor/workers?${params.toString()}`);
        if (isCurrent && res.data?.success) {
          // Guard against stale response from another tab
          if (!res.data.active_tab || res.data.active_tab === workerTab) {
            setWorkers(res.data.data || []);
          }
          if (res.data.district) setDistrictName(res.data.district);
          if (res.data.counts) setTabCounts(res.data.counts);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      } catch (err) {
        if (isCurrent) console.error("Failed to load district workers:", err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadWorkers();

    return () => {
      isCurrent = false;
    };
  }, [searchTerm, typeFilter, currentPage, perPage, workerTab]);

  const handleTabChange = (tab: "hired" | "terminated") => {
    if (tab === workerTab) return;
    setWorkerTab(tab);
    setCurrentPage(1);
    setSelectedWorkerIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkerIds(workers.map((w) => w.id));
    } else {
      setSelectedWorkerIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleViewWorker = (worker: DistrictWorker) => {
    setSelectedWorker(worker);
    setIsDetailsOpen(true);
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-0 px-0">
        <PageHeaderBreadcrumb title={`District Workforce Directory (${districtName} District)`} />

        {/* ── Underline Tabs (Matching ActiveWorkers Style) ── */}
        <div className="border-b border-slate-200 flex items-center gap-8">
          <button
            type="button"
            onClick={() => handleTabChange("hired")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
              workerTab === "hired"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Currently Hired</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                workerTab === "hired"
                  ? "bg-[#2478b8]/10 text-[#2478b8]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tabCounts.hired}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("terminated")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
              workerTab === "terminated"
                ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Contract Terminated</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                workerTab === "terminated"
                  ? "bg-[#2478b8]/10 text-[#2478b8]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tabCounts.terminated}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Styled Table & Filters */}
      <div className="w-full bg-white">
        {selectedWorkerIds.length === 0 ? (
          <StudioFilterBar
            categories={[
              {
                id: "type",
                label: "Employment Type",
                options: [
                  { value: "all", label: "All Types" },
                  { value: "freelance", label: "Freelance Workers" },
                  { value: "company", label: "Company / Agency Workers" },
                ],
              },
            ]}
            activeFilters={{
              type: typeFilter,
            }}
            onFilterChange={(catId, val) => {
              if (catId === "type") setTypeFilter(val);
              setCurrentPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setCurrentPage(1);
            }}
          />
        ) : (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedWorkerIds([])}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold">
                {selectedWorkerIds.length} selected
              </span>
              <button
                onClick={() => handleSelectAll(selectedWorkerIds.length < workers.length)}
                className="text-xs text-[#38BDF8] hover:underline font-medium ml-1"
              >
                ({selectedWorkerIds.length === workers.length ? "Deselect all" : "Select all"})
              </button>
            </div>
            <div className="text-xs text-slate-300">
              {workerTab === "hired" ? "Currently Hired" : "Contract Terminated"} District Workforce ({districtName})
            </div>
          </div>
        )}

        {/* Table Content Section */}
        {isLoading ? (
          <div className="py-6 space-y-3 px-4">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <CharacterIllustration
            type="users"
            title={workerTab === "hired" ? "No hired district workers found" : "No contract-terminated workers found"}
            description={
              searchTerm || typeFilter !== "all"
                ? `No ${workerTab === "hired" ? "currently hired" : "contract-terminated"} workforce records match your active search filters.`
                : `No ${workerTab === "hired" ? "currently hired" : "contract-terminated"} workers registered under ${districtName} district yet.`
            }
            action={
              (searchTerm || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9 cursor-pointer"
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[780px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-3">
                    <Checkbox
                      checked={workers.length > 0 && selectedWorkerIds.length === workers.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">Worker Profile</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">National ID / Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">Employment Model</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">Assigned Employer(s)</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans">Location</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => {
                  const isSelected = selectedWorkerIds.includes(worker.id);
                  return (
                    <TableRow
                      key={worker.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(worker.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>

                      {/* Worker Profile Info - Horizontal */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-slate-200 shrink-0">
                            <AvatarImage src={worker.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs font-sans text-slate-800">
                            <span className="font-semibold text-slate-900">{worker.name}</span>
                            {worker.skills?.length > 0 && (
                              <span className="text-slate-500">
                                {", "}
                                {worker.skills.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* National ID & Phone - Horizontal */}
                      <TableCell className="py-3">
                        <div className="text-xs font-sans text-slate-700">
                          <span className="font-semibold text-slate-900">{worker.phone}</span>
                          {worker.national_id && (
                            <span className="text-slate-600">
                              {", "}
                              {worker.national_id}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Employment Model - Gray & Horizontal */}
                      <TableCell className="py-3">
                        {worker.is_freelance || !worker.company ? (
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Freelance
                          </span>
                        ) : (
                          <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {worker.company.name}
                            {worker.company.phone ? `, ${worker.company.phone}` : ""}
                          </span>
                        )}
                      </TableCell>

                      {/* Assigned Employers - Gray & Horizontal */}
                      <TableCell className="py-3">
                        <div className="text-xs text-slate-700 font-sans">
                          {worker.assigned_employers && worker.assigned_employers.length > 0 ? (
                            <span>
                              {worker.assigned_employers.map((emp) =>
                                emp.employer_phone
                                  ? `${emp.employer_name}, ${emp.employer_phone}`
                                  : emp.employer_name
                              ).join(", ")}
                            </span>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Location - Horizontal with comma */}
                      <TableCell className="py-3">
                        <div className="text-xs text-slate-700 font-sans">
                          <span>{worker.district}{worker.sector ? `, ${worker.sector}` : ""}</span>
                        </div>
                      </TableCell>

                      {/* Actions with CustomDropdown and MoreVertical */}
                      <TableCell className="py-3 text-right pr-4">
                        <CustomDropdown
                          widthClass="w-40"
                          align="end"
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            {
                              label: "View Details",
                              onClick: () => handleViewWorker(worker),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* YouTube Studio Styled Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-end gap-6 px-4 py-2.5 border-t border-slate-200 bg-white text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select value={perPage.toString()} onValueChange={(val) => { setPerPage(Number(val)); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 border-none bg-transparent shadow-none text-xs font-semibold focus:ring-0 px-1 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200">
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="20" className="text-xs">20</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              {pagination.from}–{pagination.to} of {pagination.total}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                title="First page"
              >
                ‹‹
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Previous page"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={currentPage === pagination.last_page}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Next page"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(pagination.last_page)}
                disabled={currentPage === pagination.last_page}
                className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Last page"
              >
                ››
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident-styled Worker Details Modal matching User Screenshot */}
      {isDetailsOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[480px] bg-white text-[#3c4043] rounded-[28px] p-6 tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
            
            {/* Top Header Bar: Drag handle on left + Close on right */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
                <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
              </div>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Main Title Line (Monospace reference with blue underline) */}
            <div className="pt-1 pb-3 shrink-0">
              <div className="w-full bg-transparent text-[22px] font-normal font-mono tracking-wide text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8] truncate">
                {selectedWorker.national_id || `WRK-${selectedWorker.id}`}
              </div>
            </div>

            {/* Category & Status Pills */}
            <div className="flex items-center gap-2 pt-1 pb-4 text-[13px] font-medium flex-wrap shrink-0">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#c2e7ff] text-[#001d35] font-semibold text-xs">
                {selectedWorker.is_freelance || !selectedWorker.company ? "Freelance" : selectedWorker.company.name}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium">
                {selectedWorker.skills?.[0] || "General Skilled"}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium">
                {selectedWorker.contract_status === "terminated" || selectedWorker.availability_status === "terminated"
                  ? "Terminated"
                  : "Currently Hired"}
              </span>
            </div>

            {/* Numbered Steps */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs text-[#444746]">
              {/* 1. Worker Identity */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {selectedWorker.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedWorker.phone}
                  </p>
                  {selectedWorker.email && selectedWorker.email !== 'N/A' && (
                    <p className="text-[11px] text-slate-400">{selectedWorker.email}</p>
                  )}
                  {selectedWorker.skills?.length > 0 && (
                    <p className="text-[11px] text-slate-500 pt-0.5">
                      Skills: {selectedWorker.skills.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Assigned Employer(s) */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    Assigned Employer & Contract
                  </p>
                  {selectedWorker.assigned_employers && selectedWorker.assigned_employers.length > 0 ? (
                    selectedWorker.assigned_employers.map((emp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-xs text-slate-800 font-medium">{emp.employer_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{emp.employer_phone}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Active placement in {selectedWorker.district}</p>
                  )}
                </div>
              </div>

              {/* 3. Description / Placement Details */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Employment Affiliation</p>
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {selectedWorker.is_freelance || !selectedWorker.company ? (
                      <p>
                        Independent Freelance Worker registered and approved for domestic service in {selectedWorker.district} district.
                      </p>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-900">{selectedWorker.company.name}</p>
                        <p className="text-slate-600 mt-0.5">Agency Contact: {selectedWorker.company.phone || "N/A"}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          TIN / Registration: {selectedWorker.company.registration_number || selectedWorker.company.tin_number || "Verified Agency"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. District Location & Jurisdiction */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    District Location & Jurisdiction
                  </p>
                  <p className="text-xs text-slate-700">
                    {selectedWorker.district}, {selectedWorker.sector}
                  </p>
                  {(selectedWorker.cell || selectedWorker.village) && (
                    <p className="text-[11px] text-slate-500">
                      Cell: {selectedWorker.cell || "Central"}, Village: {selectedWorker.village || "Central"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Cancel Button */}
            <div className="pt-4 flex items-center justify-end shrink-0 border-t border-slate-100 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDetailsOpen(false)}
                className="text-xs text-[#2478b8] hover:bg-slate-100 rounded-full font-semibold px-4 cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
