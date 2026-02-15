'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { WSMessage } from '@/lib/realtime-types';
export type { WSMessage } from '@/lib/realtime-types';

export function useWebSocket(onMessage: (message: WSMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pendingMessagesRef = useRef<WSMessage[]>([]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (socketRef.current?.connected) return;

    const serverUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    const socket = io(serverUrl, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      pendingMessagesRef.current.forEach(message => {
        socket.emit('message', { ...message, timestamp: Date.now() });
      });
      pendingMessagesRef.current = [];
    });

    socket.on('message', (message: WSMessage) => {
      onMessage(message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });
  }, [onMessage]);

  const send = useCallback((message: WSMessage) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('message', { ...message, timestamp: Date.now() });
    } else {
      pendingMessagesRef.current.push(message);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);

  return {
    isConnected,
    send,
  };
}
