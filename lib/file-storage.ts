import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export interface FileUpload {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export async function validateFile(file: FileUpload): Promise<void> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE} bytes`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    throw new Error(`File type ${file.mimeType} is not allowed`);
  }
}

export async function saveFile(
  file: FileUpload,
  companyId: string,
  projectId: string | null,
  uploadedById: string
): Promise<{ id: string; path: string }> {
  // Create directory structure
  const dirPath = projectId
    ? path.join(UPLOAD_DIR, companyId, projectId)
    : path.join(UPLOAD_DIR, companyId);

  await fs.mkdir(dirPath, { recursive: true });

  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(file.originalName);
  const filename = `${timestamp}-${file.filename}${ext}`;
  const filePath = path.join(dirPath, filename);

  // Save file
  await fs.writeFile(filePath, file.buffer);

  // Save metadata to database
  const dbFile = await prisma.file.create({
    data: {
      companyId,
      projectId,
      uploadedById,
      filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: filePath,
    },
  });

  return {
    id: dbFile.id,
    path: filePath,
  };
}

export async function deleteFile(fileId: string, companyId: string): Promise<void> {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      companyId,
    },
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Delete from filesystem
  try {
    await fs.unlink(file.path);
  } catch (error) {
    // File might not exist, continue
  }

  // Delete from database
  await prisma.file.delete({
    where: { id: fileId },
  });
}

export async function getFile(fileId: string, companyId: string) {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      companyId,
    },
  });

  if (!file) {
    return null;
  }

  return file;
}

