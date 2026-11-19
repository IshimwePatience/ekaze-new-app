import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Calendar,
  CreditCardIcon,
  Building,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useWorkerEmployments } from "@/hooks/useWorkerOwner";
import { format } from "date-fns";

const WorkerEmployments = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useWorkerEmployments(
    currentPage,
    activeTab === "all" ? undefined : activeTab
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "active" | "completed");
    setCurrentPage(1);
  };

  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      terminated: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm text-destructive">
                  Failed to load employment history
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please try refreshing the page or contact support if the issue persists.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employments = data.data.data;
  const pagination = data.data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Employment History
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Track all your past and current employment records
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-border/40 shadow-sm" style={{ borderRadius: '10px' }}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <CardHeader className="pb-0 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="all" className="text-[10px]">
                  All Employments
                </TabsTrigger>
                <TabsTrigger value="active" className="text-[10px]">
                  <Briefcase className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                  <span className="hidden sm:inline">Active</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-0 sm:mr-1.5" />
                  <span className="hidden sm:inline">Completed</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search employments..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {activeTab === "active" ? "Active Employments" : 
                   activeTab === "completed" ? "Completed Employments" : 
                   "All Employments"}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {employments.length} employments
                </Badge>
              </div>

              {/* Employments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Employer
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {activeTab === "active" 
                              ? "No active employments found" 
                              : activeTab === "completed"
                              ? "No completed employments found"
                              : "No employments found"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      employments.map((employment) => (
                        <tr
                          key={employment.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {employment.employer?.user?.name || 'N/A'}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {employment.employer?.user?.phone || 'No phone'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs font-semibold text-foreground">
                              {formatCurrency(employment.agreed_salary)}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(employment.start_date), 'MMM dd, yyyy')}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-muted-foreground">
                              {employment.end_date 
                                ? format(new Date(employment.end_date), 'MMM dd, yyyy')
                                : 'Ongoing'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-muted-foreground">
                              {employment.duration_days 
                                ? `${employment.duration_days} days` 
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge className={`text-[9px] ${getStatusBadge(employment.status)}`}>
                              {employment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => console.log('View details', employment.id)}
                              className="h-8 w-8 p-0 hover:bg-muted/50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
                      }
                      disabled={currentPage === pagination.last_page}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default WorkerEmployments;