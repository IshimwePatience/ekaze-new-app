import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Rwandan Francs
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Get color class for status
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: 'green',
    pending: 'yellow',
    failed: 'red',
    review: 'orange',
    refunded: 'purple',
  };
  return colors[status] || 'gray';
};

// Get transaction type label
export const getTransactionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    employer_registration: 'Employer Registration',
    worker_registration: 'Worker Registration',
    refund: 'Refund',
    service_fee: 'Service Fee',
    subscription: 'Subscription',
    other: 'Other',
  };
  return labels[type] || type;
};

// Get payment method label
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    mobile_money: 'Mobile Money',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    cash: 'Cash',
    other: 'Other',
  };
  return labels[method] || method;
};
