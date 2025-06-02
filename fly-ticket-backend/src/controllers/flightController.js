import { Flight } from "../models/Flight.js";
import { Ticket } from "../models/Ticket.js";
import { v4 as uuidv4 } from "uuid"; // Ensure `uuid` is installed via `npm install uuid`
import { pool } from "../config/db.js"; // Ek SQL işlemleri için

// 1. List all flights (public)
export async function listFlights(req, res, next) {
  try {
    // Optional query parameters: fromCity, toCity, date (YYYY-MM-DD)
    const { fromCity, toCity, date } = req.query;
    const flights = await Flight.findAll({ fromCity, toCity, date });
    res.json(flights);
  } catch (err) {
    next(err);
  }
}

// 2. Get flight details by ID (public)
export async function getFlightById(req, res, next) {
  try {
    const { id } = req.params;
    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found." });
    }
    res.json(flight);
  } catch (err) {
    next(err);
  }
}

// 3. Create a new flight (admin-protected)
export async function createFlight(req, res, next) {
  try {
    const {
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available,
    } = req.body;

    // Generate a UUID for the new flight
    const flight_id = uuidv4();

    await Flight.create({
      flight_id,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available,
    });

    res
      .status(201)
      .json({ message: "Flight created successfully.", flight_id });
  } catch (err) {
    next(err);
  }
}

// 4. Update an existing flight (admin-protected)
export async function updateFlight(req, res, next) {
  try {
    const { id } = req.params;
    const {
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available,
    } = req.body;

    // Check if the flight exists and is not deleted
    const existing = await Flight.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Flight not found." });
    }

    await Flight.update(id, {
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available,
    });

    res.json({ message: "Flight updated successfully." });
  } catch (err) {
    next(err);
  }
}

// 5. Delete a flight (admin-protected, logical deletion)
export async function deleteFlight(req, res, next) {
  try {
    const { id } = req.params;

    // Verify that the flight exists and is not already deleted
    const existing = await Flight.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Flight not found." });
    }

    await Flight.remove(id);
    res.json({ message: "Flight deleted successfully." });
  } catch (err) {
    next(err);
  }
}
