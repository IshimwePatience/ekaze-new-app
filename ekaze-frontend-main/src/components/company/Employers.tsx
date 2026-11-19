import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { useEmployers, useEmployerWorkers } from "@/hooks/useEmployers";
import { format } from "date-fns";
import EmployerDetailsModal from "./EmployerDetailsModal";
import type { EmployerItem } from "@/types/employer.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

const formatCurrency = (amount: string | number | undefined | null): string => {
  if (!amount) return "0 RWF";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 RWF";
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(num);
};

const Employers = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [searchTerm, setSearchTerm] = useState("");
  // Drill-down into employer hired workers
  const [selectedEmployerForDrilldown, setSelectedEmployerForDrilldown] = useState<EmployerItem | null>(null);

  // Modal for full profile
  const [selectedEmployerId, setSelectedEmployerId] = useState<number | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const filters = {
    search: searchTerm || undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError } = useEmployers(currentPage, filters);

  const rawEmployers: EmployerItem[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? (data.data as unknown as EmployerItem[])
    : [];

  const paginationData = data?.data;
  const pagination = paginationData && typeof paginationData === "object" && "total" in paginationData
    ? {
        current_page: paginationData.current_page || currentPage,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || perPage,
        total: paginationData.total ?? rawEmployers.length,
      }
    : {
        current_page: currentPage,
        last_page: 1,
        per_page: perPage,
        total: rawEmployers.length,
      };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (val: string) => {
    setPerPage(parseInt(val));
    setCurrentPage(1);
  };

  const handleViewDetailsModal = (employer: EmployerItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedEmployerId(employer.id);
    setSelectedEmployer(employer);
    setDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailsModalOpen(false);
    setSelectedEmployerId(null);
    setSelectedEmployer(null);
  };

  // ── Workers Drilldown Sub-Component ─────────────────────────────────
  const EmployerHiredWorkersView = ({ employer }: { employer: EmployerItem }) => {
    const [workersPage, setWorkersPage] = useState(1);
    const [workersPerPage, setWorkersPerPage] = useState(20);
    const { data: workersData, isLoading: workersLoading, isError: workersError } = useEmployerWorkers(
      employer.id,
      workersPage,
      { per_page: workersPerPage }
    );

    const employments = workersData?.data?.data || [];
    const paginationData = workersData?.data;
    const pagination = paginationData && typeof paginationData === "object" && "total" in paginationData
      ? {
          current_page: paginationData.current_page || workersPage,
          last_page: paginationData.last_page || 1,
          per_page: paginationData.per_page || workersPerPage,
          total: paginationData.total ?? employments.length,
        }
      : null;

    return (
      <div className="w-full bg-white border-t border-slate-200">
        {/* Loading Skeleton */}
        {workersLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : workersError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">Failed to load hired workers</h3>
            <p className="text-xs text-slate-500 mt-1">Please try refreshing the page.</p>
          </div>
        ) : employments.length === 0 ? (
          <CharacterIllustration
            type="users"
            title="No hired workers found"
            description="This employer currently has no recorded worker contracts under your company."
          />
        ) : (
          /* Normal Table matching Registered Workers / YouTube Studio style */
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pl-4">
                    Worker
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Specialization
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Agreed Salary
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Hired Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pr-4 text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employments.map((emp: any) => {
                  const workerName =
                    emp.worker?.user?.name ||
                    [emp.worker?.user?.first_name, emp.worker?.user?.last_name].filter(Boolean).join(" ").trim() ||
                    [emp.worker?.first_name, emp.worker?.last_name].filter(Boolean).join(" ").trim() ||
                    emp.worker?.name ||
                    "Worker";
                  const workerEmail = emp.worker?.user?.email || emp.worker?.email || "—";
                  const workerPhone = emp.worker?.user?.phone || emp.worker?.phone || "—";
                  const agreedSalary = emp.agreed_salary || emp.monthly_salary || 120000;
                  const role = emp.worker?.workTypes?.[0] || emp.worker?.experience_level || "Domestic Professional";

                  return (
                    <TableRow
                      key={emp.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={emp.worker?.user?.profile_photo || emp.worker?.photo} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">{workerName}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-600">
                        {workerEmail}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-700">
                        {workerPhone}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-600 capitalize">
                        {role}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">
                        {formatCurrency(agreedSalary)} / mo
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-600">
                        {emp.start_date ? format(new Date(emp.start_date), "MMM dd, yyyy") : "—"}
                      </TableCell>

                      <TableCell className="py-3 pr-4 text-right">
                        <span className="text-xs font-medium text-slate-700 capitalize font-sans">
                          {emp.status || "active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination matching YouTube Studio style */}
        {pagination && pagination.total > 0 && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={workersPerPage}
            total={pagination.total}
            onPageChange={(page) => setWorkersPage(page)}
            onPerPageChange={(val) => {
              setWorkersPerPage(parseInt(val.toString()));
              setWorkersPage(1);
            }}
          />
        )}
      </div>
    );
  };

  // If viewing a specific employer's hired workers
  if (selectedEmployerForDrilldown) {
    const employerName = selectedEmployerForDrilldown.user?.name || "Employer";
    return (
      <div className="w-full bg-white space-y-0">
        <div className="pt-1 pb-2 px-0">
          <PageHeaderBreadcrumb
            title={employerName}
            items={[
              {
                label: t("company.employers.title") || "Client Employers",
                onClick: () => setSelectedEmployerForDrilldown(null),
              },
            ]}
          >
            <button
              type="button"
              onClick={(e) => handleViewDetailsModal(selectedEmployerForDrilldown, e)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer bg-transparent border-none p-0 transition-colors"
            >
              View Employer Profile
            </button>
          </PageHeaderBreadcrumb>
        </div>

        <EmployerHiredWorkersView employer={selectedEmployerForDrilldown} />

        <EmployerDetailsModal
          employerId={selectedEmployerId}
          fallbackEmployer={selectedEmployer}
          isOpen={detailsModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    );
  }

  // ── Main Employers View (Grid of Cards like Find Workers) ───
  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("company.employers.title") || "Client Employers"} />
      </div>

      {/* Main Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        {/* Studio Filter Bar */}
        <StudioFilterBar
          categories={[]}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setCurrentPage(1);
          }}
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t("company.employers.loadError") || "Error loading employers"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please try refreshing the page.
            </p>
          </div>
        ) : rawEmployers.length === 0 ? (
          <CharacterIllustration
            type="users"
            title="No client employers found"
            description={
              searchTerm
                ? "No employers match your search criteria."
                : "No client employers who hired company workers have been recorded yet."
            }
            action={
              searchTerm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border-slate-300 font-medium text-xs h-9 cursor-pointer"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          /* Client Employers Table matching Registered Workers / YouTube Studio style */
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[800px] border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pl-4">
                    Employer
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Location
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">
                    Hired Workers
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 pr-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawEmployers.map((employer) => {
                  const employerName = employer.user?.name || "Employer";
                  const locationText = [employer.user?.district, employer.user?.sector].filter(Boolean).join(", ") || "Kicukiro";
                  const phoneText = employer.user?.phone || "—";
                  const emailText = employer.user?.email || "—";
                  const activeWorkersCount = employer.active_workers ?? employer.total_workers_hired ?? 0;

                  return (
                    <TableRow
                      key={employer.id}
                      onClick={() => setSelectedEmployerForDrilldown(employer)}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <TableCell className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarImage src={employer.user?.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 font-sans">
                              {employerName}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-600 truncate max-w-[200px]">
                        {emailText}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-700">
                        {phoneText}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-sans text-slate-600 capitalize">
                        {locationText}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-medium text-slate-700 font-sans">
                        {activeWorkersCount} {activeWorkersCount === 1 ? "Worker" : "Workers"}
                      </TableCell>

                      <TableCell className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <CustomDropdown
                            widthClass="w-40"
                            align="end"
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Actions"
                                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                            items={[
                              {
                                label: "Hired Workers",
                                onClick: () => setSelectedEmployerForDrilldown(employer),
                              },
                              {
                                label: "View Profile",
                                onClick: () => handleViewDetailsModal(employer),
                              },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination matching Registered Workers & User Management */}
        {pagination && pagination.total > 0 && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPerPageChange={(val) => handlePerPageChange(val.toString())}
          />
        )}
      </div>

      {/* Details Modal */}
      <EmployerDetailsModal
        employerId={selectedEmployerId}
        fallbackEmployer={selectedEmployer}
        isOpen={detailsModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Employers;