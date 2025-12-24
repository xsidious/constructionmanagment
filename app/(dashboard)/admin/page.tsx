'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Download, 
  Building2,
  BarChart3,
  FileText,
  Lock
} from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalProjects: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Partial<AdminStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user has admin access
    const role = session.role as Role;
    if (!hasPermission(role, 'admin:access')) {
      router.push('/dashboard');
      return;
    }

    fetchAdminData();
  }, [session, router]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">System administration and management</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card hover-lift border-2 border-blue-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Registered users</p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift border-2 border-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Active companies</p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift border-2 border-green-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">All projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift border-2 border-pink-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Revenue</CardTitle>
            <FileText className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">${(stats.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Management
            </CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View all users, assign roles, manage permissions, and control access across the system.
            </p>
            <Button className="w-full">Manage Users</Button>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure system-wide settings, integrations, and preferences.
            </p>
            <Button className="w-full" variant="outline">Open Settings</Button>
          </CardContent>
        </Card>

        <Card className="gradient-card hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Data Management
            </CardTitle>
            <CardDescription>Export and manage data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export data, manage backups, and perform system maintenance tasks.
            </p>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card hover-lift shadow-lg border-2 border-yellow-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-600" />
            Admin Only Features
          </CardTitle>
          <CardDescription>Restricted to administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">User Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all system users</li>
                <li>• Assign and modify roles</li>
                <li>• Manage user permissions</li>
                <li>• Deactivate/reactivate accounts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">System Administration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• System-wide analytics</li>
                <li>• Data export capabilities</li>
                <li>• Company management</li>
                <li>• System configuration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

