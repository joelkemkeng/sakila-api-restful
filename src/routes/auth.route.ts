import { Request, Response, Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and return a JWT
 *     tags: [Auth]
 */
router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const result = await authController.register({ username, email, password });

    if (!result) {
      res.status(400).json({ error: "Registration failed" });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 */
router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authController.login({ email, password });

    if (!result) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Afficher le token dans la console pour le débogage
    console.log("=== TOKEN DE CONNEXION ===");
    console.log(result.token);
    console.log("=========================");

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/renew:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post("/auth/renew", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const tokenResponse = await authController.refreshToken({ refreshToken });

    if (!tokenResponse) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    res.status(200).json(tokenResponse); // return { token: string }
  } catch (error) {
    console.error("❌ Refresh Token Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user (revoke refresh token)
 *     tags: [Auth]
 */
router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const result = await authController.logout({ refreshToken }, req);

    if (result.success) {
      res.status(200).json({ message: "Logout successful" });
    } else {
      res.status(401).json({ message: "Logout failed" });
    }
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Exporter le routeur pour server_manager.ts
export const authRouter = router;
