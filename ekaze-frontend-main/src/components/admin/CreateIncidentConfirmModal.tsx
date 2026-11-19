import { X, AlertTriangle, User, Tag, FileText, MapPin, Building2, UserCheck, Star, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CreateIncidentRequest } from "@/types/incident.types";
import type { Worker } from "@/types/worker.types";

interface CreateIncidentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: CreateIncidentRequest;
  selectedWorker: Worker | null;
  isPending: boolean;
  locationDetails: {
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    specificLocation: string;
  };
}

const CreateIncidentConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  selectedWorker,
  isPending,
  locationDetails,
}: CreateIncidentConfirmModalProps) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      hired: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      unavailable: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
    };
    return styles[status as keyof typeof styles] || "";
  };
  

const getIncidentTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    theft:                "Theft",
    violence:             "Violence",
    negligence:           "Negligence",
    breach_of_contract:   "Breach of Contract",
    misconduct:           "Misconduct",
    non_payment:          "Non-Payment",
    unsafe_conditions:    "Unsafe Conditions",
    harassment:           "Harassment",
    wrongful_termination: "Wrongful Termination",
    other:                "Other",
  };
  return types[type] || type;
};

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!selectedWorker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[85rem] max-h-[92vh] overflow-y-auto p-0"
        style={{ borderRadius: "12px" }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Review Incident Report</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Please review all details before submitting
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Worker Summary */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Worker Information</h3>
              </div>
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedWorker.user.profile_photo || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedWorker.first_name[0]}{selectedWorker.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {selectedWorker.first_name} {selectedWorker.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Worker ID: {selectedWorker.id}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusBadge(selectedWorker.availability_status)}`}>
                      {selectedWorker.availability_status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedWorker.registration_type === "company" ? (
                          <>
                            <Building2 className="w-3 h-3 mr-1" />
                            Company Worker
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Freelance Worker
                          </>
                        )}
                      </Badge>
                    </div>
                    {selectedWorker.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedWorker.company.business_name}</span>
                      </div>
                    )}
                    {parseFloat(selectedWorker.average_rating) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {parseFloat(selectedWorker.average_rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({selectedWorker.total_ratings} ratings)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedWorker.user.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident Details */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Incident Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Incident Type</p>
                  <Badge variant="outline" className="text-xs font-medium">
                    {getIncidentTypeLabel(formData.incident_type)}
                  </Badge>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subtype</p>
                <Badge variant="outline" className="text-xs font-medium capitalize">
                  {formData.incident_subtype?.replace(/_/g, " ") || "—"}
                </Badge>
              </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Incident Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{formatDate(formData.incident_date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Location</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Province:</span>
                    <span className="text-xs font-medium">{locationDetails.province}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">District:</span>
                    <span className="text-xs font-medium">{locationDetails.district}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Sector:</span>
                    <span className="text-xs font-medium">{locationDetails.sector}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Cell:</span>
                    <span className="text-xs font-medium">{locationDetails.cell}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground">Village:</span>
                    <span className="text-xs font-medium">{locationDetails.village}</span>
                  </div>
                  {locationDetails.specificLocation && (
                    <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs text-muted-foreground">Specific:</span>
                      <span className="text-xs font-medium">{locationDetails.specificLocation}</span>
                    </div>
                  )}
                </div>
              </div>
              {formData.incident_location && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Full Location String:</p>
                  <p className="text-sm font-medium">{formData.incident_location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Description</h3>
              </div>
              <div 
                className="p-4 bg-muted/30 rounded-lg prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              By submitting this incident report, you confirm that the information provided is accurate and complete to the best of your knowledge. False reporting may result in disciplinary action.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="w-32 h-9 text-xs"
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="w-32 h-9 text-xs bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIncidentConfirmModal;