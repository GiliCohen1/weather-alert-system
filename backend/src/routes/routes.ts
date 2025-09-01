import { Router } from "express";
import WeatherController from "../controllers/weatherController";
import AlertController from "../controllers/alertController";

const router = Router();
const weatherController = new WeatherController();
const alertController = new AlertController();

// Weather data endpoints
router.get("/weather/realtime", weatherController.getRealtimeWeather);

// Alert management endpoints
router.post("/alerts", alertController.createAlert);
router.get("/alerts", alertController.getAlerts);
router.delete("/alerts/:id", alertController.deleteAlert);

export default router;
