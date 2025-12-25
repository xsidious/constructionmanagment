'use client';

import { useEffect, useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Plus } from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  vendor?: string;
  project?: { name: string };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    category: 'Materials',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    paidBy: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, projectsRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/projects'),
      ]);

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        // Handle both array and wrapped response, and convert Decimal amounts
        const expensesData = Array.isArray(data) ? data : (data.data || data);
        const convertedExpenses = (expensesData || []).map((expense: any) => ({
          ...expense,
          amount: typeof expense.amount === 'object' && expense.amount?.toNumber 
            ? expense.amount.toNumber() 
            : Number(expense.amount || 0),
        }));
        setExpenses(convertedExpenses);
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
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          projectId: '',
          category: 'Materials',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          vendor: '',
          paidBy: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : Number(expense.amount) || 0;
    return sum + amount;
  }, 0);
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : Number(expense.amount) || 0;
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Expense Tracking</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track project expenses and receipts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Record a new expense</DialogDescription>
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
                      <SelectValue placeholder="Select project (optional)" />
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        {Object.entries(categoryTotals).slice(0, 3).map(([category, total]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>Category total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(total)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>All recorded expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[150px] hidden md:table-cell">Description</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Project</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Vendor</TableHead>
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-sm">{expense.category}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{expense.description}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">{expense.project?.name || '-'}</TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{expense.vendor || '-'}</TableCell>
                      <TableCell className="font-medium text-sm">{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

