import { NextRequest, NextResponse } from 'next/server';
import { requireApiContext, apiError } from '@/lib/api-helpers';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    const { requireApiPermission } = await import('@/lib/api-helpers');
    requireApiPermission(session, 'invoice:read');

    const pdfBuffer = await generateInvoicePDF(params.id, session.companyId);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${params.id}.pdf"`,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError(error.message || 'Internal server error', 500);
  }
}

