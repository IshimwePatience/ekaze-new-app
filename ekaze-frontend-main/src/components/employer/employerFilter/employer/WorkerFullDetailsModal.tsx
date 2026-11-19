import { 
  Star, MapPin, Clock, Banknote, Shield, Phone, Building2, User, X, 
  Languages, Briefcase, CheckCircle, Award, Calendar, Mail, MapPinned,
  TrendingUp, FileText, AlertCircle, BadgeCheck, Home, Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../clsx/utils';
import { ProtectedWorkerDetails } from '@/types/worker.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WorkerFullDetailsModalProps {
  workerDetails: ProtectedWorkerDetails | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getExperienceLevelLabel = (level: string): string => {
  const levels: Record<string, string> = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate (1-3 years)',
    'expert': 'Expert (3+ years)',
    'fresher': 'Fresher (< 1 year)',
    'no-experience': 'No Experience',
  };
  return levels[level] || level;
};

export const WorkerFullDetailsModal = ({ 
  workerDetails, 
  isOpen, 
  onClose,
  isLoading 
}: WorkerFullDetailsModalProps) => {
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '12px' }}>
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!workerDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-border/50 p-6">
          <div className="flex items-start gap-6">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-2 ring-border/40">
                <AvatarImage src={workerDetails.profile_photo || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {getInitials(workerDetails.first_name, workerDetails.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-2 -right-2 px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border-2 border-background",
                workerDetails.availability_status === 'available' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              )} style={{ borderRadius: '8px' }}>
                <div className={cn("w-2 h-2 rounded-full", workerDetails.availability_status === 'available' ? "bg-green-500" : "bg-gray-500")} />
                {workerDetails.availability_status === 'available' ? 'Available' : workerDetails.availability_status === 'hired' ? 'Hired' : 'Unavailable'}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {workerDetails.full_name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {workerDetails.registration_type === 'company' && workerDetails.company_name 
                      ? `${workerDetails.company_name} • Company Worker` 
                      : 'Freelance Professional'}
                  </p>
                  {workerDetails.nida_verified && (
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
                      <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
                      NIDA Verified
                    </Badge>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 mt-3">
                {workerDetails.has_insurance && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <Shield className="mr-1 h-3 w-3" />
                    Insured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {getExperienceLevelLabel(workerDetails.experience_level)}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {workerDetails.total_employments} Previous Jobs
                </Badge>
              </div>

              {parseFloat(workerDetails.average_rating) > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(parseFloat(workerDetails.average_rating)) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{parseFloat(workerDetails.average_rating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({workerDetails.total_ratings} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-border/50 px-6 bg-muted/20">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-transparent p-0">
              <TabsTrigger value="overview" className="text-xs">
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs">
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="employment" className="text-xs">
                <Briefcase className="w-4 h-4 mr-2" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="ratings" className="text-xs">
                <Star className="w-4 h-4 mr-2" />
                Ratings
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <TrendingUp className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Full Name</span>
                      <span className="text-xs font-semibold">{workerDetails.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Age</span>
                      <span className="text-xs font-semibold">{workerDetails.age} years</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Gender</span>
                      <span className="text-xs font-semibold capitalize">{workerDetails.gender}</span>
                    </div>
                    {workerDetails.date_of_birth && (
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">Date of Birth</span>
                        <span className="text-xs font-semibold">
                          {new Date(workerDetails.date_of_birth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-muted-foreground">National ID</span>
                      <span className="text-xs font-semibold font-mono">{workerDetails.national_id}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Preferences */}
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Work Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Experience Level</p>
                      <Badge variant="outline" className="text-xs">
                        <Award className="mr-1.5 h-3 w-3" />
                        {getExperienceLevelLabel(workerDetails.experience_level)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Salary Range</p>
                      <p className="text-xs font-bold text-green-700">
                        {workerDetails.salary_range_formatted}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Work Types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(workerDetails.work_type_preferences || []).map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(workerDetails.languages_spoken || []).map((lang, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Languages className="mr-1 h-3 w-3" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Location Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Address</p>
                      <p className="text-xs font-semibold">{workerDetails.full_address || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">District</p>
                        <p className="text-xs font-medium">{workerDetails.district || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Sector</p>
                        <p className="text-xs font-medium">{workerDetails.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cell</p>
                        <p className="text-xs font-medium">{workerDetails.cell || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Village</p>
                        <p className="text-xs font-medium">{workerDetails.village || 'N/A'}</p>
                      </div>
                    </div>
                    {workerDetails.preferred_districts && workerDetails.preferred_districts.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Preferred Work Districts</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(workerDetails.preferred_districts || []).map((district, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {district}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Insurance Information */}
                {workerDetails.has_insurance && (
                  <Card className="bg-blue-50/50 border-blue-200 border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                        <Shield className="h-4 w-4" />
                        Insurance Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200/50">
                        <span className="text-xs text-blue-600">Status</span>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Active</Badge>
                      </div>
                      {workerDetails.insurance_provider && (
                        <div className="flex justify-between items-center py-2 border-b border-blue-200/50">
                          <span className="text-xs text-blue-600">Provider</span>
                          <span className="text-xs font-semibold text-blue-900">
                            {workerDetails.insurance_provider}
                          </span>
                        </div>
                      )}
                      {workerDetails.insurance_number && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs text-blue-600">Policy Number</span>
                          <span className="text-xs font-semibold font-mono text-blue-900">
                            {workerDetails.insurance_number}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">Phone Number</p>
                      <p className="text-lg font-bold text-green-900">{workerDetails.phone}</p>
                      <Button size="sm" className="mt-3 w-full bg-green-600 hover:bg-green-700 h-9 text-xs" asChild>
                        <a href={`tel:${workerDetails.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </a>
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Email Address</p>
                      <p className="text-xs font-bold text-blue-900 break-all">{workerDetails.email}</p>
                      <Button size="sm" variant="outline" className="mt-3 w-full border-blue-300 text-blue-700 h-9 text-xs" asChild>
                        <a href={`mailto:${workerDetails.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* References */}
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      References
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workerDetails.referee_1_name && (
                      <div className="p-4 border border-border/50 rounded-lg">
                        <p className="text-xs font-bold text-foreground mb-2">
                          {workerDetails.referee_1_name}
                        </p>
                        {workerDetails.referee_1_relationship && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {workerDetails.referee_1_relationship}
                          </p>
                        )}
                        {workerDetails.referee_1_phone && (
                          <p className="text-xs font-mono text-muted-foreground">
                            <Phone className="inline h-3 w-3 mr-1" />
                            {workerDetails.referee_1_phone}
                          </p>
                        )}
                      </div>
                    )}

                    {workerDetails.referee_2_name && (
                      <div className="p-4 border border-border/50 rounded-lg">
                        <p className="text-xs font-bold text-foreground mb-2">
                          {workerDetails.referee_2_name}
                        </p>
                        {workerDetails.referee_2_relationship && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {workerDetails.referee_2_relationship}
                          </p>
                        )}
                        {workerDetails.referee_2_phone && (
                          <p className="text-xs font-mono text-muted-foreground">
                            <Phone className="inline h-3 w-3 mr-1" />
                            {workerDetails.referee_2_phone}
                          </p>
                        )}
                      </div>
                    )}

                    {!workerDetails.referee_1_name && !workerDetails.referee_2_name && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No references provided</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Contact (if applicable) */}
                {workerDetails.registration_type === 'company' && workerDetails.company_name && (
                  <Card className="md:col-span-2 bg-purple-50/50 border-purple-200 border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                        <Building2 className="h-4 w-4" />
                        Company Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-purple-600 mb-1">Company Name</p>
                          <p className="text-xs font-bold text-purple-900">{workerDetails.company_name}</p>
                        </div>
                        {workerDetails.company_phone && (
                          <div>
                            <p className="text-xs text-purple-600 mb-1">Phone</p>
                            <p className="text-xs font-semibold text-purple-900">{workerDetails.company_phone}</p>
                          </div>
                        )}
                        {workerDetails.company_email && (
                          <div>
                            <p className="text-xs text-purple-600 mb-1">Email</p>
                            <p className="text-xs font-semibold text-purple-900">{workerDetails.company_email}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-purple-600 mt-4">
                        To hire this worker, contact the company directly or submit a hiring request.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Employment History Tab */}
            <TabsContent value="employment" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Current Employment */}
              {workerDetails.current_employment && (
                <Card className="border-2 border-green-200 bg-green-50/30 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                      <Briefcase className="h-4 w-4" />
                      Current Employment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Employer</p>
                        <p className="text-xs font-bold">{workerDetails.current_employment.employer_name}</p>
                        {workerDetails.current_employment.company_name && (
                          <p className="text-xs text-muted-foreground">{workerDetails.current_employment.company_name}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                        <p className="text-xs font-semibold">
                          {new Date(workerDetails.current_employment.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Agreed Salary</p>
                        <p className="text-xs font-bold text-green-700">
                          {parseFloat(workerDetails.current_employment.agreed_salary).toLocaleString()} RWF
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="text-xs font-semibold">{workerDetails.current_employment.formatted_duration}</p>
                      </div>
                    </div>
                    {workerDetails.current_employment.work_description && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Work Description</p>
                        <p className="text-xs">{workerDetails.current_employment.work_description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Employment History */}
              <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Employment History ({(workerDetails.employment_history || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(workerDetails.employment_history || []).length > 0 ? (
                    <div className="space-y-4">
                      {(workerDetails.employment_history || []).map((employment, idx) => (
                        <div key={employment.id} className="p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-foreground mb-1">
                                {employment.employer_name}
                              </h4>
                              {employment.company_name && (
                                <p className="text-xs text-muted-foreground mb-2">{employment.company_name}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={employment.status === 'completed' ? 'default' : employment.status === 'active' ? 'secondary' : 'destructive'} className="text-xs">
                                  {employment.status}
                                </Badge>
                                {employment.has_rating && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Rated
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Salary</p>
                              <p className="text-xs font-bold text-green-700">
                                {parseFloat(employment.agreed_salary || '0').toLocaleString()} RWF
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Start Date</p>
                              <p className="text-xs font-semibold">
                                {employment.start_date ? new Date(employment.start_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            {employment.end_date && (
                              <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="text-xs font-semibold">
                                  {new Date(employment.end_date).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-xs font-semibold">{employment.formatted_duration || 'N/A'}</p>
                            </div>
                            {employment.termination_reason && (
                              <div>
                                <p className="text-xs text-muted-foreground">Reason</p>
                                <p className="text-xs font-semibold capitalize">{employment.termination_reason}</p>
                              </div>
                            )}
                          </div>

                          {employment.work_description && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Work Description</p>
                              <p className="text-xs">{employment.work_description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="h-16 w-16 mx-auto mb-3 opacity-20" />
                      <p className="text-xs">No employment history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ratings Tab */}
            <TabsContent value="ratings" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Ratings & Reviews ({(workerDetails.ratings || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(workerDetails.ratings || []).length > 0 ? (
                    <div className="space-y-4">
                      {(workerDetails.ratings || []).map((rating) => (
                        <div key={rating.id} className="p-4 border border-border/50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-4 w-4",
                                        i < rating.rating 
                                          ? "fill-yellow-400 text-yellow-400" 
                                          : "text-muted-foreground/30"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-bold">{rating.rating}/5</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                by {rating.employer_name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="text-xs text-muted-foreground">
                                {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : ''}
                              </p>
                              {rating.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>

                          {rating.review && (
                            <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg">
                              "{rating.review}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="h-16 w-16 mx-auto mb-3 opacity-20" />
                      <p className="text-xs">No ratings or reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Total Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{workerDetails.total_employments || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed assignments</p>
                  </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Total Work Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{workerDetails.total_employment_days || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Days of experience</p>
                  </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">
                      {parseFloat(workerDetails.average_rating || '0').toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">From {workerDetails.total_ratings || 0} reviews</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className={cn("h-5 w-5", workerDetails.nida_verified ? "text-green-600" : "text-gray-400")} />
                        <span className="text-xs font-semibold">NIDA Verification</span>
                      </div>
                      <Badge variant={workerDetails.nida_verified ? "default" : "secondary"} className="text-xs">
                        {workerDetails.nida_verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className={cn("h-5 w-5", workerDetails.has_insurance ? "text-blue-600" : "text-gray-400")} />
                        <span className="text-xs font-semibold">Insurance Coverage</span>
                      </div>
                      <Badge variant={workerDetails.has_insurance ? "default" : "secondary"} className="text-xs">
                        {workerDetails.has_insurance ? "Active" : "None"}
                      </Badge>
                    </div>

                    {workerDetails.total_incidents && workerDetails.total_incidents > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-900">Incidents Reported</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">{workerDetails.total_incidents}</Badge>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-sm" style={{ borderRadius: '12px' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-xs text-muted-foreground">Registration Type</span>
                    <Badge variant="outline" className="capitalize text-xs">{workerDetails.registration_type || 'freelance'}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-xs text-muted-foreground">Member Since</span>
                    <span className="text-xs font-semibold">
                      {workerDetails.created_at ? new Date(workerDetails.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-muted-foreground">Last Updated</span>
                    <span className="text-xs font-semibold">
                      {workerDetails.updated_at ? new Date(workerDetails.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border/50 p-4">
          <div className="flex justify-end items-center gap-3">
            <Button variant="outline" onClick={onClose} size="sm" className="h-9 text-xs">
              Close
            </Button>
            <Button 
              size="sm" 
              className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("employer-navigate", { detail: "active" }));
                if (window.location.pathname.includes('/employer')) {
                  window.location.search = '?tab=active';
                } else {
                  window.location.href = '/employer/dashboard?tab=active';
                }
              }}
            >
              <Users className="h-4 w-4" />
              View Active Workers Table
            </Button>
            <Button asChild size="sm" className="h-9 text-xs">
              <a href={`tel:${workerDetails.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call Worker
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};