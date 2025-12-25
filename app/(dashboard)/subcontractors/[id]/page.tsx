'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, FileText, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SubcontractorDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  specialty?: string;
  hourlyRate?: number;
  notes?: string;
  totalCost: number;
  paidCost: number;
  upcomingJobs: Array<{
    id: string;
    description: string;
    amount: number;
    status: string;
    startDate?: string;
    endDate?: string;
    project?: { id: string; name: string };
    job?: { id: string; title: string };
  }>;
  pastJobs: Array<{
    id: string;
    description: string;
    amount: number;
    status: string;
    startDate?: string;
    endDate?: string;
    paidDate?: string;
    invoiceNumber?: string;
    project?: { id: string; name: string };
    job?: { id: string; title: string };
  }>;
  files: Array<{
    id: string;
    originalName: string;
    size: number;
    fileType?: string;
    createdAt: string;
  }>;
}

export default function SubcontractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subcontractor, setSubcontractor] = useState<SubcontractorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('contract');

  useEffect(() => {
    if (params.id) {
      fetchSubcontractor();
    }
  }, [params.id]);

  const fetchSubcontractor = async () => {
    try {
      const response = await fetch(`/api/subcontractors/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubcontractor(data);
      }
    } catch (error) {
      console.error('Failed to fetch subcontractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('subcontractorId', params.id as string);
      formData.append('fileType', fileType);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        fetchSubcontractor();
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!subcontractor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p>Subcontractor not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{subcontractor.name}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {subcontractor.specialty || 'Subcontractor'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(subcontractor.totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(subcontractor.paidCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(subcontractor.totalCost - subcontractor.paidCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcontractor.upcomingJobs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Jobs</TabsTrigger>
          <TabsTrigger value="past">Past Jobs</TabsTrigger>
          <TabsTrigger value="files">Contracts & Files</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Jobs that need to be completed</CardDescription>
            </CardHeader>
            <CardContent>
              {subcontractor.upcomingJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming jobs</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Project/Job</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subcontractor.upcomingJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.description}</TableCell>
                          <TableCell>
                            {job.project ? (
                              <Link
                                href={`/projects/${job.project.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {job.project.name}
                              </Link>
                            ) : job.job ? (
                              <Link
                                href={`/jobs/${job.job.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {job.job.title}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(job.amount)}</TableCell>
                          <TableCell>
                            <span className="rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
                              {job.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {job.startDate ? formatDate(job.startDate) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Jobs</CardTitle>
              <CardDescription>Completed jobs with costs</CardDescription>
            </CardHeader>
            <CardContent>
              {subcontractor.pastJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No past jobs</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Project/Job</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Invoice #</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subcontractor.pastJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.description}</TableCell>
                          <TableCell>
                            {job.project ? (
                              <Link
                                href={`/projects/${job.project.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {job.project.name}
                              </Link>
                            ) : job.job ? (
                              <Link
                                href={`/jobs/${job.job.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {job.job.title}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(job.amount)}</TableCell>
                          <TableCell>
                            <span className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                              {job.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {job.paidDate ? formatDate(job.paidDate) : '-'}
                          </TableCell>
                          <TableCell>{job.invoiceNumber || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contracts & Files</CardTitle>
                  <CardDescription>Upload and manage contracts and documents</CardDescription>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload File</DialogTitle>
                      <DialogDescription>Upload a contract or document</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFileUpload}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fileType">File Type</Label>
                          <Select value={fileType} onValueChange={setFileType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="file">File</Label>
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setUploadDialogOpen(false)}
                          disabled={uploading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploading || !selectedFile}>
                          {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {subcontractor.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files uploaded</p>
              ) : (
                <div className="space-y-2">
                  {subcontractor.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-muted-foreground">
                            {file.fileType || 'Document'} • {(file.size / 1024).toFixed(2)} KB •{' '}
                            {formatDate(file.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.open(`/api/files/${file.id}`, '_blank');
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subcontractor.email && (
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{subcontractor.email}</p>
                </div>
              )}
              {subcontractor.phone && (
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">{subcontractor.phone}</p>
                </div>
              )}
              {subcontractor.address && (
                <div>
                  <Label className="text-sm text-muted-foreground">Address</Label>
                  <p className="font-medium">{subcontractor.address}</p>
                </div>
              )}
              {subcontractor.hourlyRate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Hourly Rate</Label>
                  <p className="font-medium">{formatCurrency(subcontractor.hourlyRate)}</p>
                </div>
              )}
              {subcontractor.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="font-medium whitespace-pre-wrap">{subcontractor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

