import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Globe,
  Building,
  Map,
  Home,
  TreePine,
  AlertCircle,
} from "lucide-react";
import { useMyJurisdictions } from "@/hooks/usePoliceJurisdiction";

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  province: {
    label: "Province",
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
    icon: Globe,
  },
  district: {
    label: "District",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
    icon: Building,
  },
  sector: {
    label: "Sector",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400",
    icon: Map,
  },
  cell: {
    label: "Cell",
    color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-400",
    icon: Home,
  },
  village: {
    label: "Village",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
    icon: TreePine,
  },
};

const MyJurisdiction = () => {
  const { data, isLoading, isError } = useMyJurisdictions();

  const jurisdictions = data?.data?.jurisdictions || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-semibold mb-1">Failed to load jurisdictions</h3>
        <p className="text-xs text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

            <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
             My Jurisdiction
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Your assigned coverage areas and patrol zones
          </p>
        </div>
        </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/40">
        <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs font-semibold">
            {jurisdictions.length} Assigned{" "}
            {jurisdictions.length === 1 ? "Area" : "Areas"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Coverage spans{" "}
            {[
              ...new Set(
                jurisdictions.map((j) => j.province?.name).filter(Boolean)
              ),
            ].join(", ") || "—"}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {jurisdictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border/40 rounded-xl text-center">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">No Jurisdictions Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            You have not been assigned any coverage area yet. Please contact your
            administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jurisdictions.map((j, index) => {
            const config = LEVEL_CONFIG[j.coverage_level] ?? LEVEL_CONFIG.province;
            const Icon = config.icon;

            // Build breadcrumb parts from deepest to shallowest
            const breadcrumb = [
              j.village?.name,
              j.cell?.name,
              j.sector?.name,
              j.district?.name,
              j.province?.name,
            ].filter(Boolean);

            return (
              <Card
                key={j.id}
                className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-4"
                style={{
                  borderRadius: "12px",
                  animationDelay: `${index * 60}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <Badge className={`text-[10px] ${config.color}`}>
                      {config.label} level
                    </Badge>
                  </div>

                  {/* Coverage summary */}
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {j.coverage_summary}
                    </p>
                    {j.notes && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">
                        {j.notes}
                      </p>
                    )}
                  </div>

                  {/* Breadcrumb trail */}
                  <div className="flex flex-wrap gap-1">
                    {breadcrumb.map((part, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-medium">
                          {part}
                        </span>
                        {i < breadcrumb.length - 1 && (
                          <span className="text-[10px] text-muted-foreground/50">›</span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-1 border-t border-border/40">
                    <p className="text-[10px] text-muted-foreground">
                      Covers all {j.coverage_level === "province" ? "districts, sectors, cells & villages" : j.coverage_level === "district" ? "sectors, cells & villages" : j.coverage_level === "sector" ? "cells & villages" : j.coverage_level === "cell" ? "villages" : "this village"} within this {j.coverage_level}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyJurisdiction;