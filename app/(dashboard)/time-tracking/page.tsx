'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, Plus } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description?: string;
  status: string;
  hourlyRate?: number;
  totalAmount?: number;
  user: { name: string; email: string };
  project?: { name: string };
  job?: { title: string };
}

interface Project {
  id: string;
  name: string;
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    jobId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    hourlyRate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, projectsRes] = await Promise.all([
        fetch('/api/time-entries'),
        fetch('/api/projects'),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours: parseFloat(formData.hours),
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          projectId: '',
          jobId: '',
          date: new Date().toISOString().split('T')[0],
          hours: '',
          description: '',
          hourlyRate: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create time entry:', error);
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalAmount = entries
    .filter((e) => e.status === 'Approved')
    .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">Track employee hours and timesheets</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
              <DialogDescription>Record hours worked on a project or job</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectId">Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Log Time</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
            <CardDescription>All time entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved Hours</CardTitle>
            <CardDescription>Approved time entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter((e) => e.status === 'Approved').reduce((sum, e) => sum + e.hours, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
            <CardDescription>Approved entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>All logged time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No time entries found
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.user.name}</TableCell>
                    <TableCell>{entry.project?.name || '-'}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>{entry.hourlyRate ? formatCurrency(entry.hourlyRate) : '-'}</TableCell>
                    <TableCell>{entry.totalAmount ? formatCurrency(entry.totalAmount) : '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

