import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { config } from "./config";
import weatherRoutes from "./routes/routes";
import authRoutes from "./routes/authRoutes";
import { AlertEvaluationService } from "./services/alertEvaluationService";
import { SocketService } from "./services/socketService";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { setupSwagger } from "./swagger";
import prisma from "./db";

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
const socketService = SocketService.getInstance();
socketService.initialize(httpServer);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: [
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
    ],
  }),
);
app.use(express.json({ limit: "10kb" }));

// Logging
if (config.NODE_ENV !== "test") {
  app.use(morgan("short"));
}

// Rate limiting
app.use("/api", apiLimiter);

// API documentation
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", weatherRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Alert Evaluation Service
const alertEvaluationService = new AlertEvaluationService();
alertEvaluationService.startScheduledEvaluation(
  config.EVALUATION_INTERVAL_MINUTES,
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  alertEvaluationService.stopScheduledEvaluation();
  socketService.getIO()?.close();
  await prisma.$disconnect();
  httpServer.close();
});

const PORT = config.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api/docs`);
});

export { app, httpServer };
