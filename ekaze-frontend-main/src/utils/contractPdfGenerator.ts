import { jsPDF } from "jspdf";
import { EKAZE_LOGO_BASE64 } from "./ekazeLogoBase64";

export interface ContractParty {
  name: string;
  national_id?: string;
  phone?: string;
  location?: string;
  role?: string;
}

export interface ContractData {
  reference_number?: string;
  contract_date?: string;
  employer?: ContractParty;
  worker?: ContractParty;
  agreed_net_salary?: number | string;
  start_time?: string;
  payment_time?: string;
  payment_day?: number;
  payment_cycle_days?: number;
  next_payment_date?: string;
  days_until_payment?: number;
  otp_code?: string;
  otp_timestamp?: string;
  work_title?: string;
  is_terminated?: boolean;
  status?: string;
  terminated_at?: string;
  duration_days?: number;
  // Flat fallback properties
  employerName?: string;
  employerNid?: string;
  employerPhone?: string;
  employerLocation?: string;
  workerName?: string;
  workerNid?: string;
  workerPhone?: string;
  workerLocation?: string;
  agreedSalary?: number | string;
}

/**
 * Converts a number to words (English) for formal legal currency clause
 */
function numberToWords(num: number): string {
  if (isNaN(num) || num <= 0) return "Zero";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function formatHundreds(n: number): string {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + (n % 10 > 0 ? " " + a[n % 10] : "") + " ";
    } else if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  }

  let result = "";
  if (num >= 1000000) {
    result += formatHundreds(Math.floor(num / 1000000)) + " Million ";
    num %= 1000000;
  }
  if (num >= 1000) {
    result += formatHundreds(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) {
    result += formatHundreds(num);
  }
  return result.trim();
}

/**
 * Formats address cleanly without duplicate ", Rwanda, Rwanda"
 */
function cleanLocation(loc?: string): string {
  if (!loc || !loc.trim()) return "Kigali, Rwanda";
  let s = loc.trim().replace(/,\s*Rwanda/gi, "").trim();
  return `${s}, Rwanda`;
}

/**
 * Generates an official 2-page Microsoft Word-style Rwandan employment contract.
 * - Header includes Ekaze logo from landing page + Republic of Rwanda header
 * - Standard Word document flow with full Page 1 and full Page 2
 * - Sharp, clean layout without rounded borders or heavy bulky cards
 * - Font: Times New Roman
 */
export const downloadEmploymentContractPdf = (data: ContractData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const leftMargin = 20;
  const rightMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 170mm
  const rightEdge = pageWidth - rightMargin;

  const isTerminated = Boolean(
    data.is_terminated ||
    data.status === "terminated" ||
    (typeof data.status === "string" && data.status.toLowerCase().includes("terminated"))
  );
  const terminationTimeStr = data.terminated_at || "Contract Terminated";

  const refNum = data.reference_number || `EMP-RW-${Date.now().toString().slice(-6)}`;
  const dateFormatted = data.contract_date || new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const employerObj = data.employer || {
    name: data.employerName || "Test Employer",
    national_id: data.employerNid || "1199000000000004",
    phone: data.employerPhone || "0788000004",
    location: data.employerLocation || "Kigali, Rwanda",
  };
  const workerObj = data.worker || {
    name: data.workerName || "Test Worker",
    national_id: data.workerNid || "1199000000000005",
    phone: data.workerPhone || "0788000005",
    location: data.workerLocation || "Kigali, Rwanda",
  };

  const empName = employerObj.name || "Test Employer";
  const empId = employerObj.national_id || "1199000000000004";
  const empPhone = employerObj.phone || "0788000004";
  const empLocation = cleanLocation(employerObj.location);

  const workerName = workerObj.name || "Test Worker";
  const workerId = workerObj.national_id || "1199000000000005";
  const workerPhone = workerObj.phone || "0788000005";
  const workerLocation = cleanLocation(workerObj.location);

  const salaryInput = data.agreed_net_salary ?? data.agreedSalary ?? 75000;
  const rawSalary = typeof salaryInput === "string"
    ? parseInt(salaryInput.replace(/[^0-9]/g, ""), 10) || 75000
    : Number(salaryInput) || 75000;

  const salaryFormatted = `${rawSalary.toLocaleString()} RWF`;
  const salaryInWords = `${numberToWords(rawSalary)} Rwandan Francs`;

  const startTime = data.start_time || new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatDayOrdinal = (day: number): string => {
    const mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const resolvedPaymentDay = (() => {
    if (data.payment_day && data.payment_day >= 1 && data.payment_day <= 31) {
      return data.payment_day;
    }
    const parsedStart = data.start_time ? new Date(data.start_time) : (data.contract_date ? new Date(data.contract_date) : new Date());
    if (!isNaN(parsedStart.getTime())) {
      return parsedStart.getDate();
    }
    return new Date().getDate();
  })();

  const paymentDayStr = formatDayOrdinal(resolvedPaymentDay);

  const otpCode = data.otp_code || "VERIFIED";
  const otpTime = data.otp_timestamp || new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Helper to print wrapped text with standard 1.5 line spacing (like Microsoft Word)
  const printParagraph = (text: string, startY: number, fontSize: number = 10, lineSpacing: number = 5.6): number => {
    doc.setFont("times", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, leftMargin, startY);
    return startY + lines.length * lineSpacing;
  };

  // ==========================================
  // PAGE 1: HEADER, PARTIES, ARTICLES 1, 2, 3, 4, 5
  // ==========================================
  
  // 1. TOP HEADER: Republic of Rwanda info on left + Ekaze Logo on right
  let y = 14;
  try {
    doc.addImage(EKAZE_LOGO_BASE64, "PNG", rightEdge - 36, y - 2, 36, 10.2);
  } catch (err) {
    console.warn("Could not render logo in PDF header:", err);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("REPUBLIC OF RWANDA", leftMargin, y);
  
  y += 4.5;
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text("REPUBULIKA Y'U RWANDA", leftMargin, y);

  y += 4.2;
  doc.setFontSize(8.5);
  doc.text("Ministry of Public Service and Labour, Ekaze Labor Registry", leftMargin, y);

  // 2. DOCUMENT TITLE
  y += 7.5;
  doc.setFont("times", "bold");
  doc.setFontSize(12.5);
  doc.text("STANDARD EMPLOYMENT AGREEMENT", pageWidth / 2, y, { align: "center" });

  y += 4.8;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("AMASEZERANO Y'AKAZI HAGATI Y'UMUKORESHA N'UMUKOZI", pageWidth / 2, y, { align: "center" });

  // Divider lines
  y += 3.5;
  doc.setLineWidth(0.6);
  doc.line(leftMargin, y, rightEdge, y);
  y += 1;
  doc.setLineWidth(0.2);
  doc.line(leftMargin, y, rightEdge, y);

  // Reference and Date Row
  y += 5;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Contract Reference: ${refNum}`, leftMargin, y);
  doc.text(`Date of Execution: ${dateFormatted}`, rightEdge, y, { align: "right" });

  if (isTerminated) {
    y += 5;
    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(0.4);
    doc.rect(leftMargin, y, contentWidth, 7);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(180, 0, 0);
    doc.text(`[ STATUS: TERMINATED CONTRACT / AMASEZERANO YASHEJWE ] — ${terminationTimeStr}`, pageWidth / 2, y + 4.8, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
  }

  // 3. PREAMBLE & PARTIES
  y += 6.5;
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("PREAMBLE: IDENTIFICATION OF THE CONTRACTING PARTIES", leftMargin, y);

  // Employer block
  y += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("1. THE FIRST PARTY (THE EMPLOYER):", leftMargin, y);
  
  y += 4.8;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Full Name: ${empName}`, leftMargin + 2, y);
  doc.text(`Telephone Contact: ${empPhone}`, leftMargin + 95, y);
  y += 4.6;
  doc.text(`National ID: ${empId}`, leftMargin + 2, y);
  doc.text(`Operating Location: ${empLocation}`, leftMargin + 95, y);

  // Worker block
  y += 5.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("2. THE SECOND PARTY (THE WORKER):", leftMargin, y);
  
  y += 4.8;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Full Name: ${workerName}`, leftMargin + 2, y);
  doc.text(`Telephone Contact: ${workerPhone}`, leftMargin + 95, y);
  y += 4.6;
  doc.text(`National ID: ${workerId}`, leftMargin + 2, y);
  doc.text(`Residential Location: ${workerLocation}`, leftMargin + 95, y);

  // Recital clause
  y += 6;
  const recitalText = "The First Party and the Second Party, each having full legal capacity to enter into this contract, freely and voluntarily covenant and agree as follows under the Laws of the Republic of Rwanda:";
  y = printParagraph(recitalText, y, 10, 5.6);

  // 4. ARTICLE 1: OBJECT AND COMMENCEMENT
  y += 3.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 1: OBJECT AND COMMENCEMENT OF EMPLOYMENT", leftMargin, y);
  y += 4.5;
  const art1Text = `1.1 The First Party hereby engages and employs the Second Party, and the Second Party accepts employment to perform assigned duties with diligence, professionalism, and honesty. This official employment commenced on ${startTime}.\n` +
    "1.2 The Second Party undertakes to execute duties in compliance with lawful instructions, workplace safety standards, and established operational rules.";
  y = printParagraph(art1Text, y, 10, 5.6);

  // 5. ARTICLE 2: REMUNERATION AND PAYMENT SCHEDULE
  y += 3.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 2: AGREED REMUNERATION AND PAYMENT SCHEDULE", leftMargin, y);
  y += 4.5;
  const art2Text = `2.1 Agreed Net Monthly Remuneration: The First Party shall pay the Second Party an agreed net monthly remuneration of ${salaryFormatted} (${salaryInWords}), payable without unauthorized deductions.\n` +
    `2.2 Payment Schedule and Recurrence: Disbursed punctually on the ${paymentDayStr} day of each calendar month, no later than 5:00 PM CAT.\n` +
    `2.3 Payment Method: Disbursed directly to the Second Party's verified mobile money phone (${workerPhone}) or registered bank account.\n` +
    "2.4 Remuneration Adjustments: Any statutory revisions or adjustments to remuneration shall be agreed upon in writing by both parties.";
  y = printParagraph(art2Text, y, 10, 5.6);

  // 6. ARTICLE 3: WORKING HOURS, REST PERIODS AND LEAVE
  y += 3.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 3: WORKING HOURS, REST PERIODS AND LEAVE", leftMargin, y);
  y += 4.5;
  const art3Text = "3.1 Standard Working Hours: Working hours shall conform strictly to Law N° 66/2018 of 30/08/2018 regulating labor in Rwanda, not exceeding 45 hours per week, with statutory rest intervals.\n" +
    "3.2 Rest and Public Holidays: The Second Party is entitled to weekly rest, statutory public holidays, and annual leave as provided under Rwandan labor legislation.";
  y = printParagraph(art3Text, y, 10, 5.6);

  // 7. ARTICLE 4: MUTUAL RIGHTS AND OBLIGATIONS
  y += 3.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 4: MUTUAL RIGHTS AND WORKPLACE OBLIGATIONS", leftMargin, y);
  y += 4.5;
  const art4Text = `4.1 Employer Obligations: The First Party shall disburse the agreed remuneration of ${salaryFormatted} punctually, provide a safe and healthy working environment, and supply necessary workplace materials.\n` +
    "4.2 Worker Obligations: The Second Party shall perform assigned tasks faithfully, observe workplace safety standards, protect employer property, and maintain confidentiality regarding employer affairs.";
  y = printParagraph(art4Text, y, 10, 5.6);

  // 8. ARTICLE 5: DURATION, NOTICE AND TERMINATION (fills Page 1 completely)
  y += 3.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 5: DURATION, NOTICE AND TERMINATION", leftMargin, y);
  y += 4.5;
  const art5Text = "5.1 Contract Term: This agreement takes legal effect on the execution date and remains active until terminated in accordance with the provisions of this contract or Rwandan labor legislation.\n" +
    "5.2 Statutory Notice: Either party may terminate this employment agreement by providing thirty (30) days prior written statutory notice or payment of equivalent salary in lieu of notice, except in cases of gross misconduct as defined by law.\n" +
    "5.3 Settlement of Dues: Upon contract termination, the First Party shall promptly settle all accrued wages, unused statutory leave compensation, and deliver a formal certificate of employment." +
    (isTerminated ? `\n5.4 Official Termination: This agreement was officially terminated on ${terminationTimeStr}. Active contractual obligations and employment duties ceased as of this date.` : "");
  y = printParagraph(art5Text, y, 10, 5.4);

  // Footer for Page 1
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, 284, rightEdge, 284);
  doc.text(`Republic of Rwanda Standard Employment Contract, Ref ${refNum}`, leftMargin, 289);
  doc.text("Page 1 of 2", rightEdge, 289, { align: "right" });

  // ==========================================
  // PAGE 2: ARTICLES 6, 7 & SIGNATURES
  // ==========================================
  doc.addPage();
  y = 15;

  // Page 2 Header
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("STANDARD EMPLOYMENT AGREEMENT: PAGE 2 OF 2", leftMargin, y);
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text(`Contract Reference: ${refNum}`, rightEdge, y, { align: "right" });

  y += 3.5;
  doc.setLineWidth(0.4);
  doc.line(leftMargin, y, rightEdge, y);

  // --- ARTICLE 6: DISPUTE RESOLUTION AND APPLICABLE LAW ---
  y += 8;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 6: DISPUTE RESOLUTION AND APPLICABLE LAW", leftMargin, y);
  y += 4.5;
  const art6Text = "6.1 Amicable Resolution: Any disagreement arising out of the interpretation or performance of this contract shall first be resolved through good-faith amicable negotiation between the parties.\n" +
    "6.2 Competent Jurisdiction: If amicable settlement fails, the matter shall be submitted to the competent Labor Inspectorate or the courts of the Republic of Rwanda, in accordance with the laws governing the Republic of Rwanda.";
  y = printParagraph(art6Text, y, 10, 5.6);

  // --- ARTICLE 7: DIGITAL AUTHENTICATION AND LEGAL VALIDITY ---
  y += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("ARTICLE 7: DIGITAL AUTHENTICATION AND LEGAL VALIDITY", leftMargin, y);
  y += 4.5;
  const art7Text = "Pursuant to the Law governing Electronic Messages, Electronic Signatures and Electronic Transactions in Rwanda, this agreement is legally binding and authenticated. The Second Party has formally authenticated identity, consented to all terms, and signed electronically via National Identification Agency (NIDA) verified One-Time Password (OTP) delivered to the worker's registered mobile number.";
  y = printParagraph(art7Text, y, 10, 5.6);

  // In witness whereof declaration
  y += 6;
  const witnessText = "IN WITNESS WHEREOF, the parties hereto have voluntarily approved, executed, and signed this Agreement on the date herein written.";
  y = printParagraph(witnessText, y, 10, 5.6);

  // --- SIGNATURES AND EXECUTION SECTION (Sharp rectangular borders - NO rounded corners!) ---
  y += 6;
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("EXECUTION AND SIGNATURES OF THE PARTIES:", leftMargin, y);
  y += 4.5;

  const colWidth = (contentWidth - 6) / 2; // 82mm each

  // Left Box: Employer Signature (Sharp rectangle, clean line, NO rounded borders)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(leftMargin, y, colWidth, 54);

  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("FOR THE FIRST PARTY (EMPLOYER):", leftMargin + 3.5, y + 6.5);

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Full Name: ${empName}`, leftMargin + 3.5, y + 13.5);
  doc.text(`National ID: ${empId}`, leftMargin + 3.5, y + 19.5);
  doc.text(`Date: ${dateFormatted}`, leftMargin + 3.5, y + 25.5);
  doc.text("Status: Approved and Executed", leftMargin + 3.5, y + 31.5);

  doc.text("Signature and Official Stamp:", leftMargin + 3.5, y + 41);
  doc.line(leftMargin + 3.5, y + 47, leftMargin + colWidth - 5, y + 47);

  // Right Box: Worker Digital OTP Signature (Sharp rectangle, clean line, NO rounded borders)
  const rightBoxX = leftMargin + colWidth + 6;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(rightBoxX, y, colWidth, 54);

  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.text("FOR THE SECOND PARTY (WORKER):", rightBoxX + 3.5, y + 6.5);

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Full Name: ${workerName}`, rightBoxX + 3.5, y + 13.5);
  doc.text(`National ID: ${workerId}`, rightBoxX + 3.5, y + 19.5);

  // Inner Digital Stamp Box (Sharp rectangle, NO rounded corners)
  doc.setLineWidth(0.2);
  doc.rect(rightBoxX + 3.5, y + 23.5, colWidth - 7, 26);

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("[ DIGITAL OTP SIGNATURE ]", rightBoxX + 5.5, y + 29);

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text(`SMS OTP Code: ${otpCode}`, rightBoxX + 5.5, y + 34.5);
  doc.text(`Verified On: ${otpTime}`, rightBoxX + 5.5, y + 39.5);
  doc.text(`NIDA Phone: ${workerPhone}`, rightBoxX + 5.5, y + 44.5);

  // Footer for Page 2
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, 284, rightEdge, 284);
  doc.text(`Republic of Rwanda Standard Employment Contract, Ref ${refNum}`, leftMargin, 289);
  doc.text("Page 2 of 2", rightEdge, 289, { align: "right" });

  // Download the contract PDF
  const cleanWorkerName = workerName.replace(/[^a-zA-Z0-9]/g, "_");
  const prefix = isTerminated ? "Terminated_Contract" : "Employment_Contract";
  doc.save(`${prefix}_${cleanWorkerName}_${refNum}.pdf`);
};
