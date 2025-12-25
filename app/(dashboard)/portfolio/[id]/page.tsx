'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Calendar, DollarSign, User, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PortfolioProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  customer: {
    name: string;
    email: string | null;
  };
  progress: number;
  imageUrl?: string | null;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id, session]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      // Use authenticated API if logged in, otherwise public API
      const url = session 
        ? `/api/portfolio/projects/${params.id}`
        : `/api/portfolio/public/${params.id}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Handle both direct and wrapped response
        const projectData = data.data || data;
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
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

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'OnHold':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Project details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Image */}
          <Card>
            <CardContent className="p-0">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              ) : (
                <div className="h-64 w-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg flex items-center justify-center">
                  <Building2 className="h-24 w-24 text-blue-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {project.description || 'No description available'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              {project.budget && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Budget</div>
                  <div className="font-semibold">{formatCurrency(project.budget)}</div>
                </div>
              )}

              {project.startDate && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                  <div className="font-semibold">{formatDate(project.startDate)}</div>
                </div>
              )}

              {project.endDate && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">End Date</div>
                  <div className="font-semibold">{formatDate(project.endDate)}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Progress</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="font-semibold">{project.customer.name}</div>
                </div>
                {project.customer.email && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div className="font-semibold">{project.customer.email}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

