import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, Star, Clock } from "lucide-react";
import { useEmployerWorkers } from "@/hooks/useEmployers";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";

interface EmployerWorkersTableProps {
  employerId: number | null;
}

const EmployerWorkersTable = ({ employerId }: EmployerWorkersTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "terminated">("active");

  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
    per_page: perPage,
  };

  const { data, isLoading, isError } = useEmployerWorkers(employerId, currentPage, filters);

  const workers = data?.data?.data || [];
  const pagination = data?.data;

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">Failed to load workers</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "completed", "terminated"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className="h-9 text-xs"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Workers Table */}
      <div className="overflow-x-auto border-t border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Worker
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Salary
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Subscription
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Rating
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Start Date
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-900 font-sans">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">No workers found</p>
                </td>
              </tr>
            ) : (
              workers.map((employment) => (
                <tr
                  key={employment.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-slate-200">
                        <AvatarImage src={employment.worker?.user?.profile_photo || undefined} />
                        <AvatarFallback className="text-xs bg-slate-100 text-slate-700 font-semibold">
                          {employment.worker?.first_name?.[0]}
                          {employment.worker?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 font-sans">
                          {employment.worker?.first_name} {employment.worker?.last_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {employment.worker?.experience_level}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-semibold text-slate-900 font-sans">
                      {formatCurrency(employment.agreed_salary)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-semibold text-slate-900 font-sans">
                      {formatCurrency(employment.subscription_fee)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-900 font-sans">
                        {parseFloat(employment.worker?.average_rating || "0").toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({employment.worker?.total_ratings})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs font-normal text-slate-700 font-sans">
                      {format(new Date(employment.start_date || employment.created_at || Date.now()), "MMM dd, yyyy 'at' hh:mm a")}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs font-normal text-slate-700 font-sans">
                      {employment.status === 'terminated'
                        ? `Terminated on ${format(new Date(employment.end_date || employment.updated_at || Date.now()), "MMM dd, yyyy 'at' hh:mm a")}`
                        : employment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <YouTubeStudioPagination
          currentPage={currentPage}
          lastPage={pagination.last_page}
          perPage={perPage}
          total={pagination.total}
          onPageChange={(page) => setCurrentPage(page)}
          onPerPageChange={(val) => {
            setPerPage(val);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};

export default EmployerWorkersTable;