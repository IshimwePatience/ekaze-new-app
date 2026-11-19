import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { usePlatformAnalytics } from "@/hooks/useAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";

type TimeRange = '7d' | '30d' | '90d' | '1y';

const PlatformAnalytics = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data, isLoading } = usePlatformAnalytics(timeRange);

  const analytics = data?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!analytics) {
    return <div>{t("admin.platformAnalytics.noDataAvailable")}</div>;
  }

  // Stats configuration matching the transaction management design
  const stats = [
    {
      title: t("admin.platformAnalytics.totalRevenue"),
      value: formatCurrency(analytics.overview.total_revenue),
      subtitle: t("admin.platformAnalytics.allTime"),
      change: analytics.overview.revenue_change,
      percentage: t("admin.platformAnalytics.vsLastPeriod"),
      trend: analytics.overview.revenue_change >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-950/30",
    },
    {
      title: t("admin.platformAnalytics.totalUsers"),
      value: analytics.overview.total_users.toLocaleString(),
      subtitle: t("admin.platformAnalytics.registered"),
      change: analytics.overview.users_change,
      percentage: t("admin.platformAnalytics.vsLastPeriod"),
      trend: analytics.overview.users_change >= 0 ? "up" : "down",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/30",
    },
    {
      title: t("admin.platformAnalytics.activeCompanies"),
      value: analytics.overview.active_companies.toString(),
      subtitle: t("admin.platformAnalytics.operating"),
      change: analytics.overview.companies_change,
      percentage: t("admin.platformAnalytics.vsLastPeriod"),
      trend: analytics.overview.companies_change >= 0 ? "up" : "down",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-950/30",
    },
    {
      title: t("admin.platformAnalytics.openIncidents"),
      value: analytics.overview.open_incidents.toString(),
      subtitle: t("admin.platformAnalytics.active"),
      change: analytics.overview.incidents_change,
      percentage: t("admin.platformAnalytics.vsLastPeriod"),
      trend: analytics.overview.incidents_change <= 0 ? "up" : "down",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderBreadcrumb title={t("admin.platformAnalytics.title")}>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-40 h-9">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d" className="text-xs">{t("admin.platformAnalytics.last7Days")}</SelectItem>
            <SelectItem value="30d" className="text-xs">{t("admin.platformAnalytics.last30Days")}</SelectItem>
            <SelectItem value="90d" className="text-xs">{t("admin.platformAnalytics.last90Days")}</SelectItem>
            <SelectItem value="1y" className="text-xs">{t("admin.platformAnalytics.lastYear")}</SelectItem>
          </SelectContent>
        </Select>
      </PageHeaderBreadcrumb>

      {/* Stats Cards - Matching transaction management design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 overflow-hidden group"
              style={{ borderRadius: "12px" }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div
                    className={`p-1 rounded-xl ${stat.bgColor} ${stat.darkBgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-3 h-3 ${stat.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 text font-semibold rounded-full ${
                      stat.trend === "up"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : stat.trend === "down"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {stat.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                    {stat.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                    <span className="text-[10px]">
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mb-2">
                      {stat.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground/80">{stat.subtitle}</span>
                    <span className="text-muted-foreground/60 font-medium">
                      {stat.percentage}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">{t("admin.platformAnalytics.revenueOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenue_trends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">{t("admin.platformAnalytics.userDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.user_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.user_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Registration Trends */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">{t("admin.platformAnalytics.registrationTrends")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.registration_trends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="employers" fill="#10b981" radius={[4, 4, 0, 0]} name={t("admin.platformAnalytics.employers")} />
                <Bar dataKey="workers" fill="#6366f1" radius={[4, 4, 0, 0]} name={t("admin.platformAnalytics.workers")} />
                <Bar dataKey="companies" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t("admin.platformAnalytics.companies")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Tracking */}
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">{t("admin.platformAnalytics.incidentTracking")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.incident_tracking}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                  name={t("admin.platformAnalytics.incidents")}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  name={t("admin.platformAnalytics.resolved")}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      {analytics.top_companies.length > 0 && (
        <Card className="border-border/40 shadow-sm" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">{t("admin.platformAnalytics.topCompanies")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_companies.map((company, index) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.workers} {t("admin.platformAnalytics.workersCount")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-600">
                      {formatCurrency(company.revenue)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t("admin.platformAnalytics.totalRevenueLabel")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlatformAnalytics;