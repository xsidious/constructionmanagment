import PDFDocument from 'pdfkit';
import { prisma } from './prisma';
import { formatCurrency, formatDate } from './utils';

export async function generateQuotePDF(quoteId: string, companyId: string): Promise<Buffer> {
  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      companyId,
    },
    include: {
      company: true,
      customer: true,
      project: true,
      lineItems: true,
    },
  });

  if (!quote) {
    throw new Error('Quote not found');
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(quote.company.name, { align: 'left' });
    if (quote.company.vat) {
      doc.fontSize(10).text(`VAT: ${quote.company.vat}`, { align: 'left' });
    }
    doc.moveDown();

    // Quote details
    doc.fontSize(16).text('QUOTE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Quote Number: ${quote.quoteNumber}`, { align: 'left' });
    doc.text(`Date: ${formatDate(quote.createdAt)}`, { align: 'left' });
    if (quote.validUntil) {
      doc.text(`Valid Until: ${formatDate(quote.validUntil)}`, { align: 'left' });
    }
    doc.moveDown();

    // Customer details
    doc.text('Bill To:', { align: 'left' });
    doc.text(quote.customer.name, { align: 'left' });
    if (quote.customer.address) {
      doc.text(quote.customer.address, { align: 'left' });
    }
    if (quote.customer.email) {
      doc.text(quote.customer.email, { align: 'left' });
    }
    doc.moveDown();

    // Line items table
    const tableTop = doc.y;
    const itemHeight = 20;
    let currentY = tableTop;

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, currentY);
    doc.text('Type', 250, currentY);
    doc.text('Qty', 320, currentY);
    doc.text('Price', 370, currentY);
    doc.text('Total', 450, currentY);
    currentY += itemHeight;

    // Table rows
    doc.font('Helvetica');
    quote.lineItems.forEach((item) => {
      doc.text(item.description.substring(0, 30), 50, currentY);
      doc.text(item.type, 250, currentY);
      doc.text(item.quantity.toString(), 320, currentY);
      doc.text(formatCurrency(item.unitPrice.toNumber(), quote.company.currency), 370, currentY);
      doc.text(formatCurrency(item.total.toNumber(), quote.company.currency), 450, currentY);
      currentY += itemHeight;
    });

    // Totals
    currentY += 10;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 350, currentY);
    doc.text(formatCurrency(quote.subtotal.toNumber(), quote.company.currency), 450, currentY);
    currentY += itemHeight;

    if (quote.discount.toNumber() > 0) {
      doc.text('Discount:', 350, currentY);
      doc.text(formatCurrency(quote.discount.toNumber(), quote.company.currency), 450, currentY);
      currentY += itemHeight;
    }

    if (quote.tax.toNumber() > 0) {
      doc.text('Tax:', 350, currentY);
      doc.text(formatCurrency(quote.tax.toNumber(), quote.company.currency), 450, currentY);
      currentY += itemHeight;
    }

    doc.fontSize(12);
    doc.text('Total:', 350, currentY);
    doc.text(formatCurrency(quote.total.toNumber(), quote.company.currency), 450, currentY);

    doc.end();
  });
}

export async function generateInvoicePDF(invoiceId: string, companyId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      companyId,
    },
    include: {
      company: true,
      customer: true,
      project: true,
      lineItems: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(invoice.company.name, { align: 'left' });
    if (invoice.company.vat) {
      doc.fontSize(10).text(`VAT: ${invoice.company.vat}`, { align: 'left' });
    }
    doc.moveDown();

    // Invoice details
    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'left' });
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, { align: 'left' });
    if (invoice.dueDate) {
      doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, { align: 'left' });
    }
    doc.moveDown();

    // Customer details
    doc.text('Bill To:', { align: 'left' });
    doc.text(invoice.customer.name, { align: 'left' });
    if (invoice.customer.address) {
      doc.text(invoice.customer.address, { align: 'left' });
    }
    if (invoice.customer.email) {
      doc.text(invoice.customer.email, { align: 'left' });
    }
    doc.moveDown();

    // Line items table
    const tableTop = doc.y;
    const itemHeight = 20;
    let currentY = tableTop;

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, currentY);
    doc.text('Type', 250, currentY);
    doc.text('Qty', 320, currentY);
    doc.text('Price', 370, currentY);
    doc.text('Total', 450, currentY);
    currentY += itemHeight;

    // Table rows
    doc.font('Helvetica');
    invoice.lineItems.forEach((item) => {
      doc.text(item.description.substring(0, 30), 50, currentY);
      doc.text(item.type, 250, currentY);
      doc.text(item.quantity.toString(), 320, currentY);
      doc.text(formatCurrency(item.unitPrice.toNumber(), invoice.company.currency), 370, currentY);
      doc.text(formatCurrency(item.total.toNumber(), invoice.company.currency), 450, currentY);
      currentY += itemHeight;
    });

    // Totals
    currentY += 10;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 350, currentY);
    doc.text(formatCurrency(invoice.subtotal.toNumber(), invoice.company.currency), 450, currentY);
    currentY += itemHeight;

    if (invoice.discount.toNumber() > 0) {
      doc.text('Discount:', 350, currentY);
      doc.text(formatCurrency(invoice.discount.toNumber(), invoice.company.currency), 450, currentY);
      currentY += itemHeight;
    }

    if (invoice.tax.toNumber() > 0) {
      doc.text('Tax:', 350, currentY);
      doc.text(formatCurrency(invoice.tax.toNumber(), invoice.company.currency), 450, currentY);
      currentY += itemHeight;
    }

    doc.fontSize(12);
    doc.text('Total:', 350, currentY);
    doc.text(formatCurrency(invoice.total.toNumber(), invoice.company.currency), 450, currentY);
    currentY += itemHeight;

    // Payments
    if (invoice.payments.length > 0) {
      currentY += 10;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Payments:', 50, currentY);
      currentY += itemHeight;
      doc.font('Helvetica');
      invoice.payments.forEach((payment) => {
        doc.text(
          `${formatDate(payment.paidAt)} - ${payment.method} - ${formatCurrency(payment.amount.toNumber(), invoice.company.currency)}`,
          50,
          currentY
        );
        currentY += itemHeight;
      });
    }

    doc.end();
  });
}

