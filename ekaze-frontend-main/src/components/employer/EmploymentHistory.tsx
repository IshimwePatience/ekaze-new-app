import { Calendar, Star, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EmploymentRecord {
  id: string;
  workerName: string;
  role: string;
  startDate: string;
  endDate: string;
  duration: string;
  salary: string;
  rating: number;
  review: string;
  reasonForLeaving: string;
  type: "company" | "freelance";
}

const employmentHistory: EmploymentRecord[] = [
  {
    id: "1",
    workerName: "Claudine Ingabire",
    role: "Housekeeper",
    startDate: "2023-01-10",
    endDate: "2024-05-20",
    duration: "1 year 4 months",
    salary: "90,000 RWF/month",
    rating: 5.0,
    review:
      "Excellent worker, very professional and reliable. Highly recommended.",
    reasonForLeaving: "Relocated to another city",
    type: "freelance",
  },
  {
    id: "2",
    workerName: "Jean Pierre Nkurunziza",
    role: "Driver",
    startDate: "2022-06-01",
    endDate: "2023-01-05",
    duration: "7 months",
    salary: "120,000 RWF/month",
    rating: 4.2,
    review: "Good driver, punctual. Sometimes needed supervision for details.",
    reasonForLeaving: "Found better opportunity",
    type: "company",
  },
  {
    id: "3",
    workerName: "Francine Mukeshimana",
    role: "Nanny",
    startDate: "2021-03-15",
    endDate: "2022-05-30",
    duration: "1 year 2 months",
    salary: "80,000 RWF/month",
    rating: 4.8,
    review: "Wonderful with children. Caring and responsible.",
    reasonForLeaving: "Personal reasons",
    type: "freelance",
  },
  {
    id: "4",
    workerName: "Patrick Habiyambere",
    role: "Gardener",
    startDate: "2020-08-01",
    endDate: "2021-02-28",
    duration: "6 months",
    salary: "50,000 RWF/month",
    rating: 3.8,
    review: "Satisfactory work. Could improve time management.",
    reasonForLeaving: "Contract ended",
    type: "company",
  },
  {
    id: "5",
    workerName: "Alice Uwamahoro",
    role: "Cook",
    startDate: "2019-11-01",
    endDate: "2020-07-15",
    duration: "8 months",
    salary: "70,000 RWF/month",
    rating: 4.5,
    review: "Great cooking skills. Very clean and organized.",
    reasonForLeaving: "Started own business",
    type: "freelance",
  },
];

const EmploymentHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Employment History</span>
          <Badge variant="secondary">{employmentHistory.length} Records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {employmentHistory.map((record) => (
            <AccordionItem
              key={record.id}
              value={record.id}
              className="border rounded-xl px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 w-full">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {record.workerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {record.workerName}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {record.type === "company" ? "Company" : "Freelance"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {record.role} • {record.duration}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{record.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(record.startDate).toLocaleDateString()} -{" "}
                      {new Date(record.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4">
                <div className="grid gap-4 pt-2 pl-16">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Period
                      </p>
                      <p className="text-sm">
                        {new Date(record.startDate).toLocaleDateString()} -{" "}
                        {new Date(record.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Salary
                      </p>
                      <p className="text-sm">{record.salary}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Your Review
                    </p>
                    <p className="text-sm text-foreground">{record.review}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Reason for Leaving
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.reasonForLeaving}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default EmploymentHistory;
