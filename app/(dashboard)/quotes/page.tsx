'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { NewQuoteDialog } from '@/components/dialogs/new-quote-dialog';

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  customer: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      if (response.ok) {
        const data = await response.json();
        // Handle both array and wrapped response
        const quotesData = Array.isArray(data) ? data : (data.data || data);
        setQuotes(quotesData || []);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
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
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Expired: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your quotes and estimates</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No quotes yet</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Quote #</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Total</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Created</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium text-sm">{quote.quoteNumber}</TableCell>
                    <TableCell className="text-sm">{quote.customer.name}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(quote.total)}</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{formatDate(quote.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 sm:px-3">
                          <Link href={`/quotes/${quote.id}`} className="text-xs sm:text-sm">View</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
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
      <NewQuoteDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          fetchQuotes();
        }}
      />
    </div>
  );
}

