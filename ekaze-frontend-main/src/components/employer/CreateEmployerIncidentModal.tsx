import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Eye,
  Paperclip,
  Trash2,
  ListOrdered,
  List,
  Link2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Select, { SingleValue } from "react-select";
import {
  useEmployerActiveWorkers,
  useEmployerCreateIncident,
} from "@/hooks/useEmployerCreateIncidents";
import {
  useProvinces,
  useDistricts,
  useSectors,
  useCells,
  useVillages,
} from "@/hooks/useLocations";
import type {
  CreateEmployerIncidentRequest,
  EmployerActiveWorker,
} from "@/types/employer-create-incident.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "worker" | "details" | "location" | "proof";

const EMPTY_FORM: CreateEmployerIncidentRequest = {
  worker_id: 0,
  incident_type: "theft",
  incident_subtype: null,
  description: "",
  incident_date: "",
  incident_location: "",
};

const INCIDENT_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  theft: [
    { value: "pickpocketing", label: "Pickpocketing" },
    { value: "burglary", label: "Burglary" },
    { value: "fraud", label: "Fraud / Deception" },
    { value: "shoplifting", label: "Shoplifting" },
    { value: "other", label: "Other" },
  ],
  violence: [
    { value: "physical_assault", label: "Physical Assault" },
    { value: "sexual_harassment", label: "Sexual Harassment" },
    { value: "verbal_abuse", label: "Verbal Abuse / Threats" },
    { value: "domestic_violence", label: "Domestic Violence" },
    { value: "other", label: "Other" },
  ],
  negligence: [
    { value: "property_damage", label: "Property Damage" },
    { value: "safety_violation", label: "Safety Violation" },
    { value: "duty_abandonment", label: "Abandonment of Duty" },
    { value: "other", label: "Other" },
  ],
  breach_of_contract: [
    { value: "non_payment", label: "Non-payment Dispute" },
    { value: "unauthorized_absence", label: "Unauthorized Absence" },
    { value: "early_termination", label: "Early Termination" },
    { value: "other", label: "Other" },
  ],
  misconduct: [
    { value: "insubordination", label: "Insubordination" },
    { value: "substance_abuse", label: "Substance Abuse" },
    { value: "harassment", label: "Harassment of Colleagues" },
    { value: "dishonesty", label: "Dishonesty" },
    { value: "other", label: "Other" },
  ],
  other: [
    { value: "general", label: "General / Unclassified" },
  ],
};

const CreateEmployerIncidentModal = ({ isOpen, onClose }: Props) => {
  const { t } = useLanguage();
  const createIncident = useEmployerCreateIncident();
  const { data: activeWorkersData, isLoading: isLoadingWorkers } = useEmployerActiveWorkers();

  const [step, setStep] = useState<Step>("worker");
  const [formData, setFormData] = useState<CreateEmployerIncidentRequest>(EMPTY_FORM);
  const [selectedWorker, setSelectedWorker] = useState<EmployerActiveWorker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Location
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedCell, setSelectedCell] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();
  const [selectedVillageId, setSelectedVillageId] = useState<number | undefined>();

  // Proof files
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);

  // Location hooks
  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);

  // Build location string
  useEffect(() => {
    const parts = [
      selectedVillage,
      selectedCell,
      selectedSector,
      selectedDistrict,
      selectedProvince,
    ].filter(Boolean);
    setFormData((prev) => ({ ...prev, incident_location: parts.join(", ") }));
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage]);

  // Reset on modal close/open
  useEffect(() => {
    if (!isOpen) {
      setStep("worker");
      setFormData(EMPTY_FORM);
      setSelectedWorker(null);
      setSearchTerm("");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedSector("");
      setSelectedCell("");
      setSelectedVillage("");
      setSelectedProvinceId(undefined);
      setSelectedDistrictId(undefined);
      setSelectedSectorId(undefined);
      setSelectedCellId(undefined);
      setSelectedVillageId(undefined);
      setProofFiles([]);
    }
  }, [isOpen]);

  const workers = activeWorkersData?.data?.data ?? [];
  const filteredWorkers = workers.filter((w) => {
    const name = (w.full_name ?? "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      name.includes(term) ||
      w.national_id.includes(term) ||
      w.phone.includes(term)
    );
  });

  const INCIDENT_TYPE_OPTIONS = [
    { value: "theft", label: t("employer.incidentManagement.theft_label") },
    { value: "violence", label: t("employer.incidentManagement.violence_label") },
    { value: "negligence", label: t("employer.incidentManagement.negligence_label") },
    { value: "breach_of_contract", label: t("employer.incidentManagement.breach_of_contract_label") },
    { value: "misconduct", label: t("employer.incidentManagement.misconduct_label") },
    { value: "other", label: t("employer.incidentManagement.other_label") },
  ];

  // Validation per step - ALL REQUIRED
  const isStep1Valid = !!selectedWorker;
  const isStep2Valid =
    !!selectedWorker &&
    !!formData.incident_type &&
    !!formData.incident_subtype &&
    !!formData.incident_date;
  const isStep3Valid =
    !!selectedProvince &&
    !!selectedDistrict &&
    !!selectedSector &&
    !!selectedCell &&
    !!selectedVillage;
  const isStep4Valid = proofFiles.length > 0 && !!formData.description.trim();

  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedWorker) return;

    try {
      await createIncident.mutateAsync({
        ...formData,
        worker_id: selectedWorker.worker_id ?? selectedWorker.id,
        province_id: selectedProvinceId ?? null,
        district_id: selectedDistrictId ?? null,
        sector_id: selectedSectorId ?? null,
        cell_id: selectedCellId ?? null,
        village_id: selectedVillageId ?? null,
        proof_files: proofFiles.length > 0 ? proofFiles : undefined,
      });
      onClose();
    } catch {
      // handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="max-w-[580px] sm:max-w-[580px] w-full p-0 overflow-hidden rounded-[28px] border-none shadow-[0_12px_40px_rgba(0,0,0,0.18)] bg-white text-slate-800"
      >
        <DialogTitle className="sr-only">Report an Incident</DialogTitle>
        <DialogDescription className="sr-only">Multi-step incident report dialog</DialogDescription>

        <div className="w-full max-w-full min-w-0 box-border bg-white text-slate-800 rounded-[28px] p-6 font-sans text-left select-none relative animate-in fade-in duration-200">
          {/* Top Header Bar: Drag Handle on Left + Close X on Right */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex flex-col gap-[3px] p-1 opacity-60 hover:opacity-100 transition-opacity cursor-grab">
              <span className="w-4 h-[2px] bg-slate-700 rounded-full" />
              <span className="w-4 h-[2px] bg-slate-700 rounded-full" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Main Title Section with Blue Underline */}
          <div className="pt-1 pb-3">
            <div className="w-full text-[20px] font-normal text-[#1f1f1f] pb-1.5 border-b-2 border-[#2478b8] flex items-center justify-between">
              <span>
                {step === "worker" && (selectedWorker ? selectedWorker.full_name : "Choose Active Worker")}
                {step === "details" && "Incident Details"}
                {step === "location" && "Incident Location"}
                {step === "proof" && "Proof & Description"}
              </span>
              {selectedWorker && (
                <span className="text-xs font-mono text-slate-500 font-normal">
                  {selectedWorker.national_id}
                </span>
              )}
            </div>
          </div>

          {/* Pill Tabs Row (Google Calendar pill tabs style) */}
          <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden pt-2 pb-5 flex items-center gap-2 text-[13px] font-medium scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setStep("worker")}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer ${step === "worker"
                  ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                  : "text-[#444746] hover:bg-slate-100"
                }`}
            >
              Choose Worker
            </button>
            <button
              type="button"
              onClick={() => {
                if (isStep1Valid) setStep("details");
              }}
              disabled={!isStep1Valid}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${step === "details"
                  ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                  : "text-[#444746] hover:bg-slate-100"
                }`}
            >
              Incident Details
            </button>
            <button
              type="button"
              onClick={() => {
                if (isStep2Valid) setStep("location");
              }}
              disabled={!isStep2Valid}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${step === "location"
                  ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                  : "text-[#444746] hover:bg-slate-100"
                }`}
            >
              Location
            </button>
            <button
              type="button"
              onClick={() => {
                if (isStep3Valid) setStep("proof");
              }}
              disabled={!isStep3Valid}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${step === "proof"
                  ? "bg-[#c2e7ff] text-[#001d35] font-semibold"
                  : "text-[#444746] hover:bg-slate-100"
                }`}
            >
              Proof & Description
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── STEP 1: Choose Worker ── */}
            {step === "worker" && (
              <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
                {selectedWorker ? (
                  <>
                    <div className="flex items-start gap-4">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                        1
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarImage src={selectedWorker.profile_photo ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {selectedWorker.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {selectedWorker.full_name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {selectedWorker.phone} {selectedWorker.national_id}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedWorker(null)}
                            className="text-xs text-[#2478b8] hover:underline font-semibold cursor-pointer"
                          >
                            Change Worker
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 select-none">
                        2
                      </span>
                      <div>
                        <div className="text-[13px] text-[#444746] leading-relaxed">
                          Selected worker confirmed. Click <strong>"Next: Incident Details"</strong> below to record the incident category and date.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <input
                        placeholder="Search worker by name, phone or national ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#2478b8] bg-white text-slate-700"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-xl max-h-[220px] overflow-y-auto divide-y divide-slate-100 bg-white">
                      {isLoadingWorkers ? (
                        <div className="p-4 space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : filteredWorkers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          {workers.length === 0
                            ? t("employer.incidentManagement.noActiveWorkers")
                            : t("employer.incidentManagement.noWorkersMatch")}
                        </div>
                      ) : (
                        filteredWorkers.map((worker) => (
                          <button
                            key={worker.id}
                            type="button"
                            onClick={() => {
                              setSelectedWorker(worker);
                              setSearchTerm("");
                            }}
                            className="w-full p-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                          >
                            <Avatar className="h-8 w-8 shrink-0 border border-slate-200">
                              <AvatarImage src={worker.profile_photo ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {worker.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {worker.full_name}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                {worker.phone} {worker.national_id}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Incident Details ── */}
            {step === "details" && (
              <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
                {/* Row 1: Incident Type */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    1
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Incident Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={INCIDENT_TYPE_OPTIONS}
                      value={INCIDENT_TYPE_OPTIONS.find((o) => o.value === formData.incident_type) ?? null}
                      onChange={(opt: SingleValue<{ value: string; label: string }>) => {
                        setFormData((prev) => ({
                          ...prev,
                          incident_type: (opt?.value ?? "theft") as CreateEmployerIncidentRequest["incident_type"],
                          incident_subtype: null,
                        }));
                      }}
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "36px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Subtype */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    2
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Incident Subtype <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={INCIDENT_SUBTYPES[formData.incident_type] ?? []}
                      value={
                        (INCIDENT_SUBTYPES[formData.incident_type] ?? []).find(
                          (o) => o.value === formData.incident_subtype
                        ) ?? null
                      }
                      onChange={(opt: SingleValue<{ value: string; label: string }>) =>
                        setFormData((prev) => ({ ...prev, incident_subtype: opt?.value ?? null }))
                      }
                      placeholder="Select specific subtype..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "36px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Row 3: Date */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    3
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Incident Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.incident_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, incident_date: e.target.value }))}
                      max={new Date().toISOString().split("T")[0]}
                      required
                      className="h-9 text-xs rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Location ── */}
            {step === "location" && (
              <div className="space-y-3 pt-1 text-[14px] text-[#3c4043]">
                {/* Province */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    1
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={provincesData?.map((p) => ({ value: p.id, label: p.name })) ?? []}
                      value={selectedProvince ? { value: selectedProvinceId, label: selectedProvince } : null}
                      onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                        setSelectedProvinceId(opt?.value);
                        setSelectedProvince(opt?.label ?? "");
                        setSelectedDistrictId(undefined);
                        setSelectedDistrict("");
                        setSelectedSectorId(undefined);
                        setSelectedSector("");
                        setSelectedCellId(undefined);
                        setSelectedCell("");
                        setSelectedVillageId(undefined);
                        setSelectedVillage("");
                      }}
                      placeholder="Select province..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "34px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* District */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    2
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={districtsData?.map((d) => ({ value: d.id, label: d.name })) ?? []}
                      value={selectedDistrict ? { value: selectedDistrictId, label: selectedDistrict } : null}
                      onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                        setSelectedDistrictId(opt?.value);
                        setSelectedDistrict(opt?.label ?? "");
                        setSelectedSectorId(undefined);
                        setSelectedSector("");
                        setSelectedCellId(undefined);
                        setSelectedCell("");
                        setSelectedVillageId(undefined);
                        setSelectedVillage("");
                      }}
                      isDisabled={!selectedProvinceId}
                      placeholder="Select district..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "34px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Sector */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    3
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={sectorsData?.map((s) => ({ value: s.id, label: s.name })) ?? []}
                      value={selectedSector ? { value: selectedSectorId, label: selectedSector } : null}
                      onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                        setSelectedSectorId(opt?.value);
                        setSelectedSector(opt?.label ?? "");
                        setSelectedCellId(undefined);
                        setSelectedCell("");
                        setSelectedVillageId(undefined);
                        setSelectedVillage("");
                      }}
                      isDisabled={!selectedDistrictId}
                      placeholder="Select sector..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "34px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Cell */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    4
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Cell <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={cellsData?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                      value={selectedCell ? { value: selectedCellId, label: selectedCell } : null}
                      onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                        setSelectedCellId(opt?.value);
                        setSelectedCell(opt?.label ?? "");
                        setSelectedVillageId(undefined);
                        setSelectedVillage("");
                      }}
                      isDisabled={!selectedSectorId}
                      placeholder="Select cell..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "34px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Village */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    5
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Village <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={villagesData?.map((v) => ({ value: v.id, label: v.name })) ?? []}
                      value={selectedVillage ? { value: selectedVillageId, label: selectedVillage } : null}
                      onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                        setSelectedVillageId(opt?.value);
                        setSelectedVillage(opt?.label ?? "");
                      }}
                      isDisabled={!selectedCellId}
                      placeholder="Select village..."
                      className="text-xs"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "34px",
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Proof & Description ── */}
            {step === "proof" && (
              <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
                {/* Description */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    1
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[12px] font-medium text-slate-700">
                        Incident Description <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Required</span>
                    </div>
                    <div className="w-full bg-[#eef2f6] rounded-t-md border-b-2 border-[#2478b8] px-3 pt-2.5 pb-2">
                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-2 pb-1.5 text-slate-700">
                        <button type="button" className="font-bold text-[13px] px-1 hover:text-black">
                          B
                        </button>
                        <button type="button" className="italic font-serif text-[13px] px-1 hover:text-black">
                          I
                        </button>
                        <button type="button" className="underline text-[13px] px-1 hover:text-black">
                          U
                        </button>
                        <span className="h-3.5 w-[1px] bg-slate-300 mx-0.5" />
                        <button type="button" className="p-0.5 hover:text-black">
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-0.5 hover:text-black">
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <span className="h-3.5 w-[1px] bg-slate-300 mx-0.5" />
                        <button type="button" className="p-0.5 hover:text-black">
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-0.5 hover:text-black text-xs font-semibold">
                          <span className="relative">T<span className="text-[10px] absolute -bottom-1 -right-1">x</span></span>
                        </button>
                      </div>
                      {/* Description Textarea */}
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Add description"
                        rows={2}
                        className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-500 outline-none resize-none pt-0.5 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Proof Files */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    2
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[12px] font-medium text-slate-700">
                        Proof & Supporting Files <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {proofFiles.length}/5 files (At least 1 required)
                      </span>
                    </div>

                    {proofFiles.length < 5 && (
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#2478b8] hover:bg-slate-50/50 transition-colors">
                        <Paperclip className="w-4 h-4 text-slate-400 mb-1" />
                        <p className="text-[11px] text-slate-600 font-medium">
                          Click to upload proof files <span className="text-red-500">*</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Images, Video, PDF, Docs up to 5 MB
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={(e) => {
                            const selected = Array.from(e.target.files ?? []);
                            const valid = selected.filter((f) => f.size <= 5 * 1024 * 1024);
                            if (valid.length < selected.length) {
                              alert("Some files exceed 5 MB limit and were skipped.");
                            }
                            setProofFiles((prev) => [...prev, ...valid].slice(0, 5));
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}

                    {proofFiles.length > 0 && (
                      <div className="space-y-1.5 mt-2 max-h-[130px] overflow-y-auto">
                        {proofFiles.map((file, idx) => {
                          const isImage = file.type.startsWith("image/");
                          const isVideo = file.type.startsWith("video/");
                          const url = URL.createObjectURL(file);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate text-slate-700 font-medium">{file.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                  ({(file.size / 1024).toFixed(0)} KB)
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {(isImage || isVideo) && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile({ file, url })}
                                    className="p-1 hover:text-[#2478b8] text-slate-500 cursor-pointer"
                                    title="Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setProofFiles((prev) => prev.filter((_, i) => i !== idx))}
                                  className="p-1 hover:text-red-600 text-slate-400 cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer Actions Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={
                  step === "worker"
                    ? onClose
                    : () => {
                      if (step === "details") setStep("worker");
                      else if (step === "location") setStep("details");
                      else if (step === "proof") setStep("location");
                    }
                }
                className="text-xs font-semibold text-[#2478b8] hover:bg-blue-50 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                {step === "worker" ? "Cancel" : "Back"}
              </button>

              <div className="flex items-center gap-2">
                {step === "worker" && (
                  <Button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={() => setStep("details")}
                    className="rounded-full bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Next: Incident Details
                  </Button>
                )}

                {step === "details" && (
                  <Button
                    type="button"
                    disabled={!isStep2Valid}
                    onClick={() => setStep("location")}
                    className="rounded-full bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Next: Location
                  </Button>
                )}

                {step === "location" && (
                  <Button
                    type="button"
                    disabled={!isStep3Valid}
                    onClick={() => setStep("proof")}
                    className="rounded-full bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Next: Proof & Description
                  </Button>
                )}

                {step === "proof" && (
                  <Button
                    type="submit"
                    disabled={!canSubmit || createIncident.isPending}
                    className="rounded-full bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {createIncident.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {createIncident.isPending ? "Submitting..." : "Submit Incident Report"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>

      {/* Proof file preview overlay */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => {
            URL.revokeObjectURL(previewFile.url);
            setPreviewFile(null);
          }}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-black/60 px-4 py-2 rounded-t-lg">
              <p className="text-xs text-white/80 truncate max-w-[80%]">{previewFile.file.name}</p>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                }}
                className="p-1 rounded hover:bg-white/20"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {previewFile.file.type.startsWith("image/") ? (
              <img
                src={previewFile.url}
                alt={previewFile.file.name}
                className="w-full max-h-[75vh] object-contain rounded-b-lg bg-black/40"
              />
            ) : (
              <video
                src={previewFile.url}
                controls
                className="w-full max-h-[75vh] rounded-b-lg bg-black"
              />
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CreateEmployerIncidentModal;