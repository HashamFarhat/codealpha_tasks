import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect socket on mount
    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket client connected:', newSocket.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
