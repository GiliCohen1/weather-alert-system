import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/routes";
import { AlertEvaluationService } from "./services/alertEvaluationService";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", weatherRoutes);

// Initialize Alert Evaluation Service
const alertEvaluationService = new AlertEvaluationService();
alertEvaluationService.startScheduledEvaluation(
  parseInt(process.env.EVALUATION_INTERVAL_MINUTES || "5")
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  alertEvaluationService.stopScheduledEvaluation();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
