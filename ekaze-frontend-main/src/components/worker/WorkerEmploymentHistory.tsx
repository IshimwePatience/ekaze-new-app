import {
  Calendar,
  Star,
  MapPin,
  Building2,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EmploymentRecord {
  id: string;
  employerName: string;
  employerType: "company" | "household";
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  duration: string;
  salary: string;
  rating: number | null;
  review: string | null;
  responsibilities: string[];
  isCurrent: boolean;
}

const employmentHistory: EmploymentRecord[] = [
  {
    id: "1",
    employerName: "Mukiza Family",
    employerType: "household",
    role: "Housekeeper",
    location: "Kigali, Nyarutarama",
    startDate: "2023-06-01",
    endDate: null,
    duration: "8 months (ongoing)",
    salary: "90,000 RWF/month",
    rating: null,
    review: null,
    responsibilities: [
      "House cleaning and maintenance",
      "Laundry and ironing",
      "Light cooking",
      "Grocery shopping",
    ],
    isCurrent: true,
  },
  {
    id: "2",
    employerName: "Habimana Household",
    employerType: "household",
    role: "Housekeeper & Cook",
    location: "Kigali, Kimihurura",
    startDate: "2022-01-15",
    endDate: "2023-05-30",
    duration: "1 year 4 months",
    salary: "85,000 RWF/month",
    rating: 5.0,
    review:
      "Claudine is an exceptional worker. She is reliable, thorough, and always goes above and beyond. Her cooking is excellent and she keeps our home spotless. Highly recommended!",
    responsibilities: [
      "Full house cleaning",
      "Cooking daily meals",
      "Laundry services",
      "Child supervision",
    ],
    isCurrent: false,
  },
  {
    id: "3",
    employerName: "Kigali Cleaning Services",
    employerType: "company",
    role: "Professional Cleaner",
    location: "Kigali, Various Locations",
    startDate: "2020-08-01",
    endDate: "2021-12-31",
    duration: "1 year 5 months",
    salary: "75,000 RWF/month",
    rating: 4.5,
    review:
      "Excellent team member. Always punctual and professional. Great attention to detail in her work.",
    responsibilities: [
      "Commercial cleaning",
      "Residential cleaning",
      "Deep cleaning services",
      "Client communication",
    ],
    isCurrent: false,
  },
  {
    id: "4",
    employerName: "Uwimana Family",
    employerType: "household",
    role: "Nanny & Housekeeper",
    location: "Kigali, Gacuriro",
    startDate: "2019-02-01",
    endDate: "2020-07-15",
    duration: "1 year 5 months",
    salary: "80,000 RWF/month",
    rating: 4.8,
    review:
      "Wonderful with our children. Very caring and responsible. We were sad to see her go but she needed to explore other opportunities.",
    responsibilities: [
      "Child care for 2 kids",
      "Light housekeeping",
      "School pickup and drop-off",
      "Meal preparation for children",
    ],
    isCurrent: false,
  },
];

const WorkerEmploymentHistory = () => {
  const currentJob = employmentHistory.find((job) => job.isCurrent);
  const pastJobs = employmentHistory.filter((job) => !job.isCurrent);

  return (
    <div className="space-y-6">
      {/* Current Employment */}
      {currentJob && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Employment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                {currentJob.employerType === "company" ? (
                  <Building2 className="h-8 w-8 text-primary" />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {currentJob.role}
                  </h3>
                  <Badge className="bg-green-500/10 text-green-600">
                    Active
                  </Badge>
                </div>
                <p className="text-muted-foreground text_sm mb-3">
                  {currentJob.employerName}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center text_sm gap-1">
                    <MapPin className="h-4 w-4" />
                    {currentJob.location}
                  </span>
                  <span className="flex items-center text_sm gap-1">
                    <Calendar className="h-4 w-4" />
                    Started {new Date(currentJob.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text_sm gap-1">
                    <Clock className="h-4 w-4" />
                    {currentJob.duration}
                  </span>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Responsibilities
                  </p>
                  <ul className=" text-muted-foreground space-y-1">
                    {currentJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-center text_sm gap-2">
                        <div className="h-1.5 w-1.5 text_sm rounded-full bg-primary" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="text-sm font-semibold text-primary">
                  {currentJob.salary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employment History</span>
            <Badge variant="secondary">{pastJobs.length} Past Jobs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {pastJobs.map((job) => (
              <AccordionItem
                key={job.id}
                value={job.id}
                className="border rounded-xl px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-2 rounded-lg bg-muted">
                      {job.employerType === "company" ? (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {job.role}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {job.employerType === "company"
                            ? "Company"
                            : "Household"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.employerName} • {job.duration}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                      {job.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{job.rating}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {new Date(job.startDate).toLocaleDateString()} -{" "}
                        {job.endDate
                          ? new Date(job.endDate).toLocaleDateString()
                          : "Present"}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4">
                  <div className="grid gap-4 pt-2 pl-14">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Location
                        </p>
                        <p className="text-sm">{job.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Period
                        </p>
                        <p className="text-sm">
                          {new Date(job.startDate).toLocaleDateString()} -{" "}
                          {job.endDate
                            ? new Date(job.endDate).toLocaleDateString()
                            : "Present"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Salary
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {job.salary}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Responsibilities
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {job.review && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Employer Review
                          </p>
                          {job.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                {job.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-foreground italic">
                          "{job.review}"
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerEmploymentHistory;
