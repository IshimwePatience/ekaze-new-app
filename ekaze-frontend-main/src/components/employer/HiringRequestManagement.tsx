import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  Eye,
  XCircle,
  Building2,
  Star,
  MoreVertical,
} from "lucide-react";
import { useEmployerHiringRequests, useCancelHiringRequest } from "@/hooks/useEmployerHiringRequests";
import { format } from "date-fns";
import { toast } from "sonner";
import HiringRequestDetailsModal from "./HiringRequestDetailsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";

const HiringRequestManagement = () => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedReqIds, setSelectedReqIds] = useState<number[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);

  const { data, isLoading } = useEmployerHiringRequests({
    status: statusFilter as any,
    page: currentPage,
    per_page: perPage,
    ...(searchTerm && { search: searchTerm }),
  });

  const cancelMutation = useCancelHiringRequest();

  const requests = data?.data?.data || [];
  const pagination = data?.data ? {
    current_page: data.data.current_page,
    last_page: data.data.last_page,
    per_page: data.data.per_page,
    total: data.data.total,
  } : null;

  const handleCancelRequest = async () => {
    if (!cancelRequestId) return;

    try {
      await cancelMutation.mutateAsync(cancelRequestId);
      toast.success(t("employer.hiringRequestManagement.cancelledSuccess"));
      setCancelRequestId(null);
    } catch (error) {
      toast.error(t("employer.hiringRequestManagement.cancelFailed"));
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t("employer.hiringRequestManagement.pending"),
      accepted: t("employer.hiringRequestManagement.accepted"),
      rejected: t("employer.hiringRequestManagement.rejected"),
      cancelled: t("employer.hiringRequestManagement.cancelled"),
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number | string | null): string => {
    if (amount === null || amount === undefined) return t("employer.hiringRequestManagement.notSpecified");
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReqIds(requests.map((r) => r.id));
    } else {
      setSelectedReqIds([]);
    }
  };

  const handleToggleSelectReq = (id: number) => {
    setSelectedReqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb title={t("employer.hiringRequestManagement.title")} />
      </div>

      {/* Main Studio Styled Content Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "accepted", label: "Accepted" },
                { value: "rejected", label: "Rejected" },
                { value: "cancelled", label: "Cancelled" },
              ],
            },
          ]}
          activeFilters={{
            status: statusFilter,
          }}
          onFilterChange={(catId, val) => {
            if (catId === "status") setStatusFilter(val);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          onClearAll={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        />

        {/* Table Content Section */}
        {isLoading ? (
          <div className="py-6 space-y-3">
            <Skeleton className="h-9 w-full rounded-none" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <CharacterIllustration
            type="workforce"
            title={t("employer.hiringRequestManagement.noRequestsFound")}
            description={
              searchTerm || statusFilter !== "all"
                ? "No hiring requests match your filter criteria."
                : "No hiring requests sent yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-transparent border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="w-10 pl-2">
                    <Checkbox
                      checked={requests.length > 0 && selectedReqIds.length === requests.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-slate-400 rounded-sm"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Worker</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">Company</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Proposed Salary</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const isSelected = selectedReqIds.includes(request.id);
                  return (
                    <TableRow
                      key={request.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <TableCell className="pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelectReq(request.id)}
                          className="border-slate-400 rounded-sm"
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            <AvatarImage src={request.worker.profile_photo || undefined} />
                            <AvatarFallback className="p-0 bg-transparent border-none">
                              <DefaultAvatarSVG className="w-full h-full" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {request.worker.full_name}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-[11px] text-slate-500 font-medium">
                                {typeof request.worker.average_rating === 'string' 
                                  ? parseFloat(request.worker.average_rating).toFixed(1)
                                  : request.worker.average_rating.toFixed(1)
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{request.company.business_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold text-slate-900">
                          {formatCurrency(request.proposed_salary)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          {getStatusText(request.status)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3">
                        <span className="text-xs font-normal text-slate-700">
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-2 py-3">
                        <CustomDropdown
                          widthClass="w-48"
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
                              label: "View Request Details",
                              onClick: () => {
                                setSelectedRequestId(request.id);
                                setIsDetailsModalOpen(true);
                              },
                            },
                            ...(request.status === 'pending'
                              ? [
                                  {
                                    label: "Cancel Request",
                                    danger: true,
                                    onClick: () => setCancelRequestId(request.id),
                                  },
                                ]
                              : []),
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

        {pagination && (
          <YouTubeStudioPagination
            currentPage={pagination.current_page}
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

      <HiringRequestDetailsModal
        requestId={selectedRequestId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AlertDialog open={!!cancelRequestId} onOpenChange={() => setCancelRequestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("employer.hiringRequestManagement.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("employer.hiringRequestManagement.cancelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("employer.hiringRequestManagement.cancelNo")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("employer.hiringRequestManagement.cancelYes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HiringRequestManagement;