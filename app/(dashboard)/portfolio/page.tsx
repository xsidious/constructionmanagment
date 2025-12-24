'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderKanban, 
  Search, 
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

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
  };
  progress: number;
  imageUrl?: string | null;
}

export default function PortfolioPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPortfolioProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter]);

  const fetchPortfolioProjects = async () => {
    try {
      const response = await fetch('/api/portfolio/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'Completed', label: 'Completed' },
    { value: 'InProgress', label: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Project Portfolio
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Showcase of our completed and ongoing construction projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="gradient-card border-2 border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="gradient-card border-2 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">All portfolio projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-green-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {projects.filter(p => p.status === 'Completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Finished projects</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-2 border-purple-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(
                projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Combined budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="gradient-card border-2 border-gray-100 shadow-sm">
          <CardContent className="p-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/portfolio/${project.id}`}>
              <Card className="gradient-card border-2 border-gray-100 shadow-sm overflow-hidden cursor-pointer group">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  {project.status === 'Completed' && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium text-gray-900">{project.customer.name}</span>
                    </div>
                    {project.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(Number(project.budget))}
                        </span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(project.endDate)}
                        </span>
                      </div>
                    )}
                    {project.status === 'InProgress' && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
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
    </div>
  );
}

