import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  FileText,
  Clock,
  X,
  MessageSquare,
  Award,
  Users,
  Briefcase,
  Star,
  Ban,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  useIncidentDetails,
  useIncidentTimeline,
  useUpdateIncidentStatus,
  useAssignOfficer,
  useAddIncidentNotes,
  useDeleteIncident,
} from "@/hooks/useIncidents";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { cleanHtmlContent } from "@/lib/stringUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface IncidentDetailsModalProps {
  incidentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Extended type definitions
interface ExtendedUser {
  id: number;
  name?: string;
  email: string;
  phone: string;
  national_id?: string;
  profile_photo?: string;
  gender?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

interface ExtendedWorker {
  id: number;
  first_name?: string;
  last_name?: string;
  user?: ExtendedUser;
  company?: {
    id: number;
    business_name: string;
    tin: string;
  };
  average_rating?: number;
  total_employments?: number;
  total_ratings?: number;
  total_incidents?: number;
}

interface ExtendedEmployer {
  id: number;
  user?: ExtendedUser;
  active_workers?: number;
  total_workers_hired?: number;
  total_incidents_reported?: number;
}

const IncidentDetailsModal = ({
  incidentId,
  isOpen,
  onClose,
}: IncidentDetailsModalProps) => {
  const { t } = useLanguage();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "escalate" | "assign" | "delete">("resolve");
  const [actionData, setActionData] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");

  const [previewFile, setPreviewFile] = useState<{ url: string; ext: string; name: string } | null>(null);


  const { user } = useAuth();
  const { data, isLoading } = useIncidentDetails(incidentId);
  const { data: timelineData } = useIncidentTimeline(incidentId);
  const updateStatus = useUpdateIncidentStatus();
  const assignOfficer = useAssignOfficer();
  const addNotes = useAddIncidentNotes();
  const deleteIncident = useDeleteIncident();

  const { data: policeData } = useQuery({
    queryKey: ['police-officers'],
    queryFn: async () => {
      const response = await api.get('/admin/users/by-role/police', {
        params: { status: 'active', per_page: 100 },
      });
      return response.data;
    },
    enabled: isOpen,
  });

  const policeOfficers = policeData?.data?.data || [];

  const incident = data?.data;
  const timeline = timelineData?.data?.timeline || [];

  // Type assertions for extended types
  const extendedWorker = incident?.worker as ExtendedWorker | undefined;
  const extendedEmployer = incident?.employer as ExtendedEmployer | undefined;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAction = (
    type: "resolve" | "dismiss" | "escalate" | "assign" | "delete"
  ) => {
    setActionType(type);
    setActionData("");
    setSelectedOfficerId("");
    setActionDialogOpen(true);
  };

  const handleOpenNotesModal = () => {
    setNotes("");
    setNotesModalOpen(true);
  };

  const getSeverityText = (severity: string): string => {
    const severityMap: Record<string, string> = {
      critical: t("admin.incidentDetails.critical"),
      high: t("admin.incidentDetails.high"),
      medium: t("admin.incidentDetails.medium"),
      low: t("admin.incidentDetails.low"),
    };
    return severityMap[severity] || severity;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      reported: t("admin.incidentDetails.reported_status"),
      under_investigation: t("admin.incidentDetails.under_investigation"),
      resolved: t("admin.incidentDetails.resolved_status_badge"),
      dismissed: t("admin.incidentDetails.dismissed_status"),
      escalated: t("admin.incidentDetails.escalated_status"),
    };
    return statusMap[status] || status;
  };

  const getGenderText = (gender: string): string => {
    const genderMap: Record<string, string> = {
      male: t("admin.incidentDetails.male"),
      female: t("admin.incidentDetails.female"),
      other: t("admin.incidentDetails.other"),
    };
    return genderMap[gender] || gender;
  };

  const confirmAction = async () => {
    if (!incidentId) return;

    try {
      if (actionType === "resolve") {
        await updateStatus.mutateAsync({
          id: incidentId,
          data: { status: "resolved", resolution_details: actionData },
        });
        toast.success(t("admin.incidentDetails.resolvedSuccess"));
        setActionDialogOpen(false);
      } else if (actionType === "dismiss") {
        await updateStatus.mutateAsync({
          id: incidentId,
          data: { status: "dismissed" },
        });
        toast.success(t("admin.incidentDetails.dismissedSuccess"));
        setActionDialogOpen(false);
      } else if (actionType === "escalate") {
        await updateStatus.mutateAsync({
          id: incidentId,
          data: { status: "escalated" },
        });
        toast.success(t("admin.incidentDetails.escalatedSuccess"));
        setActionDialogOpen(false);
      } else if (actionType === "assign") {
        await assignOfficer.mutateAsync({
          id: incidentId,
          data: { officer_id: parseInt(selectedOfficerId) },
        });
        toast.success(t("admin.incidentDetails.assignedSuccess"));
        setActionDialogOpen(false);
      } else if (actionType === "delete") {
        await deleteIncident.mutateAsync(incidentId);
        // toast.success(t("admin.incidentDetails.deletedSuccess"));
        setActionDialogOpen(false);
        onClose();
      }
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const handleAddNotes = async () => {
    if (!incidentId || !notes.trim()) {
      toast.error(t("admin.incidentDetails.enterNotes"));
      return;
    }

    try {
      await addNotes.mutateAsync({
        id: incidentId,
        data: { notes },
      });
      // toast.success(t("admin.incidentDetails.notesAddedSuccess"));
      setNotes("");
      setNotesModalOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-white",
      low: "bg-green-500 text-white",
    };
    return styles[severity as keyof typeof styles] || "";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      reported: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
      under_investigation: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
      resolved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400",
      dismissed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
      escalated: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    };
    return styles[status as keyof typeof styles] || "";
  };

  // ADD after getStatusBadge function:
  const getFileIcon = (ext: string) => {
    const images = ["jpg", "jpeg", "png", "gif", "webp"];
    const videos = ["mp4", "mov", "avi", "mkv"];
    if (images.includes(ext.toLowerCase())) return "image";
    if (videos.includes(ext.toLowerCase())) return "video";
    return "file";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width="95vw"
        centered
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
        zIndex={1000}
        className="incident-details-modal"
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
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {t("admin.incidentDetails.incidentNumber")}{incident.incident_number}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getStatusBadge(incident.status)}`}>
                      {getStatusText(incident.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                    {incident.incident_type?.replace(/_/g, " ")}
                    {incident.incident_subtype && (
                      <span className="ml-1 text-muted-foreground/70">· {incident.incident_subtype.replace(/_/g, " ")}</span>
                    )}
                  </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenNotesModal}
                  className="text-xs h-8"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {t("admin.incidentDetails.addNotes")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs h-8"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {t("admin.incidentDetails.print")}
                </Button>
              </div>
            </div>

            {/* Quick Stats - Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: "10px" }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.incidentDetails.date")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {incident.incident_date ? format(new Date(incident.incident_date), "MMM dd, yyyy") : t("admin.incidentDetails.notAvailable")}
                    </h3>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">{t("admin.incidentDetails.incidentDate")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: "10px" }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.incidentDetails.location")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate max-w-[120px] sm:max-w-[150px]">
                      {incident.incident_location || t("admin.incidentDetails.notAvailable")}
                    </h3>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">{t("admin.incidentDetails.incidentSite")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: "10px" }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="p-1 rounded-lg bg-green-50 dark:bg-green-950/30 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t("admin.incidentDetails.status")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground capitalize">
                      {incident.status?.replace("_", " ")}
                    </h3>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">{t("admin.incidentDetails.current")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {(incident.status === "reported" || incident.status === "under_investigation") && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAction("resolve")}
                    disabled={updateStatus.isPending}
                    className="h-8 text-xs bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {updateStatus.isPending ? t("admin.incidentDetails.resolving") : t("admin.incidentDetails.resolve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("escalate")}
                    disabled={updateStatus.isPending}
                    className="h-8 text-xs border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {updateStatus.isPending ? t("admin.incidentDetails.escalating") : t("admin.incidentDetails.escalate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("dismiss")}
                    disabled={updateStatus.isPending}
                    className="h-8 text-xs"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    {updateStatus.isPending ? t("admin.incidentDetails.dismissing") : t("admin.incidentDetails.dismiss")}
                  </Button>
                </>
              )}
              {!incident.assigned_officer_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction("assign")}
                  disabled={assignOfficer.isPending}
                  className="h-8 text-xs"
                >
                  <User className="w-3 h-3 mr-1" />
                  {assignOfficer.isPending ? t("admin.incidentDetails.assigning") : t("admin.incidentDetails.assignOfficer")}
                </Button>
              )}
              {(() => {
                const isCreator = Boolean(
                  user?.id && (
                    Number(incident.reporter_id) === Number(user.id) ||
                    Number(incident.reporter?.id) === Number(user.id)
                  )
                );
                const statusLower = (incident.status || "").toLowerCase();
                const isUnderReviewOrResolved = [
                  "under_investigation",
                  "investigating",
                  "in_progress",
                  "follow_up",
                  "resolved",
                  "dismissed",
                  "escalated",
                  "closed"
                ].includes(statusLower);

                const canDelete = isCreator && !isUnderReviewOrResolved && statusLower === "reported" && !incident.assigned_officer_id;

                if (!canDelete) return null;

                return (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction("delete")}
                    disabled={deleteIncident.isPending}
                    className="h-8 text-xs ml-auto"
                  >
                    <Ban className="w-3 h-3 mr-1" />
                    {deleteIncident.isPending ? t("admin.incidentDetails.deleting") : t("admin.incidentDetails.delete")}
                  </Button>
                );
              })()}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="transition-all duration-200 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  {t("admin.incidentDetails.overview")}
                </TabsTrigger>
                <TabsTrigger value="worker" className="transition-all duration-200 text-xs">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {t("admin.incidentDetails.worker")}
                </TabsTrigger>
                <TabsTrigger value="employer" className="transition-all duration-200 text-xs">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  {t("admin.incidentDetails.employer")}
                </TabsTrigger>
                <TabsTrigger value="timeline" className="transition-all duration-200 text-xs">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {t("admin.incidentDetails.timeline2")}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          {t("admin.incidentDetails.incidentDetails")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.description")}</p>
                          <div 
                            className="text-xs prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: incident.description || '' }}
                          />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.type")}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {incident.incident_type?.replace(/_/g, " ")}
                          </Badge>
                          {incident.incident_subtype && (
                            <p className="text-[10px] text-muted-foreground pl-0.5 capitalize">
                              {incident.incident_subtype.replace(/_/g, " ")}
                            </p>
                          )}
                        </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.reportedDate")}</p>
                            <p className="text-xs font-medium">
                              {incident.created_at ? format(new Date(incident.created_at), "PPP") : t("admin.incidentDetails.notAvailable")}
                            </p>
                          </div>
                        </div>
                        {/* Evidence files (legacy URLs) */}
                      {incident.evidence_files && incident.evidence_files.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-2">{t("admin.incidentDetails.evidenceFiles")}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {incident.evidence_files.map((file: string, index: number) => {
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
                                  >
                                    <Badge variant="outline" className="text-[10px] hover:bg-muted cursor-pointer transition-colors">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {t("admin.incidentDetails.evidence")} {index + 1}
                                    </Badge>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

{/* Proof files (new uploads) */}
                        {incident.proof_files && incident.proof_files.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                <p className="text-xs font-semibold">
                                  Proof Files ({incident.proof_files.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {incident.proof_files.map((file, index) => {
                                  const kind = getFileIcon(file.extension);
                                  return (
                                    <div
                                      key={file.id}
                                      className="group relative border border-border/40 rounded-lg overflow-hidden bg-muted/20 hover:border-primary/40 transition-all duration-200"
                                    >
                                      {/* Thumbnail */}
                                      {kind === "image" ? (
                                        <div className="aspect-video relative overflow-hidden">
                                          <img
                                            src={file.file_url}
                                            alt={`Proof ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ) : kind === "video" ? (
                                        <div className="aspect-video bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                                          <div className="text-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-1">
                                              <span className="text-[8px] font-bold text-blue-600">VID</span>
                                            </div>
                                            <span className="text-[9px] text-blue-600 uppercase font-bold">{file.extension}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="aspect-video bg-muted/40 flex items-center justify-center">
                                          <div className="text-center">
                                            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold">{file.extension}</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Footer info */}
                                      <div className="p-1.5">
                                        <p className="text-[9px] text-muted-foreground truncate">
                                          {formatFileSize(file.size)}
                                        </p>
                                      </div>

                                      {/* Hover overlay — preview for image/video, open link for others */}
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {(kind === "image" || kind === "video") ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPreviewFile({
                                                url: file.file_url,
                                                ext: file.extension,
                                                name: `Proof file ${index + 1}`,
                                              })
                                            }
                                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                          >
                                            <FileText className="w-4 h-4 text-white" />
                                          </button>
                                        ) : (
                                          <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                          >
                                            <FileText className="w-4 h-4 text-white" />
                                          </a>
                                        )}
                                      </div>
                                </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}

                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-primary" />
                          {t("admin.incidentDetails.locationInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="text-xs font-semibold">{t("admin.incidentDetails.incidentLocation")}</h4>
                          </div>
                          <p className="text-sm font-medium">{incident.incident_location || t("admin.incidentDetails.notSpecified")}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{t("admin.incidentDetails.locationWhereIncidentOccurred")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {incident.assignedOfficer && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-primary" />
                            {t("admin.incidentDetails.assignedOfficer")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">
                              {incident.assignedOfficer.name}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {incident.assignedOfficer.phone}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {incident.police_notes && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-primary" />
                            {t("admin.incidentDetails.policeNotes")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs whitespace-pre-wrap">{incident.police_notes}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {incident.resolution_details && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            {t("admin.incidentDetails.resolution")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {incident.resolution_details}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          {t("admin.incidentDetails.timeline2")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.reported")}</p>
                          <p className="text-xs font-medium">
                            {incident.created_at ? format(new Date(incident.created_at), "PPP p") : t("admin.incidentDetails.notAvailable")}
                          </p>
                        </div>
                        {incident.resolved_at && (
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.resolved_status")}</p>
                            <p className="text-xs font-medium">
                              {format(new Date(incident.resolved_at), "PPP p")}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Worker Tab */}
              <TabsContent value="worker" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {extendedWorker ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 space-y-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={extendedWorker.user?.profile_photo || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {extendedWorker.first_name?.[0] || "W"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-sm">
                                {extendedWorker.first_name} {extendedWorker.last_name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{t("admin.incidentDetails.workerId")}: {incident.worker_id}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.nationalId")}</p>
                              <p className="text-xs font-medium font-mono">{extendedWorker.user?.national_id || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.phone")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.phone || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.gender")}</p>
                              <p className="text-xs font-medium capitalize">{extendedWorker.user?.gender ? getGenderText(extendedWorker.user.gender) : t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.email")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.email || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            {t("admin.incidentDetails.locationInformation")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.district")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.district || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.sector")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.sector || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.cell")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.cell || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.village")}</p>
                              <p className="text-xs font-medium">{extendedWorker.user?.village || t("admin.incidentDetails.notAvailable")}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-primary" />
                            {t("admin.incidentDetails.workerStatistics")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.averageRating")}</p>
                            </div>
                            <p className="text-sm font-bold">
                              {extendedWorker.average_rating ? Number(extendedWorker.average_rating).toFixed(1) : "0.0"}
                            </p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.totalEmployments")}</p>
                            <p className="text-sm font-bold">{extendedWorker.total_employments || 0}</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded-lg">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.totalRatings")}</p>
                            <p className="text-sm font-bold">{extendedWorker.total_ratings || 0}</p>
                          </div>
                          <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.totalIncidents")}</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{extendedWorker.total_incidents || 0}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {extendedWorker.company && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-primary" />
                              {t("admin.incidentDetails.companyInformation")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="text-xs font-medium text-purple-800 dark:text-purple-400">
                                {extendedWorker.company.business_name}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <User className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t("admin.incidentDetails.noWorkerInfo")}</p>
                  </div>
                )}
              </TabsContent>

              {/* Employer Tab */}
              <TabsContent value="employer" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {extendedEmployer ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={extendedEmployer.user?.profile_photo || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {extendedEmployer.user?.name?.[0] || "E"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm">{extendedEmployer.user?.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{t("admin.incidentDetails.employerId")}: {incident.employer_id}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.phoneNumber")}</p>
                            <p className="text-xs font-medium">{extendedEmployer.user?.phone || t("admin.incidentDetails.notAvailable")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">{t("admin.incidentDetails.emailAddress")}</p>
                            <p className="text-xs font-medium">{extendedEmployer.user?.email || t("admin.incidentDetails.notAvailable")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          {t("admin.incidentDetails.employerStatistics")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.activeWorkers")}</p>
                          <p className="text-sm font-bold">{extendedEmployer.active_workers || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.totalWorkersHired")}</p>
                          <p className="text-sm font-bold">{extendedEmployer.total_workers_hired || 0}</p>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("admin.incidentDetails.incidentsReported")}</p>
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">{extendedEmployer.total_incidents_reported || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Briefcase className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t("admin.incidentDetails.noEmployerInfo")}</p>
                  </div>
                )}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {timeline.length > 0 ? (
                        timeline.map((event: { event: string; officer?: string; details?: string; timestamp: string }, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                              </div>
                              {index < timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium">{event.event}</p>
                              {event.officer && (
                                <p className="text-xs text-muted-foreground">{t("admin.incidentDetails.officer")}: {event.officer}</p>
                              )}
                              {event.details && (
                                <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">{t("admin.incidentDetails.noTimelineEvents")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Notes Modal - Antd Modal with proper z-index */}
      <Modal
        open={notesModalOpen}
        onCancel={() => setNotesModalOpen(false)}
        footer={null}
        width={500}
        centered
        closeIcon={
          <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </div>
        }
        styles={{
          body: {
            padding: "24px",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        zIndex={1200}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t("admin.incidentDetails.addInvestigationNotes")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("admin.incidentDetails.notesDescription").replace("{incidentNumber}", incident?.incident_number || "")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigation-notes" className="text-xs">
              {t("admin.incidentDetails.notes")}
            </Label>
            <Textarea
              id="investigation-notes"
              placeholder={t("admin.incidentDetails.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="text-xs min-h-[120px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNotesModalOpen(false)}
              disabled={addNotes.isPending}
              className="h-9 text-xs"
            >
              {t("admin.incidentDetails.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleAddNotes}
              disabled={addNotes.isPending || !notes.trim()}
              className="h-9 text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              {addNotes.isPending ? t("admin.incidentDetails.adding") : t("admin.incidentDetails.addNotes")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Action Confirmation Dialog - Shadcn Dialog with proper z-index */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-md z-[1500]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {actionType === "resolve" && t("admin.incidentDetails.resolveTitle")}
              {actionType === "dismiss" && t("admin.incidentDetails.dismissTitle")}
              {actionType === "escalate" && t("admin.incidentDetails.escalateTitle")}
              {actionType === "assign" && t("admin.incidentDetails.assignTitle")}
              {actionType === "delete" && t("admin.incidentDetails.deleteTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "resolve" &&
                t("admin.incidentDetails.resolveDescription").replace("{incidentNumber}", incident?.incident_number || "")}
              {actionType === "dismiss" &&
                t("admin.incidentDetails.dismissDescription").replace("{incidentNumber}", incident?.incident_number || "")}
              {actionType === "escalate" &&
                t("admin.incidentDetails.escalateDescription").replace("{incidentNumber}", incident?.incident_number || "")}
              {actionType === "assign" &&
                t("admin.incidentDetails.assignDescription").replace("{incidentNumber}", incident?.incident_number || "")}
              {actionType === "delete" &&
                t("admin.incidentDetails.deleteDescription").replace("{incidentNumber}", incident?.incident_number || "")}
            </DialogDescription>
          </DialogHeader>

          {actionType === "assign" && (
            <div className="space-y-3 py-2">
              <Label htmlFor="officer" className="text-xs">
                {t("admin.incidentDetails.selectOfficer")}
              </Label>
              <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder={t("admin.incidentDetails.selectOfficerPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="z-[1600]">
                  {policeOfficers.length === 0 ? (
                    <SelectItem value="none" disabled className="text-xs text-muted-foreground">
                      No active officers found
                    </SelectItem>
                  ) : (
                    policeOfficers.map((officer: { id: number; name: string; phone: string }) => (
                      <SelectItem key={officer.id} value={String(officer.id)} className="text-xs">
                        {officer.name} — {officer.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {(actionType === "resolve" || actionType === "escalate") && (
            <div className="space-y-3 py-2">
              <Label htmlFor="action-notes" className="text-xs">
                {actionType === "resolve" ? t("admin.incidentDetails.resolutionDetails") : t("admin.incidentDetails.escalationNotes")}
              </Label>
              <Textarea
                id="action-notes"
                placeholder={
                  actionType === "resolve"
                    ? t("admin.incidentDetails.resolutionPlaceholder")
                    : t("admin.incidentDetails.escalationPlaceholder")
                }
                value={actionData}
                onChange={(e) => setActionData(e.target.value)}
                rows={4}
                className="text-xs"
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={updateStatus.isPending || assignOfficer.isPending || deleteIncident.isPending}
              className="h-9 px-4 text-xs"
            >
              {t("admin.incidentDetails.cancel")}
            </Button>
            <Button
              size="sm"
              variant={
                actionType === "delete" ? "destructive" : 
                actionType === "dismiss" ? "secondary" : 
                actionType === "escalate" ? "default" : 
                actionType === "assign" ? "default" : "default"
              }
              onClick={confirmAction}
              disabled={
                (actionType === "resolve" && !actionData.trim()) ||
                (actionType === "escalate" && !actionData.trim()) ||
                (actionType === "assign" && !selectedOfficerId) ||
                updateStatus.isPending ||
                assignOfficer.isPending ||
                deleteIncident.isPending
              }
              className={`h-9 px-4 text-xs ${
                actionType === "escalate" ? "bg-orange-600 hover:bg-orange-700" : 
                actionType === "assign" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              {updateStatus.isPending || assignOfficer.isPending || deleteIncident.isPending
                ? t("admin.incidentDetails.processing")
                : actionType === "resolve"
                ? t("admin.incidentDetails.resolve")
                : actionType === "dismiss"
                ? t("admin.incidentDetails.dismiss")
                : actionType === "escalate"
                ? t("admin.incidentDetails.escalate")
                : actionType === "assign"
                ? t("admin.incidentDetails.assignOfficer")
                : t("admin.incidentDetails.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* File Preview Overlay */}
{previewFile && (
  <div
    className="fixed inset-0 z-[2000] bg-black/85 flex items-center justify-center p-4"
    onClick={() => setPreviewFile(null)}
  >
    <div
      className="relative max-w-3xl max-h-[85vh] w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-black/60 px-4 py-2 rounded-t-lg">
        <p className="text-xs text-white/80 truncate max-w-[80%]">{previewFile.name}</p>
        <button
          type="button"
          onClick={() => setPreviewFile(null)}
          className="p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      {/* Content */}
      {getFileIcon(previewFile.ext) === "image" ? (
        <img
          src={previewFile.url}
          alt={previewFile.name}
          className="w-full max-h-[75vh] object-contain rounded-b-lg bg-black/40"
        />
      ) : (
        <video
          src={previewFile.url}
          controls
          autoPlay
          className="w-full max-h-[75vh] rounded-b-lg bg-black"
        />
      )}
    </div>
  </div>
)}
    </>
  );
};

export default IncidentDetailsModal;