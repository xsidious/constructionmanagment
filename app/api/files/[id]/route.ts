import { NextRequest, NextResponse } from 'next/server';
import { requireApiContext, apiError, apiSuccess } from '@/lib/api-helpers';
import { getFile, deleteFile } from '@/lib/file-storage';
import fs from 'fs/promises';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();

    const file = await getFile(params.id, session.companyId);

    if (!file) {
      return apiError('File not found', 404);
    }

    // Check if file exists on filesystem
    try {
      const fileBuffer = await fs.readFile(file.path);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
          'Content-Length': file.size.toString(),
        },
      });
    } catch {
      return apiError('File not found on filesystem', 404);
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    const { requireApiPermission } = await import('@/lib/api-helpers');
    requireApiPermission(session, 'project:write');

    await deleteFile(params.id, session.companyId);

    return apiSuccess({ message: 'File deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError(error.message || 'Internal server error', 500);
  }
}

