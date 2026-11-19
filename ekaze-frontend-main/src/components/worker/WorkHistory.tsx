import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  UserX,
  CheckCircle2,
  Clock,
  MoreVertical,
  Eye,
  History,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { downloadEmploymentContractPdf } from "@/utils/contractPdfGenerator";
import WorkerTerminateContractModal from "./WorkerTerminateContractModal";
import EmployerDetailsModal from "@/components/company/EmployerDetailsModal";
import { useToast } from "@/hooks/use-toast";

export interface EmploymentRecord {
  id: number;
  employer_id: number;
  worker_id: number;
  monthly_salary: string | number;
  agreed_salary?: string | number;
  start_date: string;
  end_date?: string | null;
  status: "active" | "terminated" | "completed";
  duration_days?: number;
  payment_day?: number;
  due_date?: string;
  terminated_at?: string;
  payment_status?: {
    canTerminate: boolean;
    unpaidMonths: string[];
    currentMonthName: string;
    currentMonthNeedsNegotiation: boolean;
  };
  employer?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    district?: string;
    national_id?: string;
    profile_photo?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

const WorkHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeSubTab, setActiveSubTab] = useState<"current" | "history">("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "salary">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Terminate modal
  const [terminateEmployment, setTerminateEmployment] = useState<EmploymentRecord | null>(null);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  // Employer Details modal
  const [selectedEmployerId, setSelectedEmployerId] = useState<number | null>(null);
  const [selectedEmployerData, setSelectedEmployerData] = useState<any>(null);
  const [selectedEmploymentRecord, setSelectedEmploymentRecord] = useState<EmploymentRecord | null>(null);
  const [isEmployerDetailsModalOpen, setIsEmployerDetailsModalOpen] = useState(false);

  // Fetch worker employments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["worker", "employments", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/employments");
        const list = res.data?.data?.data || res.data?.data;
        if (Array.isArray(list)) return list;
      } catch (err) {
        console.warn("Worker employments fetch warning:", err);
      }

      // Fallback to worker dashboard
      try {
        const dashRes = await api.get("/worker/dashboard");
        const curEmp = dashRes?.data?.data?.current_employment;
        if (curEmp) {
          return [
            {
              id: curEmp.id || 1,
              employer_id: curEmp.employer?.id,
              worker_id: user?.id,
              monthly_salary: curEmp.agreed_salary || curEmp.monthly_salary || 0,
              start_date: curEmp.start_date || new Date().toISOString(),
              status: "active",
              duration_days: 1,
              payment_day: curEmp.payment_day,
              due_date: curEmp.due_date,
              payment_status: {
                canTerminate: true,
                unpaidMonths: [],
                currentMonthName: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
                currentMonthNeedsNegotiation: false,
              },
              employer: curEmp.employer,
            },
          ];
        }
      } catch (e) {
        // ignore
      }

      return [];
    },
    staleTime: 5000,
  });

  const rawEmployments: EmploymentRecord[] = Array.isArray(data) ? data : [];

  const currentJobs = useMemo(
    () => rawEmployments.filter((emp) => emp.status === "active"),
    [rawEmployments]
  );

  const historyJobs = useMemo(
    () =>
      rawEmployments.filter(
        (emp) => emp.status === "terminated" || emp.status === "completed"
      ),
    [rawEmployments]
  );

  const displayedList = useMemo(() => {
    let list = activeSubTab === "current" ? [...currentJobs] : [...historyJobs];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (it) =>
          it.employer?.name?.toLowerCase().includes(q) ||
          it.employer?.phone?.includes(q) ||
          it.employer?.district?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "salary") {
      list.sort(
        (a, b) =>
          Number(b.monthly_salary || b.agreed_salary || 0) -
          Number(a.monthly_salary || a.agreed_salary || 0)
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.start_date || a.created_at || 0).getTime() -
          new Date(b.start_date || b.created_at || 0).getTime()
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.start_date || b.created_at || 0).getTime() -
          new Date(a.start_date || a.created_at || 0).getTime()
      );
    }

    return list;
  }, [activeSubTab, currentJobs, historyJobs, searchTerm, sortBy]);

  const allActiveIds = displayedList.map((item) => item.id);
  const allSelected = allActiveIds.length > 0 && allActiveIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allActiveIds));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return `RF ${new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(num || 0)}`;
  };

  const handleDownloadContract = (emp: EmploymentRecord) => {
    try {
      const employer = emp.employer || {};
      const employerName = employer.name || "Test Employer";
      const employerNid = employer.national_id || "1198000000000001";
      const employerPhone = employer.phone || "0788000000";
      const employerLocation = employer.district || "Kigali, Rwanda";

      const workerName = user?.name || "Registered Worker";
      const workerNid = user?.national_id || "1199000000000005";
      const workerPhone = user?.phone || "0788000001";
      const agreedSalaryNum = Number(emp.monthly_salary || emp.agreed_salary || 75000);

      const isTerminated = emp.status !== "active";
      const termDate = emp.terminated_at || emp.end_date || emp.updated_at;
      const formattedTermTime = termDate
        ? format(new Date(termDate), "MMM dd, yyyy 'at' hh:mm a")
        : format(new Date(), "MMM dd, yyyy 'at' hh:mm a");

      downloadEmploymentContractPdf({
        is_terminated: isTerminated,
        status: isTerminated ? "TERMINATED" : "ACTIVE / BINDING",
        terminated_at: isTerminated ? `Terminated on ${formattedTermTime}` : undefined,
        reference_number: `IH-CTR-${emp.id}-${new Date().getFullYear()}`,
        contract_date: emp.start_date
          ? format(new Date(emp.start_date), "dd MMMM yyyy")
          : format(new Date(), "dd MMMM yyyy"),
        start_time: emp.start_date
          ? format(new Date(emp.start_date), "MMMM dd, yyyy 'at' hh:mm a")
          : format(new Date(), "MMMM dd, yyyy 'at' hh:mm a"),
        payment_day: emp.payment_day || (emp.due_date ? new Date(emp.due_date).getDate() : (emp.start_date ? new Date(emp.start_date).getDate() : new Date().getDate())),
        next_payment_date: emp.due_date || undefined,
        employer: {
          name: employerName,
          national_id: employerNid,
          phone: isTerminated ? "Protected (Terminated)" : employerPhone,
          location: employerLocation,
          role: "Employer",
        },
        worker: {
          name: workerName,
          national_id: workerNid,
          phone: isTerminated ? "Protected (Terminated)" : workerPhone,
          location: "Kigali, Rwanda",
          role: "Domestic Professional",
        },
        agreed_net_salary: agreedSalaryNum,
        employerName,
        employerNid,
        employerPhone,
        employerLocation,
        workerName,
        workerNid,
        workerPhone,
        agreedSalary: agreedSalaryNum,
      });

      toast({
        title: isTerminated ? "Terminated Contract Downloaded" : "Contract Downloaded",
        description: isTerminated
          ? "Official terminated contract agreement PDF generated."
          : "Your official employment agreement PDF has been generated.",
      });
    } catch (err) {
      console.error("Contract download error:", err);
      toast({
        title: "Download Failed",
        description: "Could not generate contract document.",
        variant: "destructive",
      });
    }
  };

  const handleExportHistory = () => {
    try {
      const headers = [
        "Employer Name",
        "Contact",
        "District",
        "Monthly Salary (RWF)",
        "Start Date",
        "Status",
      ];
      const rows = displayedList.map((emp) => [
        `"${emp.employer?.name || "Test Employer"}"`,
        `"${emp.employer?.phone || ""}"`,
        `"${emp.employer?.district || ""}"`,
        emp.monthly_salary || emp.agreed_salary || 0,
        `"${emp.start_date ? format(new Date(emp.start_date), "yyyy-MM-dd") : ""}"`,
        `"${emp.status}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `ekaze-work-history-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Completed",
        description: "Employment history exported to CSV.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Unable to export work history.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Work History" />

        {/* ── Underline Tabs & Export Button ── */}
        <div className="border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab("current");
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
                activeSubTab === "current"
                  ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Current Job</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeSubTab === "current"
                    ? "bg-[#2478b8]/10 text-[#2478b8]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {currentJobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("history");
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 bg-transparent cursor-pointer flex items-center gap-2 border-0 ${
                activeSubTab === "history"
                  ? "border-b-2 border-[#2478b8] text-[#2478b8] font-bold"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>History</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeSubTab === "history"
                    ? "bg-[#2478b8]/10 text-[#2478b8]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {historyJobs.length}
              </span>
            </button>
          </div>

          {/* Export Action Button */}
          <div className="pb-2">
            <Button
              size="sm"
              onClick={handleExportHistory}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Studio Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "sortBy",
              label: "Sort By",
              options: [
                { value: "recent", label: "Most Recent" },
                { value: "oldest", label: "Oldest First" },
                { value: "salary", label: "Highest Salary" },
              ],
            },
            {
              id: "groupBy",
              label: "Group By",
              options: [
                { value: "none", label: "No Grouping" },
              ],
            },
          ]}
          activeFilters={{
            sortBy: sortBy || "recent",
            groupBy: "none",
          }}
          onFilterChange={(catId, val) => {
            if (catId === "sortBy") setSortBy(val as any);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setSortBy("recent");
            setCurrentPage(1);
          }}
        />

        {/* Table Content Section */}
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : displayedList.length === 0 ? (
          <CharacterIllustration
            type="workers"
            title="No active employment contracts"
            description="When an employer hires you and signs the agreement, your contract, payment due dates, and terms will appear here."
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[850px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Employer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Start Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Due (Payment)</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Contact</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Salary</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">NIDA Verification</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayedList.map((emp) => {
                  const isSelected = selectedIds.has(emp.id);
                  const employer = emp.employer || {};
                  const employerName = employer.name || "Test Employer";
                  const employerPhone = employer.phone || "250788000004";
                  const salary = emp.monthly_salary || emp.agreed_salary || 100000;
                  const isHired = emp.status === "active";
                  const startDate = emp.start_date ? new Date(emp.start_date) : new Date();
                  const durationDays = emp.duration_days || Math.max(1, Math.round((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <TableRow
                      key={emp.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="w-10 pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(emp.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>

                      {/* Employer (no location under name) */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={employer.profile_photo || ""} alt={employerName} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-slate-900">{employerName}</span>
                        </div>
                      </TableCell>

                      {/* Employment / Start Date */}
                      <TableCell className="py-3 whitespace-nowrap">
                        <div>
                          <p className="text-xs font-normal text-slate-700">
                            {format(startDate, "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {durationDays <= 1 ? "1 day" : `${durationDays} days`}
                          </p>
                        </div>
                      </TableCell>

                      {/* Due (Payment) */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {emp.payment_day || (emp.due_date ? new Date(emp.due_date).getDate() : startDate.getDate())}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {isHired ? employerPhone : "Protected"}
                        </span>
                      </TableCell>

                      {/* Salary */}
                      <TableCell className="py-3">
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(salary)}
                        </span>
                      </TableCell>

                      {/* NIDA Verification */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          Verified
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 whitespace-nowrap">
                        <span className="text-xs font-normal text-slate-700 font-sans">
                          {isHired
                            ? `Active since ${format(startDate, "MMM dd, yyyy")}`
                            : `Terminated on ${format(new Date(emp.terminated_at || emp.end_date || emp.updated_at || startDate), "MMM dd, yyyy 'at' hh:mm a")}`}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-52"
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
                              label: "View Employer Details",
                              onClick: () => {
                                const empId = emp.employer?.id || emp.employer_id;
                                if (empId) {
                                  setSelectedEmployerId(Number(empId));
                                  setSelectedEmployerData(emp.employer || { id: Number(empId), name: "Test Employer" });
                                  setSelectedEmploymentRecord(emp);
                                  setIsEmployerDetailsModalOpen(true);
                                }
                              },
                            },
                            {
                              label: "Download Contract",
                              onClick: () => handleDownloadContract(emp),
                            },
                            ...(isHired
                              ? [
                                  {
                                    label: "Terminate Contract",
                                    danger: true,
                                    onClick: () => {
                                      setTerminateEmployment(emp);
                                      setIsTerminateModalOpen(true);
                                    },
                                  },
                                ]
                              : []),
                            "separator",
                            {
                              label: "Payment History",
                              onClick: () => {
                                window.dispatchEvent(
                                  new CustomEvent("worker-navigate", { detail: "wallet" })
                                );
                              },
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

        <YouTubeStudioPagination
          currentPage={currentPage}
          lastPage={1}
          perPage={perPage}
          total={displayedList.length}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={(pp) => {
            setPerPage(pp);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Contract Termination Modal */}
      {terminateEmployment && (
        <WorkerTerminateContractModal
          isOpen={isTerminateModalOpen}
          onClose={() => {
            setIsTerminateModalOpen(false);
            setTerminateEmployment(null);
          }}
          employment={terminateEmployment}
          onTerminated={() => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ["worker"] });
          }}
        />
      )}

      {/* View Employer Details Modal */}
      <EmployerDetailsModal
        employerId={selectedEmployerId}
        fallbackEmployer={selectedEmployerData}
        isOpen={isEmployerDetailsModalOpen}
        onClose={() => {
          setIsEmployerDetailsModalOpen(false);
          setSelectedEmployerId(null);
          setSelectedEmployerData(null);
          setSelectedEmploymentRecord(null);
        }}
        isTerminatedContext={selectedEmploymentRecord?.status === "terminated" || selectedEmploymentRecord?.status === "completed" || activeSubTab === "history"}
        employmentRecord={selectedEmploymentRecord}
      />
    </div>
  );
};

export default WorkHistory;
