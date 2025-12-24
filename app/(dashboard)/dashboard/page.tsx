'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, Receipt, Briefcase, Clock, Package, Wrench, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect clients to client portal
    if (session?.role === 'Client') {
      router.push('/client');
      return;
    }
    
    if (session) {
      fetchDashboardData();
    }
  }, [session, router]);

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
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome to your construction management dashboard</p>
        </div>
      </div>

      <QuickActions />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card border-2 border-blue-100 shadow-sm">
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

        <Card className="gradient-card border-2 border-purple-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Active projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">All invoices</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-pink-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <DollarSign className="h-5 w-5 text-pink-600" />
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
        <Card className="gradient-card shadow-sm border-2 border-gray-100">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
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

        <Card className="gradient-card shadow-sm border-2 border-gray-100">
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="gradient-card shadow-sm border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
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
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
