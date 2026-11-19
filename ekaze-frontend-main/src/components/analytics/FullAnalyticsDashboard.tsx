'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart,
} from 'recharts';
import {
  BarChart2, Users, Briefcase, Building2, TrendingUp, CreditCard,
  UserCheck, AlertTriangle, MapPin, Wallet, Globe,
  ArrowUpRight, ArrowDownRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AnalyticsFilterBar } from '@/components/analytics/AnalyticsFilterBar';
import {
  useAnalyticsOverview, useAnalyticsUsers, useAnalyticsWorkers,
  useAnalyticsEmployments, useAnalyticsCompanies, useAnalyticsTransactions,
  useAnalyticsHiringRequests, useAnalyticsIncidents, useAnalyticsAgents,
  useAnalyticsGeography, useAnalyticsGrowth, useAnalyticsEmployers,
} from '@/hooks/usefullAnalytics';
import type { AnalyticsFilters } from '@/types/fullanalytics.types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number;
  name: string;
  color?: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  fmt?: (value: number, name: string) => string;
}

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

interface AnimatedProps {
  children: React.ReactNode;
  delay?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const C = [
  '#3b82f6','#22c55e','#f59e0b','#ef4444',
  '#8b5cf6','#14b8a6','#f97316','#6366f1','#ec4899','#84cc16',
];

const fmtNum = (v: number): string =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

const fmtRwf = (v: number): string => `${fmtNum(v)} RWF`;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

function Animated({ children, delay = 0 }: AnimatedProps) {
  return (
    <div style={{ animation: `slideUpFade 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM RECHARTS TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

function CT({ active, payload, label, fmt }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 backdrop-blur border border-border/60 rounded-xl shadow-2xl p-3 text-xs min-w-[140px]">
      {label && (
        <p className="font-semibold text-foreground mb-2 pb-1.5 border-b border-border/40 truncate max-w-[180px]">
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color ?? p.fill ?? C[i] }}
            />
            <span className="text-muted-foreground capitalize">
              {String(p.name ?? '').replace(/_/g, ' ')}
            </span>
          </div>
          <span className="font-bold text-foreground">
            {fmt
              ? fmt(p.value, p.name)
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIE INNER LABEL
// ─────────────────────────────────────────────────────────────────────────────

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({ title, value, growth, allTime, icon: Icon, accent }: {
  title: string;
  value: number | string;
  growth?: number;
  allTime?: number | string;
  icon: React.ElementType;
  accent: string;
}) {
  const up = typeof growth === 'number' && growth >= 0;
return (
  <Card className="border-border/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative" style={{ borderRadius: '10px' }}>
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 70%)` }}
    />
    <CardContent className="relative p-3">
      <div className="flex items-start justify-between mb-1">
        <div className="p-1.5 rounded-lg" style={{ background: `${accent}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
        {typeof growth === 'number' && (
          <div className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            up ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
               : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
          }`}>
            {up ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-foreground">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{title}</p>
      {allTime !== undefined && (
        <p className="text-[9px] text-muted-foreground/50 mt-1.5">
          All-time: {typeof allTime === 'number' ? allTime.toLocaleString() : allTime}
        </p>
      )}
    </CardContent>
  </Card>
);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART CARD
// ─────────────────────────────────────────────────────────────────────────────

function CC({ title, subtitle, children, className = '' }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-border/40 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-0 pt-4 px-5">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">{children}</CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE STAT ROW (finance-style number strip)
// ─────────────────────────────────────────────────────────────────────────────

function StatStrip({ items }: {
  items: { label: string; value: string | number; color?: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-px border border-border/30 rounded-md overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="flex-1 min-w-[90px] px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors">
          <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
          <p className="text-base font-bold mt-0.5" style={{ color: item.color ?? 'inherit' }}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CHART DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

const AXIS_STYLE = { fontSize: 9, fill: 'var(--muted-foreground)' };
const GRID_PROPS = { strokeDasharray: '3 3', stroke: 'var(--border)', strokeOpacity: 0.45 };
const CHART_MARGIN_H = { top: 4, right: 12, bottom: 4, left: 0 };
const CHART_MARGIN_V = { top: 0, right: 16, bottom: 0, left: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type AnalyticsRole = 'admin' | 'supervisor';
type AnalyticsTab =
  | 'overview' | 'users' | 'workers' | 'employments' | 'companies'
  | 'transactions' | 'hiring' | 'incidents' | 'agents' | 'geography'
  | 'growth' | 'employers';

export default function FullAnalyticsDashboard({ role = 'supervisor' }: { role?: AnalyticsRole }) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [tabKey,    setTabKey]    = useState(0);
  const [filters,   setFilters]   = useState<AnalyticsFilters>({ period: 'month' });

  const [companyId,  setCompanyId]  = useState('');
  const [employerId, setEmployerId] = useState('');
  const [workerId,   setWorkerId]   = useState('');
  const [severity,   setSeverity]   = useState('');
  const [status,     setStatus]     = useState('');

  const merged: AnalyticsFilters = {
    ...filters,
    ...(companyId  ? { company_id:  Number(companyId)  } : {}),
    ...(employerId ? { employer_id: Number(employerId) } : {}),
    ...(workerId   ? { worker_id:   Number(workerId)   } : {}),
    ...(severity   ? { severity } : {}),
    ...(status     ? { status }   : {}),
  };

  const overview     = useAnalyticsOverview(role, merged);
  const users        = useAnalyticsUsers(role, merged);
  const workers      = useAnalyticsWorkers(role, merged);
  const employments  = useAnalyticsEmployments(role, merged);
  const companies    = useAnalyticsCompanies(role, merged);
  const transactions = useAnalyticsTransactions(role, merged);
  const hiring       = useAnalyticsHiringRequests(role, merged);
  const incidents    = useAnalyticsIncidents(role, merged);
  const agents       = useAnalyticsAgents(role, merged);
  const geography    = useAnalyticsGeography(role, merged);
  const growth       = useAnalyticsGrowth(role, merged);
  const employers    = useAnalyticsEmployers(role, merged);

  function handleTabChange(v: string) {
    setActiveTab(v as AnalyticsTab);
    setTabKey(k => k + 1);
    setStatus('');
  }

  const numInput = (placeholder: string, val: string, set: (v: string) => void) => (
    <input
      type="number"
      placeholder={placeholder}
      value={val}
      onChange={e => set(e.target.value)}
      className="h-8 w-28 rounded-md border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );

  const statusFilter = (vals: string[]) => (
    <Select value={status || 'all'} onValueChange={v => setStatus(v === 'all' ? '' : v)}>
      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {vals.map(v => (
          <SelectItem key={v} value={v} className="capitalize text-xs">
            {v.replace(/_/g, ' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const severityFilter = (
    <Select value={severity || 'all'} onValueChange={v => setSeverity(v === 'all' ? '' : v)}>
      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All severities</SelectItem>
        {['critical','high','medium','low'].map(v => (
          <SelectItem key={v} value={v} className="capitalize text-xs">{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const TABS = [
    { value: 'overview',     label: 'Overview',     icon: BarChart2     },
    { value: 'users',        label: 'Users',        icon: Users         },
    { value: 'workers',      label: 'Workers',      icon: Briefcase     },
    { value: 'employments',  label: 'Employments',  icon: UserCheck     },
    { value: 'companies',    label: 'Companies',    icon: Building2     },
    { value: 'transactions', label: 'Transactions', icon: CreditCard    },
    { value: 'hiring',       label: 'Hiring',       icon: UserCheck     },
    { value: 'incidents',    label: 'Incidents',    icon: AlertTriangle },
    { value: 'agents',       label: 'Agents',       icon: Wallet        },
    { value: 'geography',    label: 'Geography',    icon: MapPin        },
    { value: 'growth',       label: 'Growth',       icon: TrendingUp    },
    { value: 'employers',    label: 'Employers',    icon: Globe         },
  ];

  return (
    <div className="space-y-4">

            {/* ✅ ADD THIS HEADER SECTION HERE - before the <style> tag */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base text-left font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Analytics Dashboard
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Comprehensive insights into platform performance, user activity, and business metrics
          </p>
        </div>
        
        {/* Optional: Add a timestamp badge like SupervisorStats */}
        <Badge variant="outline" className="text-[10px] font-medium">
          <Clock className="w-2.5 h-2.5 mr-1" />
          {new Date().toLocaleTimeString()}
        </Badge>
      </div>


      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .recharts-tooltip-wrapper { z-index: 100 !important; }
        .recharts-legend-item-text { font-size: 10px !important; }
      `}</style>

      <Tabs value={activeTab} onValueChange={handleTabChange}>

        {/* ── Tab navigation ── */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex bg-transparent p-0 flex-nowrap min-w-max">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-[10px] flex items-center gap-1.5 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Filter bar ── */}
        <div className="mt-3 p-3 bg-muted/20 rounded-xl border border-border/30">
          <AnalyticsFilterBar
            filters={filters}
            onChange={setFilters}
            extra={
              <div className="flex flex-wrap gap-2">
                {['workers','companies','transactions','hiring','incidents','agents','employments'].includes(activeTab) && numInput('Company ID',  companyId,  setCompanyId)}
                {['employments','transactions','hiring','incidents','employers'].includes(activeTab)                    && numInput('Employer ID', employerId, setEmployerId)}
                {['transactions','hiring','incidents'].includes(activeTab)                                             && numInput('Worker ID',   workerId,   setWorkerId)}
                {activeTab === 'incidents'   && severityFilter}
                {activeTab === 'incidents'   && statusFilter(['reported','under_investigation','resolved','dismissed'])}
                {activeTab === 'employments' && statusFilter(['active','completed','terminated'])}
                {activeTab === 'hiring'      && statusFilter(['pending','accepted','rejected','cancelled'])}
                {activeTab === 'companies'   && statusFilter(['approved','pending','suspended','rejected'])}
              </div>
            }
          />
        </div>

        {/* ════════════════════════════════════════════════
            OVERVIEW
        ════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="mt-4">
          {overview.isLoading ? <SectionSkeleton /> : overview.data && (() => {
            const { kpis, quick_stats } = overview.data.data;
            return (
              <div key={tabKey} className="space-y-4">

                {/* Stat strip */}
                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'New Users',        value: kpis.users.current,             color: '#3b82f6' },
                    { label: 'New Workers',      value: kpis.workers.current,           color: '#8b5cf6' },
                    { label: 'New Companies',    value: kpis.companies.current,         color: '#f97316' },
                    { label: 'Revenue (RWF)',    value: kpis.revenue.current.toLocaleString(), color: '#22c55e' },
                    { label: 'Incidents',        value: kpis.incidents.current,         color: '#ef4444' },
                    { label: 'Hiring Requests',  value: kpis.hiring_requests.current,   color: '#06b6d4' },
                    { label: 'Employments',      value: kpis.employments.current,       color: '#6366f1' },
                  ]} />
                </Animated>

                {/* Growth KPI cards */}
                <Animated delay={60}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard title="New Users"     value={kpis.users.current}     growth={kpis.users.growth}     allTime={kpis.users.all_time}     icon={Users}        accent="#3b82f6" />
                    <KpiCard title="New Workers"   value={kpis.workers.current}   growth={kpis.workers.growth}   allTime={kpis.workers.all_time}   icon={Briefcase}    accent="#8b5cf6" />
                    <KpiCard title="Revenue (RWF)" value={kpis.revenue.current.toLocaleString()} growth={kpis.revenue.growth} allTime={kpis.revenue.all_time.toLocaleString()} icon={CreditCard} accent="#22c55e" />
                    <KpiCard title="New Employers" value={kpis.employers.current} growth={kpis.employers.growth} allTime={kpis.employers.all_time} icon={Users}        accent="#14b8a6" />
                  </div>
                </Animated>

                {/* Quick-status pill grid */}
                <Animated delay={120}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {([
                      ['Active Workers',     quick_stats.active_workers,     '#3b82f6'],
                      ['Hired Workers',      quick_stats.hired_workers,      '#8b5cf6'],
                      ['Active Companies',   quick_stats.active_companies,   '#22c55e'],
                      ['Pending Companies',  quick_stats.pending_companies,  '#f59e0b'],
                      ['Open Incidents',     quick_stats.open_incidents,     '#ef4444'],
                      ['Pending Hirings',    quick_stats.pending_hirings,    '#f97316'],
                      ['Active Employments', quick_stats.active_employments, '#14b8a6'],
                    ] as [string, number, string][]).map(([label, val, color]) => (
                      <div key={label} className="rounded-xl p-3 text-center border border-border/30 bg-muted/30 hover:bg-muted/50 transition-colors">
                        <p className="text-xl font-bold" style={{ color }}>{val.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </Animated>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            USERS
        ════════════════════════════════════════════════ */}
        <TabsContent value="users" className="mt-4">
          {users.isLoading ? <SectionSkeleton /> : users.data && (() => {
            const d = users.data.data;
            return (
              <div key={tabKey} className="space-y-4">

                {/* Dominant: full-width registration trend */}
                <Animated delay={0}>
                  <CC title="User Registration Trend" subtitle="New registrations over selected period">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={d.registration_trend} margin={CHART_MARGIN_H}>
                        <defs>
                          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="period"  tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                        <Tooltip content={<CT />} />
                        <Area type="monotone" dataKey="count" name="Registrations"
                          stroke="#3b82f6" strokeWidth={2.5} fill="url(#gBlue)"
                          dot={false} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>

                {/* Second row: role split + verification side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Animated delay={60}>
                    <CC title="Users by Role">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_role} dataKey="count" nameKey="role"
                            cx="50%" cy="50%" outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_role.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Verification & Account Status" subtitle="Verified vs unverified · by status">
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={100}>
                          <BarChart data={d.verification_stats} layout="vertical" margin={CHART_MARGIN_V}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={80} />
                            <Tooltip content={<CT />} />
                            <Bar dataKey="count" name="Count" radius={[0,4,4,0]} maxBarSize={16}>
                              <Cell fill="#22c55e" />
                              <Cell fill="#e5e7eb" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height={100}>
                          <BarChart data={d.by_status} margin={CHART_MARGIN_H}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="status" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                            <Tooltip content={<CT />} />
                            <Bar dataKey="count" name="Count" radius={[4,4,0,0]} maxBarSize={36}>
                              {d.by_status.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CC>
                  </Animated>
                </div>

                {/* Province */}
                <Animated delay={160}>
                  <CC title="Users by Province">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={d.by_province} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                        <CartesianGrid {...GRID_PROPS} horizontal={false} />
                        <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                        <YAxis type="category" dataKey="province" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={72} />
                        <Tooltip content={<CT />} />
                        <Bar dataKey="count" name="Users" fill="#14b8a6" radius={[0,4,4,0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            WORKERS
        ════════════════════════════════════════════════ */}
        <TabsContent value="workers" className="mt-4">
          {workers.isLoading ? <SectionSkeleton /> : workers.data && (() => {
            const d = workers.data.data;
            const topRatedNum = d.top_rated.map(w => ({
              ...w, average_rating: parseFloat(w.average_rating as string),
            }));
            return (
              <div key={tabKey} className="space-y-4">

                {/* Dominant: experience + salary combined in one chart */}
                <Animated delay={0}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CC title="Availability Status" className="md:col-span-1">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_status} dataKey="count" nameKey="availability_status"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_status.map((_, i) => <Cell key={i} fill={['#22c55e','#f59e0b','#ef4444'][i % 3]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>

                    <CC title="Experience & Salary Distribution" subtitle="Experience levels · Salary ranges" className="md:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={d.by_experience} margin={CHART_MARGIN_H}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="experience_level" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={32} />
                            <Tooltip content={<CT />} />
                            <Bar dataKey="count" name="Workers" radius={[4,4,0,0]} maxBarSize={48}>
                              {d.by_experience.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={d.salary_distribution} margin={CHART_MARGIN_H}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="range" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={32} />
                            <Tooltip content={<CT />} />
                            <Bar dataKey="count" name="Workers" fill="#8b5cf6" radius={[4,4,0,0]} maxBarSize={48} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CC>
                  </div>
                </Animated>

                {/* NIDA + Insurance + Top rated + Per company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Animated delay={80}>
                    <CC title="NIDA & Insurance Coverage" subtitle="Verification and insurance rates">
                      <div className="space-y-5 pt-1">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">NIDA Verification</p>
                          <ResponsiveContainer width="100%" height={70}>
                            <BarChart data={d.nida_stats} layout="vertical" margin={CHART_MARGIN_V}>
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={80} />
                              <Tooltip content={<CT />} />
                              <Bar dataKey="count" name="Count" radius={[0,4,4,0]} maxBarSize={16}>
                                {d.nida_stats.map((_, i) => <Cell key={i} fill={i === 0 ? '#3b82f6' : '#d1d5db'} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Insurance Coverage</p>
                          <ResponsiveContainer width="100%" height={70}>
                            <BarChart data={d.insurance_stats} layout="vertical" margin={CHART_MARGIN_V}>
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={80} />
                              <Tooltip content={<CT />} />
                              <Bar dataKey="count" name="Count" radius={[0,4,4,0]} maxBarSize={16}>
                                {d.insurance_stats.map((_, i) => <Cell key={i} fill={i === 0 ? '#8b5cf6' : '#d1d5db'} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CC>
                  </Animated>

                  <Animated delay={120}>
                    <CC title="Top Rated Workers">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={topRatedNum} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" domain={[0, 5]} tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT fmt={(v: number) => `${v.toFixed(1)} ★`} />} />
                          <Bar dataKey="average_rating" name="Rating" fill="#f59e0b" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={160}>
                    <CC title="Workers per Company" className="md:col-span-2">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.per_company} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="company" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Workers" fill="#f97316" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            EMPLOYMENTS
        ════════════════════════════════════════════════ */}
        <TabsContent value="employments" className="mt-4">
          {employments.isLoading ? <SectionSkeleton /> : employments.data && (() => {
            const d = employments.data.data;
            const s = d.summary;
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total',               value: s.total,                              color: '#3b82f6' },
                    { label: 'Active',              value: s.active,                             color: '#22c55e' },
                    { label: 'Avg Salary (RWF)',    value: s.avg_salary.toLocaleString(),        color: '#8b5cf6' },
                    { label: 'Avg Duration (days)', value: s.avg_duration_days,                  color: '#f97316' },
                  ]} />
                </Animated>

                {/* Dominant: employment trend */}
                <Animated delay={60}>
                  <CC title="Employment Trend" subtitle="Employments created over selected period">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={d.trend} margin={CHART_MARGIN_H}>
                        <defs>
                          <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="period" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                        <Tooltip content={<CT />} />
                        <Area type="monotone" dataKey="count" name="Employments"
                          stroke="#22c55e" strokeWidth={2.5} fill="url(#gGreen)"
                          dot={false} activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Animated delay={120}>
                    <CC title="Status Breakdown">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_status} dataKey="count" nameKey="status"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_status.map((_, i) => <Cell key={i} fill={['#22c55e','#3b82f6','#ef4444'][i % 3]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={160}>
                    <CC title="Duration Distribution">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.duration_distribution} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="duration_range" tick={{ ...AXIS_STYLE, fontSize: 8 }} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Count" fill="#14b8a6" radius={[4,4,0,0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={200}>
                    <CC title="Top Employers">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.top_employers} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="employer_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Employments" fill="#6366f1" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>

                {d.termination_reasons.length > 0 && (
                  <Animated delay={260}>
                    <CC title="Termination Reasons">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={d.termination_reasons} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="termination_reason" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Count" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                )}
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            COMPANIES
        ════════════════════════════════════════════════ */}
        <TabsContent value="companies" className="mt-4">
          {companies.isLoading ? <SectionSkeleton /> : companies.data && (() => {
            const d = companies.data.data;
            const s = d.summary;
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total',     value: s.total,     color: '#3b82f6' },
                    { label: 'Approved',  value: s.approved,  color: '#22c55e' },
                    { label: 'Pending',   value: s.pending,   color: '#f59e0b' },
                    { label: 'Suspended', value: s.suspended, color: '#f97316' },
                    { label: 'Rejected',  value: s.rejected,  color: '#ef4444' },
                  ]} />
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Animated delay={60}>
                    <CC title="Status Distribution">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_status} dataKey="count" nameKey="status"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_status.map((_, i) => <Cell key={i} fill={['#22c55e','#f59e0b','#f97316','#ef4444'][i % 4]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Approval Time">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.approval_time} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="approval_duration" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Companies" fill="#8b5cf6" radius={[4,4,0,0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  {/* Revenue + Workers combined per company */}
                  <Animated delay={160}>
                    <CC title="Top Companies — Workers" subtitle="Total vs active workers">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.by_worker_count} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="business_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="total_workers"  name="Total"  fill="#3b82f6" radius={[0,4,4,0]} maxBarSize={12} />
                          <Bar dataKey="active_workers" name="Active" fill="#22c55e" radius={[0,4,4,0]} maxBarSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={200}>
                    <CC title="Revenue per Company (RWF)">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={d.revenue_per_company.map(c => ({ ...c, total_revenue: parseFloat(c.total_revenue) }))}
                          layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtRwf} />
                          <YAxis type="category" dataKey="business_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT fmt={(v: number) => `${v.toLocaleString()} RWF`} />} />
                          <Bar dataKey="total_revenue" name="Revenue" fill="#22c55e" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>

                {d.company_detail && (
                  <Animated delay={260}>
                    <Card className="border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10">
                      <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          Deep-dive: {d.company_detail.info.business_name}
                          <Badge variant="outline" className="text-[10px] capitalize">{d.company_detail.info.status}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-4">
                        <StatStrip items={[
                          { label: 'Total Workers',  value: d.company_detail.info.total_workers },
                          { label: 'Active Workers', value: d.company_detail.info.active_workers },
                          { label: 'Revenue (RWF)',  value: parseFloat(d.company_detail.info.total_revenue).toLocaleString() },
                          { label: 'TIN',            value: d.company_detail.info.tin },
                        ]} />
                      </CardContent>
                    </Card>
                  </Animated>
                )}
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            TRANSACTIONS
        ════════════════════════════════════════════════ */}
        <TabsContent value="transactions" className="mt-4">
          {transactions.isLoading ? <SectionSkeleton /> : transactions.data && (() => {
            const d = transactions.data.data;
            const s = d.summary;
            const topPayersNum = d.top_payers.map(p => ({ ...p, total_paid: parseFloat(p.total_paid) }));
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total Revenue (RWF)', value: s.total_revenue.toLocaleString(), color: '#22c55e' },
                    { label: 'Completed',           value: s.completed_count,                color: '#3b82f6' },
                    { label: 'Failed',              value: s.failed_count,                   color: '#ef4444' },
                    { label: 'Avg Amount (RWF)',    value: s.avg_amount.toLocaleString(),     color: '#8b5cf6' },
                  ]} />
                </Animated>

                {/* Dominant: revenue trend full width */}
                <Animated delay={60}>
                  <CC title="Revenue Trend (RWF)" subtitle="Total revenue over selected period">
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={d.revenue_trend} margin={CHART_MARGIN_H}>
                        <defs>
                          <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="period" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtRwf} width={56} />
                        <Tooltip content={<CT fmt={(v: number) => `${v.toLocaleString()} RWF`} />} />
                        <Area type="monotone" dataKey="total" name="Revenue"
                          stroke="#22c55e" strokeWidth={2.5} fill="url(#gRevenue)"
                          dot={false} activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }} />
                        <Bar dataKey="count" name="Count" fill="#3b82f640" radius={[4,4,0,0]} maxBarSize={20} yAxisId={0} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Animated delay={120}>
                    <CC title="Payment Method">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_payment_method} dataKey="count" nameKey="payment_method"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_payment_method.map((_, i) => <Cell key={i} fill={['#3b82f6','#8b5cf6','#22c55e'][i % 3]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={160}>
                    <CC title="Transaction Types">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.by_type} margin={{ ...CHART_MARGIN_H, bottom: 20 }}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="transaction_type" tick={{ ...AXIS_STYLE, fontSize: 8 }} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Count" radius={[4,4,0,0]} maxBarSize={48}>
                            {d.by_type.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={200}>
                    <CC title="Top Payers">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topPayersNum} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtRwf} />
                          <YAxis type="category" dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT fmt={(v: number) => `${v.toLocaleString()} RWF`} />} />
                          <Bar dataKey="total_paid" name="Total Paid" fill="#6366f1" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            HIRING REQUESTS
        ════════════════════════════════════════════════ */}
        <TabsContent value="hiring" className="mt-4">
          {hiring.isLoading ? <SectionSkeleton /> : hiring.data && (() => {
            const d = hiring.data.data;
            const s = d.summary;
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total Requests',    value: s.total,                              color: '#3b82f6' },
                    { label: 'Accepted',          value: s.accepted,                           color: '#22c55e' },
                    { label: 'Acceptance Rate',   value: `${s.acceptance_rate}%`,              color: '#14b8a6' },
                    { label: 'Avg Salary (RWF)',  value: s.avg_proposed_salary.toLocaleString(), color: '#8b5cf6' },
                  ]} />
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Animated delay={60}>
                    <CC title="Request Status">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_status} dataKey="count" nameKey="status"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_status.map((_, i) => <Cell key={i} fill={['#f59e0b','#22c55e','#ef4444','#6b7280'][i % 4]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Response Time">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.response_time} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="response_time" tick={{ ...AXIS_STYLE, fontSize: 8 }} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Requests" fill="#f97316" radius={[4,4,0,0]} maxBarSize={48}>
                            {d.response_time.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={160}>
                    <CC title="Top Hiring Employers" subtitle="Requests vs accepted">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.top_employers} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="employer_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="total_requests" name="Requests" fill="#3b82f6" radius={[0,4,4,0]} maxBarSize={12} />
                          <Bar dataKey="accepted"       name="Accepted" fill="#22c55e" radius={[0,4,4,0]} maxBarSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={200}>
                    <CC title="Most Requested Workers">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.top_requested_workers} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="worker_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="request_count" name="Requests" fill="#8b5cf6" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            INCIDENTS
        ════════════════════════════════════════════════ */}
        <TabsContent value="incidents" className="mt-4">
          {incidents.isLoading ? <SectionSkeleton /> : incidents.data && (() => {
            const d = incidents.data.data;
            const s = d.summary;
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total Incidents',      value: s.total,                 color: '#ef4444' },
                    { label: 'Open',                 value: s.open,                  color: '#f97316' },
                    { label: 'Resolution Rate',      value: `${s.resolution_rate}%`, color: '#22c55e' },
                    { label: 'Avg Days to Resolve',  value: s.avg_days_to_resolve,   color: '#3b82f6' },
                  ]} />
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Animated delay={60}>
                    <CC title="Severity Breakdown">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.by_severity} dataKey="count" nameKey="severity"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            {d.by_severity.map((_, i) => <Cell key={i} fill={['#ef4444','#f97316','#f59e0b','#22c55e'][i % 4]} />)}
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Incident Types">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.by_type} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="incident_type" tick={{ ...AXIS_STYLE, fontSize: 8 }} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Count" fill="#ef4444" radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={160}>
                    <CC title="Resolution Time">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.resolution_time} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="resolution_duration" tick={{ ...AXIS_STYLE, fontSize: 8 }} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Cases" fill="#14b8a6" radius={[4,4,0,0]} maxBarSize={48}>
                            {d.resolution_time.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={200}>
                    <CC title="Officer Workload" subtitle="Assigned vs resolved per officer">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.officer_workload} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="officer_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count"    name="Assigned" fill="#6366f1" radius={[0,4,4,0]} maxBarSize={12} />
                          <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[0,4,4,0]} maxBarSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            AGENTS
        ════════════════════════════════════════════════ */}
        <TabsContent value="agents" className="mt-4">
          {agents.isLoading ? <SectionSkeleton /> : agents.data && (() => {
            const d = agents.data.data;
            const s = d.summary;
            const topNum = d.top_by_received.map(a => ({
              ...a,
              total_received: parseFloat(a.total_received),
              total_sold:     parseFloat(a.total_sold),
            }));
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total Agents',   value: s.total_agents,                    color: '#3b82f6' },
                    { label: 'Active Agents',  value: s.active_agents,                   color: '#22c55e' },
                    { label: 'Total Balance',  value: s.total_balance.toLocaleString(),  color: '#8b5cf6' },
                    { label: 'Total Received', value: s.total_received.toLocaleString(), color: '#14b8a6' },
                  ]} />
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Animated delay={60}>
                    <CC title="Active vs Inactive">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={d.activity_stats} dataKey="count" nameKey="label"
                            cx="50%" cy="50%" innerRadius={55} outerRadius={80} labelLine={false} label={PieLabel}>
                            <Cell fill="#22c55e" />
                            <Cell fill="#d1d5db" />
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Balance Distribution">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.balance_distribution} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="balance_range" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Agents" radius={[4,4,0,0]} maxBarSize={48}>
                            {d.balance_distribution.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={140}>
                    <CC title="Top Agents — Received vs Sold" className="md:col-span-1">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topNum} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtRwf} />
                          <YAxis type="category" dataKey="agent_name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT fmt={(v: number) => `${v.toLocaleString()} RWF`} />} />
                          <Legend iconType="circle" iconSize={8} />
                          <Bar dataKey="total_received" name="Received" fill="#3b82f6" radius={[0,4,4,0]} maxBarSize={12} />
                          <Bar dataKey="total_sold"     name="Sold"     fill="#22c55e" radius={[0,4,4,0]} maxBarSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            GEOGRAPHY
        ════════════════════════════════════════════════ */}
        <TabsContent value="geography" className="mt-4">
          {geography.isLoading ? <SectionSkeleton /> : geography.data && (() => {
            const d = geography.data.data;

            type GeoItem = { province?: string; district?: string; count: number };

            const geoCharts: {
              title: string;
              data: GeoItem[];
              key: keyof GeoItem;
              color: string;
              delay: number;
            }[] = [
              { title: 'Workers by Province',   data: d.workers_by_province,   key: 'province', color: '#3b82f6', delay: 0   },
              { title: 'Workers by District',   data: d.workers_by_district,   key: 'district', color: '#14b8a6', delay: 60  },
              { title: 'Employers by District', data: d.employers_by_district, key: 'district', color: '#8b5cf6', delay: 120 },
              { title: 'Incidents by Province', data: d.incidents_by_province, key: 'province', color: '#ef4444', delay: 180 },
            ];

            return (
              <div key={tabKey} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {geoCharts.map(({ title, data, key, color, delay }) => (
                  <Animated key={title} delay={delay}>
                    <CC title={title}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey={key} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={72} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Count" fill={color} radius={[0,4,4,0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            GROWTH
        ════════════════════════════════════════════════ */}
        <TabsContent value="growth" className="mt-4">
          {growth.isLoading ? <SectionSkeleton /> : growth.data && (() => {
            const d = growth.data.data;
            const mom = d.mom_comparison;
            const ENTITY: Record<string, { color: string; icon: React.ElementType; accent: string }> = {
              users:     { color: '#3b82f6', icon: Users,     accent: '#3b82f6' },
              workers:   { color: '#8b5cf6', icon: Briefcase, accent: '#8b5cf6' },
              companies: { color: '#f97316', icon: Building2, accent: '#f97316' },
              employers: { color: '#14b8a6', icon: Globe,     accent: '#14b8a6' },
            };
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['users','workers','companies','employers'] as const).map(key => (
                      <KpiCard
                        key={key}
                        title={`${key.charAt(0).toUpperCase() + key.slice(1)} this month`}
                        value={mom[key].this_month}
                        growth={mom[key].growth_rate}
                        allTime={`Last month: ${mom[key].last_month}`}
                        icon={ENTITY[key].icon}
                        accent={ENTITY[key].accent}
                      />
                    ))}
                  </div>
                </Animated>

                {/* Dominant: multi-line platform growth */}
                <Animated delay={80}>
                  <CC title="Platform Growth — Registrations Over Time" subtitle="Users · Workers · Companies · Employers">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={d.multi_line} margin={{ ...CHART_MARGIN_H, right: 16 }}>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="period" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                        <Tooltip content={<CT />} />
                        <Legend iconType="circle" iconSize={8} />
                        {(['users','workers','companies','employers'] as const).map(key => (
                          <Line key={key} type="monotone" dataKey={key} name={key}
                            stroke={ENTITY[key].color} strokeWidth={2.5}
                            dot={false} activeDot={{ r: 5, fill: ENTITY[key].color, strokeWidth: 0 }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>

                {/* Revenue growth */}
                <Animated delay={160}>
                  <CC title="Revenue Growth (RWF)">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={d.multi_line} margin={{ ...CHART_MARGIN_H, right: 16 }}>
                        <defs>
                          <linearGradient id="gRevGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="period" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtRwf} width={52} />
                        <Tooltip content={<CT fmt={(v: number) => `${v.toLocaleString()} RWF`} />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue"
                          stroke="#22c55e" strokeWidth={2.5} fill="url(#gRevGrowth)"
                          dot={false} activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CC>
                </Animated>
              </div>
            );
          })()}
        </TabsContent>

        {/* ════════════════════════════════════════════════
            EMPLOYERS
        ════════════════════════════════════════════════ */}
        <TabsContent value="employers" className="mt-4">
          {employers.isLoading ? <SectionSkeleton /> : employers.data && (() => {
            const d = employers.data.data;
            const s = d.summary;
            return (
              <div key={tabKey} className="space-y-4">

                <Animated delay={0}>
                  <StatStrip items={[
                    { label: 'Total Employers',   value: s.total,                         color: '#3b82f6' },
                    { label: 'Paid Registration', value: s.paid_registration,             color: '#22c55e' },
                    { label: 'Active Workers',    value: s.total_active_workers,          color: '#8b5cf6' },
                    { label: 'Total Payments',    value: s.total_payments.toLocaleString(), color: '#14b8a6' },
                  ]} />
                </Animated>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Animated delay={60}>
                    <CC title="Registration Payment Status">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.payment_stats} dataKey="count" nameKey="label"
                            cx="50%" cy="50%" innerRadius={58} outerRadius={85} labelLine={false} label={PieLabel}>
                            <Cell fill="#22c55e" />
                            <Cell fill="#d1d5db" />
                          </Pie>
                          <Tooltip content={<CT />} />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={100}>
                    <CC title="Active Workers Distribution">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.active_workers_distribution} margin={CHART_MARGIN_H}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="range" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                          <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={36} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="count" name="Employers" radius={[4,4,0,0]} maxBarSize={48}>
                            {d.active_workers_distribution.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>

                  <Animated delay={140}>
                    <CC title="Top Employers by Hired" subtitle="Total hired vs active now">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.top_by_hired} layout="vertical" margin={{ ...CHART_MARGIN_V, left: 0 }}>
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                          <YAxis type="category" dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={90} />
                          <Tooltip content={<CT />} />
                          <Bar dataKey="total_workers_hired" name="Total Hired" fill="#6366f1" radius={[0,4,4,0]} maxBarSize={12} />
                          <Bar dataKey="active_workers"      name="Active Now"  fill="#22c55e" radius={[0,4,4,0]} maxBarSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CC>
                  </Animated>
                </div>

                {d.employer_detail && (
                  <Animated delay={200}>
                    <Card className="border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10">
                      <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          Deep-dive: {d.employer_detail.info.name}
                          <Badge variant="outline" className="text-[10px]">
                            {d.employer_detail.info.has_paid_registration ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-4">
                        <StatStrip items={[
                          { label: 'Active Workers',       value: d.employer_detail.info.active_workers },
                          { label: 'Total Hired',          value: d.employer_detail.info.total_workers_hired },
                          { label: 'Total Payments (RWF)', value: parseFloat(d.employer_detail.info.total_payments_made).toLocaleString() },
                          { label: 'Incidents Reported',   value: d.employer_detail.info.total_incidents_reported },
                        ]} />
                      </CardContent>
                    </Card>
                  </Animated>
                )}
              </div>
            );
          })()}
        </TabsContent>

      </Tabs>
    </div>
  );
}