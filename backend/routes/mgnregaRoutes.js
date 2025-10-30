import express from "express";
import { getDistrictData, getStateAndDistricts, refreshDistrictData, locateByCoords } from "../controllers/mgnregaController.js";

const router = express.Router();

// Route order matters! More specific routes should come before parameter routes
router.get("/states", getStateAndDistricts);
router.get("/locate", locateByCoords);
router.get("/district/refresh/:district", refreshDistrictData);
router.get("/:district", getDistrictData);

export default router;


