import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface EmploymentRecord {
  id: number | string;
  employer_id?: number;
  company_id?: number;
  worker_id?: number;
  monthly_salary?: string | number;
  agreed_salary?: string | number;
  start_date: string;
  end_date?: string | null;
  status?: string;
  duration_days?: number;
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

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Fetch worker company / employment
  const { data, isLoading } = useQuery({
    queryKey: ["worker", "employments", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/worker/employments");
        const list = res.data?.data?.data || res.data?.data;
        if (Array.isArray(list) && list.length > 0) return list;
      } catch (err) {
        console.warn("Worker employments fetch warning:", err);
      }

      // Check worker profile for assigned company
      try {
        const profRes = await api.get("/worker/profile");
        const prof = profRes.data?.data || profRes.data;
        if (prof?.company) {
          const isSusp = Boolean(prof.is_suspended || prof.status === "suspended" || user?.status === "suspended");
          return [
            {
              id: `company-${prof.company.id}`,
              is_company: true,
              company_id: prof.company.id,
              worker_id: prof.id,
              start_date: prof.created_at || new Date().toISOString(),
              end_date: isSusp ? (prof.suspended_at || new Date().toISOString()) : null,
              status: isSusp ? "terminated" : "active",
              duration_days: Math.max(1, Math.round((Date.now() - new Date(prof.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))),
              employer: {
                id: prof.company.id,
                name: prof.company.company_name || "Partner Company",
                phone: prof.company.contact_phone || prof.company.phone || "—",
                email: prof.company.contact_email || prof.company.email || "—",
                district: prof.company.district || "Kigali",
                profile_photo: prof.company.logo || null,
              },
            },
          ];
        }
      } catch (e) {
        // ignore
      }

      // Fallback to worker dashboard
      try {
        const dashRes = await api.get("/worker/dashboard");
        const curEmp = dashRes?.data?.data?.current_employment;
        if (curEmp) {
          return [
            {
              id: curEmp.id || 1,
              start_date: curEmp.start_date || new Date().toISOString(),
              status: "active",
              duration_days: 1,
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

  const displayedList = useMemo(() => {
    let list = [...rawEmployments];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (it) =>
          it.employer?.name?.toLowerCase().includes(q) ||
          it.employer?.phone?.includes(q) ||
          it.employer?.email?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "oldest") {
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
  }, [rawEmployments, searchTerm, sortBy]);

  const handleExport = () => {
    try {
      const headers = ["Company", "Company Contact", "Company Email", "Start Date"];
      const rows = displayedList.map((emp) => [
        `"${emp.employer?.name || "Company"}"`,
        `"${emp.employer?.phone || "—"}"`,
        `"${emp.employer?.email || "—"}"`,
        `"${emp.start_date ? format(new Date(emp.start_date), "yyyy-MM-dd HH:mm") : "—"}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `ekaze-company-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Completed",
        description: "Company details exported to CSV.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Unable to export.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title="Work History" />

        <div className="border-b border-slate-200 pb-3 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-800">
            Company Information
          </div>

          {/* Export Action Button */}
          <div>
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full bg-white">
        <StudioFilterBar
          categories={[
            {
              id: "sortBy",
              label: "Sort By",
              options: [
                { value: "recent", label: "Most Recent" },
                { value: "oldest", label: "Oldest First" },
              ],
            },
            {
              id: "groupBy",
              label: "Group By",
              options: [{ value: "none", label: "No Grouping" }],
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
            title="No company assignment found"
            description="When a company assigns you, company details, contact, and start date will appear here."
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[700px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-600 pl-4">Company</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Company Contact</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Company Email</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Start Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayedList.map((emp) => {
                  const employer = emp.employer || ({} as any);
                  const companyName = employer.name || employer.company_name || "Company";
                  const companyPhone = employer.phone || employer.contact_phone || "—";
                  const companyEmail = employer.email || employer.contact_email || "—";
                  const companyLogo = employer.profile_photo || employer.logo || null;
                  const startDate = emp.start_date ? new Date(emp.start_date) : new Date();
                  const durationDays = emp.duration_days || Math.max(1, Math.round((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <TableRow
                      key={emp.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {/* Company Name & Logo */}
                      <TableCell className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={companyLogo || ""} alt={companyName} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-slate-900">{companyName}</span>
                        </div>
                      </TableCell>

                      {/* Company Contact */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {companyPhone}
                        </span>
                      </TableCell>

                      {/* Company Email */}
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {companyEmail}
                        </span>
                      </TableCell>

                      {/* Start Date */}
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
    </div>
  );
};

export default WorkHistory;
