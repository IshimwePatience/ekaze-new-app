import { useState, useEffect } from "react";
import { X, AlertTriangle, User, Tag, FileText, MapPin, Loader2, Building2, UserCheck, Star, Search, Eye, ChevronDown, Users, Briefcase, Paperclip, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCreateIncident } from "@/hooks/useIncidents";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import { useWorkers, useAvailableWorkers, useWorkersByCompany } from "@/hooks/useWorkers";
import { useCompanies, useApprovedCompanies } from "@/hooks/useCompanies";
import type { CreateIncidentRequest } from "@/types/incident.types";
import type { Worker } from "@/types/worker.types";
import type { Company } from "@/types/company.types";
import Select, { SingleValue } from "react-select";
import CreateIncidentConfirmModal from "./CreateIncidentConfirmModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define EMPTY_FORM here BEFORE it's used in the component
const EMPTY_FORM: CreateIncidentRequest = {
  worker_id: 0,
  incident_type: "theft",
  incident_subtype: null,
  description: "",
  incident_date: "",
  incident_location: "",
};

const CreateIncidentModal = ({ isOpen, onClose }: CreateIncidentModalProps) => {
  const { t } = useLanguage();
  const createIncident = useCreateIncident();
  const [formData, setFormData] = useState<CreateIncidentRequest>(EMPTY_FORM);
  
  // Worker selection
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showWorkerList, setShowWorkerList] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Company selection
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [companyWorkers, setCompanyWorkers] = useState<Worker[]>([]);
  const [companyWorkersLoading, setCompanyWorkersLoading] = useState(false);
  
  // Location state for UI selection
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [specificLocation, setSpecificLocation] = useState<string>("");

  // Location IDs for dependent dropdowns
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();
  const [selectedVillageId, setSelectedVillageId] = useState<number | undefined>();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [proofFiles, setProofFiles] = useState<File[]>([]);

  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);

const INCIDENT_TYPE_OPTIONS = [
  { value: "theft",                label: t("admin.createIncident.theft") },
  { value: "violence",             label: t("admin.createIncident.violence") },
  { value: "negligence",           label: t("admin.createIncident.negligence") },
  { value: "breach_of_contract",   label: t("admin.createIncident.breach_of_contract") },
  { value: "misconduct",           label: t("admin.createIncident.misconduct") },
  { value: "non_payment",          label: "Non-Payment" },
  { value: "unsafe_conditions",    label: "Unsafe Conditions" },
  { value: "harassment",           label: "Harassment" },
  { value: "wrongful_termination", label: "Wrongful Termination" },
  { value: "other",                label: t("admin.createIncident.other") },
];

const INCIDENT_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  theft:               [{ value: "pickpocketing", label: "Pickpocketing" }, { value: "burglary", label: "Burglary" }, { value: "fraud", label: "Fraud / Deception" }, { value: "shoplifting", label: "Shoplifting" }, { value: "other", label: "Other" }],
  violence:            [{ value: "physical_assault", label: "Physical Assault" }, { value: "sexual_harassment", label: "Sexual Harassment" }, { value: "verbal_abuse", label: "Verbal Abuse / Threats" }, { value: "domestic_violence", label: "Domestic Violence" }, { value: "other", label: "Other" }],
  negligence:          [{ value: "property_damage", label: "Property Damage" }, { value: "safety_violation", label: "Safety Violation" }, { value: "duty_abandonment", label: "Abandonment of Duty" }, { value: "other", label: "Other" }],
  breach_of_contract:  [{ value: "non_payment", label: "Non-payment Dispute" }, { value: "unauthorized_absence", label: "Unauthorized Absence" }, { value: "early_termination", label: "Early Termination" }, { value: "other", label: "Other" }],
  misconduct:          [{ value: "insubordination", label: "Insubordination" }, { value: "substance_abuse", label: "Substance Abuse" }, { value: "harassment", label: "Harassment of Colleagues" }, { value: "dishonesty", label: "Dishonesty" }, { value: "other", label: "Other" }],
  non_payment:         [{ value: "salary_withheld", label: "Salary Withheld" }, { value: "partial_payment", label: "Partial Payment" }, { value: "delayed_payment", label: "Delayed Payment" }, { value: "deductions_dispute", label: "Unauthorized Deductions" }, { value: "other", label: "Other" }],
  unsafe_conditions:   [{ value: "physical_hazard", label: "Physical Hazard" }, { value: "lack_of_equipment", label: "Lack of Safety Equipment" }, { value: "health_risk", label: "Health Risk / Exposure" }, { value: "overworking", label: "Overworking / Excessive Hours" }, { value: "other", label: "Other" }],
  harassment:          [{ value: "verbal_abuse", label: "Verbal Abuse / Threats" }, { value: "sexual_harassment", label: "Sexual Harassment" }, { value: "discrimination", label: "Discrimination" }, { value: "intimidation", label: "Intimidation / Bullying" }, { value: "other", label: "Other" }],
  wrongful_termination:[{ value: "no_notice", label: "Terminated Without Notice" }, { value: "retaliation", label: "Retaliatory Dismissal" }, { value: "unjust_cause", label: "Unjust Cause" }, { value: "other", label: "Other" }],
  other:               [{ value: "general", label: "General / Unclassified" }],
};

  // Fetch companies
  const { data: allCompaniesData, isLoading: isLoadingCompanies } = useApprovedCompanies();
  
  // Fetch workers
  const { data: allWorkersData, isLoading: isLoadingAll } = useWorkers(1);
  const { data: availableWorkersData, isLoading: isLoadingAvailable } = useAvailableWorkers();
  const { data: companyWorkersData, isLoading: isLoadingCompanyWorkers, refetch: refetchCompanyWorkers } = useWorkersByCompany(selectedCompany?.id);

  // Location hooks
  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);

  // Build formatted location string whenever any location field changes
  useEffect(() => {
    const locationParts = [
      selectedVillage,
      selectedCell,
      selectedSector,
      selectedDistrict,
      selectedProvince,
    ].filter(Boolean);

    let formattedLocation = locationParts.join(", ");
    
    if (specificLocation.trim()) {
      formattedLocation = formattedLocation 
        ? `${specificLocation}, ${formattedLocation}`
        : specificLocation;
    }

    setFormData(prev => ({
      ...prev,
      incident_location: formattedLocation
    }));
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage, specificLocation]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setSelectedWorker(null);
      setSelectedCompany(null);
      setSearchTerm("");
      setCompanySearchTerm("");
      setTypeFilter("all");
      setActiveTab("all");
      setShowWorkerList(false);
      setShowCompanyList(false);
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedSector("");
      setSelectedCell("");
      setSelectedVillage("");
      setSpecificLocation("");
      setSelectedProvinceId(undefined);
      setSelectedDistrictId(undefined);
      setSelectedSectorId(undefined);
      setSelectedCellId(undefined);
      setProofFiles([]);
      setSelectedVillageId(undefined);
    }
  }, [isOpen]);

  // Fetch company workers when company is selected
  useEffect(() => {
    if (selectedCompany?.id) {
      refetchCompanyWorkers();
    }
  }, [selectedCompany, refetchCompanyWorkers]);

  useEffect(() => {
    if (companyWorkersData?.data?.data) {
      setCompanyWorkers(companyWorkersData.data.data);
    }
  }, [companyWorkersData]);

  const handleClose = () => {
    onClose();
    setShowConfirmModal(false);
  };

  const locationDetails = {
    province: selectedProvince,
    district: selectedDistrict,
    sector: selectedSector,
    cell: selectedCell,
    village: selectedVillage,
    specificLocation: specificLocation,
  };

  // Update handleSubmit to open confirm modal instead of directly submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;
    
    if (!selectedProvince || !selectedDistrict || !selectedSector || !selectedCell || !selectedVillage) {
      alert(t("admin.createIncident.selectAllLocationFields"));
      return;
    }

    // Update form data with worker_id
setFormData(prev => ({
  ...prev,
  worker_id:   selectedWorker.id,
  province_id: selectedProvinceId ?? null,
  district_id: selectedDistrictId ?? null,
  sector_id:   selectedSectorId   ?? null,
  cell_id:     selectedCellId     ?? null,
  village_id:  selectedVillageId  ?? null,
}));
setShowConfirmModal(true);
  };

  // Add new function to handle actual API submission
const handleConfirmSubmit = async () => {
  if (!selectedWorker) return;
  try {
  await createIncident.mutateAsync({
    ...formData,
    worker_id:   selectedWorker.id,
    province_id: selectedProvinceId ?? null,
    district_id: selectedDistrictId ?? null,
    sector_id:   selectedSectorId   ?? null,
    cell_id:     selectedCellId     ?? null,
    village_id:  selectedVillageId  ?? null,
    proof_files: proofFiles.length > 0 ? proofFiles : undefined,  // ADD
  });
    setShowConfirmModal(false);
    handleClose();
  } catch {
    // Error handled by mutation hook
  }
};

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "company") {
      setShowWorkerList(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyList(false);
    setCompanySearchTerm("");
    setActiveTab("company");
    setSelectedWorker(null);
  };

  const handleClearCompany = () => {
    setSelectedCompany(null);
    setCompanyWorkers([]);
    setSelectedWorker(null);
  };

  // Get filtered companies
  const rawAllCompanies: any[] = Array.isArray(allCompaniesData?.data)
    ? allCompaniesData.data
    : (Array.isArray(allCompaniesData?.data?.data) ? allCompaniesData.data.data : []);
  const filteredCompanies = rawAllCompanies.filter((company) => {
    const name = company.business_name || company.company_name || "";
    const tin = company.tin || company.tin_number || "";
    const matchesSearch =
      name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      company.id?.toString().includes(companySearchTerm) ||
      tin.toLowerCase().includes(companySearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get workers based on active tab and filters
  const getWorkers = (): Worker[] => {
    if (activeTab === "company" && selectedCompany) {
      return companyWorkers;
    }
    
    switch (activeTab) {
      case "available":
        return availableWorkersData?.data?.data || [];
      case "all":
      default:
        return allWorkersData?.data?.data || [];
    }
  };

  const filteredWorkers = getWorkers().filter((worker) => {
    const fullName = `${worker.first_name} ${worker.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      worker.id.toString().includes(searchTerm) ||
      worker.user.national_id.includes(searchTerm);
    const matchesType =
      typeFilter === "all" || 
      typeFilter === "available" || 
      worker.registration_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const isLoading = () => {
    if (activeTab === "company" && selectedCompany) {
      return companyWorkersLoading || isLoadingCompanyWorkers;
    }
    switch (activeTab) {
      case "available":
        return isLoadingAvailable;
      default:
        return isLoadingAll;
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      available: t("admin.createIncident.available"),
      hired: t("admin.createIncident.hired"),
      unavailable: t("admin.createIncident.unavailable"),
      pending: t("admin.createIncident.pending"),
      approved: t("admin.createIncident.approved"),
      suspended: t("admin.createIncident.suspended"),
    };
    return statusMap[status] || status;
  };

  const selectedIncidentType = INCIDENT_TYPE_OPTIONS.find((o) => o.value === formData.incident_type) || null;

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      hired: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
      unavailable: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      suspended: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                <h2 className="text-xl font-bold text-foreground">{t("admin.createIncident.title")}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("admin.createIncident.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Worker Selection with Company Filter */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("admin.createIncident.selectWorker")}</h3>
              </div>

              {selectedWorker ? (
                <div className="border border-border/50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedWorker.user.profile_photo || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedWorker.first_name[0]}
                          {selectedWorker.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {selectedWorker.first_name} {selectedWorker.last_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {t("admin.createIncident.id")}: {selectedWorker.id}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {selectedWorker.registration_type === "company" ? (
                              <>
                                <Building2 className="w-3 h-3 mr-1" />
                                {t("admin.createIncident.company")}
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                {t("admin.createIncident.freelance")}
                              </>
                            )}
                          </Badge>
                          {parseFloat(selectedWorker.average_rating) > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs">
                                {parseFloat(selectedWorker.average_rating).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {selectedWorker.user.phone}
                          </p>
                          <Badge
                            className={`text-[10px] ${getStatusBadge(
                              selectedWorker.availability_status
                            )}`}
                          >
                            {getStatusText(selectedWorker.availability_status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWorker(null);
                        setFormData(prev => ({ ...prev, worker_id: 0 }));
                      }}
                      className="h-8 text-xs"
                    >
                      {t("admin.createIncident.changeWorker")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Company Selection */}
                  <div className="border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">{t("admin.createIncident.filterByCompany")}</h4>
                    </div>
                    
                    {selectedCompany ? (
                      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{selectedCompany.business_name}</p>
                            <p className="text-xs text-muted-foreground">TIN: {selectedCompany.tin}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearCompany}
                          className="h-7 px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder={t("admin.createIncident.searchCompanyPlaceholder")}
                            value={companySearchTerm}
                            onChange={(e) => setCompanySearchTerm(e.target.value)}
                            className="pl-10 h-9 text-xs"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCompanyList(!showCompanyList)}
                            className="h-8 text-xs"
                          >
                            {showCompanyList ? t("admin.createIncident.hideCompanies") : t("admin.createIncident.browseCompanies")}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {filteredCompanies.length} {t("admin.createIncident.companiesCount")}
                          </span>
                        </div>

                        {showCompanyList && (
                          <div className="border border-border/50 rounded-lg mt-2 max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                            {isLoadingCompanies ? (
                              <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                                <p className="text-xs text-muted-foreground mt-2">{t("admin.createIncident.loadingCompanies")}</p>
                              </div>
                            ) : filteredCompanies.length === 0 ? (
                              <div className="p-8 text-center">
                                <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
                                  <Building2 className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium">{t("admin.createIncident.noCompaniesFound")}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t("admin.createIncident.tryAdjustingSearch")}
                                </p>
                              </div>
                            ) : (
                              <div className="divide-y divide-border/50">
                                {filteredCompanies.map((company) => (
                                  <button
                                    key={company.id}
                                    type="button"
                                    onClick={() => handleSelectCompany(company)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left group"
                                  >
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                      <Building2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                          {company.business_name}
                                        </p>
                                        <Badge className={`text-[10px] ${getStatusBadge(company.status)}`}>
                                          {getStatusText(company.status)}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 mt-0.5">
                                        <p className="text-xs text-muted-foreground">
                                          {t("admin.createIncident.id")}: {company.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          TIN: {company.tin}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {t("admin.createIncident.workersCount")}: {company.total_workers || 0}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Worker Tabs */}
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {t("admin.createIncident.allWorkers")}
                      </TabsTrigger>
                      <TabsTrigger value="available" className="text-xs">
                        <UserCheck className="w-3 h-3 mr-1" />
                        {t("admin.createIncident.availableWorkers")}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="company" 
                        className="text-xs"
                        disabled={!selectedCompany}
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        {selectedCompany ? t("admin.createIncident.companyWorkers") : t("admin.createIncident.selectCompanyFirst")}
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 space-y-3">
                      {/* Search and Filter */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder={t("admin.createIncident.searchWorkerPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-9 text-xs"
                          />
                        </div>
                        <ShadcnSelect value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
                            <SelectValue placeholder={t("admin.createIncident.workerType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">{t("admin.createIncident.allTypes")}</SelectItem>
                            <SelectItem value="company" className="text-xs">{t("admin.createIncident.company")}</SelectItem>
                            <SelectItem value="freelance" className="text-xs">{t("admin.createIncident.freelance")}</SelectItem>
                          </SelectContent>
                        </ShadcnSelect>
                      </div>

                      {/* Worker List */}
                      <div className="border border-border/50 rounded-lg max-h-[300px] overflow-y-auto">
                        {isLoading() ? (
                          <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-2">{t("admin.createIncident.loadingWorkers")}</p>
                          </div>
                        ) : filteredWorkers.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">{t("admin.createIncident.noWorkersFound")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activeTab === "company" && selectedCompany
                                ? t("admin.createIncident.noWorkersInCompany")
                                : t("admin.createIncident.tryAdjustingSearchOrFilters")}
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {filteredWorkers.map((worker) => (
                              <button
                                key={worker.id}
                                type="button"
                                onClick={() => {
                                  setSelectedWorker(worker);
                                  setShowWorkerList(false);
                                  setSearchTerm("");
                                }}
                                className="w-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors text-left group"
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={worker.user.profile_photo || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {worker.first_name[0]}
                                    {worker.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {worker.first_name} {worker.last_name}
                                      </p>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <p className="text-xs text-muted-foreground">
                                          {t("admin.createIncident.id")}: {worker.id}
                                        </p>
                                        <Badge variant="outline" className="text-[10px]">
                                          {worker.registration_type === "company" ? (
                                            <>
                                              <Building2 className="w-3 h-3 mr-1" />
                                              {t("admin.createIncident.company")}
                                            </>
                                          ) : (
                                            <>
                                              <UserCheck className="w-3 h-3 mr-1" />
                                              {t("admin.createIncident.freelance")}
                                            </>
                                          )}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {parseFloat(worker.average_rating) > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                          <span className="text-xs">
                                            {parseFloat(worker.average_rating).toFixed(1)}
                                          </span>
                                        </div>
                                      )}
                                      <Badge
                                        className={`text-[10px] ${getStatusBadge(
                                          worker.availability_status
                                        )}`}
                                      >
                                        {getStatusText(worker.availability_status)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {worker.user.phone}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {worker.user.email}
                                    </p>
                                    {worker.company && (
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {worker.company.business_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Details */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("admin.createIncident.incidentDetails")}</h3>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <Label className="text-xs mb-1 block">{t("admin.createIncident.incidentType")}</Label>
    <Select
      options={INCIDENT_TYPE_OPTIONS}
      value={selectedIncidentType}
      onChange={(option: SingleValue<{ value: string; label: string }>) =>
        setFormData({
          ...formData,
          incident_type: (option?.value ?? "theft") as CreateIncidentRequest["incident_type"],
          incident_subtype: null,
        })
      }
      placeholder={t("admin.createIncident.selectType")}
      isSearchable
      className="react-select-container"
      classNamePrefix="react-select"
    />
  </div>

  <div>
    <Label className="text-xs mb-1 block">Subtype</Label>
    <Select
      options={INCIDENT_SUBTYPES[formData.incident_type] ?? []}
      value={(INCIDENT_SUBTYPES[formData.incident_type] ?? []).find(o => o.value === formData.incident_subtype) ?? null}
      onChange={(option: SingleValue<{ value: string; label: string }>) =>
        setFormData({ ...formData, incident_subtype: option?.value ?? null })
      }
      isClearable
      placeholder="Select subtype..."
      className="react-select-container"
      classNamePrefix="react-select"
    />
  </div>
</div>
              <div>
                <Label htmlFor="incident_date" className="text-xs mb-1 block">
                  {t("admin.createIncident.incidentDate")}
                </Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="text-xs h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("admin.createIncident.location")}</h3>
              </div>

              {/* Location Preview */}
              {formData.incident_location && (
                <div className="bg-muted/30 p-3 rounded-lg mb-2">
                  <p className="text-xs text-muted-foreground mb-1">{t("admin.createIncident.fullLocation")}</p>
                  <p className="text-sm font-medium">{formData.incident_location}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block">{t("admin.createIncident.province")}</Label>
                  <Select
                    options={provincesData?.map((p) => ({ value: p.id, label: p.name })) || []}
                    onChange={(option: SingleValue<{ value: number; label: string }>) => {
                      if (option) {
                        setSelectedProvinceId(option.value);
                        setSelectedProvince(option.label);
                        setSelectedDistrictId(undefined);
                        setSelectedSectorId(undefined);
                        setSelectedCellId(undefined);
                        setSelectedDistrict("");
                        setSelectedSector("");
                        setSelectedCell("");
                        setSelectedVillage("");
                        
                      } else {
                        setSelectedProvinceId(undefined);
                        setSelectedProvince("");
                        setSelectedDistrictId(undefined);
                        setSelectedSectorId(undefined);
                        setSelectedCellId(undefined);
                        setSelectedVillageId(undefined); 
                        setSelectedDistrict("");
                        setSelectedSector("");
                        setSelectedCell("");
                        setSelectedVillage("");
                      }
                    }}
                    value={selectedProvince ? { value: selectedProvinceId, label: selectedProvince } : null}
                    placeholder={t("admin.createIncident.selectProvince")}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1 block">{t("admin.createIncident.district")}</Label>
                  <Select
                    options={districtsData?.map((d) => ({ value: d.id, label: d.name })) || []}
                    onChange={(option: SingleValue<{ value: number; label: string }>) => {
                      if (option) {
                        setSelectedDistrictId(option.value);
                        setSelectedDistrict(option.label);
                        setSelectedSectorId(undefined);
                        setSelectedCellId(undefined);
                        setSelectedSector("");
                        setSelectedCell("");
                        setSelectedVillage("");
                      } else {
                        setSelectedDistrictId(undefined);
                        setSelectedDistrict("");
                        setSelectedSectorId(undefined);
                        setSelectedCellId(undefined);
                        setSelectedVillageId(undefined); 
                        setSelectedSector("");
                        setSelectedCell("");
                        setSelectedVillage("");
                      }
                    }}
                    value={selectedDistrict ? { value: selectedDistrictId, label: selectedDistrict } : null}
                    placeholder={t("admin.createIncident.selectDistrict")}
                    isDisabled={!selectedProvinceId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block">{t("admin.createIncident.sector")}</Label>
                  <Select
                    options={sectorsData?.map((s) => ({ value: s.id, label: s.name })) || []}
                    onChange={(option: SingleValue<{ value: number; label: string }>) => {
                      if (option) {
                        setSelectedSectorId(option.value);
                        setSelectedSector(option.label);
                        setSelectedCellId(undefined);
                        setSelectedCell("");
                        setSelectedVillage("");
                      } else {
                        setSelectedSectorId(undefined);
                        setSelectedSector("");
                        setSelectedCellId(undefined);
                        setSelectedVillageId(undefined); 
                        setSelectedCell("");
                        setSelectedVillage("");
                      }
                    }}
                    value={selectedSector ? { value: selectedSectorId, label: selectedSector } : null}
                    placeholder={t("admin.createIncident.selectSector")}
                    isDisabled={!selectedDistrictId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1 block">{t("admin.createIncident.cell")}</Label>
                  <Select
                    options={cellsData?.map((c) => ({ value: c.id, label: c.name })) || []}
                    onChange={(option: SingleValue<{ value: number; label: string }>) => {
                      if (option) {
                        setSelectedCellId(option.value);
                        setSelectedCell(option.label);
                        setSelectedVillage("");
                      } else {
                        setSelectedCellId(undefined);
                        setSelectedVillageId(undefined); 
                        setSelectedCell("");
                        setSelectedVillage("");
                      }
                    }}
                    value={selectedCell ? { value: selectedCellId, label: selectedCell } : null}
                    placeholder={t("admin.createIncident.selectCell")}
                    isDisabled={!selectedSectorId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1 block">{t("admin.createIncident.village")}</Label>
                <Select
                  options={villagesData?.map((v) => ({ value: v.id, label: v.name })) || []}
                  onChange={(option: SingleValue<{ value: number; label: string }>) => {
                    if (option) {
                      setSelectedVillageId(option.value);
                      setSelectedVillage(option.label);
                    } else {
                      setSelectedVillageId(undefined);
                      setSelectedVillage("");
                    }
                  }}
                  value={selectedVillage ? { value: villagesData?.find(v => v.name === selectedVillage)?.id, label: selectedVillage } : null}
                  placeholder={t("admin.createIncident.selectVillage")}
                  isDisabled={!selectedCellId}
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card style={{ borderRadius: "12px" }}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("admin.createIncident.description")}</h3>
              </div>

              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder={t("admin.createIncident.descriptionPlaceholder")}
                minHeight={200}
              />
            </CardContent>
          </Card>

          {/* Proof Files */}
    <Card style={{ borderRadius: "12px" }}>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Paperclip className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">{t("admin.incidentManagement.proofFiles")}</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {proofFiles.length}/5 files
          </span>
        </div>

        {/* Upload Area */}
        {proofFiles.length < 5 && (
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
            <Paperclip className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground text-center">
              Click to upload proof files<br />
              <span className="text-[10px]">PDF, Images, Videos — max 5MB each, up to {5 - proofFiles.length} more</span>
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
                if (invalid.length > 0) {
                  alert(`${invalid.length} file(s) exceed 5MB and were skipped.`);
                }
                const combined = [...proofFiles, ...valid].slice(0, 5);
                setProofFiles(combined);
                e.target.value = "";
              }}
            />
          </label>
        )}

          {proofFiles.length > 0 && (
            <div className="space-y-2">
              {proofFiles.map((file, index) => {
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
                      {/* Thumbnail */}
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
                        onClick={() => setProofFiles(prev => prev.filter((_, i) => i !== index))}
                        className="h-7 w-7 p-0 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
              </CardContent>
            </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createIncident.isPending}
              className="w-1/4 h-9 text-xs"
            >
              {t("admin.createIncident.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                createIncident.isPending || 
                !selectedWorker ||
                !selectedProvince ||
                !selectedDistrict ||
                !selectedSector ||
                !selectedCell ||
                !selectedVillage
              }
              className="w-1/4 h-9 text-xs"
            >
              {createIncident.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {createIncident.isPending ? t("admin.createIncident.creating") : t("admin.createIncident.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
      <CreateIncidentConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        selectedWorker={selectedWorker}
        isPending={createIncident.isPending}
        locationDetails={locationDetails}
      />
      {/* File Preview Overlay */}
{previewFile && (
  <div
    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
    onClick={() => { previewFile && URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}
  >
    <div
      className="relative max-w-3xl max-h-[85vh] w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
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
      {/* Content */}
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

export default CreateIncidentModal;