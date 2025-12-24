'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ProjectPhase {
  id: string;
  name: string;
  status: string | null;
  order: number;
  startDate: string | null;
  endDate: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  customer: {
    name: string;
  };
  phases: ProjectPhase[];
}

export default function ClientProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/client/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else if (response.status === 404) {
        router.push('/client');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/client">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'onhold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseStatusIcon = (status: string | null) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'inprogress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Project details and progress
          </p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="gradient-card border-2 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget ? formatCurrency(Number(project.budget)) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{project.progress}%</div>
            <Progress value={project.progress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card className="gradient-card shadow-sm border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Description</h3>
              <p className="text-gray-900">{project.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {project.startDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Start Date</h3>
                <p className="text-gray-900">{formatDate(project.startDate)}</p>
              </div>
            )}
            {project.endDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Expected Completion</h3>
                <p className="text-gray-900">{formatDate(project.endDate)}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Customer</h3>
            <p className="text-gray-900">{project.customer.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Project Phases */}
      {project.phases && project.phases.length > 0 && (
        <Card className="gradient-card shadow-sm border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Project Phases</CardTitle>
            <CardDescription>Track the progress of each project phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.phases
                .sort((a, b) => a.order - b.order)
                .map((phase, index) => (
                  <div key={phase.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                        <div className="flex items-center gap-2">
                          {getPhaseStatusIcon(phase.status)}
                          {phase.status && (
                            <span className="text-xs text-gray-600 capitalize">{phase.status}</span>
                          )}
                        </div>
                      </div>
                      {phase.startDate && phase.endDate && (
                        <div className="text-sm text-gray-600">
                          <span>{formatDate(phase.startDate)}</span>
                          {' - '}
                          <span>{formatDate(phase.endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

