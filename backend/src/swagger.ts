import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Weather Alert System API",
      version: "2.0.0",
      description:
        "Full-stack weather alert system with real-time monitoring, JWT auth, and WebSocket notifications.",
      contact: {
        name: "Developer",
      },
    },
    servers: [{ url: "http://localhost:5000", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Weather", description: "Weather data endpoints" },
      { name: "Alerts", description: "Alert management endpoints" },
      { name: "Notifications", description: "User notification endpoints" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Weather Alert System API",
    }),
  );

  // Serve raw spec
  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
