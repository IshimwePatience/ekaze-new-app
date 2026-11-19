export const translations = {
  eng: {
    nav: {
      home: "Home",
      // PREVIOUS: findWorker: "Find a Worker",
      findWorker: "Find Driver",
      howItWorks: "How it works",
    },

    common: {
      back: "Back",
      searchPages: "Search pages...",
      loading: "Loading...",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      close: "Close",
      viewDetails: "View Details",
      noResults: "No results found",
    },

    registration: {
  modal: {
    title: "Create Account",
    haveAccount: "Already have an account?",
    subtitle: "Choose your account type and fill in your details",
    close: "Close",
    tabs: {
      worker: "Register as Worker",
      employer: "Register as Employer",
      company: "Register as Company"
    }
  },

    worker: {
    personalInfo: {
      title: "Personal Information",
      firstName: "First Name",
      firstNameRequired: "First name is required",
      firstNamePlaceholder: "Ekaze",
      lastName: "Last Name",
      lastNameRequired: "Last name is required",
      lastNamePlaceholder: "Jean",
      gender: "Gender",
      genderRequired: "Gender is required",
      selectGender: "Select gender",
      male: "Male",
      female: "Female",
        verifying: "Verifying...",
  verifyIdentity: "Verify Identity",
      dateOfBirth: "Date of Birth",
      dateOfBirthPlaceholder: "Select date of birth",
      nationalId: "National ID",
      nationalIdRequired: "National ID is required",
      nidaNameCheck: 'Enter your full name as it appears on your National ID to confirm your identity.',
    nidaDobCheck: 'Enter your date of birth as it appears on your National ID to confirm your identity.',
      nationalIdLength: "National ID must be 16 digits",
      nationalIdPlaceholder: "Enter your national ID",
      
      photo: "Profile Photo",
      preview: "Preview",
            dob: "Select date of birth",
      insurance: {
  title: "Health Insurance",
  selectType: "Select Insurance Type",
  mutuelleLabel: "MUTUELLE DE SANTÉ",
  mutuelleDesc: "Community health insurance",
  othersLabel: "OTHERS",
  othersDesc: "Private or other provider",
  provider: "Insurance Provider",
  number: "Insurance Number",
  providerPlaceholder: "e.g. RSSB, SORAS",
  numberPlaceholder: "Enter insurance number",
},
      name: "Enter any name",
    },
    accountInfo: {
      title: "Account Information",
      phone: "Phone Number",
      phoneRequired: "Phone is required",
      phonePlaceholder: "0781234567",
      email: "Email",
      emailRequired: "Email is required",
      emailPlaceholder: "user@ekaze.pay",
      password: "Password",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 8 characters",
      confirmPassword: "Confirm Password",
      confirmRequired: "Please confirm password",
      passwordMismatch: "Passwords do not match"
    },
    location: {
      title: "Location",
      province: "Province",
      selectProvince: "Select province...",
      district: "District",
      selectDistrict: "Select district...",
      sector: "Sector",
      selectSector: "Select sector...",
      cell: "Cell",
      selectCell: "Select cell...",
      village: "Village",
      selectVillage: "Select village..."
    },
    workPreferences: {
      title: "Work Preferences",
      experienceLevel: "Experience Level",
      levels: {
        beginner: "Beginner",
        intermediate: "Intermediate (1-3 years)",
        expert: "Expert (3+ years)"
      },
      languages: "Languages Spoken",
      workTypes: "Work Types",
      types: {
        full_time: "Full Time",
        part_time: "Part Time",
        contract: "Contract",
        temporary: "Temporary"
      },
      preferredDistricts: "Preferred Work Districts",
      selectAll: "Select All Districts",
      selectDistricts: "Search and select districts...",
      minSalary: "Minimum Salary (RWF)",
      maxSalary: "Maximum Salary (RWF)",
      salaryRequired: "Salary is required",
      salaryPositive: "Salary must be positive",
      minSalaryPlaceholder: "50000",
      maxSalaryPlaceholder: "100000"
    },
    insurance: {
      title: "Insurance Information",
      hasInsurance: "I have insurance coverage",
      provider: "Insurance Provider",
      providerPlaceholder: "SONARWA",
      number: "Insurance Number",
      numberPlaceholder: "INS123456"
    },
    submit: {
      register: "Register as Worker",
      registering: "Registering..."
    }
  },

  employer: {
  note: "Note:",
  noteText: "A one-time registration fee is required to activate your employer account. You will be redirected to payment after registration.",
  
  personalInfo: {
    title: "Personal Information",
    fullName: "Full Name",
    nameRequired: "Full name is required",
    namePlaceholder: "Ekaze Jean",
    gender: "Gender",
    genderRequired: "Gender is required",
    selectGender: "Select gender",
    male: "Male",
    female: "Female",
      verifying: "Verifying...",
  verifyIdentity: "Verify Identity",
    nationalId: "National ID",
    nationalIdRequired: "National ID is required",
        nidaNameCheck: 'Enter your full name as it appears on your National ID to confirm your identity.',
    nidaDobCheck: 'Enter your date of birth as it appears on your National ID to confirm your identity.',
    nationalIdLength: "National ID must be 16 digits",
    nationalIdPlaceholder: "Enter your national ID",
                dob: "Select date of birth",
      name: "Enter any name",

      insurance: {
        title: "Health Insurance",
        selectType: "Select Insurance Type",
        mutuelleLabel: "Mutuelle de Santé",
        mutuelleDesc: "Community health insurance",
        othersLabel: "Others",
        othersDesc: "Private or other provider",
        provider: "Insurance Provider",
        number: "Insurance Number",
        providerPlaceholder: "e.g. RSSB, SORAS",
        numberPlaceholder: "Enter insurance number",
      },
  },
  
  contactInfo: {
    title: "Account Information",
    phone: "Phone Number",
    phoneRequired: "Phone is required",
    phonePlaceholder: "0781234567",
    email: "Email",
    emailRequired: "Email is required",
    emailPlaceholder: "user@ekaze.pay"
  },
  
  location: {
    title: "Location",
    province: "Province",
    selectProvince: "Select province...",
    district: "District",
    selectDistrict: "Select district...",
    sector: "Sector",
    selectSector: "Select sector...",
    cell: "Cell",
    selectCell: "Select cell...",
    village: "Village",
    selectVillage: "Select village..."
  },
  
  security: {
    title: "Account Security",
    password: "Password",
    passwordRequired: "Password is required",
    passwordLength: "Password must be at least 8 characters",
    confirmPassword: "Confirm Password",
    confirmRequired: "Please confirm password",
    passwordMismatch: "Passwords do not match"
  },
  
  submit: {
    register: "Register as Employer",
    registering: "Registering..."
  }
},

company: {
  note: "Note:",
  noteText: "Your company registration will be reviewed by our admin team. You will receive a notification once your account is approved.",
  
  companyInfo: {
    title: "Company Information",
    businessName: "Business Name",
    businessNameRequired: "Business name is required",
    businessNamePlaceholder: "ABC Company Ltd",
    tin: "TIN (Tax Identification Number)",
    tinRequired: "TIN is required",
    tinPlaceholder: "123456789",
    physicalAddress: "Physical Address",
    addressRequired: "Physical address is required",
    addressPlaceholder: "KG 123 St, Kigali",
    logo: "Company Logo",
    logoHint: "Upload your company logo (JPEG, PNG, JPG - Max 2MB)",
    logoPreview: "Logo Preview"
  },
  
  location: {
    title: "Location",
    province: "Province",
    selectProvince: "Select province...",
    district: "District",
    selectDistrict: "Select district...",
    sector: "Sector",
    selectSector: "Select sector...",
    cell: "Cell",
    selectCell: "Select cell...",
    village: "Village",
    selectVillage: "Select village..."
  },
  
  ownerInfo: {
    title: "Owner Information",
    ownerName: "Owner Full Name",
    ownerNameRequired: "Owner name is required",
    ownerNamePlaceholder: "John Doe",
    nationalId: "National ID",
    nationalIdRequired: "National ID is required",
    nationalIdLength: "National ID must be 16 digits",
    nationalIdPlaceholder: "Enter your national ID",
    ownerPhone: "Owner Phone",
    ownerPhoneRequired: "Owner phone is required",
    ownerPhonePlaceholder: "0781234567",
    ownerEmail: "Owner Email",
    ownerEmailRequired: "Owner email is required",
    ownerEmailPlaceholder: "owner@company.com"
  },
  
  security: {
    title: "Account Security",
    password: "Password",
    passwordRequired: "Password is required",
    passwordLength: "Password must be at least 8 characters",
    confirmPassword: "Confirm Password",
    confirmRequired: "Please confirm password",
    passwordMismatch: "Passwords do not match"
  },
  
  submit: {
    submit: "Submit Company Registration",
    submitting: "Submitting..."
  }
},


},

otp: {
  title: "Verify Your Phone Number",
  sent: "We've sent a 6-digit verification code to",
  testing: "For Testing: Your OTP is",
  enterCode: "Enter OTP Code",
  remaining: "Resends remaining:",
  resend: "Resend OTP",
  resending: "Resending...",
  cancel: "Cancel",
  verify: "Verify"
},



    auth: {
      login: "Login",
      register: "Register",
      logout: "Logout",
      loggingOut: "Logging out...",
      dashboard: "Dashboard",
      employerProfile: "Employer Profile",
      companyProfile: "Company Profile",
    },

      workerSearchResults: {
    workersMatch:        "workers match",
    workersFound:        "Workers Found",
    basedOnSearch:       "Based on your search criteria",
    available:           "Available",
    verified:            "Verified",
    rated:               "Rated",
    whyChoose:           "Why Choose Our Platform?",
    featureVerified:     "Verified",
    featureVerifiedDesc: "Pre-screened professionals",
    featureProfiles:     "Profiles",
    featureProfilesDesc: "Complete work history & ratings",
    featureSearch:       "Search",
    featureSearchDesc:   "Advanced filtering tools",
    featureConnect:      "Connect",
    featureConnectDesc:  "Direct contact & instant hire",
    loginToView:         "Login to View",
    subscribe:           "Subscribe",
    haveAccount:         "Have an account?",
    loginLink:           "Login",
    forEmployers:        "For Employers",
    forEmployersDesc:    "Access verified workers. Post jobs and hire talent.",
    benefits:            "Benefits",
    benefitsDesc:        "Unlimited views, direct contact. From $29/mo.",
    showing:             "Showing",
    of:                  "of",
    sortLatest:          "Latest",
    sortTopRated:        "Top Rated",
    sortSalaryLow:       "Salary: Low",
    sortSalaryHigh:      "Salary: High",
    sortExperience:      "Experience",
    noWorkersFound:      "No Workers Found",
    adjustFilters:       "Try adjusting your filters",
    loading:             "Loading...",
    next:                "Next",
  },

    advancedFilters: {
    title:               "Advanced Search",
    activeFiltersLabel:  "applied",
    sectionServices:     "Services Offered",
    sectionEducation:    "Education Level",
    sectionExperience:   "Years of Experience",
    experienceMin:       "Min",
    experienceMax:       "Max",
    sectionWorkType:     "Preferred Work Type",
    sectionAvailableDays:"Available Days",
    weekends:            "Weekends",
    holidays:            "Public Holidays",
    sectionCertificates: "Certificates",
    sectionMaritalStatus:"Marital Status",
    sectionOther:        "Other",
    physicallyFit:       "Physically Fit",
    applyButton:         "Search",
    resetButton:         "Reset All",

    services: {
      babySitter:  "Nanny / Baby Sitting",
      laundry:     "Laundry",
      ironing:     "Ironing",
      houseChores: "House Chores",
      cooking:     "Cooking",
      gardening:   "Gardening",
      carWashing:  "Car Washing",
      elderlyCare: "Elderly Care",
      childcare:   "Childcare",
      petCare:     "Pet Care",
      shopping:    "Shopping",
      driving:     "Driving",
    },

    days: {
      monday:    "Monday",
      tuesday:   "Tuesday",
      wednesday: "Wednesday",
      thursday:  "Thursday",
      friday:    "Friday",
      saturday:  "Saturday",
      sunday:    "Sunday",
    },

    education: {
      all:       "All Levels",
      none:      "No Schooling",
      primary:   "Primary School",
      secondary: "Secondary School",
      advanced:  "A-Level",
      tvet:      "TVET",
      bachelor:  "Bachelor's Degree",
      masters:   "Master's Degree",
      phd:       "PhD",
    },

    workType: {
      all:       "All Types",
      liveIn:    "Live In",
      liveOut:   "Live Out",
      partTime:  "Part Time",
      fullTime:  "Full Time",
      flexible:  "Flexible",
    },

    certificates: {
      driving:   "Driving Licence",
      cooking:   "Cooking Certificate",
      firstAid:  "First Aid Certificate",
      childcare: "Childcare Certificate",
    },

    maritalStatus: {
      all:      "All Statuses",
      single:   "Single",
      married:  "Married",
      divorced: "Divorced",
      widowed:  "Widowed",
    },
  },


    searchFilters: {
    searchPlaceholder:  "Search by name...",
    clearFilters:       "Clear Filters",
    gender:             "Gender",
    location:           "Location",
    locationPlaceholder:"Select districts...",
    workerType:         "Worker Type",
    workType:           "Work Type",
    experience:         "Experience",
    ageRange:           "Age Range",
    salary:             "Salary (RWF)",
    languages:          "Languages",
    showMore:           "Show More",
    showLess:           "Show Less",
    insurance:          "Insurance",
    availableOnly:      "Available Only",

    genderOptions: {
      all:    "All Genders",
      male:   "Male",
      female: "Female",
    },
    workerTypeOptions: {
      all:      "All Types",
      company:  "Company",
      freelance:"Freelance",
    },
    insuranceOptions: {
      all: "All Workers",
      yes: "Has Insurance",
      no:  "No Insurance",
    },
  },

  

    employerSearch: {
    heroTitle:         "Find Skilled Workers",
    heroSubtitleAuth:  "Discover qualified professionals for your projects.",
    heroSubtitleGuest: "Browse skilled professionals. Login to view full profiles.",
    resetFilters:      "Reset",
    advancedSearch:    "Advanced Search",
    filterWorkers:     "Filter Workers",
    errorLoading:      "Error loading workers",
    loadingMore:       "Loading more...",
  },

    hero: {
      badge: "Rwanda's Trusted Worker Management Platform",
      title1: "Connect & Manage",
      title2: "Workers",
      title3: "with Confidence",
      subtitle: "We verify. We connect. You hire safely and confidently.",
      cta: {
        hire: "Start Hiring",
        login: "Login to access portal",
      },
    },

    stats: {
      workers: "Workers Registered",
      employers: "Happy Employers",
      partners: "Partner Companies",
      verified: "Verified Profiles",
    },

    tabs: {
      overview: "Overview",
      findWorkers: "Find Workers",
      activeWorkers: "Active Workers",
      verify: "Verify",
      requests: "Requests",
      incidents: "Incidents",
      payments: "Payments",
      workers: "Workers",
      employers: "Employers",
      revenue: "Revenue",
      dashboard: "Dashboard",
    schedule:  "My Schedule",
    experience: "Experience",
    profile: "Profile"
    },

    sidebar: {
      activeSince: "Active since",
      verifiedEmployer: "Verified Employer",
      unverifiedEmployer: "Unverified Employer",
      verifiedCompany: "Verified Company",
      activeWorkers: "Active Workers",
      totalWorkers: "Total Workers",
      activeEmployments: "Active Employments",
      thisMonthSpending: "This month spending",
      thisMonthRevenue: "This month revenue",
      viewAnalytics: "View all analytics",
    },

    notifications: {
      title: "Notifications",
      markAllRead: "Mark all read",
      noNotifications: "No unread notifications",
      viewAll: "View all notifications",
      center: "Notifications Center",
      manage: "View and manage all your notifications",
      details: "Notification Details",
      viewComplete: "View complete notification information",
      unread: "Unread",
      received: "Received",
      from: "From",
      additionalInfo: "Additional Information",
      markAsRead: "Mark as Read",
    },
    howItWorks: {
    badge: "How It Works",
    title1: "Simple, Secure",
    title2: "Hiring Process",
    subtitle: "From registration to verified employment in five easy steps.",
    steps: {
        register:   { title: "Register & Verify",      desc: "Companies register with TIN, workers with National ID. All profiles verified through NIDA." },
        search:     { title: "Search & Connect",        desc: "Employers search workers by criteria. Request details for company workers or contact freelancers directly." },
        handover:   { title: "Secure Handover",         desc: "OTP verification during handover confirms identity. View full history and background check." },
        employment: { title: "Verified Employment",     desc: "Confirm receipt to start employment. QR service card generated. Full tracking begins." },
        rate:       { title: "Rate & Review",           desc: "Both parties can rate and review. Build trust through transparent feedback history." },
    },
    },
    cta: {
    badge: "Join Rwanda's #1 Worker Platform",
    title1: "Ready to Transform",
    title2: "Worker Management?",
    subtitle: "Join thousands of companies, workers, and employers already using Ekaze for secure, verified hiring in Rwanda.",
    primaryBtn: "Get Started Today",
    secondaryBtn: "Login to Portal",
    trustNote: "No credit card required  •  Free for workers to browse  •  Setup in minutes",
    },

    footer: {
    brandDesc: "Rwanda's trusted platform for worker management. Connecting companies, workers, and employers securely.",
    product: "Product",
    forUsers: "For Users",
    company: "Company",
    legal: "Legal",
    features: "Features",
    howItWorks: "How It Works",
    pricing: "Pricing",
    security: "Security",
    companies: "Companies",
    workers: "Workers",
    employers: "Employers",
    authorities: "Authorities",
    aboutUs: "About Us",
    careers: "Careers",
    contact: "Contact",
    press: "Press",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
    gdpr: "GDPR",
    allRights: "All rights reserved.",
    poweredBy: "Powered by Beno Finance.",
    badge: {
        nida: "NIDA Verified",
        momo: "MoMo Pay",
        rnp: "RNP Integrated",
    },
    },
    login: {
    emailLabel:          "Email/Phone Number",
    emailPlaceholder:    "Enter email or phone number",
    phoneLabel:          "Phone Number",
    phonePlaceholder:    "Enter phone number",
    passwordLabel:       "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword:      "Forgot password?",
    rememberMe:          "Remember me for 30 days",
    signIn:              "Sign In",
    signingIn:           "Signing in...",
    },

forgotPassword: {
  hint:         "We'll send a 6-digit OTP to your phone",
  sendOtp:      "Send OTP",
  sending:      "Sending...",
  backToLogin:  "Back to Login",
  otpSentTo:    "OTP sent to",
  otpLabel:     "OTP Code",
  otpPlaceholder: "Enter 6-digit code",
  changePhone:  "Change number",
  resendOtp:    "Resend OTP",
},
resetPassword: {
  newPasswordLabel:           "New Password",
  newPasswordPlaceholder:     "Enter new password",
  confirmPasswordLabel:       "Confirm Password",
  confirmPasswordPlaceholder: "Confirm your new password",
  passwordMismatch:           "Passwords do not match",
  resetButton:                "Reset Password",
  resetting:                  "Resetting...",
  success: {
    title:     "Password Reset!",
    subtitle:  "Your password has been reset. You can now sign in.",
    goToLogin: "Go to Login",
  },


},

// =====================================================================ADMIN==================================================
  admin: {
    adminSidebar: {
  backToHome: "Back to Home",
  sections: {
    overview:   "OVERVIEW",
    management: "MANAGEMENT",
    operations: "OPERATIONS",
    system:     "SYSTEM",
  },
  items: {
    dashboard: "Dashboard",
    companies: "Companies",
    workers:   "Workers",
    incidents: "Incidents",
    payments:  "Payments",
    users:     "Users",
    analytics: "Analytics",
    settings:  "Settings",
  },
},

  adminHeader: {
    title: "Admin Dashboard",
    profile: {
      defaultName: "System Admin",
      settings:    "Profile Settings",
    },
    notifications: {
      dropdownTitle:       "System Alerts",
      system:              "System",
      newLabel:            "New",
      emptyTitle:          "No notifications",
      noNotifications:     "You don't have any notifications yet.",
      noUnread:            "You have no unread notifications.",
      noRead:              "You have no read notifications.",
      badgeAlert:          "ALERT",
      badgePayment:        "PAYMENT",
      badgeSystem:         "SYSTEM",
      badgeNew:            "NEW",
      badgeInfo:           "INFO",
      statsTotal:          "Total",
      statsUnread:         "Unread",
      statsRead:           "Read",
      statsTypes:          "Types",
      tabAll:              "All",
      tabUnread:           "Unread",
      tabRead:             "Read",
      filterPlaceholder:   "Filter by type",
      filterAll:           "All Types",
      filterIncidents:     "Incidents",
      filterPayments:      "Payments",
      filterSystem:        "System",
      filterRegistrations: "Registrations",
    },
  },

    adminStats: {
    title: "System Overview",
    subtitle: "Monitor and manage the entire platform",
    
    // Stats Cards
    totalCompanies: "Total Companies",
    registeredWorkers: "Registered Workers",
    totalRevenue: "Total Revenue",
    activeIncidents: "Active Incidents",
    approved: "approved",
    available: "available",
    employed: "employed now",
    pending: "pending",
    allVerified: "all verified",
    thisMonth: "this month",
    resolved: "resolved",
    critical: "critical",
    noCritical: "No critical",
    total: "total",
    
    // Secondary Stats
    activeEmployments: "Active Employments",
    nidaVerified: "NIDA Verified",
    activeUsers: "Active Users",
    withInsurance: "With Insurance",
    
    // Tabs
    overview: "Overview",
    transactions: "Transactions",
    workers: "Workers",
    companies: "Companies",
    incidents: "Incidents",
    
    // Overview Tab
    workersByDistrict: "Workers by District",
    workersCount: "workers",
    platformActivity: "Platform Activity",
    totalUsers: "Total Users",
    employers: "Employers",
    freelancers: "Freelancers",
    companyWorkers: "Company Workers",
    active: "active",
    paid: "paid",
    independent: "independent",
    registered: "registered",
    
    // Transactions Tab
    recentTransactions: "Recent Transactions",
    transactionsCount: "transactions",
    completed: "Completed",
    pending_status: "Pending",
    failed: "Failed",
    todayRevenue: "Today Revenue",
    transactionId: "Transaction ID",
    type: "Type",
    amount: "Amount",
    status: "Status",
    date: "Date",
    
    // Workers Tab
    recentWorkers: "Recent Workers",
    workersCount2: "workers",
    totalWorkers: "Total",
    available_status: "Available",
    employed_status: "Employed",
    verified: "Verified",
    id: "ID",
    name: "Name",
    workerType: "Type",
    workerStatus: "Status",
    registeredDate: "Registered",
    
    // Companies Tab
    recentCompanies: "Recent Companies",
    companiesCount: "companies",
    totalCompanies2: "Total",
    approved_status: "Approved",
    pending_status2: "Pending",
    rejected: "Rejected",
    businessName: "Business Name",
    
    // Incidents Tab
    recentIncidents: "Recent Incidents",
    incidentsCount: "incidents",
    totalIncidents: "Total",
    open: "Open",
    investigating: "Investigating",
    resolved_status: "Resolved",
    critical_status: "Critical",
    incidentType: "Type",
    severity: "Severity",
    reportedDate: "Reported",
    
    // Severity levels
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Status badges
    completed_status: "completed",
    pending_badge: "pending",
    failed_status: "failed",
    hired: "hired",
    
    // Error states
    loadError: "Failed to load dashboard data",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Common
    workers2: "workers",
    companies2: "companies",
    incidents2: "incidents",
    transactions2: "transactions",
  },

    companyManagement: {
    title: "Company Management",
    subtitle: "Review and manage company registrations",
    registerCompany: "Register Company",
    
    // Stats Cards
    totalCompanies: "Total Companies",
    pendingReview: "Pending Review",
    approved: "Approved",
    suspended: "Suspended",
    registered: "Registered",
    awaiting: "Awaiting",
    needReview: "need review",
    active: "Active",
    inactive: "Inactive",
    approvalRate: "approval rate",
    rejected: "rejected",
    
    // Table Headers
    company: "Company",
    contact: "Contact",
    location: "Location",
    workers: "Workers",
    status: "Status",
    actions: "Actions",
    id: "ID",
    
    // Table Content
    notAvailable: "N/A",
    
    // Filters
    searchPlaceholder: "Search by company name or ID...",
    statusFilter: "Status",
    allStatus: "All Status",
    pending: "Pending",
    approved_status: "Approved",
    rejected_status: "Rejected",
    suspended_status: "Suspended",
    
    // Tabs
    allCompanies: "All Companies",
    all: "All",
    pending_tab: "Pending",
    approved_tab: "Approved",
    suspended_tab: "Suspended",
    
    // Empty States
    noCompaniesFound: "No Companies Found",
    noCompaniesMatch: "No companies match your current filters. Try adjusting your search criteria.",
    noCompaniesRegistered: "No companies have been registered yet.",
    noPendingCompanies: "No pending companies at the moment.",
    noApprovedCompanies: "No approved companies at the moment.",
    noSuspendedCompanies: "No suspended companies at the moment.",
    clearFilters: "Clear Filters",
    
    // Status Badge Texts
    pending_badge: "Pending",
    approved_badge: "Approved",
    rejected_badge: "Rejected",
    suspended_badge: "Suspended",
    
    // Messages
    companiesCount: "companies",
    
  },

    companyDetails: {
    // Header
    tin: "TIN",
    
    // Quick Stats
    workers: "Workers",
    revenue: "Revenue",
    avgRating: "Avg Rating",
    pending: "Pending",
    
    // Tabs
    companyInfo: "Company Info",
    workers_tab: "Workers",
    requests: "Requests",
    transactions: "Transactions",
    
    // Company Info Tab
    companyInformation: "Company Information",
    ownerEmail: "Owner Email",
    ownerPhone: "Owner Phone",
    ownerName: "Owner Name",
    location: "Location",
    registrationDate: "Registration Date",
    subscriptionFee: "Subscription Fee",
    rejectionReason: "Rejection Reason",
    suspensionReason: "Suspension Reason",
    
    // Quick Actions
    quickActions: "Quick Actions",
    approveCompany: "Approve Company",
    rejecting: "Rejecting...",
    approving: "Approving...",
    rejectRegistration: "Reject Registration",
    suspendCompany: "Suspend Company",
    suspending: "Suspending...",
    
    // Workers Tab
    worker: "Worker",
    experience: "Experience",
    status: "Status",
    rating: "Rating",
    employments: "Employments",
    id: "ID",
    
    // Hiring Requests Tab
    requestId: "Request ID",
    employer: "Employer",
    proposedSalary: "Proposed Salary",
    date: "Date",
    
    // Transactions Tab
    transactionId: "Transaction ID",
    type: "Type",
    amount: "Amount",
    
    // Status Badges
    pending_badge: "pending",
    approved_badge: "approved",
    rejected_badge: "rejected",
    suspended_badge: "suspended",
    active_badge: "active",
    hired_badge: "hired",
    available_badge: "available",
    completed_badge: "completed",
    
    // Experience Levels
    entry: "Entry",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    
    // Action Dialog
    approveTitle: "Approve Company",
    rejectTitle: "Reject Company",
    suspendTitle: "Suspend Company",
    approveDescription: "Are you sure you want to approve {companyName}?",
    rejectDescription: "Please provide a reason for rejecting {companyName}.",
    suspendDescription: "Please provide a reason for suspending {companyName}.",
    enterReason: "Enter reason...",
    cancel: "Cancel",
    confirm: "Confirm",
    processing: "Processing...",
    
    // Not Available
    notAvailable: "N/A",
  },

    workerManagement: {
    title: "Worker Management",
    subtitle: "Manage all registered workers and freelancers",
    registerWorker: "Register worker",
    
    // Stats Cards
    totalWorkers: "Total Workers",
    companyWorkers: "Company Workers",
    freelancers: "Freelancers",
    suspended: "Suspended",
    registered: "Registered",
    available: "available",
    employed: "Employed",
    currentlyHired: "currently hired",
    independent: "Independent",
    readyToWork: "ready to work",
    inactive: "Inactive",
    activeWorkers: "active workers",
    
    // Table Headers
    worker: "Worker",
    contact: "Contact",
    location: "Location",
    type: "Type",
    rating: "Rating",
    jobs: "Jobs",
    status: "Status",
    actions: "Actions",
    id: "ID",
    
    // Worker Types
    company: "Company",
    freelance: "Freelance",
    companyShort: "Co",
    freelanceShort: "FL",
    
    // Status Badges
    available_badge: "Available",
    hired_badge: "Hired",
    unavailable_badge: "Unavailable",
    active_badge: "Active",
    suspended_badge: "Suspended",
    
    // Filters
    searchPlaceholder: "Search by name, ID, or National ID...",
    typeFilter: "Type",
    statusFilter: "Status",
    allTypes: "All Types",
    allStatus: "All Status",
    company_type: "Company",
    freelance_type: "Freelance",
    available_status: "Available",
    hired_status: "Hired",
    unavailable_status: "Unavailable",
    
    // Tabs
    allWorkers: "All Workers",
    all: "All",
    available_tab: "Available",
    hired_tab: "Hired",
    unavailable_tab: "Unavailable",
    
    // Empty States
    noWorkersFound: "No Workers Found",
    noWorkersMatch: "No workers match your current filters. Try adjusting your search criteria.",
    noWorkersRegistered: "No workers have been registered yet.",
    noAvailableWorkers: "No available workers at the moment.",
    noHiredWorkers: "No hired workers at the moment.",
    noUnavailableWorkers: "No unavailable workers at the moment.",
    clearFilters: "Clear Filters",
    
    // Messages
    workersCount: "workers",
    
    // Not Available
    notAvailable: "N/A",
    
    // Status Badge Texts
    pending_badge: "Pending",
    approved_badge: "Approved",
    rejected_badge: "Rejected",
    suspended_badge_text: "Suspended",
  },

    workerDetails: {
    // Header
    workerId: "Worker ID",
    nationalId: "National ID",
    companyWorker: "Company Worker",
    freelancer: "Freelancer",
    nidaVerified: "NIDA Verified",
    
    // Quick Stats
    totalJobs: "Total Jobs",
    avgRating: "Avg Rating",
    earnings: "Earnings",
    daysWorked: "Days Worked",
    
    // Tabs
    workerInfo: "Worker Info",
    employment: "Employment",
    ratings: "Ratings",
    incidents: "Incidents",
    
    // Personal Information
    personalInformation: "Personal Information",
    email: "Email",
    phone: "Phone",
    location: "Location",
    age: "Age",
    years: "years",
    experience: "Experience",
    registrationDate: "Registration Date",
    languagesSpoken: "Languages Spoken",
    workTypePreferences: "Work Type Preferences",
    
    // Insurance
    insuranceInformation: "Insurance Information",
    provider: "Provider",
    number: "Number",
    
    // Company Affiliation
    companyAffiliation: "Company Affiliation",
    tin: "TIN",
    
    // Current Employment
    currentlyEmployed: "Currently Employed",
    employer: "Employer",
    salary: "Salary",
    started: "Started",
    
    // Quick Actions
    quickActions: "Quick Actions",
    verifyNIDA: "Verify NIDA",
    verifying: "Verifying...",
    suspendWorker: "Suspend Worker",
    suspending: "Suspending...",
    reactivateWorker: "Reactivate Worker",
    reactivating: "Reactivating...",
    
    // Referees
    referees: "Referees",
    
    // Employment Table
    employerHeader: "Employer",
    salaryHeader: "Salary",
    startDate: "Start Date",
    endDate: "End Date",
    duration: "Duration",
    statusHeader: "Status",
    ongoing: "Ongoing",
    days: "days",
    
    // Ratings Table
    ratingHeader: "Rating",
    review: "Review",
    date: "Date",
    
    // Incidents Table
    type: "Type",
    description: "Description",
    severity: "Severity",
    
    // Status Badges
    available_badge: "Available",
    hired_badge: "Hired",
    unavailable_badge: "Unavailable",
    active_badge: "Active",
    suspended_badge: "Suspended",
    completed_badge: "Completed",
    pending_badge: "Pending",
    
    // Severity Levels
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Experience Levels
    entry: "Entry",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    
    // Action Dialogs
    verifyTitle: "Verify NIDA",
    suspendTitle: "Suspend Worker",
    reactivateTitle: "Reactivate Worker",
    verifyDescription: "Are you sure you want to verify NIDA for {workerName}?",
    suspendDescription: "Please provide a reason for suspending {workerName}.",
    reactivateDescription: "Are you sure you want to reactivate {workerName}?",
    enterSuspensionReason: "Enter suspension reason...",
    cancel: "Cancel",
    confirm: "Confirm",
    processing: "Processing...",
    
    // Not Available
    notAvailable: "N/A",
  },

    incidentManagement: {
    title: "Incident Management",
    subtitle: "Monitor and manage all platform incidents",
    reportIncident: "Report Incident",
    
    // Stats Cards
    reported: "Reported",
    investigating: "Investigating",
    proofFiles: "Proof Files",
    addProofFiles: "Add Proof Files",
    resolved: "Resolved",
    dismissed: "Dismissed",
    escalated: "Escalated",
    newIncidents: "New incidents",
    inProgress: "In progress",
    completed: "Completed",
    closed: "Closed",
    priorityCases: "Priority cases",
    criticalCases: "critical cases",
    highPriority: "high priority",
    totalIncidents: "total incidents",
    lowSeverity: "low severity",
    mediumLevel: "medium level",
    
    // Table Headers
    incident: "Incident",
    worker: "Worker",
    reportedBy: "Reported By",
    type: "Type",
    severity: "Severity",
    status: "Status",
    date: "Date",
    actions: "Actions",
    id: "ID",
    
    // Severity Levels
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Status Types
    reported_status: "Reported",
    under_investigation: "Under Investigation",
    resolved_status: "Resolved",
    dismissed_status: "Dismissed",
    escalated_status: "Escalated",
    
    // Incident Types
    theft: "Theft",
    violence: "Violence",
    negligence: "Negligence",
    breach_of_contract: "Breach of Contract",
    misconduct: "Misconduct",
    other: "Other",
    
    // Filters
    searchPlaceholder: "Search by incident ID, worker name...",
    typeFilter: "Type",
    severityFilter: "Severity",
    allTypes: "All Types",
    allSeverity: "All Severity",
    
    // Tabs
    allIncidents: "All Incidents",
    reported_tab: "Reported",
    investigating_tab: "Investigating",
    resolved_tab: "Resolved",
    dismissed_tab: "Dismissed",
    escalated_tab: "Escalated",
    
    // Empty States
    noIncidentsFound: "No Incidents Found",
    noIncidentsMatch: "No incidents match your current filters. Try adjusting your search criteria.",
    noIncidentsReported: "No incidents have been reported yet.",
    noReportedIncidents: "No reported incidents at the moment.",
    noInvestigatingIncidents: "No incidents under investigation.",
    noResolvedIncidents: "No resolved incidents.",
    noDismissedIncidents: "No dismissed incidents.",
    noEscalatedIncidents: "No escalated incidents.",
    clearFilters: "Clear Filters",
    
    // Messages
    incidentsCount: "incidents",
    notAvailable: "N/A",
  },

    incidentDetails: {
    // Header
    incidentNumber: "Incident #",
    severity: "Severity",
    level: "level",
    date: "Date",
    location: "Location",
    status: "Status",
    incidentDate: "incident date",
    incidentSite: "incident site",
    current: "current",
    
    // Quick Actions
    addNotes: "Add Notes",
    print: "Print",
    resolve: "Resolve",
    escalate: "Escalate",
    dismiss: "Dismiss",
    assignOfficer: "Assign Officer",
    delete: "Delete",
    resolving: "Resolving...",
    escalating: "Escalating...",
    dismissing: "Dismissing...",
    assigning: "Assigning...",
    deleting: "Deleting...",
    adding: "Adding...",
    
    // Tabs
    overview: "Overview",
    worker: "Worker",
    employer: "Employer",
    timeline: "Timeline",
    
    // Overview Tab
    incidentDetails: "Incident Details",
    description: "Description",
    type: "Type",
    reportedDate: "Reported Date",
    evidenceFiles: "Evidence Files",
    evidence: "Evidence",
    locationInformation: "Location Information",
    incidentLocation: "Incident Location",
    notSpecified: "Not specified",
    locationWhereIncidentOccurred: "Location where incident occurred",
    assignedOfficer: "Assigned Officer",
    policeNotes: "Police Notes",
    resolution: "Resolution",
    timeline2: "Timeline",
    reported: "Reported",
    resolved_status: "Resolved",
    
    // Worker Tab
    workerId: "Worker ID",
    nationalId: "National ID",
    phone: "Phone",
    gender: "Gender",
    email: "Email",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    workerStatistics: "Worker Statistics",
    averageRating: "Average Rating",
    totalEmployments: "Total Employments",
    totalRatings: "Total Ratings",
    totalIncidents: "Total Incidents",
    companyInformation: "Company Information",
    noWorkerInfo: "No worker information available",
    
    // Employer Tab
    employerId: "Employer ID",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    employerStatistics: "Employer Statistics",
    activeWorkers: "Active Workers",
    totalWorkersHired: "Total Workers Hired",
    incidentsReported: "Incidents Reported",
    noEmployerInfo: "No employer information available",
    
    // Timeline Tab
    officer: "Officer",
    noTimelineEvents: "No timeline events yet",
    
    // Notes Modal
    addInvestigationNotes: "Add Investigation Notes",
    notesDescription: "Add notes to the investigation for incident #{incidentNumber}",
    notes: "Notes",
    notesPlaceholder: "Enter your investigation notes here...",
    cancel: "Cancel",
    
    // Action Dialogs
    resolveTitle: "Resolve Incident",
    dismissTitle: "Dismiss Incident",
    escalateTitle: "Escalate Incident",
    assignTitle: "Assign Officer",
    deleteTitle: "Delete Incident",
    resolveDescription: "Please provide resolution details for incident #{incidentNumber}.",
    dismissDescription: "Are you sure you want to dismiss incident #{incidentNumber}?",
    escalateDescription: "Are you sure you want to escalate incident #{incidentNumber}?",
    assignDescription: "Select an officer to assign to incident #{incidentNumber}.",
    deleteDescription: "This action cannot be undone. Are you sure you want to delete incident #{incidentNumber}?",
    selectOfficer: "Select Officer",
    selectOfficerPlaceholder: "Select officer",
    resolutionDetails: "Resolution Details",
    escalationNotes: "Escalation Notes",
    resolutionPlaceholder: "Enter resolution details...",
    escalationPlaceholder: "Enter escalation notes...",
    
    // Success Messages
    resolvedSuccess: "Incident resolved successfully",
    dismissedSuccess: "Incident dismissed successfully",
    escalatedSuccess: "Incident escalated successfully",
    assignedSuccess: "Officer assigned successfully",
    deletedSuccess: "Incident deleted successfully",
    notesAddedSuccess: "Notes added successfully",
    
    // Error Messages
    enterNotes: "Please enter notes",
    
    // Severity Levels
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
    
    // Status Types
    reported_status: "REPORTED",
    under_investigation: "UNDER INVESTIGATION",
    resolved_status_badge: "RESOLVED",
    dismissed_status: "DISMISSED",
    escalated_status: "ESCALATED",
    
    // Gender
    male: "Male",
    female: "Female",
    other: "Other",
    
    // Not Available
    notAvailable: "N/A",
    
    // Processing
    processing: "Processing...",
  },

    createIncident: {
    title: "Report New Incident",
    subtitle: "Create a new incident report",
    
    // Worker Selection
    selectWorker: "Select Worker *",
    changeWorker: "Change Worker",
    filterByCompany: "Filter by Company",
    searchCompanyPlaceholder: "Search by company name, TIN, or ID...",
    browseCompanies: "Browse Companies",
    hideCompanies: "Hide Companies",
    companiesCount: "companies",
    loadingCompanies: "Loading companies...",
    noCompaniesFound: "No companies found",
    tryAdjustingSearch: "Try adjusting your search",
    
    // Worker Tabs
    allWorkers: "All Workers",
    availableWorkers: "Available",
    companyWorkers: "Company Workers",
    selectCompanyFirst: "Select Company",
    
    // Worker Search
    searchWorkerPlaceholder: "Search by name, ID, or National ID...",
    workerType: "Worker Type",
    allTypes: "All Types",
    company: "Company",
    freelance: "Freelance",
    loadingWorkers: "Loading workers...",
    noWorkersFound: "No workers found",
    noWorkersInCompany: "This company has no workers yet",
    tryAdjustingSearchOrFilters: "Try adjusting your search or filters",
    
    // Worker Info
    id: "ID",
    company2: "Company",
    freelance2: "Freelance",
    workersCount: "workers",
    
    // Incident Details
    incidentDetails: "Incident Details",
    incidentType: "Incident Type *",
    selectType: "Select type...",
    severity: "Severity *",
    selectSeverity: "Select severity...",
    incidentDate: "Incident Date *",
    
    // Incident Types
    theft: "Theft",
    violence: "Violence",
    negligence: "Negligence",
    breach_of_contract: "Breach of Contract",
    misconduct: "Misconduct",
    other: "Other",
    
    // Severity Levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Location
    location: "Location",
    fullLocation: "Full Location:",
    province: "Province *",
    selectProvince: "Select province...",
    district: "District *",
    selectDistrict: "Select district...",
    sector: "Sector *",
    selectSector: "Select sector...",
    cell: "Cell *",
    selectCell: "Select cell...",
    village: "Village *",
    selectVillage: "Select village...",
    
    // Description
    description: "Description *",
    descriptionPlaceholder: "Provide a detailed description of the incident… Use headings, bullet points, and formatting to structure your report.",
    
    // Actions
    cancel: "Cancel",
    create: "Create Incident",
    creating: "Creating...",
    
    // Validation
    selectAllLocationFields: "Please select all location fields (Province, District, Sector, Cell, and Village)",
    
    // Status Badges
    available: "Available",
    hired: "Hired",
    unavailable: "Unavailable",
    pending: "Pending",
    approved: "Approved",
    suspended: "Suspended",
  },

    transactionManagement: {
    title: "Transaction Management",
    subtitle: "Monitor and manage all system transactions",
    export: "Export",
    exporting: "Exporting...",
    
    // Stats Cards
    totalRevenue: "Total Revenue",
    todayRevenue: "Today's Revenue",
    pendingAmount: "Pending Amount",
    failedAmount: "Failed Amount",
    totalTransactions: "Total Transactions",
    allTime: "All time",
    hours24: "24 hours",
    today: "today",
    awaiting: "Awaiting",
    inQueue: "in queue",
    unsuccessful: "Unsuccessful",
    failed: "failed",
    processed: "Processed",
    thisMonth: "this month",
    
    // Table Headers
    transactionId: "Transaction ID",
    user: "User",
    type: "Type",
    amount: "Amount",
    method: "Method",
    status: "Status",
    date: "Date",
    actions: "Actions",
    ref: "Ref",
    unknown: "Unknown",
    noEmail: "No email",
    
    // Transaction Types
    employer_registration: "Employer Registration",
    worker_registration: "Worker Registration",
    refund: "Refund",
    service_fee: "Service Fee",
    subscription: "Subscription",
    
    // Payment Methods
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    card: "Card",
    cash: "Cash",
    allMethods: "All Methods",
    
    // Status Badges
    completed: "Completed",
    pending: "Pending",
    failed_status: "Failed",
    review: "Review",
    refunded: "Refunded",
    
    // Filters
    filters: "Filters",
    activeFilters: "active",
    clearAll: "Clear All",
    searchPlaceholder: "Search by ID, reference, name...",
    typeFilter: "Type",
    paymentMethod: "Payment Method",
    allTypes: "All Types",
    allMethods2: "All Methods",
    
    // Tabs
    allTransactions: "All Transactions",
    completed_tab: "Completed",
    pending_tab: "Pending",
    failed_tab: "Failed",
    review_tab: "Review",
    refunded_tab: "Refunded",
    
    // Empty States
    noTransactionsFound: "No Transactions Found",
    noTransactionsMatch: "No transactions match your current filters. Try adjusting your search criteria.",
    noTransactionsRecorded: "No transactions have been recorded yet.",
    noCompletedTransactions: "No completed transactions.",
    noPendingTransactions: "No pending transactions.",
    noFailedTransactions: "No failed transactions.",
    noReviewTransactions: "No transactions under review.",
    noRefundedTransactions: "No refunded transactions.",
    clearFilters: "Clear Filters",
    
    // Refund Dialog
    issueRefund: "Issue Refund",
    refundConfirmation: "Are you sure you want to refund {amount} to {user}?",
    refundWarning: "This action cannot be undone. The refund will be processed immediately.",
    cancel: "Cancel",
    confirmRefund: "Confirm Refund",
    
    // Export Dialog
    exportTransactions: "Export Transactions",
    exportDescription: "Choose the format for exporting transactions",
    exportFormat: "Export Format",
    csv: "CSV (Comma Separated Values)",
    excel: "Excel (.xlsx)",
    exportInfo: "Current filters will be applied to the exported data.",
    dateRangeInfo: "Date range will be included.",
    
    // Notifications
    refundInitiated: "Refund initiated",
    refundDescription: "Refund of {amount} has been initiated",
    
    // Status Badge Colors
    statusGreen: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
    statusYellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
    statusRed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
    statusOrange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
    statusPurple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
    statusGray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
    
    // Messages
    transactionsCount: "transactions",
  },

    transactionDetails: {
    title: "Transaction Details",
    transactionId: "ID: {id} | Reference: {reference}",
    noReference: "N/A",
    
    // Quick Stats
    amount: "Amount",
    date: "Date",
    time: "Time",
    transactionIdLabel: "Transaction ID",
    
    // Tabs
    transactionInfo: "Transaction Info",
    userDetails: "User Details",
    
    // Transaction Info Tab
    transactionInformation: "Transaction Information",
    transactionType: "Transaction Type",
    paymentMethod: "Payment Method",
    status: "Status",
    createdDate: "Created Date",
    updatedDate: "Updated Date",
    description: "Description",
    failureReason: "Failure Reason",
    additionalData: "Additional Data",
    
    // Payer Info
    payerInformation: "Payer Information",
    company: "Company",
    employer: "Employer",
    user: "User",
    userId: "User ID",
    tin: "TIN",
    relatedWorker: "Related Worker",
    
    // User Details Tab
    phoneNumber: "Phone Number",
    accountStatus: "Account Status",
    noUserInfo: "No user information available",
    
    // Quick Actions
    transactionActions: "Transaction Actions",
    markForReview: "Mark for Review",
    marking: "Marking...",
    issueRefund: "Issue Refund",
    processing: "Processing...",
    transactionPending: "Transaction is pending",
    pendingMessage: "No actions available until payment is confirmed",
    noActionsAvailable: "No actions available for this transaction",
    
    // Action Dialogs
    markForReviewTitle: "Mark for Review",
    issueRefundTitle: "Issue Refund",
    reviewDescription: "Please provide review notes for transaction {id}.",
    refundDescription: "Are you sure you want to refund {amount} to {user}?",
    reviewNotesPlaceholder: "Enter review notes...",
    refundWarning: "This action cannot be undone. The refund will be processed immediately.",
    cancel: "Cancel",
    confirm: "Confirm",
    processing2: "Processing...",
    
    // Status Badges
    statusGreen: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
    statusYellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
    statusRed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
    statusOrange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
    statusPurple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
    statusGray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
    
    // Not Available
    notAvailable: "N/A",
  },

    userManagement: {
    title: "User Management",
    subtitle: "Manage and monitor all system users",
    addNewUser: "Add New User",
    
    // Stats Cards
    totalUsers: "Total Users",
    activeUsers: "Active Users",
    pendingReview: "Pending Review",
    suspended: "Suspended",
    registered: "Registered",
    online: "Online",
    awaiting: "Awaiting",
    needReview: "need review",
    inactive: "Inactive",
    suspended_users: "suspended",
    thisWeek: "this week",
    activeNow: "active now",
    
    // Table Headers
    user: "User",
    contact: "Contact",
    role: "Role",
    status: "Status",
    verified: "Verified",
    location: "Location",
    actions: "Actions",
    id: "ID",
    
    // Status Badges
    active: "Active",
    pending: "Pending",
    suspended_badge: "Suspended",
    inactive_badge: "Inactive",
    
    // Role Badges
    admin: "Admin",
    supervisor: "Supervisor",
    company: "Company",
    employer: "Employer",
    worker: "Worker",
    police: "Police",
    
    // Filters
    searchPlaceholder: "Search by name, email, phone, or ID...",
    roleFilter: "Role",
    statusFilter: "Status",
    allRoles: "All Roles",
    allStatus: "All Status",
    
    // Tabs
    allUsers: "All Users",
    admins: "Admins",
    companies: "Companies",
    employers: "Employers",
    workers: "Workers",
    police_tab: "Police",
    active_tab: "Active",
    pending_tab: "Pending",
    suspended_tab: "Suspended",
    
    // Empty States
    noUsersFound: "No Users Found",
    noUsersMatch: "No users match your current filters. Try adjusting your search criteria.",
    noUsersRegistered: "No users have been registered yet.",
    clearFilters: "Clear Filters",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    users: "users",
    perPage: "per page",
    previous: "Previous",
    next: "Next",
    
    // Verification
    verified_yes: "Verified",
    verified_no: "Not Verified",
    notAvailable: "N/A",
    
    // User count
    usersCount: "users",
  },

    createUser: {
    title: "Create New User",
    subtitle: "Add a new user to the system",
    subtitleWithRole: "Add a new {role} to the system",
    selectRole: "Select User Role *",
    
    // Role options
    admin: "Admin",
    supervisor: "Supervisor",
    company: "Company",
    employer: "Employer",
    worker: "Worker",
    police: "Police",
    available: "Available",
    hired: "Hired",
    completed : "Completed",
    
    // Tabs
    basicInformation: "Basic Information",
    addressLocation: "Address & Location",
    
    // Worker specific sections
    workerPersonalInfo: "Worker Personal Information",
    workPreferences: "Work Preferences",
    insuranceInformation: "Insurance Information",
    
    // Company specific sections
    companyInformation: "Company Information",
    ownerInformation: "Owner Information",
    
    // Form fields - Common
    fullName: "Full Name",
    fullNamePlaceholder: "Enter full name",
    emailAddress: "Email Address",
    emailPlaceholder: "user@example.com",
    phoneNumber: "Phone Number",
    phonePlaceholder: "078XXXXXXX",
    nationalId: "National ID",
    nationalIdPlaceholder: "Enter national ID",
    gender: "Gender",
    selectGender: "Select gender",
    dateOfBirth: "Date of Birth",
    password: "Password",
    passwordPlaceholder: "Enter password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm password",
    accountStatus: "Account Status",
    selectStatus: "Select status",
    
    // Gender options
    male: "Male",
    female: "Female",
    
    // Status options
    active: "Active",
    pending: "Pending",
    inactive: "Inactive",
    
    // Worker fields
    firstName: "First Name",
    firstNamePlaceholder: "Ekaze",
    lastName: "Last Name",
    lastNamePlaceholder: "Jean",
    workerEmailPlaceholder: "worker@example.com",
    experienceLevel: "Experience Level",
    languagesSpoken: "Languages Spoken",
    workTypes: "Work Types",
    preferredWorkDistricts: "Preferred Work Districts",
    selectAllDistricts: "Select All Districts",
    searchDistrictsPlaceholder: "Search and select districts...",
    minSalary: "Minimum Salary (RWF)",
    minSalaryPlaceholder: "50000",
    maxSalary: "Maximum Salary (RWF)",
    maxSalaryPlaceholder: "100000",
    
    // Experience levels
    beginner: "Beginner",
    intermediate: "Intermediate (1-3 years)",
    expert: "Expert (3+ years)",
    
    // Languages
    kinyarwanda: "Kinyarwanda",
    english: "English",
    french: "French",
    swahili: "Swahili",
    
    // Work types
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    temporary: "Temporary",
    
    // Insurance
    hasInsurance: "Worker has insurance coverage",
    insuranceProvider: "Insurance Provider",
    insuranceProviderPlaceholder: "SONARWA",
    insuranceNumber: "Insurance Number",
    insuranceNumberPlaceholder: "INS123456",
    
    // Company fields
    businessName: "Business Name",
    businessNamePlaceholder: "ABC Company Ltd",
    tin: "TIN (Tax Identification Number)",
    tinPlaceholder: "123456789",
    physicalAddress: "Physical Address",
    physicalAddressPlaceholder: "KG 123 St, Kigali",
    companyLogo: "Company Logo",
    logoUploadHint: "Upload your company logo (JPEG, PNG, JPG - Max 2MB)",
    subscriptionFee: "Monthly Subscription Fee (RWF)",
    subscriptionFeeHint: "Default subscription fee for company accounts",
    ownerFullName: "Owner Full Name",
    ownerFullNamePlaceholder: "John Doe",
    ownerPhone: "Owner Phone",
    ownerPhonePlaceholder: "0781234567",
    ownerEmail: "Owner Email",
    ownerEmailPlaceholder: "owner@company.com",
    
    // Address fields
    fullAddress: "Full Address",
    addressPlaceholder: "Street address, building, etc.",
    province: "Province",
    selectProvince: "Select province...",
    district: "District",
    selectDistrict: "Select district...",
    sector: "Sector",
    selectSector: "Select sector...",
    cell: "Cell",
    selectCell: "Select cell...",
    village: "Village",
    selectVillage: "Select village...",
    
    // Location info
    locationInfo: "Location Information",
    locationHint: "Location fields are optional but recommended for better user management.",
    
    // No role selected
    selectRoleTitle: "Select a User Role",
    selectRoleMessage: "Please select a role from the options above to continue with user creation. Different roles have different requirements and permissions.",
    
    // Buttons
    cancel: "Cancel",
    createUser: "Create User",
    creating: "Creating...",
    
    // Validation messages
    validationError: "Validation Error",
    fillCompanyRequired: "Please fill all company required fields",
    ownerPasswordsDoNotMatch: "Owner passwords do not match",
    passwordMinLength: "Password must be at least 8 characters",
    fillWorkerRequired: "Please fill all worker required fields",
    workerPasswordsDoNotMatch: "Worker passwords do not match",
    passwordsDoNotMatch: "Passwords do not match",
    
    // Success messages
    userCreated: "{role} created successfully",
    
    // Required field indicator
    required: "*",
  },

    userDetails: {
    // Header
    verified: "Verified",
    
    // Quick Stats
    transactions: "Transactions",
    totalCount: "total count",
    workers: "Workers",
    totalWorkers: "total workers",
    rating: "Rating",
    averageRating: "average rating",
    incidents: "Incidents",
    assigned: "assigned",
    joined: "Joined",
    memberSince: "member since",
    
    // Tabs
    userInfo: "User Info",
    activity: "Activity",
    actions: "Actions",
    
    // Personal Information
    personalInformation: "Personal Information",
    email: "Email",
    phone: "Phone",
    nationalId: "National ID",
    gender: "Gender",
    dateOfBirth: "Date of Birth",
    district: "District",
    fullAddress: "Full Address",
    
    // Account Information
    accountInformation: "Account Information",
    verifiedAt: "Verified At",
    lastLogin: "Last Login",
    lastIp: "Last IP",
    registered: "Registered",
    
    // Role Statistics
    companyStatistics: "Company Statistics",
    activeWorkers: "Active Workers",
    totalRequests: "Total Requests",
    pendingRequests: "Pending Requests",
    
    workerStatistics: "Worker Statistics",
    totalJobs: "Total Jobs",
    completedJobs: "Completed Jobs",
    totalIncidents: "Total Incidents",
    
    employerStatistics: "Employer Statistics",
    totalEmployments: "Total Employments",
    activeEmployments: "Active Employments",
    
    policeStatistics: "Police Statistics",
    assignedIncidents: "Assigned Incidents",
    resolvedIncidents: "Resolved",
    pendingIncidents: "Pending",
    
    // Account Timeline
    accountTimeline: "Account Timeline",
    accountCreated: "Account Created",
    verified2: "Verified",
    lastActive: "Last Active",
    
    // Activity Logs
    noActivityLogs: "No Activity Logs",
    noActivityMessage: "No activity has been recorded for this user yet.",
    action: "Action",
    details: "Details",
    ipAddress: "IP Address",
    dateTime: "Date & Time",
    
    // User Actions
    userActions: "User Actions",
    editUser: "Edit User",
    activateUser: "Activate User",
    activating: "Activating...",
    suspendUser: "Suspend User",
    suspending: "Suspending...",
    reactivateUser: "Reactivate User",
    reactivating: "Reactivating...",
    verifyUser: "Verify User",
    verifying: "Verifying...",
    resetPassword: "Reset Password",
    resetting: "Resetting...",
    verifyOtp: "Verify OTP",
    verifyingOtp: "Verifying...",
    resetOtpBlock: "Reset OTP Block",
    resettingOtpBlock: "Resetting...",
    
    // Action Dialogs
    activateTitle: "Activate User",
    suspendTitle: "Suspend User",
    verifyTitle: "Verify User",
    resetPasswordTitle: "Reset Password",
    verifyOtpTitle: "Verify OTP",
    resetOtpBlockTitle: "Reset OTP Block",
    activateDescription: "Are you sure you want to activate {userName}?",
    suspendDescription: "Please provide a reason for suspending {userName}.",
    verifyDescription: "Are you sure you want to verify {userName}?",
    resetPasswordDescription: "Enter a new password for {userName}.",
    verifyOtpDescription: "Are you sure you want to manually verify OTP for {userName}? This will mark their account as verified.",
    resetOtpBlockDescription: "Are you sure you want to reset OTP block for {userName}? This will allow them to request OTP again.",
    suspensionReason: "Suspension Reason",
    suspensionReasonPlaceholder: "Enter suspension reason...",
    newPassword: "New Password",
    newPasswordPlaceholder: "Enter new password...",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm new password...",
    passwordsDoNotMatch: "Passwords do not match",
    cancel: "Cancel",
    processing: "Processing...",
    activate: "Activate",
    suspend: "Suspend",
    verify: "Verify",
    reset: "Reset Password",
    verifyOtpButton: "Verify OTP",
    resetBlockButton: "Reset Block",
    
    // Gender
    male: "Male",
    female: "Female",
    
    // Not Available
    notAvailable: "N/A",
  },

    platformAnalytics: {
    title: "Platform Analytics",
    subtitle: "Monitor platform performance and trends",
    
    // Time range
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    last90Days: "Last 90 days",
    lastYear: "Last year",
    
    // Stats Cards
    totalRevenue: "Total Revenue",
    totalUsers: "Total Users",
    activeCompanies: "Active Companies",
    openIncidents: "Open Incidents",
    allTime: "All time",
    registered: "Registered",
    operating: "Operating",
    active: "Active",
    vsLastPeriod: "vs last period",
    
    // Chart titles
    revenueOverview: "Revenue Overview",
    userDistribution: "User Distribution",
    registrationTrends: "Registration Trends",
    incidentTracking: "Incident Tracking",
    topCompanies: "Top Performing Companies",
    
    // Chart labels
    employers: "Employers",
    workers: "Workers",
    companies: "Companies",
    incidents: "Incidents",
    resolved: "Resolved",
    
    // Tooltips
    registeredWorkers: "registered workers",
    totalRevenueLabel: "Total revenue",
    
    // Error states
    noDataAvailable: "No data available",
    
    // Messages
    workersCount: "workers",
  },

    settingsManagement: {
    title: "Settings",
    subtitle: "Manage your profile and system configurations",
    
    // Tabs
    profile: "Profile",
    security: "Security",
    payment: "Payment",
    api: "API Config",
    
    // Profile Tab
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    uploading: "Uploading...",
    removePhoto: "Remove",
    removing: "Removing...",
    photoHint: "JPG, PNG. Max size 2MB",
    previewHint: "Preview - Click save to confirm",
    
    fullName: "Full Name",
    email: "Email",
    phoneNumber: "Phone Number",
    gender: "Gender",
    selectGender: "Select gender",
    male: "Male",
    female: "Female",
    dateOfBirth: "Date of Birth",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    address: "Address",
    
    saveChanges: "Save Changes",
    saving: "Saving...",
    
    // Security Tab
    passwordRequirements: "Password Requirements",
    passwordHint: "Must be at least 8 characters with uppercase, lowercase, numbers, and symbols",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    updating: "Updating...",
    
    // Payment Settings Tab
    companyRegistration: "Company Registration",
    workerRegistration: "Worker Registration",
    employerRegistration: "Employer Registration",
    registrationFee: "Registration Fee (RWF)",
    enablePayment: "Enable Payment",
    savePaymentSettings: "Save Payment Settings",
    
    // API Configuration Tab
    apiCredentialsHint: "API credentials are encrypted and stored securely. Never share your API keys.",
    mobileMoneyApi: "Mobile Money API (MoMo)",
    nidaApi: "NIDA API",
    smsApi: "SMS API",
    apiKey: "API Key",
    apiSecret: "API Secret",
    endpointUrl: "Endpoint URL",
    senderId: "Sender ID",
    saveConfig: "Save {name} Config",
    savingConfig: "Saving...",
    
    // Placeholders
    apiKeyPlaceholder: "Enter {name} API Key",
    apiSecretPlaceholder: "Enter {name} API Secret",
    endpointPlaceholder: "Enter {name} Endpoint URL",
    senderIdPlaceholder: "Enter SMS Sender ID",
    
    // Notifications
    profileUpdated: "Profile updated successfully",
    passwordUpdated: "Password updated successfully",
    paymentSettingsUpdated: "Payment settings updated successfully",
    apiConfigUpdated: "API configuration updated successfully",
    photoUploaded: "Photo uploaded successfully",
    photoRemoved: "Photo removed successfully",
    
    // Validation
    passwordMismatch: "Passwords do not match",
    requiredField: "This field is required",
  },



  



  },


  // =====================================================================ADMIN==================================================


  //   ======================================================================= EMPLOYER ==================================================


employer: {
  employerSidebar: {
    role:        "Employer",
    changePhoto: "Change profile photo",
    loadError:   "Failed to load sidebar data",
    currency:    "RWF spent",
    days:        "days",
    oneMonth:    "1 month",
    months:      "months",
    ongoing:     "Ongoing",
  },

  

  employerHeader: {
  defaultName:  "Employer",
  roleLabel:    "Employer",
  navigation:   "Navigation",
  notifications: {
    system:              "System",
    newLabel:            "New",
    emptyTitle:          "No notifications",
    noNotifications:     "You don't have any notifications yet.",
    noUnread:            "You have no unread notifications.",
    noRead:              "You have no read notifications.",
    badgeAlert:          "ALERT",
    badgePayment:        "PAYMENT",
    badgeSystem:         "SYSTEM",
    badgeNew:            "NEW",
    badgeRequest:        "REQUEST",
    badgeWorker:         "WORKER",
    badgeApproved:       "APPROVED",
    badgeRejected:       "REJECTED",
    badgeInfo:           "INFO",
    statsTotal:          "Total",
    statsUnread:         "Unread",
    statsRead:           "Read",
    statsTypes:          "Types",
    tabAll:              "All",
    tabUnread:           "Unread",
    tabRead:             "Read",
    filterPlaceholder:   "Filter by type",
    filterAll:           "All Types",
    filterIncidents:     "Incidents",
    filterPayments:      "Payments",
    filterSystem:        "System",
    filterHiringRequests:"Hiring Requests",
    filterWorkers:       "Workers",
    filterApproved:      "Approved",
    filterRejected:      "Rejected",
  },
},

  employerStats: {
    title: "Employer Dashboard",
    subtitle: "Manage your workers and track employment history",
    
    // Time period
    allTime: "All Time",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    timePeriod: "Time Period:",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    clear: "Clear",
    clearAllFilters: "Clear All Filters",
    showingDataFrom: "Showing data from",
    
    // Status Filters
    workerStatus: "Worker Status",
    allWorkers: "All Workers",
    activeOnly: "Active Only",
    completed: "Completed",
    terminated: "Terminated",
    
    paymentStatus: "Payment Status",
    allPayments: "All Payments",
    pending: "Pending",
    completed_status: "Completed",
    failed: "Failed",
    
    incidentSeverity: "Incident Severity",
    allIncidents: "All Incidents",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    selectPeriod: "Select Period",
    
    sortBy: "Sort By",
    mostRecent: "Most Recent",
    oldestFirst: "Oldest First",
    workerName: "Worker Name",
    paymentAmount: "Payment Amount",
    
    searchPlaceholder: "Search workers, incidents, or payments...",
    
    // Export
    export: "Export",
    
    // Stats Cards
    activeWorkers: "Active Workers",
    currentlyHired: "currently hired",
    totalHired: "Total Hired",
    allTimeHired: "all time",
    terminated_workers: "terminated",
    monthlySpending: "Monthly Spending",
    vsLastMonth: "vs last month",
    incidents: "Incidents",
    resolved: "resolved",
    underControl: "under control",
    fromTotal: "from total",
    
    // Secondary Stats
    avgEmployment: "Avg Employment",
    days: "days",
    successRate: "Success Rate",
    totalSpent: "Total Spent",
    pendingPayments: "Pending Payments",
    
    // Tabs
    overview: "Overview",
    active: "Active",
    history: "History",
    
    // Quick Summary
    quickSummary: "Quick Summary",
    activeNow: "Active Now",
    workers: "workers",
    thisMonthSpent: "This Month",
    spent: "RWF spent",
    success: "Success",
    rate: "rate",
    
    // Upcoming Payments
    upcomingPayments: "Upcoming Payments",
    due: "Due",
    amount: "RWF",
    noUpcomingPayments: "No upcoming payments",
    
    // Active Workers Tab
    activeWorkersTitle: "Active Workers",
    id: "ID",
    name: "Name",
    type: "Type",
    status: "Status",
    duration: "Duration",
    noActiveWorkers: "No active workers",
    
    // History Tab
    employmentHistory: "Employment History",
    ended: "Ended",
    noEmploymentHistory: "No employment history",
    
    // Table
    workerId: "W{id}",
    
    // Error states
    loadError: "Failed to load dashboard data",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Common
    workersCount: "workers",
    paymentsCount: "payments",
  },

  workerSearch: {
  title: "Worker Search",
  subtitle: "Find and hire qualified workers",
  
  // Filters
  period: "Period:",
  allTime: "All Time",
  last7Days: "Last 7 Days",
  last30Days: "Last 30 Days",
  last90Days: "Last 90 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  customRange: "Custom Range",
  from: "From:",
  to: "To:",
  startDate: "Start date",
  endDate: "End date",
  clear: "Clear",
  clearAll: "Clear All",
  showingWorkersFrom: "Showing workers registered from",
  
  // Filter labels
  gender: "Gender",
  experience: "Experience",
  availability: "Availability",
  sortBy: "Sort By",
  salaryRange: "Salary Range (RWF)",
  ageRange: "Age Range",
  languagesSpoken: "Languages Spoken",
  workerType: "Worker Type",
  selectCompany: "Select Company",
  loadingCompanies: "Loading companies...",
  chooseCompany: "Choose company",
  
  // Gender options
  allGenders: "All Genders",
  male: "Male",
  female: "Female",
  
  // Experience levels
  allLevels: "All Levels",
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
  
  // Availability options
  all: "All",
  available: "Available",
  hired: "Hired",

  selectPeriod: "Select Period",
  
  // Sort options
  mostRecent: "Most Recent",
  oldestFirst: "Oldest First",
  nameAZ: "Name A-Z",
  highestRating: "Highest Rating",
  salaryLowToHigh: "Salary (Low to High)",
  salaryHighToLow: "Salary (High to Low)",
  
  // Worker type options
  allWorkers: "All Workers",
  companyRegistered: "Company Registered",
  freelance: "Freelance",
  
  // Search placeholder
  searchPlaceholder: "Search by name, skills, or location...",
  
  // Stats
  totalWorkers: "Total Workers",
  found: "found",
  availableStats: "Available",
  readyToHire: "ready to hire",
  companyWorkers: "Company Workers",
  companyRegistered2: "company registered",
  freelanceStats: "Freelance",
  independentWorkers: "independent workers",
  
  // Tabs
  publicSearch: "Public Search",
  mySearch: "My Search",
  publicWorkers: "Public Workers",
  registerToView: "Register to view contact details",
  myWorkers: "My Workers",
  fullAccess: "Full access with contact details",
  
  // Table headers - Public
  worker: "Worker",
  experienceHeader: "Experience",
  location: "Location",
  salaryRangeHeader: "Salary Range",
  languagesHeader: "Languages",
  rating: "Rating",
  status: "Status",
  actions: "Actions",
  
  // Table headers - Authenticated
  type: "Type",
  contact: "Contact",
  
  // Worker info
  age: "Age",
  paymentRequired: "Payment Required",
  
  // Badges
  company: "Company",
  
  // Empty states
  noWorkersFound: "No workers found",
  
  // Pagination
  showing: "Showing",
  to2: "to",
  of: "of",
  results: "results",
  previous: "Previous",
  next: "Next",
  
  // Buttons
  clearAllFilters: "Clear All",
  
  // Modal
  viewDetails: "View Details",
  
  // ID Card
  generateIdCard: "Generate ID Card",
  generating: "Generating...",
  idCardGenerated: "ID Card generated successfully",
  idCardFailed: "Failed to generate ID card",
  
  // Tooltips
  viewWorker: "View worker details",
  
  // Units
  years: "years",
  rwf: "RWF",
  
  // Age range
  minAge: "Min age",
  maxAge: "Max age",
  min: "Min",
  max: "Max",
  
  // Language options
  kinyarwanda: "Kinyarwanda",
  english: "English",
  french: "French",
  swahili: "Swahili",
  other: "Other",


    workerDetails: {
    // Header
    workerId: "ID: {id} • Age: {age}",
    companyRegistered: "Company Registered",
    freelance: "Freelance",
    requestSent: "Request Sent",
    hireNow: "Hire Now",
    contactDirectly: "Contact Directly",

    rateWorker: "Rate Worker",
    rateWorkerTitle: "Rate Worker",
    rateWorkerDescription: "Share your experience working with {firstName} {lastName}.",
    rateWorkerReviewLabel: "Review (optional)",
    rateWorkerReviewPlaceholder: "How was your experience with this worker?",
    submitRating: "Submit Rating",
    submitting: "Submitting...",

    rateWorkerCategory: {
        punctuality: "Punctuality",
        work_quality: "Work Quality",
        communication: "Communication",
        professionalism: "Professionalism",
      },

      ratings: "Ratings",
      noRatings: "No ratings yet for this worker.",

      rateWorkerCategoryIncomplete: "Please rate all categories, or leave them all blank.",
    
    // Quick Stats
    salary: "Salary",
    range: "Range",
    minMax: "Min - Max",
    rating: "Rating",
    averageScore: "average score",
    reviews: "reviews",
    experience: "Experience",
    level: "level",
    company: "Company",
    affiliation: "affiliation",
    
    // Tabs
    information: "Information",
    workDetails: "Work Details",
    contactReferees: "Contact & Referees",
    documents: "Documents",
    
    // Information Tab
    personalInformation: "Personal Information",
    nationalId: "National ID",
    gender: "Gender",
    dateOfBirth: "Date of Birth",
    registered: "Registered",
    locationInformation: "Location Information",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    insuranceInformation: "Insurance Information",
    provider: "Provider",
    insuranceNumber: "Insurance Number",
    languagesSpoken: "Languages Spoken",
    noLanguages: "No languages specified",
    
    // Work Details Tab
    workPreferences: "Work Preferences",
    preferredWorkTypes: "Preferred Work Types",
    noPreferences: "No preferences specified",
    preferredLocations: "Preferred Locations",
    noLocations: "No locations specified",
    minimumSalary: "Minimum Salary",
    maximumSalary: "Maximum Salary",
    experienceLevel: "Experience Level",
    beginnerDesc: "0-2 years of experience",
    intermediateDesc: "2-5 years of experience",
    expertDesc: "5+ years of experience",
    noExperienceDesc: "Experience level not specified",
    companyInformation: "Company Information",
    companyName: "Company Name",
    companyId: "Company ID",
    
    // Contact & Referees Tab
    contactInformation: "Contact Information",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    freelanceWorker: "Freelance Worker",
    contactDirectlyHint: "Contact directly using the phone number above",
    references: "References",
    noReferences: "No references provided",
    
    // Documents Tab
    workerDocuments: "Worker Documents",
    nationalIdDoc: "National ID",
    nationalIdHint: "Government issued identification",
    insuranceDetails: "Insurance Details",
    insuranceHint: "Insurance coverage",
    registration: "Registration",
    registrationHint: "Registered on Ekaze platform",
    
    // Hiring Dialog
    hireTitle: "Hire {firstName} {lastName}",
    companyHireHint: "Send a hiring request to the worker's company. They will review and respond to your request.",
    freelanceHireHint: "Please contact the worker directly using their phone number provided in the contact tab.",
    proposedSalary: "Proposed Salary",
    proposedSalaryLabel: "Proposed Salary (RWF) *",
    proposedSalaryPlaceholder: "e.g., 150000",
    expectedRange: "Worker's expected range: {min} - {max}",
    workDescription: "Work Description *",
    workDescriptionPlaceholder: "Describe the work you need in detail. Use headings, bullet points, and formatting to structure your description...",
    characters: "characters (plain text)",
    additionalMessage: "Additional Message (Optional)",
    messagePlaceholder: "Any additional information for the company",
    cancel: "Cancel",
    sendRequest: "Send Request",
    sending: "Sending...",
    
    // Freelance/Unavailable Dialog
    freelanceTitle: "This is a Freelance Worker",
    workerNotAvailable: "Worker Not Available",
    freelanceMessage: "Freelance workers need to be contacted directly. You can find their phone number in the Contact tab.",
    unavailableMessage: "This worker is currently not available for new hiring opportunities. Please check back later or browse other available workers.",
    close: "Close",
    viewContact: "View Contact",
    
    // Validation Errors
    salaryRequired: "Proposed salary is required",
    salaryInvalid: "Please enter a valid salary amount",
    descriptionRequired: "Work description is required",
    descriptionMinLength: "Work description must be at least 20 characters",
    formErrors: "Please fix the errors in the form",
    
    // Info Messages
    freelanceContactInfo: "This is a freelance worker. Please contact them directly using the phone number provided in their profile.",
    workerNotAvailableMsg: "This worker is not currently available for hiring",
    
    // Success Messages
    requestSentSuccess: "Hiring request sent successfully!",
    
    // Status Badges
    available: "Available",
    hired: "Hired",
    unavailable: "Unavailable",
    
    // Experience Levels
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    
    // Gender
    male: "Male",
    female: "Female",
    other: "Other",
    
    // Not Available
    notAvailable: "N/A",
  },
  
},

  activeWorkers: {
    title: "Active Workers",
    subtitle: "Manage and monitor your currently employed workers",
    
    // Stats Cards
    totalWorkers: "Total Workers",
    activeWorkers: "active workers",
    currentlyEmployed: "Currently Employed",
    onPayroll: "on payroll",
    avgSalary: "Avg Salary",
    monthlyAverage: "monthly average",
    avgRating: "Avg Rating",
    outOf5: "out of 5.0",
    
    // Filters
    searchPlaceholder: "Search workers...",
    filters: "Filters",
    sort: "Sort",
    mostRecent: "Most Recent",
    oldestFirst: "Oldest First",
    nameAZ: "Name (A-Z)",
    highestRated: "Highest Rated",
    
    // Bulk Actions
    selected: "selected",
    paySelected: "Pay Selected",
    endEmployment: "End Employment",
    
    // Tabs
    active: "Active",
    hired: "Hired",
    completed: "Completed",
    
    // Table Headers
    worker: "Worker",
    employment: "Employment",
    contact: "Contact",
    salary: "Salary",
    rating: "Rating",
    status: "Status",
    actions: "Actions",
    experience: "Experience",
    salaryRange: "Salary Range",
    period: "Period",
    duration: "Duration",
    
    // Worker Info
    id: "ID",
    days: "days",
    fee: "Fee",
    age: "Age",
    
    // Status Badges
    available: "Available",
    hired_status: "Hired",
    unavailable: "Unavailable",
    active_status: "Active",
    pending: "Pending",
    completed_status: "Completed",
    terminated: "Terminated",
    cancelled: "Cancelled",
    
    // Empty States
    noActiveWorkers: "No active workers found",
    noHiredWorkers: "No hired workers found",
    noCompletedEmployments: "No completed employments",
    
    // Button Titles
    viewDetails: "View Details",
    claimEmployment: "Claim Employment",
    paymentHistory: "Payment History",
    payWorker: "Pay Worker",
    endEmploymentBtn: "End Employment",
    
    // Payment History Modal
    paymentHistoryTitle: "Payment History",
    totalPaid: "Total Paid",
    pendingPayments: "Pending",
    payments: "Payments",
    nextPayment: "Next Payment",
    employmentDetails: "EMPLOYMENT DETAILS",
    started: "Started:",
    ended: "Ended:",
    totalPaidLabel: "Total Paid:",
    nextPaymentDue: "Next Payment Due",
    paymentRecords: "Payment Records",
    noPaymentsYet: "No payments yet",
    
    // Bulk Payment Modal
    confirmBulkPayment: "Confirm Bulk Payment",
    workersSelected: "{count} worker selected",
    workersSelectedPlural: "{count} workers selected",
    totalAmount: "Total Amount",
    periodStart: "Period Start *",
    periodEnd: "Period End *",
    amountRWF: "Amount (RWF) *",
    notes: "Notes",
    optional: "Optional",
    confirm: "Confirm {amount}",
    processing: "Processing...",
    
    // End Employment Modal
    endEmploymentTitle: "End Employment",
    reasonForEnding: "Reason for Ending *",
    reasonPlaceholder: "e.g. Contract completed, worker resigned, etc.",
    reasonMinLength: "Please provide a reason (at least 5 characters)",
    ending: "Ending...",
    
    // Claim Employment Modal
    claimEmploymentTitle: "Claim Employment",
    claimDescription: "Confirm worker assignment",
    claimConfirmation: "Are you sure you want to claim this employment? This will assign the worker to you.",
    claim: "Claim",
    claiming: "Claiming...",
    confirmClaim: "Confirm Claim",
    
    // Validation
    fillRequiredFields: "Please fill in all required fields for each worker",
    
    // Notifications
    claimSuccess: "Employment claimed successfully.",
    claimError: "Failed to claim employment.",
    
    // Common
    cancel: "Cancel",
    NA: "N/A",
    RWF: "RF",
      male: "Male",
      female: "Female",
      beginner: "Beginner",
      intermediate: "Intermediate",
      expert: "Expert",
      showing: "Showing",
      of2: "Of",
      previous: "Previous",
      next: "Next",
  },

    verifyWorker: {
    title: "Worker Verification",
    subtitle: "Verify worker identity using National ID and OTP",
    badge: "OTP Verification",
    
    // Step 1: National ID Input
    step1Title: "Step 1: Enter National ID",
    nationalIdLabel: "National ID *",
    nationalIdPlaceholder: "Enter 16-digit National ID",
    nationalIdHint: "Enter the worker's 16-digit National ID from their ID card",
    otpInfo: "An OTP will be sent to the worker's registered phone number. The OTP expires in 5 minutes.",
    sendOtp: "Send OTP",
    sendingOtp: "Sending OTP...",
    
    // Step 2: OTP Input
    step2Title: "Step 2: Enter OTP",
    otpLabel: "OTP Code *",
    otpPlaceholder: "Enter 6-digit OTP",
    otpHint: "Enter the 6-digit OTP sent to the worker's phone",
    verifyOtp: "Verify OTP",
    verifying: "Verifying...",
    cancel: "Cancel",
    resendOtp: "Resend OTP",
    
    // Step 3: Verification Result
    verifiedTitle: "Worker Verified ✓",
    verificationFailed: "Verification Failed",
    
    // Worker Profile
    workerProfile: "Worker Profile",
    nationalId: "National ID:",
    age: "Age:",
    insured: "Insured",
    
    // Contact Information
    contactInfo: "Contact Information",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    
    // Professional Details
    professionalDetails: "Professional Details",
    experience: "Experience:",
    languages: "Languages:",
    salaryRange: "Salary Range:",
    workType: "Work Type:",
    status: "Status:",
    available: "Available",
    currentlyEmployed: "Currently Employed",
    
    // Company Info
    registeredCompany: "Registered Company",
    company: "Company:",
    
    // Current Employment
    currentEmployment: "Current Employment",
    startDate: "Start Date:",
    agreedSalary: "Agreed Salary:",
    
    // Statistics
    successRate: "Success Rate",
    avgDuration: "Avg Duration",
    incidentRate: "Incident Rate",
    
    // Assignment Status
    assignmentStatus: "Assignment Status:",
    assignedToYou: "Assigned to you",
    assignedTo: "Assigned to: {name}",
    notAssigned: "Not assigned",
    
    // Rejection Form
    rejectionTitle: "Rejection Reason",
    rejectionLabel: "Reason for Rejection *",
    rejectionPlaceholder: "Please explain why you're rejecting this worker (minimum 10 characters)",
    confirmRejection: "Confirm Rejection",
    submitting: "Submitting...",
    
    // Action Buttons
    verifyAnother: "Verify Another Worker",
    printVerification: "Print Verification",
    
    // Validation Messages
    validationError: "Validation Error",
    invalidNationalId: "Please enter a valid 16-digit National ID",
    invalidOtp: "Please enter a valid 6-digit OTP",
    invalidRejectionReason: "Please provide a rejection reason (minimum 10 characters)",
    
    // Development OTP
    devOtpTitle: "Development OTP",
    devOtpMessage: "OTP: {otp} (expires in 5 minutes)",
    devNewOtp: "New OTP: {otp}",
    
    // Gender
    male: "Male",
    female: "Female",
    
    // Experience Levels
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    
    // Days
    days: "days",
    
    // Not Available
    NA: "N/A",
    reviews: "Reviews",

  },

    hiringRequestManagement: {
    title: "Hiring Request Management",
    subtitle: "Track and manage your worker hiring requests",
    
    // Filters
    filterByDate: "Filter by Date:",
    show: "Show",
    hide: "Hide",
    dateRange: "Date Range",
    from: "From:",
    to: "To:",
    startDate: "Start date",
    endDate: "End date",
    clear: "Clear",
    clearAll: "Clear All",
    showingRequestsFrom: "Showing requests from",
    
    // Status Filter
    status: "Status",
    allStatus: "All Status",
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
    
    // Search
    searchPlaceholder: "Search by worker name, company...",
    
    // Stats Cards
    totalRequests: "Total Requests",
    sent: "sent",
    pendingStats: "Pending",
    awaitingResponse: "awaiting response",
    acceptedStats: "Accepted",
    approved: "approved",
    rejectedStats: "Rejected",
    declined: "declined",
    
    // Table Headers
    worker: "Worker",
    company: "Company",
    proposedSalary: "Proposed Salary",
    statusHeader: "Status",
    date: "Date",
    actions: "Actions",
    
    // Table Content
    requests: "requests",
    noRequestsFound: "No hiring requests found",
    
    // Salary
    notSpecified: "Not specified",
    
    // Buttons
    viewDetails: "View Details",
    cancelRequest: "Cancel Request",
    
    // Pagination
    showing: "Showing",
    to2: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Cancel Dialog
    cancelTitle: "Cancel Hiring Request",
    cancelDescription: "Are you sure you want to cancel this hiring request? This action cannot be undone.",
    cancelNo: "No, keep it",
    cancelYes: "Yes, cancel request",
    
    // Success Messages
    cancelledSuccess: "Hiring request cancelled successfully",
    cancelFailed: "Failed to cancel hiring request",
    
    // Tooltips
    viewRequest: "View request details",
    
    // Common
    RWF: "RWF",
  
        details: {
      title: "Hiring Request Details",
      requestId: "Request #{id}",
      cancelRequest: "Cancel Request",
      
      // Quick Stats
      proposedSalary: "Proposed Salary",
      amount: "amount",
      workerRating: "Worker Rating",
      averageScore: "average score",
      experience: "Experience",
      level: "level",
      requestDate: "Request Date",
      sent: "sent",
      
      // Tabs
      workerInformation: "Worker Information",
      companyInformation: "Company Information",
      requestDetails: "Request Details",
      timelineResponse: "Timeline & Response",
      
      // Worker Information Tab
      yearsOld: "{age} years • {gender}",
      rating: "rating",
      experienceLevel: "Experience Level",
      availabilityStatus: "Availability Status",
      
      // Company Information Tab
      businessName: "Business Name",
      contactPerson: "Contact Person",
      
      // Request Details Tab
      workDescription: "Work Description",
      messageToCompany: "Message to Company",
      
      // Timeline Tab
      requestSent: "Request Sent",
      companyResponded: "Company Responded",
      companyResponse: "Company Response",
      
      // Employment Details
      employmentDetails: "Employment Details",
      employmentId: "Employment ID",
      startDate: "Start Date",
      agreedSalary: "Agreed Salary",
      
      // Status
      pending: "PENDING",
      accepted: "ACCEPTED",
      rejected: "REJECTED",
      cancelled: "CANCELLED",
      
      // Cancel Dialog
      cancelTitle: "Cancel Hiring Request",
      cancelDescription: "Are you sure you want to cancel this hiring request? This action cannot be undone.",
      cancelNo: "No, keep it",
      cancelYes: "Yes, cancel request",
      
      // Success Messages
      cancelledSuccess: "Hiring request cancelled successfully",
      cancelFailed: "Failed to cancel hiring request",
      
      // Not Available
      notSpecified: "Not specified",

      male: "Male",
      female: "Female",
    },
  },

    incidentManagement: {
    title: "Incident Management",
    subtitle: "Track and manage reported incidents",

    exportPdf: "Export PDF",
    
    // Filters
    filterByDate: "Filter by Date:",
    show: "Show",
    hide: "Hide",
    dateRange: "Date Range",
    from: "From:",
    to: "To:",
    startDate: "Start date",
    endDate: "End date",
    clear: "Clear",
    clearAll: "Clear All",
    showingIncidentsFrom: "Showing incidents from",
    
    // Status Filter
    status: "Status",
    allStatus: "All Status",
    reported: "Reported",
    underInvestigation: "Under Investigation",
    resolved: "Resolved",
    dismissed: "Dismissed",
    escalated: "Escalated",


        reportIncidentBtn: "Report Incident",
    reportIncident: "Report an Incident",
    reportIncidentSubtitle: "File an incident report against one of your active workers",
    reporting: "Reporting...",
    selectWorker: "Select Worker",
    searchWorkerPlaceholder: "Search by name, phone or national ID...",
    changeWorker: "Change",
    noActiveWorkers: "You have no active workers",
    noWorkersMatch: "No workers match your search",
    incidentDetails: "Incident Details",
    incidentType: "Incident Type",
    incidentDate: "Incident Date",
    location: "Location",
    fullLocation: "Full Location",
    province: "Province",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    description: "Description",
    descriptionPlaceholder: "Describe the incident in detail...",
    proofFiles: "Proof Files",
    cancel: "Cancel",




    
    // Severity Filter
    severity: "Severity",
    allSeverity: "All Severity",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Type Filter
    type: "Type",
    allTypes: "All Types",
    theft: "Theft",
    violence: "Violence",
    negligence: "Negligence",
    breachOfContract: "Breach of Contract",
    misconduct: "Misconduct",
    other: "Other",
    
    // Search
    searchPlaceholder: "Search by incident number, worker name...",
    
    // Stats Cards
    totalIncidents: "Total Incidents",
    reported2: "reported",
    underInvestigationStats: "Under Investigation",
    inProgress: "in progress",
    resolvedStats: "Resolved",
    closedCases: "closed cases",
    criticalStats: "Critical",
    highPriority: "high priority",
    
    // Table Headers
    incident: "Incident",
    worker: "Worker",
    typeHeader: "Type",
    severityHeader: "Severity",
    statusHeader: "Status",
    date: "Date",
    actions: "Actions",
    
    // Table Content
    incidents: "incidents",
    noIncidentsFound: "No incidents found",
    
    // Buttons
    viewDetails: "View Details",
    
    // Pagination
    showing: "Showing",
    to2: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Tooltips
    viewIncident: "View incident details",
    
    // Status Badge Texts
    reported_badge: "Reported",
    under_investigation_badge: "Under Investigation",
    resolved_badge: "Resolved",
    dismissed_badge: "Dismissed",
    escalated_badge: "Escalated",
    
    // Severity Badge Texts
    low_badge: "Low",
    medium_badge: "Medium",
    high_badge: "High",
    critical_badge: "Critical",
    
    // Incident Type Labels
    theft_label: "Theft",
    violence_label: "Violence",
    negligence_label: "Negligence",
    breach_of_contract_label: "Breach of Contract",
    misconduct_label: "Misconduct",
    other_label: "Other",

        details: {
      // Header
      incidentNumber: "Incident #{number}",
      reportedOn: "Reported on",
      
      // Quick Stats
      worker: "Worker",
      involvedParty: "involved party",
      date: "Date",
      incidentOccurred: "incident occurred",
      evidence: "Evidence",
      filesAttached: "files attached",
      officer: "Officer",
      investigating: "investigating",
      unassigned: "Unassigned",
      
      // Tabs
      details: "Details",
      evidence2: "Evidence",
      timeline: "Timeline",
      
      // Details Tab
      incidentInformation: "Incident Information",
      description: "Description",
      location: "Location",
      incidentType: "Incident Type",
      severityLevel: "Severity Level",
      workerInvolved: "Worker Involved",
      workerId: "Worker ID: {id}",
      policeNotes: "Police Notes",
      resolutionDetails: "Resolution Details",
      resolvedOn: "Resolved on {date}",
      
      // Status Information
      statusInformation: "Status Information",
      currentStatus: "Current Status",
      reportedDate: "Reported Date",
      assignedDate: "Assigned Date",
      resolvedDate: "Resolved Date",
      
      // Notifications
      notificationsSent: "Notifications Sent",
      workerNotified: "Worker Notified",
      companyNotified: "Company Notified",
      policeNotified: "Police Notified",
      
      // Assigned Officer
      assignedOfficer: "Assigned Officer",
      assignedOn: "Assigned on {date}",
      
      // Evidence Tab
      evidenceFiles: "Evidence Files",
      evidenceNumber: "Evidence {number}",
      download: "Download",
      noEvidence: "No evidence files attached",
      
      // Timeline Tab
      incidentTimeline: "Incident Timeline",
      reported: "Incident Reported",
      assignedToOfficer: "Assigned to Officer",
      officer2: "Officer: {name}",
      resolved: "Incident Resolved",
      
      // Status Badges
      reported2: "REPORTED",
      under_investigation: "UNDER INVESTIGATION",
      resolved2: "RESOLVED",
      dismissed: "DISMISSED",
      escalated: "ESCALATED",
      
      // Severity Badges
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      critical: "CRITICAL",
      
      // Incident Types
      theft: "Theft",
      violence: "Violence",
      negligence: "Negligence",
      breach_of_contract: "Breach of Contract",
      misconduct: "Misconduct",
      other: "Other",
      
      // Not Available
      notAvailable: "N/A",
    },
  },

    transactionHistory: {
    title: "Transaction History",
    subtitle: "View and manage your payment transactions",
    
    // Filters
    filterByDate: "Filter by Date:",
    show: "Show",
    hide: "Hide",
    dateRange: "Date Range",
    from: "From:",
    to: "To:",
    startDate: "Start date",
    endDate: "End date",
    clear: "Clear",
    clearAll: "Clear All",
    showingTransactionsFrom: "Showing transactions from",
    
    // Status Filter
    status: "Status",
    allStatus: "All Status",
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
    
    // Type Filter
    type: "Type",
    allTypes: "All Types",
    registration: "Registration",
    subscription: "Subscription",
    salaryDeduction: "Salary Deduction",
    
    // Payment Method Filter
    paymentMethod: "Payment Method",
    allMethods: "All Methods",
    mobileMoney: "Mobile Money",
    bankTransfer: "Bank Transfer",
    cash: "Cash",
    
    // Amount Range
    amountRange: "Amount Range (RWF)",
    min: "Min",
    max: "Max",
    to2: "to",
    
    // Search
    searchPlaceholder: "Search by transaction ID, reference...",
    
    // Stats Cards
    totalPaid: "Total Paid",
    allTime: "all time",
    completedStats: "Completed",
    transactions: "transactions",
    pendingStats: "Pending",
    awaitingPayment: "awaiting payment",
    average: "Average",
    perTransaction: "per transaction",
    
    // Table Headers
    transaction: "Transaction",
    typeHeader: "Type",
    amount: "Amount",
    method: "Method",
    statusHeader: "Status",
    date: "Date",
    actions: "Actions",
    ref: "Ref",
    
    // Table Content
    transactionsCount: "transactions",
    noTransactionsFound: "No transactions found",
    
    // Buttons
    viewDetails: "View Details",
    downloadReceipt: "Download Receipt",
    
    // Pagination
    showing: "Showing",
    to3: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Tooltips
    viewTransaction: "View transaction details",
    
    // Status Badges
    completed_badge: "Completed",
    pending_badge: "Pending",
    failed_badge: "Failed",
    refunded_badge: "Refunded",
    
    // Transaction Types
    company_registration: "Company Registration",
    worker_registration: "Worker Registration",
    employer_registration: "Employer Registration",
    subscription_fee: "Subscription Fee",
    salary_deduction: "Salary Deduction",
    
    // Payment Methods
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    cash_payment: "Cash Payment",
    
    // Success Messages
    receiptDownloaded: "Receipt downloaded successfully",
    downloadFailed: "Failed to download receipt",
    
    // Percentage
    percentageIncrease: "+{value}%",
  },

    profile: {
    title: "Employer Profile",
    subtitle: "View and manage your profile information",
    
    // Edit controls
    editProfile: "Edit Profile",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    saving: "Saving...",
    
    // Profile badges
    paidRegistration: "Paid Registration",
    memberSince: "Member since {date}",
    totalHires: "{count} total hires",
    avgRatingGiven: "{rating} avg rating given",
    totalSpent: "Total Spent",
    activeNow: "{count} active now",
    
    // Registration status
    registrationNotPaid: "Registration fee not paid yet. Some features are limited.",
    
    // Stats labels
    activeWorkers: "Active Workers",
    currentlyHired: "Currently hired",
    totalHired: "Total Hired",
    allTime: "All time",
    completed: "Completed",
    contracts: "Contracts",
    pendingRequests: "Pending Requests",
    awaitingResponse: "Awaiting response",
    incidents: "Incidents",
    openIncidents: "{count} open",
    ratingGiven: "Rating Given",
    average: "Average",
    
    // Tabs
    overview: "Overview",
    workers: "Workers",
    financial: "Financial",
    documents: "Documents",
    
    // Overview Tab
    personalInformation: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    nationalId: "National ID",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    genderPlaceholder: "male/female/other",
    location: "Location",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    address: "Address",
    
    // Workers Tab
    workersByCategory: "Workers by Category",
    noCategoryData: "No category data available.",
    recentHires: "Recent Hires",
    noRecentHires: "No recent hires.",
    
    // Financial Tab
    registrationFee: "Registration Fee",
    paid: "Paid",
    pending: "Pending",
    notPaid: "Not paid",
    totalPayments: "Total Payments",
    totalSpending: "Total Spending",
    includingFees: "Including fees",
    pendingRequestsFinancial: "Pending Requests",
    totalRequests: "{count} total",
    recentPayments: "Recent Payments",
    noRecentPayments: "No recent payments.",
    ref: "Ref: {ref}",
    employmentDuration: "Employment Duration",
    avgDays: "Avg Days",
    totalDays: "Total Days",
    minDays: "Min Days",
    maxDays: "Max Days",
    
    // Documents Tab
    yourDocuments: "Your Documents",
    nationalIdDoc: "National ID",
    registrationFeeDoc: "Registration Fee",
    profileVerification: "Profile Verification",
    verified: "Verified",
    verifiedDate: "Verified: {date}",
    awaitingVerification: "Awaiting verification",
    
    // Status badges
    active: "Active",
    completed2: "Completed",
    terminated: "Terminated",
    pending2: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    verified2: "Verified",
    
    // Error state
    loadError: "Failed to load employer profile. Please try again.",
    
    // Placeholders
    notAvailable: "—",
    
    // Gender options
    male: "Male",
    female: "Female",
    other: "Other",
  },







  

},



//   ======================================================================= EMPLOYER ==================================================





// ========================================================================== WORKER ====================================================

worker: {
  workerSidebar: {
    loadError:           "Failed to load worker data",
    changePhoto:         "Change profile photo",
    level:               "Level",
    companyWorker:       "Company Worker",
    activeEmployment:    "Active employment",
    viewAllStats:        "View all statistics",
    currentSalary:       "Current salary",
    salaryUnit:          "RWF/month",
    averageRating:       "Average rating",
    review:              "review",
    reviews:             "reviews",
    quickStats:          "Quick Stats",
    totalEmployments:    "Total Employments",
    employmentHistory:   "Employment history",
    nidaVerified:        "NIDA Verified",
    nidaNotVerified:     "Not NIDA Verified",
    identityVerification:"Identity verification",
    hasInsurance:        "Has Insurance",
    noInsurance:         "No Insurance",
    noIncidents:         "No Incidents",
    incident:            "Incident",
    incidents:           "Incidents",
    unresolved:          "unresolved",
    cleanRecord:         "Clean record",
  },

  workerHeader: {
  defaultName:  "Worker",
  roleLabel:    "Worker",
  navigation:   "Navigation",
  myProfile:    "My Profile",
  notifications: {
    system:              "System",
    newLabel:            "New",
    emptyTitle:          "No notifications",
    noNotifications:     "You don't have any notifications yet.",
    noUnread:            "You have no unread notifications.",
    noRead:              "You have no read notifications.",
    badgeAlert:          "ALERT",
    badgePayment:        "PAYMENT",
    badgeSystem:         "SYSTEM",
    badgeNew:            "NEW",
    badgeHired:          "HIRED",
    badgeRating:         "RATING",
    badgeJob:            "JOB",
    badgeInfo:           "INFO",
    statsTotal:          "Total",
    statsUnread:         "Unread",
    statsRead:           "Read",
    statsTypes:          "Types",
    tabAll:              "All",
    tabUnread:           "Unread",
    tabRead:             "Read",
    filterPlaceholder:   "Filter by type",
    filterAll:           "All Types",
    filterIncidents:     "Incidents",
    filterPayments:      "Payments",
    filterSystem:        "System",
    filterHiring:        "Hiring",
    filterRatings:       "Ratings",
    filterJobs:          "Jobs",
  },
},


  workerStats: {
    title: "Worker Dashboard",
    welcome: "Welcome back, {name}! Track your jobs, earnings, and schedule",
    loadError: "Failed to load dashboard data",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    updating: "Updating...",
    available: "Available",
    unavailable: "Unavailable",
    yes: "Yes",
    no: "No",
    notAvailable: "N/A",
    
    stats: {
      activeJobs: {
        title: "Active Jobs",
        subtitle: "currently working",
        percentage: "this week"
      },
      hoursThisMonth: {
        title: "Hours This Month",
        subtitle: "hours worked",
        percentage: "vs last month"
      },
      monthlyEarnings: {
        title: "Monthly Earnings",
        subtitle: "RWF",
        percentage: "vs last month"
      },
      rating: {
        title: "Rating",
        subtitle: "out of 5.0",
        percentage: "average score"
      }
    },
    
    secondaryStats: {
      completedJobs: "Completed Jobs",
      totalEarnings: "Total Earnings",
      totalHours: "Total Hours",
      availability: "Availability",
      available: "Available",
      unavailable: "Unavailable"
    },
    
    currentEmployment: {
      title: "Current Employment",
      active: "Active",
      household: "Household",
      contact: "Contact",
      monthlySalary: "Monthly Salary",
      started: "Started",
      workType: "Work Type",
      generalHousework: "General Housework",
      otpVerified: "OTP Verified"
    },
    
    tabs: {
      overview: "Overview",
      profile: "Profile",
      ratings: "Ratings"
    },
    
    overview: {
      quickSummary: "Quick Summary",
      totalJobs: "Total Jobs",
      jobBreakdown: "{active} active, {completed} completed",
      thisMonth: "This Month",
      hoursWorked: "hours worked",
      earnings: "Earnings",
      rating: "Rating",
      fromRatings: "from {count} ratings",
      performanceOverview: "Performance Overview",
      basedOnRatings: "Based on {count} ratings",
      personalInformation: "Personal Information",
      name: "Name",
      phone: "Phone",
      email: "Email"
    },
    
    profile: {
      profileDetails: "Profile Details",
      nidaVerified: "NIDA Verified",
      notVerified: "Not Verified",
      basicInformation: "Basic Information",
      fullName: "Full Name",
      age: "Age",
      years: "years",
      gender: "Gender",
      male: "Male",
      female: "Female",
      experience: "Experience",
      beginner: "Beginner",
      intermediate: "Intermediate",
      expert: "Expert",
      contactInformation: "Contact Information",
      phone: "Phone",
      email: "Email",
      nationalId: "National ID",
      company: "Company",
      notRegistered: "Not registered",
      workPreferences: "Work Preferences",
      preferredWorkTypes: "Preferred Work Types",
      languages: "Languages",
      salaryRange: "Salary Range",
      insuranceInformation: "Insurance Information",
      hasInsurance: "Has Insurance",
      provider: "Provider",
      policyNumber: "Policy Number"
    },
    
    ratings: {
      ratingsReviews: "Ratings & Reviews",
      averageWithValue: "{value} average",
      totalRatings: "{count} total ratings",
      outOf5: "Out of 5.0",
      ratingsNote: "Ratings are provided by employers and appear here once verified.",
      viewDetailsNote: "You can view detailed ratings on the Ratings page."
    }
  },

  schedule: {
    title: "My Schedule",
    subtitle: "Manage your shifts and set your weekly availability",
    dateLocale: "en-GB",
    today: "Today",
    currency: "RWF",
    time: {
      am: "AM",
      pm: "PM"
    },
    daysShort: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    summary: {
      upcomingJobs: "Upcoming Jobs",
      completed: "Completed",
      earnedThisWeek: "Earned This Week",
      expected: "Expected (RWF)"
    },
    tabs: {
      upcoming: "Upcoming ({count})",
      completed: "Completed ({count})",
      availability: "Set Availability"
    },
    status: {
      upcoming: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    type: {
      freelance: "Freelance",
      partTime: "Part-Time"
    },
    empty: {
      upcomingTitle: "No upcoming jobs",
      upcomingMessage: "Your active employments will appear here.",
      completedTitle: "No completed jobs yet",
      completedMessage: "Completed employments will appear here."
    },
    availability: {
      available: "Available",
      booked: "Booked",
      weeklyOverview: "Weekly Availability Overview",
      clickHint: "Click any day row to edit its time slots",
      timeSlots: "Time Slots",
      addSlot: "Add Slot",
      noSlots: "No availability set. Click \"Add Slot\" to set your hours.",
      to: "to",
      applyAvailability: "Apply Availability",
      from: "From",
      save: "Save Availability",
      saving: "Saving...",
      newUnsaved: "New (unsaved)",
      weekBanner: "Showing availability for {start} – {end}. Only Every Week slots and matching custom ranges are visible for this week.",
      availableTooltip: "Available: {start}–{end}",
      bookedTooltip: "Booked: {employer}",
      scope: {
        thisWeek: "This Week Only",
        everyWeek: "Every Week",
        custom: "Custom Range"
      }
    }
  },

    transactions: {
    title: "My Transactions",
    subtitle: "Track your earnings and payment history",
    export: "Export",
    refresh: "Refresh",
    loadError: "Failed to load transactions",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    notAvailable: "N/A",
    noDescription: "No description",
    transactions: "transactions",
    
    stats: {
      totalEarnings: {
        title: "Total Earnings",
        subtitle: "all time",
        percentage: "this month"
      },
      totalTransactions: {
        title: "Total Transactions",
        subtitle: "completed",
        percentage: "success rate"
      },
      pending: {
        title: "Pending",
        subtitle: "awaiting payment",
        percentage: "requires action"
      },
      failed: {
        title: "Failed",
        subtitle: "unsuccessful",
        percentage: "rate"
      }
    },
    
    types: {
      subscription_fee: "Subscription",
      salary_deduction: "Salary Deduction",
      worker_registration: "Worker Registration"
    },
    
    status: {
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      refunded: "Refunded"
    },
    
    charts: {
      monthlyEarnings: "Monthly Earnings (Last 6 Months)",
      earningsByType: "Earnings by Transaction Type",
      dailyEarnings: "Daily Earnings (Last 30 Days)",
      transactionSummary: "Transaction Type Summary",
      earnings: "Earnings",
      months: "months",
      types: "types",
      days: "days",
      noData: "No earnings data available"
    },
    
    tabs: {
      all: "All Transactions",
      earnings: "Earnings",
      pending: "Pending"
    },
    
    filters: {
      startDate: "Start Date",
      endDate: "End Date",
      search: "Search transactions..."
    },
    
    table: {
      id: "Transaction ID",
      type: "Type",
      amount: "Amount",
      status: "Status",
      method: "Payment Method",
      date: "Date",
      created: "Created",
      description: "Description",
      actions: "Actions"
    },
    
    pagination: {
      showing: "Showing",
      to: "to",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next"
    },
    
    all: {
      title: "All Transactions",
      total: "Total"
    },
    
    earnings: {
      title: "Completed Transactions (Earnings)",
      total: "Total Earnings"
    },
    
    pending: {
      title: "Pending Transactions",
      total: "Total Pending"
    },
    
    recent: {
      title: "Recent Transactions (Last 7 Days)"
    },
    
    empty: {
      noTransactions: "No transactions found",
      noEarnings: "No completed transactions found",
      noPending: "No pending transactions found"
    }
  },


  profile: {
  title: "My Profile",
  subtitle: "Manage your profile and view your work history",
  loadError: "Failed to load profile",
  loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
  editProfile: "Edit Profile",
  saveChanges: "Save Changes",
  saving: "Saving...",
  cancel: "Cancel",
  markAvailable: "Mark Available",
  markUnavailable: "Mark Unavailable",
  changePhoto: "Change profile photo",
  nidaVerified: "NIDA Verified",
  experienceLevel: "Experience Level",
  activeJobs: "{count} active jobs",
  review: "review",
  reviews: "reviews",
  notSpecified: "Not specified",
  currency: "RWF",
  yearsOld: "{age} years old",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  age: "Age",
  
  status: {
    available: "Available",
    unavailable: "Unavailable",
    hired: "Hired",
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    verified: "Verified"
  },
  
  experience: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    experienced: "Experienced",
    expert: "Expert"
  },
  
  stats: {
    totalJobs: "Total Jobs",
    jobBreakdown: "{active} active · {completed} completed",
    averageRating: "Average Rating",
    totalReviews: "{count} reviews",
    totalEarnings: "Total Earnings",
    allTime: "RWF · all time",
    thisMonth: "This Month",
    monthlyEarnings: "RWF earnings"
  },
  
  tabs: {
    overview: "Overview",
    employments: "Employment History",
    ratings: "Ratings & Reviews"
  },
  
  sections: {
    personalInfo: "Personal Information",
    workPreferences: "Work Preferences",
    insurance: "Insurance Information",
    company: "Company Information"
  },
  
  fields: {
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    age: "Age",
    experienceLevel: "Experience Level",
    workTypes: "Work Types",
    preferredDistricts: "Preferred Districts",
    languages: "Languages",
    minSalary: "Min Salary",
    maxSalary: "Max Salary",
    provider: "Provider",
    policyNumber: "Policy Number",
    companyName: "Company Name",
    companyPhone: "Company Phone"
  },
  
  employments: {
    title: "Employment History",
    count: "{count} jobs",
    employer: "Employer",
    table: {
      employer: "Employer",
      description: "Description",
      status: "Status",
      salary: "Salary",
      startDate: "Start Date"
    },
    empty: {
      title: "No Employment History",
      message: "Your employment history will appear here once you start working."
    }
  },
  
  ratings: {
    title: "Your Ratings",
    count: "{count} ratings",
    review: "review",
    reviews: "reviews",
    employer: "Employer",
    empty: {
      title: "No Ratings Yet",
      message: "Ratings from employers will appear here after you complete jobs."
    }
  }
},

extendedProfile: {
  title: "Complete Your Profile",
  subtitle: "A complete profile increases your chances of being hired.",
  loadError: "Failed to load extended profile",
  loadErrorHint: "Please refresh the page.",
  saving: "Saving...",
  saveChanges: "Save Changes",
  saveAllChanges: "Save All Changes",
  
  completion: {
    title: "Profile completion"
  },
  
  sections: {
    education: "Education",
    experience: "Work Experience",
    services: "Services I Offer",
    preferredWork: "Preferred Work Type & Sector",
    availability: "Availability & Schedule",
    certificates: "Certificates & Licences",
    health: "Health",
    personal: "Personal Information",
    referee: "Additional Reference",
    bio: "Bio & Special Skills"
  },
  
  fields: {
    educationLevel: "Education Level",
    fieldOption: "Field / Option",
    institution: "Institution",
    yearCompleted: "Year Completed",
    yearsOfExperience: "Years of Experience",
    pastExperiences: "Past Experiences (describe in your words)",
    previousEmployers: "Previous Employers",
    employerName: "Employer Name",
    yourRole: "Your Role",
    duration: "Duration",
    location: "Location",
    preferredWorkType: "Preferred Work Type",
    preferredSectors: "Preferred Sectors (select all that apply)",
    availableDays: "Available Days",
    availableFrom: "Available From",
    availableTo: "Available To",
    licenceCategory: "Licence Category",
    otherCertifications: "Other Certifications",
    certificateName: "Certificate Name",
    issuer: "Issuer",
    year: "Year",
    medicalDetails: "Please describe (confidential)",
    maritalStatus: "Marital Status",
    dependents: "Number of Dependents",
    religion: "Religion (optional)",
    refereeName: "Referee Name",
    refereePhone: "Phone",
    refereeRelationship: "Relationship",
    bio: "Short Bio (introduce yourself to employers)",
    specialSkills: "Special Skills"
  },
  
  placeholders: {
    fieldOption: "e.g. Culinary Arts, Nursing...",
    institution: "School / College / University",
    year: "e.g. 2019",
    pastExperiences: "e.g. Nakoze imyaka 2 mu hotel ya Kigali nk'umufundi w'imbuto...",
    employerName: "Company / Person name",
    role: "e.g. House cleaner, Cook...",
    duration: "e.g. 2 years, 6 months...",
    location: "e.g. Kigali, Musanze...",
    selectSectors: "Search and select sectors...",
    selectDays: "Search and select days...",
    certificateName: "e.g. Food Safety",
    issuer: "e.g. RDB, WHO...",
    medicalDetails: "Describe your medical conditions...",
    select: "Select...",
    religion: "e.g. Christian, Muslim...",
    refereeName: "Full name",
    phone: "e.g. 0781234567",
    relationship: "e.g. Former employer, Pastor...",
    bio: "Tell employers about yourself, your attitude, what makes you a great worker...",
    specialSkills: "Any skills not mentioned above (e.g. speaks French, knows Excel, event planning...)"
  },
  
  actions: {
    add: "Add"
  },
  
  empty: {
    employers: "No previous employers added yet",
    certifications: "No certifications added yet"
  },
  
  servicesHint: "Toggle all the services you are willing to provide.",
  
  services: {
    babySitting: "Baby Sitting",
    babySittingDesc: "Taking care of infants and young children",
    laundry: "Laundry",
    ironing: "Ironing",
    houseChores: "House Chores",
    houseChoresDesc: "General cleaning and tidying",
    cooking: "Cooking",
    gardening: "Gardening",
    carWashing: "Car Washing",
    elderlyCare: "Elderly Care",
    elderlyCareDesc: "Assisting senior citizens",
    childcare: "Childcare",
    childcareDesc: "Looking after older children",
    petCare: "Pet Care",
    shopping: "Shopping / Errands",
    shoppingDesc: "Grocery runs and other errands",
    driving: "Driving",
    drivingDesc: "Can drive employer's vehicle if needed"
  },
  
  availability: {
    weekends: "Available on Weekends",
    holidays: "Available on Public Holidays"
  },
  
  certificates: {
    hasDrivingLicence: "Has Driving Licence",
    hasCooking: "Has Cooking Certificate",
    hasFirstAid: "Has First Aid Certificate",
    hasChildcare: "Has Childcare Certificate"
  },
  
  health: {
    physicallyFit: "Physically Fit",
    physicallyFitDesc: "Able to perform physical tasks",
    hasMedicalConditions: "Has Medical Conditions",
    medicalConditionsDesc: "Any condition that may affect work"
  }
}


},

// =============================================================== WORKER ==============================================================



// =================================================================== COMPANY ==============================================================

company: {
  companySidebar: {
    loadError:     "Failed to load company data",
    changePhoto:   "Change profile photo",
    fromLastMonth: "from last month",
    joined:        "Joined",
  },

  companyHeader: {
  defaultName:  "Company",
  roleLabel:    "Company",
  navigation:   "Navigation",
  notifications: {
    system:               "System",
    newLabel:             "New",
    emptyTitle:           "No notifications",
    noNotifications:      "You don't have any notifications yet.",
    noUnread:             "You have no unread notifications.",
    noRead:               "You have no read notifications.",
    badgeAlert:           "ALERT",
    badgePayment:         "PAYMENT",
    badgeSystem:          "SYSTEM",
    badgeNew:             "NEW",
    badgeHiring:          "HIRING",
    badgeWorker:          "WORKER",
    badgeInfo:            "INFO",
    statsTotal:           "Total",
    statsUnread:          "Unread",
    statsRead:            "Read",
    statsTypes:           "Types",
    tabAll:               "All",
    tabUnread:            "Unread",
    tabRead:              "Read",
    filterPlaceholder:    "Filter by type",
    filterAll:            "All Types",
    filterIncidents:      "Incidents",
    filterPayments:       "Payments",
    filterSystem:         "System",
    filterRegistrations:  "Registrations",
    filterHiring:         "Hiring",
  },
},

  companyStats: {
    title: "Company Overview",
    subtitle: "Manage your workers and track hiring requests",
    
    // Stats Cards
    registeredWorkers: "Registered Workers",
    available: "available",
    activeEmployments: "Active Employments",
    currentlyHired: "currently hired",
    monthlyRevenue: "Monthly Revenue",
    vsLastMonth: "vs last month",
    pendingRequests: "Pending Requests",
    awaitingAction: "awaiting action",
    urgent: "urgent",
    newThisWeek: "new this week",
    
    // Secondary Stats
    nidaVerified: "NIDA Verified",
    withInsurance: "With Insurance",
    totalEarnings: "Total Earnings",
    successRate: "Success Rate",
    
    // Tabs
    overview: "Overview",
    workers: "Workers",
    requests: "Requests",
    
    // Quick Summary
    quickSummary: "Quick Summary",
    totalWorkers: "Total Workers",
    thisMonth: "This Month",
    newWorkers: "new workers",
    employments: "Employments",
    active: "active",
    revenue: "Revenue",
    
    // Chart Titles
    workerGrowth: "Worker Growth (Last 30 Days)",
    ratingDistribution: "Rating Distribution",
    revenueTrends: "Revenue Trends",
    loadingChart: "Loading chart...",
    noDataAvailable: "No data available",
    
    // Workers Tab
    recentWorkers: "Recent Workers",
    workersCount: "workers",
    id: "ID",
    name: "Name",
    type: "Type",
    status: "Status",
    registered: "Registered",
    
    // Requests Tab
    hiringRequests: "Hiring Requests",
    requestsCount: "requests",
    requestId: "Request ID",
    worker: "Worker",
    household: "Household",
    date: "Date",
    unknown: "Unknown",
    
    // Status Badges
    available_status: "available",
    hired: "hired",
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    
    // Worker Types
    general: "General",
    
    // Error states
    loadError: "Failed to load dashboard data",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Common
    workers2: "workers",
    requests2: "requests",
    thisMonthLabel: "this month",
  },

    workersContent: {
    title: "Workers Management",
    subtitle: "Manage and track all registered workers",
    
    // Stats Cards
    totalWorkers: "Total Workers",
    registered: "Registered",
    available: "Available",
    readyToHire: "Ready to hire",
    hired: "Hired",
    alreadyHired: "Already hired",
    nidaVerified: "NIDA Verified",
    verifiedWorkers: "Verified workers",
    
    // Main Content Card
    workerDirectory: "Worker Directory",
    
    // Buttons
    generateCards: "Generate Cards",
    generating: "Generating...",
    importExcel: "Import Excel",
    addWorker: "Add Worker",
    
    // Search
    searchPlaceholder: "Search by name or national ID...",
    
    // Table Headers
    worker: "Worker",
    contact: "Contact",
    experience: "Experience",
    status: "Status",
    rating: "Rating",
    employments: "Employments",
    actions: "Actions",
    id: "ID",
    
    // Table Content
    noRatings: "No ratings",
    unknown: "unknown",
    notAvailable: "N/A",
    
    // Tabs
    allWorkers: "All Workers",
    available_tab: "Available",
    hired_tab: "Hired",
    unavailable_tab: "Unavailable",
    
    // Status Badges
    available_status: "available",
    hired_status: "hired",
    unavailable_status: "unavailable",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    workers: "workers",
    page: "Page",
    previous: "Previous",
    next: "Next",
    
    // Empty States
    noWorkersFound: "No workers found",
    
    // Error States
    loadError: "Failed to load workers",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Selection
    selectAll: "Select all workers",
    selectWorker: "Select {name}",
    
    // Experience Levels
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    
    // Success Messages
    cardsGenerated: "{count} card(s) generated!",
    noPdfUrl: "Generated but no PDF URL returned.",
    cardsGenerationFailed: "Failed to generate cards",
    workerRegistered: "Worker registered successfully!",
    workerRegistrationFailed: "Failed to register worker",
    workersImported: "Workers imported! The list has been refreshed.",
    
    // Payment Info
    paymentRequired: "Payment required",
    transactionInfo: "Transaction ID: {id}. Amount: {amount} RWF",
    
    // Tooltips
    viewWorker: "View worker details",

    importModal: {
      title: "Import Workers from Excel",
      description: "Upload an Excel or CSV file to bulk register workers. Download the template to get started.",
      downloadTemplate: "Download Template",
      
      // Drop zone
      dropzoneText: "Drop your Excel file here, or",
      browse: "browse",
      supports: "Supports .xlsx, .xls, .csv",
      
      // File info
      rowsDetected: "{count} row detected",
      rowsDetectedPlural: "{count} rows detected",
      errorsFound: "{count} error",
      errorsFoundPlural: "{count} errors",
      
      // Status badges
      readyToImport: "Ready to import",
      hasErrors: "Has errors",
      
      // Validation errors
      validationErrors: "Validation Errors — please fix your file and re-upload",
      
      // Preview
      preview: "Preview — first {count} rows",
      status: "Status",
      moreRowsNotShown: "+ {count} more rows not shown",
      
      // Required columns
      requiredColumns: "Required column names",
      
      // Footer
      cancel: "Cancel",
      willBeRegistered: "{count} worker will be registered",
      willBeRegisteredPlural: "{count} workers will be registered",
      importing: "Importing...",
      import: "Import {count} Workers",
      
      // Validation messages
      requiredField: "Row {row}: \"{field}\" is required",
      invalidNationalId: "Row {row}: National ID must be 16 digits",
      invalidGender: "Row {row}: Gender must be \"male\" or \"female\"",
      invalidExperience: "Row {row}: experience_level must be beginner/intermediate/expert",
      
      // File validation
      invalidFileType: "Please upload an Excel (.xlsx, .xls) or CSV file",
      emptyFile: "The file is empty or has no data rows",
      readFailed: "Failed to read file. Please check the format.",
      
      // Success messages
      importSuccess: "{count} workers imported successfully!",
      importFailed: "Import failed. Please try again.",
      
      // Table headers
      rowNumber: "#",
      firstName: "First Name",
      lastName: "Last Name",
      gender: "Gender",
      phone: "Phone",
      email: "Email",
      nationalId: "National ID",
      district: "District",
      level: "Level",
      
      // Placeholders
      notAvailable: "—",
    },

              workerDetails: {
      // Header
      workerId: "Worker ID: {id} | National ID: {nationalId}",
      nidaVerified: "NIDA Verified",
      
      // Quick Stats
      employments: "Employments",
      rating: "Rating ({count})",
      incidents: "Incidents",
      nidaStatus: "NIDA Status",
      verified: "Verified",
      notVerified: "Not Verified",
      
      // Tabs
      workerInfo: "Worker Info",
      employment: "Employment ({count})",
      currentJob: "Current Job",
      
      // Personal Information
      personalInformation: "Personal Information",
      phone: "Phone",
      email: "Email",
      nationalId: "National ID",
      age: "Age",
      years: "years",
      gender: "Gender",
      location: "Location",
      experience: "Experience",
      registrationDate: "Registration Date",
      
      // Work Preferences
      workPreferences: "Work Preferences",
      workTypes: "Work Types",
      languagesSpoken: "Languages Spoken",
      preferredDistricts: "Preferred Districts",
      minimumSalary: "Minimum Salary",
      maximumSalary: "Maximum Salary",
      
      // Insurance Information
      insuranceInformation: "Insurance Information",
      provider: "Provider",
      insuranceNumber: "Insurance Number",
      
      // Quick Actions
      quickActions: "Quick Actions",
      markAvailable: "Mark Available",
      updating: "Updating...",
      deleteWorker: "Delete Worker",
      deleting: "Deleting...",
      
      // Referees
      referees: "Referees",
      
      // Employment History Tab
      employer: "Employer",
      startDate: "Start Date",
      endDate: "End Date",
      duration: "Duration",
      salary: "Salary",
      status: "Status",
      present: "Present",
      days: "days",
      
      // Current Employment Tab
      currentEmployment: "Current Employment",
      agreedSalary: "Agreed Salary",
      subscriptionFee: "Subscription Fee",
      workDescription: "Work Description",
      noActiveEmployment: "No active employment",
      
      // Action Dialogs
      markAvailableTitle: "Mark Worker as Available",
      deleteTitle: "Delete Worker",
      markAvailableDescription: "Are you sure you want to mark {workerName} as available? This will end their current employment.",
      deleteDescription: "Are you sure you want to delete {workerName}? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Confirm",
      processing: "Processing...",
      
      // Not Available
      notAvailable: "N/A",
      
      // Status Badges
      available: "Available",
      hired: "Hired",
      unavailable: "Unavailable",
      active: "Active",
      completed: "Completed",
      terminated: "Terminated",
      pending: "Pending",
      resolved: "Resolved",
      unresolved: "Unresolved",
      
      // Experience Levels
      beginner: "Beginner",
      intermediate: "Intermediate",
      expert: "Expert",
      
      // Gender
      male: "Male",
      female: "Female",
    },

        addWorkerModal: {
      title: "Register New Worker",
      
      // Steps
      stepPersonal: "Personal",
      stepAccount: "Account",
      stepLocation: "Location",
      stepWork: "Work",
      stepInsurance: "Insurance",
      
      // Personal Information Step
      firstName: "First Name *",
      firstNamePlaceholder: "Ekaze",
      lastName: "Last Name *",
      lastNamePlaceholder: "Jean",
      gender: "Gender *",
      selectGender: "Select gender",
      male: "Male",
      female: "Female",
      dateOfBirth: "Date of Birth *",
      dateOfBirthPlaceholder: "Select date of birth",
      nationalId: "National ID * (16 digits)",
      nationalIdPlaceholder: "Enter your national ID",
      profilePhoto: "Profile Photo",
      
      // Account Information Step
      phoneNumber: "Phone Number *",
      phonePlaceholder: "0781234567",
      email: "Email *",
      emailPlaceholder: "worker@example.com",
      password: "Password *",
      passwordPlaceholder: "••••••••",
      confirmPassword: "Confirm Password *",
      confirmPasswordPlaceholder: "••••••••",
      
      // Location Step
      province: "Province *",
      selectProvince: "Select province...",
      district: "District *",
      selectDistrict: "Select district...",
      sector: "Sector *",
      selectSector: "Select sector...",
      cell: "Cell *",
      selectCell: "Select cell...",
      village: "Village *",
      selectVillage: "Select village...",
      
      // Work Preferences Step
      experienceLevel: "Experience Level *",
      languagesSpoken: "Languages Spoken *",
      workTypes: "Work Types *",
      preferredWorkDistricts: "Preferred Work Districts *",
      allDistricts: "All Districts",
      searchDistricts: "Search districts...",
      minSalary: "Min Salary (RWF) *",
      minSalaryPlaceholder: "50000",
      maxSalary: "Max Salary (RWF) *",
      maxSalaryPlaceholder: "100000",
      
      // Experience Levels
      beginner: "Beginner",
      intermediate: "Intermediate (1-3 years)",
      expert: "Expert (3+ years)",
      
      // Work Types
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      temporary: "Temporary",
      
      // Languages
      kinyarwanda: "Kinyarwanda",
      english: "English",
      french: "French",
      swahili: "Swahili",
      
      // Insurance Step
      hasInsurance: "This worker has insurance coverage",
      insuranceProvider: "Insurance Provider",
      insuranceProviderPlaceholder: "SONARWA",
      insuranceNumber: "Insurance Number",
      insuranceNumberPlaceholder: "INS123456",
      
      // Summary
      registrationSummary: "Registration Summary",
      name: "Name:",
      phone: "Phone:",
      genderLabel: "Gender:",
      level: "Level:",
      districtLabel: "District:",
      minSalaryLabel: "Min Salary:",
      emailLabel: "Email:",
      insuranceLabel: "Insurance:",
      yes: "Yes",
      no: "No",
      
      // Footer
      cancel: "Cancel",
      back: "Back",
      next: "Next",
      stepOf: "Step {current} of {total}",
      registering: "Registering...",
      registerWorker: "Register Worker",
      
      // Validation Messages
      required: "Required",
      minLength8: "Min 8 characters",
      passwordsDoNotMatch: "Passwords do not match",
      exactly16Digits: "Must be exactly 16 digits",
      positiveNumber: "Must be positive",
      nationalIdLength: "National ID must be 16 numbers",
      
      // Common
      notAvailable: "—",
    },


    },

  hiringRequests: {
    title: "Hiring Requests",
    subtitle: "Manage worker hiring requests from employers",
    
    // Stats Cards
    totalRequests: "Total Requests",
    allTime: "all time",
    thisMonth: "this month",
    pending: "Pending",
    awaitingAction: "awaiting action",
    urgent: "urgent",
    accepted: "Accepted",
    approved: "approved",
    thisWeek: "this week",
    responseRate: "Response Rate",
    avgResponse: "avg response",
    
    // Table Headers
    requestId: "Request ID",
    worker: "Worker",
    employer: "Employer",
    proposedSalary: "Proposed Salary",
    status: "Status",
    date: "Date",
    actions: "Actions",
    
    // Table Content
    requests: "requests",
    noRequestsFound: "No requests found",
    noPendingRequests: "No pending requests found",
    noAcceptedRequests: "No accepted requests found",
    noRejectedRequests: "No rejected requests found",
    general: "General",
    notAvailable: "N/A",
    
    // Search
    searchPlaceholder: "Search requests...",
    
    // Tabs
    all: "All",
    pending_tab: "Pending",
    accepted_tab: "Accepted",
    rejected_tab: "Rejected",
    
    // Buttons
    viewDetails: "View Details",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Status Badges
    pending_badge: "pending",
    accepted_badge: "accepted",
    rejected_badge: "rejected",
    cancelled: "cancelled",
    
    // Error states
    loadError: "Failed to load hiring requests",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Tooltips
    viewRequest: "View request details",

        detailsModal: {
      // Header
      requestId: "Hiring Request #{id}",
      
      // Status Badges
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      cancelled: "Cancelled",
      
      // Action Buttons
      reject: "Reject",
      accept: "Accept",
      
      // Quick Stats
      salary: "Salary",
      proposed: "proposed",
      worker: "Worker",
      requested: "requested",
      employer: "Employer",
      requesting: "requesting",
      date: "Date",
      submitted: "submitted",
      
      // Tabs
      workerTab: "Worker",
      employerTab: "Employer",
      detailsTab: "Details",
      
      // Worker Tab
      workerProfile: "Worker Profile",
      yrs: "yrs",
      experience: "Experience",
      workPreferences: "Work Preferences",
      quickStats: "Quick Stats",
      workTypes: "Work Types",
      rating: "Rating",
      location: "Location",
      phone: "Phone",
      email: "Email",
      age: "Age",
      
      // Employer Tab
      employerInformation: "Employer Information",
      employerHistory: "Employer History",
      requestContext: "Request Context",
      activeWorkers: "Active Workers",
      status: "Status",
      submitted2: "Submitted",
      responded: "Responded",
      
      // Details Tab
      financialDetails: "Financial Details",
      proposedSalary: "Proposed Salary",
      perMonth: "per month",
      requestDate: "Request Date",
      employerMessage: "Employer's Message",
      workDescription: "Work Description",
      companyResponse: "Company Response",
      respondedOn: "Responded on {date}",
      timeline: "Timeline",
      statusInfo: "Status",
      pendingStatus: "Awaiting company response",
      acceptedStatus: "Request has been accepted",
      rejectedStatus: "Request has been rejected",
      cancelledStatus: "Request was cancelled",
      
      // Payment Gate
      paymentRequired: "Payment Required",
      paymentMessage: "A one-time fee is required to view the full details of this hiring request.",
      accessFee: "Access Fee",
      whatYouGet: "What you get:",
      benefit1: "Full worker & employer profile",
      benefit2: "Salary & financial details",
      benefit3: "Accept or reject the request",
      benefit4: "Message history",
      payAndView: "Pay & View Details",
      processingPayment: "Processing Payment...",
      
      // Accept Panel
      acceptTitle: "Accept Hiring Request",
      acceptDescription: "Fill in the employment details.",
      workerInfo: "Worker: {name}",
      proposedInfo: "Proposed: {salary} month",
      agreedSalary: "Agreed Salary (RWF) *",
      agreedSalaryPlaceholder: "Enter salary",
      subscriptionFee: "Subscription Fee (RWF)",
      subscriptionFeePlaceholder: "Optional",
      deduction: "Deduction (%)",
      deductionPlaceholder: "Optional",
      workDescriptionLabel: "Work Description",
      workDescriptionPlaceholder: "Describe responsibilities...",
      responseMessage: "Response Message (Optional)",
      responseMessagePlaceholder: "Message for the employer...",
      cancel: "Cancel",
      confirmAccept: "Confirm Accept",
      processing: "Processing...",
      
      // Reject Panel
      rejectTitle: "Reject Hiring Request",
      rejectDescription: "Provide a reason. This will be visible to the employer.",
      from: "From: {name}",
      rejectionReason: "Rejection Reason *",
      rejectionReasonPlaceholder: "Explain why (min 10 characters)...",
      confirmReject: "Confirm Reject",
      
      // OTP Panel
      requestAccepted: "Request Accepted!",
      otpDescription: "The employer must now physically verify the worker using an OTP.",
      otpSent: "OTP Sent to Worker",
      otpHint: "Worker must share this code with the employer",
      workerPhone: "Worker Phone",
      otpExpiresIn: "OTP Expires In",
      minutes: "minutes",
      nextSteps: "Next steps for the employer:",
      step1: "Physically receive the worker at their location",
      step2: "Go to Worker Verification section",
      step3: "Enter worker's National ID to request OTP",
      step4: "Ask the worker to share their OTP code",
      step5: "Enter OTP to confirm the handover",
      gotIt: "Got it, Close",
      
      // Info Rows
      notAvailable: "N/A",
      
      // Error states
      loadError: "Failed to load hiring request details",
      
      // Tooltips
      close: "Close",
    },
  },
  

    employers: {
    title: "Employers Management",
    subtitle: "Manage employers who have hired workers from your company",
    
    // Stats Cards
    totalEmployers: "Total Employers",
    allTime: "all time",
    thisMonth: "this month",
    activeEmployments: "Active Employments",
    currentWorkers: "current workers",
    activeNow: "active now",
    paidEmployers: "Paid Employers",
    registered: "registered",
    monthlyRevenue: "Monthly Revenue",
    subscriptionFees: "subscription fees",
    
    // Table Headers
    employer: "Employer",
    contact: "Contact",
    location: "Location",
    activeWorkers: "Active Workers",
    totalHired: "Total Hired",
    status: "Status",
    joined: "Joined",
    actions: "Actions",
    id: "ID",
    
    // Table Content
    paid: "Paid",
    unpaid: "Unpaid",
    notAvailable: "N/A",
    
    // Tabs
    allEmployers: "All Employers",
    paid_tab: "Paid",
    unpaid_tab: "Unpaid",
    
    // Search
    searchPlaceholder: "Search employers...",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Empty States
    noEmployersFound: "No employers found",
    noPaidEmployers: "No paid employers found",
    noUnpaidEmployers: "No unpaid employers found",
    
    // Error states
    loadError: "Failed to load employers",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Tooltips
    viewEmployer: "View employer details",

        detailsModal: {
      // Header
      employer: "Employer",
      id: "ID: #{id}",
      paid: "Paid",
      unpaid: "Unpaid",
      
      // Quick Stats
      active: "Active",
      activeWorkers: "active workers",
      total: "Total",
      totalHires: "total hires",
      spent: "Spent",
      totalSpent: "total spent",
      avgDays: "Avg Days",
      employmentAvg: "employment avg",
      
      // Tabs
      overview: "Overview",
      workers: "Workers ({count})",
      history: "History",
      
      // Overview Tab
      employerInformation: "Employer Information",
      phone: "Phone",
      email: "Email",
      location: "Location",
      joined: "Joined",
      financialSummary: "Financial Summary",
      totalSpentLabel: "Total Spent",
      subscription: "Subscription",
      workersHired: "Workers Hired",
      incidents: "Incidents",
      activeWorkersPreview: "Active Workers Preview",
      viewAll: "View All",
      edit: "Edit",
      
      // Right Column
      employmentStats: "Employment Stats",
      totalHiresStat: "Total Hires",
      activeWorkersStat: "Active Workers",
      completedStat: "Completed",
      avgDuration: "Avg Duration",
      days: "days",
      accountTimeline: "Account Timeline",
      memberSince: "Member Since",
      registrationStatus: "Registration Status",
      quickActions: "Quick Actions",
      viewAllWorkers: "View All Workers",
      viewHistory: "View History",
      
      // History Tab
      employmentHistory: "Employment History",
      historyPlaceholder: "Historical employment data will be displayed here.",
      completedRecords: "{count} Completed Records",
      
      // Edit Employment Dialog
      editTitle: "Edit Employment Details",
      editDescription: "Update employment terms and conditions",
      agreedSalary: "Agreed Salary (RWF)",
      salaryPlaceholder: "Salary amount",
      subscriptionFee: "Subscription Fee (RWF)",
      feePlaceholder: "Fee amount",
      salaryDeduction: "Salary Deduction (%)",
      deductionPlaceholder: "0-100",
      workDescription: "Work Description",
      workDescriptionPlaceholder: "Update work responsibilities...",
      employmentStatus: "Employment Status",
      active2: "Active",
      completed: "Completed",
      terminated: "Terminated",
      endDate: "End Date",
      endReason: "End Reason",
      endReasonPlaceholder: "Reason for ending employment...",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      
      // Not Available
      notAvailable: "N/A",
      
      // Error states
      loadError: "Failed to load employer details",
      
      // Tooltips
      close: "Close",
    },
  },

    companyIncidents: {
    title: "Incident Management",
    subtitle: "Track and manage incidents involving your workers",
    
    // Buttons
    reportIncident: "Report Incident",
    refresh: "Refresh",
    
    // Stats Cards
    totalIncidents: "Total Incidents",
    allTime: "all time",
    thisMonth: "this month",
    openCases: "Open Cases",
    requiresAction: "requires action",
    urgent: "urgent",
    thisMonthStats: "This Month",
    recentIncidents: "recent incidents",
    latest: "latest",
    resolved: "Resolved",
    closedCases: "closed cases",
    
    // Table Headers
    incidentNumber: "Incident #",
    worker: "Worker",
    type: "Type",
    severity: "Severity",
    date: "Date",
    status: "Status",
    actions: "Actions",
    assignedOfficer: "Assigned Officer",
    resolvedDate: "Resolved Date",
    
    // Table Content
    noPhone: "No phone",
    notAssigned: "Not assigned",
    incidents: "incidents",
    
    // Tabs
    allIncidents: "All Incidents",
    reported: "Reported",
    investigation: "Investigation",
    resolved_tab: "Resolved",
    
    // Empty States
    noIncidentsFound: "No incidents found",
    noReportedIncidents: "No reported incidents found",
    noInvestigationIncidents: "No incidents under investigation",
    noResolvedIncidents: "No resolved incidents found",
    
    // Search
    searchPlaceholder: "Search incidents...",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Severity Levels
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Status Types
    reported_status: "reported",
    under_investigation: "under investigation",
    resolved_status: "resolved",
    dismissed: "dismissed",
    
    // Incident Types
    theft: "Theft",
    violence: "Violence",
    negligence: "Negligence",
    breach_of_contract: "Breach of Contract",
    misconduct: "Misconduct",
    other: "Other",
    
    // Error states
    loadError: "Failed to load incidents",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
    
    // Tooltips
    viewDetails: "View incident details",

        createModal: {
      title: "Report New Incident",
      description: "Report an incident involving one of your workers",
      
      // Form Fields
      worker: "Worker",
      workerRequired: "Worker *",
      workerPlaceholder: "Search worker...",
      incidentDate: "Incident Date",
      incidentDateRequired: "Incident Date *",
      incidentType: "Incident Type",
      incidentTypeRequired: "Incident Type *",
      typePlaceholder: "Search type...",
      severity: "Severity",
      severityRequired: "Severity *",
      severityPlaceholder: "Search severity...",
      incidentLocation: "Incident Location",
      locationPlaceholder: "Location where incident occurred",
      description2: "Description",
      descriptionRequired: "Description *",
      descriptionPlaceholder: "Describe the incident in detail...",
      descriptionHint: "Minimum 20 characters required",
      
      // Checkbox
      notifyPolice: "Notify police immediately",
      
      // Buttons
      cancel: "Cancel",
      reportIncident: "Report Incident",
      reporting: "Reporting...",
      
      // Incident Types
      theft: "Theft",
      violence: "Violence",
      negligence: "Negligence",
      breach_of_contract: "Breach of Contract",
      misconduct: "Misconduct",
      other: "Other",
      
      // Severity Levels
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      
      // Worker Options (sample - these would come from API)
      workerOption: "{name} (ID: {id})",
    },

        detailsModal: {
      // Header
      type: "Type",
      incidentType: "incident type",
      date: "Date",
      occurredOn: "occurred on",
      involved: "Involved",
      officer: "Officer",
      
      // Quick Stats
      workerInvolved: "Worker",
      noWorker: "No Worker",
      notAssigned: "not assigned",
      policeAssigned: "Police assigned",
      awaitingAssignment: "awaiting assignment",
      assigned: "Assigned",
      pending: "Pending",
      
      // Tabs
      details: "Details",
      workerInfo: "Worker Info",
      evidence: "Evidence",
      
      // Details Tab
      incidentInformation: "Incident Information",
      severity: "Severity",
      status: "Status",
      incidentLocation: "Incident Location",
      description: "Description",
      investigationDetails: "Investigation Details",
      assignedOfficer: "Assigned Officer",
      assignedOn: "Assigned On",
      noOfficerAssigned: "No police officer assigned yet",
      incidentTimeline: "Incident Timeline",
      reported: "Reported",
      incidentDate: "Incident Date",
      assignedToPolice: "Assigned to Police",
      resolved: "Resolved",
      
      // Worker Info Tab
      workerInformation: "Worker Information",
      involvedWorker: "Involved Worker",
      phone: "Phone",
      email: "Email",
      district: "District",
      employer: "Employer",
      name: "Name",
      noWorkerInfo: "No Worker Information",
      noWorkerAssociated: "No worker is associated with this incident.",
      
      // Evidence Tab
      evidenceFiles: "Evidence Files",
      evidenceNumber: "Evidence {number}",
      clickToView: "Click to view",
      noEvidenceFiles: "No evidence files uploaded",
      policeNotes: "Police Notes",
      resolutionDetails: "Resolution Details",
      
      // Action Buttons
      edit: "Edit",
      delete: "Delete",
      
      // Edit Dialog
      editTitle: "Edit Incident",
      editDescription: "Update incident details (only available for incidents with status \"reported\" and not assigned to police)",
      incidentTypeLabel: "Incident Type",
      severityLabel: "Severity",
      incidentLocationLabel: "Incident Location",
      locationPlaceholder: "Location where incident occurred",
      descriptionLabel: "Description *",
      descriptionPlaceholder: "Describe the incident in detail...",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      
      // Delete Dialog
      deleteTitle: "Delete Incident",
      deleteDescription: "Are you sure you want to delete this incident? This action cannot be undone.",
      deleteNote: "Note: Can only delete incidents with status \"reported\" and not assigned to police.",
      deleting: "Deleting...",
      confirmDelete: "Delete",
      
      // Not Available
      notAvailable: "N/A",
      
      // Status Messages
      worker: "Worker",
      noWorkerLabel: "No Worker",
      
      // Incident Types
      theft: "Theft",
      violence: "Violence",
      negligence: "Negligence",
      breach_of_contract: "Breach of Contract",
      misconduct: "Misconduct",
      other: "Other",
      
      // Severity Levels
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      
      // Status Badges
      reported_status: "reported",
      under_investigation: "under investigation",
      resolved_status: "resolved",
      dismissed: "dismissed",
    },
  },

    companyTransactions: {
    title: "Transaction Management",
    subtitle: "Track and analyze all company transactions and revenue",
    
    // Buttons
    export: "Export",
    refresh: "Refresh",
    
    // Stats Cards
    totalRevenue: "Total Revenue",
    allTime: "all time",
    thisMonth: "this month",
    totalTransactions: "Total Transactions",
    completed: "completed",
    successRate: "{rate}% success rate",
    pending: "Pending",
    awaitingPayment: "awaiting payment",
    requiresAction: "requires action",
    failed: "Failed",
    unsuccessful: "unsuccessful",
    rate: "{rate}% rate",
    
    // Table Headers
    transactionId: "Transaction ID",
    type: "Type",
    amount: "Amount",
    status: "Status",
    paymentMethod: "Payment Method",
    date: "Date",
    actions: "Actions",
    created: "Created",
    description: "Description",
    
    // Table Content
    noDescription: "No description",
    transactions: "transactions",
    total: "Total: {amount}",
    totalRevenue2: "Total Revenue: {amount}",
    totalPending: "Total Pending: {amount}",
    
    // Tabs
    allTransactions: "All Transactions",
    revenue: "Revenue",
    pending2: "Pending",
    
    // Filters
    startDate: "Start Date",
    endDate: "End Date",
    searchPlaceholder: "Search transactions...",
    
    // Chart Titles
    monthlyRevenue: "Monthly Revenue (Last 6 Months)",
    months: "months",
    revenueByType: "Revenue by Transaction Type",
    types: "types",
    dailyRevenue: "Daily Revenue (Last 30 Days)",
    days: "days",
    transactionTypeSummary: "Transaction Type Summary",
    
    // Empty States
    noTransactionsFound: "No transactions found",
    noRevenueData: "No revenue data available",
    noCompletedTransactions: "No completed transactions found",
    noPendingTransactions: "No pending transactions found",
    
    // Recent Transactions
    recentTransactions: "Recent Transactions (Last 7 Days)",
    
    // Status Badges
    completed_status: "completed",
    pending_status: "pending",
    failed_status: "failed",
    refunded: "refunded",
    
    // Transaction Types
    subscription_fee: "Subscription",
    salary_deduction: "Salary Deduction",
    worker_registration: "Worker Registration",
    employer_registration: "Employer Registration",
    company_registration: "Company Registration",
    
    // Payment Methods
    notAvailable: "N/A",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    previous: "Previous",
    next: "Next",
    
    // Tooltips
    viewDetails: "View transaction details",
    
    // Error states
    loadError: "Failed to load transactions",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",

        detailsModal: {
      // Header
      transactionNumber: "Transaction #{id}",
      copyId: "Copy ID",
      receipt: "Receipt",
      
      // Quick Stats
      amount: "Amount",
      method: "Method",
      paymentMethod: "payment method",
      entity: "Entity",
      created: "Created",
      transactionDate: "transaction date",
      
      // Tabs
      details: "Details",
      relatedEntity: "Related Entity",
      actions: "Actions",
      
      // Details Tab
      transactionInformation: "Transaction Information",
      transactionType: "Transaction Type",
      paymentMethodLabel: "Payment Method",
      paymentReference: "Payment Reference",
      paymentPhone: "Payment Phone",
      description: "Description",
      failureReason: "Failure Reason",
      additionalInformation: "Additional Information",
      
      // Status Information
      statusInformation: "Status Information",
      currentStatus: "Current Status",
      failedReason: "Failed Reason",
      timeline: "Timeline",
      createdAt: "Created",
      paidAt: "Paid At",
      transactionId: "Transaction ID",

      status: "Status",
      
      // Entity Tab
      workerInformation: "Worker Information",
      employerInformation: "Employer Information",
      companyInformation: "Company Information",
      
      // Actions Tab
      availableActions: "Available Actions",
      viewReceipt: "View Receipt",
      copyTransactionId: "Copy Transaction ID",
      copyFullDetails: "Copy Full Details",
      copyReceiptText: "Copy Receipt Text",
      quickInformation: "Quick Information",
      
      // Entity Types
      worker: "Worker",
      employer: "Employer",
      company: "Company",
      
      // Status
      completed: "completed",
      pending: "pending",
      failed: "failed",
      refunded: "refunded",
      
      // Messages
      copiedToClipboard: "Copied to clipboard",
      
      // Not Available
      notAvailable: "N/A",
      
      // Tooltips
      copyIdTooltip: "Copy transaction ID to clipboard",
    },
  },
  
    companyProfile: {
    title: "Company Profile",
    subtitle: "View and manage your company information",
    
    // Edit controls
    editProfile: "Edit Profile",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    saving: "Saving...",
    
    // Hero Card
    tin: "TIN: {tin} · ID: {id}",
    since: "Since {date}",
    workers: "{count} workers",
    totalRevenue: "Total Revenue",
    approved: "Approved {date}",
    workerOccupancyRate: "Worker Occupancy Rate",
    activeAvailable: "{active} active · {available} available",
    total: "{total} total",
    
    // Stats Cards
    totalWorkers: "Total Workers",
    activeWorkers: "Active Workers",
    activeEmployments: "Active Employments",
    pendingRequests: "Pending Requests",
    incidents: "Incidents",
    avgRating: "Avg Rating",
    
    // Tabs
    overview: "Overview",
    workers2: "Workers",
    financial: "Financial",
    documents: "Documents",
    
    // Overview Tab
    companyDetails: "Company Details",
    businessName: "Business Name",
    tinLabel: "TIN",
    physicalAddress: "Physical Address",
    registered: "Registered",
    approvedLabel: "Approved",
    location: "Location",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    ownerContact: "Owner / Contact Person",
    ownerName: "Owner Name",
    ownerPhone: "Owner Phone",
    ownerEmail: "Owner Email",
    ownerRole: "Company Owner",
    
    // Workers Tab
    workersByCategory: "Workers by Category",
    noCategoryData: "No category data available.",
    recentPlacements: "Recent Placements",
    noRecentPlacements: "No recent placements.",
    
    // Financial Tab
    subscriptionFee: "Subscription Fee",
    monthly: "Monthly",
    salaryDeduction: "Salary Deduction",
    perWorkerHired: "Per worker hired",
    feesCollected: "Fees Collected",
    allTimeRegistrationFees: "All-time registration fees",
    totalRevenueLabel: "Total Revenue",
    allTimeGross: "All-time gross",
    contractPerformance: "Contract Performance",
    completed: "Completed",
    completionRate: "Completion rate",
    totalContracts: "{count} total · {employers} active employers",
    
    // Documents Tab
    companyDocuments: "Company Documents",
    businessRegistration: "Business Registration",
    tinCertificate: "TIN Certificate",
    operatingLicense: "Operating License",
    date: "Date: {date}",
    awaitingUpload: "Awaiting upload",
    
    // Status Badges
    approved2: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    suspended: "Suspended",
    active: "Active",
    completed_status: "Completed",
    verified: "Verified",
    
    // Error state
    loadError: "Failed to load company profile. Please try again.",
    
    // Placeholders
    notAvailable: "—",
    
    // Common
    RWF: "RWF",
    M: "M",
  },



},

// =================================================================== COMPANY ==============================================================


// ======================================================================= POLICE =================================================================

police: {
  policeHeader: {
    defaultName:    "Rwanda National Police",
    roleLabel:      "Police Officer",
    navigation:     "Navigation",
    statistics:     "Statistics",
    policeProfile:  "Police Profile",
    notifications: {
      system:               "System",
      newLabel:             "New",
      emptyTitle:           "No notifications",
      noNotifications:      "You don't have any notifications yet.",
      noUnread:             "You have no unread notifications.",
      noRead:               "You have no read notifications.",
      badgeIncident:        "INCIDENT",
      badgeAssigned:        "ASSIGNED",
      badgeResolved:        "RESOLVED",
      badgeUrgent:          "URGENT",
      badgeSystem:          "SYSTEM",
      badgeVerify:          "VERIFY",
      badgeInfo:            "INFO",
      statsTotal:           "Total",
      statsUnread:          "Unread",
      statsRead:            "Read",
      statsTypes:           "Types",
      tabAll:               "All",
      tabUnread:            "Unread",
      tabRead:              "Read",
      filterPlaceholder:    "Filter by type",
      filterAll:            "All Types",
      filterIncidents:      "Incidents",
      filterPayments:       "Payments",
      filterSystem:         "System",
      filterRegistrations:  "Registrations",
    },
  },

    policeProfile: {
    // Page
    pageTitle: "Police Profile",
    pageSubtitle: "Manage your profile and view incident reports",
    loadError: "Failed to load profile",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",

    // Header buttons
    changePassword: "Change Password",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    changePhoto: "Change profile photo",

    // Password dialog
    changePasswordDesc: "Enter your current password and choose a new one.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    changing: "Changing...",

    // Hero card
    verifiedOfficer: "Verified Officer",
    since: "Since",
    totalIncidents: "Total Incidents",
    thisMonth: "this month",

    // Stat cards
    statPending: "Pending",
    statPendingSub: "Awaiting review",
    statInvestigating: "Investigating",
    statInvestigatingSub: "Under investigation",
    statResolved: "Resolved",
    statResolvedSub: "Completed",
    statVerified: "Verified",
    statVerifiedSub: "Confirmed reports",
    statClosed: "Closed",

    // Tabs
    tabOverview: "Overview",
    tabIncidents: "Incidents",
    tabStatistics: "Statistics",
    tabDocuments: "Documents",

    // Sections
    sectionPersonal: "Personal Information",
    sectionPoliceDetails: "Police Details",
    sectionLocation: "Location",

    // Form fields
    fieldName: "Full Name",
    fieldEmail: "Email",
    fieldPhone: "Phone",
    fieldNationalId: "National ID",
    fieldDob: "Date of Birth",
    fieldGender: "Gender",
    selectGender: "Select gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    fieldBadge: "Badge Number",
    fieldStation: "Police Station",
    fieldRank: "Rank",
    fieldVerificationStatus: "Verification Status",
    fieldVerifiedOn: "Verified On",
    field_district: "District",
    field_sector: "Sector",
    field_cell: "Cell",
    field_village: "Village",
    fieldAddress: "Address",

    // Status labels
    statusReported: "Reported",
    statusInvestigating: "Investigating",
    statusResolved: "Resolved",
    statusClosed: "Closed",
    statusPending: "Pending",
    statusVerified: "Verified",
    statusActive: "Active",

    // Incidents tab
    recentIncidents: "Recent Incidents",
    total: "total",
    noIncidents: "No Incidents",
    noIncidentsSub: "No incidents have been reported yet.",
    verified: "Verified",
    reporter: "Reporter",
    worker: "Worker",
    employer: "Employer",
    company: "Company",
    incidentsByType: "Incidents by Type",
    resolutionRate: "Resolution rate",
    resolved: "resolved",
    pending: "pending",

    // Statistics tab
    incidentStatus: "Incident Status",
    legalActions: "Legal Actions",
    verifiedReports: "Verified Reports",
    escalatedToCourt: "Escalated to Court",
    thisMonthStat: "This Month",
    performanceOverview: "Performance Overview",
    verificationRate: "Verification Rate",

    // Documents tab
    yourDocuments: "Your Documents",
    docNationalId: "National ID",
    docBadge: "Badge Certification",
    docTraining: "Police Training Certificate",
    docVerification: "Profile Verification",
    verifiedOn: "Verified",
    awaitingVerification: "Awaiting verification",
  },

    policeStats: {
    title: "Police Dashboard",
    subtitle: "Monitor and manage incident reports",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    clear: "Clear",
    showingDataFrom: "Showing data from",
    
    // Stats titles
    totalIncidents: "Total Incidents",
    pendingReview: "Pending Review",
    resolved: "Resolved",
    criticalCases: "Critical Cases",
    
    // Stats subtitles
    inPeriod: "in period",
    awaitingAction: "awaiting action",
    urgent: "urgent",
    vsPrevious: "vs previous",
    
    // Secondary stats
    verifiedWorkers: "Verified Workers",
    avgResponseTime: "Avg Response Time",
    resolutionRate: "Resolution Rate",
    activeCases: "Active Cases",
    
    // Tabs
    overview: "Overview",
    recentIncidents: "Recent Incidents",
    
    // Quick Summary
    quickSummary: "Quick Summary",
    totalCases: "Total Cases",
    pending: "Pending",
    
    // Critical Cases
    criticalCasesTitle: "Critical Cases",
    worker: "Worker",
    location: "Location",
    noCriticalCases: "No critical cases",
    
    // Incidents table
    id: "ID",
    type: "Type",
    severity: "Severity",
    status: "Status",
    date: "Date",
    incidents: "incidents",
    
    // Severity levels
    severityHigh: "High",
    severityCritical: "Critical",
    severityMedium: "Medium",
    severityLow: "Low",
    
    // Status
    statusPending: "Pending",
    statusReported: "Reported",
    statusInvestigating: "Investigating",
    statusUnderInvestigation: "Under Investigation",
    statusResolved: "Resolved",
    
    // Error states
    loadError: "Failed to load dashboard data",
    loadErrorHint: "Please try refreshing the page or contact support if the issue persists.",
  },

    incidentsManagement: {
    title: "Incident Management",
    subtitle: "Review, investigate, and manage all incident reports",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    clear: "Clear",
    showingDataFrom: "Showing data from",
    
    // Stats
    total: "Total",
    pending: "Pending",
    investigating: "Investigating",
    resolved: "Resolved",
    incidents: "incidents",
    awaiting: "awaiting",
    inProgress: "in progress",
    closed: "closed",
    
    // Filters
    searchPlaceholder: "Search by ID, worker, or type...",
    severity: "Severity",
    allSeverity: "All Severity",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Table headers
    incidentId: "Incident ID",
    type: "Type",
    worker: "Worker",
    location: "Location",
    severity2: "Severity",
    status: "Status",
    reported: "Reported",
    actions: "Actions",
    id: "ID",
    
    // Tabs
    all: "All",
    pending_tab: "Pending",
    investigating_tab: "Investigating",
    resolved_tab: "Resolved",
    
    // Messages
    noIncidentsFound: "No incidents found",
    failedToLoad: "Failed to load incidents",
    
    // Pagination
    showing: "Showing",
    to2: "to",
    of: "of",
    results: "results",
    page: "Page",
    previous: "Previous",
    next: "Next",
    
    // Button tooltips
    viewDetails: "View Details",
    
    // Error states
    loadError: "Failed to load incidents",
    loadErrorHint: "Please try refreshing the page or contact support.",
  },

    incidentDetails: {
    // Header
    incidentNumber: "Incident #",
    printReport: "Print Report",
    
    // Quick Stats
    severity: "Severity",
    level: "level",
    date: "Date",
    incidentDate: "incident date",
    location: "Location",
    incidentSite: "incident site",
    status: "Status",
    current: "current",
    
    // Tabs
    overview: "Overview",
    worker: "Worker",
    employer: "Employer",
    actions: "Actions",
    
    // Overview Tab
    incidentDetails: "Incident Details",
    description: "Description",
    noDescription: "No description provided",
    type: "Type",
    reportedDate: "Reported Date",
    locationInformation: "Location Information",
    incidentLocation: "Incident Location",
    notSpecified: "Not specified",
    locationWhereIncidentOccurred: "Location where incident occurred",
    policeNotes: "Police Notes",
    timeline: "Timeline",
    reported: "Reported",
    resolved: "Resolved",
    
    // Worker Tab
    workerId: "Worker ID",
    nationalId: "National ID",
    phone: "Phone",
    gender: "Gender",
    email: "Email",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    workerStatistics: "Worker Statistics",
    averageRating: "Average Rating",
    totalEmployments: "Total Employments",
    totalRatings: "Total Ratings",
    totalIncidents: "Total Incidents",
    noWorkerInfo: "No worker information available",
    
    // Employer Tab
    employerId: "Employer ID",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    employerStatistics: "Employer Statistics",
    activeWorkers: "Active Workers",
    totalWorkersHired: "Total Workers Hired",
    incidentsReported: "Incidents Reported",
    noEmployerInfo: "No employer information available",
    
    // Actions Tab
    updateStatus: "Update Status",
    newStatus: "New Status",
    selectStatus: "Select status",
    underInvestigation: "Under Investigation",
    resolved_status: "Resolved",
    dismissed: "Dismissed",
    escalated: "Escalated",
    updating: "Updating...",
    updateStatusBtn: "Update Status",
    addInvestigationNotes: "Add Investigation Notes",
    notes: "Notes",
    notesPlaceholder: "Enter your investigation notes here...",
    addNotes: "Add Notes",
    adding: "Adding...",
    
    // Messages
    enterNotes: "Please enter notes",
    notesAdded: "Notes added successfully",
    notesFailed: "Failed to add notes",
    selectStatusMessage: "Please select a status",
    statusUpdated: "Status updated successfully",
    statusFailed: "Failed to update status",
    
    // Severity levels
    severityCritical: "CRITICAL",
    severityHigh: "HIGH",
    severityMedium: "MEDIUM",
    severityLow: "LOW",
    
    // Status types
    statusReported: "REPORTED",
    statusUnderInvestigation: "UNDER INVESTIGATION",
    statusResolved: "RESOLVED",
    statusDismissed: "DISMISSED",
    statusEscalated: "ESCALATED",
    
    // Gender
    male: "Male",
    female: "Female",
    other: "Other",
  },

  policeStatistics: {
    title: "Police Analytics & Statistics",
    subtitle: "Incident trends and worker verification data",
    loadError: "Failed to load statistics",

    // Filter bar
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    clear: "Clear",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    showingDataFrom: "Showing data from",

    // Stat cards
    totalIncidents: "Total Incidents",
    inPeriod: "in period",
    topType: "Top Type",
    cases: "cases",
    topDistrict: "Top District",
    incidents: "Incidents",
    verifiedWorkers: "Verified Workers",
    workersVerified: "workers verified",

    // Tabs
    trends: "Trends",
    types: "Types",
    districts: "Districts",
    verification: "Verification",

    // Chart titles
    incidentTrendsTitle: "Incident Trends Over Time",
    incidentsByCategoryTitle: "Incidents by Category",
    typeDistributionTitle: "Incident Type Distribution",
    typeStatsTitle: "Incident Statistics by Type",
    districtChartTitle: "Incidents by District (Kigali)",
    verificationTrendsTitle: "Worker Verification Trends",
    totalIncidentsReported: "Total incidents reported",
    ofTotalIncidents: "of total incidents",

    // Chart legends
    legendTotal: "Total Incidents",
    legendAssault: "Assault",
    legendTheft: "Theft",
    legendDispute: "Dispute",
    legendMisconduct: "Misconduct",
    legendVerified: "Verified Workers",
    legendPending: "Pending Verification",
  },
},

// ======================================================================= POLICE =================================================================



// ====================================================================== SUPERVISOR ==============================================================


supervisor: {
  supervisorHeader: {
    defaultName:        "System Supervisor",
    roleLabel:          "Administrator",
    navigation:         "Navigation",
    totalUsers:         "Total Users",
    finance:            "Finance",
    systemUsage:        "System Usage",
    supervisorProfile:  "Supervisor Profile",
    notifications: {
      system:               "System",
      newLabel:             "New",
      emptyTitle:           "No notifications",
      noNotifications:      "You don't have any notifications yet.",
      noUnread:             "You have no unread notifications.",
      noRead:               "You have no read notifications.",
      badgeAlert:           "ALERT",
      badgePayment:         "PAYMENT",
      badgeSystem:          "SYSTEM",
      badgeNew:             "NEW",
      badgeCompany:         "COMPANY",
      badgeWorker:          "WORKER",
      badgeEmployer:        "EMPLOYER",
      badgeInfo:            "INFO",
      statsTotal:           "Total",
      statsUnread:          "Unread",
      statsRead:            "Read",
      statsTypes:           "Types",
      tabAll:               "All",
      tabUnread:            "Unread",
      tabRead:              "Read",
      filterPlaceholder:    "Filter by type",
      filterAll:            "All Types",
      filterIncidents:      "Incidents",
      filterPayments:       "Payments",
      filterSystem:         "System",
      filterCompanies:      "Companies",
      filterWorkers:        "Workers",
      filterEmployers:      "Employers",
      filterRegistrations:  "Registrations",
    },
  },

  supervisorStats: {
  // Error state
  loadError:          "Failed to load dashboard data",
  loadErrorHint:      "Please try refreshing the page or contact support if the issue persists.",

  // Header
  title:              "Supervisor Dashboard",
  subtitle:           "Monitor system-wide metrics and user activity",

  // Date filter UI
  from:               "From",
  to:                 "To",
  startDate:          "Start date",
  endDate:            "End date",
  selectPeriod:       "Select period",
  last7Days:          "Last 7 Days",
  last30Days:         "Last 30 Days",
  last90Days:         "Last 90 Days",
  thisMonth:          "This Month",
  lastMonth:          "Last Month",
  customRange:        "Custom Range",
  export:             "Export",
  showingFrom:        "Showing data from",

  // Main stat cards
  statTotalUsers:     "Total Users",
  statAllTypes:       "all types",
  statThisMonth:      "this month",
  statActiveSessions: "Active Sessions",
  statOnlineNow:      "online now",
  statVsYesterday:    "vs yesterday",
  statTotalRevenue:   "Total Revenue",
  statSystemHealth:   "System Health",
  statUptime:         "uptime",
  statVsLastWeek:     "vs last week",

  // Secondary stats bar
  secondaryWorkers:   "Workers",
  secondaryEmployers: "Employers",
  secondaryCompanies: "Companies",
  secondaryPolice:    "Police Officers",

  // Tabs
  tabUserBreakdown:   "User Breakdown",
  tabRecentActivity:  "Recent Activity",

  // User Breakdown tab
  userDistribution:   "User Distribution",
  total:              "total",
  colUserType:        "User Type",
  colCount:           "Count",
  colStatus:          "Status",
  colPercentage:      "Percentage",

  // Recent Activity tab
  recentActivity:     "Recent Activity",
  last24Hours:        "Last 24 hours",
},

  userAnalytics: {
    title: "User Analytics",
    subtitle: "Comprehensive breakdown of all user types in the system",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    clear: "Clear",
    showingDataFrom: "Showing data from",
    totalUsers: "Total Users",
    
    // Metrics
    activeUsers: "Active Users",
    newRegistrations: "New Registrations",
    avgSessionTime: "Avg Session Time",
    verifiedAccounts: "Verified Accounts",
    
    // Chart titles
    userGrowthTrends: "User Growth Trends",
    userTypeDistribution: "User Type Distribution",
    growthByUserCategory: "Growth by User Category",
    dailyActiveUsers: "Daily Active Users (This Week)",
    
    // Tooltips
    ofTotalUsers: "of total users",
    
    // Error states
    loadError: "Failed to load user analytics",
    loadErrorHint: "Please try refreshing the page or contact support.",
  },

    financeReports: {
    title: "Financial Reports",
    subtitle: "Revenue, expenses, and profit analysis",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    clear: "Clear",
    showingDataFrom: "Showing data from",
    
    // Metrics
    totalRevenue: "Total Revenue",
    totalExpenses: "Total Expenses",
    netProfit: "Net Profit",
    profitMargin: "Profit Margin",
    
    // Chart titles
    monthlyRevenueVsExpenses: "Monthly Revenue vs Expenses",
    revenueBySource: "Revenue by Source",
    monthlyProfitTrend: "Monthly Profit Trend",
    dailyTransactionValue: "Daily Transaction Value",
    
    // Summary stats
    revenueGrowth: "Revenue Growth",
    avgTransaction: "Avg Transaction",
    totalTransactions: "Total Transactions",
    vsPreviousPeriod: "vs previous period",
    perTransaction: "per transaction",
    inPeriod: "in period",
    
    // Error states
    loadError: "Failed to load finance reports",
    loadErrorHint: "Please try refreshing the page or contact support.",
  },

    systemUsage: {
    title: "System Usage & Performance",
    subtitle: "Real-time monitoring of system resources and traffic",
    from: "From",
    to: "To",
    startDate: "Start date",
    endDate: "End date",
    selectPeriod: "Select period",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    export: "Export",
    clear: "Clear",
    showingDataFrom: "Showing data from",
    allSystemsOperational: "All Systems Operational",
    
    // Metrics
    cpuUsage: "CPU Usage",
    memoryUsage: "Memory Usage",
    diskUsage: "Disk Usage",
    uptime: "Uptime",
    
    // Statuses
    statusExcellent: "Excellent",
    statusNormal: "Normal",
    statusWarning: "Warning",
    statusCritical: "Critical",
    
    // Chart titles
    hourlyTrafficPattern: "Hourly Traffic Pattern",
    dailySystemLoad: "Daily System Load",
    topApiEndpoints: "Top API Endpoints",
    
    // Summary stats
    avgResponseTime: "Avg Response Time",
    totalRequests: "Total Requests",
    successRate: "Success Rate",
    inSelectedPeriod: "in selected period",
    allRequests: "all requests",
    performance: "performance",
    
    // Chart labels
    requests: "Requests",
    activeUsers: "Active Users",
    cpuUsageLabel: "CPU Usage",
    memoryUsageLabel: "Memory Usage",
    diskUsageLabel: "Disk Usage",
    apiCalls: "API Calls",
    
    // Error states
    loadError: "Failed to load system usage data",
    loadErrorHint: "Please try refreshing the page or contact support.",
  },
},


// ====================================================================== SUPERVISOR ==============================================================



  },

  kin: {
    nav: {
      home: "Ahabanza",
      // PREVIOUS: findWorker: "Shaka umukozi",
      findWorker: "Shaka Umushoferi",
      howItWorks: "Uko bikorwa",
    },



    common: {
      back: "Subira inyuma",
      searchPages: "Shakisha paji...",
      loading: "Gutegereza...",
      cancel: "Hagarika",
      confirm: "Emeza",
      save: "Bika",
      close: "Funga",
      viewDetails: "Reba Ibisobanuro",
      noResults: "Nta bisubizo bibonetse",
    },

    registration: {
    modal: {
      title: "Fungura Konti",
      subtitle: "Hitamo ubwoko bwa konti yawe hanyuma uzuzamo amakuru yawe",
      haveAccount: "Usanzwe ufite konti?", 
      close: "Funga",
      tabs: {
        worker: "Iyandikishe nk'Umukozi",
        employer: "Iyandikishe nk'Umukoresha",
        company: "Iyandikishe nk'Ikigo"
      }
    },

      worker: {
    personalInfo: {
      title: "Amakuru y'Umuntu",
      firstName: "Izina",
      firstNameRequired: "Izina rirakenewe",
      firstNamePlaceholder: "Ekaze",
      lastName: "Iry'umuryango",
      lastNameRequired: "Iry'umuryango rirakenewe",
      lastNamePlaceholder: "Jean",
      gender: "Igitsina",
      genderRequired: "Igitsina girakenewe",
      selectGender: "Hitamo igitsina",
      male: "Gabo",
      female: "Gore",
      dateOfBirth: "Itariki y'Amavuko",
      dateOfBirthPlaceholder: "Hitamo itariki y'amavuko",
      nationalId: "Indangamuntu",
      nationalIdRequired: "Indangamuntu irakenewe",
      nidaNameCheck: 'Shyiramo izina rimwe muyari ku irangamuntu yawe, wemeze.',
      nidaDobCheck: 'Hitamo itariki yamavuko iri ku iranganamuntu yawe.',
      nationalIdLength: "Nomero y'indangamuntu igomba kuba imibare 16",
      nationalIdPlaceholder: "Shyiramo nomero y'indangamuntu",
      photo: "Ifoto y'Umwirondoro",
        verifying: "Tegereza...",
  verifyIdentity: "Emeza",
      preview: "Ibanziriza",
            dob: "Hitamo itariki yamavuko",
      name: "Andika Izina",
      insurance: {
  title: "Ubwishingizi bw'Ubuzima",
  selectType: "Hitamo Ubwoko bw'Ubwishingizi",
  mutuelleLabel: "MUTUELLE DE SANTÉ",
  mutuelleDesc: "Ubwishingizi bw'ubuzima bw'umuryango",
  othersLabel: "IBINDI",
  othersDesc: "Ubwishingizi bwa leta cyangwa ubundi",
  provider: "Ikigo cy'Ubwishingizi",
  number: "Nimero y'Ubwishingizi",
  providerPlaceholder: "urugero: RSSB, SORAS",
  numberPlaceholder: "Injiza nimero y'ubwishingizi",
},
    },
    accountInfo: {
      title: "Amakuru ya Konti",
      phone: "Nimero ya Telefone",
      phoneRequired: "Telefone irakenewe",
      phonePlaceholder: "0781234567",
      email: "Imeyili",
      emailRequired: "Imeyili irakenewe",
      emailPlaceholder: "user@ekaze.pay",
      password: "Ijambo ryibanga",
      passwordRequired: "Ijambo ryibanga rirakenewe",
      passwordLength: "Ijambo ryibanga rigomba kuba byibura 8 inyuguti",
      confirmPassword: "Emeza Ijambo ryibanga",
      confirmRequired: "Nyamuneka emeza ijambo ryibanga",
      passwordMismatch: "Ijambo ryibanga ntirihuriye"
    },
    location: {
      title: "Aho Atuye",
      province: "Intara",
      selectProvince: "Hitamo intara...",
      district: "Akarere",
      selectDistrict: "Hitamo akarere...",
      sector: "Umurenge",
      selectSector: "Hitamo umurenge...",
      cell: "Akagari",
      selectCell: "Hitamo akagari...",
      village: "Umudugudu",
      selectVillage: "Hitamo umudugudu..."
    },
    workPreferences: {
      title: "Ibyo Akunda mu Kazi",
      experienceLevel: "Urwego rw'Uburambe",
      levels: {
        beginner: "Incamake",
        intermediate: "Urugero (Imyaka 1-3)",
        expert: "Inzobere (Imyaka 3+)"
      },
      languages: "Indimi Avuga",
      workTypes: "Ubwoko bw'Akazi",
      types: {
        full_time: "Igihe Cyuzuye",
        part_time: "Igice cy'Igihe",
        contract: "Amasezerano",
        temporary: "Igihe gito"
      },
      preferredDistricts: "Uturere Akunda gukorera",
      selectAll: "Hitamo Uturere twose",
      selectDistricts: "Shakisha uhitemo uturere...",
      minSalary: "Umushahara muto (RWF)",
      maxSalary: "Umushahara Munini (RWF)",
      salaryRequired: "Umushahara urakenewe",
      salaryPositive: "Umushahara ugomba kuba mwiza",
      minSalaryPlaceholder: "50000",
      maxSalaryPlaceholder: "100000"
    },
    insurance: {
      title: "Amakuru y'Ubwishingizi",
      hasInsurance: "Mfite ubwishingizi",
      provider: "Utanga ubwishingizi",
      providerPlaceholder: "SONARWA",
      number: "Nimero y'Ubwishingizi",
      numberPlaceholder: "INS123456"
    },
    submit: {
      register: "Iyandikishe nk'Umukozi",
      registering: "Iri kwiyandika..."
    }
  },


  employer: {
  note: "Icyitonderwa:",
  noteText: "Hakenewe kwishyura rimwe kugirango wandikishe konti yawe. Uzoherezwa ku cyishyuro nyuma yo kwiyandikisha.",
  
  personalInfo: {
    title: "Amakuru y'Umuntu",
    fullName: "Izina Ryuzuye",
    nameRequired: "Izina ryuzuye rirakenewe",
    namePlaceholder: "Ekaze Jean",
    gender: "Igitsina",
    genderRequired: "Igitsina girakenewe",
    selectGender: "Hitamo igitsina",
    male: "Gabo",
    female: "Gore",
    nationalId: "Indangamuntu",
    nationalIdRequired: "Indangamuntu irakenewe",
    nationalIdLength: "Nomero y'indangamuntu igomba kuba imibare 16",
      nidaNameCheck: 'Shyiramo izina rimwe muyari ku irangamuntu yawe, wemeze.',
      nidaDobCheck: 'Hitamo itariki yamavuko iri ku iranganamuntu yawe.',
      dob: "Hitamo itariki yamavuko",
              verifying: "Tegereza...",
  verifyIdentity: "Emeza",
      name: "Andika Izina",
    nationalIdPlaceholder: "Shyiramo nomero y'indangamuntu",
    insurance: {
  title: "Ubwishingizi bw'Ubuzima",
  selectType: "Hitamo Ubwoko bw'Ubwishingizi",
  mutuelleLabel: "MUTUELLE DE SANTÉ",
  mutuelleDesc: "Ubwishingizi bw'ubuzima bw'umuryango",
  othersLabel: "IBINDI",
  othersDesc: "Ubwishingizi bwa leta cyangwa ubundi",
  provider: "Ikigo cy'Ubwishingizi",
  number: "Nimero y'Ubwishingizi",
  providerPlaceholder: "urugero: RSSB, SORAS",
  numberPlaceholder: "Injiza nimero y'ubwishingizi",
},
  },
  
  contactInfo: {
    title: "Amakuru ya Konti",
    phone: "Nimero ya Telefone",
    phoneRequired: "Telefone irakenewe",
    phonePlaceholder: "0781234567",
    email: "Imeyili",
    emailRequired: "Imeyili irakenewe",
    emailPlaceholder: "user@ekaze.pay"
  },
  
  location: {
    title: "Aho Atuye",
    province: "Intara",
    selectProvince: "Hitamo intara...",
    district: "Akarere",
    selectDistrict: "Hitamo akarere...",
    sector: "Umurenge",
    selectSector: "Hitamo umurenge...",
    cell: "Akagari",
    selectCell: "Hitamo akagari...",
    village: "Umudugudu",
    selectVillage: "Hitamo umudugudu..."
  },
  
  security: {
    title: "Umutekano wa Konti",
    password: "Ijambo ryibanga",
    passwordRequired: "Ijambo ryibanga rirakenewe",
    passwordLength: "Ijambo ryibanga rigomba kuba byibura 8 inyuguti",
    confirmPassword: "Emeza Ijambo ryibanga",
    confirmRequired: "Nyamuneka emeza ijambo ryibanga",
    passwordMismatch: "Ijambo ryibanga ntirihuriye"
  },


  submit: {
    register: "Iyandikishe nk'Umukoresha",
    registering: "Iri kwiyandika..."
  }
},

company: {
  note: "Icyitonderwa:",
  noteText: "Iyandikishwa rya sosiyete yawe rizagenzurwa n'itsinda ry'abayobozi bacu. Uzabona amenyekanisha konti yawe imaze kwemerwa.",
  
  companyInfo: {
    title: "Amakuru ya Sosiyete",
    businessName: "Izina ry'Ubucuruzi",
    businessNameRequired: "Izina ry'ubucuruzi rirakenewe",
    businessNamePlaceholder: "ABC Company Ltd",
    tin: "TIN (Nimero yo kwishyura imisoro)",
    tinRequired: "TIN irakenewe",
    tinPlaceholder: "123456789",
    physicalAddress: "Aderesi",
    addressRequired: "Aderesi irakenewe",
    addressPlaceholder: "KG 123 St, Kigali",
    logo: "Ikirangantego cya Sosiyete",
    logoHint: "Shyiramo ikirangantego cya sosiyete (JPEG, PNG, JPG - Max 2MB)",
    logoPreview: "Ibanziriza ry'Ikirangantego"
  },
  
  location: {
    title: "Ahantu",
    province: "Intara",
    selectProvince: "Hitamo intara...",
    district: "Akarere",
    selectDistrict: "Hitamo akarere...",
    sector: "Umurenge",
    selectSector: "Hitamo umurenge...",
    cell: "Akagari",
    selectCell: "Hitamo akagari...",
    village: "Umudugudu",
    selectVillage: "Hitamo umudugudu..."
  },
  
  ownerInfo: {
    title: "Amakuru ya Nyir'ubwite",
    ownerName: "Izina ry'Nyir'ubwite",
    ownerNameRequired: "Izina rya nyir'ubwite rirakenewe",
    ownerNamePlaceholder: "John Doe",
    nationalId: "Indangamuntu",
    nationalIdRequired: "Indangamuntu irakenewe",
    nationalIdLength: "Nomero y'indangamuntu igomba kuba imibare 16",
   nationalIdPlaceholder: "Shyiramo nomero y'indangamuntu",
    ownerPhone: "Telefone ya Nyir'ubwite",
    ownerPhoneRequired: "Telefone ya nyir'ubwite irakenewe",
    ownerPhonePlaceholder: "0781234567",
    ownerEmail: "Imeyili ya Nyir'ubwite",
    ownerEmailRequired: "Imeyili ya nyir'ubwite irakenewe",
    ownerEmailPlaceholder: "owner@company.com"
  },
  
  security: {
    title: "Umutekano wa Konti",
    password: "Ijambo ryibanga",
    passwordRequired: "Ijambo ryibanga rirakenewe",
    passwordLength: "Ijambo ryibanga rigomba kuba byibura 8 inyuguti",
    confirmPassword: "Emeza Ijambo ryibanga",
    confirmRequired: "Nyamuneka emeza ijambo ryibanga",
    passwordMismatch: "Ijambo ryibanga ntirihuriye"
  },
  
  submit: {
    submit: "Ohereza Iyandikwa rya Sosiyete",
    submitting: "Irohereza..."
  }
},




  },

  otp: {
  title: "Emeza Nimero ya Telefone",
  sent: "Twohereje kode y'ibimibare 6 yo kwemeza kuri",
  testing: "Kugerageza: Kode yawe ni",
  enterCode: "Shyiramo Kode ya OTP",
  remaining: "Hasigaye:",
  resend: "Ohereza OTP Nanone",
  resending: "Irohereza...",
  cancel: "Reka",
  verify: "Emeza"
},

  

    


    // =====================================================================ADMIN==================================================
  admin: {

    adminSidebar: {
  backToHome: "Garuka Ahabanza",
  sections: {
    overview:   "INCAMAKE",
    management: "IMICUNGIRE",
    operations: "IBIKORWA",
    system:     "SISITEMU",
  },
  items: {
    dashboard: "Dashibordo",
    companies: "Amasosiyete",
    workers:   "Abakozi",
    incidents: "Ibibazo",
    payments:  "Ubwishyu",
    users:     "Abakoresha",
    analytics: "Imibare",
    settings:  "Igenamiterere",
  },
},

adminHeader: {
  title: "Dashibordo y'Ubuyobozi",
  profile: {
    defaultName: "Umuyobozi w'Ubutegetsi",
    settings:    "Igenamiterere ry'Umwirondoro",
  },
  notifications: {
    dropdownTitle:       "Imenyesha rya Sisitemu",
    system:              "Sisitemu",
    newLabel:            "Rishya",
    emptyTitle:          "Nta mamenyesha",
    noNotifications:     "Nta mamenyesha ufite ubu.",
    noUnread:            "Nta mamenyesha adasomwe ufite.",
    noRead:              "Nta mamenyesha asomwe ufite.",
    badgeAlert:          "IMPURUZA",
    badgePayment:        "UBWISHYU",
    badgeSystem:         "SISITEMU",
    badgeNew:            "RISHYA",
    badgeInfo:           "AMAKURU",
    statsTotal:          "Yose",
    statsUnread:         "Adasomwe",
    statsRead:           "Asomwe",
    statsTypes:          "Ubwoko",
    tabAll:              "Yose",
    tabUnread:           "Adasomwe",
    tabRead:             "Asomwe",
    filterPlaceholder:   "Shungura ubwoko",
    filterAll:           "Ubwoko Bwose",
    filterIncidents:     "Ibibazo",
    filterPayments:      "Ubwishyu",
    filterSystem:        "Sisitemu",
    filterRegistrations: "Iyandikwa",
  },
},

    adminStats: {
      title: "Incamake ya Sisitemu",
      subtitle: "Genzura no gucunga urubuga rwose",
      
      totalCompanies: "Amasosiyete Yose",
      registeredWorkers: "Abakozi Biyandikishije",
      totalRevenue: "Amafaranga Yose Yinjije",
      activeIncidents: "Ibibazo Bikorwa",
      approved: "byemewe",
      available: "bahari",
      employed: "bakora ubu",
      pending: "bitegereje",
      allVerified: "byose byemejwe",
      thisMonth: "uku kwezi",
      resolved: "byakemutse",
      critical: "bikomeye",
      noCritical: "Nta bikomeye",
      total: "byose",
      
      activeEmployments: "Akazi Gakora",
      nidaVerified: "NIDA Yemeje",
      activeUsers: "Abakoresha Bagikora",
      withInsurance: "Bafite Ubwishingizi",
      
      overview: "Incamake",
      transactions: "Ubucuruzi",
      workers: "Abakozi",
      companies: "Amasosiyete",
      incidents: "Ibibazo",
      
      workersByDistrict: "Abakozi ku Karere",
      workersCount: "abakozi",
      platformActivity: "Ibikorwa ku Rubuga",
      totalUsers: "Abakoresha Bose",
      employers: "Abatanga Akazi",
      freelancers: "Abigenga",
      companyWorkers: "Abakozi ba Sosiyete",
      active: "bagikora",
      paid: "bishyuye",
      independent: "bikora",
      registered: "biyandikishije",
      
      recentTransactions: "Ubucuruzi Buheruka",
      transactionsCount: "ubucuruzi",
      completed: "Bwuzuye",
      pending_status: "Burategereje",
      failed: "Bwananiwe",
      todayRevenue: "Amafaranga Y'uyu munsi",
      transactionId: "ID y'Ubucuruzi",
      type: "Ubwoko",
      amount: "Amafaranga",
      status: "Imiterere",
      date: "Itariki",
      
      recentWorkers: "Abakozi Baheruka",
      workersCount2: "abakozi",
      totalWorkers: "Bose",
      available_status: "Bahari",
      employed_status: "Bakora",
      verified: "Bemejwe",
      id: "ID",
      name: "Izina",
      workerType: "Ubwoko",
      workerStatus: "Imiterere",
      registeredDate: "Iyandikishijwe",
      
      recentCompanies: "Amasosiyete Aheruka",
      companiesCount: "amasosiyete",
      totalCompanies2: "Yose",
      approved_status: "Yemewe",
      pending_status2: "Arategereje",
      rejected: "Yanzwe",
      businessName: "Izina ry'Ubucuruzi",
      
      recentIncidents: "Ibibazo Biheruka",
      incidentsCount: "ibibazo",
      totalIncidents: "Byose",
      open: "Bifunguye",
      investigating: "Birimo Gukurikirwa",

      resolved_status: "Byakemutse",
      critical_status: "Bikomeye",
      incidentType: "Ubwoko",
      severity: "Uburemere",
      reportedDate: "Byatangajwe",
      
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      completed_status: "bwuzuye",
      pending_badge: "bitegereje",
      failed_status: "byananiranye",
      hired: "bakoreshwa",
      
      loadError: "Ntibishoboye gupakurura amakuru ya dashibodi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      workers2: "abakozi",
      companies2: "amasosiyete",
      incidents2: "ibibazo",
      transactions2: "ubucuruzi",
    },

        companyManagement: {
      title: "Gucunga Amasosiyete",
      subtitle: "Suzuma no gucunga iyandikishwa ry'amasosiyete",
      registerCompany: "Andika Sosiyete",
      
      totalCompanies: "Amasosiyete Yose",
      pendingReview: "Arategereje Gusuzumwa",
      approved: "Yemewe",
      suspended: "Yahagaritswe",
      registered: "Yanditswe",
      awaiting: "Arategereje",
      needReview: "yasuzumwe",
      active: "Akora",
      inactive: "Ntikora",
      approvalRate: "igipimo cy'ubwemezwa",
      rejected: "yanzwe",
      
      company: "Sosiyete",
      contact: "Aho twandikira",
      location: "Aho iherereye",
      workers: "Abakozi",
      status: "Imiterere",
      actions: "Igikorwa",
      id: "ID",
      
      notAvailable: "N/A",
      
      searchPlaceholder: "Shakisha ukoresheje izina cyangwa ID...",
      statusFilter: "Imiterere",
      allStatus: "Imiterere Yose",
      pending: "Itegereje",
      approved_status: "Yemewe",
      rejected_status: "Yanzwe",
      suspended_status: "Yahagaritswe",
      
      allCompanies: "Amasosiyete Yose",
      all: "Yose",
      pending_tab: "Itegereje",
      approved_tab: "Yemewe",
      suspended_tab: "Yahagaritswe",
      
      noCompaniesFound: "Nta Masosiyete Abonetse",
      noCompaniesMatch: "Nta masosiyete ahuye n'ibipimo byawe. Gerageza guhindura ibipimo byawe.",
      noCompaniesRegistered: "Nta masosiyete yanditswe na rimwe.",
      noPendingCompanies: "Nta masosiyete ategereje kugenzurwa ubu.",
      noApprovedCompanies: "Nta masosiyete yemejwe ubu.",
      noSuspendedCompanies: "Nta masosiyete yahagaritswe ubu.",
      clearFilters: "Kuraho Ibipimo",
      
      pending_badge: "Itegereje",
      approved_badge: "Yemewe",
      rejected_badge: "Yanzwe",
      suspended_badge: "Yahagaritswe",
      
      companiesCount: "amasosiyete",
    },

        companyDetails: {
      tin: "TIN",
      
      workers: "Abakozi",
      revenue: "Amafaranga yinjije",
      avgRating: "Amanota y'Urutonde",
      pending: "Bitegereje",
      
      companyInfo: "Amakuru ya Sosiyete",
      workers_tab: "Abakozi",
      requests: "Ibyifuzo",
      transactions: "Ubucuruzi",
      
      companyInformation: "Amakuru ya Sosiyete",
      ownerEmail: "Imeyili ya Nyir'ubwite",
      ownerPhone: "Telefone ya Nyir'ubwite",
      ownerName: "Izina rya Nyir'ubwite",
      location: "Aho iherereye",
      registrationDate: "Itariki y'iyandikwa",
      subscriptionFee: "Amafaranga yo kwiyandikisha",
      rejectionReason: "Impamvu yo kwangwa",
      suspensionReason: "Impamvu yo guhagarikwa",
      
      quickActions: "Ibikorwa Byihuse",
      approveCompany: "Emera Sosiyete",
      rejecting: "Irane...",
      approving: "Iremezwa...",
      rejectRegistration: "Hakana Iyandikwa",
      suspendCompany: "Hagarika Sosiyete",
      suspending: "Irahagarikwa...",
      
      worker: "Umukozi",
      experience: "Uburambe",
      status: "Imiterere",
      rating: "Amanota",
      employments: "Akazi",
      id: "ID",
      
      requestId: "ID y'Icyifuzo",
      employer: "Umukoresha",
      proposedSalary: "Umushahara Watanzwe",
      date: "Itariki",
      
      transactionId: "ID y'Ubucuruzi",
      type: "Ubwoko",
      amount: "Amafaranga",
      
      pending_badge: "itegereje",
      approved_badge: "yemejwe",
      rejected_badge: "yanzwe",
      suspended_badge: "yahagaritswe",
      active_badge: "igikora",
      hired_badge: "akoreshwa",
      available_badge: "ahari",
      completed_badge: "byuzuye",
      
      entry: "Incamake",
      intermediate: "Urugero",
      advanced: "Ubuhanga",
      expert: "Inzobere",
      
      approveTitle: "Emera Sosiyete",
      rejectTitle: "Hakana Sosiyete",
      suspendTitle: "Hagarika Sosiyete",
      approveDescription: "Wiboneye ko wemeza {companyName}?",
      rejectDescription: "Tanga impamvu yo kwanga {companyName}.",
      suspendDescription: "Tanga impamvu yo guhagarika {companyName}.",
      enterReason: "Andika impamvu...",
      cancel: "Reka",
      confirm: "Emeza",
      processing: "Irakorwa...",
      
      notAvailable: "N/A",
    },

        workerManagement: {
      title: "Gucunga Abakozi",
      subtitle: "Gucunga abakozi bose n'abikora biyandikishije",
      registerWorker: "Andika umukozi",
      
      totalWorkers: "Abakozi Bose",
      companyWorkers: "Abakozi ba Sosiyete",
      freelancers: "Abigenga",
      suspended: "Bahagaritswe",
      registered: "Byanditswe",
      available: "bahari",
      employed: "Bakoreshwa",
      currentlyHired: "bakoreshwa ubu",
      independent: "Bikora",
      readyToWork: "biteguye gukora",
      inactive: "Ntibakora",
      activeWorkers: "abakozi bagikora",
      
      worker: "Umukozi",
      contact: "Aho twandikira",
      location: "Aho atuye",
      type: "Ubwoko",
      rating: "Amanota",
      jobs: "Akazi",
      status: "Imiterere",
      actions: "Igikorwa",
      id: "ID",
      
      company: "Sosiyete",
      freelance: "Ukigenga",
      companyShort: "So",
      freelanceShort: "FL",
      
      available_badge: "Ahari",
      hired_badge: "Akoreshwa",
      unavailable_badge: "Ntahari",
      active_badge: "Agikora",
      suspended_badge: "Yahagaritswe",
      
      searchPlaceholder: "Shakisha ukoresheje izina, ID, cyangwa Indangamuntu...",
      typeFilter: "Ubwoko",
      statusFilter: "Imiterere",
      allTypes: "Ubwoko Bwose",
      allStatus: "Imiterere Yose",
      company_type: "Sosiyete",
      freelance_type: "Ukigenga",
      available_status: "Ahari",
      hired_status: "Akoreshwa",
      unavailable_status: "Ntahari",
      
      allWorkers: "Abakozi Bose",
      all: "Bose",
      available_tab: "Abahari",
      hired_tab: "Abakoreshwa",
      unavailable_tab: "Abatahari",
      
      noWorkersFound: "Nta Mukozi Wabonetse",
      noWorkersMatch: "Nta bakozi bahuye n'ibipimo byawe. Gerageza guhindura ibipimo byawe.",
      noWorkersRegistered: "Nta bakozi biyandikishije na rimwe.",
      noAvailableWorkers: "Nta bakozi bahari ubu.",
      noHiredWorkers: "Nta bakozi bakoreshwa ubu.",
      noUnavailableWorkers: "Nta bakozi batahuri ubu.",
      clearFilters: "Kuraho Ibipimo",
      
      workersCount: "abakozi",
      
      notAvailable: "N/A",
      
      pending_badge: "Itegereje",
      approved_badge: "Yemewe",
      rejected_badge: "Yanzwe",
      suspended_badge_text: "Yahagaritswe",
    },

        workerDetails: {
      workerId: "ID y'Umukozi",
      nationalId: "Indangamuntu",
      companyWorker: "Umukozi wa Sosiyete",
      freelancer: "Ukigenga",
      nidaVerified: "NIDA Yemeje",
      
      totalJobs: "Akazi Kose",
      avgRating: "Amanota y'Urutonde",
      earnings: "Amafaranga Yinjije",
      daysWorked: "Iminsi Yakoroye",
      
      workerInfo: "Amakuru y'Umukozi",
      employment: "Akazi",
      ratings: "Amanota",
      incidents: "Ibibazo",
      
      personalInformation: "Amakuru y'Umuntu",
      email: "Imeyili",
      phone: "Telefone",
      location: "Aho atuye",
      age: "Imyaka",
      years: "imyaka",
      experience: "Uburambe",
      registrationDate: "Itariki y'Iyandikwa",
      languagesSpoken: "Indimi Avuga",
      workTypePreferences: "Ubwoko bw'Akazi Akunda",
      
      insuranceInformation: "Amakuru y'Ubwishingizi",
      provider: "Utanga ubwishingizi",
      number: "Nimero",
      
      companyAffiliation: "Umubano na Sosiyete",
      tin: "TIN",
      
      currentlyEmployed: "Akora ubu",
      employer: "Umukoresha",
      salary: "Umushahara",
      started: "Yatangiye",
      
      quickActions: "Ibikorwa Byihuse",
      verifyNIDA: "Emeza NIDA",
      verifying: "Iremezwa...",
      suspendWorker: "Hagarika Umukozi",
      suspending: "Irahagarikwa...",
      reactivateWorker: "Ongera Ukore Umukozi",
      reactivating: "Irakorwa...",
      
      referees: "Abamushyigikiye",
      
      employerHeader: "Umukoresha",
      salaryHeader: "Umushahara",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      duration: "Igihe",
      statusHeader: "Imiterere",
      ongoing: "Irakomeje",
      days: "iminsi",
      
      ratingHeader: "Amanota",
      review: "Igitekerezo",
      date: "Itariki",
      
      type: "Ubwoko",
      description: "Ibisobanuro",
      severity: "Uburemere",
      
      available_badge: "Ahari",
      hired_badge: "Akoreshwa",
      unavailable_badge: "Ntahari",
      active_badge: "Agikora",
      suspended_badge: "Yahagaritswe",
      completed_badge: "Byarangiye",
      pending_badge: "Bitegereje",
      
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      entry: "Incamake",
      intermediate: "Urugero",
      advanced: "Ubuhanga",
      expert: "Inzobere",
      
      verifyTitle: "Emeza NIDA",
      suspendTitle: "Hagarika Umukozi",
      reactivateTitle: "Ongera Ukore Umukozi",
      verifyDescription: "Wiboneye ko wemeza NIDA kuri {workerName}?",
      suspendDescription: "Tanga impamvu yo guhagarika {workerName}.",
      reactivateDescription: "Wiboneye ko kongera gukoresha {workerName}?",
      enterSuspensionReason: "Andika impamvu yo guhagarika...",
      cancel: "Reka",
      confirm: "Emeza",
      processing: "Irakorwa...",
      
      notAvailable: "N/A",
    },

        incidentManagement: {
      title: "Gucunga Ibibazo",
      subtitle: "Gukurikirana no gucunga ibibazo byose ku rubuga",
      reportIncident: "Tangaza Ikibazo",
      
      reported: "Byatangajwe",
      investigating: "Buri kurondorwa",
      proofFiles: "Imigereka",
      addProofFiles: "Ongeraho imigereka",
      resolved: "Byakemutse",
      dismissed: "Byanze",
      escalated: "Byazamuwe",
      newIncidents: "Ibibazo bishya",
      inProgress: "Biri gukorwa",
      completed: "Byarangiye",
      closed: "Byafunzwe",
      priorityCases: "Ibibazo by'ibanze",
      criticalCases: "ibibazo bikomeye",
      highPriority: "ibanze ry'isonga",
      totalIncidents: "ibibazo byose",
      lowSeverity: "uburemere buke",
      mediumLevel: "urwego ruringaniye",
      
      incident: "Ikibazo",
      worker: "Umukozi",
      reportedBy: "Byatangajwe na",
      type: "Ubwoko",
      severity: "Uburemere",
      status: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      id: "ID",
      
      critical: "Bikomeye Cyane",
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      reported_status: "Byatangajwe",
      under_investigation: "Buri kurondorwa",
      resolved_status: "Byakemutse",
      dismissed_status: "Byanze",
      escalated_status: "Byazamuwe",
      
      theft: "Ubujura",
      violence: "Urugomo",
      negligence: "Kwirengagiza",
      breach_of_contract: "Kurenga ku masezerano",
      misconduct: "Ikosa ry'umwuga",
      other: "Ibindi",
      
      searchPlaceholder: "Shakisha ukoresheje ID y'ikibazo, izina ry'umukozi...",
      typeFilter: "Ubwoko",
      severityFilter: "Uburemere",
      allTypes: "Ubwoko Bwose",
      allSeverity: "Uburemere Bwose",
      
      allIncidents: "Ibibazo Byose",
      reported_tab: "Byatangajwe",
      investigating_tab: "Buri kurondorwa",
      resolved_tab: "Byakemutse",
      dismissed_tab: "Byanze",
      escalated_tab: "Byazamuwe",
      
      noIncidentsFound: "Nta Bibazo Byabonetse",
      noIncidentsMatch: "Nta bibazo bihuye n'ibipimo byawe. Gerageza guhindura ibipimo byawe.",
      noIncidentsReported: "Nta bibazo byatangajwe na rimwe.",
      noReportedIncidents: "Nta bibazo byatangajwe ubu.",
      noInvestigatingIncidents: "Nta bibazo biri kurondorwa.",
      noResolvedIncidents: "Nta bibazo byakemutse.",
      noDismissedIncidents: "Nta bibazo byanze.",
      noEscalatedIncidents: "Nta bibazo byazamuwe.",
      clearFilters: "Kuraho Ibipimo",
      
      incidentsCount: "ibibazo",
      notAvailable: "N/A",
    },

        incidentDetails: {
      incidentNumber: "Ikibazo #",
      severity: "Uburemere",
      level: "urwego",
      date: "Itariki",
      location: "Aho biri",
      status: "Imiterere",
      incidentDate: "itariki y'ikibazo",
      incidentSite: "ahantu habereye ikibazo",
      current: "ubu",
      
      addNotes: "Ongeraho Inyandiko",
      print: "Capa",
      resolve: "Kemura",
      escalate: "Zamura",
      dismiss: "Hagarika",
      assignOfficer: "Shinga Ofisiye",
      delete: "Siba",
      resolving: "Irakemurwa...",
      escalating: "Irazamurwa...",
      dismissing: "Irahagarikwa...",
      assigning: "Irashingwa...",
      deleting: "Irasibwa...",
      adding: "Irongerwaho...",
      
      overview: "Incamake",
      worker: "Umukozi",
      employer: "Umukoresha",
      timeline: "Igihe",
      
      incidentDetails: "Ibisobanuro by'Ikibazo",
      description: "Ibisobanuro",
      type: "Ubwoko",
      reportedDate: "Itariki yatangijweho",
      evidenceFiles: "Dosiye z'ibimenyetso",
      evidence: "Ibimenyetso",
      locationInformation: "Amakuru y'ahantu",
      incidentLocation: "Ahantu habereye ikibazo",
      notSpecified: "Ntibyagenwe",
      locationWhereIncidentOccurred: "Ahantu ikibazo cyabereye",
      assignedOfficer: "Ofisiye Washinzwe",
      policeNotes: "Inyandiko za Polisi",
      resolution: "Igisubizo",
      timeline2: "Igihe",
      reported: "Byatangajwe",
      resolved_status: "Byakemutse",
      
      workerId: "ID y'Umukozi",
      nationalId: "Indangamuntu",
      phone: "Telefone",
      gender: "Igitsina",
      email: "Imeyili",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      workerStatistics: "Imibare y'Umukozi",
      averageRating: "Amanota y'Urutonde",
      totalEmployments: "Akazi Kose",
      totalRatings: "Amanota Yose",
      totalIncidents: "Ibibazo Byose",
      companyInformation: "Amakuru ya Sosiyete",
      noWorkerInfo: "Nta makuru y'umukozi aboneka",
      
      employerId: "ID y'Umukoresha",
      phoneNumber: "Nimero ya Telefone",
      emailAddress: "Aderesi ya Imeyili",
      employerStatistics: "Imibare y'Umukoresha",
      activeWorkers: "Abakozi Bakora",
      totalWorkersHired: "Abakozi Bakozwe",
      incidentsReported: "Ibibazo Byatangajwe",
      noEmployerInfo: "Nta makuru y'Umukoresha aboneka",
      
      officer: "Ofisiye",
      noTimelineEvents: "Nta bibazo by'igihe biracyari",
      
      addInvestigationNotes: "Ongeraho Inyandiko z'iperereza",
      notesDescription: "Ongeraho inyandiko kuri iperereza ry'ikibazo #{incidentNumber}",
      notes: "Inyandiko",
      notesPlaceholder: "Andika inyandiko zawe z'iperereza hano...",
      cancel: "Reka",
      
      resolveTitle: "Kemura Ikibazo",
      dismissTitle: "Hagarika Ikibazo",
      escalateTitle: "Zamura Ikibazo",
      assignTitle: "Shinga Ofisiye",
      deleteTitle: "Siba Ikibazo",
      resolveDescription: "Tanga ibisobanuro ku gisubizo cy'ikibazo #{incidentNumber}.",
      dismissDescription: "Wiboneye ko uhagarika ikibazo #{incidentNumber}?",
      escalateDescription: "Wiboneye ko uzamura ikibazo #{incidentNumber}?",
      assignDescription: "Hitamo ofisiye wo gushinga ku kibazo #{incidentNumber}.",
      deleteDescription: "Iyi gikorwa ntigishobora guhindurwa. Wiboneye ko usiba ikibazo #{incidentNumber}?",
      selectOfficer: "Hitamo Ofisiye",
      selectOfficerPlaceholder: "Hitamo ofisiye",
      resolutionDetails: "Ibisobanuro ku gisubizo",
      escalationNotes: "Inyandiko zo kuzamura",
      resolutionPlaceholder: "Andika ibisobanuro ku gisubizo...",
      escalationPlaceholder: "Andika inyandiko zo kuzamura...",
      
      resolvedSuccess: "Ikibazo cyakemutse neza",
      dismissedSuccess: "Ikibazo cyahagaritswe neza",
      escalatedSuccess: "Ikibaho cyazamuwe neza",
      assignedSuccess: "Ofisiye yashinzwe neza",
      deletedSuccess: "Ikibazo cyasibwe neza",
      notesAddedSuccess: "Inyandiko zongeweho neza",
      
      enterNotes: "Nyamuneka andika inyandiko",
      
      critical: "BIKOMEYE CYANE",
      high: "BIKOMEYE",
      medium: "BURINGANIYE",
      low: "BUKE",
      
      reported_status: "BYATANGAJWE",
      under_investigation: "BIRI KURONDORWA",
      resolved_status_badge: "BYAKEMUTSE",
      dismissed_status: "BYANZWE",
      escalated_status: "BYAZAMUWE",
      
      male: "Gabo",
      female: "Gore",
      other: "Ibindi",
      
      notAvailable: "N/A",
      
      processing: "Irakorwa...",
    },

        createIncident: {
      title: "Tangaza Ikibazo Gishya",
      subtitle: "Kora raporo y'ikibazo gishya",
      
      selectWorker: "Hitamo Umukozi *",
      changeWorker: "Hindura Umukozi",
      filterByCompany: "Shungura ukoresheje Sosiyete",
      searchCompanyPlaceholder: "Shakisha ukoresheje izina rya sosiyete, TIN, cyangwa ID...",
      browseCompanies: "Reba Amasosiyete",
      hideCompanies: "Hisha Amasosiyete",
      companiesCount: "amasosiyete",
      loadingCompanies: "Birajya bipakurura amasosiyete...",
      noCompaniesFound: "Nta masosiyete yabonetse",
      tryAdjustingSearch: "Gerageza guhindura ibyo ushaka",
      workersCount: "abakozi",
      
      allWorkers: "Abakozi Bose",
      availableWorkers: "Abahari",
      companyWorkers: "Abakozi ba Sosiyete",
      selectCompanyFirst: "Hitamo Sosiyete",
      
      searchWorkerPlaceholder: "Shakisha ukoresheje izina, ID, cyangwa Indangamuntu...",
      workerType: "Ubwoko bw'Umukozi",
      allTypes: "Ubwoko Bwose",
      company: "Sosiyete",
      freelance: "Ukigenga",
      loadingWorkers: "Birajya bipakurura abakozi...",
      noWorkersFound: "Nta bakozi babonetse",
      noWorkersInCompany: "Iyi sosiyete ntiyanditse abakozi",
      tryAdjustingSearchOrFilters: "Gerageza guhindura ibyo ushaka cyangwa ibipimo",
      
      id: "ID",
      
      incidentDetails: "Ibisobanuro by'Ikibazo",
      incidentType: "Ubwoko bw'Ikibazo *",
      selectType: "Hitamo ubwoko...",
      severity: "Uburemere *",
      selectSeverity: "Hitamo uburemere...",
      incidentDate: "Itariki y'Ikibazo *",
      
      theft: "Ubujura",
      violence: "Urugomo",
      negligence: "Kwirengagiza",
      breach_of_contract: "Kurenga ku masezerano",
      misconduct: "Ikosa ry'umwuga",
      other: "Ibindi",
      
      low: "Buke",
      medium: "Buringaniye",
      high: "Bikomeye",
      critical: "Bikomeye Cyane",
      
      location: "Ahantu",
      fullLocation: "Ahantu hose:",
      province: "Intara *",
      selectProvince: "Hitamo intara...",
      district: "Akarere *",
      selectDistrict: "Hitamo akarere...",
      sector: "Umurenge *",
      selectSector: "Hitamo umurenge...",
      cell: "Akagari *",
      selectCell: "Hitamo akagari...",
      village: "Umudugudu *",
      selectVillage: "Hitamo umudugudu...",
      
      description: "Ibisobanuro *",
      descriptionPlaceholder: "Tanga ibisobanuro birambuye ku kibazo… Koresha imitwe, uturongo, n'ibindi kugirango utunganye raporo yawe.",
      
      cancel: "Reka",
      create: "Tangaza Ikibazo",
      creating: "Biratangazwa...",
      
      selectAllLocationFields: "Nyamuneka hitamo ahantu hose (Intara, Akarere, Umurenge, Akagari, n'Umudugudu)",
      
      available: "Ahari",
      hired: "Akoreshwa",
      unavailable: "Ntahari",
      pending: "Itegereje",
      approved: "Yemewe",
      suspended: "Yahagaritswe",
    },

        transactionManagement: {
      title: "Gucunga Ubucuruzi",
      subtitle: "Gukurikirana no gucunga ubucuruzi bwose muri sisitemu",
      export: "Ohereza",
      exporting: "Irohereza...",
      
      totalRevenue: "Amafaranga Yose Yinjije",
      todayRevenue: "Amafaranga Y'uyu munsi",
      pendingAmount: "Amafaranga Ategereje",
      failedAmount: "Amafaranga Yananiwe",
      totalTransactions: "Ubucuruzi Bwose",
      allTime: "Igihe cyose",
      hours24: "Amasaha 24",
      today: "uyu munsi",
      awaiting: "Arategereje",
      inQueue: "murupuru",
      unsuccessful: "Ntibyagenze",
      failed: "byananiranye",
      processed: "Byakozwe",
      thisMonth: "uku kwezi",
      
      transactionId: "ID y'Ubucuruzi",
      user: "Umukoresha",
      type: "Ubwoko",
      amount: "Amafaranga",
      method: "Uburyo",
      status: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      ref: "Ref",
      unknown: "Ntumenyekana",
      noEmail: "Nta imeyili",
      
      employer_registration: "Iyandikwa ry'Umukoresha",
      worker_registration: "Iyandikwa ry'Umukozi",
      refund: "Kugarura Amafaranga",
      service_fee: "Amafaranga ya Serivisi",
      subscription: "Kwiyandikisha",
      
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      card: "Karita",
      cash: "Amafaranga y'imbonera",
      allMethods: "Uburyo Bwose",
      
      completed: "Bwuzuye",
      pending: "Burategereje",
      failed_status: "Bwananiwe",
      review: "Bugenzurwa",
      refunded: "Byagarutse",
      
      filters: "Ishungura",
      activeFilters: "bikora",
      clearAll: "Kuraho Byose",
      searchPlaceholder: "Shakisha ukoresheje ID, reference, izina...",
      typeFilter: "Ubwoko",
      paymentMethod: "Uburyo bwo Kwishyura",
      allTypes: "Ubwoko Bwose",
      allMethods2: "Uburyo Bwose",
      
      allTransactions: "Ubucuruzi Bwose",
      completed_tab: "Bwuzuye",
      pending_tab: "Burategereje",
      failed_tab: "Bwananiwe",
      review_tab: "Bugenzurwa",
      refunded_tab: "Byagarutse",
      
      noTransactionsFound: "Nta Bucuruzi Bwabonetse",
      noTransactionsMatch: "Nta bucuruzi buhuye n'ibipimo byawe. Gerageza guhindura ibipimo byawe.",
      noTransactionsRecorded: "Nta bucuruzi bwakozwe na rimwe.",
      noCompletedTransactions: "Nta bucuruzi bwuzuye.",
      noPendingTransactions: "Nta bucuruzi butegereje.",
      noFailedTransactions: "Nta bucuruzi bwananiwe.",
      noReviewTransactions: "Nta bucuruzi bugenzurwa.",
      noRefundedTransactions: "Nta bucuruzi bwagarutse.",
      clearFilters: "Kuraho Ibipimo",
      
      issueRefund: "Garagaza Amafaranga",
      refundConfirmation: "Wiboneye ko ugargura {amount} kuri {user}?",
      refundWarning: "Iyi gikorwa ntigishobora guhindurwa. Amafaranga azagarurwa ako kanya.",
      cancel: "Reka",
      confirmRefund: "Emeza Kugarura",
      
      exportTransactions: "Ohereza Ubucuruzi",
      exportDescription: "Hitamo uburyo bwo kohereza ubucuruzi",
      exportFormat: "Uburyo bwo Kohereza",
      csv: "CSV (Comma Separated Values)",
      excel: "Excel (.xlsx)",
      exportInfo: "Ibyo wishunguye bizakurikizwa mu bucuruzi bukoherezwa.",
      dateRangeInfo: "Igihe uzatoranya kizakurikizwa.",
      
      refundInitiated: "Kugarura amafaranga byatangiye",
      refundDescription: "Kugarura amafaranga ya {amount} byatangiye",
      
      statusGreen: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      statusYellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      statusRed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
      statusOrange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      statusPurple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
      statusGray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
      
      transactionsCount: "ubucuruzi",
    },

        transactionDetails: {
      title: "Ibisobanuro by'Ubucuruzi",
      transactionId: "ID: {id} | Reference: {reference}",
      noReference: "N/A",
      
      amount: "Amafaranga",
      date: "Itariki",
      time: "Igihe",
      transactionIdLabel: "ID y'Ubucuruzi",
      
      transactionInfo: "Amakuru y'Ubucuruzi",
      userDetails: "Amakuru y'Umukoresha",
      
      transactionInformation: "Amakuru y'Ubucuruzi",
      transactionType: "Ubwoko bw'Ubucuruzi",
      paymentMethod: "Uburyo bwo Kwishyura",
      status: "Imiterere",
      createdDate: "Itariki yakozweho",
      updatedDate: "Itariki yavugururiweho",
      description: "Ibisobanuro",
      failureReason: "Impamvu y'ubusiba",
      additionalData: "Amakuru Yiyongera",
      
      payerInformation: "Amakuru y'Uwishyuye",
      company: "Sosiyete",
      employer: "Umukoresha",
      user: "Umukoresha",
      userId: "ID y'Umukoresha",
      tin: "TIN",
      relatedWorker: "Umukozi Ufitiye Isano",
      
      phoneNumber: "Nimero ya Telefone",
      accountStatus: "Imiterere ya Konti",
      noUserInfo: "Nta makuru y'umukoresha aboneka",
      
      transactionActions: "Ibikorwa ku Bucuruzi",
      markForReview: "Shyira ku Rutonde rwo Gukurikirwa",
      marking: "Iri gushyirwa...",
      issueRefund: "Garagura Amafaranga",
      processing: "Irakorwa...",
      transactionPending: "Ubucuruzi burategereje",
      pendingMessage: "Nta gikorwa kigishoboka kugeza ubucuruzi buri bumeze neza",
      noActionsAvailable: "Nta gikorwa kigishoboka kuri ubu bucuruzi",
      
      markForReviewTitle: "Shyira ku Rutonde rwo Gukurikirwa",
      issueRefundTitle: "Garagura Amafaranga",
      reviewDescription: "Tanga ibisobanuro byo gukurikirana ku bucuruzi {id}.",
      refundDescription: "Wiboneye ko ugargura {amount} kuri {user}?",
      reviewNotesPlaceholder: "Andika ibisobanuro byo gukurikirana...",
      refundWarning: "Iyi gikorwa ntigishobora guhindurwa. Amafaranga azagarurwa ako kanya.",
      cancel: "Reka",
      confirm: "Emeza",
      processing2: "Irakorwa...",
      
      statusGreen: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400",
      statusYellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
      statusRed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400",
      statusOrange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
      statusPurple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
      statusGray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-400",
      
      notAvailable: "N/A",
    },

        userManagement: {
      title: "Gucunga Abakoresha",
      subtitle: "Gucunga no gukurikirana abakoresha bose muri sisitemu",
      addNewUser: "Ongeraho Umukoresha Mushya",
      
      totalUsers: "Abakoresha Bose",
      activeUsers: "Abakoresha Bagikora",
      pendingReview: "Bategereje Gusuzumwa",
      suspended: "Bahagaritswe",
      registered: "Byanditswe",
      online: "Bari kumurongo",
      awaiting: "Bategereje",
      needReview: "yasuzumwe",
      inactive: "Ntibakora",
      suspended_users: "bahagaritswe",
      thisWeek: "iki cyumweru",
      activeNow: "bagikora ubu",
      
      user: "Umukoresha",
      contact: "Aho twandikira",
      role: "Uruhare",
      status: "Imiterere",
      verified: "Yemejwe",
      location: "Aho atuye",
      actions: "Igikorwa",
      id: "ID",
      
      active: "Agikora",
      pending: "Itegereje",
      suspended_badge: "Yahagaritswe",
      inactive_badge: "Ntakora",
      
      admin: "Admin",
      supervisor: "Umuyobozi",
      company: "Sosiyete",
      employer: "Umukoresha",
      worker: "Umukozi",
      police: "Polisi",
      
      searchPlaceholder: "Shakisha ukoresheje izina, imeyili, telefone, cyangwa ID...",
      roleFilter: "Uruhare",
      statusFilter: "Imiterere",
      allRoles: "Uruhare Rwose",
      allStatus: "Imiterere Yose",
      
      allUsers: "Abakoresha Bose",
      admins: "Abayobozi",
      companies: "Amasosiyete",
      employers: "Abashyira Akazi",
      workers: "Abakozi",
      police_tab: "Polisi",
      active_tab: "Abagikora",
      pending_tab: "Abategereje",
      suspended_tab: "Abahagaritswe",
      
      noUsersFound: "Nta Mukoresha Wabonetse",
      noUsersMatch: "Nta bakoresha bahuye n'ibipimo byawe. Gerageza guhindura ibipimo byawe.",
      noUsersRegistered: "Nta bakoresha biyandikishije na rimwe.",
      clearFilters: "Kuraho Ibipimo",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      users: "abakoresha",
      perPage: "ku ipaji",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      verified_yes: "Yemejwe",
      verified_no: "Ntiyemejwe",
      notAvailable: "N/A",
      
      usersCount: "abakoresha",
    },

        createUser: {
      title: "Kora Umukoresha Mushya",
      subtitle: "Ongeraho umukoresha mushya muri sisitemu",
      subtitleWithRole: "Ongeraho {role} mushya muri sisitemu",
      selectRole: "Hitamo Uruhare rw'Umukoresha *",
      
      admin: "Admin",
      supervisor: "Umuyobozi",
      company: "Sosiyete",
      employer: "Umukoresha",
      worker: "Umukozi",
      police: "Polisi",
      
      basicInformation: "Amakuru y'Ingenzi",
      addressLocation: "Aho Atuye n'Ahantu",
      
    available: "Bahari",
    hired: "Bafite akazi",
    completed : "Barangije akazi",

      workerPersonalInfo: "Amakuru y'Umukozi",
      workPreferences: "Ibyo Akunda mu Kazi",
      insuranceInformation: "Amakuru y'Ubwishingizi",
      
      companyInformation: "Amakuru ya Sosiyete",
      ownerInformation: "Amakuru ya Nyir'ubwite",
      
      fullName: "Izina Ryuzuye",
      fullNamePlaceholder: "Andika izina ryuzuye",
      emailAddress: "Aderesi ya Imeyili",
      emailPlaceholder: "umukoresha@example.com",
      phoneNumber: "Nimero ya Telefone",
      phonePlaceholder: "078XXXXXXX",
      nationalId: "Indangamuntu",
      nationalIdPlaceholder: "Shyiramo nomero y'indangamuntu",
      gender: "Igitsina",
      selectGender: "Hitamo igitsina",
      dateOfBirth: "Itariki y'Amavuko",
      password: "Ijambo ryibanga",
      passwordPlaceholder: "Andika ijambo ryibanga",
      confirmPassword: "Emeza Ijambo ryibanga",
      confirmPasswordPlaceholder: "Emeza ijambo ryibanga",
      accountStatus: "Imiterere ya Konti",
      selectStatus: "Hitamo imiterere",
      
      male: "Gabo",
      female: "Gore",
      
      active: "Agikora",
      pending: "Itegereje",
      inactive: "Ntakora",
      
      firstName: "Izina",
      firstNamePlaceholder: "Ekaze",
      lastName: "Iry'umuryango",
      lastNamePlaceholder: "Jean",
      workerEmailPlaceholder: "umukozi@example.com",
      experienceLevel: "Urwego rw'Uburambe",
      languagesSpoken: "Indimi Avuga",
      workTypes: "Ubwoko bw'Akazi",
      preferredWorkDistricts: "Uturere Akunda gukorera",
      selectAllDistricts: "Hitamo Uturere twose",
      searchDistrictsPlaceholder: "Shakisha uhitemo uturere...",
      minSalary: "Umushahara muto (RWF)",
      minSalaryPlaceholder: "50000",
      maxSalary: "Umushahara Munini (RWF)",
      maxSalaryPlaceholder: "100000",
      
      beginner: "Incamake",
      intermediate: "Urugero (Imyaka 1-3)",
      expert: "Inzobere (Imyaka 3+)",
      
      kinyarwanda: "Ikinyarwanda",
      english: "Icyongereza",
      french: "Igifaransa",
      swahili: "Igiswahili",
      
      full_time: "Igihe Cyuzuye",
      part_time: "Igice cy'Igihe",
      contract: "Amasezerano",
      temporary: "Igihe gito",
      
      hasInsurance: "Umukozi afite ubwishingizi",
      insuranceProvider: "Utanga ubwishingizi",
      insuranceProviderPlaceholder: "SONARWA",
      insuranceNumber: "Nimero y'Ubwishingizi",
      insuranceNumberPlaceholder: "INS123456",
      
      businessName: "Izina ry'Ubucuruzi",
      businessNamePlaceholder: "ABC Company Ltd",
      tin: "TIN (Nimero yo kwishyura imisoro)",
      tinPlaceholder: "123456789",
      physicalAddress: "Aderesi",
      physicalAddressPlaceholder: "KG 123 St, Kigali",
      companyLogo: "Ikirangantego cya Sosiyete",
      logoUploadHint: "Shyiramo ikirangantego cya sosiyete (JPEG, PNG, JPG - Max 2MB)",
      subscriptionFee: "Amafaranga yo Kwiyandikisha buri kwezi (RWF)",
      subscriptionFeeHint: "Amafaranga asanzwe yo kwiyandikisha kuri konti za sosiyete",
      ownerFullName: "Izina ry'Nyir'ubwite",
      ownerFullNamePlaceholder: "John Doe",
      ownerPhone: "Telefone ya Nyir'ubwite",
      ownerPhonePlaceholder: "0781234567",
      ownerEmail: "Imeyili ya Nyir'ubwite",
      ownerEmailPlaceholder: "nyirubwite@company.com",
      
      fullAddress: "Aderesi yuzuye",
      addressPlaceholder: "Umuhanda, numero, n'ibindi...",
      province: "Intara",
      selectProvince: "Hitamo intara...",
      district: "Akarere",
      selectDistrict: "Hitamo akarere...",
      sector: "Umurenge",
      selectSector: "Hitamo umurenge...",
      cell: "Akagari",
      selectCell: "Hitamo akagari...",
      village: "Umudugudu",
      selectVillage: "Hitamo umudugudu...",
      
      locationInfo: "Amakuru y'Ahantu",
      locationHint: "Guhitamo ahantu ntibishimusiye ariko biratewe inkunga kugirango umukoresha amenye neza.",
      
      selectRoleTitle: "Hitamo Uruhare rw'Umukoresha",
      selectRoleMessage: "Hitamo uruhare mu matora ari hejuru kugirango ukomeze kurema umukoresha. Uruhare rutandukanye rusaba ibintu bitandukanye.",
      
      cancel: "Reka",
      createUser: "Kora Umukoresha",
      creating: "Irakorwa...",
      
      validationError: "Ikosa mu kugenzura",
      fillCompanyRequired: "Nyamuneka uzuza ibisabwa byose kuri sosiyete",
      ownerPasswordsDoNotMatch: "Ijambo ryibanga rya nyir'ubwite ntirihuriye",
      passwordMinLength: "Ijambo ryibanga rigomba kuba byibura 8 inyuguti",
      fillWorkerRequired: "Nyamuneka uzuza ibisabwa byose kuri umukozi",
      workerPasswordsDoNotMatch: "Ijambo ryibanga ry'umukozi ntirihuriye",
      passwordsDoNotMatch: "Ijambo ryibanga ntirihuriye",
      
      userCreated: "{role} yakozwe neza",
      
      required: "*",
    },

        userDetails: {
      verified: "Yemejwe",
      
      transactions: "Ubucuruzi",
      totalCount: "umubare wose",
      workers: "Abakozi",
      totalWorkers: "abakozi bose",
      rating: "Amanota",
      averageRating: "amanota y'urutonde",
      incidents: "Ibibazo",
      assigned: "yahawe",
      joined: "Yinjiye",
      memberSince: "umunsi yinjiye",
      
      userInfo: "Amakuru y'Umukoresha",
      activity: "Ibikorwa",
      actions: "Ibikorwa",
      
      personalInformation: "Amakuru y'Umuntu",
      email: "Imeyili",
      phone: "Telefone",
      nationalId: "Indangamuntu",
      gender: "Igitsina",
      dateOfBirth: "Itariki y'Amavuko",
      district: "Akarere",
      fullAddress: "Aderesi yuzuye",
      
      accountInformation: "Amakuru ya Konti",
      verifiedAt: "Yemejwe ku",
      lastLogin: "Injira kwa nyuma",
      lastIp: "IP ya nyuma",
      registered: "Yanditswe",
      
      companyStatistics: "Imibare ya Sosiyete",
      activeWorkers: "Abakozi Bagikora",
      totalRequests: "Ibyifuzo Byose",
      pendingRequests: "Ibyifuzo Bitegereje",
      
      workerStatistics: "Imibare y'Umukozi",
      totalJobs: "Akazi Kose",
      completedJobs: "Akazi Karangiye",
      totalIncidents: "Ibibazo Byose",
      
      employerStatistics: "Imibare y'Umukoresha",
      totalEmployments: "Akazi Kose",
      activeEmployments: "Akazi Gakora",
      
      policeStatistics: "Imibare ya Polisi",
      assignedIncidents: "Ibibazo Yahawe",
      resolvedIncidents: "Byakemutse",
      pendingIncidents: "Bitegereje",
      
      accountTimeline: "Igihe cya Konti",
      accountCreated: "Konti Yaremwe",
      verified2: "Yemejwe",
      lastActive: "Igihe cya nyuma",
      
      noActivityLogs: "Nta Ibikorwa Byabonetse",
      noActivityMessage: "Nta bikorwa byanditswe kuri uyu mukoresha.",
      action: "Igikorwa",
      details: "Ibisobanuro",
      ipAddress: "Aderesi ya IP",
      dateTime: "Itariki n'Igihe",
      
      userActions: "Ibikorwa ku Mukoresha",
      editUser: "Hindura Umukoresha",
      activateUser: "Koresha Umukoresha",
      activating: "Irakoreshwa...",
      suspendUser: "Hagarika Umukoresha",
      suspending: "Irahagarikwa...",
      reactivateUser: "Ongera Ukoreshe Umukoresha",
      reactivating: "Irakoreshwa...",
      verifyUser: "Emeza Umukoresha",
      verifying: "Iremezwa...",
      resetPassword: "Hindura Ijambo ryibanga",
      resetting: "Irahindurwa...",
      verifyOtp: "Emeza OTP",
      verifyingOtp: "Iremezwa...",
      resetOtpBlock: "Hagarura OTP",
      resettingOtpBlock: "Iragarurwa...",
      
      
      activateTitle: "Koresha Umukoresha",
      suspendTitle: "Hagarika Umukoresha",
      verifyTitle: "Emeza Umukoresha",
      resetPasswordTitle: "Hindura Ijambo ryibanga",
      verifyOtpTitle: "Emeza OTP",
      resetOtpBlockTitle: "Hagarura OTP",
      activateDescription: "Wiboneye ko ukoresha {userName}?",
      suspendDescription: "Tanga impamvu yo guhagarika {userName}.",
      verifyDescription: "Wiboneye ko wemeza {userName}?",
      resetPasswordDescription: "Andika ijambo ryibanga rishya rya {userName}.",
      verifyOtpDescription: "Wiboneye ko wemeza OTP ya {userName} ku buryo bw'ikoreshwa? Ibi bizerekana ko konti yabo yemejwe.",
      resetOtpBlockDescription: "Wiboneye ko uhagarura OTP ya {userName}? Ibi bizatuma bashobora gusaba OTP bundi bushya.",
      suspensionReason: "Impamvu yo guhagarika",
      suspensionReasonPlaceholder: "Andika impamvu yo guhagarika...",
      newPassword: "Ijambo ryibanga rishya",
      newPasswordPlaceholder: "Andika ijambo ryibanga rishya...",
      confirmPassword: "Emeza Ijambo ryibanga",
      confirmPasswordPlaceholder: "Emeza ijambo ryibanga rishya...",
      passwordsDoNotMatch: "Ijambo ryibanga ntirihuriye",
      cancel: "Reka",
      processing: "Irakorwa...",
      activate: "Koresha",
      suspend: "Hagarika",
      verify: "Emeza",
      reset: "Hindura Ijambo ryibanga",
      verifyOtpButton: "Emeza OTP",
      resetBlockButton: "Hagarura OTP",
      
      male: "Gabo",
      female: "Gore",
      
      notAvailable: "N/A",
    },

        platformAnalytics: {
      title: "Isesengura ry'Urubuga",
      subtitle: "Genzura imikorere n'imikurire y'urubuga",
      
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      lastYear: "Umwaka Ushize",
      
      totalRevenue: "Amafaranga Yose Yinjije",
      totalUsers: "Abakoresha Bose",
      activeCompanies: "Amasosiyete Agikora",
      openIncidents: "Ibibazo Bifunguye",
      allTime: "Igihe Cyose",
      registered: "Byanditswe",
      operating: "Akora",
      active: "Agikora",
      vsLastPeriod: "ugereranyije n'igihe gishize",
      
      revenueOverview: "Incamake y'Amafaranga Yinjije",
      userDistribution: "Ikwirakwizwa ry'Abakoresha",
      registrationTrends: "Imikurire y'Iyandikwa",
      incidentTracking: "Gukurikirana Ibibazo",
      topCompanies: "Amasosiyete Akora Neza",
      
      employers: "Abashyira Akazi",
      workers: "Abakozi",
      companies: "Amasosiyete",
      incidents: "Ibibazo",
      resolved: "Byakemutse",
      
      registeredWorkers: "abakozi biyandikishije",
      totalRevenueLabel: "Amafaranga yose yinjije",
      
      noDataAvailable: "Nta makuru aboneka",
      
      workersCount: "abakozi",
    },

        settingsManagement: {
      title: "Igenamiterere",
      subtitle: "Gucunga umwirondoro wawe n'ibinyejana bya sisitemu",
      
      profile: "Umwirondoro",
      security: "Umutekano",
      payment: "Kwishyura",
      api: "API",
      
      profilePhoto: "Ifoto y'Umwirondoro",
      uploadPhoto: "Shyiramo Ifoto",
      uploading: "Irakoherezwa...",
      removePhoto: "Kuraho",
      removing: "Irakuweho...",
      photoHint: "JPG, PNG. Max size 2MB",
      previewHint: "Preview - Kanda gufata kubika",
      
      fullName: "Izina Ryuzuye",
      email: "Imeyili",
      phoneNumber: "Nimero ya Telefone",
      gender: "Igitsina",
      selectGender: "Hitamo igitsina",
      male: "Gabo",
      female: "Gore",
      dateOfBirth: "Itariki y'Amavuko",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      address: "Aho utuye",
      
      saveChanges: "Bika Ibyahinduwe",
      saving: "Irabikwa...",
      
      passwordRequirements: "Ibyo Ijambo ryibanga rigomba kuba birimo",
      passwordHint: "Rigomba kubyibura 8 mu nyuguti zirimo: inyuguti nkuru, nto, imibare, n'ibimenyetso",
      currentPassword: "Ijambo ryibanga Riracyari",
      newPassword: "Ijambo ryibanga Rishya",
      confirmNewPassword: "Emeza Ijambo ryibanga Rishya",
      updatePassword: "Hindura Ijambo ryibanga",
      updating: "Irahindurwa...",
      
      companyRegistration: "Iyandikwa rya Sosiyete",
      workerRegistration: "Iyandikwa ry'Umukozi",
      employerRegistration: "Iyandikwa ry'Umukoresha",
      registrationFee: "Amafaranga yo Kwiyandikisha (RWF)",
      enablePayment: "Emera Kwishyura",
      savePaymentSettings: "Bika Igenamiterere ry'Ishyura",
      
      apiCredentialsHint: "Amakuru ya API yarakozwe kode kandi abikwa mu mutekano. Ntuzigere usangiza imfunguzo za API.",
      mobileMoneyApi: "Mobile Money API (MoMo)",
      nidaApi: "NIDA API",
      smsApi: "SMS API",
      apiKey: "Urufunguzo rwa API",
      apiSecret: "Ibanga rya API",
      endpointUrl: "Aderesi ya Endpoint",
      senderId: "ID yo Koherereza",
      saveConfig: "Bika Igenamiterere rya {name}",
      savingConfig: "Irabikwa...",
      
      apiKeyPlaceholder: "Shyiramo Urufunguzo rwa API ya {name}",
      apiSecretPlaceholder: "Shyiramo Ibanga rya API ya {name}",
      endpointPlaceholder: "Shyiramo Aderesi ya Endpoint ya {name}",
      senderIdPlaceholder: "Shyiramo ID yo Koherereza SMS",
      
      profileUpdated: "Umwirondoro wahinduwe neza",
      passwordUpdated: "Ijambo ryibanga ryahinduwe neza",
      paymentSettingsUpdated: "Igenamiterere ry'ishyura ryahinduwe neza",
      apiConfigUpdated: "Igenamiterere rya API ryahinduwe neza",
      photoUploaded: "Ifoto yashyizweho neza",
      photoRemoved: "Ifoto yakuweho neza",
      
      passwordMismatch: "Ijambo ryibanga ntirihuriye",
      requiredField: "Iki gice giragombwa",
    },





  },


  // =====================================================================ADMIN==================================================



//   ======================================================================= EMPLOYER ==================================================


employer: {
  
  employerSidebar: {
    role:        "Umukoresha",
    changePhoto: "Hindura ifoto y'umwirondoro",
    loadError:   "Ntibishoboye gupakurura amakuru",
    currency:    "RWF yishyuwe",
    days:        "iminsi",
    oneMonth:    "ukwezi 1",
    months:      "amezi",
    ongoing:     "Bikomeje",
  },

  



  employerHeader: {
  defaultName:  "Umukoresha",
  roleLabel:    "Umukoresha",
  navigation:   "Uburyo bwo Kugenda",
  notifications: {
    system:              "Sisitemu",
    newLabel:            "Rishya",
    emptyTitle:          "Nta mamenyesha",
    noNotifications:     "Nta mamenyesha ufite ubu.",
    noUnread:            "Nta mamenyesha adasomwe ufite.",
    noRead:              "Nta mamenyesha asomwe ufite.",
    badgeAlert:          "IMPURUZA",
    badgePayment:        "UBWISHYU",
    badgeSystem:         "SISITEMU",
    badgeNew:            "RISHYA",
    badgeRequest:        "ICYIFUZO",
    badgeWorker:         "UMUKOZI",
    badgeApproved:       "YEMEWE",
    badgeRejected:       "YANZWE",
    badgeInfo:           "AMAKURU",
    statsTotal:          "Yose",
    statsUnread:         "Adasomwe",
    statsRead:           "Asomwe",
    statsTypes:          "Ubwoko",
    tabAll:              "Yose",
    tabUnread:           "Adasomwe",
    tabRead:             "Asomwe",
    filterPlaceholder:   "Shungura ubwoko",
    filterAll:           "Ubwoko Bwose",
    filterIncidents:     "Ibibazo",
    filterPayments:      "Ubwishyu",
    filterSystem:        "Sisitemu",
    filterHiringRequests:"Ibyifuzo by'Akazi",
    filterWorkers:       "Abakozi",
    filterApproved:      "Byemewe",
    filterRejected:      "Byanzwe",
  },
},

    employerStats: {
      title: "Dashibodi y'Umukoresha",
      subtitle: "Genzura abakozi bawe no gukurikirana amateka y'akazi",
      
      allTime: "Igihe Cyose",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      timePeriod: "Igihe:",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      clear: "Kuraho",
      clearAllFilters: "Kuraho Ibyunguruzo Byose",
      showingDataFrom: "Erekana amakuru kuva",

      selectPeriod: "Hitamo Igihe",
      
      workerStatus: "Imiterere y'Umukozi",
      allWorkers: "Abakozi Bose",
      activeOnly: "Abakora Gusa",
      completed: "Barangiye",
      terminated: "Bakuyemo",
      
      paymentStatus: "Imiterere y'Ubwishyu",
      allPayments: "Ubwishyu Bwose",
      pending: "Bitegereje",
      completed_status: "Bwuzuye",
      failed: "Bwananiwe",
      
      incidentSeverity: "Uburemere bw'Ikibazo",
      allIncidents: "Ibibazo Byose",
      critical: "Bikomeye Cyane",
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      sortBy: "Hitamo Uburyo",
      mostRecent: "Biheruka",
      oldestFirst: "Ibyabanje",
      workerName: "Izina ry'Umukozi",
      paymentAmount: "Amafaranga y'Ubwishyu",
      
      searchPlaceholder: "Shakisha abakozi, ibibazo, cyangwa ubwishyu...",
      
      export: "Ohereza",
      
      activeWorkers: "Abakozi Bagikora",
      currentlyHired: "bakoreshwa ubu",
      totalHired: "Bakozwe Bose",
      allTimeHired: "igihe cyose",
      terminated_workers: "bakuyemo",
      monthlySpending: "Amafaranga y'Ukwezi",
      vsLastMonth: "ugereranyije n'ukwezi gushize",
      incidents: "Ibibazo",
      resolved: "byakemutse",
      underControl: "bigenzuwe",
      fromTotal: "muri byose",
      
      secondaryStats: "Imibare Yiyongera",
      avgEmployment: "Urugero rw'Akazi",
      days: "iminsi",
      successRate: "Igipimo cy'intsinzi",
      totalSpent: "Amafaranga Yakoreshejwe",
      pendingPayments: "Ubwishyu Butegereje",
      

        overview: "Incamake",
        active: "Abagikora",
        history: "Amateka",

      
      quickSummary: "Incamake Yihuse",
      activeNow: "Bagikora ubu",
      workers: "abakozi",
      thisMonthSpent: "Uku Kwezi",
      spent: "RWF yakoreshejwe",
      success: "Intsinzi",
      rate: "igipimo",
      
      upcomingPayments: "Ubwishyu Butaha",
      due: "Igihe",
      amount: "RWF",
      noUpcomingPayments: "Nta bwishyu butaha",
      
      activeWorkersTitle: "Abakozi Bagikora",
      id: "ID",
      name: "Izina",
      type: "Ubwoko",
      status: "Imiterere",
      duration: "Igihe",
      noActiveWorkers: "Nta bakozi bagikora",
      
      employmentHistory: "Amateka y'Akazi",
      ended: "Yarangiye",
      noEmploymentHistory: "Nta mateka y'akazi",
      
      workerId: "W{id}",
      
      loadError: "Ntibishoboye gupakurura amakuru ya dashibodi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      workersCount: "abakozi",
      paymentsCount: "ubwishyu",
    },



      workerSearch: {
    title: "Gushaka Abakozi",
    subtitle: "Shakisha uhingure abakozi bafite ubumenyi",
    
    period: "Igihe:",
    allTime: "Igihe Cyose",
    last7Days: "Iminsi 7 Ishize",
    last30Days: "Iminsi 30 Ishize",
    last90Days: "Iminsi 90 Ishize",
    thisMonth: "Ukwezi Kuno",
    lastMonth: "Ukwezi Gushize",
    customRange: "Igihe Gihitanywe",
    from: "Kuva:",
    to: "Kugeza:",
    startDate: "Itariki y'Itangiriro",
    endDate: "Itariki y'Isozera",
    clear: "Kuraho",
    clearAll: "Kuraho Byose",
    showingWorkersFrom: "Erekana abakozi biyandikishije kuva",
    
    gender: "Igitsina",
    experience: "Uburambe",
    availability: "Uko Baboneka",
    sortBy: "Hitamo Uburyo",
    salaryRange: "Umushahara (RWF)",
    ageRange: "Imyaka",
    languagesSpoken: "Indimi Bavuga",
    workerType: "Ubwoko bw'Umukozi",
    selectCompany: "Hitamo Sosiyete",
    loadingCompanies: "Birajya bipakurura amasosiyete...",
    chooseCompany: "Hitamo sosiyete",

      selectPeriod: "Hitamo Igihe",
    
    allGenders: "Ibitsina Byose",
    male: "Gabo",
    female: "Gore",
    
    allLevels: "Urwego Rwose",
    beginner: "Incamake",
    intermediate: "Urugero",
    expert: "Inzobere",
    
    all: "Byose",
    available: "Bahari",
    hired: "Bakoreshwa",
    
    mostRecent: "Biheruka",
    oldestFirst: "Ibyabanje",
    nameAZ: "Izina A-Z",
    highestRating: "Amanota Maremare",
    salaryLowToHigh: "Umushahara (Uto ku Munini)",
    salaryHighToLow: "Umushahara (Munini ku Uto)",
    
    allWorkers: "Abakozi Bose",
    companyRegistered: "Abiyandikishije mu Masosiyete",
    freelance: "Abigenga",
    
    searchPlaceholder: "Shakisha ukoresheje izina, ubumenyi, cyangwa ahantu...",
    
    totalWorkers: "Abakozi Bose",
    found: "babonetse",
    availableStats: "Abahari",
    readyToHire: "biteguye gukoreshwa",
    companyWorkers: "Abakozi ba Sosiyete",
    companyRegistered2: "biyandikishije muri sosiyete",
    freelanceStats: "Abikora",
    independentWorkers: "abakozi b'igenga",
    
    publicSearch: "Gushakisha Rusange",
    mySearch: "Ibyo Nashakishije",
    publicWorkers: "Abakozi Rusange",
    registerToView: "Iyandikishe kureba amakuru yo guhugira",
    myWorkers: "Abakozi Banjye",
    fullAccess: "Uruhushya rwuzuye hamwe namakuru yo guhugira",
    
    worker: "Umukozi",
    experienceHeader: "Uburambe",
    location: "Aho Atuye",
    salaryRangeHeader: "Umushahara",
    languagesHeader: "Indimi",
    rating: "Amanota",
    status: "Imiterere",
    actions: "Igikorwa",
    
    type: "Ubwoko",
    contact: "Aho Twandikira",
    
    age: "Imyaka",
    paymentRequired: "Kwishyura Birasabwa",
    
    company: "Sosiyete",
    
    noWorkersFound: "Nta bakozi babonetse",
    
    showing: "Erekana",
    to2: "kugeza",
    of: "kuri",
    results: "ibisubizo",
    previous: "Ibiri Inyuma",
    next: "Ibikurikira",
    
    clearAllFilters: "Kuraho Ibyunguruzo Byose",
    
    viewDetails: "Reba Ibisobanuro",
    
    generateIdCard: "Kora Ikarita ya ID",
    generating: "Irakorwa...",
    idCardGenerated: "Ikarita ya ID yakozwe neza",
    idCardFailed: "Ntibyakunze gukora ikarita ya ID",
    
    viewWorker: "Reba ibisobanuro by'umukozi",
    
    years: "imyaka",
    rwf: "RWF",
    
    minAge: "Imyaka mito",
    maxAge: "Imyaka minini",
    min: "Ntoya",
    max: "Nini",
    
    kinyarwanda: "Ikinyarwanda",
    english: "Icyongereza",
    french: "Igifaransa",
    swahili: "Igiswahili",
    other: "Ibindi",
  
        workerDetails: {
      workerId: "ID: {id} • Imyaka: {age}",
      companyRegistered: "Yanditswe muri Sosiyete",
      freelance: "Ukigenga",
      requestSent: "Icyifuzo Cyoherejwe",
      hireNow: "Gukoresha",
      contactDirectly: "Twandikire",
      
      salary: "Umushahara",
      range: "Urwego",
      minMax: "Ntoya - Nini",
      rating: "Amanota",
      averageScore: "amanota y'urutonde",
      reviews: "ibitekerezo",
      experience: "Uburambe",
      level: "urwego",
      company: "Sosiyete",
      affiliation: "umubano",

      rateWorker: "Tanga amanota",
      rateWorkerTitle: "Tanga amanota ku mukozi",
      rateWorkerDescription: "Sangira uburambe wagize ukorana na {firstName} {lastName}.",
      rateWorkerReviewLabel: "Igitekerezo (si ngombwa)",
      rateWorkerReviewPlaceholder: "Uburambe wagize ukorana n'uyu mukozi bwari ubuhe?",
      submitRating: "Ohereza amanota",
      submitting: "Kohereza...",

      rateWorkerCategory: {
        punctuality: "Kuza ku gihe",
        work_quality: "Ubwiza bw'akazi",
        communication: "Itumanaho",
        professionalism: "Umwuga",
      },

      ratings: "Amanota",
      noRatings: "Nta manota arahaba ku mukozi.",

      rateWorkerCategoryIncomplete: "Nyamuneka tanga amanota kuri buri gice, cyangwa ubireke byose ubusa.",
      
      information: "Amakuru",
      workDetails: "Ibyerekeye Akazi",
      contactReferees: "Aho Twandikira",
      documents: "Inyandiko",
      
      personalInformation: "Amakuru y'Umuntu",
      nationalId: "Indangamuntu",
      gender: "Igitsina",
      dateOfBirth: "Itariki y'Amavuko",
      registered: "Yanditswe",
      locationInformation: "Amakuru y'Ahantu",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      insuranceInformation: "Amakuru y'Ubwishingizi",
      provider: "Utanga ubwishingizi",
      insuranceNumber: "Nimero y'Ubwishingizi",
      languagesSpoken: "Indimi Avuga",
      noLanguages: "Nta ndimi zagaragajwe",
      
      workPreferences: "Ibyo Akunda mu Kazi",
      preferredWorkTypes: "Ubwoko bw'Akazi Akunda",
      noPreferences: "Nta byo akunda byagaragajwe",
      preferredLocations: "Ahantu Akunda gukorera",
      noLocations: "Nta hantu hagaragajwe",
      minimumSalary: "Umushahara muto",
      maximumSalary: "Umushahara munini",
      experienceLevel: "Urwego rw'Uburambe",
      beginnerDesc: "Imyaka 0-2 y'uburambe",
      intermediateDesc: "Imyaka 2-5 y'uburambe",
      expertDesc: "Imyaka 5+ y'uburambe",
      noExperienceDesc: "Urwego rw'uburambe ntirwagaragajwe",
      companyInformation: "Amakuru ya Sosiyete",
      companyName: "Izina rya Sosiyete",
      companyId: "ID ya Sosiyete",
      
      contactInformation: "Amakuru yo Guhugira",
      phoneNumber: "Nimero ya Telefone",
      emailAddress: "Aderesi ya Imeyili",
      freelanceWorker: "Umukozi wigenga",
      contactDirectlyHint: "Twandikire ukoresheje nimero ya telefone iri hejuru",
      references: "Abamushyigikiye",
      noReferences: "Nta bamushyigikiye batanzwe",
      
      workerDocuments: "Inyandiko z'Umukozi",
      nationalIdDoc: "Indangamuntu",
      nationalIdHint: "Indangamuntu itangwa na Leta",
      insuranceDetails: "Amakuru y'Ubwishingizi",
      insuranceHint: "Ubwishingizi",
      registration: "Iyandikwa",
      registrationHint: "Yanditswe kuri Ekaze",
      
      hireTitle: "Gukoresha {firstName} {lastName}",
      companyHireHint: "Ohereza icyifuzo cyo gukoresha mu sosiyete y'umukozi. Bazareba bakagusubiza.",
      freelanceHireHint: "Nyamuneka twandikire umukozi ukoresheje nimero ye ya telefone iri muri Contact tab.",
      proposedSalary: "Umushahara uteganijwe",
      proposedSalaryLabel: "Umushahara uteganijwe (RWF) *",
      proposedSalaryPlaceholder: "urugero: 150000",
      expectedRange: "Umushahara umukozi ateganya: {min} - {max}",
      workDescription: "Ibisobanuro by'Akazi *",
      workDescriptionPlaceholder: "Sobanura mu buryo burambuye akazi ukeneye. Koresha imitwe, uturongo, n'ibindi kugirango utunganye ibisobanuro...",
      characters: "inyuguti (mu nyandiko)",
      additionalMessage: "Ubutumwa Bwiyongera (Bitewe n'ubushake)",
      messagePlaceholder: "Amakuru yiyongera kuri sosiyete",
      cancel: "Reka",
      sendRequest: "Ohereza Icyifuzo",
      sending: "Irohereza...",
      
      freelanceTitle: "Uyu ni Umukozi wigenga",
      workerNotAvailable: "Umukozi ntaboneka",
      freelanceMessage: "Abakozi bigenga bagomba gutumanirwa mu buryo butaziguye. Nimero ya telefone yabo iboneka muri Contact tab.",
      unavailableMessage: "Uyu mukozi ntaboneka ku mushahara mushya. Gerageza nyuma cyangwa ushake abandi bakozi.",
      close: "Funga",
      viewContact: "Reba Contact",
      
      salaryRequired: "Umushahara uteganijwe urakenewe",
      salaryInvalid: "Injiza umushahara wemewe",
      descriptionRequired: "Ibisobanuro by'akazi birakenewe",
      descriptionMinLength: "Ibisobanuro by'akazi bigomba kuba byibura 20 inyuguti",
      formErrors: "Nyamuneka kosora amakosa muri form",
      
      freelanceContactInfo: "Uyu ni umukozi wigenga. Nyamuneka twandikire mu buryo butaziguye ukoresheje nimero ya telefone iri muri porofile ye.",
      workerNotAvailableMsg: "Uyu mukozi ntaboneka ku mushahara ubu",
      
      requestSentSuccess: "Icyifuzo cyoherejwe neza!",
      
      available: "Ahaboneka",
      hired: "Akoreshwa",
      unavailable: "Ntaboneka",
      
      beginner: "Incamake",
      intermediate: "Urugero",
      expert: "Inzobere",
      
      male: "Gabo",
      female: "Gore",
      other: "Ibindi",
      
      notAvailable: "N/A",
    },
  },

  activeWorkers: {
      title: "Abakozi Bagikora",
      subtitle: "Genzura no gukurikirana abakozi bakora ubu",
      
      totalWorkers: "Abakozi Bose",
      activeWorkers: "abakozi bagikora",
      currentlyEmployed: "Abakoreshwa Ubu",
      onPayroll: "ku mushahara",
      avgSalary: "Umushahara",
      monthlyAverage: "buri kwezi",
      avgRating: "Amanota",
      outOf5: "kuri 5.0",
      
      searchPlaceholder: "Shakisha abakozi...",
      filters: "Ibyunguruzo",
      sort: "Hitamo",
      mostRecent: "Biheruka",
      oldestFirst: "Ibyabanje",
      nameAZ: "Izina (A-Z)",
      highestRated: "Amanota Maremare",
      
      selected: "byatoranyijwe",
      paySelected: "Ishyura Abatoranyijwe",
      endEmployment: "Hagarika Akazi",
      
      active: "Bagikora",
      hired: "Bakoreshwa",
      completed: "Barangiye",
      
      worker: "Umukozi",
      employment: "Akazi",
      contact: "Aho Twandikira",
      salary: "Umushahara",
      rating: "Amanota",
      status: "Imiterere",
      actions: "Igikorwa",
      experience: "Uburambe",
      salaryRange: "Umushahara",
      period: "Igihe",
      duration: "Igihe",
      
      id: "ID",
      days: "iminsi",
      fee: "Amafaranga",
      age: "Imyaka",
      
      available: "Ahaboneka",
      hired_status: "Akoreshwa",
      unavailable: "Ntaboneka",
      active_status: "Agikora",
      pending: "Bitegereje",
      completed_status: "Byarangiye",
      terminated: "Byahagaritswe",
      cancelled: "Byahagaritswe",
      
      noActiveWorkers: "Nta bakozi bagikora babonetse",
      noHiredWorkers: "Nta bakozi bakoreshwa babonetse",
      noCompletedEmployments: "Nta kazi karangiye",
      
      viewDetails: "Reba Ibisobanuro",
      claimEmployment: "Emeza Akazi",
      paymentHistory: "Amateka y'Ishyura",
      payWorker: "Ishyura Umukozi",
      endEmploymentBtn: "Hagarika Akazi",
      
      paymentHistoryTitle: "Amateka y'Ishyura",
      totalPaid: "Yishyuwe Yose",
      pendingPayments: "Bitegereje",
      payments: "Ishyura",
      nextPayment: "Ishyura Ririkurikira",
      employmentDetails: "IBISOBANURO BY'AKAZI",
      started: "Yatangiye:",
      ended: "Yarangiye:",
      totalPaidLabel: "Yishyuwe Yose:",
      nextPaymentDue: "Ishyura Ririkurikira",
      paymentRecords: "Inyandiko z'Ishyura",
      noPaymentsYet: "Nta ishyura riracyari",
      
      confirmBulkPayment: "Emeza Ishyura Ryinshi",
      workersSelected: "{count} umukozi atoranyijwe",
      workersSelectedPlural: "{count} abakozi batoranyijwe",
      totalAmount: "Amafaranga Yose",
      periodStart: "Itangiriro ry'Igihe *",
      periodEnd: "Isozera ry'Igihe *",
      amountRWF: "Amafaranga (RWF) *",
      notes: "Inyandiko",
      optional: "Bitewe",
      confirm: "Emeza {amount}",
      processing: "Irakorwa...",
      
      endEmploymentTitle: "Hagarika Akazi",
      reasonForEnding: "Impamvu yo Guhagarika *",
      reasonPlaceholder: "Urugero: Amasezerano arangiye, umukozi yeguye, etc.",
      reasonMinLength: "Nyamuneka tanga impamvu (byibura 5 inyuguti)",
      ending: "Irahagarikwa...",
      
      claimEmploymentTitle: "Emeza Akazi",
      claimDescription: "Emeza ko umukozi agiye gukora",
      claimConfirmation: "Wiboneye ko wemeza aka kazi? Ibi bizatuma umukozi agukorera.",
      claim: "Emeza",
      claiming: "Iremezwa...",
      confirmClaim: "Emeza",
      
      fillRequiredFields: "Nyamuneka uzuza ibisabwa byose kuri buri mukozi",
      
      claimSuccess: "Akazi kemejwe neza.",
      claimError: "Ntibyakunze kwemeza akazi.",
      
      cancel: "Reka",
      NA: "N/A",
      RWF: "RF",
      male: "Gabo",
      female: "Gore",
      beginner: "Umutangizi",
      intermediate: "Umenyereye",
      expert: "Umuhanga",
      showing: "Garagaza",
      of2: "Bya",
      previous: "Byabanje",
      next: "Bikurikira",
    },

    verifyWorker: {
      title: "Kugenzura Umukozi",
      subtitle: "Kugenzura umukozi ukoresheje Indangamuntu na OTP",
      badge: "Kugenzura OTP",
      
      step1Title: "Intambwe ya 1: Injiza Indangamuntu",
      nationalIdLabel: "Indangamuntu *",
      nationalIdPlaceholder: "Injiza Indangamuntu y'imibare 16",
      nationalIdHint: "Injiza Indangamuntu y'umukozi y'imibare 16 ikurikuri ku karta ye",
      otpInfo: "OTP izoherezwa kuri numero ya telefone y'umukozi. OTP izakura mu minota 5.",
      sendOtp: "Ohereza OTP",
      sendingOtp: "Irohereza OTP...",
      
      step2Title: "Intambwe ya 2: Injiza OTP",
      otpLabel: "Kode ya OTP *",
      otpPlaceholder: "Injiza OTP y'imibare 6",
      otpHint: "Injiza OTP y'imibare 6 yoherejwe kuri telefone y'umukozi",
      verifyOtp: "Kugenzura OTP",
      verifying: "Iragenzurwa...",
      cancel: "Reka",
      resendOtp: "Ohereza OTP Nanone",
      
      verifiedTitle: "Umukozi Yagenzuwe ✓",
      verificationFailed: "Kugenzura Ntibyakunze",
      
      workerProfile: "Umwirondoro w'Umukozi",
      nationalId: "Indangamuntu:",
      age: "Imyaka:",
      insured: "Afite Ubwishingizi",
      
      contactInfo: "Amakuru yo Guhugira",
      phone: "Telefone:",
      email: "Imeyili:",
      address: "Aderesi:",
      
      professionalDetails: "Amakuru y'Umwuga",
      experience: "Uburambe:",
      languages: "Indimi:",
      salaryRange: "Umushahara:",
      workType: "Ubwoko bw'Akazi:",
      status: "Imiterere:",
      available: "Ahaboneka",
      currentlyEmployed: "Akora Ubu",
      
      registeredCompany: "Sosiyete Yanditsemo",
      company: "Sosiyete:",
      
      currentEmployment: "Akazi Akora Ubu",
      startDate: "Itariki y'Itangiriro:",
      agreedSalary: "Umushahara:",
      
      successRate: "Igipimo cy'Intsinzi",
      avgDuration: "Igihe",
      incidentRate: "Igipimo cy'Ibibazo",
      
      assignmentStatus: "Uko Byahawe:",
      assignedToYou: "Wahawe",
      assignedTo: "Wahawe: {name}",
      notAssigned: "Ntibyahawe",
      
      rejectionTitle: "Impamvu yo Kwanga",
      rejectionLabel: "Impamvu yo Kwanga *",
      rejectionPlaceholder: "Sobanura impamvu uhangana uyu mukozi (byibura inyuguti 10)",
      confirmRejection: "Emeza Kwanga",
      submitting: "Irohereza...",
      
      verifyAnother: "Kugenzura Undi Mukozi",
      printVerification: "Capa Icyemezo",
      
      validationError: "Ikosa mu Kugenzura",
      invalidNationalId: "Injiza Indangamuntu y'imibare 16",
      invalidOtp: "Injiza OTP y'imibare 6",
      invalidRejectionReason: "Tanga impamvu yo kwanga (byibura inyuguti 10)",
      
      devOtpTitle: "OTP yo Gukora",
      devOtpMessage: "OTP: {otp} (izakura mu minota 5)",
      devNewOtp: "OTP Nshya: {otp}",
      
      male: "Gabo",
      female: "Gore",
      
      beginner: "Incamake",
      intermediate: "Urugero",
      expert: "Inzobere",
      
      days: "iminsi",
      
      NA: "N/A",
      reviews: "Gusubiramo",
    },

        hiringRequestManagement: {
      title: "Gucunga Ibyifuzo byo Gukoresha",
      subtitle: "Gukurikirana no gucunga ibyifuzo byo gukoresha abakozi",
      
      filterByDate: "Shungura ku Igihe:",
      show: "Erekana",
      hide: "Hisha",
      dateRange: "Igihe",
      from: "Kuva:",
      to: "Kugeza:",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      clear: "Kuraho",
      clearAll: "Kuraho Byose",
      showingRequestsFrom: "Erekana ibyifuzo kuva",
      
      status: "Imiterere",
      allStatus: "Imiterere Yose",
      pending: "Bitegereje",
      accepted: "Byakiriwe",
      rejected: "Byanzwe",
      cancelled: "Byahagaritswe",
      
      searchPlaceholder: "Shakisha ukoresheje izina ry'umukozi, sosiyete...",
      
      totalRequests: "Ibyifuzo Byose",
      sent: "byoherejwe",
      pendingStats: "Bitegereje",
      awaitingResponse: "bitegereje igisubizo",
      acceptedStats: "Byakiriwe",
      approved: "byemejwe",
      rejectedStats: "Byanzwe",
      declined: "byanzwe",
      
      worker: "Umukozi",
      company: "Sosiyete",
      proposedSalary: "Umushahara",
      statusHeader: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      
      requests: "ibyifuzo",
      noRequestsFound: "Nta cyifuzo cyo gukoresha cyabonetse",
      
      notSpecified: "Ntibyagenwe",
      
      viewDetails: "Reba Ibisobanuro",
      cancelRequest: "Hagarika Icyifuzo",
      
      showing: "Erekana",
      to2: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      cancelTitle: "Hagarika Icyifuzo",
      cancelDescription: "Wiboneye ko uhagarika iki cyifuzo? Iyi gikorwa ntigishobora guhindurwa.",
      cancelNo: "Oya, mbikomeze",
      cancelYes: "Yego, hagarika",
      
      cancelledSuccess: "Icyifuzo cyahagaritswe neza",
      cancelFailed: "Ntibyakunze guhagarika icyifuzo",
      
      viewRequest: "Reba ibisobanuro by'icyifuzo",
      
      RWF: "RWF",

                details: {
        title: "Ibisobanuro by'Icyifuzo",
        requestId: "Icyifuzo #{id}",
        cancelRequest: "Hagarika Icyifuzo",
        
        proposedSalary: "Umushahara",
        amount: "amafaranga",
        workerRating: "Amanota y'Umukozi",
        averageScore: "amanota",
        experience: "Uburambe",
        level: "urwego",
        requestDate: "Itariki",
        sent: "byoherejwe",
        
        workerInformation: "Amakuru y'Umukozi",
        companyInformation: "Amakuru ya Sosiyete",
        requestDetails: "Ibisobanuro by'Icyifuzo",
        timelineResponse: "Igihe n'Igisubizo",
        
        yearsOld: "{age} imyaka • {gender}",
        rating: "amanota",
        experienceLevel: "Urwego rw'Uburambe",
        availabilityStatus: "Uko Aboneka",
        
        businessName: "Izina ry'Ubucuruzi",
        contactPerson: "Umuntu wo Guhugira",
        
        workDescription: "Ibisobanuro by'Akazi",
        messageToCompany: "Ubutumwa kuri Sosiyete",
        
        requestSent: "Icyifuzo Cyoherejwe",
        companyResponded: "Sosiyete Yarasubije",
        companyResponse: "Igisubizo cya Sosiyete",
        
        employmentDetails: "Amakuru y'Akazi",
        employmentId: "ID y'Akazi",
        startDate: "Itariki y'Itangiriro",
        agreedSalary: "Umushahara",
        
        pending: "BIRATEGEREJE",
        accepted: "BYAKIRIWE",
        rejected: "BYANZWE",
        cancelled: "BYAHAGARITSWE",
        
        cancelTitle: "Hagarika Icyifuzo",
        cancelDescription: "Wiboneye ko uhagarika iki cyifuzo? Iyi gikorwa ntigishobora guhindurwa.",
        cancelNo: "Oya, mbikomeze",
        cancelYes: "Yego, hagarika",
        
        cancelledSuccess: "Icyifuzo cyahagaritswe neza",
        cancelFailed: "Ntibyakunze guhagarika icyifuzo",
        
        notSpecified: "Ntibyagenwe",
        male: "Gabo",
        female: "Gore",
      },
    },

        incidentManagement: {
      title: "Gucunga Ibibazo",
      subtitle: "Gukurikirana no gucunga ibibazo byatangajwe",

      exportPdf: "Ohereza",
      
      filterByDate: "Shungura ku Igihe:",
      show: "Erekana",
      hide: "Hisha",
      dateRange: "Igihe",
      from: "Kuva:",
      to: "Kugeza:",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      clear: "Kuraho",
      clearAll: "Kuraho Byose",
      showingIncidentsFrom: "Erekana ibibazo kuva",
      
      status: "Imiterere",
      allStatus: "Imiterere Yose",
      reported: "Byatangajwe",
      underInvestigation: "Biri Gukurikirwa",
      resolved: "Byakemutse",
      dismissed: "Byanze",
      escalated: "Byazamuwe",

          reportIncidentBtn: "Report Incident",
    reportIncident: "Report an Incident",
    reportIncidentSubtitle: "File an incident report against one of your active workers",
    reporting: "Reporting...",
    selectWorker: "Select Worker",
    searchWorkerPlaceholder: "Search by name, phone or national ID...",
    changeWorker: "Change",
    noActiveWorkers: "You have no active workers",
    noWorkersMatch: "No workers match your search",
    incidentDetails: "Incident Details",
    incidentType: "Incident Type",
    incidentDate: "Incident Date",
    location: "Location",
    fullLocation: "Full Location",
    province: "Province",
    district: "District",
    sector: "Sector",
    cell: "Cell",
    village: "Village",
    description: "Description",
    descriptionPlaceholder: "Describe the incident in detail...",
    proofFiles: "Proof Files",
    cancel: "Cancel",
      
      severity: "Uburemere",
      allSeverity: "Uburemere Bwose",
      low: "Buke",
      medium: "Buringaniye",
      high: "Bikomeye",
      critical: "Bikomeye Cyane",
      
      type: "Ubwoko",
      allTypes: "Ubwoko Bwose",
      theft: "Ubujura",
      violence: "Urugomo",
      negligence: "Kwirengagiza",
      breachOfContract: "Kurenga ku Masezerano",
      misconduct: "Ikosa ry'Umwuga",
      other: "Ibindi",
      
      searchPlaceholder: "Shakisha ukoresheje numero y'ikibazo, izina ry'umukozi...",
      
      totalIncidents: "Ibibazo Byose",
      reported2: "byatangajwe",
      underInvestigationStats: "Biri Gukurikirwa",
      inProgress: "biri gukorwa",
      resolvedStats: "Byakemutse",
      closedCases: "byafunzwe",
      criticalStats: "Bikomeye Cyane",
      highPriority: "ibanze",
      
      incident: "Ikibazo",
      worker: "Umukozi",
      typeHeader: "Ubwoko",
      severityHeader: "Uburemere",
      statusHeader: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      
      incidents: "ibibazo",
      noIncidentsFound: "Nta kibazo cyabonetse",
      
      viewDetails: "Reba Ibisobanuro",
      
      showing: "Erekana",
      to2: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      viewIncident: "Reba ibisobanuro by'ikibazo",
      
      reported_badge: "Byatangajwe",
      under_investigation_badge: "Biri Gukurikirwa",
      resolved_badge: "Byakemutse",
      dismissed_badge: "Byanze",
      escalated_badge: "Byazamuwe",
      
      low_badge: "Buke",
      medium_badge: "Buringaniye",
      high_badge: "Bikomeye",
      critical_badge: "Bikomeye Cyane",
      
      theft_label: "Ubujura",
      violence_label: "Urugomo",
      negligence_label: "Kwirengagiza",
      breach_of_contract_label: "Kurenga ku Masezerano",
      misconduct_label: "Ikosa ry'Umwuga",
      other_label: "Ibindi",

                details: {
        incidentNumber: "Ikibazo #{number}",
        reportedOn: "Byatangajwe ku",
        
        worker: "Umukozi",
        involvedParty: "ugize uruhare",
        date: "Itariki",
        incidentOccurred: "ikibazo cyabereye",
        evidence: "Ibimenyetso",
        filesAttached: "dosive zifatanije",
        officer: "Ofisiye",
        investigating: "uri gukora iperereza",
        unassigned: "Ntawahawe",
        
        details: "Ibisobanuro",
        evidence2: "Ibimenyetso",
        timeline: "Igihe",
        
        incidentInformation: "Amakuru y'Ikibazo",
        description: "Ibisobanuro",
        location: "Ahantu",
        incidentType: "Ubwoko bw'Ikibazo",
        severityLevel: "Urwego rw'Uburemere",
        workerInvolved: "Umukozi Ufitiye Isano",
        workerId: "ID y'Umukozi: {id}",
        policeNotes: "Inyandiko za Polisi",
        resolutionDetails: "Ibisobanuro ku Gisubizo",
        resolvedOn: "Byakemutse ku {date}",
        
        statusInformation: "Amakuru y'Imiterere",
        currentStatus: "Imiterere y'ubu",
        reportedDate: "Itariki yatangijweho",
        assignedDate: "Itariki yahawe",
        resolvedDate: "Itariki yakemutseho",
        
        notificationsSent: "Amatangazo Yoherejwe",
        workerNotified: "Umukozi Amenyeshejwe",
        companyNotified: "Sosiyete Imenyeshejwe",
        policeNotified: "Polisi Imenyeshejwe",
        
        assignedOfficer: "Ofisiye Wahawe",
        assignedOn: "Yahawe ku {date}",
        
        evidenceFiles: "Dosive z'Ibimenyetso",
        evidenceNumber: "Ikimenyetso {number}",
        download: "Kumanura",
        noEvidence: "Nta dosive y'ibimenyetso ifatanijwe",
        
        incidentTimeline: "Igihe cy'Ikibazo",
        reported: "Ikibazo Cyatangajwe",
        assignedToOfficer: "Cyahawe Ofisiye",
        officer2: "Ofisiye: {name}",
        resolved: "Ikibazo Cyakemutse",
        
        reported2: "BYATANGAJWE",
        under_investigation: "BIRI GUKURIKIRWA",
        resolved2: "BYAKEMUTSE",
        dismissed: "BYANZWE",
        escalated: "BYAZAMUWE",
        
        low: "BUKE",
        medium: "BURINGANIYE",
        high: "BIKOMEYE",
        critical: "BIKOMEYE CYANE",
        
        theft: "Ubujura",
        violence: "Urugomo",
        negligence: "Kwirengagiza",
        breach_of_contract: "Kurenga ku Masezerano",
        misconduct: "Ikosa ry'Umwuga",
        other: "Ibindi",
        
        notAvailable: "N/A",
      },
    },


        transactionHistory: {
      title: "Amateka y'Ishyura",
      subtitle: "Reba unagenzure amateka y'ishyura ryawe",
      
      filterByDate: "Shungura ku Igihe:",
      show: "Erekana",
      hide: "Hisha",
      dateRange: "Igihe",
      from: "Kuva:",
      to: "Kugeza:",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      clear: "Kuraho",
      clearAll: "Kuraho Byose",
      showingTransactionsFrom: "Erekana ubucuruzi kuva",
      
      status: "Imiterere",
      allStatus: "Imiterere Yose",
      completed: "Bwuzuye",
      pending: "Bitegereje",
      failed: "Bwananiwe",
      refunded: "Byagarutse",
      
      type: "Ubwoko",
      allTypes: "Ubwoko Bwose",
      registration: "Iyandikwa",
      subscription: "Kwiyandikisha",
      salaryDeduction: "Gukuramo Umushahara",
      
      paymentMethod: "Uburyo bwo Kwishyura",
      allMethods: "Uburyo Bwose",
      mobileMoney: "Mobile Money",
      bankTransfer: "Bank Transfer",
      cash: "Amafaranga y'Imbonera",
      
      amountRange: "Umubare w'Amafaranga (RWF)",
      min: "Ntoya",
      max: "Nini",
      to2: "kugeza",
      
      searchPlaceholder: "Shakisha ukoresheje ID y'ubucuruzi, reference...",
      
      totalPaid: "Yishyuwe Yose",
      allTime: "igihe cyose",
      completedStats: "Byuzuye",
      transactions: "ubucuruzi",
      pendingStats: "Bitegereje",
      awaitingPayment: "bitegereje kwishyura",
      average: "Urugero",
      perTransaction: "ku bucuruzi",
      
      transaction: "Ubucuruzi",
      typeHeader: "Ubwoko",
      amount: "Amafaranga",
      method: "Uburyo",
      statusHeader: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      ref: "Ref",
      
      transactionsCount: "ubucuruzi",
      noTransactionsFound: "Nta bucuruzi bwabonetse",
      
      viewDetails: "Reba Ibisobanuro",
      downloadReceipt: "Kumanura Icyemezo",
      
      showing: "Erekana",
      to3: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      viewTransaction: "Reba ibisobanuro by'ubucuruzi",
      
      completed_badge: "Bwuzuye",
      pending_badge: "Bitegereje",
      failed_badge: "Bwananiwe",
      refunded_badge: "Byagarutse",
      
      company_registration: "Iyandikwa rya Sosiyete",
      worker_registration: "Iyandikwa ry'Umukozi",
      employer_registration: "Iyandikwa ry'Umushyira Akazi",
      subscription_fee: "Amafaranga yo Kwiyandikisha",
      salary_deduction: "Gukuramo Umushahara",
      
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      cash_payment: "Amafaranga y'Imbonera",
      
      receiptDownloaded: "Icyemezo cyakumanuwe neza",
      downloadFailed: "Ntibyakunze kumanura icyemezo",
      
      percentageIncrease: "+{value}%",
    },

        profile: {
      title: "Umwirondoro w'Umushyira Akazi",
      subtitle: "Reba unagenzure amakuru yawe",
      
      editProfile: "Hindura Umwirondoro",
      cancel: "Reka",
      saveChanges: "Bika Ibyahinduwe",
      saving: "Irabikwa...",
      
      paidRegistration: "Yishyuye Iyandikwa",
      memberSince: "Umunsi yinjiye {date}",
      totalHires: "{count} yakoreshejwe",
      avgRatingGiven: "{rating} amanota yatanze",
      totalSpent: "Yakoresheje",
      activeNow: "{count} bakora ubu",
      
      registrationNotPaid: "Amafaranga yo kwiyandikisha ntiyishyurwa. Ibikorwa bimwe ntibiboneka.",
      
      activeWorkers: "Abakozi Bagikora",
      currentlyHired: "Bakoreshwa ubu",
      totalHired: "Bakozwe Bose",
      allTime: "Igihe cyose",
      completed: "Barangiye",
      contracts: "Amasezerano",
      pendingRequests: "Ibyifuzo Bitegereje",
      awaitingResponse: "Bitegereje igisubizo",
      incidents: "Ibibazo",
      openIncidents: "{count} bifunguye",
      ratingGiven: "Amanota Yatanzwe",
      average: "Urugero",
      
      overview: "Incamake",
      workers: "Abakozi",
      financial: "Imari",
      documents: "Inyandiko",
      
      personalInformation: "Amakuru y'Umuntu",
      fullName: "Izina Ryuzuye",
      email: "Imeyili",
      phone: "Telefone",
      nationalId: "Indangamuntu",
      dateOfBirth: "Itariki y'Amavuko",
      gender: "Igitsina",
      genderPlaceholder: "gabo/gore/ibindi",
      location: "Aho Atuye",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      address: "Aderesi",
      
      workersByCategory: "Abakozi ku Byiciro",
      noCategoryData: "Nta makuru y'ibyiciro aboneka.",
      recentHires: "Abakoreshejwe Vuba",
      noRecentHires: "Nta bakozi bakoreshejwe vuba.",
      
      registrationFee: "Amafaranga yo Kwiyandikisha",
      paid: "Yishyuwe",
      pending: "Bitegereje",
      notPaid: "Ntiyishyurwa",
      totalPayments: "Amafaranga Yishyuwe",
      totalSpending: "Amafaranga Yakoreshejwe",
      includingFees: "Harimo amafaranga",
      pendingRequestsFinancial: "Ibyifuzo Bitegereje",
      totalRequests: "{count} byose",
      recentPayments: "Ishyura Riyaheruka",
      noRecentPayments: "Nta ishyura riheruka.",
      ref: "Ref: {ref}",
      employmentDuration: "Igihe cy'Akazi",
      avgDays: "Iminsi",
      totalDays: "Iminsi Yose",
      minDays: "Iminsi Mito",
      maxDays: "Iminsi Minini",
      
      yourDocuments: "Inyandiko Zawe",
      nationalIdDoc: "Indangamuntu",
      registrationFeeDoc: "Amafaranga yo Kwiyandikisha",
      profileVerification: "Kugenzura Umwirondoro",
      verified: "Yemejwe",
      verifiedDate: "Yemejwe: {date}",
      awaitingVerification: "Itegereje Kugenzurwa",
      
      active: "Agikora",
      completed2: "Byarangiye",
      terminated: "Byahagaritswe",
      pending2: "Bitegereje",
      approved: "Byemejwe",
      rejected: "Byanzwe",
      verified2: "Yemejwe",
      
      loadError: "Ntibishoboye gupakurura umwirondoro. Ongera ugerageze.",
      
      notAvailable: "—",
      
      male: "Gabo",
      female: "Gore",
      other: "Ibindi",
    },




     

},

//   ======================================================================= EMPLOYER ==================================================




// ========================================================================== WORKER ====================================================

worker: {
  workerSidebar: {
    loadError:           "Ntibishoboye gupakurura amakuru y'umukozi",
    changePhoto:         "Hindura ifoto y'umwirondoro",
    level:               "Urwego",
    companyWorker:       "Umukozi wa Sosiyete",
    activeEmployment:    "Akazi gakora",
    viewAllStats:        "Reba imibare yose",
    currentSalary:       "Umushahara uhembwa",
    salaryUnit:          "RWF/ukwezi",
    averageRating:       "Amanota y'urutonde",
    review:              "igitekerezo",
    reviews:             "ibitekerezo",
    quickStats:          "Imibare Yihuse",
    totalEmployments:    "Akazi Kose",
    employmentHistory:   "Amateka y'akazi",
    nidaVerified:        "Yemejwe na NIDA",
    nidaNotVerified:     "Ntiyemejwe na NIDA",
    identityVerification:"Kugenzura ubunyakuri",
    hasInsurance:        "Afite Ubwishingizi",
    noInsurance:         "Nta Bwishingizi",
    noIncidents:         "Nta Bibazo",
    incident:            "Ikibazo",
    incidents:           "Ibibazo",
    unresolved:          "bitarasohozwa",
    cleanRecord:         "Amateka meza",
  },

  workerHeader: {
  defaultName:  "Umukozi",
  roleLabel:    "Umukozi",
  navigation:   "Uburyo bwo Kugenda",
  myProfile:    "Umwirondoro Wanjye",
  notifications: {
    system:              "Sisitemu",
    newLabel:            "Rishya",
    emptyTitle:          "Nta mamenyesha",
    noNotifications:     "Nta mamenyesha ufite ubu.",
    noUnread:            "Nta mamenyesha adasomwe ufite.",
    noRead:              "Nta mamenyesha asomwe ufite.",
    badgeAlert:          "IMPURUZA",
    badgePayment:        "UBWISHYU",
    badgeSystem:         "SISITEMU",
    badgeNew:            "RISHYA",
    badgeHired:          "YAKIRIWE",
    badgeRating:         "AMANOTA",
    badgeJob:            "AKAZI",
    badgeInfo:           "AMAKURU",
    statsTotal:          "Yose",
    statsUnread:         "Adasomwe",
    statsRead:           "Asomwe",
    statsTypes:          "Ubwoko",
    tabAll:              "Yose",
    tabUnread:           "Adasomwe",
    tabRead:             "Asomwe",
    filterPlaceholder:   "Shungura ubwoko",
    filterAll:           "Ubwoko Bwose",
    filterIncidents:     "Ibibazo",
    filterPayments:      "Ubwishyu",
    filterSystem:        "Sisitemu",
    filterHiring:        "Gukurura Akazi",
    filterRatings:       "Amanota",
    filterJobs:          "Imirimo",
  },
},


  workerStats: {
    title: "Dashibodi y'Umukozi",
    welcome: "Murakaza neza, {name}! Kurikirana akazi, amafaranga, na gahunda yawe",
    loadError: "Ntibishoboye gupakurura amakuru ya dashibodi",
    loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
    updating: "Irahindurwa...",
    available: "Ahari",
    unavailable: "Ntahari",
    yes: "Yego",
    no: "Oya",
    notAvailable: "N/A",
    
    stats: {
      activeJobs: {
        title: "Akazi Gakora",
        subtitle: "gakora ubu",
        percentage: "iki cyumweru"
      },
      hoursThisMonth: {
        title: "Amasaha y'Uku Kwezi",
        subtitle: "amasaha yakozwe",
        percentage: "ugereranyije n'ukwezi gushize"
      },
      monthlyEarnings: {
        title: "Amafaranga y'Uku Kwezi",
        subtitle: "RWF",
        percentage: "ugereranyije n'ukwezi gushize"
      },
      rating: {
        title: "Amanota",
        subtitle: "kuri 5.0",
        percentage: "amanota y'urutonde"
      }
    },
    
    secondaryStats: {
      completedJobs: "Akazi Karangiye",
      totalEarnings: "Amafaranga Yose Yinjije",
      totalHours: "Amasaha Yose",
      availability: "Uko Aboneka",
      available: "Ahari",
      unavailable: "Ntahari"
    },
    
    currentEmployment: {
      title: "Akazi Akora Ubu",
      active: "Gikora",
      household: "Umuryango",
      contact: "Aho Twandikira",
      monthlySalary: "Umushahara buri Kwezi",
      started: "Yatangiye",
      workType: "Ubwoko bw'Akazi",
      generalHousework: "Akazi rusange",
      otpVerified: "OTP Yemejwe"
    },
    
    tabs: {
      overview: "Incamake",
      profile: "Umwirondoro",
      ratings: "Amanota"
    },
    
    overview: {
      quickSummary: "Incamake Yihuse",
      totalJobs: "Akazi Kose",
      jobBreakdown: "{active} gakora, {completed} karangiye",
      thisMonth: "Uku Kwezi",
      hoursWorked: "amasaha yakozwe",
      earnings: "Amafaranga",
      rating: "Amanota",
      fromRatings: "kuva {count} amanota",
      performanceOverview: "Incamake y'Imikorere",
      basedOnRatings: "Bishingiye kuri {count} amanota",
      personalInformation: "Amakuru y'Umuntu",
      name: "Izina",
      phone: "Telefone",
      email: "Imeyili"
    },
    
    profile: {
      profileDetails: "Ibisobanuro by'Umwirondoro",
      nidaVerified: "NIDA Yemejwe",
      notVerified: "Ntiyemejwe",
      basicInformation: "Amakuru y'Ingenzi",
      fullName: "Izina Ryuzuye",
      age: "Imyaka",
      years: "imyaka",
      gender: "Igitsina",
      male: "Gabo",
      female: "Gore",
      experience: "Uburambe",
      beginner: "Incamake",
      intermediate: "Urugero",
      expert: "Inzobere",
      contactInformation: "Amakuru yo Guhugira",
      phone: "Telefone",
      email: "Imeyili",
      nationalId: "Indangamuntu",
      company: "Sosiyete",
      notRegistered: "Ntiyanditse",
      workPreferences: "Ibyo Akunda mu Kazi",
      preferredWorkTypes: "Ubwoko bw'Akazi Akunda",
      languages: "Indimi",
      salaryRange: "Umushahara",
      insuranceInformation: "Amakuru y'Ubwishingizi",
      hasInsurance: "Afite Ubwishingizi",
      provider: "Utanga ubwishingizi",
      policyNumber: "Nimero y'Ubwishingizi"
    },
    
    ratings: {
      ratingsReviews: "Amanota n'Ibitekerezo",
      averageWithValue: "{value} amanota y'urutonde",
      totalRatings: "{count} amanota yose",
      outOf5: "Kuri 5.0",
      ratingsNote: "Amanota atangwa n'abakoresha kandi agaragara hano nyuma yo kugenzurwa.",
      viewDetailsNote: "Urashobora kureba amanota arambuye ku ipaji y'Amanota."
    }
  },

  schedule: {
    title: "Gahunda Yanjye",
    subtitle: "Genzura akazi kawe ugashyiraho uko uboneka buri cyumweru",
    dateLocale: "en-GB",
    today: "Uyu munsi",
    currency: "RWF",
    time: {
      am: "MU",
      pm: "NIM"
    },
    daysShort: {
      mon: "Mbe",
      tue: "Kab",
      wed: "Gat",
      thu: "Kan",
      fri: "Gan",
      sat: "Gat",
      sun: "Kuw"
    },
    days: {
      monday: "Kuwa Mbere",
      tuesday: "Kuwa Kabiri",
      wednesday: "Kuwa Gatatu",
      thursday: "Kuwa Kane",
      friday: "Kuwa Gatanu",
      saturday: "Kuwa Gatandatu",
      sunday: "Ku Cyumweru"
    },
    summary: {
      upcomingJobs: "Akazi Kazaza",
      completed: "Karangiye",
      earnedThisWeek: "Yinjijwe iki Cyumweru",
      expected: "Ateganijwe (RWF)"
    },
    tabs: {
    upcoming: "Kazaza",
    completed: "Karangiye",
    availability: "Shyiraho Uko Uboneka"
    },
    status: {
      upcoming: "Kazaza",
      completed: "Karangiye",
      cancelled: "Yahagaritswe"
    },
    
    type: {
      freelance: "Ukigenga",
      partTime: "Igice cy'Igihe"
    },
    empty: {
      upcomingTitle: "Nta kazi kazaza",
      upcomingMessage: "Akazi kawe kazagaragara hano.",
      completedTitle: "Nta kazi karangiye",
      completedMessage: "Akazi karangiye kazagaragara hano."
    },
    availability: {
      available: "Ahari",
      booked: "Gufunguye",
      weeklyOverview: "Incamake y'Uko Uboneka buri Cyumweru",
      clickHint: "Kanda ku munsi wifuza guhindura amasaha yawo",
      timeSlots: "Amasaha",
      addSlot: "Ongeraho Igihe",
      noSlots: "Ntabwo ushyizeho uko uboneka. Kanda \"Ongeraho Igihe\" kugirango ushyireho amasaha yawe.",
      to: "kugeza",
      applyAvailability: "Shyiraho Uko Uboneka",
      from: "Kuva",
      save: "Bika Uko Uboneka",
      saving: "Irabikwa...",
      newUnsaved: "Gishya (ntikibike)",
      weekBanner: "Erekana uko uboneka kuva {start} – {end}. Gusa amasaha ya Buri Cyumweru n'ay'igihe cyihariye niyo agaragara iki cyumweru.",
      availableTooltip: "Uboneka: {start}–{end}",
      bookedTooltip: "Gufunguye: {employer}",
      scope: {
        thisWeek: "Iki Cyumweru Gusa",
        everyWeek: "Buri Cyumweru",
        custom: "Igihe Cyihariye"
      }
    }
  },

    transactions: {
    title: "Ibikorwa Byanjye By'ishyura",
    subtitle: "Kurikirana amafaranga winjije n'amateka y'ishyura",
    export: "Ohereza",
    refresh: "Vugurura",
    loadError: "Ntibishoboye gupakurura ibikorwa by'ishyura",
    loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
    notAvailable: "N/A",
    noDescription: "Nta bisobanuro",
    transactions: "ibikorwa",
    
    stats: {
      totalEarnings: {
        title: "Amafaranga Yose Yinjije",
        subtitle: "ibihe byose",
        percentage: "uku kwezi"
      },
      totalTransactions: {
        title: "Ibikorwa Byose",
        subtitle: "byuzuye",
        percentage: "igipimo cy'intsinzi"
      },
      pending: {
        title: "Bitegereje",
        subtitle: "bitegereje kwishyura",
        percentage: "bisaba igikorwa"
      },
      failed: {
        title: "Byananiranye",
        subtitle: "ntibyagenze",
        percentage: "igipimo"
      }
    },
    
    types: {
      subscription_fee: "Kwiyandikisha",
      salary_deduction: "Gukuramo Umushahara",
      worker_registration: "Iyandikwa ry'Umukozi"
    },
    
    status: {
      completed: "Byuzuye",
      pending: "Bitegereje",
      failed: "Byananiranye",
      refunded: "Byagarutse"
    },
    
    charts: {
      monthlyEarnings: "Amafaranga y'Ukwezi (Amezi 6 Ashize)",
      earningsByType: "Amafaranga ukurikije Ubwoko",
      dailyEarnings: "Amafaranga ya Buri Munsi (Iminsi 30 Ishize)",
      transactionSummary: "Incamake y'Ubwoko",
      earnings: "Amafaranga",
      months: "amezi",
      types: "ubwoko",
      days: "iminsi",
      noData: "Nta makuru y'amafaranga aboneka"
    },
    
    tabs: {
      all: "Ibikorwa Byose",
      earnings: "Amafaranga Yinjije",
      pending: "Bitegereje"
    },
    
    filters: {
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      search: "Shakisha ibikorwa by'ishyura..."
    },
    
    table: {
      id: "ID y'Ikibazo",
      type: "Ubwoko",
      amount: "Amafaranga",
      status: "Imiterere",
      method: "Uburyo bwo Kwishyura",
      date: "Itariki",
      created: "Yakozwe",
      description: "Ibisobanuro",
      actions: "Igikorwa"
    },
    
    pagination: {
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira"
    },
    
    all: {
      title: "Ibikorwa Byose",
      total: "Igiteranyo"
    },
    
    earnings: {
      title: "Ibikorwa Byuzuye (Amafaranga Yinjije)",
      total: "Amafaranga Yose Yinjije"
    },
    
    pending: {
      title: "Ibikorwa Bitegereje",
      total: "Igiteranyo Cyitegereje"
    },
    
    recent: {
      title: "Ibikorwa Biheruka (Iminsi 7 Ishize)"
    },
    
    empty: {
      noTransactions: "Nta bikorwa by'ishyura byabonetse",
      noEarnings: "Nta bikorwa byuzuye byabonetse",
      noPending: "Nta bikorwa bitegereje byabonetse"
    }
  },

  profile: {
  title: "Umwirondoro Wanjye",
  subtitle: "Genzura umwirondoro wawe urebe amateka y'akazi",
  loadError: "Ntibishoboye gupakurura umwirondoro",
  loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
  editProfile: "Hindura Umwirondoro",
  saveChanges: "Bika Ibyahinduwe",
  saving: "Irabikwa...",
  cancel: "Reka",
  markAvailable: "Ereka Uko Uboneka",
  markUnavailable: "Ereka Ntuboneka",
  changePhoto: "Hindura ifoto y'umwirondoro",
  nidaVerified: "NIDA Yemejwe",
  experienceLevel: "Urwego rw'Uburambe",
  activeJobs: "{count} akazi gakora",
  review: "igitekerezo",
  reviews: "ibitekerezo",
  notSpecified: "Ntibyagenwe",
  currency: "RWF",
  yearsOld: "imyaka {age}",
  firstName: "Izina",
  lastName: "Iry'umuryango",
  email: "Imeyili",
  phone: "Telefone",
  age: "Imyaka",
  
  status: {
    available: "Ahari",
    unavailable: "Ntahari",
    hired: "Akoreshwa",
    active: "Agikora",
    completed: "Byarangiye",
    pending: "Bitegereje",
    verified: "Yemejwe"
  },
  
  experience: {
    beginner: "Incamake",
    intermediate: "Urugero",
    experienced: "Ufite Uburambe",
    expert: "Inzobere"
  },
  
  stats: {
    totalJobs: "Akazi Kose",
    jobBreakdown: "{active} gakora · {completed} karangiye",
    averageRating: "Amanota y'Urutonde",
    totalReviews: "{count} ibitekerezo",
    totalEarnings: "Amafaranga Yose Yinjije",
    allTime: "RWF · ibihe byose",
    thisMonth: "Uku Kwezi",
    monthlyEarnings: "Amafaranga y'ukwezi"
  },
  
  tabs: {
    overview: "Incamake",
    employments: "Amateka y'Akazi",
    ratings: "Amanota n'Ibitekerezo"
  },
  
  sections: {
    personalInfo: "Amakuru y'Umuntu",
    workPreferences: "Ibyo Akunda mu Kazi",
    insurance: "Amakuru y'Ubwishingizi",
    company: "Amakuru ya Sosiyete"
  },
  
  fields: {
    fullName: "Izina Ryuzuye",
    email: "Imeyili",
    phone: "Telefone",
    age: "Imyaka",
    experienceLevel: "Urwego rw'Uburambe",
    workTypes: "Ubwoko bw'Akazi",
    preferredDistricts: "Uturere Akunda",
    languages: "Indimi",
    minSalary: "Umushahara muto",
    maxSalary: "Umushahara munini",
    provider: "Utanga ubwishingizi",
    policyNumber: "Nimero y'Ubwishingizi",
    companyName: "Izina rya Sosiyete",
    companyPhone: "Telefone ya Sosiyete"
  },
  
  employments: {
    title: "Amateka y'Akazi",
    count: "{count} imirimo",
    employer: "Umukoresha",
    table: {
      employer: "Umukoresha",
      description: "Ibisobanuro",
      status: "Imiterere",
      salary: "Umushahara",
      startDate: "Itariki y'Itangiriro"
    },
    empty: {
      title: "Nta Mateka y'Akazi",
      message: "Amateka y'akazi yawe azagaragara hano nutangira gukora."
    }
  },
  
  ratings: {
    title: "Amanota Yawe",
    count: "{count} amanota",
    review: "igitekerezo",
    reviews: "ibitekerezo",
    employer: "Umukoresha",
    empty: {
      title: "Nta Manota Uracyafite",
      message: "Amanota atangwa n'abakoresha azagaragara hano nyuma yo kurangiza akazi."
    }
  }
},

extendedProfile: {
  title: "Uzuzisha Umwirondoro Wawe",
  subtitle: "Umwirondoro wuzuye wongera amahirwe yo guhabwa akazi.",
  loadError: "Ntibishoboye gupakurura umwirondoro wuzuye",
  loadErrorHint: "Nyamuneka subiramo urupapuro.",
  saving: "Irabikwa...",
  saveChanges: "Bika Ibyahinduwe",
  saveAllChanges: "Bika Byose",
  
  completion: {
    title: "Urwego rw'Umwirondoro"
  },
  
  sections: {
    education: "Amashuri",
    experience: "Uburambe mu Kazi",
    services: "Serivisi Ntanga",
    preferredWork: "Ubwoko bw'Akazi Nkunda",
    availability: "Uko Mboneka",
    certificates: "Ibyemezo n'Ibyangombwa",
    health: "Ubuzima",
    personal: "Amakuru y'Umuntu",
    referee: "Undi Mushyigikiye",
    bio: "Incamake n'Ubuhanga"
  },
  
  fields: {
    educationLevel: "Urwego rw'Amashuri",
    fieldOption: "Ishami / Icyo wiganye",
    institution: "Ishuri / Koleji / Kaminuza",
    yearCompleted: "Umwaka warangije",
    yearsOfExperience: "Imyaka y'Uburambe",
    pastExperiences: "Uburambe (sobanura mu magambo yawe)",
    previousEmployers: "Abakoresha Mbere",
    employerName: "Izina ry'Umukoresha",
    yourRole: "Inshingano Zawe",
    duration: "Igihe wakoze",
    location: "Aho wakoreraga",
    preferredWorkType: "Ubwoko bw'Akazi Ukunda",
    preferredSectors: "Ahantu Ukunda gukorera (hitamo byose ukunda)",
    availableDays: "Iminsi uboneka",
    availableFrom: "Uboneka kuva",
    availableTo: "Uboneka kugeza",
    licenceCategory: "Ubwoko bwa Permi",
    otherCertifications: "Ibihembo Ibindi",
    certificateName: "Izina ry'Icyemezo",
    issuer: "Uwatangiye",
    year: "Umwaka",
    medicalDetails: "Nyamuneka sobanura (ibanga)",
    maritalStatus: "Imiterere y'Ubucuruzi",
    dependents: "Umubare w'Abakurikira",
    religion: "Idini (bushoboro)",
    refereeName: "Izina ry'Umushyigikiye",
    refereePhone: "Telefone",
    refereeRelationship: "Isano",
    bio: "Incamake Ngufi (yiyobereze abakoresha)",
    specialSkills: "Ubuhanga Bwihariye"
  },
  
  placeholders: {
    fieldOption: "urugero: Culinary Arts, Ubuvuzi...",
    institution: "Ishuri / Koleji / Kaminuza",
    year: "urugero: 2019",
    pastExperiences: "Urugero: Nakoze imyaka 2 mu hotel ya Kigali nk'umufundi w'imbuto...",
    employerName: "Izina rya Sosiyete / Umuntu",
    role: "urugero: Umufundi, Umutetsi...",
    duration: "urugero: imyaka 2, amezi 6...",
    location: "urugero: Kigali, Musanze...",
    selectSectors: "Shakisha uhitemo ahantu...",
    selectDays: "Shakisha uhitemo iminsi...",
    certificateName: "urugero: Food Safety",
    issuer: "urugero: RDB, WHO...",
    medicalDetails: "Sobanura uburwayi bwawe...",
    select: "Hitamo...",
    religion: "urugero: Umukirisitu, Umusilamu...",
    refereeName: "Izina ryuzuye",
    phone: "urugero: 0781234567",
    relationship: "urugero: Umukoresha wabanje, Umupasiteri...",
    bio: "Bwira abakoresha ibyawe, imyifatire, icyo ukora neza...",
    specialSkills: "Ubuhanga butavuzwe haruguru (urugero: avuga igifaransa, azi Excel, gutegura ibirori...)"
  },
  
  actions: {
    add: "Ongeraho"
  },
  
  empty: {
    employers: "Nta bakoresha mbere warongeye",
    certifications: "Nta bihembo warongeye"
  },
  
  servicesHint: "Kanda kuri serivisi zose witeguye gutanga.",
  
  services: {
    babySitting: "Kurera Abana",
    babySittingDesc: "Kwita ku mpinja n'abana bato",
    laundry: "Kumesa",
    ironing: "Gutunganya",
    houseChores: "Imirimo yo Mu Rugo",
    houseChoresDesc: "Gukaraba no gutunganya",
    cooking: "Guteka",
    gardening: "Guhinga",
    carWashing: "Koza Imodoka",
    elderlyCare: "Kwita ku Bageze muzabukuru",
    elderlyCareDesc: "Gufasha abasaza n'abakecuru",
    childcare: "Kwita ku Bana",
    childcareDesc: "Kurera abana bakuru",
    petCare: "Kwita ku Matungo",
    shopping: "Kugura / Gutwara",
    shoppingDesc: "Kugura ibiribwa n'izindi nkora",
    driving: "Gutwara",
    drivingDesc: "Ashobora gutwara imodoka y'umukoresha niba bikenewe"
  },
  
  availability: {
    weekends: "Mboneka ku Mpera z'Icyumweru",
    holidays: "Mboneka ku Minsi mikuru"
  },
  
  certificates: {
    hasDrivingLicence: "Afite Permis",
    hasCooking: "Afite Icyemezo cyo Guteka",
    hasFirstAid: "Afite Icyemezo cyo Gutabara",
    hasChildcare: "Afite Icyemezo cyo Kwita ku Bana"
  },
  
  health: {
    physicallyFit: "Afite Ubuzima Bwiza",
    physicallyFitDesc: "Ashobora gukora imirimo ikenera imbaraga",
    hasMedicalConditions: "Afite Indwara",
    medicalConditionsDesc: "Ikibazo cyose gishobora kugira ingaruka ku kazi"
  }
}


},

// =============================================================== WORKER ==============================================================


// =================================================================== COMPANY ==============================================================

company: {
  companySidebar: {
    loadError:     "Ntibishoboye gupakurura amakuru ya sosiyete",
    changePhoto:   "Hindura ifoto y'umwirondoro",
    fromLastMonth: "ugereranyije n'ukwezi gushize",
    joined:        "Yinjiye",
  },

  companyHeader: {
  defaultName:  "Sosiyete",
  roleLabel:    "Sosiyete",
  navigation:   "Uburyo bwo Kugenda",
  notifications: {
    system:               "Sisitemu",
    newLabel:             "Rishya",
    emptyTitle:           "Nta mamenyesha",
    noNotifications:      "Nta mamenyesha ufite ubu.",
    noUnread:             "Nta mamenyesha adasomwe ufite.",
    noRead:               "Nta mamenyesha asomwe ufite.",
    badgeAlert:           "IMPURUZA",
    badgePayment:         "UBWISHYU",
    badgeSystem:          "SISITEMU",
    badgeNew:             "RISHYA",
    badgeHiring:          "AKAZI",
    badgeWorker:          "UMUKOZI",
    badgeInfo:            "AMAKURU",
    statsTotal:           "Yose",
    statsUnread:          "Adasomwe",
    statsRead:            "Asomwe",
    statsTypes:           "Ubwoko",
    tabAll:               "Yose",
    tabUnread:            "Adasomwe",
    tabRead:              "Asomwe",
    filterPlaceholder:    "Shungura ubwoko",
    filterAll:            "Ubwoko Bwose",
    filterIncidents:      "Ibibazo",
    filterPayments:       "Ubwishyu",
    filterSystem:         "Sisitemu",
    filterRegistrations:  "Iyandikwa",
    filterHiring:         "Gukurura Akazi",
  },
},

    companyStats: {
      title: "Incamake ya Sosiyete",
      subtitle: "Genzura abakozi bawe no gukurikirana ibyifuzo byo gukoresha",
      
      registeredWorkers: "Abakozi Biyandikishije",
      available: "bahari",
      activeEmployments: "Akazi Gakora",
      currentlyHired: "bakoreshwa ubu",
      monthlyRevenue: "Amafaranga y'Ukwezi",
      vsLastMonth: "ugereranyije n'ukwezi gushize",
      pendingRequests: "Ibyifuzo Bitegereje",
      awaitingAction: "bitegereje igikorwa",
      urgent: "byihutirwa",
      newThisWeek: "bishya iki cyumweru",
      
      nidaVerified: "NIDA Yemeje",
      withInsurance: "Bafite Ubwishingizi",
      totalEarnings: "Amafaranga Yinjije",
      successRate: "Igipimo cy'Intsinzi",
      
      overview: "Incamake",
      workers: "Abakozi",
      requests: "Ibyifuzo",
      
      quickSummary: "Incamake Yihuse",
      totalWorkers: "Abakozi Bose",
      thisMonth: "Uku Kwezi",
      newWorkers: "abakozi bashya",
      employments: "Akazi",
      active: "gakora",
      revenue: "Amafaranga",
      
      workerGrowth: "Imikurire y'Abakozi (Iminsi 30 Ishize)",
      ratingDistribution: "Ikwirakwizwa ry'Amanota",
      revenueTrends: "Imikurire y'Amafaranga",
      loadingChart: "Iramikorera...",
      noDataAvailable: "Nta makuru aboneka",
      
      recentWorkers: "Abakozi Baheruka",
      workersCount: "abakozi",
      id: "ID",
      name: "Izina",
      type: "Ubwoko",
      status: "Imiterere",
      registered: "Yanditswe",
      
      hiringRequests: "Ibyifuzo byo Gukoresha",
      requestsCount: "ibyifuzo",
      requestId: "ID y'Icyifuzo",
      worker: "Umukozi",
      household: "Umuryango",
      date: "Itariki",
      unknown: "Ntumenyekana",
      
      available_status: "ahari",
      hired: "akoreshwa",
      pending: "kitegereje",
      approved: "cyemejwe",
      rejected: "cyanwe",
      
      general: "Rusange",
      
      loadError: "Ntibishoboye gupakurura amakuru ya dashibodi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      workers2: "abakozi",
      requests2: "ibyifuzo",
      thisMonthLabel: "uku kwezi",
    },

        workersContent: {
      title: "Gucunga Abakozi",
      subtitle: "Genzura no gukurikirana abakozi biyandikishije",
      
      totalWorkers: "Abakozi Bose",
      registered: "Byanditswe",
      available: "Abahari",
      readyToHire: "Biteguye gukoreshwa",
      hired: "Bakoreshwa",
      alreadyHired: "Bamaze gukoreshwa",
      nidaVerified: "NIDA Yemeje",
      verifiedWorkers: "Abakozi bemejwe",
      
      workerDirectory: "Urutonde rw'Abakozi",
      
      generateCards: "Kora Ikarita",
      generating: "Irakorwa...",
      importExcel: "Twinjiza Excel",
      addWorker: "Ongeraho Umukozi",
      
      searchPlaceholder: "Shakisha ukoresheje izina cyangwa indangamuntu...",
      
      worker: "Umukozi",
      contact: "Aho Twandikira",
      experience: "Uburambe",
      status: "Imiterere",
      rating: "Amanota",
      employments: "Akazi",
      actions: "Igikorwa",
      id: "ID",
      
      noRatings: "Nta manota",
      unknown: "ntabwo",
      notAvailable: "N/A",
      
      allWorkers: "Abakozi Bose",
      available_tab: "Abahari",
      hired_tab: "Abakoreshwa",
      unavailable_tab: "Abatahari",
      
      available_status: "ahari",
      hired_status: "akoreshwa",
      unavailable_status: "ntahari",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      workers: "abakozi",
      page: "Paji",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      noWorkersFound: "Nta bakozi babonetse",
      
      loadError: "Ntibishoboye gupakurura abakozi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      selectAll: "Hitamo abakozi bose",
      selectWorker: "Hitamo {name}",
      
      beginner: "Incamake",
      intermediate: "Urugero",
      expert: "Inzobere",
      
      cardsGenerated: "{count} ikarita(z) zakozwe!",
      noPdfUrl: "Byakozwe ariko nta PDF URL yagarutse.",
      cardsGenerationFailed: "Ntibyakunze gukora ikarita",
      workerRegistered: "Umukozi yiyandikishije neza!",
      workerRegistrationFailed: "Ntibyakunze kwiyandikisha umukozi",
      workersImported: "Abakozi binjijwe! Urutonde rwashyizwe kuvugururwa.",
      
      paymentRequired: "Kwishyura birakenewe",
      transactionInfo: "ID y'ubucuruzi: {id}. Amafaranga: {amount} RWF",
      
      viewWorker: "Reba ibisobanuro by'umukozi",

      importModal: {
        title: "Twinjiza Abakozi muri Excel",
        description: "Shyiramo dosiye ya Excel cyangwa CSV kugirango wiyandikishe abakozi benshi. Kura template witangire.",
        downloadTemplate: "Kura Template",
        
        dropzoneText: "Ugushyiremo dosiye ya Excel hano, cyangwa",
        browse: "shakisha",
        supports: "Bikora .xlsx, .xls, .csv",
        
        rowsDetected: "{count} umurongo wabonetse",
        rowsDetectedPlural: "{count} imirongo yabonetse",
        errorsFound: "{count} ikosa",
        errorsFoundPlural: "{count} amakosa",
        
        readyToImport: "Yiteguye kwinjizwa",
        hasErrors: "Ifite amakosa",
        
        validationErrors: "Amakosa yo Kugenzura — nyamuneka kosora dosiye yawe hanyuma wongere ushyire",
        
        preview: "Reba imbere — imirongo {count} ya mbere",
        status: "Imiterere",
        moreRowsNotShown: "+ {count} indi mirongo ntiyerekanwa",
        
        requiredColumns: "Amazina y'Inkingi Akenewe",
        
        cancel: "Reka",
        willBeRegistered: "{count} umukozi azandikwa",
        willBeRegisteredPlural: "{count} abakozi bazandikwa",
        importing: "Irinjizwa...",
        import: "Injiza Abakozi {count}",
        
        requiredField: "Umurongo {row}: \"{field}\" urakenewe",
        invalidNationalId: "Umurongo {row}: Nomero y'indangamuntu igomba kuba imibare 16",
        invalidGender: "Umurongo {row}: Igitsina kigomba kuba \"male\" cyangwa \"female\"",
        invalidExperience: "Umurongo {row}: experience_level igomba kuba beginner/intermediate/expert",
        
        invalidFileType: "Nyamuneka shyiramo dosiye ya Excel (.xlsx, .xls) cyangwa CSV",
        emptyFile: "Dosiye nta makuru irimo cyangwa nta mirongo",
        readFailed: "Ntibyakunze gusoma dosiye. Nyamuneka ugenzure uburyo.",
        
        importSuccess: "{count} abakozi binjijwe neza!",
        importFailed: "Kwinjiza ntibyakunze. Ongera ugerageze.",
        
        rowNumber: "#",
        firstName: "Izina",
        lastName: "Iry'umuryango",
        gender: "Igitsina",
        phone: "Telefone",
        email: "Imeyili",
        nationalId: "Indangamuntu",
        district: "Akarere",
        level: "Urwego",
        
        notAvailable: "—",
      },


          workerDetails: {
        workerId: "ID y'Umukozi: {id} | Indangamuntu: {nationalId}",
        nidaVerified: "NIDA Yemeje",
        
        employments: "Akazi",
        rating: "Amanota ({count})",
        incidents: "Ibibazo",
        nidaStatus: "NIDA",
        verified: "Yemejwe",
        notVerified: "Ntiyemejwe",
        
        workerInfo: "Amakuru y'Umukozi",
        employment: "Akazi ({count})",
        currentJob: "Akazi Akora Ubu",
        
        personalInformation: "Amakuru y'Umuntu",
        phone: "Telefone",
        email: "Imeyili",
        nationalId: "Indangamuntu",
        age: "Imyaka",
        years: "imyaka",
        gender: "Igitsina",
        location: "Aho Atuye",
        experience: "Uburambe",
        registrationDate: "Itariki y'Iyandikwa",
        
        workPreferences: "Ibyo Akunda mu Kazi",
        workTypes: "Ubwoko bw'Akazi",
        languagesSpoken: "Indimi Avuga",
        preferredDistricts: "Uturere Akunda",
        minimumSalary: "Umushahara muto",
        maximumSalary: "Umushahara munini",
        
        insuranceInformation: "Amakuru y'Ubwishingizi",
        provider: "Utanga ubwishingizi",
        insuranceNumber: "Nimero y'Ubwishingizi",
        
        quickActions: "Ibikorwa Byihuse",
        markAvailable: "Shyira ahari",
        updating: "Irahindurwa...",
        deleteWorker: "Siba Umukozi",
        deleting: "Irasibwa...",
        
        referees: "Abamushyigikiye",
        
        employer: "Umushyira Akazi",
        startDate: "Itariki y'Itangiriro",
        endDate: "Itariki y'Isozera",
        duration: "Igihe",
        salary: "Umushahara",
        status: "Imiterere",
        present: "Ubu",
        days: "iminsi",
        
        currentEmployment: "Akazi Akora Ubu",
        agreedSalary: "Umushahara",
        subscriptionFee: "Amafaranga ya Serivisi",
        workDescription: "Ibisobanuro by'Akazi",
        noActiveEmployment: "Nta kazi akora ubu",
        
        markAvailableTitle: "Shyira Umukozi ahari",
        deleteTitle: "Siba Umukozi",
        markAvailableDescription: "Wiboneye ko ushyira {workerName} ahari? Ibi bizahagarika akazi aba akora ubu.",
        deleteDescription: "Wiboneye ko usiba {workerName}? Iyi gikorwa ntigishobora guhindurwa.",
        cancel: "Reka",
        confirm: "Emeza",
        processing: "Irakorwa...",
        
        notAvailable: "N/A",
        
        available: "Ahari",
        hired: "Akoreshwa",
        unavailable: "Ntahari",
        active: "Agikora",
        completed: "Byarangiye",
        terminated: "Byahagaritswe",
        pending: "Bitegereje",
        resolved: "Byakemutse",
        unresolved: "Ntibyakemutse",
        
        beginner: "Incamake",
        intermediate: "Urugero",
        expert: "Inzobere",
        
        male: "Gabo",
        female: "Gore",
      },

            addWorkerModal: {
        title: "Iyandikishe Umukozi Mushya",
        
        stepPersonal: "Umuntu",
        stepAccount: "Konti",
        stepLocation: "Aho Atuye",
        stepWork: "Akazi",
        stepInsurance: "Ubwishingizi",
        
        firstName: "Izina *",
        firstNamePlaceholder: "Ekaze",
        lastName: "Iry'umuryango *",
        lastNamePlaceholder: "Jean",
        gender: "Igitsina *",
        selectGender: "Hitamo igitsina",
        male: "Gabo",
        female: "Gore",
        dateOfBirth: "Itariki y'Amavuko *",
        dateOfBirthPlaceholder: "Hitamo itariki y'amavuko",
        nationalId: "Indangamuntu * (Imibare 16)",
        nationalIdPlaceholder: "Shyiramo nomero y'indangamuntu",
        profilePhoto: "Ifoto y'Umwirondoro",
        
        phoneNumber: "Nimero ya Telefone *",
        phonePlaceholder: "0781234567",
        email: "Imeyili *",
        emailPlaceholder: "umukozi@example.com",
        password: "Ijambo ryibanga *",
        passwordPlaceholder: "••••••••",
        confirmPassword: "Emeza Ijambo ryibanga *",
        confirmPasswordPlaceholder: "••••••••",
        
        province: "Intara *",
        selectProvince: "Hitamo intara...",
        district: "Akarere *",
        selectDistrict: "Hitamo akarere...",
        sector: "Umurenge *",
        selectSector: "Hitamo umurenge...",
        cell: "Akagari *",
        selectCell: "Hitamo akagari...",
        village: "Umudugudu *",
        selectVillage: "Hitamo umudugudu...",
        
        experienceLevel: "Urwego rw'Uburambe *",
        languagesSpoken: "Indimi Avuga *",
        workTypes: "Ubwoko bw'Akazi *",
        preferredWorkDistricts: "Uturere Akunda gukorera *",
        allDistricts: "Uturere Dutari Kumwe",
        searchDistricts: "Shakisha uturere...",
        minSalary: "Umushahara muto (RWF) *",
        minSalaryPlaceholder: "50000",
        maxSalary: "Umushahara munini (RWF) *",
        maxSalaryPlaceholder: "100000",
        
        beginner: "Incamake",
        intermediate: "Urugero (Imyaka 1-3)",
        expert: "Inzobere (Imyaka 3+)",
        
        full_time: "Igihe Cyuzuye",
        part_time: "Igice cy'Igihe",
        contract: "Amasezerano",
        temporary: "Igihe gito",
        
        kinyarwanda: "Ikinyarwanda",
        english: "Icyongereza",
        french: "Igifaransa",
        swahili: "Igiswahili",
        
        hasInsurance: "Uyu mukozi afite ubwishingizi",
        insuranceProvider: "Utanga ubwishingizi",
        insuranceProviderPlaceholder: "SONARWA",
        insuranceNumber: "Nimero y'Ubwishingizi",
        insuranceNumberPlaceholder: "INS123456",
        
        registrationSummary: "Incamake y'Iyandikwa",
        name: "Izina:",
        phone: "Telefone:",
        genderLabel: "Igitsina:",
        level: "Urwego:",
        districtLabel: "Akarere:",
        minSalaryLabel: "Umushahara muto:",
        emailLabel: "Imeyili:",
        insuranceLabel: "Ubwishingizi:",
        yes: "Yego",
        no: "Oya",
        
        cancel: "Reka",
        back: "Inyuma",
        next: "Ibikurikira",
        stepOf: "Intambwe {current} kuri {total}",
        registering: "Iriyandikisha...",
        registerWorker: "Iyandikishe Umukozi",
        
        required: "Birakenewe",
        minLength8: "Byibura inyuguti 8",
        passwordsDoNotMatch: "Ijambo ryibanga ntirihuriye",
        exactly16Digits: "Igomba kuba imibare 16",
        positiveNumber: "Igomba kuba inyuguti nziza",

        nationalIdLength: "Nomero y'indangamuntu igomba kuba imibare 16",
        
        notAvailable: "—",
      },


    },


        hiringRequests: {
      title: "Ibyifuzo byo Gukoresha",
      subtitle: "Genzura ibyifuzo byo gukoresha abakozi bituruka ku bashyira akazi",
      
      totalRequests: "Ibyifuzo Byose",
      allTime: "igihe cyose",
      thisMonth: "uku kwezi",
      pending: "Bitegereje",
      awaitingAction: "bitegereje igikorwa",
      urgent: "byihutirwa",
      accepted: "Byakiriwe",
      approved: "byemejwe",
      thisWeek: "iki cyumweru",
      responseRate: "Igipimo cy'Igisubizo",
      avgResponse: "igisubizo",
      
      requestId: "ID y'Icyifuzo",
      worker: "Umukozi",
      employer: "Umushyira Akazi",
      proposedSalary: "Umushahara",
      status: "Imiterere",
      date: "Itariki",
      actions: "Igikorwa",
      
      requests: "ibyifuzo",
      noRequestsFound: "Nta cyifuzo cyabonetse",
      noPendingRequests: "Nta cyifuzo gitegereje cyabonetse",
      noAcceptedRequests: "Nta cyifuzo cyakiriwe cyabonetse",
      noRejectedRequests: "Nta cyifuzo cyanwe cyabonetse",
      general: "Rusange",
      notAvailable: "N/A",
      
      searchPlaceholder: "Shakisha ibyifuzo...",
      
      all: "Byose",
      pending_tab: "Bitegereje",
      accepted_tab: "Byakiriwe",
      rejected_tab: "Byanze",
      
      viewDetails: "Reba Ibisobanuro",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      pending_badge: "bitegereje",
      accepted_badge: "byakiriwe",
      rejected_badge: "byanze",
      cancelled: "byahagaritswe",
      
      loadError: "Ntibishoboye gupakurura ibyifuzo byo gukoresha",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      viewRequest: "Reba ibisobanuro by'icyifuzo",

            detailsModal: {
        requestId: "Icyifuzo cyo Gukoresha #{id}",
        
        pending: "Gitegereje",
        accepted: "Cyakiriwe",
        rejected: "Cyanzwe",
        cancelled: "Cyahagaritswe",
        
        reject: "Hakana",
        accept: "Emera",
        
        salary: "Umushahara",
        proposed: "watanzwe",
        worker: "Umukozi",
        requested: "usabwa",
        employer: "Umushyira Akazi",
        requesting: "usaba",
        date: "Itariki",
        submitted: "byoherejwe",
        
        workerTab: "Umukozi",
        employerTab: "Umushyira Akazi",
        detailsTab: "Ibisobanuro",
        
        workerProfile: "Umwirondoro w'Umukozi",
        yrs: "imyaka",
        experience: "Uburambe",
        workPreferences: "Ibyo Akunda mu Kazi",
        quickStats: "Imibare Yihuse",
        workTypes: "Ubwoko bw'Akazi",
        rating: "Amanota",
        location: "Aho Atuye",
        phone: "Telefone",
        email: "Imeyili",
        age: "Imyaka",
        
        employerInformation: "Amakuru y'Umushyira Akazi",
        employerHistory: "Amateka y'Umushyira Akazi",
        requestContext: "Ibi by'Icyifuzo",
        activeWorkers: "Abakozi Bagikora",
        status: "Imiterere",
        submitted2: "Byoherejwe",
        responded: "Byasubijwe",
        
        financialDetails: "Amakuru y'Amafaranga",
        proposedSalary: "Umushahara Watanzwe",
        perMonth: "buri kwezi",
        requestDate: "Itariki y'Icyifuzo",
        employerMessage: "Ubutumwa bw'Umushyira Akazi",
        workDescription: "Ibisobanuro by'Akazi",
        companyResponse: "Igisubizo cya Sosiyete",
        respondedOn: "Byasubijwe ku {date}",
        timeline: "Igihe",
        statusInfo: "Imiterere",
        pendingStatus: "Itegereje igisubizo cya sosiyete",
        acceptedStatus: "Icyifuzo cyakiriwe",
        rejectedStatus: "Icyifuzo cyanwe",
        cancelledStatus: "Icyifuzo cyahagaritswe",
        
        paymentRequired: "Kwishyura Birakenewe",
        paymentMessage: "Amafaranga yo kwishyura rimwe arirakenewe kugirango urebe ibisobanuro byuzuye by'iki cyifuzo.",
        accessFee: "Amafaranga yo Kubona",
        whatYouGet: "Icyo ubona:",
        benefit1: "Umwirondoro wuzuye w'umukozi n'umushyira akazi",
        benefit2: "Umushahara n'amakuru y'amafaranga",
        benefit3: "Emera cyangwa hakana icyifuzo",
        benefit4: "Amateka y'ubutumwa",
        payAndView: "Ishyura & Ubone Ibisobanuro",
        processingPayment: "Ishyura rirakorwa...",
        
        acceptTitle: "Emera Icyifuzo",
        acceptDescription: "Uzuza ibisobanuro by'akazi.",
        workerInfo: "Umukozi: {name}",
        proposedInfo: "Watanzwe: {salary} buri kwezi",
        agreedSalary: "Umushahara Wemewe (RWF) *",
        agreedSalaryPlaceholder: "Injiza umushahara",
        subscriptionFee: "Amafaranga yo Kwiyandikisha (RWF)",
        subscriptionFeePlaceholder: "Bitewe",
        deduction: "Gukuramo (%)",
        deductionPlaceholder: "Bitewe",
        workDescriptionLabel: "Ibisobanuro by'Akazi",
        workDescriptionPlaceholder: "Sobanura inshingano...",
        responseMessage: "Ubutumwa bw'Igisubizo (Bitewe)",
        responseMessagePlaceholder: "Ubutumwa kuri sosiyete...",
        cancel: "Reka",
        confirmAccept: "Emeza Kwemera",
        processing: "Irakorwa...",
        
        rejectTitle: "Hakana Icyifuzo",
        rejectDescription: "Tanga impamvu. Ibi bizagaragara ku mushyira akazi.",
        from: "Bivuye: {name}",
        rejectionReason: "Impamvu yo Kwanga *",
        rejectionReasonPlaceholder: "Sobanura impamvu (byibura inyuguti 10)...",
        confirmReject: "Emeza Kwanga",
        
        requestAccepted: "Icyifuzo Cyakiriwe!",
        otpDescription: "Umushyira akazi agomba noneho kugenzura umukozi akoresheje OTP.",
        otpSent: "OTP Yoherejwe ku Mukozi",
        otpHint: "Umukozi agomba kugabanya iyi kode na sosiyete",
        workerPhone: "Telefone y'Umukozi",
        otpExpiresIn: "OTP Izakura mu",
        minutes: "iminota",
        nextSteps: "Intambwe ikurikira ku mushyira akazi:",
        step1: "Akiriza umukozi ku mbonera ahantu yagennye",
        step2: "Jya mu gice cyo Kugenzura Umukozi",
        step3: "Injiza indangamuntu y'umukozi kugirango usabe OTP",
        step4: "Saba umukozi kugabanya kode ye ya OTP",
        step5: "Injiza OTP kugirango wemeze ko umukozi yageze",
        gotIt: "Nabyumvise, Mfungura",
        
        notAvailable: "N/A",
        
        loadError: "Ntibishoboye gupakurura ibisobanuro by'icyifuzo",
        
        close: "Funga",
      },
    },

        employers: {
      title: "Gucunga Abashyira Akazi",
      subtitle: "Genzura abashyira akazi bakoresheje abakozi ba sosiyete yawe",
      
      totalEmployers: "Abashyira Akazi Bose",
      allTime: "igihe cyose",
      thisMonth: "uku kwezi",
      activeEmployments: "Akazi Gakora",
      currentWorkers: "abakozi bagikora",
      activeNow: "bagikora ubu",
      paidEmployers: "Abishyuye",
      registered: "biyandikishije",
      monthlyRevenue: "Amafaranga y'Ukwezi",
      subscriptionFees: "amafaranga yo kwiyandikisha",
      
      employer: "Umushyira Akazi",
      contact: "Aho Twandikira",
      location: "Aho Atuye",
      activeWorkers: "Abakozi Bagikora",
      totalHired: "Bakozwe Bose",
      status: "Imiterere",
      joined: "Yinjiye",
      actions: "Igikorwa",
      id: "ID",
      
      paid: "Yishyuye",
      unpaid: "Ntiyishyuye",
      notAvailable: "N/A",
      
      allEmployers: "Abashyira Akazi Bose",
      paid_tab: "Abishyuye",
      unpaid_tab: "Abatishyuye",
      
      searchPlaceholder: "Shakisha abashyira akazi...",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      noEmployersFound: "Nta mushyira akazi wabonetse",
      noPaidEmployers: "Nta mushyira akazi wishyuye wabonetse",
      noUnpaidEmployers: "Nta mushyira akazi utishyuye wabonetse",
      
      loadError: "Ntibishoboye gupakurura abashyira akazi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      viewEmployer: "Reba ibisobanuro by'umushyira akazi",

            detailsModal: {
        employer: "Umushyira Akazi",
        id: "ID: #{id}",
        paid: "Yishyuye",
        unpaid: "Ntiyishyuye",
        
        active: "Abakora",
        activeWorkers: "abakozi bagikora",
        total: "Bose",
        totalHires: "abakozwe bose",
        spent: "Yakoresheje",
        totalSpent: "yakoreshejwe",
        avgDays: "Iminsi",
        employmentAvg: "igihe",
        
        overview: "Incamake",
        workers: "Abakozi ({count})",
        history: "Amateka",
        
        employerInformation: "Amakuru y'Umushyira Akazi",
        phone: "Telefone",
        email: "Imeyili",
        location: "Aho Atuye",
        joined: "Yinjiye",
        financialSummary: "Incamake y'Amafaranga",
        totalSpentLabel: "Yakoresheje",
        subscription: "Kwiyandikisha",
        workersHired: "Abakozi Bakozwe",
        incidents: "Ibibazo",
        activeWorkersPreview: "Abakozi Bagikora",
        viewAll: "Reba Byose",
        edit: "Hindura",
        
        employmentStats: "Imibare y'Akazi",
        totalHiresStat: "Abakozwe Bose",
        activeWorkersStat: "Abakozi Bagikora",
        completedStat: "Barangiye",
        avgDuration: "Igihe",
        days: "iminsi",
        accountTimeline: "Igihe cya Konti",
        memberSince: "Umunsi Yinjiye",
        registrationStatus: "Imiterere y'Iyandikwa",
        quickActions: "Ibikorwa Byihuse",
        viewAllWorkers: "Reba Abakozi Bose",
        viewHistory: "Reba Amateka",
        
        employmentHistory: "Amateka y'Akazi",
        historyPlaceholder: "Amakuru y'amateka y'akazi azagaragazwa hano.",
        completedRecords: "{count} Inyandiko Zarangiye",
        
        editTitle: "Hindura Ibisobanuro by'Akazi",
        editDescription: "Vugurura amabwiriza n'uburyo bw'akazi",
        agreedSalary: "Umushahara (RWF)",
        salaryPlaceholder: "Amafaranga y'umushahara",
        subscriptionFee: "Amafaranga yo Kwiyandikisha (RWF)",
        feePlaceholder: "Amafaranga",
        salaryDeduction: "Igabanyo ry'Umushahara (%)",
        deductionPlaceholder: "0-100",
        workDescription: "Ibisobanuro by'Akazi",
        workDescriptionPlaceholder: "Vugurura inshingano z'akazi...",
        employmentStatus: "Imiterere y'Akazi",
        active2: "Gikora",
        completed: "Kirangiye",
        terminated: "Cyahagaritswe",
        endDate: "Itariki y'Isozera",
        endReason: "Impamvu y'Isozera",
        endReasonPlaceholder: "Impamvu yo kurangiza akazi...",
        cancel: "Reka",
        saveChanges: "Bika Ibyahinduwe",
        saving: "Irabikwa...",
        
        notAvailable: "N/A",
        
        loadError: "Ntibishoboye gupakurura amakuru y'umushyira akazi",
        
        close: "Funga",
      },

    },

        companyIncidents: {
      title: "Gucunga Ibibazo",
      subtitle: "Gukurikirana no gucunga ibibazo bigize uruhare mu bakozi bawe",
      
      reportIncident: "Tangaza Ikibazo",
      refresh: "Vugurura",
      
      totalIncidents: "Ibibazo Byose",
      allTime: "igihe cyose",
      thisMonth: "uku kwezi",
      openCases: "Ibibazo Bifunguye",
      requiresAction: "bikeneye igikorwa",
      urgent: "byihutirwa",
      thisMonthStats: "Uku Kwezi",
      recentIncidents: "ibibazo biheruka",
      latest: "ubiheruka",
      resolved: "Byakemutse",
      closedCases: "byafunzwe",
      
      incidentNumber: "Ikibazo #",
      worker: "Umukozi",
      type: "Ubwoko",
      severity: "Uburemere",
      date: "Itariki",
      status: "Imiterere",
      actions: "Igikorwa",
      assignedOfficer: "Ofisiye Washinzwe",
      resolvedDate: "Itariki Yakemutseho",
      
      noPhone: "Nta telefone",
      notAssigned: "Ntawashinzwe",
      incidents: "ibibazo",
      
      allIncidents: "Ibibazo Byose",
      reported: "Byatangajwe",
      investigation: "Iperereza",
      resolved_tab: "Byakemutse",
      
      noIncidentsFound: "Nta kibazo cyabonetse",
      noReportedIncidents: "Nta kibazo cyatangajwe cyabonetse",
      noInvestigationIncidents: "Nta kibazo kiri mu iperereza",
      noResolvedIncidents: "Nta kibazo cyakemutse cyabonetse",
      
      searchPlaceholder: "Shakisha ibibazo...",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      critical: "Bikomeye Cyane",
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      reported_status: "byatangajwe",
      under_investigation: "biri mu iperereza",
      resolved_status: "byakemutse",
      dismissed: "byanze",
      
      theft: "Ubujura",
      violence: "Urugomo",
      negligence: "Kwirengagiza",
      breach_of_contract: "Kurenga ku Masezerano",
      misconduct: "Ikosa ry'Umwuga",
      other: "Ibindi",
      
      loadError: "Ntibishoboye gupakurura ibibazo",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
      
      viewDetails: "Reba ibisobanuro by'ikibazo",

            createModal: {
        title: "Tangaza Ikibazo Gishya",
        description: "Tangaza ikibazo kigize uruhare mu mukozi wawe",
        
        worker: "Umukozi",
        workerRequired: "Umukozi *",
        workerPlaceholder: "Shakisha umukozi...",
        incidentDate: "Itariki y'Ikibazo",
        incidentDateRequired: "Itariki y'Ikibazo *",
        incidentType: "Ubwoko bw'Ikibazo",
        incidentTypeRequired: "Ubwoko bw'Ikibazo *",
        typePlaceholder: "Shakisha ubwoko...",
        severity: "Uburemere",
        severityRequired: "Uburemere *",
        severityPlaceholder: "Shakisha uburemere...",
        incidentLocation: "Ahantu habereye Ikibazo",
        locationPlaceholder: "Ahantu ikibazo cyabereye",
        descriptio2: "Ibisobanuro",
        descriptionRequired: "Ibisobanuro *",
        descriptionPlaceholder: "Sobanura ikibazo mu buryo burambuye...",
        descriptionHint: "Byibura inyuguti 20 zirakenewe",
        
        notifyPolice: "Menyesha polisi ako kanya",
        
        cancel: "Reka",
        reportIncident: "Tangaza Ikibazo",
        reporting: "Biratangazwa...",
        
        theft: "Ubujura",
        violence: "Urugomo",
        negligence: "Kwirengagiza",
        breach_of_contract: "Kurenga ku Masezerano",
        misconduct: "Ikosa ry'Umwuga",
        other: "Ibindi",
        
        low: "Buke",
        medium: "Buringaniye",
        high: "Bikomeye",
        critical: "Bikomeye Cyane",
        
        workerOption: "{name} (ID: {id})",
      },

            detailsModal: {
        type: "Ubwoko",
        incidentType: "ubwoko bw'ikibazo",
        date: "Itariki",
        occurredOn: "cyabereye",
        involved: "Uruhare",
        officer: "Ofisiye",
        
        workerInvolved: "Umukozi",
        noWorker: "Nta Mukozi",
        notAssigned: "ntawashinzwe",
        policeAssigned: "Polisi yashinzwe",
        awaitingAssignment: "itegereje gushingwa",
        assigned: "Yashinzwe",
        pending: "Itegereje",
        
        details: "Ibisobanuro",
        workerInfo: "Amakuru y'Umukozi",
        evidence: "Ibimenyetso",
        
        incidentInformation: "Amakuru y'Ikibazo",
        severity: "Uburemere",
        status: "Imiterere",
        incidentLocation: "Ahantu habereye Ikibazo",
        description: "Ibisobanuro",
        investigationDetails: "Amakuru y'Iperereza",
        assignedOfficer: "Ofisiye Washinzwe",
        assignedOn: "Yashinzwe ku",
        noOfficerAssigned: "Nta ofisiye wa polisi washinzwe",
        incidentTimeline: "Igihe cy'Ikibazo",
        reported: "Byatangajwe",
        incidentDate: "Itariki y'Ikibazo",
        assignedToPolice: "Yashinzwe Polisi",
        resolved: "Byakemutse",
        
        workerInformation: "Amakuru y'Umukozi",
        involvedWorker: "Umukozi Ufitiye Isano",
        phone: "Telefone",
        email: "Imeyili",
        district: "Akarere",
        employer: "Umushyira Akazi",
        name: "Izina",
        noWorkerInfo: "Nta Makuru y'Umukozi",
        noWorkerAssociated: "Nta mukozi ufitiye isano n'iki kibazo.",
        
        evidenceFiles: "Dosiye z'Ibimenyetso",
        evidenceNumber: "Ikimenyetso {number}",
        clickToView: "Kanda kureba",
        noEvidenceFiles: "Nta dosive y'ibimenyetso yashyizweho",
        policeNotes: "Inyandiko za Polisi",
        resolutionDetails: "Ibisobanuro ku Gisubizo",
        
        edit: "Hindura",
        delete: "Siba",
        
        editTitle: "Hindura Ikibazo",
        editDescription: "Vugurura amakuru y'ikibazo (biboneka gusa ku bibazo bya \"byatangajwe\" kandi bitarashinzwe polisi)",
        incidentTypeLabel: "Ubwoko bw'Ikibazo",
        severityLabel: "Uburemere",
        incidentLocationLabel: "Ahantu habereye Ikibazo",
        locationPlaceholder: "Ahantu ikibazo cyabereye",
        descriptionLabel: "Ibisobanuro *",
        descriptionPlaceholder: "Sobanura ikibazo mu buryo burambuye...",
        cancel: "Reka",
        saveChanges: "Bika Ibyahinduwe",
        saving: "Irabikwa...",
        
        deleteTitle: "Siba Ikibazo",
        deleteDescription: "Wiboneye ko usiba iki kibazo? Iyi gikorwa ntigishobora guhindurwa.",
        deleteNote: "Icyitonderwa: Bishoboka gusa ku bibazo bya \"byatangajwe\" kandi bitarashinzwe polisi.",
        deleting: "Irasibwa...",
        confirmDelete: "Siba",
        
        notAvailable: "N/A",
        
        worker: "Umukozi",
        noWorkerLabel: "Nta Mukozi",
        
        theft: "Ubujura",
        violence: "Urugomo",
        negligence: "Kwirengagiza",
        breach_of_contract: "Kurenga ku Masezerano",
        misconduct: "Ikosa ry'Umwuga",
        other: "Ibindi",
        
        low: "Buke",
        medium: "Buringaniye",
        high: "Bikomeye",
        critical: "Bikomeye Cyane",
        
        reported_status: "byatangajwe",
        under_investigation: "biri mu iperereza",
        resolved_status: "byakemutse",
        dismissed: "byanze",
      },
    },

        companyTransactions: {
      title: "Gucunga Ubucuruzi",
      subtitle: "Gukurikirana no gusesengura ubucuruzi bwose n'inyungu bya sosiyete",
      
      export: "Ohereza",
      refresh: "Vugurura",
      
      totalRevenue: "Amafaranga Yose Yinjije",
      allTime: "igihe cyose",
      thisMonth: "uku kwezi",
      totalTransactions: "Ubucuruzi Bwose",
      completed: "bwuzuye",
      successRate: "{rate}% intsinzi",
      pending: "Bitegereje",
      awaitingPayment: "bitegereje kwishyura",
      requiresAction: "bikeneye igikorwa",
      failed: "Bwananiwe",
      unsuccessful: "ntibyakunze",
      rate: "{rate}%",
      
      transactionId: "ID y'Ubucuruzi",
      type: "Ubwoko",
      amount: "Amafaranga",
      status: "Imiterere",
      paymentMethod: "Uburyo bwo Kwishyura",
      date: "Itariki",
      actions: "Igikorwa",
      created: "Yakozwe",
      description: "Ibisobanuro",
      
      noDescription: "Nta bisobanuro",
      transactions: "ubucuruzi",
      total: "Yose: {amount}",
      totalRevenue2: "Amafaranga Yose: {amount}",
      totalPending: "Bitegereje Yose: {amount}",
      
      allTransactions: "Ubucuruzi Bwose",
      revenue: "Inyungu",
      pending2: "Bitegereje",
      
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      searchPlaceholder: "Shakisha ubucuruzi...",
      
      monthlyRevenue: "Amafaranga ya buri kwezi (Amezi 6 ashize)",
      months: "amezi",
      revenueByType: "Inyungu ku bwoko bw'Ubucuruzi",
      types: "ubwoko",
      dailyRevenue: "Amafaranga ya buri munsi (Iminsi 30 ishize)",
      days: "iminsi",
      transactionTypeSummary: "Incamake y'Ubwoko bw'Ubucuruzi",
      
      noTransactionsFound: "Nta bucuruzi bwabonetse",
      noRevenueData: "Nta makuru y'inyungu aboneka",
      noCompletedTransactions: "Nta bucuruzi bwuzuye bwabonetse",
      noPendingTransactions: "Nta bucuruzi butegereje bwabonetse",
      
      recentTransactions: "Ubucuruzi Buheruka (Iminsi 7 ishize)",
      
      completed_status: "bwuzuye",
      pending_status: "bitegereje",
      failed_status: "byananiranye",
      refunded: "byagarutse",
      
      subscription_fee: "Kwiyandikisha",
      salary_deduction: "Gukuramo Umushahara",
      worker_registration: "Iyandikwa ry'Umukozi",
      employer_registration: "Iyandikwa ry'Umushyira Akazi",
      company_registration: "Iyandikwa rya Sosiyete",
      
      notAvailable: "N/A",
      
      showing: "Erekana",
      to: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      viewDetails: "Reba ibisobanuro by'ubucuruzi",
      
      loadError: "Ntibishoboye gupakurura ubucuruzi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",

            detailsModal: {
        transactionNumber: "Ubucuruzi #{id}",
        copyId: "Kwandukura ID",
        receipt: "Icyemezo",
        
        amount: "Amafaranga",
        method: "Uburyo",
        paymentMethod: "uburyo bwo kwishyura",
        entity: "Icyerekezo",
        created: "Yakozwe",
        transactionDate: "itariki y'ubucuruzi",
        
        details: "Ibisobanuro",
        relatedEntity: "Icyerekezo",
        actions: "Ibikorwa",
        
        transactionInformation: "Amakuru y'Ubucuruzi",
        transactionType: "Ubwoko bw'Ubucuruzi",
        paymentMethodLabel: "Uburyo bwo Kwishyura",
        paymentReference: "Reference y'Ishyura",
        paymentPhone: "Telefone yo Kwishyura",
        description: "Ibisobanuro",
        failureReason: "Impamvu y'ubusiba",
        additionalInformation: "Amakuru Yiyongera",
        
        statusInformation: "Amakuru y'Imiterere",
        currentStatus: "Imiterere y'ubu",
        failedReason: "Impamvu y'ubusiba",
        timeline: "Igihe",
        createdAt: "Yakozwe",
        paidAt: "Yishyuwe",
        transactionId: "ID y'Ubucuruzi",
        
        workerInformation: "Amakuru y'Umukozi",
        employerInformation: "Amakuru y'Umushyira Akazi",
        companyInformation: "Amakuru ya Sosiyete",
        
        availableActions: "Ibikorwa Bishoboka",
        viewReceipt: "Reba Icyemezo",
        copyTransactionId: "Kwandukura ID",
        copyFullDetails: "Kwandukura Ibisobanuro Byose",
        copyReceiptText: "Kwandukura Umwandiko w'Icyemezo",
        quickInformation: "Amakuru Yihuse",
        
        worker: "Umukozi",
        employer: "Umushyira Akazi",
        company: "Sosiyete",
        
        completed: "bwuzuye",
        pending: "bitegereje",
        failed: "byananiranye",
        refunded: "byagarutse",
        
        copiedToClipboard: "Byandukuwe mu clipboard",
        
        notAvailable: "N/A",
        status: "Imiterere",
        copyIdTooltip: "Kwandukura ID y'ubucuruzi",
      },

    },


        companyProfile: {
      title: "Umwirondoro wa Sosiyete",
      subtitle: "Reba unagenzure amakuru ya sosiyete yawe",
      
      editProfile: "Hindura Umwirondoro",
      cancel: "Reka",
      saveChanges: "Bika Ibyahinduwe",
      saving: "Irabikwa...",
      
      tin: "TIN: {tin} · ID: {id}",
      since: "Kuva {date}",
      workers: "{count} abakozi",
      totalRevenue: "Amafaranga Yose Yinjije",
      approved: "Yemejwe {date}",
      workerOccupancyRate: "Igipimo cy'Abakozi",
      activeAvailable: "{active} bakora · {available} bahari",
      total: "{total} bose",
      
      totalWorkers: "Abakozi Bose",
      activeWorkers: "Abakozi Bagikora",
      activeEmployments: "Akazi Gakora",
      pendingRequests: "Ibyifuzo Bitegereje",
      incidents: "Ibibazo",
      avgRating: "Amanota",
      
      overview: "Incamake",
      workers2: "Abakozi",
      financial: "Imari",
      documents: "Inyandiko",
      
      companyDetails: "Amakuru ya Sosiyete",
      businessName: "Izina ry'Ubucuruzi",
      tinLabel: "TIN",
      physicalAddress: "Aderesi",
      registered: "Yanditswe",
      approvedLabel: "Yemejwe",
      location: "Aho Iherereye",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      ownerContact: "Nyir'ubwite / Umuntu wo Guhugira",
      ownerName: "Izina rya Nyir'ubwite",
      ownerPhone: "Telefone ya Nyir'ubwite",
      ownerEmail: "Imeyili ya Nyir'ubwite",
      ownerRole: "Nyir'ubwite wa Sosiyete",
      
      workersByCategory: "Abakozi ku Byiciro",
      noCategoryData: "Nta makuru y'ibyiciro aboneka.",
      recentPlacements: "Abashyizwe mu Kazi Vuba",
      noRecentPlacements: "Nta bashyizwe mu kazi vuba.",
      
      subscriptionFee: "Amafaranga yo Kwiyandikisha",
      monthly: "Buri kwezi",
      salaryDeduction: "Igabanyo ry'Umushahara",
      perWorkerHired: "Ku mukozi wakozwe",
      feesCollected: "Amafaranga Yakusanyirijwe",
      allTimeRegistrationFees: "Amafaranga y'iyandikwa yose",
      totalRevenueLabel: "Amafaranga Yose Yinjije",
      allTimeGross: "Amafaranga yose",
      contractPerformance: "Imikorere y'Amasezerano",
      completed: "Byarangiye",
      completionRate: "Igipimo cy'ibyarangiye",
      totalContracts: "{count} byose · {employers} abakoresha bagikora",
      
      companyDocuments: "Inyandiko za Sosiyete",
      businessRegistration: "Iyandikwa ry'Ubucuruzi",
      tinCertificate: "Icyemezo cya TIN",
      operatingLicense: "Uruhushya rwo Gukora",
      date: "Itariki: {date}",
      awaitingUpload: "Itegereje gushyirwaho",
      
      approved2: "Yemejwe",
      pending: "Itegereje",
      rejected: "Yanzwe",
      suspended: "Yahagaritswe",
      active: "Igikora",
      completed_status: "Byarangiye",
      verified: "Yemejwe",
      
      loadError: "Ntibishoboye gupakurura umwirondoro wa sosiyete. Ongera ugerageze.",
      
      notAvailable: "—",
      
      RWF: "RWF",
      M: "M",
    },
    

},

// =================================================================== COMPANY ==============================================================



// ======================================================================= POLICE =================================================================

police: {
  policeHeader: {
    defaultName:    "Polisi y'Igihugu cy'u Rwanda",
    roleLabel:      "Ofisiye wa Polisi",
    navigation:     "Uburyo bwo Kugenda",
    statistics:     "Imibare",
    policeProfile:  "Umwirondoro wa Polisi",
    notifications: {
      system:               "Sisitemu",
      newLabel:             "Rishya",
      emptyTitle:           "Nta mamenyesha",
      noNotifications:      "Nta mamenyesha ufite ubu.",
      noUnread:             "Nta mamenyesha adasomwe ufite.",
      noRead:               "Nta mamenyesha asomwe ufite.",
      badgeIncident:        "IKIBAZO",
      badgeAssigned:        "WAHEREWE",
      badgeResolved:        "BYAKEMUTSE",
      badgeUrgent:          "BYIHUTIRWA",
      badgeSystem:          "SISITEMU",
      badgeVerify:          "GENZURA",
      badgeInfo:            "AMAKURU",
      statsTotal:           "Yose",
      statsUnread:          "Adasomwe",
      statsRead:            "Asomwe",
      statsTypes:           "Ubwoko",
      tabAll:               "Yose",
      tabUnread:            "Adasomwe",
      tabRead:              "Asomwe",
      filterPlaceholder:    "Shungura ubwoko",
      filterAll:            "Ubwoko Bwose",
      filterIncidents:      "Ibibazo",
      filterPayments:       "Ubwishyu",
      filterSystem:         "Sisitemu",
      filterRegistrations:  "Iyandikwa",
    },
  },

    policeProfile: {
    // Page
    pageTitle: "Umwirondoro w'Umupolisi",
    pageSubtitle: "Gucunga umwirondoro wawe no kureba raporo z'ibibazo",
    loadError: "Kwinjiza umwirondoro byanze",
    loadErrorHint: "Gerageza kongera gusunika paji cyangwa watumanahana niba ikibazo gikomeje.",

    // Header buttons
    changePassword: "Hindura Ijambo Banga",
    editProfile: "Hindura Umwirondoro",
    saveChanges: "Bika Impinduka",
    saving: "Birabikwa...",
    cancel: "Reka",
    changePhoto: "Hindura ifoto y'umwirondoro",

    // Password dialog
    changePasswordDesc: "Injiza ijambo banga ry'ubu hanyuma uhitemo rishya.",
    currentPassword: "Ijambo Banga ry'ubu",
    newPassword: "Ijambo Banga Rishya",
    confirmNewPassword: "Emeza Ijambo Banga Rishya",
    changing: "Birahindurwa...",

    // Hero card
    verifiedOfficer: "Umupolisi Wemejwe",
    since: "Kuva",
    totalIncidents: "Ibibazo Byose",
    thisMonth: "ukwezi kw'uyu mwaka",

    // Stat cards
    statPending: "Bitegereje",
    statPendingSub: "Bitegereje isuzumwa",
    statInvestigating: "Gusuzumwa",
    statInvestigatingSub: "Munsi y'iperereza",
    statResolved: "Byakemutse",
    statResolvedSub: "Byarangiye",
    statVerified: "Byemejwe",
    statVerifiedSub: "Raporo zemejwe",
    statClosed: "Bifunzwe",

    // Tabs
    tabOverview: "Incamake",
    tabIncidents: "Ibibazo",
    tabStatistics: "Imibare",
    tabDocuments: "Inyandiko",

    // Sections
    sectionPersonal: "Amakuru Bwite",
    sectionPoliceDetails: "Amakuru y'Ubupolisi",
    sectionLocation: "Aho Atuye",

    // Form fields
    fieldName: "Amazina Yose",
    fieldEmail: "Imeyili",
    fieldPhone: "Telefoni",
    fieldNationalId: "Indangamuntu",
    fieldDob: "Itariki y'Amavuko",
    fieldGender: "Igitsina",
    selectGender: "Hitamo igitsina",
    genderMale: "Gabo",
    genderFemale: "Gore",
    genderOther: "Ikindi",
    fieldBadge: "Nimero y'Icyifuzo",
    fieldStation: "Komisiyo ya Polisi",
    fieldRank: "Urwego",
    fieldVerificationStatus: "Imimerere y'Kwemezwa",
    fieldVerifiedOn: "Yemejwe Ku",
    field_district: "Akarere",
    field_sector: "Umurenge",
    field_cell: "Akagari",
    field_village: "Umudugudu",
    fieldAddress: "Aderesi",

    // Status labels
    statusReported: "Byatangarijwe",
    statusInvestigating: "Gusuzumwa",
    statusResolved: "Byakemutse",
    statusClosed: "Bifunzwe",
    statusPending: "Bitegereje",
    statusVerified: "Byemejwe",
    statusActive: "Birakora",

    // Incidents tab
    recentIncidents: "Ibibazo Bishya",
    total: "byose",
    noIncidents: "Nta Bibazo",
    noIncidentsSub: "Nta bibazo byatangarijwe kugeza ubu.",
    verified: "Byemejwe",
    reporter: "Uwabitangarije",
    worker: "Umukozi",
    employer: "Umukoresha",
    company: "Ikigo",
    incidentsByType: "Ibibazo Ukurikije Ubwoko",
    resolutionRate: "Igipimo cyo gukemura",
    resolved: "byakemutse",
    pending: "bitegereje",

    // Statistics tab
    incidentStatus: "Imimerere y'Ibibazo",
    legalActions: "Ibikorwa bya Gacaca",
    verifiedReports: "Raporo Zemejwe",
    escalatedToCourt: "Zoherejwe Inkiko",
    thisMonthStat: "Ukwezi Gushije",
    performanceOverview: "Incamake y'Imikorere",
    verificationRate: "Igipimo cyo Kwemeza",

    // Documents tab
    yourDocuments: "Inyandiko Zawe",
    docNationalId: "Indangamuntu",
    docBadge: "Icyemezo cy'Icyifuzo",
    docTraining: "Icyemezo cy'Amahugurwa ya Polisi",
    docVerification: "Kwemezwa kw'Umwirondoro",
    verifiedOn: "Yemejwe",
    awaitingVerification: "Itegereje kwemezwa",
  },

      policeStats: {
      title: "Dashibodi ya Polisi",
      subtitle: "Gukurikirana no gucunga raporo z'ibibazo",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      selectPeriod: "Hitamo igihe",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      export: "Ohereza",
      clear: "Kuraho",
      showingDataFrom: "Erekana amakuru kuva",
      
      totalIncidents: "Ibibazo Byose",
      pendingReview: "Bitegereje Gusuzumwa",
      resolved: "Byakemutse",
      criticalCases: "Ibibazo Bikomeye",
      
      inPeriod: "muri iki gihe",
      awaitingAction: "bitegereje igikorwa",
      urgent: "byihutirwa",
      vsPrevious: "ugereranyije n'ibyabanje",
      
      verifiedWorkers: "Abakozi Bemejwe",
      avgResponseTime: "Igihe cy'isubizo",
      resolutionRate: "Igipimo cy'ibyakemutse",
      activeCases: "Ibibazo Bikorwa",
      
      overview: "Incamake",
      recentIncidents: "Ibibazo Biheruka",
      
      quickSummary: "Incamake Yihuse",
      totalCases: "Ibibazo Byose",
      pending: "Bitegereje",
      
      criticalCasesTitle: "Ibibazo Bikomeye",
      worker: "Umukozi",
      location: "Aho biri",
      noCriticalCases: "Nta bibazo bikomeye",
      
      id: "INDANGAMUNTU",
      type: "Ubwoko",
      severity: "Uburemere",
      status: "Imiterere",
      date: "Itariki",
      incidents: "ibibazo",
      
      severityHigh: "Bikomeye",
      severityCritical: "Bikomeye Cyane",
      severityMedium: "Buringaniye",
      severityLow: "Buke",
      
      statusPending: "Bitegereje",
      statusReported: "Byatangajwe",
      statusInvestigating: "Buri kurondorwa",
      statusUnderInvestigation: "Buri kurondorwa",
      statusResolved: "Byakemutse",
      
      loadError: "Ntibishoboye gupakurura amakuru ya dashibodi",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo kikomeje.",
    },

      incidentsManagement: {
      title: "Gucunga Ibibazo",
      subtitle: "Suzuma, kurondora, no gucunga raporo zose z'ibibazo",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      selectPeriod: "Hitamo igihe",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      export: "Ohereza",
      clear: "Kuraho",
      showingDataFrom: "Erekana amakuru kuva",
      
      total: "Byose",
      pending: "Bitegereje",
      investigating: "Buri kurondorwa",
      resolved: "Byakemutse",
      incidents: "ibibazo",
      awaiting: "bitegereje",
      inProgress: "biri gukorwa",
      closed: "byafunzwe",
      
      searchPlaceholder: "Shakisha ukoresheje ID, umukozi, cyangwa ubwoko...",
      severity: "Uburemere",
      allSeverity: "Uburemere Bwose",
      critical: "Bikomeye Cyane",
      high: "Bikomeye",
      medium: "Buringaniye",
      low: "Buke",
      
      incidentId: "ID y'Ikibazo",
      type: "Ubwoko",
      worker: "Umukozi",
      location: "Aho biri",
      severity2: "Uburemere",
      status: "Imiterere",
      reported: "Byatangajwe",
      actions: "Igikorwa",
      id: "ID",
      
      all: "Byose",
      pending_tab: "Bitegereje",
      investigating_tab: "Buri kurondorwa",
      resolved_tab: "Byakemutse",
      
      noIncidentsFound: "Nta bibazo bibonetse",
      failedToLoad: "Ntibishoboye gupakurura ibibazo",
      
      showing: "Erekana",
      to2: "kugeza",
      of: "kuri",
      results: "ibisubizo",
      page: "Paji",
      previous: "Ibiri Inyuma",
      next: "Ibikurikira",
      
      viewDetails: "Reba Ibisobanuro",
      
      loadError: "Ntibishoboye gupakurura ibibazo",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga.",
    },

      policeStatistics: {
    title: "Imibare y'Iperereza & Statistike",
    subtitle: "Imibare y'ibibazo no kwemeza ba serivisi mu buryo bushushanyije",
    loadError: "Gukesha statistike byanze",

    // Filter bar
    from: "Kuva",
    to: "Kugeza",
    startDate: "Itariki yo gutangira",
    endDate: "Itariki yo kurangira",
    clear: "Siba",
    selectPeriod: "Hitamo igihe",
    last7Days: "Iminsi 7 ishize",
    last30Days: "Iminsi 30 ishize",
    last90Days: "Iminsi 90 ishize",
    thisMonth: "Ukwezi kw'uyu mwaka",
    lastMonth: "Ukwezi gushize",
    customRange: "Igihe Wihitiramwo",
    export: "Rohereza",
    showingDataFrom: "Werekana amakuru kuva",

    // Stat cards
    totalIncidents: "Ibibazo Byose",
    inPeriod: "mu gihe",
    topType: "Ubwoko Bwa mbere",
    cases: "indwara",
    topDistrict: "Akarere Ka mbere",
    incidents: "Ibibazo",
    verifiedWorkers: "Ba Serivisi Bemejwe",
    workersVerified: "ba serivisi bemejwe",

    // Tabs
    trends: "Imiterere",
    types: "Ubwoko",
    districts: "Uturere",
    verification: "Kwemeza",

    // Chart titles
    incidentTrendsTitle: "Imiterere y'Ibibazo mu Gihe",
    incidentsByCategoryTitle: "Ibibazo Ukurikije Icyiciro",
    typeDistributionTitle: "Ikwirakwizwa ry'Ubwoko bw'Ibibazo",
    typeStatsTitle: "Statistike z'Ibibazo Ukurikije Ubwoko",
    districtChartTitle: "Ibibazo Ukurikije Akarere (Kigali)",
    verificationTrendsTitle: "Imiterere yo Kwemeza ba Serivisi",
    totalIncidentsReported: "Ibibazo byose byatangarijwe",
    ofTotalIncidents: "by'ibibazo byose",

    // Chart legends
    legendTotal: "Ibibazo Byose",
    legendAssault: "Gukubita",
    legendTheft: "Ubujura",
    legendDispute: "Impaka",
    legendMisconduct: "Imyitwarire Mibi",
    legendVerified: "Ba Serivisi Bemejwe",
    legendPending: "Bategereje Kwemezwa",
  },

    

        incidentDetails: {
      incidentNumber: "Ikibazo #",
      printReport: "Capa Raporo",
      
      severity: "Uburemere",
      level: "urwego",
      date: "Itariki",
      incidentDate: "itariki y'ikibazo",
      location: "Aho biri",
      incidentSite: "ahantu habereye ikibazo",
      status: "Imiterere",
      current: "ubu",
      
      overview: "Incamake",
      worker: "Umukozi",
      employer: "Umukoresha",
      actions: "Igikorwa",
      
      incidentDetails: "Ibisobanuro by'Ikibazo",
      description: "Ibisobanuro",
      noDescription: "Nta bisobanuro byatanzwe",
      type: "Ubwoko",
      reportedDate: "Itariki yatangijweho",
      locationInformation: "Amakuru y'ahantu",
      incidentLocation: "Ahantu habereye ikibazo",
      notSpecified: "Ntibyagenwe",
      locationWhereIncidentOccurred: "Ahantu ikibazo cyabereye",
      policeNotes: "Inyandiko za Polisi",
      timeline: "Igihe",
      reported: "Byatangajwe",
      resolved: "Byakemutse",
      
      
      workerId: "ID y'Umukozi",
      nationalId: "Indangamuntu",
      phone: "Telefone",
      gender: "Igitsina",
      email: "Imeyili",
      district: "Akarere",
      sector: "Umurenge",
      cell: "Akagari",
      village: "Umudugudu",
      workerStatistics: "Imibare y'Umukozi",
      averageRating: "Amanota y'Urutonde",
      totalEmployments: "Akazi Kose",
      totalRatings: "Amanota Yose",
      totalIncidents: "Ibibazo Byose",
      noWorkerInfo: "Nta makuru y'umukozi aboneka",
      
      employerId: "ID y'Umukoresha",
      phoneNumber: "Nimero ya Telefone",
      emailAddress: "Aderesi ya Imeyili",
      employerStatistics: "Imibare y'Umukoresha",
      activeWorkers: "Abakozi Bakora",
      totalWorkersHired: "Abakozi Bakozwe",
      incidentsReported: "Ibibazo Byatangajwe",
      noEmployerInfo: "Nta makuru y'Umukoresha aboneka",
      
      updateStatus: "Hindura Imiterere",
      newStatus: "Imiterere mishya",
      selectStatus: "Hitamo imiterere",
      underInvestigation: "Iri kurondorwa",
      resolved_status: "Ryakemutse",
      dismissed: "Rwanze",
      escalated: "Ryazamuwe",
      updating: "Irahindurwa...",
      updateStatusBtn: "Hindura Imiterere",
      addInvestigationNotes: "Ongeraho Inyandiko z'iperereza",
      notes: "Inyandiko",
      notesPlaceholder: "Andika inyandiko zawe z'iperereza hano...",
      addNotes: "Ongeraho Inyandiko",
      adding: "Iraongerwaho...",
      
      enterNotes: "Nyamuneka andika inyandiko",
      notesAdded: "Inyandiko zongereweho neza",
      notesFailed: "Ntibishoboye kongeraho inyandiko",
      selectStatusMessage: "Nyamuneka hitamo imiterere",
      statusUpdated: "Imiterere yahinduwe neza",
      statusFailed: "Ntibishoboye guhindura imiterere",
      
      severityCritical: "BIKOMEYE CYANE",
      severityHigh: "BIKOMEYE",
      severityMedium: "BURINGANIYE",
      severityLow: "BUKE",
      
      statusReported: "BYATANGAJWE",
      statusUnderInvestigation: "BIRI KURONDORWA",
      statusResolved: "BYAKEMUTSE",
      statusDismissed: "BYANZWE",
      statusEscalated: "BYAZAMUWE",
      
      male: "Gabo",
      female: "Gore",
      other: "Ibindi",
    },




},

// ======================================================================= POLICE =================================================================



// ====================================================================== SUPERVISOR ==============================================================

supervisor: {
  supervisorHeader: {
    defaultName:        "Umuyobozi w'Ubutegetsi",
    roleLabel:          "Umuyobozi",
    navigation:         "Uburyo bwo Kugenda",
    totalUsers:         "Abakoresha Bose",
    finance:            "Imari",
    systemUsage:        "Ikoreshwa rya Sisitemu",
    supervisorProfile:  "Umwirondoro w'Umuyobozi",
    notifications: {
      system:               "Sisitemu",
      newLabel:             "Rishya",
      emptyTitle:           "Nta mamenyesha",
      noNotifications:      "Nta mamenyesha ufite ubu.",
      noUnread:             "Nta mamenyesha adasomwe ufite.",
      noRead:               "Nta mamenyesha asomwe ufite.",
      badgeAlert:           "IMPURUZA",
      badgePayment:         "UBWISHYU",
      badgeSystem:          "SISITEMU",
      badgeNew:             "RISHYA",
      badgeCompany:         "SOSIYETE",
      badgeWorker:          "UMUKOZI",
      badgeEmployer:        "Umukoresha",
      badgeInfo:            "AMAKURU",
      statsTotal:           "Yose",
      statsUnread:          "Adasomwe",
      statsRead:            "Asomwe",
      statsTypes:           "Ubwoko",
      tabAll:               "Yose",
      tabUnread:            "Adasomwe",
      tabRead:              "Asomwe",
      filterPlaceholder:    "Shungura ubwoko",
      filterAll:            "Ubwoko Bwose",
      filterIncidents:      "Ibibazo",
      filterPayments:       "Ubwishyu",
      filterSystem:         "Sisitemu",
      filterCompanies:      "Amasosiyete",
      filterWorkers:        "Abakozi",
      filterEmployers:      "Abashyira Akazi",
      filterRegistrations:  "Iyandikwa",
    },
  },

  supervisorStats: {
  // Error state
  loadError:          "Ntibishoboye gupakurura amakuru ya dashibordi",
  loadErrorHint:      "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga niba ikibazo gikomeje.",

  // Header
  title:              "Dashibordi y'Umuyobozi",
  subtitle:           "Genzura imibare y'ubutegetsi bwose n'ibikorwa by'abakoresha",

  // Date filter UI
  from:               "Kuva",
  to:                 "Kugeza",
  startDate:          "Itariki ntangiriro",
  endDate:            "Itariki isozera",
  selectPeriod:       "Hitamo igihe",
  last7Days:          "Iminsi 7 Ishize",
  last30Days:         "Iminsi 30 Ishize",
  last90Days:         "Iminsi 90 Ishize",
  thisMonth:          "Ukwezi Kuno",
  lastMonth:          "Ukwezi Gushize",
  customRange:        "Igihe Gihitanywe",
  export:             "Ohereza",
  showingFrom:        "Werekana amakuru kuva",

  // Main stat cards
  statTotalUsers:     "Abakoresha Bose",
  statAllTypes:       "ubwoko bwose",
  statThisMonth:      "ukwezi kuno",
  statActiveSessions: "Ibikorwa Bikorerwa",
  statOnlineNow:      "bari kumurongo ubu",
  statVsYesterday:    "ugereranyije na ejo",
  statTotalRevenue:   "Amafaranga Yose",
  statSystemHealth:   "Ubuzima bwa Sisitemu",
  statUptime:         "igihe ikorera",
  statVsLastWeek:     "ugereranyije n'icyumweru gishize",

  // Secondary stats bar
  secondaryWorkers:   "Abakozi",
  secondaryEmployers: "Abashyira Akazi",
  secondaryCompanies: "Amasosiyete",
  secondaryPolice:    "Abapolisi",

  // Tabs
  tabUserBreakdown:   "Urutonde rw'Abakoresha",
  tabRecentActivity:  "Ibikorwa Biheruka",

  // User Breakdown tab
  userDistribution:   "Ikwirakwizwa ry'Abakoresha",
  total:              "yose",
  colUserType:        "Ubwoko bw'Umukoresha",
  colCount:           "Umubare",
  colStatus:          "Imiterere",
  colPercentage:      "Igabanyo",

  // Recent Activity tab
  recentActivity:     "Ibikorwa Biheruka",
  last24Hours:        "Amasaha 24 Ashize",
},

    userAnalytics: {
      title: "Ibarura ry'Abakoresha",
      subtitle: "Ibisobanuro birambuye ku bwoko bwose bw'abakoresha muri sisitemu",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      selectPeriod: "Hitamo igihe",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      export: "Ohereza",
      clear: "Kuraho",
      showingDataFrom: "Erekana amakuru kuva",
      totalUsers: "Abakoresha Bose",
      
      activeUsers: "Abakoresha Bagikora",
      newRegistrations: "Iyandikwa Rishya",
      avgSessionTime: "Igihe cy'ikoreshwa",
      verifiedAccounts: "Konti Zemejwe",
      
      userGrowthTrends: "Imikurire y'Abakoresha",
      userTypeDistribution: "Ikwirakwizwa ry'Abakoresha",
      growthByUserCategory: "Imikurire ku bwoko bw'Abakoresha",
      dailyActiveUsers: "Abakoresha ba buri munsi (iki cyumweru)",
      
      ofTotalUsers: "by'abakoresha bose",
      
      loadError: "Ntibishoboye gupakurura ibarura ry'abakoresha",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga.",
    },

        financeReports: {
      title: "Raporo y'Imari",
      subtitle: "Isesengura ry'amafaranga yinjira, asohoka n'inyungu",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      selectPeriod: "Hitamo igihe",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      export: "Ohereza",
      clear: "Kuraho",
      showingDataFrom: "Erekana amakuru kuva",
      
      totalRevenue: "Amafaranga Yose Yinjije",
      totalExpenses: "Amafaranga Yose Yasohotse",
      netProfit: "Inyungu Yose",
      profitMargin: "Inyungu ku Gipimo",
      
      monthlyRevenueVsExpenses: "Ibyinjijwe n'Ibyasohotse buri kwezi",
      revenueBySource: "Inkomoko y'Amafaranga Yinjijwe",
      monthlyProfitTrend: "Imikurire y'Inyungu buri kwezi",
      dailyTransactionValue: "Agaciro k'Ubucuruzi buri munsi",
      
      revenueGrowth: "Imikurire y'Amafaranga Yinjijwe",
      avgTransaction: "Ubucuruzi ku rugero",
      totalTransactions: "Ubucuruzi Bwose",
      vsPreviousPeriod: "ugereranyije n'igihe gishize",
      perTransaction: "ku bucuruzi",
      inPeriod: "muri iki gihe",
      
      loadError: "Ntibishoboye gupakurura raporo y'imari",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga.",
    },

        systemUsage: {
      title: "Ikoreshwa n'Imikorere ya Sisitemu",
      subtitle: "Gukurikirana ibikoresho bya sisitemu n'imikorere yayo mu gihe nyacyo",
      from: "Kuva",
      to: "Kugeza",
      startDate: "Itariki y'Itangiriro",
      endDate: "Itariki y'Isozera",
      selectPeriod: "Hitamo igihe",
      last7Days: "Iminsi 7 Ishize",
      last30Days: "Iminsi 30 Ishize",
      last90Days: "Iminsi 90 Ishize",
      thisMonth: "Ukwezi Kuno",
      lastMonth: "Ukwezi Gushize",
      customRange: "Igihe Gihitanywe",
      export: "Ohereza",
      clear: "Kuraho",
      showingDataFrom: "Erekana amakuru kuva",
      allSystemsOperational: "Sisitemu Zose Zikora Neza",
      
      cpuUsage: "Ikoreshwa rya CPU",
      memoryUsage: "Ikoreshwa rya Memory",
      diskUsage: "Ikoreshwa rya Disiki",
      uptime: "Igihe ikorera",
      
      statusExcellent: "Nziza Cyane",
      statusNormal: "Isanzwe",
      statusWarning: "Iburira",
      statusCritical: "Ikibazo",
      
      hourlyTrafficPattern: "Imikorere y'amasaha yose",
      dailySystemLoad: "Umuzigo wa buri munsi",
      topApiEndpoints: "Inzira z'API zikoreshwa cyane",
      
      avgResponseTime: "Igihe cy'isubizo",
      totalRequests: "Ibyifuzo Byose",
      successRate: "Igipimo cy'intsinzi",
      inSelectedPeriod: "muri iki gihe wahisemo",
      allRequests: "ibyifuzo byose",
      performance: "imikorere",
      
      requests: "Ibyifuzo",
      activeUsers: "Abakoresha Bagikora",
      cpuUsageLabel: "Ikoreshwa rya CPU",
      memoryUsageLabel: "Ikoreshwa rya Memory",
      diskUsageLabel: "Ikoreshwa rya Disiki",
      apiCalls: "Ibyifuzo bya API",
      
      loadError: "Ntibishoboye gupakurura amakuru y'ikoreshwa rya sisitemu",
      loadErrorHint: "Gerageza gusubiramo urupapuro cyangwa watumanahira inkunga.",
    },
},

// ====================================================================== SUPERVISOR ==============================================================



    auth: {
      login: "Injira",
      register: "Iyandikishe",
      logout: "Sohoka",
      loggingOut: "Urasohoka...",
      dashboard: "Dashibordo",
      employerProfile: "Profili y'Umukoresha",
      companyProfile: "Profili ya Sosiyete",
    },

     workerSearchResults: {
    workersMatch:        "abakozi babonetse",
    workersFound:        "Abakozi Babonetse",
    basedOnSearch:       "Hashingiwe ku bipimo byawe",
    available:           "Bahari",
    verified:            "Bagenzuwe",
    rated:               "Bafite Amanota",
    whyChoose:           "Kuki Uhitamo Urubuga Rwacu?",
    featureVerified:     "Bagenzuwe",
    featureVerifiedDesc: "Inzobere zagenzuwe mbere",
    featureProfiles:     "Profili",
    featureProfilesDesc: "Amateka yuzuye y'akazi n'amanota",
    featureSearch:       "Gushakisha",
    featureSearchDesc:   "Ibikoresho byimbitse byo gushungura",
    featureConnect:      "Guhuza",
    featureConnectDesc:  "Gutumanahira neza no gukoresha vuba",
    loginToView:         "Injira Kureba",
    subscribe:           "Iyandikishe",
    haveAccount:         "Ufite konti?",
    loginLink:           "Injira",
    forEmployers:        "Ku Bashyira Akazi",
    forEmployersDesc:    "Bona abakozi bagenzuwe. Tangaza imirimo ukoreshe inzobere.",
    benefits:            "Inyungu",
    benefitsDesc:        "Kureba inshuro zitabarirwa, gutumanahira. Kuva $29/ukwezi.",
    showing:             "Werekana",
    of:                  "kuri",
    sortLatest:          "Ibyanyuma",
    sortTopRated:        "Bafite Amanota Menshi",
    sortSalaryLow:       "Umushahara: Woroheje",
    sortSalaryHigh:      "Umushahara: Woramba",
    sortExperience:      "Uburambe",
    noWorkersFound:      "Nta Mukozi Wabonetse",
    adjustFilters:       "Gerageza guhindura ibipimo byawe",
    loading:             "Gutegereza...",
    next:                "Ibikurikira",
  },

    employerSearch: {
    heroTitle:         "Shaka Abakozi Bafite Ubumenyi",
    heroSubtitleAuth:  "Bona inzobere z'akazi ku mishinga yawe.",
    heroSubtitleGuest: "Reba inzobere z'akazi. Injira kureba profili yuzuye.",
    resetFilters:      "Gusubiramo",
    advancedSearch:    "Gushakisha Birambuye",
    filterWorkers:     "Shungura Abakozi",
    errorLoading:      "Habaye ikosa mu gupakurura abakozi",
    loadingMore:       "Gupakurura ibindi...",
  },

    hero: {
      badge: "Urubuga ruhuza abakozi n'abakoresha mu Rwanda",
      title1: "Huza & Genzura",
      title2: "Abakozi",
      title3: "byizewe",
      subtitle: "Tugenzura. Duhuza Abakozi n'abakoresha byizewe.",
      cta: {
        hire: "Shaka umukozi",
        login: "Injira ku rubuga",
      },
    },

    stats: {
      workers: "Abakozi Dufite",
      employers: "Abakoresha",
      partners: "Abafatanyabikorwa",
      verified: "Profili Zagenzuwe",
    },

    tabs: {
      overview: "Incamake",
      findWorkers: "Shaka Abakozi",
      activeWorkers: "Abakozi Bakora",
      verify: "Genzura",
      requests: "Ibyifuzo",
      incidents: "Ibibazo",
      payments: "Ubwishyu",
      workers: "Abakozi",
      employers: "Abashyira Akazi",
      revenue: "Inyungu",
      dashboard:  "Dashibordo",
    schedule:   "Gahunda Yanjye",
    experience: "Uburambe",
    profile: "Porofili"
    },

    sidebar: {
      activeSince: "Akora kuva",
      verifiedEmployer: "Umukoresha Wemejwe",
      unverifiedEmployer: "Umukoresha Utaremewe",
      verifiedCompany: "Sosiyete Yemejwe",
      activeWorkers: "Abakozi Bakora",
      totalWorkers: "Abakozi Bose",
      activeEmployments: "Akazi Gakora",
      thisMonthSpending: "Ibyasohotse iki cyezi",
      thisMonthRevenue: "Inyungu z'iki cyezi",
      viewAnalytics: "Reba imibare yose",
    },

    notifications: {
      title: "Amamenyesha",
      markAllRead: "Shyira byose nk'bisomwe",
      noNotifications: "Nta mamenyesha mashya",
      viewAll: "Reba amamenyesha yose",
      center: "Ikigo cy'Amamenyesha",
      manage: "Reba no gucunga amamenyesha yawe yose",
      details: "Ibisobanuro by'Imenyesha",
      viewComplete: "Reba amakuru yuzuye y'imenyesha",
      unread: "Atarasomwa",
      received: "Byakiriwe",
      from: "Bivuye",
      additionalInfo: "Amakuru Yiyongera",
      markAsRead: "Shyira nk'Bisomwe",
    },
    howItWorks: {
    badge: "Uburyo Bikora",
    title1: "Uburyo bworoshye,",
    title2: "bwizewe, watangamo akazi",
    subtitle: "Kuva kwiyandikisha kugeza ku kazi kemejwe mu ntambwe eshanu.",
    steps: {
        register:   { title: "Iyandikishe & Genzura",   desc: "Amasosiyete ayandikisha na TIN, abakozi na indangamuntu. Profili zose zemejwe binyuze muri NIDA." },
        search:     { title: "Shaka & Huza",             desc: "Abashyira akazi bashaka abakozi. Saba amakuru y'abakozi ba sosiyete cyangwa uvugane n'abigenga." },
        handover:   { title: "Doreshwa Ifite Umutekano", desc: "Kugenzura OTP igihe cy'doreshwa bigaragaza umunyakazi. Reba amakuru yose n'amateka." },
        employment: { title: "Akazi kemejwe",           desc: "Emeza ukubukirwa gutangire akazi. Ikarita ya QR igenerwa. Gukurikirana gutangira." },
        rate:       { title: "Tanga Amanota & Ibitekerezo", desc: "Impande zombi zitanga amanota. Kubaka icyizere binyuze mu makuru arambuye." },
    },
    },
    cta: {
  badge: "Injira ku Urubuga #1 rw'Abakozi mu Rwanda",
  title1: "Witeguye Guhindura",
  title2: "Imicungire y'Abakozi?",
  subtitle: "Jya mu miryango y'ibihumbi by'amasosiyete, abakozi, n'abashyira akazi bakoresha Ekaze mu Rwanda.",
  primaryBtn: "Tangira Ubu",
  secondaryBtn: "Injira ku Rubuga",
  trustNote: "Nta karita ya banki isabwa  •  Ubuntu kubakozi  •  Igenwa mu minota mike",
},
login: {
  emailLabel:          "Imeyili/Nimero ya Telefone",
  emailPlaceholder:    "Injiza imeyili cyangwa nimero ya telefone",
  phoneLabel:          "Nimero ya Telefone",
  phonePlaceholder:    "Injiza nimero ya telefone",
  passwordLabel:       "Ijambo ryibanga",
  passwordPlaceholder: "Injiza ijambo ryibanga",
  forgotPassword:      "Wibagiwe ijambo ryibanga?",
  rememberMe:          "Nzibuke iminsi 30",
  signIn:              "Injira",
  signingIn:           "Uri kwinjira...",
},

footer: {
  brandDesc: "Urubuga ruzwi mu Rwanda rw'imicungire y'abakozi bo mu rugo. Guhuriza amasosiyete, abakozi, n'abashyira akazi mu mutekano.",
  product: "Serivisi",
  forUsers: "Abakoresha",
  company: "Sosiyete",
  legal: "Amategeko",
  features: "Ibiranga",
  howItWorks: "Uburyo Bikora",
  pricing: "Igiciro",
  security: "Umutekano",
  companies: "Amasosiyete",
  workers: "Abakozi",
  employers: "Abashyira Akazi",
  authorities: "Inzego",
  aboutUs: "Abo Turi Bo",
  careers: "Akazi",
  contact: "Twandikire",
  press: "Amakuru",
  privacyPolicy: "Politiki y'Ibanga",
  termsOfService: "Amategeko y'Ikoreshwa",
  cookiePolicy: "Politiki ya Cookie",
  gdpr: "GDPR",
  allRights: "Uburenganzira bwose bwarabitswe.",
  poweredBy: "Yakozwe na Beno Finance.",
  badge: {
    nida: "NIDA Yemeje",
    momo: "MoMo Pay",
    rnp: "RNP Yahuriwe",
  },
},

  advancedFilters: {
    title:               "Gushakisha Birambuye",
    activeFiltersLabel:  "byashyizweho",
    sectionServices:     "Serivisi Zikorwa",
    sectionEducation:    "Amashuri Yize",
    sectionExperience:   "Imyaka y'Uburambe",
    experienceMin:       "Ntarengwa",
    experienceMax:       "Ntarenze",
    sectionWorkType:     "Ubwoko bw'Akazi Ashatse",
    sectionAvailableDays:"Iminsi Aboneka",
    weekends:            "Ibyakurikira (Weekend)",
    holidays:            "Iminsi Mikuru",
    sectionCertificates: "Impamyabushobozi",
    sectionMaritalStatus:"Imimerere y'Ubukwe",
    sectionOther:        "Ibindi",
    physicallyFit:       "Afite Imbaraga zo Gukora",
    applyButton:         "Shakisha",
    resetButton:         "Subiramo Byose",

    services: {
      babySitter:  "Nanny / Kurera Umwana",
      laundry:     "Kumesa imyenda",
      ironing:     "Gutera Ipasi",
      houseChores: "Imirimo yo murugo",
      cooking:     "Guteka",
      gardening:   "Gukora Jardin",
      carWashing:  "Koza imodoka",
      elderlyCare: "Kwita kubakuze",
      childcare:   "Kwita kubana",
      petCare:     "Kwita kumatungo",
      shopping:    "Guhaha ku isoko",
      driving:     "Gutwara Imodoka",
    },

    days: {
      monday:    "Kuwa Mbere",
      tuesday:   "Kuwa Kabiri",
      wednesday: "Kuwa Gatatu",
      thursday:  "Kuwa Kane",
      friday:    "Kuwa Gatanu",
      saturday:  "Kuwa Gatandatu",
      sunday:    "Ku Cyumweru",
    },

    education: {
      all:       "Amashuri Yose",
      none:      "Ntagishuri",
      primary:   "Amashuri Abanza",
      secondary: "Amashuri Yisumbuye",
      advanced:  "Amashuri Makuru (A-Level)",
      tvet:      "TVET",
      bachelor:  "Lisansi",
      masters:   "Masitere",
      phd:       "Dogiteri",
    },

    workType: {
      all:      "Ubwoko Bwose",
      liveIn:   "Atuye aho Akora",
      liveOut:  "Aza kuri Akazi",
      partTime: "Igice cy'Igihe",
      fullTime: "Igihe Cyose",
      flexible: "Nta Gahato",
    },

    certificates: {
      driving:   "Uruhushya rwo Gutwara",
      cooking:   "Certificat yo guteka",
      firstAid:  "Certificat yo kwita kubantu (First Aid)",
      childcare: "Certificat yo kwita kubana",
    },

    maritalStatus: {
      all:      "Imimerere Yose",
      single:   "Ingaragu",
      married:  "Arubatse",
      divorced: "Yatandukanye",
      widowed:  "Umupfakazi",
    },
  },

    searchFilters: {
    searchPlaceholder:  "Shakisha izina...",
    clearFilters:       "Kuraho Ibipimo",
    gender:             "Igitsina",
    location:           "Aho Atuye",
    locationPlaceholder:"Hitamo akarere...",
    workerType:         "Ubwoko bw'Umukozi",
    workType:           "Ubwoko bw'Akazi",
    experience:         "Uburambe",
    ageRange:           "Imyaka",
    salary:             "Umushahara (RWF)",
    languages:          "Indimi",
    showMore:           "Erekana Byinshi",
    showLess:           "Erekana Bike",
    insurance:          "Ubwishingizi",
    availableOnly:      "Abatangwa Gusa",

    genderOptions: {
      all:    "Ibitsina Byose",
      male:   "Gabo",
      female: "Gore",
    },
    workerTypeOptions: {
      all:      "Ubwoko Bwose",
      company:  "Sosiyete",
      freelance:"Ukigenga",
    },
    insuranceOptions: {
      all: "Abakozi Bose",
      yes: "Bafite Ubwishingizi",
      no:  "Nta Bwishingizi",
    },
  },

forgotPassword: {
  hint:           "Tuzakoherereza OTP kuri telefone yawe",
  sendOtp:        "Ohereza OTP",
  sending:        "Koherezwa...",
  backToLogin:    "Garuka kwinjira",
  otpSentTo:      "OTP yoherejwe kuri",
  otpLabel:       "Kodi ya OTP",
  otpPlaceholder: "Injiza kodi y'imibare 6",
  changePhone:    "Hindura nimero",
  resendOtp:      "Ohereza OTP Nanone",
},
resetPassword: {
  newPasswordLabel:           "Ijambo Rishya Ryibanga",
  newPasswordPlaceholder:     "Injiza ijambo rishya ryibanga",
  confirmPasswordLabel:       "Emeza Ijambo Ryibanga",
  confirmPasswordPlaceholder: "Emeza ijambo rishya ryibanga",
  passwordMismatch:           "Amagambo y'ibanga ntahuye",
  resetButton:                "Subiramo Ijambo Ryibanga",
  resetting:                  "Gusubiramo...",
  success: {
    title:     "Ijambo Ryibanga Ryahinduwe neza!",
    subtitle:  "Ijambo ryawe ryibanga ryahinduwe. Ubu ushobora kwinjira.",
    goToLogin: "Injira",
  },
},




  },
} as const;

export type Language = keyof typeof translations;
export type Translations = typeof translations.eng;