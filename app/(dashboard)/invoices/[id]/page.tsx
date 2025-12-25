'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Download, Plus, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  dueDate?: string;
  paidDate?: string;
  customer: { id: string; name: string };
  project?: { id: string; name: string };
  lineItems: Array<{
    id: string;
    type: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    reference?: string;
    paidAt: string;
  }>;
  createdAt: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BankTransfer');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both wrapped and direct response
        const invoiceData = data.data || data;
        // Ensure all numeric fields are properly converted
        if (invoiceData) {
          invoiceData.subtotal = typeof invoiceData.subtotal === 'object' && invoiceData.subtotal?.toNumber 
            ? invoiceData.subtotal.toNumber() 
            : Number(invoiceData.subtotal || 0);
          invoiceData.tax = typeof invoiceData.tax === 'object' && invoiceData.tax?.toNumber 
            ? invoiceData.tax.toNumber() 
            : Number(invoiceData.tax || 0);
          invoiceData.discount = typeof invoiceData.discount === 'object' && invoiceData.discount?.toNumber 
            ? invoiceData.discount.toNumber() 
            : Number(invoiceData.discount || 0);
          invoiceData.total = typeof invoiceData.total === 'object' && invoiceData.total?.toNumber 
            ? invoiceData.total.toNumber() 
            : Number(invoiceData.total || 0);
          if (invoiceData.lineItems) {
            invoiceData.lineItems = invoiceData.lineItems.map((item: any) => ({
              ...item,
              unitPrice: typeof item.unitPrice === 'object' && item.unitPrice?.toNumber 
                ? item.unitPrice.toNumber() 
                : Number(item.unitPrice || 0),
              total: typeof item.total === 'object' && item.total?.toNumber 
                ? item.total.toNumber() 
                : Number(item.total || 0),
            }));
          }
          if (invoiceData.payments) {
            invoiceData.payments = invoiceData.payments.map((payment: any) => ({
              ...payment,
              amount: typeof payment.amount === 'object' && payment.amount?.toNumber 
                ? payment.amount.toNumber() 
                : Number(payment.amount || 0),
            }));
          }
        }
        setInvoice(invoiceData);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!invoice || !paymentAmount) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          reference: paymentReference || undefined,
        }),
      });

      if (response.ok) {
        setPaymentDialogOpen(false);
        setPaymentAmount('');
        setPaymentReference('');
        fetchInvoice(); // Refresh invoice data
      }
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p>Invoice not found</p>
          </CardContent>
        </Card>
      </div>
    );
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

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.total - totalPaid;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={() => router.back()} className="h-9 sm:h-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 sm:flex-initial">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Invoice Details</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {invoice.status !== 'Paid' && (
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Add a payment record for this invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                        <SelectItem value="CreditCard">Credit Card</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Input
                      id="reference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Check number, transaction ID, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPayment}>Record Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={`/customers/${invoice.customer.id}`}>
                {invoice.customer.name}
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.dueDate ? formatDate(invoice.dueDate) : 'Not set'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Remaining</span>
                <span className={`font-bold text-lg ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.method} • {formatDate(payment.paidAt)}
                      </div>
                      {payment.reference && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {payment.reference}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

