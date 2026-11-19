import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const skillOptions = [
  "Cooking",
  "Cleaning",
  "Laundry",
  "Childcare",
  "Elderly Care",
  "Gardening",
  "Security",
  "Driving",
  "Pet Care",
  "Ironing",
];

const WorkerRegistration = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNIDAVerification = () => {
    setIsVerifying(true);
    // Simulate NIDA verification
    setTimeout(() => {
      setIsVerifying(false);
      setNidaVerified(true);
      toast.success("NIDA verification successful!");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidaVerified) {
      toast.error("Please complete NIDA verification first");
      return;
    }
    toast.success("Worker registered successfully! Fee: 500 RWF");
  };

  return (
    <div className="space-y-6">
     

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text_sm gap-2">
                <UserPlus className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className=" text-start text-xs" >Enter the worker's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="firstName">First Name</label >
                  <Input id="firstName" placeholder="Enter first name" required />
                </div>
                <div className="space-y-2  text-start">
                  <label className="text_sm  " htmlFor="lastName">Last Name</label >
                  <Input id="lastName" placeholder="Enter last name" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="nidaId">NIDA ID Number</label >
                  <div className="flex gap-2">
                    <Input id="nidaId" placeholder="Enter National ID" required />
                    <Button
                      type="button"
                      variant={nidaVerified ? "outline" : "default"}
                      onClick={handleNIDAVerification}
                      disabled={isVerifying || nidaVerified}
                    >
                      {isVerifying ? (
                        "Verifying..."
                      ) : nidaVerified ? (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="phone">Phone Number</label >
                  <Input id="phone" placeholder="+250 7XX XXX XXX" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="dob">Date of Birth</label >
                  <Input id="dob" type="date" required />
                </div>
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="gender">Gender</label >
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2  text-start">
                <label className="text_sm " htmlFor="address">Address</label >
                <Textarea id="address" placeholder="Enter full address" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=" text-start" >
              <CardTitle className="text-sm" >Skills & Experience</CardTitle>
              <CardDescription className="text-xs" >Select all applicable skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="experience">Years of Experience</label >
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2  text-start">
                  <label className="text_sm " htmlFor="education">Education Level</label >
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="vocational">Vocational Training</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2  text-start">
                <label className="text_sm " htmlFor="bio">Worker Bio</label >
                <Textarea
                  id="bio"
                  placeholder="Brief description of the worker's background and experience"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2  text-start text-sm">
                <Upload className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription className=" text-start text-xs" >Upload required documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2  text-start">
                <label className="text_sm" >Profile Photo</label >
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-2" />
                  <p className="text_sm text-muted-foreground">Click to upload photo</p>
                </div>
              </div>

              <div className="space-y-2  text-start">
                <label className="text_sm" >ID Document (NIDA Card)</label >
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-2" />
                  <p className="text_sm text-muted-foreground">Click to upload ID</p>
                </div>
              </div>

              <div className="space-y-2  text-start">
                <label className="text_sm" >Police Clearance (Optional)</label >
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-2" />
                  <p className="text_sm text-muted-foreground">Click to upload</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=" text-start text-sm" >
              <CardTitle >Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">Registration Fee</span>
                <span className="font-medium">500 RWF</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">NIDA Verification</span>
                <Badge variant={nidaVerified ? "default" : "secondary"}>
                  {nidaVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox id="terms" required />
                <label  htmlFor="terms" className="text_sm leading-none">
                  I confirm that all information provided is accurate and the worker has
                  consented to registration.
                </label >
              </div>

              {!nidaVerified && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text_sm text-amber-700 dark:text-amber-400">
                    NIDA verification is required before registration
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!nidaVerified}>
                Register Worker (500 RWF)
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default WorkerRegistration;
