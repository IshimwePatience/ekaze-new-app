import { useState } from "react";
import { Modal } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select as AntSelect } from "antd";
import {
  AlertTriangle,
  User,
  Building,
  MapPin,
  Calendar,
  Clock,
  FileText,
  X,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  Briefcase,
  Star,
  ArrowUpRight,
  Users,
  CreditCard,
  Award,
} from "lucide-react";
import { useIncidentDetails } from "@/hooks/usePoliceAnalytics";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { policeAnalyticsApi } from "@/api/policeAnalyticsService";
import { useLanguage } from "@/contexts/LanguageContext";

interface IncidentDetailsModalProps {
  incidentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const IncidentDetailsModal = ({ incidentId, isOpen, onClose, onUpdate }: IncidentDetailsModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [previewFile, setPreviewFile] = useState<{ url: string; ext: string; name: string } | null>(null);


 const { toast } = useToast();
const { data, isLoading, refetch } = useIncidentDetails(incidentId || 0);
  const incident = data?.data;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAddNotes = async () => {
    if (!incidentId || !notes.trim()) {
      toast({
        title: "Failed",
        description: t("police.incidentDetails.enterNotes"),
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await policeAnalyticsApi.addNotes(incidentId, notes);
      toast({
        title: "Success",
        description: t("police.incidentDetails.notesAdded"),
        variant: "success",
      });
      setNotes("");
      refetch();
      onUpdate?.();
    } catch (error) {
        toast({
        title: "Failed",
        description: t("police.incidentDetails.notesFailed"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!incidentId || !selectedStatus) {
              toast({
        title: "Failed",
        description: t("police.incidentDetails.selectStatusMessage"),
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await policeAnalyticsApi.updateStatus(incidentId, selectedStatus);
            toast({
        title: "Success",
        description: t("police.incidentDetails.statusUpdated"),
        variant: "success",
      });
      setSelectedStatus("");
      refetch();
      onUpdate?.();
    } catch (error) {
                    toast({
        title: "Failed",
        description: t("police.incidentDetails.statusFailed"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      reported: t("police.incidentDetails.statusReported"),
      under_investigation: t("police.incidentDetails.statusUnderInvestigation"),
      resolved: t("police.incidentDetails.statusResolved"),
      dismissed: t("police.incidentDetails.statusDismissed"),
      escalated: t("police.incidentDetails.statusEscalated"),
    };
    return statusMap[status] || status;
  };



  const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
      male: t("police.incidentDetails.male"),
      female: t("police.incidentDetails.female"),
      other: t("police.incidentDetails.other"),
    };
    return genderMap[gender] || gender;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      reported: "bg-orange-100 text-orange-800 border-orange-200",
      under_investigation: "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      dismissed: "bg-gray-100 text-gray-800 border-gray-200",
      escalated: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status as keyof typeof styles] || "";
  };



  // ADD:
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
          maxHeight: '85vh', 
          overflowY: 'auto',
          padding: '16px'
        },
        mask: {
          backdropFilter: 'blur(4px)'
        }
      }}
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
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t("police.incidentDetails.incidentNumber")}{incident.incident_number}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getStatusBadge(incident.status)}`}>
                    {getStatusText(incident.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {incident.incident_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="text-xs h-8"
              >
                <FileText className="w-3 h-3 mr-1" />
                {t("police.incidentDetails.printReport")}
              </Button>
            </div>
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
                    <h3 className="text-sm font-bold text-foreground mb-0.5 capitalize">
                      {incident.severity}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("police.incidentDetails.severity")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("police.incidentDetails.level")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {incident.incident_date ? format(new Date(incident.incident_date), 'MMM dd') : 'N/A'}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("police.incidentDetails.date")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("police.incidentDetails.incidentDate")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-2.5 h-2.5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5">
                      {incident.incident_location || 'N/A'}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("police.incidentDetails.location")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("police.incidentDetails.incidentSite")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group" style={{ borderRadius: '10px' }}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="p-0.5 rounded-lg bg-green-50 dark:bg-green-950/30 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-2.5 h-2.5 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground mb-0.5 capitalize">
                      {incident.status?.replace('_', ' ')}
                    </h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1.5">{t("police.incidentDetails.status")}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground/80">{t("police.incidentDetails.current")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="transition-all duration-200 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                {t("police.incidentDetails.overview")}
              </TabsTrigger>
              <TabsTrigger value="worker" className="transition-all duration-200 text-xs">
                <User className="w-3.5 h-3.5 mr-1.5" />
                {t("police.incidentDetails.worker")}
              </TabsTrigger>
              <TabsTrigger value="employer" className="transition-all duration-200 text-xs">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                {t("police.incidentDetails.employer")}
              </TabsTrigger>
              <TabsTrigger value="actions" className="transition-all duration-200 text-xs">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                {t("police.incidentDetails.actions")}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Incident Details */}
                <div className="lg:col-span-2 space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        {t("police.incidentDetails.incidentDetails")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.description")}</p>
                        {incident.description ? (
                          <div
                            className="text-xs prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: incident.description }}
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground">{t("police.incidentDetails.noDescription")}</p>
                        )}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.type")}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {incident.incident_type?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.reportedDate")}</p>
                          <p className="text-xs font-medium">
                            {incident.created_at ? format(new Date(incident.created_at), 'PPP') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        {t("police.incidentDetails.locationInformation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <h4 className="text-xs font-semibold">{t("police.incidentDetails.incidentLocation")}</h4>
                        </div>
                        <p className="text-sm font-medium">{incident.incident_location || t("police.incidentDetails.notSpecified")}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{t("police.incidentDetails.locationWhereIncidentOccurred")}</p>
                      </div>
                    </CardContent>
                  </Card>
                  {/* ADD after the Location Information Card: */}
                  {incident.proof_files && incident.proof_files.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          Proof Files ({incident.proof_files.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {incident.proof_files.map((file, index) => {
                            const kind = getFileIcon(file.extension);
                            return (
                              <div
                                key={file.id}
                                className="group relative border border-border/40 rounded-lg overflow-hidden bg-muted/20 hover:border-primary/40 transition-all duration-200"
                              >
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
                                <div className="p-1.5">
                                  <p className="text-[9px] text-muted-foreground truncate">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  {(kind === "image" || kind === "video") ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewFile({ url: file.file_url, ext: file.extension, name: `Proof file ${index + 1}` })}
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
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Police Notes */}
                <div className="space-y-3">
                  {incident.police_notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-primary" />
                          {t("police.incidentDetails.policeNotes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs whitespace-pre-wrap">{incident.police_notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timeline */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        {t("police.incidentDetails.timeline")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.reported")}</p>
                        <p className="text-xs font-medium">
                          {incident.created_at ? format(new Date(incident.created_at), 'PPP p') : 'N/A'}
                        </p>
                      </div>
                      {incident.resolved_at && (
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.resolved")}</p>
                          <p className="text-xs font-medium">
                            {format(new Date(incident.resolved_at), 'PPP p')}
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
              {incident.worker ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2 space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={incident.worker.user?.profile_photo || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {incident.worker.full_name?.[0] || 'W'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm">{incident.worker.full_name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{t("police.incidentDetails.workerId")}: {incident.worker.id}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.nationalId")}</p>
                            <p className="text-xs font-medium font-mono">{incident.worker.user?.national_id || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.phone")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.phone || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.gender")}</p>
                            <p className="text-xs font-medium capitalize">{incident.worker.user?.gender ? getGenderText(incident.worker.user.gender) : 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.email")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-primary" />
                          {t("police.incidentDetails.locationInformation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.district")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.district || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.sector")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.sector || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.cell")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.cell || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.village")}</p>
                            <p className="text-xs font-medium">{incident.worker.user?.village || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          {t("police.incidentDetails.workerStatistics")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.averageRating")}</p>
                          </div>
                          <p className="text-sm font-bold">{incident.worker.average_rating ? Number(incident.worker.average_rating).toFixed(1) : '0.0'}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.totalEmployments")}</p>
                          <p className="text-sm font-bold">{incident.worker.total_employments || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.totalRatings")}</p>
                          <p className="text-sm font-bold">{incident.worker.total_ratings || 0}</p>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.totalIncidents")}</p>
                          <p className="text-sm font-bold text-red-600">{incident.worker.total_incidents || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <User className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t("police.incidentDetails.noWorkerInfo")}</p>
                </div>
              )}
            </TabsContent>

            {/* Employer Tab */}
            <TabsContent value="employer" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {incident.employer ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={incident.employer.user?.profile_photo || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {incident.employer.user?.name?.[0] || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm">{incident.employer.user?.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{t("police.incidentDetails.employerId")}: {incident.employer.id}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.phoneNumber")}</p>
                          <p className="text-sm font-medium">{incident.employer.user?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t("police.incidentDetails.emailAddress")}</p>
                          <p className="text-sm font-medium">{incident.employer.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        {t("police.incidentDetails.employerStatistics")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.activeWorkers")}</p>
                        <p className="text-sm font-bold">{incident.employer.active_workers || 0}</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.totalWorkersHired")}</p>
                        <p className="text-sm font-bold">{incident.employer.total_workers_hired || 0}</p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-[10px] text-muted-foreground mb-1">{t("police.incidentDetails.incidentsReported")}</p>
                        <p className="text-sm font-bold text-red-600">{incident.employer.total_incidents_reported || 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Briefcase className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t("police.incidentDetails.noEmployerInfo")}</p>
                </div>
              )}
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {t("police.incidentDetails.updateStatus")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-xs">{t("police.incidentDetails.newStatus")}</Label>
                      <AntSelect
                        value={selectedStatus || undefined}
                        onChange={setSelectedStatus}
                        placeholder={t("police.incidentDetails.selectStatus")}
                        className="w-full text-xs"
                        size="middle"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        options={[
                          { value: "under_investigation", label: t("police.incidentDetails.underInvestigation") },
                          { value: "resolved",            label: t("police.incidentDetails.resolved_status") },
                          { value: "dismissed",           label: t("police.incidentDetails.dismissed") },
                          { value: "escalated",           label: t("police.incidentDetails.escalated") },
                        ]}
                      />
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleUpdateStatus}
                      disabled={isUpdating || !selectedStatus}
                      className="w-full text-xs h-8"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {isUpdating ? t("police.incidentDetails.updating") : t("police.incidentDetails.updateStatusBtn")}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("police.incidentDetails.addInvestigationNotes")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs">{t("police.incidentDetails.notes")}</Label>
                      <Textarea
                        id="notes"
                        placeholder={t("police.incidentDetails.notesPlaceholder")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-xs min-h-[80px]"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleAddNotes}
                      disabled={isUpdating || !notes.trim()}
                      className="w-full text-xs h-8"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {isUpdating ? t("police.incidentDetails.adding") : t("police.incidentDetails.addNotes")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
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

    </Modal>
  );
};

export default IncidentDetailsModal;