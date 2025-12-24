'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, Receipt, Briefcase, Clock, Package, Wrench, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: Record<string, number>;
  invoiceCount: number;
  totalProjects: number;
  statusCounts: Record<string, number>;
  totalBudget: number;
  totalRevenue_projects: number;
  totalCosts: number;
  profit: number;
  totalInvoices: number;
  statusCounts_invoices: Record<string, number>;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [revenueRes, projectsRes, invoicesRes] = await Promise.all([
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/projects'),
        fetch('/api/analytics/invoices'),
      ]);

      const revenue = revenueRes.ok ? await revenueRes.json() : {};
      const projects = projectsRes.ok ? await projectsRes.json() : {};
      const invoices = invoicesRes.ok ? await invoicesRes.json() : {};

      setStats({
        ...revenue,
        ...projects,
        ...invoices,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = stats.monthlyRevenue ? Object.entries(stats.monthlyRevenue).map(([month, value]) => ({
    month: month.substring(0, 3),
    revenue: value,
  })) : [];

  const projectStatusData = stats.statusCounts ? Object.entries(stats.statusCounts).map(([name, value]) => ({
    name,
    value,
  })) : [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Welcome to your construction management dashboard</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card hover-lift border-2 border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(stats.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift border-2 border-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.statusCounts?.InProgress || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {stats.totalProjects || 0} projects
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift border-2 border-pink-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <Receipt className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">
              {formatCurrency(stats.totalUnpaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalInvoices || 0} total invoices
            </p>
          </CardContent>
        </Card>

        <Card className={`gradient-card hover-lift border-2 shadow-lg ${(stats.profit || 0) >= 0 ? 'border-green-100' : 'border-red-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            {(stats.profit || 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(stats.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue: {formatCurrency(stats.totalRevenue_projects || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-600" />
              Project Status
            </CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Active jobs</p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Hours logged this month</p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-pink-600" />
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Items in inventory</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
