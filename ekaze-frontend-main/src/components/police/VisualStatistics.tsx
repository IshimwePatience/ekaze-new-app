import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { AlertTriangle, TrendingUp, MapPin, Activity } from "lucide-react";

// ── Province config ────────────────────────────────────────────────────────
const PROVINCE_CONFIG: Record<string, { color: string; label: string }> = {
  kigali:   { color: "#3b82f6", label: "Kigali City" },
  northern: { color: "#8b5cf6", label: "Northern" },
  southern: { color: "#22c55e", label: "Southern" },
  eastern:  { color: "#f97316", label: "Eastern" },
  western:  { color: "#ec4899", label: "Western" },
};

const DISTRICT_TO_PROVINCE: Record<string, string> = {
  gasabo: "kigali", kicukiro: "kigali", nyarugenge: "kigali",
  burera: "northern", gakenke: "northern", gicumbi: "northern",
  musanze: "northern", rulindo: "northern",
  gisagara: "southern", huye: "southern", kamonyi: "southern",
  muhanga: "southern", nyamagabe: "southern", nyanza: "southern",
  nyaruguru: "southern", ruhango: "southern",
  bugesera: "eastern", gatsibo: "eastern", kayonza: "eastern",
  kirehe: "eastern", ngoma: "eastern", nyagatare: "eastern",
  rwamagana: "eastern",
  karongi: "western", ngororero: "western", nyabihu: "western",
  nyamasheke: "western", rubavu: "western", rutsiro: "western",
  rusizi: "western",
};

function resolveProvince(geo: { label: string; province?: string }): string {
  if (geo.province) {
    const p = geo.province.toLowerCase();
    if (p.includes("kigali")) return "kigali";
    if (p.includes("northern")) return "northern";
    if (p.includes("southern")) return "southern";
    if (p.includes("eastern")) return "eastern";
    if (p.includes("western")) return "western";
  }
  const lower = geo.label.toLowerCase();
  if (lower.includes("kigali")) return "kigali";
  if (lower.includes("northern")) return "northern";
  if (lower.includes("southern")) return "southern";
  if (lower.includes("eastern")) return "eastern";
  if (lower.includes("western")) return "western";
  for (const [d, p] of Object.entries(DISTRICT_TO_PROVINCE)) {
    if (lower.includes(d)) return p;
  }
  return "unknown";
}

const STATUS_COLORS: Record<string, string> = {
  reported:           "#f97316",
  under_investigation:"#3b82f6",
  resolved:           "#22c55e",
  dismissed:          "#6b7280",
  escalated:          "#ef4444",
};

const TYPE_COLORS: Record<string, string> = {
  violence:         "#ef4444",
  theft:            "#f97316",
  negligence:       "#eab308",
  misconduct:       "#8b5cf6",
  breach_of_contract:"#3b82f6",
  unsafe_conditions:"#ec4899",
  other:            "#6b7280",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

interface GeoIncident {
  id: string | number;
  incident_number: string;
  type: string;
  status: string;
  severity: string;
  location: string;
  reported_date?: string;
  geo?: {
    latitude: number;
    longitude: number;
    source: string;
    label: string;
    province?: string;
    district?: string;
    sector?: string;
  } | null;
}

interface IncidentTrend {
  month: string;
  total: number;
  assault?: number;
  theft?: number;
  misconduct?: number;
  other?: number;
  [key: string]: string | number | undefined;
}

interface VisualStatisticsProps {
  incidents: GeoIncident[];
  incidentTrends?: IncidentTrend[];
  districtIncidents?: { district: string; incidents: number; percentage: number }[];
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border/60 rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-[11px] font-bold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="text-[10px] text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-[10px] font-bold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function VisualStatistics({
  incidents,
  incidentTrends = [],
  districtIncidents = [],
}: VisualStatisticsProps) {
  // ── 1. Province distribution (from geo data) ───────────────────────────
  const provinceData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents
      .filter((i) => i.geo?.latitude)
      .forEach((i) => {
        const key = resolveProvince(i.geo!);
        counts[key] = (counts[key] || 0) + 1;
      });

    return Object.entries(PROVINCE_CONFIG)
      .map(([key, cfg]) => ({ name: cfg.label, value: counts[key] || 0, color: cfg.color, key }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [incidents]);

  // ── 2. Status distribution ─────────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status] ?? "#6b7280",
    }));
  }, [incidents]);

  // ── 3. Type distribution ───────────────────────────────────────────────
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      counts[i.type] = (counts[i.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({
        name: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count,
        color: TYPE_COLORS[type] ?? "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [incidents]);

  // ── 4. Severity distribution ───────────────────────────────────────────
  const severityData = useMemo(() => {
    const order = ["critical", "high", "medium", "low"];
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      counts[i.severity] = (counts[i.severity] || 0) + 1;
    });
    return order
      .filter((s) => counts[s])
      .map((s) => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        value: counts[s] || 0,
        color: SEVERITY_COLORS[s],
      }));
  }, [incidents]);

  // ── 5. Province × type cross-analysis ─────────────────────────────────
  const provinceTypeData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    incidents
      .filter((i) => i.geo?.latitude)
      .forEach((i) => {
        const prov = resolveProvince(i.geo!);
        const provLabel = PROVINCE_CONFIG[prov]?.label ?? "Unknown";
        if (!data[provLabel]) data[provLabel] = {};
        data[provLabel][i.type] = (data[provLabel][i.type] || 0) + 1;
      });

    return Object.entries(data).map(([province, types]) => ({
      province: province.split(" ")[0], // short name
      ...types,
    }));
  }, [incidents]);

  const allTypes = useMemo(
    () => Array.from(new Set(incidents.map((i) => i.type))),
    [incidents]
  );

  // ── 6. Monthly trends (from API or derived) ────────────────────────────
  const trendsData = useMemo(() => {
    if (incidentTrends.length > 0) return incidentTrends;

    // Derive from incidents by reported_date
    const monthly: Record<string, number> = {};
    incidents.forEach((i) => {
      if (!i.reported_date) return;
      const parts = i.reported_date.split(" ");
      const key = parts.slice(0, 2).join(" "); // "May 13"
      monthly[key] = (monthly[key] || 0) + 1;
    });
    return Object.entries(monthly).map(([month, total]) => ({ month, total }));
  }, [incidents, incidentTrends]);

  // ── 7. Radar: province × severity ─────────────────────────────────────
  const radarData = useMemo(() => {
    const severities = ["critical", "high", "medium", "low"];
    return severities.map((sev) => {
      const entry: Record<string, string | number> = {
        severity: sev.charAt(0).toUpperCase() + sev.slice(1),
      };
      Object.entries(PROVINCE_CONFIG).forEach(([key, cfg]) => {
        entry[cfg.label.split(" ")[0]] = incidents.filter(
          (i) => i.severity === sev && resolveProvince(i.geo ?? { label: "" }) === key
        ).length;
      });
      return entry;
    });
  }, [incidents]);

  const total = incidents.length;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No incident data to visualize.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Visual Statistics</h2>
          <p className="text-[10px] text-muted-foreground">
            Incident patterns across Rwanda — {total} total incidents
          </p>
        </div>
      </div>

      {/* ── Row 1: Province bar + Status pie ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Province distribution bar */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <CardTitle className="text-[12px] font-bold">Incidents by Province</CardTitle>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Geographic distribution of all reported incidents
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={provinceData} barSize={28} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Incidents" radius={[6, 6, 0, 0]}>
                  {provinceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Mini province breakdown */}
            <div className="mt-3 space-y-1.5">
              {provinceData.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-[10px] text-muted-foreground flex-1">{p.name}</span>
                  <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((p.value / total) * 100)}%`,
                        background: p.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-8 text-right">{p.value}</span>
                  <span className="text-[9px] text-muted-foreground w-8 text-right">
                    {Math.round((p.value / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <CardTitle className="text-[12px] font-bold">Status Breakdown</CardTitle>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Current resolution status of all incidents</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-[10px] text-muted-foreground">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-foreground">{s.value}</span>
                      <span className="text-[9px] text-muted-foreground">
                        ({Math.round((s.value / total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Monthly trend line + Type donut ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly trend */}
        <Card className="border-border/40 lg:col-span-2" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-bold">Incident Reporting Trend</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Volume of incidents reported over time
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Incidents"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#totalGrad)"
                  dot={{ fill: "#3b82f6", r: 3, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5 }}
                />
                {trendsData[0]?.assault !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="assault"
                    name="Violence"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
                {trendsData[0]?.theft !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="theft"
                    name="Theft"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident type donut */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-bold">Incident Types</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">Distribution by category</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {typeData.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-foreground">{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Province × Type stacked bar + Severity bar ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Province × Type stacked bar */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-bold">Incident Types per Province</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              How incident types are distributed across provinces
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {provinceTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-[11px] text-muted-foreground">No geo-tagged incidents</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={provinceTypeData}
                  barSize={28}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis dataKey="province" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "9px" }} iconSize={8} />
                  {allTypes.map((type) => (
                    <Bar
                      key={type}
                      dataKey={type}
                      name={type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      stackId="a"
                      fill={TYPE_COLORS[type] ?? "#6b7280"}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity horizontal bar */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-bold">Severity Analysis</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Breakdown of incidents by severity level
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={severityData}
                layout="vertical"
                barSize={18}
                margin={{ top: 4, right: 24, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Incidents" radius={[0, 6, 6, 0]}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Severity summary */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {severityData.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: `${s.color}12` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <div>
                    <div className="text-[11px] font-bold text-foreground">{s.value}</div>
                    <div className="text-[9px] text-muted-foreground">{s.name}</div>
                  </div>
                  <div
                    className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: s.color, color: "#fff" }}
                  >
                    {Math.round((s.value / total) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: District leaderboard + Radar ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* District leaderboard — from real API data */}
        {districtIncidents.length > 0 && (
          <Card className="border-border/40" style={{ borderRadius: "12px" }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-[12px] font-bold">Top Districts by Incidents</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Districts with the highest incident counts
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={districtIncidents}
                  barSize={22}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="incidents" name="Incidents" radius={[5, 5, 0, 0]}>
                    {districtIncidents.map((_, i) => (
                      <Cell
                        key={i}
                        fill={Object.values(PROVINCE_CONFIG)[i % Object.values(PROVINCE_CONFIG).length].color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {districtIncidents.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-5 text-right font-bold">#{i + 1}</span>
                    <span className="text-[10px] text-foreground flex-1 font-medium">{d.district}</span>
                    <div className="flex-1 bg-muted/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d.percentage}%`,
                          background: Object.values(PROVINCE_CONFIG)[i % 5].color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-6 text-right">{d.incidents}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Radar: severity across provinces */}
        <Card className="border-border/40" style={{ borderRadius: "12px" }}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-bold">Severity × Province Radar</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              How each province compares across severity levels
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="hsl(var(--border))" opacity={0.5} />
                <PolarAngleAxis dataKey="severity" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} allowDecimals={false} />
                {Object.entries(PROVINCE_CONFIG).map(([key, cfg]) => (
                  <Radar
                    key={key}
                    name={cfg.label.split(" ")[0]}
                    dataKey={cfg.label.split(" ")[0]}
                    stroke={cfg.color}
                    fill={cfg.color}
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: "9px" }} iconSize={8} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}