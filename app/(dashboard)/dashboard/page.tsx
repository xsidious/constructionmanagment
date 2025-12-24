'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your construction management dashboard</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.statusCounts?.InProgress || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {stats.totalProjects || 0} projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Invoices</CardTitle>
            <CardDescription>Pending payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalUnpaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalInvoices || 0} total invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit</CardTitle>
            <CardDescription>Revenue - Costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: {formatCurrency(stats.totalRevenue_projects || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.statusCounts ? (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{status}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Distribution of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.statusCounts_invoices ? (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts_invoices).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{status}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
