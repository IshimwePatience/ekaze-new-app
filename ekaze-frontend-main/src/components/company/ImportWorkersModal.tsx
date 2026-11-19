import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  CloudUpload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useImportWorkersExcel } from "@/hooks/useWorkerRegistration";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImportWorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: number;
  onSuccess?: () => void;
}

// Expected columns in the Excel file
const EXPECTED_COLUMNS = [
  "first_name",
  "last_name",
  "gender",
  "date_of_birth",
  "national_id",
  "phone",
  "email",
  "password",
  "province",
  "district",
  "sector",
  "cell",
  "village",
  "experience_level",
  "languages_spoken",
  "work_type_preferences",
  "preferred_districts",
  "min_salary",
  "max_salary",
  "has_insurance",
  "insurance_type",
  "insurance_provider",
  "insurance_number",
  "referee_1_name",
  "referee_1_phone",
  "referee_1_relationship",
  "referee_2_name",
  "referee_2_phone",
  "referee_2_relationship",
];

type RowData = Record<string, string | number | boolean | null>;

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ImportWorkersModal = ({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: ImportWorkersModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"upload" | "columns">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<RowData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportWorkersExcel();

  function validateRow(row: RowData, index: number): ValidationResult {
    const errors: string[] = [];
    const required = [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "national_id",
      "phone",
      "email",
      "password",
      "district",
      "sector",
      "experience_level",
    ];

    required.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === "") {
        errors.push(
          t("company.workersContent.importModal.requiredField")
            .replace("{row}", String(index + 2))
            .replace("{field}", field)
        );
      }
    });

    if (
      row.national_id &&
      String(row.national_id).replace(/\D/g, "").length !== 16
    ) {
      errors.push(
        t("company.workersContent.importModal.invalidNationalId").replace(
          "{row}",
          String(index + 2)
        )
      );
    }

    if (
      row.gender &&
      !["male", "female"].includes(String(row.gender).toLowerCase())
    ) {
      errors.push(
        t("company.workersContent.importModal.invalidGender").replace(
          "{row}",
          String(index + 2)
        )
      );
    }

    if (
      row.experience_level &&
      !["beginner", "intermediate", "expert"].includes(
        String(row.experience_level).toLowerCase()
      )
    ) {
      errors.push(
        t("company.workersContent.importModal.invalidExperience").replace(
          "{row}",
          String(index + 2)
        )
      );
    }

    return { valid: errors.length === 0, errors };
  }

  const processFile = (f: File) => {
    if (
      !f.name.endsWith(".xlsx") &&
      !f.name.endsWith(".xls") &&
      !f.name.endsWith(".csv")
    ) {
      toast.error(t("company.workersContent.importModal.invalidFileType"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RowData>(worksheet, {
          raw: false,
          defval: "",
        });

        if (jsonData.length === 0) {
          toast.error(t("company.workersContent.importModal.emptyFile"));
          return;
        }

        // Validate all rows
        const allErrors: string[] = [];
        jsonData.forEach((row, idx) => {
          const result = validateRow(row, idx);
          allErrors.push(...result.errors);
        });

        setFile(f);
        setPreviewData(jsonData);
        setValidationErrors(allErrors);
      } catch {
        toast.error(t("company.workersContent.importModal.readFailed"));
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = () => {
    if (!file) return;
    if (validationErrors.length > 0) {
      toast.error(t("company.workersContent.importModal.validationErrors"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (companyId) formData.append("company_id", String(companyId));

    importMutation.mutate(formData, {
      onSuccess: () => {
        clearFile();
        onSuccess?.();
        onClose();
      },
      onError: (error: unknown) => {
        const err = error as {
          response?: { data?: { message?: string; errors?: Record<string, string[]> } };
        };
        const msg =
          err?.response?.data?.message || t("company.workersContent.importModal.importFailed");
        toast.error(msg);

        // Show field-level errors if present
        const fieldErrors = err?.response?.data?.errors;
        if (fieldErrors) {
          Object.values(fieldErrors).flat().forEach((e) => toast.error(e));
        }
      },
    });
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      EXPECTED_COLUMNS,
      [
        "HIMBAZA",
        "Doe",
        "male",
        "1990-01-15",
        "1199000012345678",
        "0781234567",
        "himbaza@example.com",
        "Password123!",
        "Kigali City",
        "Gasabo",
        "Remera",
        "Nyarutarama",
        "Amahoro",
        "intermediate",
        "Kinyarwanda,English",
        "full_time,part_time",
        "Gasabo,Kicukiro",
        "50000",
        "100000",
        "1",
        "MITUELLE_DE_SANTE",
        "MUTUELLE DE SANTE",
        "1199000012345678",
        "Jane Doe",
        "0781111111",
        "Sister",
        "Bob Smith",
        "0782179022",
        "Friend",
      ],
    ]);

    // Column widths for readability
    ws["!cols"] = EXPECTED_COLUMNS.map((h) => ({
      wch: Math.max(h.length + 4, 18),
    }));

    // Style header row
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E3F2FD" } },
        alignment: { horizontal: "center" },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    XLSX.writeFile(wb, "workers_import_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  const hasErrors = validationErrors.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-white text-[#3c4043] rounded-[28px] p-6 font-['Roboto',_'Google_Sans',_sans-serif] tracking-[0.2px] text-left select-none relative shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-h-[92vh] flex flex-col">
        {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
        <div className="flex items-center justify-between pb-3">
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

        {/* Main Title Input (Google style with blue underline) */}
        <div className="pt-1 pb-3">
          <div className="w-full text-[22px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8]">
            <span>Import Workers from Excel</span>
          </div>
        </div>

        {/* Pills Row (Google form pill tabs style) */}
        <div className="flex items-center gap-2 pt-2 pb-5 text-[14px] font-medium flex-wrap">
          <span
            onClick={() => setActiveTab("upload")}
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${
              activeTab === "upload"
                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                : "text-[#444746] hover:bg-slate-100"
            }`}
          >
            Upload Excel
          </span>

          <button
            type="button"
            onClick={downloadTemplate}
            className="px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors text-[#444746] hover:bg-slate-100 flex items-center gap-1.5 bg-transparent border-none text-[14px] font-medium"
            title="Download Excel Template"
          >
            <Download className="w-3.5 h-3.5 text-[#2478b8]" />
            <span>Download Template</span>
          </button>

          <span
            onClick={() => setActiveTab("columns")}
            className={`px-3.5 py-1.5 rounded-lg select-none cursor-pointer transition-colors ${
              activeTab === "columns"
                ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                : "text-[#444746] hover:bg-slate-100"
            }`}
          >
            Required Columns
          </span>
        </div>

        {/* Form Body with numbered items matching Terminate Contract */}
        <div className="space-y-4 pt-1 text-[14px] text-[#3c4043] overflow-y-auto max-h-[55vh] pr-1">
          {activeTab === "upload" ? (
            <>
              {/* Row 1: File Selection */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  1
                </span>
                <div className="w-full">
                  <div className="text-[14px] font-normal text-[#1f1f1f] mb-1.5">
                    Select Excel Spreadsheet
                  </div>

                  {!file ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "bg-blue-50/60 ring-2 ring-[#2478b8]"
                          : "bg-transparent hover:bg-blue-50/20"
                      }`}
                    >
                      <CloudUpload className="w-8 h-8 mx-auto mb-2 text-[#2478b8]" />
                      <p className="text-xs font-medium text-slate-700">
                        Drop your Excel file here, or{" "}
                        <span className="text-[#2478b8] font-semibold">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports .xlsx, .xls, .csv
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 truncate max-w-[210px]">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {previewData.length} workers detected
                            {hasErrors && (
                              <span className="text-red-600 font-semibold ml-1.5">
                                · {validationErrors.length} errors
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!hasErrors ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Invalid
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Verification Requirements */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  2
                </span>
                <div className="w-full">
                  <div className="text-[14px] font-normal text-[#1f1f1f]">
                    Format & Schema Validation
                  </div>
                  <div className="text-[12px] text-[#444746] mt-0.5">
                    Workers will be validated against 16-digit Rwandan National ID, phone numbers, and location fields.
                  </div>
                </div>
              </div>

              {/* Row 3: Notice / Errors */}
              <div className="flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                  3
                </span>
                <div className="w-full">
                  {hasErrors ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-red-900 mb-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Validation Errors ({validationErrors.length})</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px]">
                        {validationErrors.map((err, i) => (
                          <div key={i} className="text-red-700">• {err}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#444746] leading-relaxed">
                      {file
                        ? `${previewData.length} workers successfully verified and prepared for instant company directory registration.`
                        : "Download the Excel template to ensure headers match the required schema before importing."}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Columns Guide tab */
            <div className="space-y-3">
              <div className="text-xs text-[#444746]">
                Your spreadsheet must include the following column headers in row 1:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1">
                {EXPECTED_COLUMNS.map((col) => (
                  <span
                    key={col}
                    className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Cancel on left, Action pill on right */}
        <div className="flex items-center justify-end gap-3 pt-6 pb-1">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-[#2478b8] hover:bg-blue-50/60 px-4 py-2 rounded-full cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || hasErrors || importMutation.isPending}
            className="bg-[#2478b8] hover:bg-[#1b6296] disabled:opacity-50 text-white font-medium text-[14px] px-7 py-2.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            {importMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>
              {importMutation.isPending
                ? "Importing..."
                : previewData.length > 0
                ? `Import (${previewData.length})`
                : "Import Workers"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportWorkersModal;