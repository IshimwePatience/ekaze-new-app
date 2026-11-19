import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Paperclip, Trash2, Eye, Loader2, Upload } from "lucide-react";
import { useAddProofFiles } from "@/hooks/useIncidents";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddProofFilesModalProps {
  incidentId: number | null;
  incidentNumber?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddProofFilesModal = ({ incidentId, incidentNumber, isOpen, onClose }: AddProofFilesModalProps) => {
      const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);
  const addProofFiles = useAddProofFiles();

  const handleClose = () => {
    setFiles([]);
    setPreviewFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!incidentId || files.length === 0) return;
    try {
      await addProofFiles.mutateAsync({ id: incidentId, files });
      handleClose();
    } catch {
      // handled by hook
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0" style={{ borderRadius: "12px" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Paperclip className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">{t("admin.incidentManagement.addProofFiles")}</h2>
                {incidentNumber && (
                  <p className="text-xs text-muted-foreground mt-0.5">Case #{incidentNumber}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Upload Area */}
            {files.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Click to upload proof files<br />
                  <span className="text-[10px]">PDF, Images, Videos — max 5MB each, up to {5 - files.length} more</span>
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const valid = selected.filter(f => f.size <= 5 * 1024 * 1024);
                    const invalid = selected.filter(f => f.size > 5 * 1024 * 1024);
                    if (invalid.length > 0) alert(`${invalid.length} file(s) exceed 5MB and were skipped.`);
                    setFiles(prev => [...prev, ...valid].slice(0, 5));
                    e.target.value = "";
                  }}
                />
              </label>
            )}

            {/* File List */}
            {files.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{files.length}/5 files selected</p>
                {files.map((file, index) => {
                  const isImage = file.type.startsWith("image/");
                  const isVideo = file.type.startsWith("video/");
                  const ext = file.name.split('.').pop()?.toUpperCase();
                  const objectUrl = URL.createObjectURL(file);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border/40"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isImage ? (
                          <img
                            src={objectUrl}
                            alt={file.name}
                            className="w-8 h-8 rounded object-cover shrink-0 border border-border/40"
                          />
                        ) : isVideo ? (
                          <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-border/40">
                            <span className="text-[8px] font-bold text-blue-600">VID</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 border border-border/40">
                            <span className="text-[8px] font-bold text-muted-foreground">{ext}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {ext} · {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(isImage || isVideo) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewFile({ file, url: objectUrl })}
                            className="h-7 w-7 p-0 hover:text-primary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                          className="h-7 w-7 p-0 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-2">No files selected yet.</p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-5 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={addProofFiles.isPending} className="h-9 text-xs w-28">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={addProofFiles.isPending || files.length === 0}
              className="h-9 text-xs w-28"
            >
              {addProofFiles.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              {addProofFiles.isPending ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Overlay */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-black/60 px-4 py-2 rounded-t-lg">
              <p className="text-xs text-white/80 truncate max-w-[80%]">{previewFile.file.name}</p>
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {previewFile.file.type.startsWith("image/") ? (
              <img src={previewFile.url} alt={previewFile.file.name} className="w-full max-h-[75vh] object-contain rounded-b-lg bg-black/40" />
            ) : (
              <video src={previewFile.url} controls className="w-full max-h-[75vh] rounded-b-lg bg-black" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddProofFilesModal;