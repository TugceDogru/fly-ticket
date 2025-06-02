import express from "express";
import {
  bookTicket,
  getAllTickets,
  getTicketsByQuery,
  deleteTicket,
} from "../controllers/ticketController.js";
import { authenticateAdmin } from "../middlewares/auth.js";

const router = express.Router();

// 1) List all tickets (requires admin privileges)
router.get("/", authenticateAdmin, getAllTickets);

// 2) Create a new ticket (public)
router.post("/", bookTicket);

// 3) Retrieve a ticket by ID or email (public)
//    Example: GET /api/tickets/abcdefg-1234 or GET /api/tickets/user@example.com
router.get("/:query", getTicketsByQuery);

// 4) Delete a ticket (logical deletion) – optional, public
router.delete("/:id", deleteTicket);

export default router;
