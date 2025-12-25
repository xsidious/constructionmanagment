'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NewJobDialog } from '@/components/dialogs/new-job-dialog';

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage work orders and tasks</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No jobs yet</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Title</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Project</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Priority</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium text-sm">{job.title}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{job.project.name}</TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">{job.assignedTo?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{job.dueDate ? formatDate(job.dueDate) : '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild className="h-8 px-2 sm:px-3">
                        <Link href={`/jobs/${job.id}`} className="text-xs sm:text-sm">View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
        </Card>
        </div>
      )}
      <NewJobDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          fetchJobs();
        }}
      />
    </div>
  );
}

