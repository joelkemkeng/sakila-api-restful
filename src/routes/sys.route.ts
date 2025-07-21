import express from "express";
import { DB } from "../utility/ORM/DB";
import { Log } from "../utility/logging/Logger";

const router = express.Router();

// Chemins pour les endpoints système
const STATUS_PATH = "/status";
const METRICS_PATH = "/metrics";
const INFO_PATH = "/info";

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Check database connection status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database connection status
 */
router.get(INFO_PATH, async (_req, res) => {
  try {
    const [result] = await DB.Connection.query("SELECT 1 as connected");
    
    res.json({
      status: "connected",
      dbInfo: {
        connected: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database connection check failed:", error);
    res.status(503).json({
      status: "disconnected",
      error: "Database not reachable",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get API status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API status
 */
router.get(STATUS_PATH, (_req, res) => {
  res.json({
    status: "online",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get API metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API metrics data
 */
router.get(METRICS_PATH, (_req, res) => {
  // Métriques de base
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
  
  res.json(metrics);
});

export const infoRouter = router;
