import { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Incident {
  id: string;
  workerName: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "open" | "investigating" | "resolved";
  date: string;
  description: string;
}

const incidents: Incident[] = [
  {
    id: "1",
    workerName: "Jean Pierre Nkurunziza",
    type: "Property Damage",
    severity: "low",
    status: "resolved",
    date: "2023-08-15",
    description: "Accidentally broke a window while cleaning.",
  },
  {
    id: "2",
    workerName: "Patrick Habiyambere",
    type: "Misconduct",
    severity: "medium",
    status: "investigating",
    date: "2024-11-20",
    description: "Reported for unauthorized absence without notice.",
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700";
    case "investigating":
      return "bg-purple-100 text-purple-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <AlertTriangle className="h-3 w-3" />;
    case "investigating":
      return <Clock className="h-3 w-3" />;
    case "resolved":
      return <CheckCircle2 className="h-3 w-3" />;
    default:
      return null;
  }
};

interface IncidentReportsProps {
  limit?: number;
  onViewAll?: () => void;
}

const IncidentReports = ({ limit, onViewAll }: IncidentReportsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const displayIncidents = limit ? incidents.slice(0, limit) : incidents;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Incident Reports
        </CardTitle>
        <div className="flex items-center gap-2">
          {limit && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-[#2478b8] hover:bg-[#1b6296] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Report Incident</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report an Incident</DialogTitle>
                <DialogDescription>
                  Report any misconduct or issues with a worker. This will be
                  reviewed by authorities.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Worker</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marie">Marie Uwimana</SelectItem>
                      <SelectItem value="emmanuel">Emmanuel Habimana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Incident Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="damage">Property Damage</SelectItem>
                      <SelectItem value="misconduct">Misconduct</SelectItem>
                      <SelectItem value="absence">Unauthorized Absence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Incident</Label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what happened in detail..."
                    rows={4}
                  />
                </div>

                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Submit Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {displayIncidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No incidents reported</p>
            <p className="text-sm mt-1">
              Report any issues with workers using the button above
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-border bg-background"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {incident.workerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">
                      {incident.workerName}
                    </h3>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity.charAt(0).toUpperCase() +
                        incident.severity.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {getStatusIcon(incident.status)}
                      <span className="ml-1">
                        {incident.status.charAt(0).toUpperCase() +
                          incident.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {incident.type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {incident.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported: {new Date(incident.date).toLocaleDateString()}
                  </p>
                </div>

                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentReports;
