import React, { useState, useEffect } from "react";
import { X, Loader2, Save, User, Mail, Phone, MapPin, DollarSign, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyApi } from "@/api/companyService";
import { useToast } from "@/hooks/use-toast";

interface EditWorkerModalProps {
  worker: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
  worker,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [province, setProvince] = useState("Kigali");
  const [district, setDistrict] = useState("Gasabo");
  const [sector, setSector] = useState("Remera");

  useEffect(() => {
    if (worker) {
      const rawName = worker.user?.name || worker.name || `${worker.first_name || ""} ${worker.last_name || ""}`.trim();
      const cleanName = rawName.replace(/\s*\(Worker\)\s*/gi, "").trim();
      const parts = cleanName.split(" ");
      setFirstName(worker.first_name || parts[0] || "");
      setLastName(worker.last_name || parts.slice(1).join(" ") || "");
      setEmail(worker.user?.email || worker.email || "");
      setPhone(worker.user?.phone || worker.phone || "");
      setExperienceLevel(worker.experience_level || "intermediate");
      setMonthlySalary(String(worker.expected_salary || worker.monthly_salary || worker.min_salary || 50000));
      setProvince(worker.user?.province || worker.province || "Kigali");
      setDistrict(worker.user?.district || worker.district || "Gasabo");
      setSector(worker.user?.sector || worker.sector || "Remera");
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "First name is required" });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        phone: phone.trim(),
        experience_level: experienceLevel,
        expected_salary: Number(monthlySalary) || 50000,
        monthly_salary: Number(monthlySalary) || 50000,
        min_salary: Number(monthlySalary) || 50000,
        province: province.trim(),
        district: district.trim(),
        sector: sector.trim(),
      };

      await companyApi.updateCompanyWorker(worker.id, payload);
      toast({
        variant: "success",
        title: "Worker Updated",
        description: `Worker ${payload.name} has been updated successfully.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err?.response?.data?.message || err?.message || "Failed to update worker.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2478b8]/10 text-[#2478b8] rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Worker Profile</h2>
              <p className="text-xs text-slate-500">Update worker identity, contact and placement details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                First Name
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Last Name
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@example.com"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Contact Phone
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="078xxxxxxx"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Experience Level
              </Label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2478b8] focus:border-[#2478b8]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Expected Monthly Salary (RWF)
              </Label>
              <Input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="50000"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location Details
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-500">Province</Label>
                <Input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Kigali"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-500">District</Label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Gasabo"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-500">Sector</Label>
                <Input
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Remera"
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 text-xs px-4 bg-[#2478b8] hover:bg-[#1b6296] text-white flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkerModal;
