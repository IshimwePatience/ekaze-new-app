import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { X, MapPin, Loader2, Trash2, Plus, ChevronRight } from "lucide-react";
import Select, { SingleValue } from "react-select";
import {
  useOfficerJurisdictions,
  useAssignJurisdiction,
  useDeleteJurisdiction,
} from "@/hooks/useUsers";
import { useProvinces, useDistricts, useSectors, useCells, useVillages } from "@/hooks/useLocations";
import type { CreateJurisdictionRequest } from "@/types/user.types";

interface AssignJurisdictionModalProps {
  officerId: number | null;
  officerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  province: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
  district: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
  sector: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400",
  cell: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-400",
  village: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
};

const AssignJurisdictionModal = ({
  officerId,
  officerName,
  isOpen,
  onClose,
}: AssignJurisdictionModalProps) => {
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");

  // Location selection state
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>();
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
  const [selectedCellId, setSelectedCellId] = useState<number | undefined>();
  const [selectedVillageId, setSelectedVillageId] = useState<number | undefined>();

  // Labels for display
  const [provinceLabel, setProvinceLabel] = useState("");
  const [districtLabel, setDistrictLabel] = useState("");
  const [sectorLabel, setSectorLabel] = useState("");
  const [cellLabel, setCellLabel] = useState("");
  const [villageLabel, setVillageLabel] = useState("");

  // Hooks
  const { data: jurisdictionsData, isLoading } = useOfficerJurisdictions(officerId);
  const assignJurisdiction = useAssignJurisdiction();
  const deleteJurisdiction = useDeleteJurisdiction();

  // Location hooks
  const { data: provincesData } = useProvinces();
  const { data: districtsData } = useDistricts(selectedProvinceId);
  const { data: sectorsData } = useSectors(selectedDistrictId);
  const { data: cellsData } = useCells(selectedSectorId);
  const { data: villagesData } = useVillages(selectedCellId);

  const jurisdictions = jurisdictionsData?.data?.jurisdictions || [];

  const resetForm = () => {
    setSelectedProvinceId(undefined);
    setSelectedDistrictId(undefined);
    setSelectedSectorId(undefined);
    setSelectedCellId(undefined);
    setSelectedVillageId(undefined);
    setProvinceLabel("");
    setDistrictLabel("");
    setSectorLabel("");
    setCellLabel("");
    setVillageLabel("");
    setNotes("");
    setShowForm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!officerId || !selectedProvinceId) return;

    const data: CreateJurisdictionRequest = {
      user_id: officerId,
      province_id: selectedProvinceId,
      district_id: selectedDistrictId ?? null,
      sector_id: selectedSectorId ?? null,
      cell_id: selectedCellId ?? null,
      village_id: selectedVillageId ?? null,
      notes: notes || undefined,
    };

    try {
      await assignJurisdiction.mutateAsync(data);
      resetForm();
    } catch {
      // handled by hook
    }
  };

  // Build coverage preview string
  const coveragePreview = [villageLabel, cellLabel, sectorLabel, districtLabel, provinceLabel]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        style={{ borderRadius: "12px" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border/50 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Jurisdiction Assignment</h2>
              {officerName && (
                <p className="text-xs text-muted-foreground mt-0.5">Officer: {officerName}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Existing Jurisdictions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Assigned Jurisdictions ({jurisdictions.length})
              </h3>
              {!showForm && (
                <Button
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Jurisdiction
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : jurisdictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/40 rounded-lg">
                <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No jurisdictions assigned</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This officer has no assigned coverage areas yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {jurisdictions.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/40"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                        {j.coverage_summary || 
                            [j.village?.name, j.cell?.name, j.sector?.name, j.district?.name, j.province?.name]
                            .filter(Boolean)
                            .join(', ')
                        }
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-[10px] ${LEVEL_COLORS[j.coverage_level]}`}>
                            {j.coverage_level || 'province'}
                          </Badge>
                          {j.notes && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {j.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteJurisdiction.mutate(j.id)}
                      disabled={deleteJurisdiction.isPending}
                      className="h-7 w-7 p-0 hover:text-red-600 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          {showForm && (
            <Card style={{ borderRadius: "10px" }}>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">New Jurisdiction</h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Coverage Preview */}
                {coveragePreview && (
                  <div className="bg-muted/30 px-3 py-2 rounded-lg border border-border/40">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Coverage area</p>
                    <p className="text-xs font-medium">{coveragePreview}</p>
                  </div>
                )}

                {/* Hierarchy hint */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-medium text-purple-600">Province</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>District</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Sector</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Cell</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Village</span>
                  <span className="ml-2 italic">(select deepest level needed)</span>
                </div>

                {/* Province */}
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={provincesData?.map((p) => ({ value: p.id, label: p.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSelectedProvinceId(opt?.value);
                      setProvinceLabel(opt?.label || "");
                      setSelectedDistrictId(undefined); setDistrictLabel("");
                      setSelectedSectorId(undefined);   setSectorLabel("");
                      setSelectedCellId(undefined);     setCellLabel("");
                      setSelectedVillageId(undefined);  setVillageLabel("");
                    }}
                    value={selectedProvinceId ? { value: selectedProvinceId, label: provinceLabel } : null}
                    placeholder="Select province"
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <Label className="text-xs">District <span className="text-muted-foreground">(optional)</span></Label>
                  <Select
                    options={districtsData?.map((d) => ({ value: d.id, label: d.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSelectedDistrictId(opt?.value);
                      setDistrictLabel(opt?.label || "");
                      setSelectedSectorId(undefined); setSectorLabel("");
                      setSelectedCellId(undefined);   setCellLabel("");
                      setSelectedVillageId(undefined); setVillageLabel("");
                    }}
                    value={selectedDistrictId ? { value: selectedDistrictId, label: districtLabel } : null}
                    placeholder="Select district"
                    isDisabled={!selectedProvinceId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Sector */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Sector <span className="text-muted-foreground">(optional)</span></Label>
                  <Select
                    options={sectorsData?.map((s) => ({ value: s.id, label: s.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSelectedSectorId(opt?.value);
                      setSectorLabel(opt?.label || "");
                      setSelectedCellId(undefined);    setCellLabel("");
                      setSelectedVillageId(undefined); setVillageLabel("");
                    }}
                    value={selectedSectorId ? { value: selectedSectorId, label: sectorLabel } : null}
                    placeholder="Select sector"
                    isDisabled={!selectedDistrictId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Cell */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Cell <span className="text-muted-foreground">(optional)</span></Label>
                  <Select
                    options={cellsData?.map((c) => ({ value: c.id, label: c.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSelectedCellId(opt?.value);
                      setCellLabel(opt?.label || "");
                      setSelectedVillageId(undefined); setVillageLabel("");
                    }}
                    value={selectedCellId ? { value: selectedCellId, label: cellLabel } : null}
                    placeholder="Select cell"
                    isDisabled={!selectedSectorId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Village */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Village <span className="text-muted-foreground">(optional)</span></Label>
                  <Select
                    options={villagesData?.map((v) => ({ value: v.id, label: v.name })) || []}
                    onChange={(opt: SingleValue<{ value: number; label: string }>) => {
                      setSelectedVillageId(opt?.value);
                      setVillageLabel(opt?.label || "");
                    }}
                    value={selectedVillageId ? { value: selectedVillageId, label: villageLabel } : null}
                    placeholder="Select village"
                    isDisabled={!selectedCellId}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Primary patrol area"
                    className="text-xs h-9"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={resetForm} className="h-8 text-xs w-24">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!selectedProvinceId || assignJurisdiction.isPending}
                    className="h-8 text-xs w-28"
                  >
                    {assignJurisdiction.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    {assignJurisdiction.isPending ? "Saving..." : "Assign"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignJurisdictionModal;