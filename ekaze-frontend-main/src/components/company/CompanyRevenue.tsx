import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCardIcon, TrendingUp, Users, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";

const revenueData = [
  {
    id: "TXN001",
    type: "Worker Registration",
    workerName: "Jean Baptiste Uwimana",
    amount: 500,
    date: "2024-03-15",
    status: "completed",
  },
  {
    id: "TXN002",
    type: "Worker Registration",
    workerName: "Marie Claire Mukamana",
    amount: 500,
    date: "2024-03-14",
    status: "completed",
  },
  {
    id: "TXN003",
    type: "Worker Registration",
    workerName: "Pierre Habimana",
    amount: 500,
    date: "2024-03-13",
    status: "completed",
  },
  {
    id: "TXN004",
    type: "Worker Registration",
    workerName: "Claudette Uwase",
    amount: 500,
    date: "2024-03-10",
    status: "pending",
  },
  {
    id: "TXN005",
    type: "Worker Registration",
    workerName: "Emmanuel Ndayisaba",
    amount: 500,
    date: "2024-03-08",
    status: "completed",
  },
  {
    id: "TXN006",
    type: "Worker Registration",
    workerName: "Diane Ingabire",
    amount: 500,
    date: "2024-03-05",
    status: "completed",
  },
];

const monthlyStats = [
  { month: "January", registrations: 12, revenue: 6000 },
  { month: "February", registrations: 18, revenue: 9000 },
  { month: "March", registrations: 24, revenue: 12000 },
];

const CompanyRevenue = () => {
  const totalRevenue = revenueData
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingRevenue = revenueData
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);
  const thisMonthRevenue = 12000;
  const lastMonthRevenue = 9000;
  const revenueChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return (
    <div className="space-y-6">
    

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <CreditCardIcon className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="text-start" >
            <div className="text-sm font-bold text-foreground">
              {totalRevenue.toLocaleString()} RWF
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground">
              {thisMonthRevenue.toLocaleString()} RWF
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {revenueChange > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600">+{revenueChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{revenueChange.toFixed(1)}%</span>
                </>
              )}
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
            <CreditCardIcon className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground">
              {pendingRevenue.toLocaleString()} RWF
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Workers Registered
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground">
              {revenueData.filter((t) => t.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-start mb-1 text-sm" >Transaction History</CardTitle>
                <CardDescription className="text-xs" >Recent registration fee payments</CardDescription>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                    <TableCell className="text-xs" >{transaction.workerName}</TableCell>
                    <TableCell className="text-xs" >
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-xs">{transaction.amount} RWF</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transaction.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="" >Monthly Summary</CardTitle>
            <CardDescription>Registration trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat) => (
                <div
                  key={stat.month}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{stat.month}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.registrations} workers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {stat.revenue.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Fee per Worker</span>
                <span className="font-bold">500 RWF</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Standard registration fee as per Ihirwe Pay pricing structure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRevenue;
