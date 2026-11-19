import { Building2, UserPlus, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CompanySidebar = () => {
  // Mock data - replace with actual data from API
  const companyStats = {
    totalWorkers: 24,
    activeEmployments: 6,
    availableWorkers: 18,
    totalRevenue: "125K RWF",
  };

  return (
    <Card className="border-border/40 h-full rounded-lg bg-primary/10">
      <CardContent className="p-4 space-y-4">
        {/* Company Info Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Kigali Cleaning Co.</h3>
              <p className="text-xs text-muted-foreground">Company</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Workers</span>
              <span className="text-sm font-bold text-primary">{companyStats.totalWorkers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Employments</span>
              <span className="text-sm font-bold">{companyStats.activeEmployments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Available Workers</span>
              <span className="text-sm font-bold text-green-600">{companyStats.availableWorkers}</span>
            </div>
          </div>

          <Button 
            variant="link" 
            className="w-full mt-2 text-xs text-primary p-0 h-auto hover:no-underline"
          >
            View all analytics
          </Button>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-xs h-auto py-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Worker
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-xs h-auto py-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Requests
            </Button>
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Workers</span>
              <span className="text-sm font-bold">{companyStats.totalWorkers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active</span>
              <span className="text-sm font-bold">{companyStats.activeEmployments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Available</span>
              <span className="text-sm font-bold text-green-600">{companyStats.availableWorkers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Revenuea</span>
              <span className="text-sm font-bold text-primary">{companyStats.totalRevenue}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySidebar;