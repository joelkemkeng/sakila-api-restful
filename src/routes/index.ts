import express from "express";
import moviesRoutes from "./movies.route";
import { filmRoutes as filmsRoutes } from "./film.route";
import actorsRoutes from "./actor.route";
import { infoRouter as systemRoutes } from "./sys.route";
import { authRouter as authRoutes } from "./auth.route";

const router = express.Router();

router.use("/v1/movies", moviesRoutes);
router.use("/v1/films", filmsRoutes);
router.use("/v1/actors", actorsRoutes);
router.use("/auth", authRoutes); // Auth routes
router.use("/", systemRoutes); // System routes (info, status, metrics)

export default router;
