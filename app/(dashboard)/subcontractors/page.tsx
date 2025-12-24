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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { UserCog, Plus } from 'lucide-react';

interface Subcontractor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  hourlyRate?: number;
  _count?: { workOrders: number };
}

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    specialty: '',
    hourlyRate: '',
    notes: '',
  });

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const fetchSubcontractors = async () => {
    try {
      const response = await fetch('/api/subcontractors');
      if (response.ok) {
        const data = await response.json();
        setSubcontractors(data);
      }
    } catch (error) {
      console.error('Failed to fetch subcontractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subcontractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          taxId: '',
          specialty: '',
          hourlyRate: '',
          notes: '',
        });
        fetchSubcontractors();
      }
    } catch (error) {
      console.error('Failed to create subcontractor:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subcontractors</h1>
          <p className="text-muted-foreground">Manage subcontractors and their work</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subcontractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Subcontractor</DialogTitle>
              <DialogDescription>Register a new subcontractor</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Subcontractor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>All registered subcontractors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Work Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcontractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No subcontractors found
                  </TableCell>
                </TableRow>
              ) : (
                subcontractors.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sub.email && <div>{sub.email}</div>}
                        {sub.phone && <div className="text-muted-foreground">{sub.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{sub.specialty || '-'}</TableCell>
                    <TableCell>{sub.hourlyRate ? formatCurrency(sub.hourlyRate) : '-'}</TableCell>
                    <TableCell>{sub._count?.workOrders || 0}</TableCell>
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

