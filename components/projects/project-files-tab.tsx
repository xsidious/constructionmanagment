'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProjectFile {
  id: string;
  originalName: string;
  size: number;
  fileType?: string;
  createdAt: string;
}

interface ProjectFilesTabProps {
  projectId: string;
  files: ProjectFile[];
  onFileUpload: () => void;
}

export function ProjectFilesTab({ projectId, files, onFileUpload }: ProjectFilesTabProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('document');

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId);
      formData.append('fileType', fileType);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setFileType('document');
        onFileUpload();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Files & Blueprints</CardTitle>
            <CardDescription>Upload and manage project files, blueprints, and documents</CardDescription>
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
                <DialogDescription>Upload a blueprint, document, or other file</DialogDescription>
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
                        <SelectItem value="blueprint">Blueprint</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
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
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No files uploaded</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.originalName}</div>
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
                  className="ml-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

