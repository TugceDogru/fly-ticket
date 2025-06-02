import express from "express";
import {
  listFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

import { validateFlightRules } from "../middlewares/flightRulesValidator.js";
import { authenticateAdmin } from "../middlewares/auth.js";

const router = express.Router();

// 1) Public flight listing & details
router.get("/", listFlights); // GET  /api/flights?fromCity=…&toCity=…&date=…
router.get("/:id", getFlightById); // GET  /api/flights/:id

// 2) Admin-protected flight operations
router.post(
  "/",
  authenticateAdmin, // Only valid admin token
  validateFlightRules, // Check scheduling rules (no same-hour departure, no identical arrival)
  createFlight // Create new flight
);

router.put(
  "/:id",
  authenticateAdmin,
  validateFlightRules, // Validate rules on update as well
  updateFlight // Update flight
);

router.delete(
  "/:id",
  authenticateAdmin, // Authorized admin
  deleteFlight // Logical delete (isDeleted = 1)
);

export default router;
