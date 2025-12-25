'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderKanban, 
  Search, 
  Filter,
  CheckCircle2,
  DollarSign,
  Building2,
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
  }, [session]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter]);

  const fetchPortfolioProjects = async () => {
    try {
      setLoading(true);
      // Use authenticated API if logged in, otherwise public API
      const url = session 
        ? '/api/portfolio/projects'
        : '/api/portfolio/public';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Handle both array and wrapped response
        const projectsData = Array.isArray(data) ? data : (data.data || data);
        setProjects(projectsData || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

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

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'Completed').length,
    inProgress: projects.filter((p) => p.status === 'InProgress').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Showcase of your completed and ongoing construction projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'Completed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('Completed')}
            size="sm"
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'InProgress' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('InProgress')}
            size="sm"
          >
            In Progress
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-0">
                  {project.imageUrl ? (
                    <div className="h-48 w-full bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-blue-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{project.customer.name}</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="font-medium">{formatCurrency(project.budget)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
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

