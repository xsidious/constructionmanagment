import { NextRequest } from 'next/server';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { saveFile, validateFile } from '@/lib/file-storage';

export async function POST(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write'); // Using project permission for file uploads

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string | null;
    const subcontractorId = formData.get('subcontractorId') as string | null;
    const fileType = formData.get('fileType') as string | null;

    if (!file) {
      return apiError('No file provided', 400);
    }

    // Verify project if provided
    if (projectId) {
      const { prisma } = await import('@/lib/prisma');
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId: session.companyId,
        },
      });

      if (!project) {
        return apiError('Project not found', 404);
      }
    }

    // Verify subcontractor if provided
    if (subcontractorId) {
      const { prisma } = await import('@/lib/prisma');
      const subcontractor = await prisma.subcontractor.findFirst({
        where: {
          id: subcontractorId,
          companyId: session.companyId,
        },
      });

      if (!subcontractor) {
        return apiError('Subcontractor not found', 404);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUpload = {
      filename: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
    };

    await validateFile(fileUpload);
    const result = await saveFile(
      fileUpload,
      session.companyId,
      projectId,
      session.userId,
      subcontractorId,
      fileType
    );

    return apiSuccess(result, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError(error.message || 'Internal server error', 500);
  }
}

