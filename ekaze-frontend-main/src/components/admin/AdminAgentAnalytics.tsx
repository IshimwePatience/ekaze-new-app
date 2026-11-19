import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, Wallet, TrendingUp, ArrowUpDown,
  Search, RefreshCw, MapPin, Trophy,
} from "lucide-react";
import { useAdminAgentAnalytics } from "@/hooks/useAgent";

const formatRWF = (v: number | string) => `${Number(v).toLocaleString()} RWF`;

const AdminAgentAnalytics = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useAdminAgentAnalytics();

  const d = data?.data;
  const agents = (d?.agents || []).filter(a =>
    !search || a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeaderBreadcrumb title="Agent Analytics">
        <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs gap-1.5 border-slate-300">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </PageHeaderBreadcrumb>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : d?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Agents',       value: d.summary.total_agents,                    color: 'text-primary',    icon: Users },
            { label: 'Float Balance',value: formatRWF(d.summary.total_float_balance),  color: 'text-blue-600',   icon: Wallet },
            { label: 'Total Given',  value: formatRWF(d.summary.total_received),       color: 'text-green-600',  icon: TrendingUp },
            { label: 'Total Sold',   value: formatRWF(d.summary.total_sold),           color: 'text-orange-600', icon: ArrowUpDown },
            { label: 'Avg Performance', value: `${d.summary.avg_performance?.toFixed(1)}%`, color: 'text-purple-600', icon: Trophy },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} style={{ borderRadius: "10px" }} className="border-border/40">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 bg-muted/30 rounded-lg shrink-0">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* District Breakdown */}
      {d?.by_district && Object.keys(d.by_district).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(d.by_district).map(([district, stats]) => (
            <Card key={district} style={{ borderRadius: "10px" }} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <p className="text-xs font-semibold truncate">{district}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{stats.count} agents</p>
                <p className="text-xs font-bold text-orange-600">{formatRWF(stats.total_sold)} sold</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Top Performers */}
      {d?.top_performers && d.top_performers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="text-xs font-semibold">Top Performers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.top_performers.slice(0, 6).map((agent, i) => (
              <Card key={agent.worker_id} style={{ borderRadius: "10px" }} className="border-border/40">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={agent.profile_photo || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{agent.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{agent.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">{agent.district}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[9px] ${agent.performance >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {agent.performance}%
                    </Badge>
                    <p className="text-[10px] text-orange-600 mt-0.5">{formatRWF(agent.total_sold)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents..." className="pl-8 h-8 text-xs" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : agents.length === 0 ? (
          <Card className="border-border/40" style={{ borderRadius: "12px" }}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No agents found</p>
            </CardContent>
          </Card>
        ) : agents.map((agent) => {
          const performance = Number(agent.total_received ?? 0) > 0
            ? Math.round((Number(agent.total_sold ?? 0) / Number(agent.total_received ?? 0)) * 100)
            : 0;

          return (
            <Card key={agent.worker_id} style={{ borderRadius: "12px" }} className="border-border/40">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={agent.profile_photo || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{agent.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold">{agent.full_name}</p>
                      <Badge className={`text-[9px] ${performance >= 80 ? 'bg-green-100 text-green-800' : performance >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {performance}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">{agent.district}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-[9px] text-muted-foreground">Balance</p>
                        <p className="text-xs font-bold text-primary">{formatRWF(agent.wallet?.balance ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Received</p>
                        <p className="text-xs font-bold text-green-600">{formatRWF(agent.wallet?.total_received ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Sold</p>
                        <p className="text-xs font-bold text-orange-600">{formatRWF(agent.wallet?.total_sold ?? 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAgentAnalytics;