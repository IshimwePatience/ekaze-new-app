import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TranslationPath } from "@/contexts/LanguageContext";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Shield,
  Building2,
  Briefcase,
  HardHat,
  X,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Globe,
} from "lucide-react";
import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import type { CreateUserRequest } from "@/types/user.types";
import ReactSelect from 'react-select';
import type { SingleValue, MultiValue } from 'react-select';
import type { User } from "@/types/user.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

type UserRole = 'admin' | 'supervisor' | 'company' | 'employer' | 'worker' | 'police' | null;

interface CompanyData {
  business_name: string;
  tin: string;
  physical_address: string;
  logo?: File | null;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_password: string;
  owner_password_confirmation: string;
  subscription_fee?: number;
}

interface EmployerData {
  has_paid_registration?: boolean;
}

interface WorkerData {
  first_name: string;
  last_name: string;
  worker_email: string;
  worker_phone: string;
  worker_password: string;
  worker_password_confirmation: string;
  experience_level: 'beginner' | 'intermediate' | 'expert';
  languages_spoken: string[];
  work_type_preferences: string[];
  preferred_districts: string[];
  min_salary: number;
  max_salary: number;
  has_insurance: boolean;
  insurance_provider?: string;
  insurance_number?: string;
}

interface SubmitData extends CreateUserRequest {
  business_name?: string;
  tin?: string;
  physical_address?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  subscription_fee?: number;
  logo?: File;
  first_name?: string;
  last_name?: string;
  experience_level?: string;
  languages_spoken?: string[];
  work_type_preferences?: string[];
  preferred_districts?: string[];
  min_salary?: number;
  max_salary?: number;
  has_insurance?: number;
  insurance_provider?: string;
  insurance_number?: string;
}

const CreateUserModal = ({ isOpen, onClose, defaultRole }: CreateUserModalProps) => {

  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateUserRequest>({
    role: 'worker',
    name: '',
    email: '',
    phone: '',
    national_id: '',
    gender: 'male',
    date_of_birth: '',
    password: '',
    password_confirmation: '',
    address: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    status: 'active',
  });
const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole ?? null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Company specific data
  const [companyData, setCompanyData] = useState<CompanyData>({
    business_name: '',
    tin: '',
    physical_address: '',
    logo: null,
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirmation: '',
    subscription_fee: 1000,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);
  const [showCompanyConfirmPassword, setShowCompanyConfirmPassword] = useState(false);

  // Worker specific data
  const [workerData, setWorkerData] = useState<WorkerData>({
    first_name: '',
    last_name: '',
    worker_email: '',
    worker_phone: '',
    worker_password: '',
    worker_password_confirmation: '',
    experience_level: 'beginner',
    languages_spoken: [],
    work_type_preferences: [],
    preferred_districts: [],
    min_salary: 0,
    max_salary: 0,
    has_insurance: false,
  });
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);
  const [showWorkerConfirmPassword, setShowWorkerConfirmPassword] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectAllDistricts, setSelectAllDistricts] = useState(false);

  // Location state
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();

  // Location hooks
  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);
  const { data: allDistrictsData } = useDistricts();

  const createUser = useCreateUser();
  const { toast } = useToast();

  const ROLE_OPTIONS = [
    { value: 'company', label: t("admin.createUser.company"), icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { value: 'admin', label: t("admin.createUser.admin"), icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const GENDER_OPTIONS = [
    { value: 'male', label: t("admin.createUser.male") },
    { value: 'female', label: t("admin.createUser.female") },
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: t("admin.createUser.active") },
    { value: 'pending', label: t("admin.createUser.pending") },
    { value: 'inactive', label: t("admin.createUser.inactive") },
  ];

  const EXPERIENCE_LEVELS = [
    { value: 'beginner', label: t("admin.createUser.beginner") },
    { value: 'intermediate', label: t("admin.createUser.intermediate") },
    { value: 'expert', label: t("admin.createUser.expert") },
  ];

  const LANGUAGES = [
    t("admin.createUser.kinyarwanda"),
    t("admin.createUser.english"),
    t("admin.createUser.french"),
    t("admin.createUser.swahili")
  ];

  const WORK_TYPES = ['full_time', 'part_time', 'contract', 'temporary'];

  // Update formData when role changes
  useEffect(() => {
    if (selectedRole) {
      setFormData(prev => ({ ...prev, role: selectedRole }));
    }
    
    // Reset role-specific data
    if (selectedRole === 'worker') {
      setWorkerData({
        first_name: formData.name.split(' ')[0] || '',
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
        worker_email: '',
        worker_phone: '',
        worker_password: '',
        worker_password_confirmation: '',
        experience_level: 'beginner',
        languages_spoken: [],
        work_type_preferences: [],
        preferred_districts: [],
        min_salary: 0,
        max_salary: 0,
        has_insurance: false,
      });
    }
  }, [selectedRole, formData.name]);

  const handleRoleChange = (role: Exclude<UserRole, null>) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    setActiveTab("basic");
    // Reset location state
    setSelectedProvinceId(undefined);
    setSelectedDistrictId(undefined);
    setSelectedSectorId(undefined);
    setSelectedCellId(undefined);
  };

  const handleClose = () => {
    setFormData({
      role: 'worker',
      name: '',
      email: '',
      phone: '',
      national_id: '',
      gender: 'male',
      date_of_birth: '',
      password: '',
      password_confirmation: '',
      address: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      status: 'active',
    });
    setSelectedRole(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setActiveTab("basic");
    setCompanyData({
      business_name: '',
      tin: '',
      physical_address: '',
      logo: null,
      owner_name: '',
      owner_phone: '',
      owner_email: '',
      owner_password: '',
      owner_password_confirmation: '',
      subscription_fee: 50000,
    });
    setLogoPreview(null);
    setShowCompanyPassword(false);
    setShowCompanyConfirmPassword(false);
    setWorkerData({
      first_name: '',
      last_name: '',
      worker_email: '',
      worker_phone: '',
      worker_password: '',
      worker_password_confirmation: '',
      experience_level: 'beginner',
      languages_spoken: [],
      work_type_preferences: [],
      preferred_districts: [],
      min_salary: 0,
      max_salary: 0,
      has_insurance: false,
    });
    setShowWorkerPassword(false);
    setShowWorkerConfirmPassword(false);
    setSelectedLanguages([]);
    setSelectedWorkTypes([]);
    setSelectedDistricts([]);
    setSelectAllDistricts(false);
    setSelectedProvinceId(undefined);
    setSelectedDistrictId(undefined);
    setSelectedSectorId(undefined);
    setSelectedCellId(undefined);
    onClose();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyData({ ...companyData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (list: string[]) => void,
    field: keyof WorkerData
  ) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    setter(newList);
    setWorkerData({ ...workerData, [field]: newList });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Role-specific validation
    if (selectedRole === 'company') {
      if (!companyData.business_name || !companyData.tin || !companyData.physical_address || 
          !companyData.owner_name || !companyData.owner_phone || !companyData.owner_email ||
          !companyData.owner_password || !companyData.owner_password_confirmation) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.fillCompanyRequired"),
          variant: "destructive",
        });
        return;
      }

      if (companyData.owner_password !== companyData.owner_password_confirmation) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.ownerPasswordsDoNotMatch"),
          variant: "destructive",
        });
        return;
      }

      if (companyData.owner_password.length < 8) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.passwordMinLength"),
          variant: "destructive",
        });
        return;
      }
    } else if (selectedRole === 'worker') {
      if (!workerData.first_name || !workerData.last_name || !workerData.worker_email || 
          !workerData.worker_phone || !workerData.worker_password || 
          !workerData.worker_password_confirmation || !workerData.experience_level ||
          workerData.languages_spoken.length === 0 || workerData.work_type_preferences.length === 0 ||
          workerData.preferred_districts.length === 0 || workerData.min_salary <= 0 || 
          workerData.max_salary <= 0) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.fillWorkerRequired"),
          variant: "destructive",
        });
        return;
      }

      if (workerData.worker_password !== workerData.worker_password_confirmation) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.workerPasswordsDoNotMatch"),
          variant: "destructive",
        });
        return;
      }

      if (workerData.worker_password.length < 8) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.passwordMinLength"),
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validation for other roles
      if (formData.password !== formData.password_confirmation) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.passwordsDoNotMatch"),
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: t("admin.createUser.validationError"),
          description: t("admin.createUser.passwordMinLength"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Prepare data based on role
      let submitData: SubmitData = { ...formData };

      if (selectedRole === 'company') {
        submitData = {
          ...submitData,
          name: companyData.owner_name,
          email: companyData.owner_email,
          phone: companyData.owner_phone,
          password: companyData.owner_password,
          password_confirmation: companyData.owner_password_confirmation,
          business_name: companyData.business_name,
          tin: companyData.tin,
          physical_address: companyData.physical_address,
          owner_name: companyData.owner_name,
          owner_phone: companyData.owner_phone,
          owner_email: companyData.owner_email,
          subscription_fee: companyData.subscription_fee,
        };
        if (companyData.logo) {
          submitData.logo = companyData.logo;
        }
      }

      if (selectedRole === 'worker') {
        submitData = {
          ...submitData,
          name: `${workerData.first_name} ${workerData.last_name}`,
          email: workerData.worker_email,
          phone: workerData.worker_phone,
          password: workerData.worker_password,
          password_confirmation: workerData.worker_password_confirmation,
          first_name: workerData.first_name,
          last_name: workerData.last_name,
          experience_level: workerData.experience_level,
          languages_spoken: workerData.languages_spoken,
          work_type_preferences: workerData.work_type_preferences,
          preferred_districts: workerData.preferred_districts,
          min_salary: workerData.min_salary,
          max_salary: workerData.max_salary,
          has_insurance: workerData.has_insurance ? 1 : 0,
        };
        if (workerData.has_insurance) {
          submitData.insurance_provider = workerData.insurance_provider;
          submitData.insurance_number = workerData.insurance_number;
        }
      }

      await createUser.mutateAsync(submitData);
      toast({
        title: "Success",
        description: t("admin.createUser.userCreated").replace("{role}", selectedRole ? t(`admin.createUser.${selectedRole}`) : ''),
        variant: "success",
      });
      handleClose();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const RoleIcon = ROLE_OPTIONS.find(r => r.value === selectedRole)?.icon || UserIcon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-7xl max-h-[92vh] overflow-y-auto p-0"
        style={{ borderRadius: "12px" }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${selectedRole ? ROLE_OPTIONS.find(r => r.value === selectedRole)?.bg || 'bg-primary/10' : 'bg-primary/10'}`}>
                <RoleIcon className={`w-5 h-5 ${selectedRole ? ROLE_OPTIONS.find(r => r.value === selectedRole)?.color || 'text-primary' : 'text-primary'}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("admin.createUser.title")}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedRole 
                    ? t("admin.createUser.subtitleWithRole").replace("{role}", t(`admin.createUser.${selectedRole}`))
                    : t("admin.createUser.subtitle")}
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

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("admin.createUser.selectRole")}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleChange(role.value as Exclude<UserRole, null>)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 relative ${
                        isSelected
                          ? `${role.bg} border-${role.color.split('-')[1]}-500 dark:border-${role.color.split('-')[1]}-400`
                          : 'border-border/50 hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className={`w-6 h-6 ${role.color}`} />
                        <span className="text-xs font-medium">{role.label}</span>
                        {isSelected && (
                          <CheckCircle2 className={`w-4 h-4 ${role.color} absolute top-2 right-2`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Only show form content if a role is selected */}
            {selectedRole && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic" className="text-xs">
                    <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                    {t("admin.createUser.basicInformation")}
                  </TabsTrigger>
                  <TabsTrigger value="address" className="text-xs">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {t("admin.createUser.addressLocation")}
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="mt-4 space-y-4 animate-slide-up">
                  {selectedRole === 'worker' ? (
                    <div className="space-y-6">
                      {/* Worker Personal Information */}
                      <Card style={{ borderRadius: '12px' }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <UserIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("admin.createUser.workerPersonalInfo")}</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="worker_first_name" className="text-xs">
                                {t("admin.createUser.firstName")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="worker_first_name"
                                value={workerData.first_name}
                                onChange={(e) => setWorkerData({ ...workerData, first_name: e.target.value })}
                                placeholder={t("admin.createUser.firstNamePlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="worker_last_name" className="text-xs">
                                {t("admin.createUser.lastName")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="worker_last_name"
                                value={workerData.last_name}
                                onChange={(e) => setWorkerData({ ...workerData, last_name: e.target.value })}
                                placeholder={t("admin.createUser.lastNamePlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="worker_email" className="text-xs">
                                {t("admin.createUser.emailAddress")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="worker_email"
                                type="email"
                                value={workerData.worker_email}
                                onChange={(e) => setWorkerData({ ...workerData, worker_email: e.target.value })}
                                placeholder={t("admin.createUser.workerEmailPlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="worker_phone" className="text-xs">
                                {t("admin.createUser.phoneNumber")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="worker_phone"
                                value={workerData.worker_phone}
                                onChange={(e) => setWorkerData({ ...workerData, worker_phone: e.target.value })}
                                placeholder={t("admin.createUser.phonePlaceholder")}
                                maxLength={10}
                                minLength={10}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="worker_password" className="text-xs">
                                {t("admin.createUser.password")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="worker_password"
                                  type={showWorkerPassword ? "text" : "password"}
                                  placeholder={t("admin.createUser.passwordPlaceholder")}
                                  value={workerData.worker_password}
                                  onChange={(e) => setWorkerData({ ...workerData, worker_password: e.target.value })}
                                  className="text-xs h-9 pr-9"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowWorkerPassword(!showWorkerPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showWorkerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="worker_password_confirmation" className="text-xs">
                                {t("admin.createUser.confirmPassword")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="worker_password_confirmation"
                                  type={showWorkerConfirmPassword ? "text" : "password"}
                                  placeholder={t("admin.createUser.confirmPasswordPlaceholder")}
                                  value={workerData.worker_password_confirmation}
                                  onChange={(e) => setWorkerData({ ...workerData, worker_password_confirmation: e.target.value })}
                                  className="text-xs h-9 pr-9"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowWorkerConfirmPassword(!showWorkerConfirmPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showWorkerConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Work Preferences */}
                      <Card style={{ borderRadius: '12px' }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("admin.createUser.workPreferences")}</h3>
                          </div>

                          <div>
                            <Label className="text-xs mb-1 block">{t("admin.createUser.experienceLevel")} <span className="text-red-500">{t("admin.createUser.required")}</span></Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {EXPERIENCE_LEVELS.map(level => (
                                <Badge
                                  key={level.value}
                                  variant={workerData.experience_level === level.value ? 'default' : 'outline'}
                                  className="cursor-pointer px-3 py-1.5 text-xs"
                                  onClick={() => setWorkerData({ ...workerData, experience_level: level.value as WorkerData['experience_level'] })}
                                >
                                  {level.label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs mb-1 block">{t("admin.createUser.languagesSpoken")} <span className="text-red-500">{t("admin.createUser.required")}</span></Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {LANGUAGES.map(lang => (
                                <Badge
                                  key={lang}
                                  variant={selectedLanguages.includes(lang) ? 'default' : 'outline'}
                                  className="cursor-pointer px-3 py-1.5 text-xs"
                                  onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages, 'languages_spoken')}
                                >
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs mb-1 block">{t("admin.createUser.workTypes")} <span className="text-red-500">{t("admin.createUser.required")}</span></Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {WORK_TYPES.map(type => (
                                <Badge
                                  key={type}
                                  variant={selectedWorkTypes.includes(type) ? 'default' : 'outline'}
                                  className="cursor-pointer px-3 py-1.5 text-xs capitalize"
                                  onClick={() => {
                                    setSelectedWorkTypes([type]);
                                    setValue('work_type_preferences', [type], { shouldValidate: true });
                                  }}
                                >
                                {t(`admin.createUser.${type}` as TranslationPath)}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs">{t("admin.createUser.preferredWorkDistricts")} <span className="text-red-500">{t("admin.createUser.required")}</span></Label>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="select_all_districts"
                                  checked={selectAllDistricts}
                                  onCheckedChange={(checked) => {
                                    setSelectAllDistricts(checked as boolean);
                                    if (checked) {
                                      const allDistricts = allDistrictsData?.map(d => d.name) || [];
                                      setSelectedDistricts(allDistricts);
                                      setWorkerData({ ...workerData, preferred_districts: allDistricts });
                                    } else {
                                      setSelectedDistricts([]);
                                      setWorkerData({ ...workerData, preferred_districts: [] });
                                    }
                                  }}
                                />
                                <Label htmlFor="select_all_districts" className="cursor-pointer text-xs font-normal">
                                  {t("admin.createUser.selectAllDistricts")}
                                </Label>
                              </div>
                            </div>
                            <ReactSelect
                              isMulti
                              value={selectedDistricts.map(d => ({ value: d, label: d }))}
                              options={allDistrictsData?.map(d => ({ value: d.name, label: d.name })) || []}
                              onChange={(options: MultiValue<{ value: string; label: string }>) => {
                                const selected = options.map(opt => opt.value);
                                setSelectedDistricts(selected);
                                setWorkerData({ ...workerData, preferred_districts: selected });
                                setSelectAllDistricts(selected.length === (allDistrictsData?.length || 0));
                              }}
                              placeholder={t("admin.createUser.searchDistrictsPlaceholder")}
                              className="react-select-container text-xs"
                              classNamePrefix="react-select"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="min_salary" className="text-xs">
                                {t("admin.createUser.minSalary")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="min_salary"
                                type="number"
                                value={workerData.min_salary || ''}
                                onChange={(e) => setWorkerData({ ...workerData, min_salary: parseInt(e.target.value) || 0 })}
                                placeholder={t("admin.createUser.minSalaryPlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="max_salary" className="text-xs">
                                {t("admin.createUser.maxSalary")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="max_salary"
                                type="number"
                                value={workerData.max_salary || ''}
                                onChange={(e) => setWorkerData({ ...workerData, max_salary: parseInt(e.target.value) || 0 })}
                                placeholder={t("admin.createUser.maxSalaryPlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Insurance */}
                      <Card style={{ borderRadius: '12px' }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("admin.createUser.insuranceInformation")}</h3>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_insurance"
                              checked={workerData.has_insurance}
                              onCheckedChange={(checked) => setWorkerData({ ...workerData, has_insurance: checked as boolean })}
                            />
                            <Label htmlFor="has_insurance" className="cursor-pointer text-xs">
                              {t("admin.createUser.hasInsurance")}
                            </Label>
                          </div>

                          {workerData.has_insurance && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="insurance_provider" className="text-xs">{t("admin.createUser.insuranceProvider")}</Label>
                                <Input
                                  id="insurance_provider"
                                  value={workerData.insurance_provider || ''}
                                  onChange={(e) => setWorkerData({ ...workerData, insurance_provider: e.target.value })}
                                  placeholder={t("admin.createUser.insuranceProviderPlaceholder")}
                                  className="text-xs h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="insurance_number" className="text-xs">{t("admin.createUser.insuranceNumber")}</Label>
                                <Input
                                  id="insurance_number"
                                  value={workerData.insurance_number || ''}
                                  onChange={(e) => setWorkerData({ ...workerData, insurance_number: e.target.value })}
                                  placeholder={t("admin.createUser.insuranceNumberPlaceholder")}
                                  className="text-xs h-9"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : selectedRole === 'company' ? (
                    <div className="space-y-6">
                      <Card style={{ borderRadius: '12px' }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("admin.createUser.companyInformation")}</h3>
                          </div>

                          <div>
                            <Label htmlFor="business_name" className="text-xs">
                              {t("admin.createUser.businessName")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                            </Label>
                            <Input
                              id="business_name"
                              value={companyData.business_name}
                              onChange={(e) => setCompanyData({ ...companyData, business_name: e.target.value })}
                              placeholder={t("admin.createUser.businessNamePlaceholder")}
                              className="text-xs h-9"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="tin" className="text-xs">
                              {t("admin.createUser.tin")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                            </Label>
                            <Input
                              id="tin"
                              value={companyData.tin}
                              onChange={(e) => setCompanyData({ ...companyData, tin: e.target.value })}
                              placeholder={t("admin.createUser.tinPlaceholder")}
                              maxLength={12}
                              className="text-xs h-9"
                              minLength={12}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="physical_address" className="text-xs">
                              {t("admin.createUser.physicalAddress")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                            </Label>
                            <Input
                              id="physical_address"
                              value={companyData.physical_address}
                              onChange={(e) => setCompanyData({ ...companyData, physical_address: e.target.value })}
                              placeholder={t("admin.createUser.physicalAddressPlaceholder")}
                              className="text-xs h-9"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="logo" className="text-xs">{t("admin.createUser.companyLogo")}</Label>
                            <Input
                              id="logo"
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handleLogoChange}
                              className="text-xs h-9 file:text-xs"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("admin.createUser.logoUploadHint")}
                            </p>
                            {logoPreview && (
                              <img src={logoPreview} alt="Logo Preview" className="mt-2 h-20 w-20 rounded object-contain border" />
                            )}
                          </div>

                          <div>
                            <Label htmlFor="subscription_fee" className="text-xs">
                              {t("admin.createUser.subscriptionFee")}
                            </Label>
                            <Input
                              id="subscription_fee"
                              type="number"
                              value={companyData.subscription_fee}
                              onChange={(e) => setCompanyData({ ...companyData, subscription_fee: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                              className="text-xs h-9"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("admin.createUser.subscriptionFeeHint")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card style={{ borderRadius: '12px' }}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <UserIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">{t("admin.createUser.ownerInformation")}</h3>
                          </div>

                          <div>
                            <Label htmlFor="owner_name" className="text-xs">
                              {t("admin.createUser.ownerFullName")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                            </Label>
                            <Input
                              id="owner_name"
                              value={companyData.owner_name}
                              onChange={(e) => setCompanyData({ ...companyData, owner_name: e.target.value })}
                              placeholder={t("admin.createUser.ownerFullNamePlaceholder")}
                              className="text-xs h-9"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="owner_phone" className="text-xs">
                                {t("admin.createUser.ownerPhone")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="owner_phone"
                                value={companyData.owner_phone}
                                onChange={(e) => setCompanyData({ ...companyData, owner_phone: e.target.value })}
                                placeholder={t("admin.createUser.ownerPhonePlaceholder")}
                                maxLength={10}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="owner_email" className="text-xs">
                                {t("admin.createUser.ownerEmail")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <Input
                                id="owner_email"
                                type="email"
                                value={companyData.owner_email}
                                onChange={(e) => setCompanyData({ ...companyData, owner_email: e.target.value })}
                                placeholder={t("admin.createUser.ownerEmailPlaceholder")}
                                className="text-xs h-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="owner_password" className="text-xs">
                                {t("admin.createUser.password")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="owner_password"
                                  type={showCompanyPassword ? "text" : "password"}
                                  placeholder={t("admin.createUser.passwordPlaceholder")}
                                  value={companyData.owner_password}
                                  onChange={(e) => setCompanyData({ ...companyData, owner_password: e.target.value })}
                                  className="text-xs h-9 pr-9"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCompanyPassword(!showCompanyPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showCompanyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="owner_password_confirmation" className="text-xs">
                                {t("admin.createUser.confirmPassword")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="owner_password_confirmation"
                                  type={showCompanyConfirmPassword ? "text" : "password"}
                                  placeholder={t("admin.createUser.confirmPasswordPlaceholder")}
                                  value={companyData.owner_password_confirmation}
                                  onChange={(e) => setCompanyData({ ...companyData, owner_password_confirmation: e.target.value })}
                                  className="text-xs h-9 pr-9"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCompanyConfirmPassword(!showCompanyConfirmPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showCompanyConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    /* For other roles - show basic form */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs">
                          {t("admin.createUser.fullName")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder={t("admin.createUser.fullNamePlaceholder")}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="text-xs h-9"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs">
                          {t("admin.createUser.emailAddress")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("admin.createUser.emailPlaceholder")}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="text-xs h-9"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs">
                          {t("admin.createUser.phoneNumber")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <Input
                          id="phone"
                          placeholder={t("admin.createUser.phonePlaceholder")}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="text-xs h-9"
                          required
                          maxLength={10}
                          minLength={10}
                        />
                      </div>

                      {!["admin", "police", "supervisor"].includes(selectedRole.toLowerCase()) && (
                        <div className="space-y-2">
                          <Label htmlFor="national_id" className="text-xs">
                            {t("admin.createUser.nationalId")}
                          </Label>
                          <Input
                            id="national_id"
                            placeholder={t("admin.createUser.nationalIdPlaceholder")}
                            value={formData.national_id}
                            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                            className="text-xs h-9"
                            maxLength={16}
                            minLength={16}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-xs">
                          {t("admin.createUser.gender")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <ShadcnSelect
                          value={formData.gender}
                          onValueChange={(value: 'male' | 'female') => 
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue placeholder={t("admin.createUser.selectGender")} />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-xs">
                          {t("admin.createUser.dateOfBirth")}
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs">
                          {t("admin.createUser.password")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("admin.createUser.passwordPlaceholder")}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="text-xs h-9 pr-9"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-xs">
                          {t("admin.createUser.confirmPassword")} <span className="text-red-500">{t("admin.createUser.required")}</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password_confirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("admin.createUser.confirmPasswordPlaceholder")}
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            className="text-xs h-9 pr-9"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-xs">
                          {t("admin.createUser.accountStatus")}
                        </Label>
                        <ShadcnSelect
                          value={formData.status}
                          onValueChange={(value: 'active' | 'pending' | 'inactive') => 
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue placeholder={t("admin.createUser.selectStatus")} />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Address & Location Tab - Show for all roles */}
                <TabsContent value="address" className="mt-4 space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="text-xs">
                        {t("admin.createUser.fullAddress")}
                      </Label>
                      <Textarea
                        id="address"
                        placeholder={t("admin.createUser.addressPlaceholder")}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="text-xs min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-xs">{t("admin.createUser.province")}</Label>
                      <ReactSelect
                        options={provincesData?.map(p => ({ value: p.id, label: p.name })) || []}
                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                          if (option) {
                            setSelectedProvinceId(option.value);
                            setSelectedDistrictId(undefined);
                            setSelectedSectorId(undefined);
                            setSelectedCellId(undefined);
                            setFormData(prev => ({
                              ...prev,
                              district: '',
                              sector: '',
                              cell: '',
                              village: '',
                            }));
                          }
                        }}
                        placeholder={t("admin.createUser.selectProvince")}
                        isClearable
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-xs">{t("admin.createUser.district")}</Label>
                      <ReactSelect
                        options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                          if (option) {
                            setSelectedDistrictId(option.value);
                            setFormData({ ...formData, district: option.label });
                            setSelectedSectorId(undefined);
                            setSelectedCellId(undefined);
                            setFormData(prev => ({
                              ...prev,
                              sector: '',
                              cell: '',
                              village: '',
                            }));
                          }
                        }}
                        placeholder={t("admin.createUser.selectDistrict")}
                        isDisabled={!selectedProvinceId}
                        isClearable
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector" className="text-xs">{t("admin.createUser.sector")}</Label>
                      <ReactSelect
                        options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                          if (option) {
                            setSelectedSectorId(option.value);
                            setFormData({ ...formData, sector: option.label });
                            setSelectedCellId(undefined);
                            setFormData(prev => ({
                              ...prev,
                              cell: '',
                              village: '',
                            }));
                          }
                        }}
                        placeholder={t("admin.createUser.selectSector")}
                        isDisabled={!selectedDistrictId}
                        isClearable
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cell" className="text-xs">{t("admin.createUser.cell")}</Label>
                      <ReactSelect
                        options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                          if (option) {
                            setSelectedCellId(option.value);
                            setFormData({ ...formData, cell: option.label });
                            setFormData(prev => ({ ...prev, village: '' }));
                          }
                        }}
                        placeholder={t("admin.createUser.selectCell")}
                        isDisabled={!selectedSectorId}
                        isClearable
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="village" className="text-xs">{t("admin.createUser.village")}</Label>
                      <ReactSelect
                        options={villagesData?.map(v => ({ value: v.id, label: v.name })) || []}
                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                          if (option) {
                            setFormData({ ...formData, village: option.label });
                          }
                        }}
                        placeholder={t("admin.createUser.selectVillage")}
                        isDisabled={!selectedCellId}
                        isClearable
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{t("admin.createUser.locationInfo")}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {t("admin.createUser.locationHint")}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Message when no role selected */}
            {!selectedRole && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("admin.createUser.selectRoleTitle")}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("admin.createUser.selectRoleMessage")}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions - Only show when role is selected */}
          {selectedRole && (
            <div className="sticky bottom-0 bg-background border-t border-border/50 p-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createUser.isPending}
                className="w-32 h-9 text-xs"
              >
                {t("admin.createUser.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending}
                className="w-32 h-9 text-xs"
              >
                {createUser.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {createUser.isPending ? t("admin.createUser.creating") : t("admin.createUser.createUser")}
              </Button>
            </div>
          )}
        </form>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-up {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;