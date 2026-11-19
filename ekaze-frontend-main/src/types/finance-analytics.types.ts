// Finance Analytics Types

export interface FinancialMetric {
  value: number;
  change: number;
  formatted_value: string;
  formatted_change: string;
  trend: 'up' | 'down';
}

export interface FinancialMetrics {
  total_revenue: FinancialMetric;
  total_expenses: FinancialMetric;
  net_profit: FinancialMetric;
  profit_margin: FinancialMetric;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RevenueSourceItem {
  source: string;
  amount: number;
}

export interface DailyTransactionItem {
  day: string;
  date: string;
  transactions: number;
  value: number;
}

export interface SummaryStatItem {
  value: number;
  formatted: string;
}

export interface SummaryStats {
  revenue_growth: SummaryStatItem;
  avg_transaction: SummaryStatItem;
  total_transactions: SummaryStatItem;
}

export interface FinanceAnalyticsData {
  financial_metrics: FinancialMetrics;
  monthly_revenue: MonthlyRevenueItem[];
  revenue_by_source: RevenueSourceItem[];
  daily_transactions: DailyTransactionItem[];
  summary_stats: SummaryStats;
}

export interface FinanceAnalyticsFilters {
  period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
}

export interface FinanceAnalyticsResponse {
  success: boolean;
  data: FinanceAnalyticsData;
  filters?: FinanceAnalyticsFilters;
  timestamp: string;
}

// Monthly Trends Response
export interface MonthlyTrendsResponse {
  success: boolean;
  data: MonthlyRevenueItem[];
  filters?: FinanceAnalyticsFilters;
}

// Revenue Breakdown Response
export interface RevenueBreakdownResponse {
  success: boolean;
  data: RevenueSourceItem[];
  filters?: FinanceAnalyticsFilters;
}

// Export Response
export interface ExportFinanceResponse {
  success: boolean;
  data: {
    financial_metrics: FinancialMetrics;
    monthly_revenue: MonthlyRevenueItem[];
    revenue_by_source: RevenueSourceItem[];
    daily_transactions: DailyTransactionItem[];
    filters?: FinanceAnalyticsFilters;
    exported_at: string;
  };
}