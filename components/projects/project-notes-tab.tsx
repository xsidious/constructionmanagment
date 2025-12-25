'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProjectNote {
  id: string;
  title?: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectNotesTabProps {
  projectId: string;
}

export function ProjectNotesTab({ projectId }: ProjectNotesTabProps) {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'note',
  });

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingNote
        ? `/api/projects/${projectId}/notes/${editingNote.id}`
        : `/api/projects/${projectId}/notes`;
      const method = editingNote ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        setEditingNote(null);
        setFormData({ title: '', content: '', type: 'note' });
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note');
    }
  };

  const handleEdit = (note: ProjectNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content,
      type: note.type,
    });
    setDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'change':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'update':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'change':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div>Loading notes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Notes & Changes</CardTitle>
            <CardDescription>Track notes, changes, and updates for this project</CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingNote(null);
                setFormData({ title: '', content: '', type: 'note' });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
                <DialogDescription>
                  {editingNote ? 'Update the note details' : 'Add a new note, change, or update'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="change">Change</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief title for this note"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter note details..."
                      rows={8}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingNote(null);
                      setFormData({ title: '', content: '', type: 'note' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingNote ? 'Update' : 'Create'} Note</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border ${getTypeColor(note.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(note.type)}
                    <div>
                      {note.title && (
                        <h4 className="font-semibold text-sm">{note.title}</h4>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {note.user.name} • {formatDate(note.createdAt)}
                        {note.updatedAt !== note.createdAt && ' (edited)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-2">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

