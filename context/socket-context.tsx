import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { io, Socket } from 'socket.io-client';

import { useAuth } from '@/context/auth-context';
import { SERVER_CONFIG_ERROR, SERVER_URL } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { SendMessageAck, SessionRegisterAck } from '@/types/chat';

type SocketContextValue = {
  connectionError: string | null;
  isConnected: boolean;
  sendMessage: (senderId: number, recipientId: number, content: string) => Promise<SendMessageAck>;
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(SERVER_CONFIG_ERROR);

  useEffect(() => {
    if (!user || !SERVER_URL) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect();
        return null;
      });
      setIsConnected(false);
      setConnectionError(SERVER_CONFIG_ERROR);
      return;
    }

    const nextSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
    });

    setSocket(nextSocket);
    setConnectionError(null);

    nextSocket.on('connect', () => {
      setIsConnected(true);
      nextSocket.emit('session:register', { userId: user.id }, (response: SessionRegisterAck) => {
        if (response?.ok) {
          setConnectionError(null);
          return;
        }

        setConnectionError(new AppError(response?.error ?? 'SOCKET_SESSION_FAILED').message);
      });
    });

    nextSocket.on('connect_error', () => {
      setIsConnected(false);
      setConnectionError(new AppError('NETWORK_ERROR').message);
    });

    nextSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      nextSocket.disconnect();
      setSocket((currentSocket) => (currentSocket === nextSocket ? null : currentSocket));
      setIsConnected(false);
    };
  }, [user]);

  const sendMessage = (senderId: number, recipientId: number, content: string) => {
    return new Promise<SendMessageAck>((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new AppError('SOCKET_NOT_CONNECTED'));
        return;
      }

      socket.emit(
        'message:send',
        { content, recipientId, senderId },
        (response: SendMessageAck) => {
          if (!response.ok) {
            reject(new AppError(response.error));
            return;
          }

          resolve(response);
        }
      );
    });
  };

  return (
    <SocketContext.Provider
      value={{
        connectionError,
        isConnected,
        sendMessage,
        socket,
      }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }

  return context;
}
