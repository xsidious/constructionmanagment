import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from './auth-utils';
import { prisma } from './prisma';
import { MessageType } from '@prisma/client';

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Authentication error'));
      }

      // Verify user exists and get company membership
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberships: {
            where: {
              companyId: payload.companyId,
            },
          },
        },
      });

      if (!user || user.memberships.length === 0) {
        return next(new Error('Unauthorized'));
      }

      (socket as any).userId = payload.userId;
      (socket as any).companyId = payload.companyId;
      (socket as any).role = user.memberships[0].role;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const companyId = (socket as any).companyId;

    console.log(`User ${userId} connected to company ${companyId}`);

    // Join project room
    socket.on('join-room', async (projectId: string) => {
      try {
        // Verify user has access to project
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            companyId,
          },
        });

        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        // Get or create chat room
        let room = await prisma.chatRoom.findUnique({
          where: { projectId },
        });

        if (!room) {
          room = await prisma.chatRoom.create({
            data: {
              projectId,
              companyId,
              name: `Project: ${project.name}`,
            },
          });
        }

        socket.join(`project:${projectId}`);
        socket.emit('joined-room', { projectId, roomId: room.id });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave project room
    socket.on('leave-room', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socket.emit('left-room', { projectId });
    });

    // Send message
    socket.on('send-message', async (data: {
      projectId: string;
      content: string;
      type?: MessageType;
      fileUrl?: string;
    }) => {
      try {
        const { projectId, content, type = 'text', fileUrl } = data;

        // Verify user has access to project
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            companyId,
          },
        });

        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        // Get or create chat room
        let room = await prisma.chatRoom.findUnique({
          where: { projectId },
        });

        if (!room) {
          room = await prisma.chatRoom.create({
            data: {
              projectId,
              companyId,
              name: `Project: ${project.name}`,
            },
          });
        }

        // Create message
        const message = await prisma.chatMessage.create({
          data: {
            roomId: room.id,
            userId,
            content,
            type,
            fileUrl,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        });

        // Broadcast to room
        io?.to(`project:${projectId}`).emit('new-message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { projectId: string; isTyping: boolean }) => {
      socket.to(`project:${data.projectId}`).emit('user-typing', {
        userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

