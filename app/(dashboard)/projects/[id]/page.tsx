'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Plus, FileText, Briefcase, Package, MessageSquare, Upload } from 'lucide-react';
import { ProjectNotesTab } from '@/components/projects/project-notes-tab';
import { ProjectFilesTab } from '@/components/projects/project-files-tab';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChatRoom } from '@/components/chat/chat-room';

interface Project {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  customer: { id: string; name: string };
  phases: Array<{ id: string; name: string; order: number; status?: string }>;
  jobs: Array<{ id: string; title: string; status: string; priority: string; assignedTo?: { name: string } }>;
  quotes: Array<{ id: string; quoteNumber: string; status: string; total: number }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; total: number }>;
  materialUsages: Array<{ id: string; quantity: number; unitPrice: number; material: { name: string } }>;
  files: Array<{ id: string; originalName: string; size: number; fileType?: string; createdAt: string }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p>Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Customer: {project.customer.name}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${project.id}/edit`}>
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
            <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget ? formatCurrency(project.budget) : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Phases</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.phases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No phases yet</p>
              ) : (
                <div className="space-y-2">
                  {project.phases.map((phase) => (
                    <div key={phase.id} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <div className="font-medium">{phase.name}</div>
                        {phase.status && (
                          <div className="text-sm text-muted-foreground">Status: {phase.status}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Jobs & Tasks</CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/jobs/new?projectId=${project.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.assignedTo?.name || 'Unassigned'}</TableCell>
                        <TableCell>{job.status}</TableCell>
                        <TableCell>{job.priority}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/jobs/${job.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {project.materialUsages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No materials used yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.materialUsages.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{usage.material.name}</TableCell>
                        <TableCell>{usage.quantity}</TableCell>
                        <TableCell>{formatCurrency(usage.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(usage.quantity * usage.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {project.quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quotes yet</p>
              ) : (
                <div className="space-y-2">
                  {project.quotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <div className="font-medium">{quote.quoteNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(quote.total)} • {quote.status}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/quotes/${quote.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {project.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {project.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(invoice.total)} • {invoice.status}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/invoices/${invoice.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <ProjectNotesTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <ProjectFilesTab projectId={project.id} files={project.files} onFileUpload={fetchProject} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatRoom projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

