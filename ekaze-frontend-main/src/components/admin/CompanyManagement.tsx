import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import {
  LayoutGrid,
  List,
  Building2,
  Users,
  CreditCard,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  Filter,
  MoreVertical,
  Eye,
  Receipt,
  Printer,
  Download,
  FileText,
  Activity,
} from "lucide-react";
import UserDetailsModal from "./UserDetailsModal";
import {
  useCompanies,
  useCompanyFullDetails,
} from "@/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import { useEmployerFullDetails } from "@/hooks/useEmployers";
import type { Company } from "@/types/company.types";
import { useLanguage } from "@/contexts/LanguageContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "@/assets/reallogo.png";
import { CharacterIllustration } from "@/components/common/CharacterIllustration";
import { StudioFilterBar, type FilterCategory } from "@/components/common/StudioFilterBar";

// Exact 2-tone Blue Folder Icon matching user's uploaded reference image
const BlueFolderIcon = ({ className = "w-14 h-11" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-xs transition-transform duration-200 group-hover:scale-105 ${className}`}
  >
    {/* Back tab */}
    <path
      d="M4 8C4 5.79086 5.79086 4 8 4H22C24 4 25.5 5.2 27 7.5L30 12H4V8Z"
      fill="#1b6296"
    />
    {/* Front main body */}
    <rect
      x="2"
      y="11"
      width="60"
      height="35"
      rx="5"
      fill="#2478b8"
    />
    {/* Top flap highlight accent */}
    <path
      d="M2 15C2 12.7909 3.79086 11 6 11H58C60.2091 11 62 12.7909 62 15V16H2V15Z"
      fill="#4aa3df"
      fillOpacity="0.5"
    />
  </svg>
);

type ViewPath = "root" | "companies" | "employers" | "company-detail" | "employer-detail";

const CompanyManagement = () => {
  const { t } = useLanguage();
  const [currentPath, setCurrentPath] = useState<ViewPath>("root");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  const [selectedEmployerId, setSelectedEmployerId] = useState<number | null>(null);
  const [selectedEmployerName, setSelectedEmployerName] = useState<string>("");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [companyActiveTab, setCompanyActiveTab] = useState<"workers" | "employers" | "subscriptions">("workers");
  const [employerActiveTab, setEmployerActiveTab] = useState<"hired-workers" | "companies" | "subscriptions">("hired-workers");

  const [selectedInvoice, setSelectedInvoice] = useState<{
    invoiceNo: string;
    transactionRef: string;
    item: string;
    amount: string;
    paymentChannel: string;
    date: string;
    status: string;
    clientName: string;
    clientType: "Company" | "Employer";
  } | null>(null);

  const downloadInvoicePDFDirect = async (
    invoiceData: typeof selectedInvoice,
    docType: "Invoice" | "Receipt" = "Invoice"
  ) => {
    if (!invoiceData) return;

    const titleText = docType === "Invoice" ? "Invoice" : "Payment Receipt";
    const fileName = `${docType}-${invoiceData.invoiceNo}.pdf`;

    let input = document.getElementById("invoice-pdf-container");
    let temporaryContainerCreated = false;

    if (!input) {
      temporaryContainerCreated = true;
      input = document.createElement("div");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      input.style.top = "-9999px";
      input.style.width = "750px";
      input.style.backgroundColor = "#ffffff";
      document.body.appendChild(input);

      input.innerHTML = `
        <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #0f172a;">${titleText}</h1>
              <div style="margin-top: 16px; font-size: 12px; line-height: 1.6;">
                <div><strong style="width: 110px; display: inline-block;">${docType} number:</strong> <strong>${invoiceData.invoiceNo}</strong></div>
                <div><span style="width: 110px; display: inline-block; color: #475569;">Date of issue:</span> ${invoiceData.date}</div>
                <div><span style="width: 110px; display: inline-block; color: #475569;">Date due:</span> ${invoiceData.date}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <img src="${logo}" style="height: 40px; width: auto; display: block; margin-left: auto;" />
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-top: 4px;">Ihirwe Pay</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; font-size: 12px; line-height: 1.6;">
            <div>
              <p style="font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">Ihirwe Pay Ltd</p>
              <p style="margin: 0;">KN 5 Rd, Nyarugenge</p>
              <p style="margin: 0;">PMB 90375</p>
              <p style="margin: 0;">Kigali, Rwanda</p>
              <p style="margin: 0;">TIN: 129845763</p>
              <p style="margin: 0; color: #475569;">support@ihirwepay.rw</p>
            </div>
            <div>
              <p style="font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">Bill to</p>
              <p style="font-weight: 600; margin: 0; color: #0f172a;">${invoiceData.clientName}'s Organization</p>
              <p style="margin: 0;">KK 11 St</p>
              <p style="margin: 0;">Kigali</p>
              <p style="margin: 0;">Rwanda</p>
              <p style="margin: 0; color: #475569;">${invoiceData.clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com</p>
            </div>
          </div>

          <div style="margin-top: 32px;">
            <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">${invoiceData.amount} paid on ${invoiceData.date}</h2>
            <p style="font-size: 12px; color: #2563eb; text-decoration: underline; margin: 0;">Paid online via ${invoiceData.paymentChannel}</p>
            <p style="font-size: 11px; color: #475569; margin-top: 12px;">While we prefer electronic payment methods, any checks must be sent to the address below, NOT to our Kigali main office.</p>
            <p style="font-family: monospace; color: #cbd5e1; margin: 4px 0;">---------------------------------</p>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #334155; margin: 0;">PAYMENT ADDRESS:</p>
            <p style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Ihirwe Pay Ltd</p>
            <p style="font-size: 12px; margin: 0;">P.O. Box 104477</p>
            <p style="font-size: 12px; margin: 0;">Kigali, Rwanda</p>
          </div>

          <div style="margin-top: 32px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="border-bottom: 2px solid #0f172a; text-align: left; color: #475569; font-weight: 600;">
                  <th style="padding-bottom: 8px;">Description</th>
                  <th style="padding-bottom: 8px; text-align: right;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Unit price</th>
                  <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 0;">
                    <div style="font-weight: 600; color: #0f172a;">${invoiceData.item}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Service Period: ${invoiceData.date}</div>
                  </td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 500;">1</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 500;">${invoiceData.amount}</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${invoiceData.amount}</td>
                </tr>
              </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <div style="width: 240px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">
                  <span>Subtotal</span>
                  <span style="font-weight: 500;">${invoiceData.amount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">
                  <span>Total</span>
                  <span style="font-weight: 500;">${invoiceData.amount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: 700; color: #0f172a; font-size: 14px;">
                  <span>Amount paid</span>
                  <span>${invoiceData.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF download error:", err);
      window.print();
    } finally {
      if (temporaryContainerCreated && input && input.parentNode) {
        input.parentNode.removeChild(input);
      }
    }
  };

  // Selected Item Detail Modal State
  const [modalItem, setModalItem] = useState<{ title: string; type: "worker" | "employer" | "company"; details: any } | null>(null);
  const [selectedAuditUserId, setSelectedAuditUserId] = useState<number | null>(null);

  const [tabSearchQuery, setTabSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleFilterSelect = (catId: string, val: string) => {
    if (val === "all" || !val) {
      handleRemoveFilter(catId);
    } else {
      setActiveFilters((prev) => ({ ...prev, [catId]: val }));
    }
  };

  const handleRemoveFilter = (catId: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setTabSearchQuery("");
  };

  // Categories for StudioFilterBar
  const companyWorkerCategories: FilterCategory[] = [
    {
      id: "status",
      label: "Availability",
      options: [
        { value: "all", label: "All Availability" },
        { value: "available", label: "Available" },
        { value: "placed", label: "Placed" },
      ],
    },
  ];

  const companyEmployerCategories: FilterCategory[] = [
    {
      id: "status",
      label: "Partnership Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active Partnership" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const employerWorkerCategories: FilterCategory[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  const subscriptionCategories: FilterCategory[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "Paid & Verified", label: "Paid & Verified" },
        { value: "Paid", label: "Paid" },
        { value: "Verified", label: "Verified" },
        { value: "Active Rate", label: "Active Rate" },
      ],
    },
  ];

  const employerCompanyCategories: FilterCategory[] = [
    {
      id: "status",
      label: "Partnership Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active Partnership" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];

  // Fetch company data & employers
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies(1);
  const { data: employersData, isLoading: isLoadingEmployers } = useUsers(1, { role: "employer" });
  const { data: companyFullData, isLoading: isLoadingCompanyDetails } = useCompanyFullDetails(selectedCompanyId);
  const { data: employerFullData, isLoading: isLoadingEmployerDetails } = useEmployerFullDetails(selectedEmployerId);

  const companies: Company[] = Array.isArray(companiesData?.data)
    ? (companiesData.data as any)
    : (Array.isArray(companiesData?.data?.data)
      ? (companiesData.data.data as any)
      : (Array.isArray(companiesData) ? (companiesData as any) : []));
  const employersList = Array.isArray(employersData?.data)
    ? employersData.data
    : (Array.isArray(employersData?.data?.data) ? employersData.data.data : []);

  const handleOpenCompany = (company: Company) => {
    setSelectedCompanyId(company.id);
    setSelectedCompanyName(company.business_name || company.company_name || "Company");
    setCurrentPath("company-detail");
    handleClearAllFilters();
  };

  const handleOpenEmployer = (emp: any) => {
    setSelectedEmployerId(emp.id);
    setSelectedEmployerName(emp.name || "Employer");
    setCurrentPath("employer-detail");
    handleClearAllFilters();
  };

  const formatTxnRow = (txn: any, clientName: string, clientType: "Company" | "Employer") => {
    let feeType = "Platform Service Fee";
    if (txn.type === "company_fee") {
      feeType = "Company Platform License Fee";
    } else if (txn.type === "hiring_fee") {
      feeType = "Worker Placement & Contact Unlock Fee";
    } else if (txn.type === "contact_unlock") {
      feeType = "Direct Contact Access Fee";
    } else if (txn.type === "salary_payment") {
      feeType = "Worker Monthly Salary Disbursement";
    } else if (txn.type === "card_payment") {
      feeType = "Platform ID Card Verification Fee";
    } else if (txn.metadata?.purpose) {
      feeType = txn.metadata.purpose;
    }

    let channel = "N/A";
    const method = (txn.payment_method || "").toLowerCase();
    if (method.includes("ecobank")) {
      channel = "Ecobank MoMo";
    } else if (method.includes("mtn")) {
      channel = "MTN Mobile Money";
    } else if (method.includes("airtel")) {
      channel = "Airtel Money";
    } else if (method) {
      channel = txn.payment_method;
    }

    const formattedDate = txn.created_at
      ? new Date(txn.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      : "N/A";

    const displayStatus = txn.status === "successful" ? "Paid & Verified" : (txn.status || "Pending");

    return {
      invoiceNo: txn.reference_id || `REF-${txn.id}`,
      transactionRef: txn.reference_id || `TXN-${txn.id}`,
      item: feeType,
      amount: `${Number(txn.amount || 0).toLocaleString()} RWF`,
      paymentChannel: channel,
      date: formattedDate,
      status: displayStatus,
      clientName: clientName,
      clientType: clientType,
      rawAmount: Number(txn.amount || 0),
    };
  };

  const companyTxnRows = Array.isArray(companyFullData?.data?.transactions)
    ? companyFullData.data.transactions.map((txn: any) =>
      formatTxnRow(txn, selectedCompanyName || "Company", "Company")
    )
    : [];

  const employerTxnRows = Array.isArray(employerFullData?.data?.transactions)
    ? employerFullData.data.transactions.map((txn: any) =>
      formatTxnRow(txn, selectedEmployerName || "Employer", "Employer")
    )
    : [];

  return (
    <div className="w-full bg-white space-y-0">
      {/* Top Header - Google Drive Breadcrumb Style */}
      <div className="pt-1 pb-2 px-0">
        <PageHeaderBreadcrumb
          title={
            currentPath === "root"
              ? "Companies & Employers"
              : currentPath === "companies"
                ? "Companies"
                : currentPath === "employers"
                  ? "Employers"
                  : currentPath === "company-detail"
                    ? selectedCompanyName || "Company Details"
                    : selectedEmployerName || "Employer Details"
          }
          items={
            currentPath === "root"
              ? []
              : currentPath === "companies" || currentPath === "employers"
                ? [
                  {
                    label: "Companies & Employers",
                    onClick: () => {
                      setCurrentPath("root");
                      setSelectedCompanyId(null);
                      setSelectedEmployerId(null);
                      setTabSearchQuery("");
                    },
                  },
                ]
                : currentPath === "company-detail"
                  ? [
                    {
                      label: "Companies & Employers",
                      onClick: () => {
                        setCurrentPath("root");
                        setSelectedCompanyId(null);
                        setSelectedEmployerId(null);
                        setTabSearchQuery("");
                      },
                    },
                    {
                      label: "Companies",
                      onClick: () => {
                        setCurrentPath("companies");
                        setTabSearchQuery("");
                      },
                    },
                  ]
                  : [
                    {
                      label: "Companies & Employers",
                      onClick: () => {
                        setCurrentPath("root");
                        setSelectedCompanyId(null);
                        setSelectedEmployerId(null);
                        setTabSearchQuery("");
                      },
                    },
                    {
                      label: "Employers",
                      onClick: () => {
                        setCurrentPath("employers");
                        setTabSearchQuery("");
                      },
                    },
                  ]
          }
        >
          <div className="flex items-center border border-slate-200 rounded p-0.5 bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-blue-50 text-[#2478b8]" : "text-slate-500 hover:text-slate-800"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-blue-50 text-[#2478b8]" : "text-slate-500 hover:text-slate-800"
                }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </PageHeaderBreadcrumb>
      </div>

      {/* Main Content Layout Container */}
      <div className="w-full bg-white space-y-4">
        {/* ========================================================================= */}
        {/* LEVEL 0: ROOT VIEW - FOLDERS (Companies & Employers) */}
        {/* ========================================================================= */}
        {currentPath === "root" && (
          <div className="pt-2">
            {viewMode === "grid" ? (
              <div className="flex flex-wrap items-start gap-8 pt-2">
                {/* Folder 1: Companies */}
                <div
                  onClick={() => setCurrentPath("companies")}
                  className="group flex flex-col items-center justify-center p-2 cursor-pointer text-center select-none w-32 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="mb-2">
                    <BlueFolderIcon className="w-14 h-11" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] transition-colors line-clamp-2">
                    Companies
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                    {isLoadingCompanies ? "..." : `${companies.length} items`}
                  </p>
                </div>

                {/* Folder 2: Employers */}
                <div
                  onClick={() => setCurrentPath("employers")}
                  className="group flex flex-col items-center justify-center p-2 cursor-pointer text-center select-none w-32 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="mb-2">
                    <BlueFolderIcon className="w-14 h-11" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] transition-colors line-clamp-2">
                    Employers
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                    {isLoadingEmployers ? "..." : `${employersList.length} items`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div
                  onClick={() => setCurrentPath("companies")}
                  className="group flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BlueFolderIcon className="w-6 h-5" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8]">
                      Companies
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {isLoadingCompanies ? "..." : `${companies.length} items`}
                  </span>
                </div>

                <div
                  onClick={() => setCurrentPath("employers")}
                  className="group flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BlueFolderIcon className="w-6 h-5" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8]">
                      Employers
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {isLoadingEmployers ? "..." : `${employersList.length} items`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 1: COMPANIES FOLDER - UNIFORM FOLDERS */}
        {/* ========================================================================= */}
        {currentPath === "companies" && (
          <div className="pt-2">
            {isLoadingCompanies ? (
              <div className="flex flex-wrap gap-8 pt-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-32 rounded-lg" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <CharacterIllustration
                type="companies"
                title="No Companies Found"
                description="There are no registered companies in the database."
              />
            ) : viewMode === "grid" ? (
              <div className="flex flex-wrap items-start gap-8 pt-2">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => handleOpenCompany(company)}
                    className="group flex flex-col items-center justify-center p-2 cursor-pointer text-center select-none w-32 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="mb-2">
                      <BlueFolderIcon className="w-14 h-11" />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] transition-colors line-clamp-2">
                      {company.business_name || company.company_name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      {`${company.total_workers ?? 0} ${company.total_workers === 1 ? 'item' : 'items'}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => handleOpenCompany(company)}
                    className="group flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BlueFolderIcon className="w-6 h-5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] block">
                          {company.business_name || company.company_name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {`${company.total_workers ?? 0} ${company.total_workers === 1 ? 'item' : 'items'}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 1: EMPLOYERS FOLDER - UNIFORM FOLDERS */}
        {/* ========================================================================= */}
        {currentPath === "employers" && (
          <div className="pt-2">
            {isLoadingEmployers ? (
              <div className="flex flex-wrap gap-8 pt-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-32 rounded-lg" />
                ))}
              </div>
            ) : employersList.length === 0 ? (
              <CharacterIllustration
                type="users"
                title="No Employers Found"
                description="No registered employers found in the database."
              />
            ) : viewMode === "grid" ? (
              <div className="flex flex-wrap items-start gap-8 pt-2">
                {employersList.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleOpenEmployer(emp)}
                    className="group flex flex-col items-center justify-center p-2 cursor-pointer text-center select-none w-32 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="mb-2">
                      <BlueFolderIcon className="w-14 h-11" />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] transition-colors line-clamp-2">
                      {emp.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      Employer
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {employersList.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleOpenEmployer(emp)}
                    className="group flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BlueFolderIcon className="w-6 h-5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2478b8] block">
                          {emp.name}
                        </span>
                        <span className="text-[11px] text-slate-400">{emp.email}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Employer
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 2: SPECIFIC COMPANY DETAIL VIEW - INCIDENT MANAGEMENT STYLE TABS */}
        {/* ========================================================================= */}
        {currentPath === "company-detail" && (
          <div className="space-y-4">
            <Tabs value={companyActiveTab} onValueChange={(v) => { setCompanyActiveTab(v as any); setTabSearchQuery(""); }} className="w-full space-y-4">
              {/* Clean Incident Management Tabs Header */}
              <TabsList className="bg-transparent p-0 h-auto border-b border-slate-200 w-full justify-start rounded-none space-x-8">
                <TabsTrigger
                  value="workers"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Workers ({companyFullData?.data?.workers?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="employers"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Employers ({companyFullData?.data?.employers?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="subscriptions"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Subscriptions & Fees
                </TabsTrigger>
              </TabsList>

              {/* StudioFilterBar matching App-Wide Consistent Design */}
              <StudioFilterBar
                categories={
                  companyActiveTab === "workers"
                    ? companyWorkerCategories
                    : companyActiveTab === "employers"
                      ? companyEmployerCategories
                      : subscriptionCategories
                }
                activeFilters={activeFilters}
                onFilterSelect={handleFilterSelect}
                onRemoveFilter={handleRemoveFilter}
                searchTerm={tabSearchQuery}
                onSearchChange={(val) => setTabSearchQuery(val)}
                onClearAll={handleClearAllFilters}
              />

              {/* TAB 1: WORKERS TAB */}
              <TabsContent value="workers" className="mt-2">
                {isLoadingCompanyDetails ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !companyFullData?.data?.workers || companyFullData.data.workers.length === 0 ? (
                  <CharacterIllustration
                    type="workers"
                    title="No Workers Associated"
                    description="No registered workers under this company."
                  />
                ) : (
                  <Table>
                    <TableHeader className="bg-transparent border-b border-slate-200">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Worker Name</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Email</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Phone</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Job Title / Specialty</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Availability</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyFullData.data.workers
                        .filter((w: any) => {
                          const matchesSearch =
                            !tabSearchQuery ||
                            (w.user?.name || "").toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
                            (w.job_title || "").toLowerCase().includes(tabSearchQuery.toLowerCase());
                          const matchesStatus =
                            !activeFilters.status ||
                            activeFilters.status === "all" ||
                            (w.availability_status || "").toLowerCase() === activeFilters.status.toLowerCase();
                          return matchesSearch && matchesStatus;
                        })
                        .map((w: any) => (
                          <TableRow key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                  {w.user?.profile_photo ? (
                                    <AvatarImage src={w.user.profile_photo} alt={w.user?.name || "Worker"} className="object-cover" />
                                  ) : null}
                                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                                    {w.user?.name ? w.user.name.charAt(0).toUpperCase() : "W"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{w.user?.name || "Worker"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{w.user?.email || "N/A"}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{w.user?.phone || "N/A"}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{w.job_title || (Array.isArray(w.professions) ? w.professions.join(', ') : w.professions) || "Worker"}</TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {w.availability_status || "available"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {w.user?.status || "active"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-44"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "View Details",
                                    onClick: () =>
                                      setModalItem({
                                        title: w.user?.name || "Worker Details",
                                        type: "worker",
                                        details: w,
                                      }),
                                  },
                                  {
                                    label: "Logs",
                                    onClick: () => {
                                      const uId = w.user_id || w.user?.id || w.id;
                                      window.open(`/user-logs?user_id=${uId}`, "_blank");
                                    },
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* TAB 2: EMPLOYERS TAB */}
              <TabsContent value="employers" className="mt-2">
                {isLoadingCompanyDetails ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !companyFullData?.data?.employers || companyFullData.data.employers.length === 0 ? (
                  <CharacterIllustration
                    type="users"
                    title="No Employer Partnerships Yet"
                    description="No employers have purchased or requested workers from this company yet."
                  />
                ) : (
                  <Table>
                    <TableHeader className="bg-transparent border-b border-slate-200">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Partner Employer</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Contact Email</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Phone</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Worker Requested</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Placement Fee / Salary</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Partnership Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyFullData.data.employers
                        .filter((emp: any) => {
                          const matchesSearch =
                            !tabSearchQuery ||
                            (emp.name || "").toLowerCase().includes(tabSearchQuery.toLowerCase());
                          const matchesStatus =
                            !activeFilters.status ||
                            activeFilters.status === "all" ||
                            (emp.status || "").toLowerCase().includes(activeFilters.status.toLowerCase());
                          return matchesSearch && matchesStatus;
                        })
                        .map((emp: any, index: number) => (
                          <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                  {emp.profile_photo ? (
                                    <AvatarImage src={emp.profile_photo} alt={emp.name || "Employer"} className="object-cover" />
                                  ) : null}
                                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                                    {emp.name ? emp.name.charAt(0).toUpperCase() : "E"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{emp.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{emp.email}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{emp.phone}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{emp.worker_requested}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">
                              {emp.offered_salary ? `${Number(emp.offered_salary).toLocaleString()} RWF` : "Standard Placement"}
                            </TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {emp.status}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-44"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "View Details",
                                    onClick: () =>
                                      setModalItem({
                                        title: emp.name || "Partner Employer",
                                        type: "employer",
                                        details: emp,
                                      }),
                                  },
                                  {
                                    label: "Logs",
                                    onClick: () => {
                                      const uId = emp.user_id || emp.id;
                                      window.open(`/user-logs?user_id=${uId}`, "_blank");
                                    },
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* TAB 3: SUBSCRIPTIONS TAB */}
              <TabsContent value="subscriptions" className="mt-2">
                {isLoadingCompanyDetails ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (() => {
                  const filteredRows = companyTxnRows.filter((row: any) => {
                    const matchesSearch =
                      !tabSearchQuery ||
                      row.invoiceNo.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
                      row.item.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
                      row.paymentChannel.toLowerCase().includes(tabSearchQuery.toLowerCase());
                    const matchesStatus =
                      !activeFilters.status ||
                      activeFilters.status === "all" ||
                      row.status.toLowerCase().includes(activeFilters.status.toLowerCase());
                    return matchesSearch && matchesStatus;
                  });

                  if (filteredRows.length === 0) {
                    return (
                      <CharacterIllustration
                        type="transactions"
                        title="No Subscriptions or Fees Yet"
                        description="No payment transactions or fee records found in the database for this company."
                      />
                    );
                  }

                  return (
                    <Table>
                      <TableHeader className="bg-transparent border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-b border-slate-200">
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Invoice / Ref</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Fee Type / Item</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Amount (RWF)</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Payment Channel</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Payment Date</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRows.map((row: any, idx: number) => (
                          <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-mono font-semibold text-slate-800">
                              {row.invoiceNo}
                            </TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">
                              {row.item}
                            </TableCell>
                            <TableCell className="py-3 text-xs font-bold text-slate-900">
                              {row.amount}
                            </TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{row.paymentChannel}</TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{row.date}</TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {row.status}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-48"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "Download Invoice",
                                    onClick: () => downloadInvoicePDFDirect(row, "Invoice"),
                                  },
                                  {
                                    label: "Download Receipt",
                                    onClick: () => downloadInvoicePDFDirect(row, "Receipt"),
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 2: SPECIFIC EMPLOYER DETAIL VIEW - INCIDENT MANAGEMENT STYLE TABS */}
        {/* ========================================================================= */}
        {currentPath === "employer-detail" && (
          <div className="space-y-4">
            <Tabs value={employerActiveTab} onValueChange={(v) => { setEmployerActiveTab(v as any); setTabSearchQuery(""); }} className="w-full space-y-4">
              {/* Clean Incident Management Tabs Header */}
              <TabsList className="bg-transparent p-0 h-auto border-b border-slate-200 w-full justify-start rounded-none space-x-8">
                <TabsTrigger
                  value="hired-workers"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Hired Workers ({employerFullData?.data?.hired_workers?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Companies ({employerFullData?.data?.companies?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="subscriptions"
                  className="bg-transparent p-0 pb-2.5 rounded-none text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-[#2478b8] data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#2478b8] data-[state=active]:shadow-none -mb-px transition-colors cursor-pointer"
                >
                  Subscriptions & Fees
                </TabsTrigger>
              </TabsList>

              {/* StudioFilterBar matching App-Wide Consistent Design */}
              <StudioFilterBar
                categories={
                  employerActiveTab === "hired-workers"
                    ? employerWorkerCategories
                    : employerActiveTab === "companies"
                      ? employerCompanyCategories
                      : subscriptionCategories
                }
                activeFilters={activeFilters}
                onFilterSelect={handleFilterSelect}
                onRemoveFilter={handleRemoveFilter}
                searchTerm={tabSearchQuery}
                onSearchChange={(val) => setTabSearchQuery(val)}
                onClearAll={handleClearAllFilters}
              />

              {/* TAB 1: HIRED WORKERS TAB */}
              <TabsContent value="hired-workers" className="mt-2">
                {isLoadingEmployerDetails ? (
                  <div className="flex flex-col gap-2 pt-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !employerFullData?.data?.hired_workers || employerFullData.data.hired_workers.length === 0 ? (
                  <CharacterIllustration
                    type="workers"
                    title="No Hired Workers Yet"
                    description="This employer has not hired any workers yet."
                  />
                ) : (
                  <Table>
                    <TableHeader className="bg-transparent border-b border-slate-200">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="text-xs font-semibold text-slate-700 py-3">Worker Name</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 py-3">Phone / Contact</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 py-3">Category / Skills</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 py-3">Supplying Company</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 py-3">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employerFullData.data.hired_workers
                        .filter((w: any) => {
                          const matchesSearch =
                            !tabSearchQuery ||
                            (w.name || "").toLowerCase().includes(tabSearchQuery.toLowerCase());
                          const matchesStatus =
                            !activeFilters.status ||
                            activeFilters.status === "all" ||
                            (w.status || "").toLowerCase().includes(activeFilters.status.toLowerCase());
                          return matchesSearch && matchesStatus;
                        })
                        .map((w: any, index: number) => (
                          <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">{w.name}</TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{w.phone || w.email || "N/A"}</TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{w.job_title || w.category || w.role || "General Worker"}</TableCell>
                            <TableCell className="py-3 text-xs text-slate-700 font-medium">{w.company_name || "Direct Hire"}</TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {w.status || "Hired"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-44"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "View Details",
                                    onClick: () =>
                                      setModalItem({
                                        title: w.name || "Hired Worker",
                                        type: "worker",
                                        details: w,
                                      }),
                                  },
                                  {
                                    label: "Logs",
                                    onClick: () => {
                                      const uId = w.worker?.user_id || w.worker_id || w.user_id || w.id;
                                      window.open(`/user-logs?user_id=${uId}`, "_blank");
                                    },
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* TAB 2: COMPANIES TAB */}
              <TabsContent value="companies" className="mt-2">
                {isLoadingEmployerDetails ? (
                  <div className="flex flex-col gap-2 pt-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !employerFullData?.data?.companies || employerFullData.data.companies.length === 0 ? (
                  <CharacterIllustration
                    type="companies"
                    title="No Associated Companies"
                    description="This employer has not partnered with any company yet."
                  />
                ) : (
                  <Table>
                    <TableHeader className="bg-transparent border-b border-slate-200">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Partner Company</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Contact Email</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Phone</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Workers Supplied</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employerFullData.data.companies
                        .filter((cmp: any) => {
                          const matchesSearch =
                            !tabSearchQuery ||
                            (cmp.name || "").toLowerCase().includes(tabSearchQuery.toLowerCase());
                          const matchesStatus =
                            !activeFilters.status ||
                            activeFilters.status === "all" ||
                            (cmp.status || "").toLowerCase().includes(activeFilters.status.toLowerCase());
                          return matchesSearch && matchesStatus;
                        })
                        .map((cmp: any, index: number) => (
                          <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{cmp.name}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{cmp.email || "N/A"}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900 font-sans">{cmp.phone || "N/A"}</TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">{cmp.workers_supplied || 0} Workers</TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {cmp.status || "Active"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-44"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "View Details",
                                    onClick: () =>
                                      setModalItem({
                                        title: cmp.name || "Partner Company",
                                        type: "company",
                                        details: cmp,
                                      }),
                                  },
                                  {
                                    label: "Logs",
                                    onClick: () => {
                                      const uId = cmp.user_id || cmp.id;
                                      window.open(`/user-logs?user_id=${uId}`, "_blank");
                                    },
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* TAB 3: SUBSCRIPTIONS & FEES TAB */}
              <TabsContent value="subscriptions" className="mt-2">
                {isLoadingEmployerDetails ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (() => {
                  const filteredRows = employerTxnRows.filter((row: any) => {
                    const matchesSearch =
                      !tabSearchQuery ||
                      row.invoiceNo.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
                      row.item.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
                      row.paymentChannel.toLowerCase().includes(tabSearchQuery.toLowerCase());
                    const matchesStatus =
                      !activeFilters.status ||
                      activeFilters.status === "all" ||
                      row.status.toLowerCase().includes(activeFilters.status.toLowerCase());
                    return matchesSearch && matchesStatus;
                  });

                  if (filteredRows.length === 0) {
                    return (
                      <CharacterIllustration
                        type="transactions"
                        title="No Subscriptions or Fees Yet"
                        description="No payment transactions or fee records found in the database for this employer."
                      />
                    );
                  }

                  return (
                    <Table>
                      <TableHeader className="bg-transparent border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-b border-slate-200">
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Invoice / Ref</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Fee Type / Description</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Amount (RWF)</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Payment Channel</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Payment Date</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-900 font-sans py-3 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRows.map((row: any, idx: number) => (
                          <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="py-3 text-xs font-mono font-semibold text-slate-800">
                              {row.invoiceNo}
                            </TableCell>
                            <TableCell className="py-3 text-xs font-semibold text-slate-900">
                              {row.item}
                            </TableCell>
                            <TableCell className="py-3 text-xs font-bold text-slate-900">
                              {row.amount}
                            </TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{row.paymentChannel}</TableCell>
                            <TableCell className="py-3 text-xs text-slate-600 font-normal">{row.date}</TableCell>
                            <TableCell className="py-3 text-xs">
                              <span className="text-xs font-normal text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded capitalize">
                                {row.status}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 pr-2 text-right">
                              <CustomDropdown
                                widthClass="w-48"
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                items={[
                                  {
                                    label: "Download Invoice",
                                    onClick: () => downloadInvoicePDFDirect(row, "Invoice"),
                                  },
                                  {
                                    label: "Download Receipt",
                                    onClick: () => downloadInvoicePDFDirect(row, "Receipt"),
                                  },
                                ]}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Item Details Popup Modal */}
      <Dialog open={!!modalItem} onOpenChange={() => setModalItem(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-lg p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <BlueFolderIcon className="w-8 h-7" />
              <DialogTitle className="text-base font-bold text-slate-900">
                {modalItem?.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          {modalItem && (
            <div className="space-y-4 pt-3 text-xs text-slate-700">
              {modalItem.type === "worker" && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-900">{modalItem.details.user?.name || modalItem.details.name || "Worker"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email:</span>
                    <span className="font-medium text-slate-800">{modalItem.details.user?.email || modalItem.details.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:</span>
                    <span className="font-medium text-slate-800">{modalItem.details.user?.phone || modalItem.details.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Job Title / Role:</span>
                    <span className="font-semibold text-blue-600">{modalItem.details.job_title || "Standard Worker"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">Active</Badge>
                  </div>
                </div>
              )}

              {modalItem.type === "employer" && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Employer Name:</span>
                    <span className="font-semibold text-slate-900">{modalItem.details.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email:</span>
                    <span className="font-medium text-slate-800">{modalItem.details.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:</span>
                    <span className="font-medium text-slate-800">{modalItem.details.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Requested Worker:</span>
                    <span className="font-medium text-slate-800">{modalItem.details.worker_requested || "General Worker"}</span>
                  </div>
                </div>
              )}

              {modalItem.type === "company" && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Company Name:</span>
                    <span className="font-semibold text-slate-900">{modalItem.details.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Workers Supplied:</span>
                    <span className="font-semibold text-blue-600">{modalItem.details.workers_supplied} Workers</span>
                  </div>
                </div>
              )}

              {(modalItem.details.user_id || modalItem.details.user?.id) && (
                <Button
                  size="sm"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center gap-2"
                  onClick={() => {
                    const uId = modalItem.details.user_id || modalItem.details.user?.id;
                    window.open(`/user-logs?user_id=${uId}`, "_blank");
                  }}
                >
                  <Activity className="w-3.5 h-3.5" />
                  View Activity &amp; Privacy Logs
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details & Real-Time Privacy Activity Logs Modal */}
      <UserDetailsModal
        userId={selectedAuditUserId}
        isOpen={!!selectedAuditUserId}
        onClose={() => setSelectedAuditUserId(null)}
      />

      {/* Invoice & Payment Receipt Modal (Cloning User's Stripe/Anthropic Invoice Design) */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <div>
              {/* PDF Container capture area */}
              <div id="invoice-pdf-container" className="p-8 md:p-12 bg-white text-slate-900 font-sans">
                {/* Header: Title Left, Logo Right */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Invoice</h1>
                    <div className="mt-4 space-y-1 text-xs text-slate-900 font-sans">
                      <div className="flex gap-4">
                        <span className="font-bold w-28 text-slate-900">Invoice number</span>
                        <span className="font-bold text-slate-900">{selectedInvoice.invoiceNo}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="font-medium w-28 text-slate-700">Date of issue</span>
                        <span className="text-slate-900">{selectedInvoice.date}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="font-medium w-28 text-slate-700">Date due</span>
                        <span className="text-slate-900">{selectedInvoice.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ihirwe Logo */}
                  <div className="flex flex-col items-end">
                    <img src={logo} alt="Ihirwe Logo" className="h-10 w-auto object-contain mb-1" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ihirwe Pay</span>
                  </div>
                </div>

                {/* Addresses Grid (2 columns) */}
                <div className="grid grid-cols-2 gap-8 mt-10 text-xs text-slate-900 leading-relaxed">
                  {/* Left: Issuer Address */}
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Ihirwe Pay Ltd</p>
                    <p>KN 5 Rd, Nyarugenge</p>
                    <p>PMB 90375</p>
                    <p>Kigali, Rwanda</p>
                    <p>TIN: 129845763</p>
                    <p className="text-slate-700">support@ihirwepay.rw</p>
                  </div>

                  {/* Right: Bill to */}
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Bill to</p>
                    <p className="text-slate-900 font-medium">{selectedInvoice.clientName}'s Organization</p>
                    <p>KK 11 St</p>
                    <p>Kigali</p>
                    <p>Rwanda</p>
                    <p className="text-slate-700">{selectedInvoice.clientName.toLowerCase().replace(/\s+/g, '')}@gmail.com</p>
                  </div>
                </div>

                {/* Amount Paid Highlight Header */}
                <div className="mt-10 space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedInvoice.amount} paid on {selectedInvoice.date}
                  </h2>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-blue-600 underline font-medium block">
                    Paid online via {selectedInvoice.paymentChannel}
                  </a>
                </div>

                {/* Payment Address & Info Notes */}
                <div className="mt-6 text-xs text-slate-700 space-y-1">
                  <p>While we prefer electronic payment methods,</p>
                  <p>any checks must be sent to the address below, NOT to our Kigali main office.</p>
                  <p className="text-slate-300 font-mono tracking-widest my-1">---------------------------------</p>
                  <p className="font-bold uppercase text-[10px] tracking-wider text-slate-800">PAYMENT ADDRESS:</p>
                  <p className="font-semibold text-slate-900">Ihirwe Pay Ltd</p>
                  <p>P.O. Box 104477</p>
                  <p>Kigali, Rwanda</p>
                </div>

                {/* Itemized Table */}
                <div className="mt-10">
                  <div className="grid grid-cols-12 text-xs font-semibold text-slate-600 pb-2 border-b-2 border-slate-900">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Unit price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  <div className="grid grid-cols-12 text-xs text-slate-900 py-3 border-b border-slate-200">
                    <div className="col-span-6 space-y-0.5">
                      <p className="font-semibold text-slate-900">{selectedInvoice.item}</p>
                      <p className="text-[11px] text-slate-500">Service Period: {selectedInvoice.date}</p>
                    </div>
                    <div className="col-span-2 text-right font-medium">1</div>
                    <div className="col-span-2 text-right font-medium">{selectedInvoice.amount}</div>
                    <div className="col-span-2 text-right font-bold text-slate-900">{selectedInvoice.amount}</div>
                  </div>

                  {/* Summary Totals right aligned */}
                  <div className="flex justify-end mt-4">
                    <div className="w-64 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                        <span>Subtotal</span>
                        <span className="font-medium">{selectedInvoice.amount}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                        <span>Total</span>
                        <span className="font-medium">{selectedInvoice.amount}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold text-slate-900 text-sm">
                        <span>Amount paid</span>
                        <span className="font-bold text-slate-900">{selectedInvoice.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 text-xs font-semibold gap-1.5 border-slate-300 hover:bg-slate-100"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Print
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadInvoicePDFDirect(selectedInvoice)}
                  className="h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                >
                  <Download className="w-4 h-4 text-white" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="h-9 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagement;