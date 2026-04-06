import { Router } from "express";
import WeatherController from "../controllers/weatherController";
import AlertController from "../controllers/alertController";
import NotificationController from "../controllers/notificationController";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware";
import { weatherLimiter } from "../middleware/rateLimiter";

const router = Router();
const weatherController = new WeatherController();
const alertController = new AlertController();
const notificationController = new NotificationController();

// ===== Weather (public) =====

/**
 * @swagger
 * /api/geocode:
 *   get:
 *     summary: Search for city names (autocomplete)
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search query (min 2 chars)
 *     responses:
 *       200: { description: Array of geocode results }
 */
router.get("/geocode", weatherController.geocodeSearch);

/**
 * @swagger
 * /api/weather/realtime:
 *   get:
 *     summary: Get real-time weather for a location
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema: { type: string }
 *         description: City name or "lat,lon" coordinates
 *     responses:
 *       200: { description: Current weather data }
 *       400: { description: Missing location parameter }
 */
router.get(
  "/weather/realtime",
  weatherLimiter,
  weatherController.getRealtimeWeather,
);

/**
 * @swagger
 * /api/weather/forecast:
 *   get:
 *     summary: Get weather forecast (hourly or daily)
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema: { type: string }
 *         description: City name or "lat,lon" coordinates
 *       - in: query
 *         name: timestep
 *         schema: { type: string, enum: [1h, 1d], default: 1h }
 *         description: Forecast granularity
 *     responses:
 *       200: { description: Forecast data with intervals array }
 *       400: { description: Missing location parameter }
 */
router.get(
  "/weather/forecast",
  weatherLimiter,
  weatherController.getForecastWeather,
);

/**
 * @swagger
 * /api/weather/history:
 *   get:
 *     summary: Get historical weather data
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: range
 *         schema: { type: string, enum: [24h, week, month], default: week }
 *       - in: query
 *         name: timestep
 *         schema: { type: string, enum: [1h, 1d], default: 1d }
 *     responses:
 *       200: { description: Historical weather data }
 */
router.get(
  "/weather/history",
  weatherLimiter,
  weatherController.getWeatherHistory,
);

// ===== Alerts (auth optional for backward compat) =====

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new weather alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [locationType, parameter, operator, threshold]
 *             properties:
 *               name: { type: string }
 *               locationType: { type: string, enum: [city, coords] }
 *               city: { type: string }
 *               lat: { type: number }
 *               lon: { type: number }
 *               parameter: { type: string }
 *               operator: { type: string }
 *               threshold: { type: number }
 *     responses:
 *       201: { description: Alert created }
 *       400: { description: Invalid alert data }
 */
router.post("/alerts", optionalAuth, alertController.createAlert);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts with pagination
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of alerts }
 */
router.get("/alerts", optionalAuth, alertController.getAlerts);

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     summary: Get alert statistics
 *     tags: [Alerts]
 *     responses:
 *       200: { description: Alert stats (total, triggered, etc.) }
 */
router.get("/alerts/stats", optionalAuth, alertController.getAlertStats);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Alert deleted }
 */
router.delete("/alerts/:id", authMiddleware, alertController.deleteAlert);

/**
 * @swagger
 * /api/alerts/{id}/evaluate:
 *   post:
 *     summary: Manually trigger evaluation for an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Evaluation result }
 */
router.post(
  "/alerts/:id/evaluate",
  authMiddleware,
  alertController.evaluateAlert,
);

/**
 * @swagger
 * /api/alerts/{id}/history:
 *   get:
 *     summary: Get evaluation history for an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Paginated evaluation history }
 */
router.get(
  "/alerts/:id/history",
  authMiddleware,
  alertController.getAlertHistory,
);

// ===== Notifications (requires auth) =====

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of notifications }
 */
router.get(
  "/notifications",
  authMiddleware,
  notificationController.getNotifications,
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All notifications marked as read }
 */
router.patch(
  "/notifications/read-all",
  authMiddleware,
  notificationController.markAllAsRead,
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Notification marked as read }
 */
router.patch(
  "/notifications/:id/read",
  authMiddleware,
  notificationController.markAsRead,
);

export default router;
