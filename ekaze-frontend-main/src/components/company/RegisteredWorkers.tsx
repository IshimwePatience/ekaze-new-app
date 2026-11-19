import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown, CustomDropdownItem } from "@/components/ui/custom-dropdown";
import { StudioFilterBar } from "@/components/common/StudioFilterBar";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { YouTubeStudioPagination } from "@/components/common/YouTubeStudioPagination";
import { Star, Eye, Edit, Phone, UserX, MoreVertical } from "lucide-react";

const workers = [
  {
    id: "W001",
    name: "Jean Baptiste Uwimana",
    photo: "",
    nidaId: "1199880012345678",
    phone: "+250 788 123 456",
    skills: ["Cooking", "Cleaning", "Childcare"],
    status: "Available",
    rating: 4.8,
    totalJobs: 24,
    registeredDate: "2024-01-15",
  },
  {
    id: "W002",
    name: "Marie Claire Mukamana",
    photo: "",
    nidaId: "1199590087654321",
    phone: "+250 788 234 567",
    skills: ["Cleaning", "Laundry", "Elderly Care"],
    status: "Employed",
    rating: 4.9,
    totalJobs: 31,
    registeredDate: "2023-11-20",
  },
  {
    id: "W003",
    name: "Pierre Habimana",
    photo: "",
    nidaId: "1199280011223344",
    phone: "+250 788 345 678",
    skills: ["Security", "Gardening"],
    status: "Available",
    rating: 4.6,
    totalJobs: 18,
    registeredDate: "2024-02-01",
  },
  {
    id: "W004",
    name: "Claudette Uwase",
    photo: "",
    nidaId: "1199590055667788",
    phone: "+250 788 456 789",
    skills: ["Childcare", "Cooking"],
    status: "Pending",
    rating: 0,
    totalJobs: 0,
    registeredDate: "2024-03-10",
  },
  {
    id: "W005",
    name: "Emmanuel Ndayisaba",
    photo: "",
    nidaId: "1199080099887766",
    phone: "+250 788 567 890",
    skills: ["Driving", "Security"],
    status: "Employed",
    rating: 4.7,
    totalJobs: 42,
    registeredDate: "2023-08-15",
  },
];

const RegisteredWorkers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.nidaId.includes(searchTerm) ||
      worker.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || worker.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "Employed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "Pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
      default:
        return "";
    }
  };

  return (
    <div className="w-full bg-white space-y-0">
      {/* Header */}
      <div className="py-4 px-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Worker Registry ({workers.length})
        </h1>
      </div>

      {/* Main Layout */}
      <div className="w-full bg-white border-t border-slate-200">
        <StudioFilterBar
          categories={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "available", label: "Available" },
                { value: "employed", label: "Employed" },
                { value: "pending", label: "Pending" },
              ],
            },
          ]}
          activeFilters={{ status: statusFilter }}
          onFilterChange={(_, val) => setStatusFilter(val)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearAll={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
        />

        {filteredWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <CharacterIllustration type="workers" className="w-36 h-36 mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Workers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">No registered workers match your filters.</p>
            <Button
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="bg-[#2478b8] hover:bg-[#1b6296] text-white rounded-lg text-xs font-semibold px-4 h-8"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/50">
                  <TableHead className="text-xs font-semibold text-slate-600">Worker</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">NIDA ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Skills</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Rating</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Jobs</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.slice((currentPage - 1) * perPage, currentPage * perPage).map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={worker.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-start" >
                        <p className="font-medium text_sm">{worker.name}</p>
                        <p className="text-xs  text-muted-foreground">{worker.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">{worker.nidaId}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 2).map((skill) => (
                        <span key={skill} className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 2 && (
                        <span className="text-xs font-normal text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          +{worker.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {worker.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {worker.rating > 0 ? (
                      <span className="font-medium text-xs text-slate-800">{worker.rating}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{worker.totalJobs}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <CustomDropdown
                        widthClass="w-44"
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DialogTrigger asChild>
                          <CustomDropdownItem onClick={() => setSelectedWorker(worker)}>
                            View Profile
                          </CustomDropdownItem>
                        </DialogTrigger>
                        <CustomDropdownItem>Edit Details</CustomDropdownItem>
                        <CustomDropdownItem>Contact Worker</CustomDropdownItem>
                        <CustomDropdownItem danger>Remove Worker</CustomDropdownItem>
                      </CustomDropdown>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Worker Profile</DialogTitle>
                          <DialogDescription>
                            Detailed information about {selectedWorker?.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedWorker && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                  {selectedWorker.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">{selectedWorker.name}</h3>
                                <p className="text-muted-foreground">{selectedWorker.phone}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">NIDA ID</p>
                                <p className="font-mono">{selectedWorker.nidaId}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(selectedWorker.status)}>
                                  {selectedWorker.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Rating</p>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span>{selectedWorker.rating || "N/A"}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Jobs</p>
                                <p className="font-medium">{selectedWorker.totalJobs}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-muted-foreground text-sm mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedWorker.skills.map((skill) => (
                                  <Badge key={skill}>{skill}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-muted-foreground text-sm">Registered</p>
                              <p>{new Date(selectedWorker.registeredDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
              ))}
            </TableBody>
          </Table>
          <YouTubeStudioPagination
            currentPage={currentPage}
            lastPage={Math.max(1, Math.ceil(filteredWorkers.length / perPage))}
            perPage={perPage}
            total={filteredWorkers.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        </>
        )}
      </div>
    </div>
  );
};

export default RegisteredWorkers;
