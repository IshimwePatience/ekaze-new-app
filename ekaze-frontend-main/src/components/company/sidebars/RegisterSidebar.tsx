import { UserPlus, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const RegisterSidebar = () => {
  return (
    <Card className="border-border/40 h-full rounded-b-none">
      <CardContent className="p-4 space-y-4">
        {/* Registration Info Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Worker Registration</h3>
              <p className="text-xs text-muted-foreground">Add new workers</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registration Fee</span>
              <span className="text-sm font-bold text-primary">500 RWF</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm font-bold">2-3 days</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Requirements */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Requirements
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Valid NIDA ID</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Phone number</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Work experience</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Skills & qualifications</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterSidebar;