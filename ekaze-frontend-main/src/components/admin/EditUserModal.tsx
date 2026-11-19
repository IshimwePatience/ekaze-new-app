import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User as UserIcon,
  X,
  Loader2,
  MapPin,
  Shield,
} from "lucide-react";
import { useUpdateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import type { User, UpdateUserRequest } from "@/types/user.types";
import ReactSelect from 'react-select';
import type { SingleValue } from 'react-select';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  company: 'Company',
  employer: 'Employer',
  worker: 'Worker',
  police: 'Police',
};

const EditUserModal = ({ isOpen, onClose, user }: EditUserModalProps) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
  });

  const [activeTab, setActiveTab] = useState("basic");

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

  const updateUser = useUpdateUser();
  const { toast } = useToast();

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        national_id: user.national_id || '',
        gender: user.gender || 'male',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        district: user.district || '',
        sector: user.sector || '',
        cell: user.cell || '',
        village: user.village || '',
      });
    }
  }, [user]);

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      national_id: '',
      gender: 'male',
      date_of_birth: '',
      address: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
    });
    setActiveTab("basic");
    setSelectedProvinceId(undefined);
    setSelectedDistrictId(undefined);
    setSelectedSectorId(undefined);
    setSelectedCellId(undefined);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await updateUser.mutateAsync({ id: user.id, data: formData });
      handleClose();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[92vh] overflow-y-auto p-0"
        style={{ borderRadius: "12px" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit User</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Update {ROLE_LABELS[user.role] || user.role} information
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic" className="text-xs">
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  Basic Information
                </TabsTrigger>
                <TabsTrigger value="address" className="text-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  Address & Location
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="078XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-xs h-9"
                      required
                      maxLength={10}
                      minLength={10}
                    />
                  </div>

                  {!["admin", "police", "supervisor"].includes((user?.role || '').toLowerCase()) && (
                    <div className="space-y-2">
                      <Label htmlFor="national_id" className="text-xs">
                        National ID
                      </Label>
                      <Input
                        id="national_id"
                        placeholder="Enter National ID"
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
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <ShadcnSelect
                      value={formData.gender}
                      onValueChange={(value: 'male' | 'female') => 
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select gender" />
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
                      Date of Birth
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
                </div>
              </TabsContent>

              {/* Address & Location Tab */}
              <TabsContent value="address" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-xs">
                      Full Address
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Street address, building, etc."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="text-xs min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-xs">Province</Label>
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
                      placeholder="Select province..."
                      isClearable
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-xs">District</Label>
                    <ReactSelect
                      options={districtsData?.map(d => ({ value: d.id, label: d.name })) || []}
                      value={formData.district ? { value: 0, label: formData.district } : null}
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
                      placeholder="Select district..."
                      isDisabled={!selectedProvinceId}
                      isClearable
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-xs">Sector</Label>
                    <ReactSelect
                      options={sectorsData?.map(s => ({ value: s.id, label: s.name })) || []}
                      value={formData.sector ? { value: 0, label: formData.sector } : null}
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
                      placeholder="Select sector..."
                      isDisabled={!selectedDistrictId}
                      isClearable
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cell" className="text-xs">Cell</Label>
                    <ReactSelect
                      options={cellsData?.map(c => ({ value: c.id, label: c.name })) || []}
                      value={formData.cell ? { value: 0, label: formData.cell } : null}
                      onChange={(option: SingleValue<{ value: number; label: string }>) => {
                        if (option) {
                          setSelectedCellId(option.value);
                          setFormData({ ...formData, cell: option.label });
                          setFormData(prev => ({ ...prev, village: '' }));
                        }
                      }}
                      placeholder="Select cell..."
                      isDisabled={!selectedSectorId}
                      isClearable
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village" className="text-xs">Village</Label>
                    <ReactSelect
                      options={villagesData?.map(v => ({ value: v.id, label: v.name })) || []}
                      value={formData.village ? { value: 0, label: formData.village } : null}
                      onChange={(option: SingleValue<{ value: number; label: string }>) => {
                        if (option) {
                          setFormData({ ...formData, village: option.label });
                        }
                      }}
                      placeholder="Select village..."
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
                      <p className="text-xs font-medium">Location Information</p>
                      <p className="text-[10px] text-muted-foreground">
                        Location fields are optional but recommended for better user management.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border/50 p-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateUser.isPending}
              className="w-32 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending}
              className="w-32 h-9 text-xs"
            >
              {updateUser.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {updateUser.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;