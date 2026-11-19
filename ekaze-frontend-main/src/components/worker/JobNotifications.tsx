import { useState } from "react";
import {
  Bell,
  MapPin,
  Clock,
  CreditCardIcon,
  Building2,
  User,
  CheckCircle,
  X,
  Eye,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobNotification {
  id: string;
  type: "job_offer" | "interview" | "application_update" | "profile_view";
  title: string;
  description: string;
  employerName: string;
  employerType: "company" | "household";
  location: string;
  salary: string;
  jobType: string;
  date: string;
  status: "pending" | "accepted" | "declined" | "expired";
  isNew: boolean;
}

const notifications: JobNotification[] = [
  {
    id: "1",
    type: "job_offer",
    title: "Housekeeper Position",
    description:
      "Looking for an experienced housekeeper for a family home. Responsibilities include cleaning, laundry, and light cooking.",
    employerName: "Uwimana Family",
    employerType: "household",
    location: "Kigali, Nyarutarama",
    salary: "100,000 RWF/month",
    jobType: "Full-time",
    date: "2024-01-15",
    status: "pending",
    isNew: true,
  },
  {
    id: "2",
    type: "job_offer",
    title: "Domestic Helper",
    description:
      "Seeking reliable helper for apartment complex. Duties include general cleaning and maintenance.",
    employerName: "Kigali Cleaning Services",
    employerType: "company",
    location: "Kigali, Kimihurura",
    salary: "85,000 RWF/month",
    jobType: "Full-time",
    date: "2024-01-14",
    status: "pending",
    isNew: true,
  },
  {
    id: "3",
    type: "profile_view",
    title: "Profile Viewed",
    description: "An employer viewed your profile and may be interested in hiring you.",
    employerName: "Anonymous Employer",
    employerType: "household",
    location: "Kigali",
    salary: "",
    jobType: "",
    date: "2024-01-13",
    status: "pending",
    isNew: true,
  },
  {
    id: "4",
    type: "job_offer",
    title: "Nanny Position",
    description:
      "Looking for a caring nanny for two children ages 3 and 5. Must have experience with young children.",
    employerName: "Habimana Household",
    employerType: "household",
    location: "Kigali, Gacuriro",
    salary: "120,000 RWF/month",
    jobType: "Full-time",
    date: "2024-01-10",
    status: "accepted",
    isNew: false,
  },
  {
    id: "5",
    type: "job_offer",
    title: "Cook Position",
    description: "Restaurant seeking experienced cook for weekday shifts.",
    employerName: "Meze Fresh",
    employerType: "company",
    location: "Kigali, City Center",
    salary: "95,000 RWF/month",
    jobType: "Part-time",
    date: "2024-01-08",
    status: "declined",
    isNew: false,
  },
];

interface JobNotificationsProps {
  limit?: number;
}

const JobNotifications = ({ limit }: JobNotificationsProps) => {
  const [selectedJob, setSelectedJob] = useState<JobNotification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayNotifications = limit
    ? notifications.slice(0, limit)
    : notifications;

  const pendingJobs = notifications.filter((n) => n.status === "pending");
  const respondedJobs = notifications.filter((n) => n.status !== "pending");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500/10 text-green-600">Accepted</Badge>;
      case "declined":
        return <Badge className="bg-red-500/10 text-red-600">Declined</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "job_offer":
        return <Bell className="h-5 w-5 text-primary" />;
      case "profile_view":
        return <Eye className="h-5 w-5 text-accent" />;
      case "interview":
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleViewDetails = (job: JobNotification) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  const handleRespond = (response: "accept" | "decline") => {
    // Handle response logic here
    setDialogOpen(false);
  };

  const NotificationCard = ({ notification }: { notification: JobNotification }) => (
    <div
      className={`p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
        notification.isNew ? "border-primary/50 bg-primary/5" : "border-border"
      }`}
      onClick={() => handleViewDetails(notification)}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-muted">
          {getTypeIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text_sm text-foreground truncate">
              {notification.title}
            </h4>
            {notification.isNew && (
              <Badge  className="text-xs">
                New
              </Badge>
            )}
            {getStatusBadge(notification.status)}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {notification.employerType === "company" ? (
              <Building2 className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            <span  className="text_sm" >{notification.employerName}</span>
            <span>•</span>
            <MapPin className="h-3 w-3 " />
            <span className="text_sm" >{notification.location}</span>
          </div>

          {notification.salary && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-primary font-medium">
                <CreditCardIcon className="h-3 w-3" />
                {notification.salary}
              </span>
              <span className="flex items-center text_sm gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {notification.jobType}
              </span>
            </div>
          )}

          <p className="text_sm text-muted-foreground mt-2">
            {new Date(notification.date).toLocaleDateString()}
          </p>
        </div>

        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex text-sm items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Job Notifications
            </span>
            {pendingJobs.length > 0 && (
              <Badge  >{pendingJobs.length} New</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {limit ? (
            <div className="space-y-3">
              {displayNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingJobs.length})
                </TabsTrigger>
                <TabsTrigger value="responded">
                  Responded ({respondedJobs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending notifications
                  </p>
                ) : (
                  pendingJobs.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="responded" className="space-y-3">
                {respondedJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No responded notifications
                  </p>
                ) : (
                  respondedJobs.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.employerType === "company"
                ? "Company Offer"
                : "Household Offer"}{" "}
              • {selectedJob?.date}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                {selectedJob.employerType === "company" ? (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{selectedJob.employerName}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedJob.description}
              </p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-medium text-primary">{selectedJob.salary}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Job Type</p>
                  <p className="font-medium">{selectedJob.jobType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {getStatusBadge(selectedJob.status)}
                </div>
              </div>
            </div>
          )}

          {selectedJob?.status === "pending" && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleRespond("decline")}>
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={() => handleRespond("accept")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Offer
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobNotifications;
