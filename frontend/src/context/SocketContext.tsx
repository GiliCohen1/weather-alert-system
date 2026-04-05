import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:5000";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join user room when authenticated
  useEffect(() => {
    if (socket && user) {
      socket.emit("join:user", user.id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
