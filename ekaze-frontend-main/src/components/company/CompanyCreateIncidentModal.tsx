import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Eye,
  Paperclip,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Select, { SingleValue } from "react-select";
import { useCompanyCreateIncident } from "@/hooks/useCompanyIncidents";
import { useCompanyWorkers } from "@/hooks/useWorkers";
import {
  useProvinces,
  useDistricts,
  useSectors,
  useCells,
  useVillages,
} from "@/hooks/useLocations";
import type { CompanyCreateIncidentPayload } from "@/types/company-incident.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { DefaultAvatarSVG } from "@/components/common/DefaultAvatarSVG";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "worker" | "details" | "location" | "proof";

interface WorkerOption {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  national_id?: string;
  profile_photo?: string | null;
  employer_id?: number;
}

const EMPTY_FORM: CompanyCreateIncidentPayload = {
  worker_id: 0,
  incident_type: "misconduct",
  incident_subtype: null,
  description: "",
  incident_date: "",
  incident_location: "",
  notify_police: true,
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
  non_payment: [
    { value: "delayed_salary", label: "Delayed Salary" },
    { value: "salary_withheld", label: "Salary Withheld" },
    { value: "illegal_deductions", label: "Illegal Deductions" },
    { value: "other", label: "Other" },
  ],
  unsafe_conditions: [
    { value: "equipment_hazard", label: "Hazardous Equipment" },
    { value: "no_ppe", label: "Lack of Safety Gear (PPE)" },
    { value: "toxic_exposure", label: "Toxic Substance Exposure" },
    { value: "other", label: "Other" },
  ],
  harassment: [
    { value: "verbal", label: "Verbal Harassment" },
    { value: "bullying", label: "Bullying / Intimidation" },
    { value: "discriminatory", label: "Discrimination" },
    { value: "other", label: "Other" },
  ],
  wrongful_termination: [
    { value: "unfair_dismissal", label: "Unfair Dismissal" },
    { value: "no_notice", label: "Termination Without Notice" },
    { value: "other", label: "Other" },
  ],
  other: [
    { value: "general", label: "General / Unclassified" },
  ],
};

const CompanyCreateIncidentModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { t } = useLanguage();
  const createIncident = useCompanyCreateIncident();
  const { data: workersData, isLoading: isLoadingWorkers } = useCompanyWorkers(1, { per_page: 200 });

  const [step, setStep] = useState<Step>("worker");
  const [formData, setFormData] = useState<CompanyCreateIncidentPayload>(EMPTY_FORM);
  const [selectedWorker, setSelectedWorker] = useState<WorkerOption | null>(null);
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

  // Format workers
  const rawWorkersList = Array.isArray(workersData?.data?.data)
    ? workersData.data.data
    : Array.isArray(workersData?.data)
    ? workersData.data
    : [];

  const workers: WorkerOption[] = rawWorkersList.map((w: any) => ({
    id: w.id,
    first_name: w.first_name || w.user?.name?.split(" ")[0] || "Worker",
    last_name: w.last_name || w.user?.name?.split(" ").slice(1).join(" ") || "",
    full_name: w.user?.name || `${w.first_name || ""} ${w.last_name || ""}`.trim() || `Worker #${w.id}`,
    phone: w.user?.phone || w.phone || "—",
    national_id: w.user?.national_id || w.national_id || "",
    profile_photo: w.user?.profile_photo || w.profile_photo || null,
  }));

  const filteredWorkers = workers.filter((w) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.full_name.toLowerCase().includes(term) ||
      w.phone.toLowerCase().includes(term) ||
      (w.national_id || "").toLowerCase().includes(term)
    );
  });

  // Rebuild location string
  useEffect(() => {
    const parts = [selectedVillage, selectedCell, selectedSector, selectedDistrict, selectedProvince].filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      incident_location: parts.length ? parts.join(", ") : "",
      province_id: selectedProvinceId ?? null,
      district_id: selectedDistrictId ?? null,
      sector_id: selectedSectorId ?? null,
      cell_id: selectedCellId ?? null,
      village_id: selectedVillageId ?? null,
    }));
  }, [
    selectedProvince,
    selectedDistrict,
    selectedSector,
    selectedCell,
    selectedVillage,
    selectedProvinceId,
    selectedDistrictId,
    selectedSectorId,
    selectedCellId,
    selectedVillageId,
  ]);

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setStep("worker");
      setFormData(EMPTY_FORM);
      setSelectedWorker(null);
      setSearchTerm("");
      setProofFiles([]);
      setPreviewFile(null);
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
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const added = Array.from(e.target.files);
      setProofFiles((prev) => [...prev, ...added]);
    }
  };

  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    try {
      await createIncident.mutateAsync({
        ...formData,
        worker_id: selectedWorker.id,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // Error handled by hook toast
    }
  };

  const isStep1Valid = !!selectedWorker;
  const isStep2Valid = !!formData.incident_type && !!formData.incident_date;
  const isStep3Valid = !!selectedProvince && !!selectedDistrict;
  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid && formData.description.trim().length >= 10;

  const INCIDENT_TYPE_OPTIONS = [
    { value: "theft", label: "Theft" },
    { value: "violence", label: "Violence" },
    { value: "negligence", label: "Negligence" },
    { value: "breach_of_contract", label: "Breach of Contract" },
    { value: "misconduct", label: "Misconduct" },
    { value: "non_payment", label: "Non-Payment" },
    { value: "unsafe_conditions", label: "Unsafe Conditions" },
    { value: "harassment", label: "Harassment" },
    { value: "wrongful_termination", label: "Wrongful Termination" },
    { value: "other", label: "Other" },
  ];

  const subtypeOptions = INCIDENT_SUBTYPES[formData.incident_type] || INCIDENT_SUBTYPES.other;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="max-w-xl w-full p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl gap-0 max-h-[92vh] flex flex-col"
      >
        <DialogTitle className="sr-only">Report Incident</DialogTitle>
        <DialogDescription className="sr-only">Report an incident involving a worker</DialogDescription>

        {/* Modal Top Grab Handle + Close Icon matching screenshot */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Entity Title + Phone + Blue Divider Line matching screenshot */}
        <div className="px-6 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal text-slate-900 tracking-tight font-sans">
              {selectedWorker ? selectedWorker.full_name : "Report Incident"}
            </h2>
            {selectedWorker?.phone && (
              <span className="text-xs text-slate-500 font-mono">
                {selectedWorker.phone}
              </span>
            )}
          </div>
          <div className="h-[2px] bg-[#2478b8] mt-3" />
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 py-3 flex-1 overflow-y-auto">
          {/* Step Navigation Pills matching screenshot */}
          <div className="flex items-center gap-1.5 pt-1 pb-4 overflow-x-auto text-xs shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setStep("worker")}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer ${
                step === "worker"
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
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                step === "details"
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
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                step === "location"
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
              className={`shrink-0 px-3.5 py-1.5 rounded-lg select-none whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                step === "proof"
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
                              <AvatarImage src={selectedWorker.profile_photo || undefined} />
                              <AvatarFallback className="p-0 bg-transparent border-none">
                                <DefaultAvatarSVG className="w-full h-full" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 font-sans">
                                {selectedWorker.full_name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {selectedWorker.phone} {selectedWorker.national_id ? `• ${selectedWorker.national_id}` : ""}
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

                    <div className="border border-slate-200 rounded-xl max-h-[240px] overflow-y-auto divide-y divide-slate-100 bg-white">
                      {isLoadingWorkers ? (
                        <div className="p-4 space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : filteredWorkers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          {workers.length === 0
                            ? "No workers registered yet."
                            : "No workers match your search."}
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
                              <AvatarImage src={worker.profile_photo || undefined} />
                              <AvatarFallback className="p-0 bg-transparent border-none">
                                <DefaultAvatarSVG className="w-full h-full" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {worker.full_name}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                {worker.phone} {worker.national_id ? `• ${worker.national_id}` : ""}
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
                          incident_type: (opt?.value ?? "misconduct") as any,
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
                      Specific Subtype
                    </label>
                    <Select
                      options={subtypeOptions}
                      value={subtypeOptions.find((o) => o.value === formData.incident_subtype) ?? null}
                      onChange={(opt: SingleValue<{ value: string; label: string }>) => {
                        setFormData((prev) => ({
                          ...prev,
                          incident_subtype: opt?.value ?? null,
                        }));
                      }}
                      placeholder="Select subtype..."
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

                {/* Row 3: Incident Date */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    3
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Date of Occurrence <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.incident_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          incident_date: e.target.value,
                        }))
                      }
                      className="text-xs h-9 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Location ── */}
            {step === "location" && (
              <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
                {/* Row 1: Administrative Location */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    1
                  </span>
                  <div className="flex-1 space-y-3">
                    <label className="text-[12px] font-medium text-slate-700 block">
                      Administrative Jurisdiction <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 mb-0.5 block">Province</label>
                        <Select
                          options={
                            provincesData?.map((p: any) => ({
                              value: p.id,
                              label: p.name,
                            })) || []
                          }
                          value={
                            selectedProvinceId
                              ? {
                                  value: selectedProvinceId,
                                  label: selectedProvince,
                                }
                              : null
                          }
                          onChange={(opt: any) => {
                            setSelectedProvinceId(opt?.value);
                            setSelectedProvince(opt?.label || "");
                            setSelectedDistrictId(undefined);
                            setSelectedDistrict("");
                            setSelectedSectorId(undefined);
                            setSelectedSector("");
                          }}
                          placeholder="Select Province..."
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

                      <div>
                        <label className="text-[11px] text-slate-500 mb-0.5 block">District</label>
                        <Select
                          options={
                            districtsData?.map((d: any) => ({
                              value: d.id,
                              label: d.name,
                            })) || []
                          }
                          value={
                            selectedDistrictId
                              ? {
                                  value: selectedDistrictId,
                                  label: selectedDistrict,
                                }
                              : null
                          }
                          onChange={(opt: any) => {
                            setSelectedDistrictId(opt?.value);
                            setSelectedDistrict(opt?.label || "");
                            setSelectedSectorId(undefined);
                            setSelectedSector("");
                          }}
                          isDisabled={!selectedProvinceId}
                          placeholder="Select District..."
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

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 mb-0.5 block">Sector</label>
                        <Select
                          options={
                            sectorsData?.map((s: any) => ({
                              value: s.id,
                              label: s.name,
                            })) || []
                          }
                          value={
                            selectedSectorId
                              ? {
                                  value: selectedSectorId,
                                  label: selectedSector,
                                }
                              : null
                          }
                          onChange={(opt: any) => {
                            setSelectedSectorId(opt?.value);
                            setSelectedSector(opt?.label || "");
                            setSelectedCellId(undefined);
                            setSelectedCell("");
                          }}
                          isDisabled={!selectedDistrictId}
                          placeholder="Sector..."
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

                      <div>
                        <label className="text-[11px] text-slate-500 mb-0.5 block">Cell</label>
                        <Select
                          options={
                            cellsData?.map((c: any) => ({
                              value: c.id,
                              label: c.name,
                            })) || []
                          }
                          value={
                            selectedCellId
                              ? {
                                  value: selectedCellId,
                                  label: selectedCell,
                                }
                              : null
                          }
                          onChange={(opt: any) => {
                            setSelectedCellId(opt?.value);
                            setSelectedCell(opt?.label || "");
                            setSelectedVillageId(undefined);
                            setSelectedVillage("");
                          }}
                          isDisabled={!selectedSectorId}
                          placeholder="Cell..."
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

                      <div>
                        <label className="text-[11px] text-slate-500 mb-0.5 block">Village</label>
                        <Select
                          options={
                            villagesData?.map((v: any) => ({
                              value: v.id,
                              label: v.name,
                            })) || []
                          }
                          value={
                            selectedVillageId
                              ? {
                                  value: selectedVillageId,
                                  label: selectedVillage,
                                }
                              : null
                          }
                          onChange={(opt: any) => {
                            setSelectedVillageId(opt?.value);
                            setSelectedVillage(opt?.label || "");
                          }}
                          isDisabled={!selectedCellId}
                          placeholder="Village..."
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
                  </div>
                </div>

                {/* Row 2: Specific Location / Address */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    2
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Location Details / Address
                    </label>
                    <Input
                      placeholder="e.g. Near Market Center, Building 4"
                      value={formData.incident_location || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          incident_location: e.target.value,
                        }))
                      }
                      className="text-xs h-9 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Proof & Description ── */}
            {step === "proof" && (
              <div className="space-y-4 pt-1 text-[14px] text-[#3c4043]">
                {/* Proof files */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    1
                  </span>
                  <div className="flex-1 space-y-2">
                    <label className="text-[12px] font-medium text-slate-700 block">
                      Supporting Evidence (Optional)
                    </label>
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#2478b8] rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-50/50">
                      <Paperclip className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">
                        Click to upload photos or documents
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PNG, JPG, PDF up to 10MB
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {proofFiles.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {proofFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100"
                          >
                            <span className="truncate max-w-[80%] font-medium text-slate-700">
                              {file.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {file.type.startsWith("image/") && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewFile({
                                      file,
                                      url: URL.createObjectURL(file),
                                    })
                                  }
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-2 select-none">
                    2
                  </span>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-slate-700 mb-1 block">
                      Incident Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Provide detailed facts about what happened (at least 10 characters)..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#2478b8] resize-none"
                    />
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>Minimum 10 characters</span>
                      <span>{formData.description.length} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer Actions Bar matching screenshot */}
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
                    {createIncident.isPending && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
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
              <p className="text-xs text-white/80 truncate max-w-[80%]">
                {previewFile.file.name}
              </p>
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
            {previewFile.file.type.startsWith("image/") && (
              <img
                src={previewFile.url}
                alt={previewFile.file.name}
                className="w-full max-h-[75vh] object-contain rounded-b-lg bg-black/40"
              />
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CompanyCreateIncidentModal;