'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  project: { id: string; name: string };
  assignedTo?: { id: string; name: string; email: string };
  createdAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchJob(); // Refresh job data
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p>Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      InProgress: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">Job Details</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/jobs/${job.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              {job.status !== 'Completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('Completed')}
                  className="w-full mt-2"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`rounded-full px-3 py-1 text-sm ${getPriorityColor(job.priority)}`}>
              {job.priority}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            {job.dueDate ? formatDate(job.dueDate) : 'Not set'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={`/projects/${job.project.id}`}>
              {job.project.name}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {job.assignedTo && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned To</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="font-medium">{job.assignedTo.name}</div>
              <div className="text-sm text-muted-foreground">{job.assignedTo.email}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {job.completedAt && (
        <Card>
          <CardHeader>
            <CardTitle>Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Completed on {formatDate(job.completedAt)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

