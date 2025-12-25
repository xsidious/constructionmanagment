'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FolderKanban } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget?: number;
  customer: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Planning: 'bg-blue-100 text-blue-800',
      InProgress: 'bg-green-100 text-green-800',
      OnHold: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-gray-100 text-gray-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your construction projects</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No projects yet</p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Progress</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Budget</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Created</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.customer.name}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 sm:w-24 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.budget ? formatCurrency(project.budget) : '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(project.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild className="h-8 px-2 sm:px-3">
                        <Link href={`/projects/${project.id}`} className="text-xs sm:text-sm">View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}

