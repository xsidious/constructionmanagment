import { io, Socket } from 'socket.io-client';
import { MessageType } from '@prisma/client';

let socket: Socket | null = null;

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: MessageType;
  fileUrl?: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
  };
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  socket = io(socketUrl, {
    path: '/api/socket',
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinRoom(projectId: string) {
  if (socket) {
    socket.emit('join-room', projectId);
  }
}

export function leaveRoom(projectId: string) {
  if (socket) {
    socket.emit('leave-room', projectId);
  }
}

export function sendMessage(data: {
  projectId: string;
  content: string;
  type?: MessageType;
  fileUrl?: string;
}) {
  if (socket) {
    socket.emit('send-message', data);
  }
}

export function sendTyping(projectId: string, isTyping: boolean) {
  if (socket) {
    socket.emit('typing', { projectId, isTyping });
  }
}

export function onMessage(callback: (message: ChatMessage) => void) {
  if (socket) {
    socket.on('new-message', callback);
  }
}

export function offMessage(callback: (message: ChatMessage) => void) {
  if (socket) {
    socket.off('new-message', callback);
  }
}

export function onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
  if (socket) {
    socket.on('user-typing', callback);
  }
}

export function offUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
  if (socket) {
    socket.off('user-typing', callback);
  }
}

