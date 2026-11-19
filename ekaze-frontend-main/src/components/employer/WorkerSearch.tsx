import { useState } from "react";
import { Search, Filter, MapPin, Star, Building2, User, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmployerSearch from "./employerFilter/pages/EmployerSearch";

interface Worker {
  id: string;
  name: string;
  age: number;
  gender: string;
  district: string;
  sector: string;
  experience: string;
  languages: string[];
  salaryRange: string;
  rating: number;
  reviews: number;
  type: "company" | "freelance";
  companyName?: string;
  hasInsurance: boolean;
  available: boolean;
}

const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Marie Uwimana",
    age: 28,
    gender: "Female",
    district: "Gasabo",
    sector: "Kimironko",
    experience: "5+ years",
    languages: ["Kinyarwanda", "English", "French"],
    salaryRange: "80,000 - 100,000 RWF",
    rating: 4.8,
    reviews: 23,
    type: "company",
    companyName: "HomeStaff Solutions",
    hasInsurance: true,
    available: true,
  },
  {
    id: "2",
    name: "Jeanne Mukamana",
    age: 32,
    gender: "Female",
    district: "Kicukiro",
    sector: "Niboye",
    experience: "8+ years",
    languages: ["Kinyarwanda", "French"],
    salaryRange: "100,000 - 120,000 RWF",
    rating: 4.9,
    reviews: 45,
    type: "freelance",
    hasInsurance: true,
    available: true,
  },
  {
    id: "3",
    name: "Emmanuel Habimana",
    age: 25,
    gender: "Male",
    district: "Nyarugenge",
    sector: "Nyamirambo",
    experience: "2+ years",
    languages: ["Kinyarwanda", "English"],
    salaryRange: "60,000 - 80,000 RWF",
    rating: 4.5,
    reviews: 12,
    type: "company",
    companyName: "Rwanda Services",
    hasInsurance: false,
    available: true,
  },
  {
    id: "4",
    name: "Claudine Ingabire",
    age: 35,
    gender: "Female",
    district: "Gasabo",
    sector: "Remera",
    experience: "10+ years",
    languages: ["Kinyarwanda", "English", "French", "Swahili"],
    salaryRange: "120,000 - 150,000 RWF",
    rating: 5.0,
    reviews: 67,
    type: "freelance",
    hasInsurance: true,
    available: true,
  },
];

const WorkerSearch = () => {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    district: "",
    experience: "",
    salaryRange: [50000, 150000] as [number, number],
    hasInsurance: "",
    type: "",
  });

  const handleSearch = () => {
    setSearchPerformed(true);
  };

  const handleReset = () => {
    setFilters({
      gender: "",
      district: "",
      experience: "",
      salaryRange: [50000, 150000],
      hasInsurance: "",
      type: "",
    });
    setSearchPerformed(false);
  };

  return (
    <div className="space-y-6">
      <EmployerSearch statusSearch={false} />
      {/* Search Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={filters.gender}
                onValueChange={(value) =>
                  setFilters({ ...filters, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>District</Label>
              <Select
                value={filters.district}
                onValueChange={(value) =>
                  setFilters({ ...filters, district: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Districts</SelectItem>
                  <SelectItem value="gasabo">Gasabo</SelectItem>
                  <SelectItem value="kicukiro">Kicukiro</SelectItem>
                  <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select
                value={filters.experience}
                onValueChange={(value) =>
                  setFilters({ ...filters, experience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Worker Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Types</SelectItem>
                  <SelectItem value="company">Company Workers</SelectItem>
                  <SelectItem value="freelance">Freelancers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Insurance Required</Label>
              <Select
                value={filters.hasInsurance}
                onValueChange={(value) =>
                  setFilters({ ...filters, hasInsurance: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Salary Range: {filters.salaryRange[0].toLocaleString()} -{" "}
                {filters.salaryRange[1].toLocaleString()} RWF
              </Label>
              <Slider
                value={filters.salaryRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, salaryRange: value as [number, number] })
                }
                min={30000}
                max={200000}
                step={10000}
                className="mt-3"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Workers
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Search Results */}
      {/* {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="secondary" className="text-sm">
                {mockWorkers.length} Workers Found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};

const WorkerCard = ({ worker }: { worker: Worker }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
      <Avatar className="h-16 w-16">
        <AvatarImage src="" />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">
          {worker.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-foreground">{worker.name}</h3>
          <Badge
            variant={worker.type === "company" ? "default" : "secondary"}
            className="text-xs"
          >
            {worker.type === "company" ? (
              <Building2 className="h-3 w-3 mr-1" />
            ) : (
              <User className="h-3 w-3 mr-1" />
            )}
            {worker.type === "company" ? "Company" : "Freelance"}
          </Badge>
          {worker.hasInsurance && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
              Insured
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span>{worker.age} years old</span>
          <span>•</span>
          <span>{worker.gender}</span>
          <span>•</span>
          <span>{worker.experience}</span>
        </div>

        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {worker.district}, {worker.sector}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">{worker.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({worker.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-foreground">
          {worker.salaryRange}
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Eye className="h-4 w-4 mr-1" />
              {worker.type === "company" ? "Request Worker" : "View Contact"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {worker.type === "company"
                  ? "Request Worker"
                  : "Worker Contact"}
              </DialogTitle>
              <DialogDescription>
                {worker.type === "company"
                  ? `This worker is registered with ${worker.companyName}. A hiring request will be sent to the company.`
                  : "Contact this freelance worker directly."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {worker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{worker.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {worker.experience} experience
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{worker.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({worker.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {worker.type === "company" ? (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-medium text-sm">Company</p>
                  <p className="text-foreground">{worker.companyName}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click below to send a hiring request. The company will
                    contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-medium text-sm">Contact</p>
                  <p className="text-foreground">+250 78X XXX XXX</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can contact this worker directly to discuss terms.
                  </p>
                </div>
              )}

              <Button className="w-full">
                {worker.type === "company"
                  ? "Send Hiring Request"
                  : "Contact Worker"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkerSearch;
