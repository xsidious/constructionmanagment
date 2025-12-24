'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  FolderKanban, 
  FileText, 
  Receipt, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ClientProject {
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
  phases: Array<{
    id: string;
    name: string;
    status: string | null;
    order: number;
  }>;
}

interface ClientQuote {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  createdAt: string;
  project: {
    name: string;
  };
}

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  dueDate: string | null;
  createdAt: string;
  project: {
    name: string;
  };
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchClientData();
    }
  }, [session]);

  const fetchClientData = async () => {
    try {
      const [projectsRes, quotesRes, invoicesRes] = await Promise.all([
        fetch('/api/client/projects'),
        fetch('/api/client/quotes'),
        fetch('/api/client/invoices'),
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotes(quotesData);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Failed to fetch client data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'inprogress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'onhold':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'InProgress');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Client Portal
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Welcome, {session?.user?.name}. View your project progress and updates.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card border-2 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Projects in progress</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Finished projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-purple-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Receipt className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-2">All projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card className="gradient-card shadow-sm border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-600" />
            My Projects
          </CardTitle>
          <CardDescription>Track the progress of your construction projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link key={project.id} href={`/client/projects/${project.id}`}>
                  <Card className="border-2 border-gray-100 shadow-sm hover:border-blue-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-semibold text-gray-900">
                              {project.budget ? formatCurrency(Number(project.budget)) : 'N/A'}
                            </span>
                          </div>
                          {project.endDate && (
                            <div>
                              <span className="text-gray-600">Expected Completion: </span>
                              <span className="font-semibold text-gray-900">{formatDate(project.endDate)}</span>
                            </div>
                          )}
                        </div>

                        {project.phases && project.phases.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium text-gray-600 mb-2">Project Phases:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.phases
                                .sort((a, b) => a.order - b.order)
                                .map((phase) => (
                                  <span
                                    key={phase.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {phase.name}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes and Invoices */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="gradient-card shadow-sm border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Recent Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No quotes available</p>
            ) : (
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <Link key={quote.id} href={`/client/quotes/${quote.id}`}>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{quote.quoteNumber}</p>
                        <p className="text-xs text-gray-600">{quote.project.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(Number(quote.total))}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-sm border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices available</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <Link key={invoice.id} href={`/client/invoices/${invoice.id}`}>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer">
                      <div>
                        <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-600">{invoice.project.name}</p>
                        {invoice.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(Number(invoice.total))}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

