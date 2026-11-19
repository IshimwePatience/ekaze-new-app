import { jsPDF } from "jspdf";

export interface InvoiceData {
  id?: number | string;
  reference_number?: string;
  reference_id?: string;
  description?: string;
  transaction_type?: string;
  amount?: number;
  phone?: string;
  phone_number?: string;
  date?: string;
  created_at?: string;
  status?: string;
  employer_name?: string;
  employer_email?: string;
  employer_address?: string;
}

export const downloadInvoicePdf = (data: InvoiceData) => {
  const doc = new jsPDF();

  const refNum = data.reference_number || data.reference_id || `INV-EMP-14-001`;
  let rawDate = data.date || data.created_at || new Date().toISOString();
  let dateStr = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
  } catch (err) {
    dateStr = rawDate;
  }
  const descStr = data.description || data.transaction_type || "Worker Hiring & Contact Access Fee";
  const amountVal = data.amount || 5000;
  const phoneStr = data.phone || data.phone_number || "0788000004";
  const empName = data.employer_name || "Employer Organization";
  const empEmail = data.employer_email || "employer@ekaze.rw";
  const empAddress = data.employer_address || "Kigali, Rwanda";

  const formattedAmount = `${Number(amountVal).toLocaleString()} RWF`;

  // 1. Top Left Title: Invoice
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", 15, 25);

  // 2. Top Right Logo: ekaze by EKAZE
  doc.setTextColor(2, 132, 199); // #0284c7 ekaze blue
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ekaze", 155, 22);

  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("EKAZE", 168, 28);

  // 3. Invoice Number & Dates
  let y = 38;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  
  doc.setFont("helvetica", "normal");
  doc.text("Invoice number:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(refNum, 45, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date of issue:", 15, y);
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, 45, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date due:", 15, y);
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, 45, y);

  // 4. Two Column Entity Info (Ekaze Ltd vs Bill to)
  y = 65;

  // Left: Ekaze Ltd
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Ekaze Ltd", 15, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("KN 5 Rd, Nyarugenge", 15, y + 6);
  doc.text("PMB 90375", 15, y + 12);
  doc.text("Kigali, Rwanda", 15, y + 18);
  doc.text("TIN: 129845763", 15, y + 24);
  doc.text("support@ekazepay.rw", 15, y + 30);

  // Right: Bill to
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Bill to", 110, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(empName, 110, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(empAddress, 110, y + 12);
  doc.text(empEmail, 110, y + 18);
  doc.text(`MoMo Phone Paid: ${phoneStr}`, 110, y + 24);

  // 5. Bold Paid Banner
  y = 112;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${formattedAmount} paid on ${dateStr}`, 15, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(37, 99, 235); // blue
  doc.text("Paid online via MTN Mobile Money", 15, y);

  // 6. Disclaimer & Payment Address
  y += 10;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("While we prefer electronic payment methods, any checks must be sent to the address below, NOT to our Kigali main office.", 15, y);

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(15, y, 90, y);

  y += 6;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("PAYMENT ADDRESS:", 15, y);

  doc.setFont("helvetica", "normal");
  doc.text("Ekaze Ltd", 15, y + 5);
  doc.text("P.O. Box 104477", 15, y + 10);
  doc.text("Kigali, Rwanda", 15, y + 15);

  // 7. Items Table
  y = 175;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Description", 15, y);
  doc.text("Qty", 120, y);
  doc.text("Unit price", 140, y);
  doc.text("Amount", 175, y);

  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);

  // Table Row Item
  y += 10;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(descStr, 15, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Service Period: ${dateStr}`, 15, y + 5);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("1", 123, y);
  doc.text(formattedAmount, 140, y);

  doc.setFont("helvetica", "bold");
  doc.text(formattedAmount, 175, y);

  // Download PDF
  doc.save(`EKAZE-Invoice-${refNum}.pdf`);
};

export interface ReceiptData {
  id?: number | string;
  reference_id?: string;
  reference_number?: string;
  date?: string;
  created_at?: string;
  type?: string;
  transaction_type?: string;
  description?: string;
  amount: number;
  direction?: "in" | "out";
  sender_name?: string;
  sender_phone?: string;
  worker_name?: string;
  worker_phone?: string;
  balance?: number;
  payment_method?: string;
  status?: string;
}

export const downloadReceiptPdf = (data: ReceiptData) => {
  const doc = new jsPDF();

  const refNum = data.reference_id || data.reference_number || `TXN-PAY-${new Date().getFullYear()}-001`;
  let rawDate = data.date || data.created_at || new Date().toISOString();
  let dateStr = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
  } catch {
    dateStr = rawDate;
  }

  const isReceived = data.direction === "in" || data.type === "payment";
  const descStr = data.description || (isReceived ? "Domestic Staff Salary / Payout" : "Wallet Withdrawal / Cash Out");
  const amountVal = data.amount || 0;
  const balanceVal = data.balance;
  const paymentMethod = data.payment_method || "MTN Mobile Money";
  const workerName = data.worker_name || "Domestic Professional";
  const workerPhone = data.worker_phone || "0788000005";
  const senderName = data.sender_name || (isReceived ? "Employer" : "Ekaze Payout System");
  const senderPhone = data.sender_phone || "0788000004";
  const typeLabel = (data.type || data.transaction_type || (isReceived ? "Payment" : "Withdrawal")).toUpperCase();

  const formattedAmount = `${Number(amountVal).toLocaleString()} RWF`;
  const formattedBalance = balanceVal !== undefined ? `${Number(balanceVal).toLocaleString()} RWF` : "";

  // 1. Top Left Title: Receipt (matching Invoice 32pt bold slate-900)
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt", 15, 25);

  // 2. Top Right Logo: ekaze by EKAZE
  doc.setTextColor(2, 132, 199); // #0284c7 ekaze blue
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ekaze", 155, 22);

  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("EKAZE", 168, 28);

  // 3. Receipt Number & Dates (matching Invoice style)
  let y = 38;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  
  doc.setFont("helvetica", "normal");
  doc.text("Receipt number:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(refNum, 45, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date of issue:", 15, y);
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, 45, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Transaction type:", 15, y);
  doc.setTextColor(15, 23, 42);
  doc.text(typeLabel, 45, y);

  // 4. Two Column Entity Info (Ekaze Ltd vs Recipient / Account Holder)
  y = 65;

  // Left: Ekaze Ltd
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Ekaze Ltd", 15, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("KN 5 Rd, Nyarugenge", 15, y + 6);
  doc.text("PMB 90375", 15, y + 12);
  doc.text("Kigali, Rwanda", 15, y + 18);
  doc.text("TIN: 129845763", 15, y + 24);
  doc.text("support@ekazepay.rw", 15, y + 30);

  // Right: Recipient / Worker Information
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(isReceived ? "Recipient" : "Account Holder", 110, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(workerName, 110, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Registered Phone: ${workerPhone}`, 110, y + 12);
  doc.text(`Counterparty: ${senderName}`, 110, y + 18);
  if (senderPhone && senderPhone !== "N/A") {
    doc.text(`Counterparty Phone: ${senderPhone}`, 110, y + 24);
  }
  doc.text("Status: Completed / Verified", 110, y + 30);

  // 5. Bold Paid/Received Banner
  y = 112;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${formattedAmount} ${isReceived ? "received" : "processed"} on ${dateStr}`, 15, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(37, 99, 235); // blue
  doc.text(`Processed online via ${paymentMethod}`, 15, y);

  // 6. Disclaimer & Payment Address
  y += 10;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("This official electronic transaction receipt confirms the transfer processed through Ekaze verified platform.", 15, y);

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(15, y, 90, y);

  y += 6;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("PAYMENT ADDRESS:", 15, y);

  doc.setFont("helvetica", "normal");
  doc.text("Ekaze Ltd", 15, y + 5);
  doc.text("P.O. Box 104477", 15, y + 10);
  doc.text("Kigali, Rwanda", 15, y + 15);

  // 7. Items Table
  y = 175;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Description", 15, y);
  doc.text("Qty", 120, y);
  doc.text("Unit price", 140, y);
  doc.text("Amount", 175, y);

  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);

  // Table Row Item
  y += 10;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(descStr, 15, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Party: ${senderName} | Ref: ${refNum}`, 15, y + 5);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("1", 123, y);
  doc.text(formattedAmount, 140, y);

  doc.setFont("helvetica", "bold");
  doc.text(formattedAmount, 175, y);

  // 8. Closing Wallet Balance Row (if provided)
  if (formattedBalance) {
    y += 12;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, y - 2, 195, y - 2);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Closing Wallet Balance:", 15, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(formattedBalance, 175, y + 4);
  }

  // Download PDF
  doc.save(`Receipt_${refNum}.pdf`);
};
