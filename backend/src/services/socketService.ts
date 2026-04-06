import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("join:user", (userId: string) => {
        // Validate JWT before allowing user to join their room
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
          socket.emit("error", { message: "Authentication required" });
          return;
        }

        try {
          const decoded = jwt.verify(token, config.JWT_SECRET) as {
            userId: string;
          };
          if (decoded.userId !== userId) {
            socket.emit("error", { message: "Unauthorized" });
            return;
          }
          socket.join(`user:${userId}`);
        } catch {
          socket.emit("error", { message: "Invalid token" });
        }
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /** Emit an alert triggered event to all connected clients */
  emitAlertTriggered(alert: {
    id: string;
    name?: string;
    parameter: string;
    threshold: number;
    observedValue: number;
    userId?: string;
  }): void {
    if (!this.io) return;

    // Broadcast to all
    this.io.emit("alert:triggered", alert);

    // Also emit to specific user room if userId present
    if (alert.userId) {
      this.io
        .to(`user:${alert.userId}`)
        .emit("alert:triggered:personal", alert);
    }
  }

  /** Emit when an alert is created */
  emitAlertCreated(alert: {
    id: string;
    name?: string;
    userId?: string;
  }): void {
    if (!this.io) return;
    this.io.emit("alert:created", alert);
  }

  /** Emit when an alert is deleted */
  emitAlertDeleted(alertId: string): void {
    if (!this.io) return;
    this.io.emit("alert:deleted", { id: alertId });
  }

  /** Emit notification to specific user */
  emitNotification(
    userId: string,
    notification: {
      id: string;
      message: string;
      alertId: string;
      createdAt: Date;
    },
  ): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit("notification", notification);
  }

  getIO(): Server | null {
    return this.io;
  }
}
