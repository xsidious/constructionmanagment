'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Receipt, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  customer: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800',
      Sent: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Overdue: 'bg-red-100 text-red-800',
      Cancelled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your invoices</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No invoices yet</p>
            <Button asChild className="mt-4">
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Invoice #</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Total</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Created</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customer.name}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 sm:px-3">
                          <Link href={`/invoices/${invoice.id}`} className="text-xs sm:text-sm">View</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}

