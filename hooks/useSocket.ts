'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendTyping,
  onMessage,
  offMessage,
  onUserTyping,
  offUserTyping,
  ChatMessage,
} from '@/lib/socket-client';
import { MessageType } from '@prisma/client';

export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;

    // Get token from session (you'll need to expose this)
    // For now, we'll use a workaround
    const token = (session as any).accessToken;
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    onMessage(handleMessage);
    onUserTyping(handleTyping);

    return () => {
      offMessage(handleMessage);
      offUserTyping(handleTyping);
      disconnectSocket();
    };
  }, [session]);

  const joinProjectRoom = useCallback((projectId: string) => {
    joinRoom(projectId);
  }, []);

  const leaveProjectRoom = useCallback((projectId: string) => {
    leaveRoom(projectId);
  }, []);

  const sendChatMessage = useCallback((data: {
    projectId: string;
    content: string;
    type?: MessageType;
    fileUrl?: string;
  }) => {
    sendMessage(data);
  }, []);

  const setTyping = useCallback((projectId: string, isTyping: boolean) => {
    sendTyping(projectId, isTyping);
  }, []);

  return {
    isConnected,
    messages,
    typingUsers,
    joinProjectRoom,
    leaveProjectRoom,
    sendChatMessage,
    setTyping,
  };
}

