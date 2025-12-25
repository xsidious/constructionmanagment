import { NextRequest, NextResponse } from 'next/server';
import { requireApiContext, apiError } from '@/lib/api-helpers';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await requireApiContext();
    const { requireApiPermission } = await import('@/lib/api-helpers');
    requireApiPermission(session, 'invoice:read');

    // Handle both Promise and direct params (Next.js 14+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const pdfBuffer = await generateInvoicePDF(resolvedParams.id, session.companyId);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${resolvedParams.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    if (error.message === 'Invoice not found') {
      return apiError('Invoice not found', 404);
    }
    return apiError(error.message || 'Internal server error', 500);
  }
}

