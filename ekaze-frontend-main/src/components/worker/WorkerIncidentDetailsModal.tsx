import { X, ExternalLink, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerIncident } from "@/hooks/useWorkerIncidents";
import { format } from "date-fns";

interface Props {
  incidentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusLabel = (status?: string) => {
  if (!status) return "Reported";
  const map: Record<string, string> = {
    reported: "Reported",
    under_investigation: "Under Investigation",
    resolved: "Resolved",
    dismissed: "Dismissed",
    escalated: "Escalated",
  };
  return map[status] ?? status;
};

const getTypeLabel = (type?: string) => {
  if (!type) return "General Report";
  const map: Record<string, string> = {
    non_payment: "Non-Payment",
    unsafe_conditions: "Unsafe Conditions",
    harassment: "Harassment",
    breach_of_contract: "Breach of Contract",
    wrongful_termination: "Wrongful Termination",
    other: "Other Incident",
  };
  return map[type] ?? type;
};

const WorkerIncidentDetailsModal = ({ incidentId, isOpen, onClose }: Props) => {
  const { data, isLoading } = useWorkerIncident(isOpen ? incidentId : null);
  const incident = data?.data;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-white text-[#3c4043] rounded-[28px] p-6 tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar: Drag Handle icon on Left + Close X on Right */}
        <div className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
            <span className="w-4 h-[2px] bg-[#444746] rounded-full" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#444746] hover:text-[#1f1f1f] hover:bg-[#1f1f1f]/[0.08] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Main Title Line (Google form style with blue underline) */}
        <div className="pt-1 pb-3 shrink-0">
          <div className="w-full bg-transparent text-[22px] font-normal font-mono tracking-wide text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8] truncate">
            {incident?.incident_number || "Incident Details"}
          </div>
        </div>

        {/* Category Pills Row (Google form pill tabs style) */}
        <div className="flex items-center gap-2 pt-1 pb-4 text-[13px] font-medium flex-wrap shrink-0">
          <span className="px-3.5 py-1.5 rounded-lg bg-[#c2e7ff] text-[#001d35] font-semibold text-xs">
            {getTypeLabel(incident?.incident_type)}
          </span>
          {incident?.incident_subtype && (
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium capitalize">
              {incident.incident_subtype.replace(/_/g, " ")}
            </span>
          )}
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#444746] text-xs font-medium">
            {getStatusLabel(incident?.status)}
          </span>
        </div>

        {/* Scrollable Content Body with Numbered Steps matching termination modal */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs text-[#444746]">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : !incident ? (
            <div className="text-center py-8 text-slate-500">
              Incident information not found.
            </div>
          ) : (
            <>
              {/* 1. Reported Against / Employer */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {incident.employer?.user?.name || "Test Employer"}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {incident.employer?.user?.phone || "250788000004"}
                  </p>
                  {incident.employer?.user?.email && (
                    <p className="text-[11px] text-slate-400">
                      {incident.employer.user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Date & Location */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    Incident Date & Location
                  </p>
                  <p className="text-xs text-slate-600">
                    {incident.incident_date
                      ? format(new Date(incident.incident_date), "MMMM dd, yyyy")
                      : "October 12, 2026"}
                  </p>
                  {incident.incident_location && (
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {incident.incident_location}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Description */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Description</p>
                  <div
                    className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-40 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: incident.description || "No description provided.",
                    }}
                  />
                </div>
              </div>

              {/* 4. Evidence Files */}
              {incident.evidence_files && incident.evidence_files.length > 0 && (
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-[#444746] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      Evidence Files ({incident.evidence_files.length})
                    </p>
                    <div className="space-y-1.5">
                      {incident.evidence_files.map((file, idx) => {
                        const fileName = file.split("/").pop() ?? `File ${idx + 1}`;
                        const ext = fileName.split(".").pop()?.toUpperCase();
                        const isImage = ["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(
                          ext ?? ""
                        );
                        const getEvidenceFileUrl = (f: string) => {
                          if (!f) return "";
                          if (f.startsWith("http://") || f.startsWith("https://")) return f;
                          const base = (import.meta.env.VITE_STORAGE_URL || "http://localhost:5000").replace(/\/+$/, "");
                          if (f.startsWith("/uploads/")) return `${base}${f}`;
                          if (f.startsWith("uploads/")) return `${base}/${f}`;
                          return `${base}/uploads/incidents/${f.replace(/^\/+/, "")}`;
                        };
                        const fileUrl = getEvidenceFileUrl(file);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="w-7 h-7 rounded object-cover shrink-0 border border-slate-200"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-slate-200 flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold text-slate-600">
                                    {ext}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-slate-800 font-mono truncate">
                                {fileName}
                              </span>
                            </div>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-[#2478b8] p-1 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {incident.created_at && (
                <div className="pt-1 text-[11px] text-slate-400 text-right">
                  Submitted on{" "}
                  {format(new Date(incident.created_at), "MMM dd, yyyy · HH:mm")}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkerIncidentDetailsModal;