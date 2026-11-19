import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Phone,
  Mail,
  Edit,
  Trash2,
  X,
  Clock,
  UserCheck,
  Building,
  Users,
  TrendingUp,
  Activity,
  History,
} from "lucide-react";
import {
  useCompanyIncidentDetails,
  useCompanyUpdateIncident,
  useCompanyDeleteIncident,
} from "@/hooks/useCompanyIncidents";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { CompanyUpdateIncidentPayload } from "@/types/company-incident.types";

interface CompanyIncidentDetailsModalProps {
  incidentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const CompanyIncidentDetailsModal = ({
  incidentId,
  isOpen,
  onClose,
  onRefresh,
}: CompanyIncidentDetailsModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"details" | "worker" | "evidence">("details");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Edit form state
const [incidentType, setIncidentType] = useState<string>("");
const [incidentSubtype, setIncidentSubtype] = useState<string>("");
  const [description, setDescription] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");

  const { data, isLoading } = useCompanyIncidentDetails(incidentId);
  const updateIncident = useCompanyUpdateIncident();
  const deleteIncident = useCompanyDeleteIncident();

  const incident = data?.data;

  const handleEdit = () => {
    if (!incident) return;
    
setIncidentType(incident.incident_type);
setIncidentSubtype(incident.incident_subtype ?? "");
    setDescription(incident.description);
    setIncidentLocation(incident.incident_location || "");
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!incidentId) return;

    try {
        const payload = {
          incident_type: incidentType as CompanyUpdateIncidentPayload['incident_type'],
          incident_subtype: incidentSubtype || null,
          description,
          incident_location: incidentLocation || undefined,
        };

      await updateIncident.mutateAsync({ id: incidentId, data: payload });
      setEditDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!incidentId) return;

    try {
      await deleteIncident.mutateAsync(incidentId);
      setDeleteDialogOpen(false);
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const getSeverityText = (severity: string) => {
    const severityMap: Record<string, string> = {
      critical: t("company.companyIncidents.detailsModal.critical"),
      high: t("company.companyIncidents.detailsModal.high"),
      medium: t("company.companyIncidents.detailsModal.medium"),
      low: t("company.companyIncidents.detailsModal.low"),
    };
    return severityMap[severity] || severity;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      reported: t("company.companyIncidents.detailsModal.reported_status"),
      under_investigation: t("company.companyIncidents.detailsModal.under_investigation"),
      resolved: t("company.companyIncidents.detailsModal.resolved_status"),
      dismissed: t("company.companyIncidents.detailsModal.dismissed"),
    };
    return statusMap[status] || status;
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      theft: t("company.companyIncidents.detailsModal.theft"),
      violence: t("company.companyIncidents.detailsModal.violence"),
      negligence: t("company.companyIncidents.detailsModal.negligence"),
      breach_of_contract: t("company.companyIncidents.detailsModal.breach_of_contract"),
      misconduct: t("company.companyIncidents.detailsModal.misconduct"),
      other: t("company.companyIncidents.detailsModal.other"),
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return styles[severity as keyof typeof styles] || "";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      reported: "bg-blue-100 text-blue-800 border-blue-200",
      under_investigation: "bg-purple-100 text-purple-800 border-purple-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      dismissed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status as keyof typeof styles] || "";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width="95vw"
        centered
        modalRender={(modal) => <div onClick={(e) => e.stopPropagation()}>{modal}</div>}
        focusable={{ focusTriggerAfterClose: false }}
        keyboard={!editDialogOpen && !deleteDialogOpen}
        maskClosable={!editDialogOpen && !deleteDialogOpen}
        closeIcon={
          <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </div>
        }
        styles={{
          body: {
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "16px",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        className="company-incident-details-modal"
      >
        {isLoading || !incident ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertTriangle className="h-14 w-14 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {incident.incident_number}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getStatusBadge(incident.status)}`}>
                      {getStatusText(incident.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(incident.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              {incident.can_update && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="h-8 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {t("company.companyIncidents.detailsModal.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t("company.companyIncidents.detailsModal.delete")}
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Stats - Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-red-50 dark:bg-red-950/30 group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground mb-0.5">
                        {getIncidentTypeLabel(incident.incident_type)}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyIncidents.detailsModal.type")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("company.companyIncidents.detailsModal.incidentType")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-2.5 h-2.5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground mb-0.5">
                        {formatShortDate(incident.incident_date)}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyIncidents.detailsModal.date")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">{t("company.companyIncidents.detailsModal.occurredOn")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                      <User className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground mb-0.5">
                        {incident.worker ? t("company.companyIncidents.detailsModal.workerInvolved") : t("company.companyIncidents.detailsModal.noWorker")}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyIncidents.detailsModal.involved")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">
                        {incident.worker ? incident.worker.full_name : t("company.companyIncidents.detailsModal.notAssigned")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground mb-0.5">
                        {incident.assigned_officer ? t("company.companyIncidents.detailsModal.assigned") : t("company.companyIncidents.detailsModal.pending")}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("company.companyIncidents.detailsModal.officer")}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/80">
                        {incident.assigned_officer ? t("company.companyIncidents.detailsModal.policeAssigned") : t("company.companyIncidents.detailsModal.awaitingAssignment")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "worker" | "evidence")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="transition-all duration-200 text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {t("company.companyIncidents.detailsModal.details")}
                </TabsTrigger>
                <TabsTrigger value="worker" className="transition-all duration-200 text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {t("company.companyIncidents.detailsModal.workerInfo")}
                </TabsTrigger>
                <TabsTrigger value="evidence" className="transition-all duration-200 text-xs">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {t("company.companyIncidents.detailsModal.evidence")}
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Left Column - Incident Details */}
                  <div className="lg:col-span-2 space-y-3">
                    {/* Incident Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          {t("company.companyIncidents.detailsModal.incidentInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.type")}</p>
                            <p className="text-xs font-medium">
                              {getIncidentTypeLabel(incident.incident_type)}
                            </p>
                          </div>
                          <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">Subtype</p>
                          <p className="text-xs font-medium capitalize">
                            {incident.incident_subtype?.replace(/_/g, " ") || "—"}
                          </p>
                        </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.status")}</p>
                            <Badge className={`text-xs ${getStatusBadge(incident.status)}`}>
                              {getStatusText(incident.status)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.date")}</p>
                            <p className="text-xs font-medium">{formatDate(incident.incident_date)}</p>
                          </div>
                        </div>

                        {incident.incident_location && (
                          <>
                            <Separator />
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                <h4 className="text-xs font-semibold">{t("company.companyIncidents.detailsModal.incidentLocation")}</h4>
                              </div>
                              <p className="text-xs">{incident.incident_location}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          {t("company.companyIncidents.detailsModal.description")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs whitespace-pre-wrap">{incident.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Investigation & Timeline */}
                  <div className="space-y-3">
                    {/* Investigation Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-primary" />
                          {t("company.companyIncidents.detailsModal.investigationDetails")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {incident.assigned_officer ? (
                          <>
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.assignedOfficer")}</p>
                              <p className="text-xs font-medium">{incident.assigned_officer.name}</p>
                            </div>
                            {incident.assigned_at && (
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.assignedOn")}</p>
                                <p className="text-xs font-medium">{formatDate(incident.assigned_at)}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{t("company.companyIncidents.detailsModal.noOfficerAssigned")}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Incident Timeline */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          {t("company.companyIncidents.detailsModal.incidentTimeline")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.reported")}</p>
                          <p className="text-xs font-medium">{formatDate(incident.created_at)}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.incidentDate")}</p>
                          <p className="text-xs font-medium">{formatDate(incident.incident_date)}</p>
                        </div>
                        {incident.assigned_at && (
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.assignedToPolice")}</p>
                            <p className="text-xs font-medium">{formatDate(incident.assigned_at)}</p>
                          </div>
                        )}
                        {incident.resolved_at && (
                          <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.resolved")}</p>
                            <p className="text-xs font-medium">{formatDate(incident.resolved_at)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Worker Info Tab */}
              <TabsContent value="worker" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {incident.worker ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 space-y-3">
                      {/* Worker Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-primary" />
                            {t("company.companyIncidents.detailsModal.workerInformation")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={incident.worker.user?.profile_photo || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {incident.worker.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-sm font-bold">{incident.worker.full_name}</h3>
                              <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.involvedWorker")}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {incident.worker.user?.phone && (
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.phone")}</p>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs font-medium">{incident.worker.user.phone}</p>
                                </div>
                              </div>
                            )}
                            {incident.worker.user?.email && (
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.email")}</p>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs font-medium">{incident.worker.user.email}</p>
                                </div>
                              </div>
                            )}
                            {incident.worker.user?.district && (
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">{t("company.companyIncidents.detailsModal.district")}</p>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs font-medium">{incident.worker.user.district}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Employer Information Sidebar */}
                    {incident.employer && (
                      <div className="space-y-3">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-primary" />
                              {t("company.companyIncidents.detailsModal.employer")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.name")}</p>
                              <p className="text-xs font-medium">{incident.employer.user?.name || t("company.companyIncidents.detailsModal.notAvailable")}</p>
                            </div>
                            {incident.employer.user?.phone && (
                              <div className="p-2 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">{t("company.companyIncidents.detailsModal.phone")}</p>
                                <p className="text-xs font-medium">{incident.employer.user.phone}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-muted/50 rounded-full mb-4">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t("company.companyIncidents.detailsModal.noWorkerInfo")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("company.companyIncidents.detailsModal.noWorkerAssociated")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 space-y-3">
                    {/* Evidence Files */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-primary" />
                          {t("company.companyIncidents.detailsModal.evidenceFiles")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {incident.evidence_files && incident.evidence_files.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {incident.evidence_files.map((file, index) => {
                              const fileUrl = file.startsWith("http")
                                ? file
                                : `${import.meta.env.VITE_STORAGE_URL || "http://localhost:5000"}${
                                    file.startsWith("/") ? file : "/" + file
                                  }`;
                              return (
                                <a
                                  key={index}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {t("company.companyIncidents.detailsModal.evidenceNumber").replace("{number}", (index + 1).toString())}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">{t("company.companyIncidents.detailsModal.clickToView")}</p>
                                </div>
                              </a>
                            );
                          })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="p-4 bg-muted/50 rounded-full inline-block mb-4">
                              <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{t("company.companyIncidents.detailsModal.noEvidenceFiles")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Notes & Details Sidebar */}
                  <div className="space-y-3">
                    {incident.police_notes && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-primary" />
                            {t("company.companyIncidents.detailsModal.policeNotes")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs whitespace-pre-wrap">{incident.police_notes}</p>
                        </CardContent>
                      </Card>
                    )}

                    {incident.resolution_details && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-primary" />
                            {t("company.companyIncidents.detailsModal.resolutionDetails")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs whitespace-pre-wrap">{incident.resolution_details}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">{t("company.companyIncidents.detailsModal.editTitle")}</DialogTitle>
            <DialogDescription className="text-xs">
              {t("company.companyIncidents.detailsModal.editDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="incident_type" className="text-xs">
                  {t("company.companyIncidents.detailsModal.incidentTypeLabel")}
                </Label>
                <select
                  id="incident_type"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full h-9 px-3 py-2 text-xs border rounded-md bg-background"
                >
                  <option value="theft">{t("company.companyIncidents.detailsModal.theft")}</option>
                  <option value="violence">{t("company.companyIncidents.detailsModal.violence")}</option>
                  <option value="negligence">{t("company.companyIncidents.detailsModal.negligence")}</option>
                  <option value="breach_of_contract">{t("company.companyIncidents.detailsModal.breach_of_contract")}</option>
                  <option value="misconduct">{t("company.companyIncidents.detailsModal.misconduct")}</option>
                  <option value="non_payment">Non-Payment</option>
                  <option value="unsafe_conditions">Unsafe Conditions</option>
                  <option value="harassment">Harassment</option>
                  <option value="wrongful_termination">Wrongful Termination</option>
                  <option value="other">{t("company.companyIncidents.detailsModal.other")}</option>
                </select>
              </div>

            <div className="space-y-2">
              <Label htmlFor="incident_subtype" className="text-xs">Subtype</Label>
              <Input
                id="incident_subtype"
                placeholder="e.g. physical_assault, salary_withheld..."
                value={incidentSubtype}
                onChange={(e) => setIncidentSubtype(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_location" className="text-xs">
                {t("company.companyIncidents.detailsModal.incidentLocationLabel")}
              </Label>
              <Input
                id="incident_location"
                placeholder={t("company.companyIncidents.detailsModal.locationPlaceholder")}
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">
                {t("company.companyIncidents.detailsModal.descriptionLabel")}
              </Label>
              <Textarea
                id="description"
                placeholder={t("company.companyIncidents.detailsModal.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-32"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateIncident.isPending}
              className="h-9 w-24 text-xs"
            >
              {t("company.companyIncidents.detailsModal.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmEdit}
              disabled={updateIncident.isPending || !description}
              className="h-9 w-24 text-xs"
            >
              {updateIncident.isPending ? t("company.companyIncidents.detailsModal.saving") : t("company.companyIncidents.detailsModal.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t("company.companyIncidents.detailsModal.deleteTitle")}</DialogTitle>
            <DialogDescription className="text-xs">
              {t("company.companyIncidents.detailsModal.deleteDescription")}
              <br />
              <span className="font-medium">
                {t("company.companyIncidents.detailsModal.deleteNote")}
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteIncident.isPending}
              className="h-9 w-24 text-xs"
            >
              {t("company.companyIncidents.detailsModal.cancel")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteIncident.isPending}
              className="h-9 w-24 text-xs"
            >
              {deleteIncident.isPending ? t("company.companyIncidents.detailsModal.deleting") : t("company.companyIncidents.detailsModal.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyIncidentDetailsModal;