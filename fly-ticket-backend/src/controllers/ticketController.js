import { Ticket } from "../models/Ticket.js";import { Flight } from "../models/Flight.js";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js"; // Import pool for additional queries

// 1. Create a new ticket (bookTicket – public)
export async function bookTicket(req, res, next) {
  try {
    const {
      passenger_name,
      passenger_surname,
      passenger_email,
      flight_id,
      seat_number,
    } = req.body;

    // 1) Find the flight and verify seats_available > 0
    const flight = await Flight.findById(flight_id);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found." });
    }
    if (flight.seats_available <= 0) {
      return res
        .status(400)
        .json({ error: "No seats available on this flight." });
    }

    // 2) Check if the same seat is already reserved on this flight (not logically deleted)
    if (seat_number) {
      const [existingSeatRows] = await pool.query(
        `
          SELECT ticket_id 
          FROM Ticket
          WHERE flight_id = ? AND seat_number = ? AND isDeleted = 0
        `,
        [flight_id, seat_number]
      );
      if (existingSeatRows.length > 0) {
        return res
          .status(400)
          .json({ error: "This seat number is already reserved." });
      }
    }

    // 3) Check for an existing reservation on this flight with the same first and last name
    const [existingNameRows] = await pool.query(
      `
        SELECT ticket_id
        FROM Ticket
        WHERE flight_id = ?
          AND passenger_name = ?
          AND passenger_surname = ?
          AND isDeleted = 0
      `,
      [flight_id, passenger_name, passenger_surname]
    );
    if (existingNameRows.length > 0) {
      return res.status(400).json({
        error:
          "A reservation already exists for this flight with the same name and surname.",
      });
    }

    // 4) Generate a new ticket_id
    const ticket_id = uuidv4();

    // 5) Insert the ticket record (isDeleted defaults to 0)
    await Ticket.create({
      ticket_id,
      passenger_name,
      passenger_surname,
      passenger_email,
      flight_id,
      seat_number,
    });

    // 6) Decrement the seats_available value on the flight by 1
    await Flight.update(flight_id, {
      from_city: flight.from_city,
      to_city: flight.to_city,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      price: flight.price,
      seats_total: flight.seats_total,
      seats_available: flight.seats_available - 1,
    });

    res.status(201).json({
      message: "Ticket booked successfully.",
      ticket_id,
    });
  } catch (err) {
    next(err);
  }
}

// 2. (Previously getTicketsByEmail; no longer used—merged into getTicketsByQuery.)
//    This function may remain in the model layer but is not referenced in any routes.
// export async function getTicketsByEmail(req, res, next) { … }

// 3. Retrieve a single ticket by ID (public / optional)
//    You can use this function directly if needed, but only getTicketsByQuery is exposed as a route.
export async function getTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }
    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

// 4. Delete a ticket (public / optional – logical deletion)
export async function deleteTicket(req, res, next) {
  try {
    // 1) Find the ticket (only consider non-deleted records)
    const { id } = req.params;
    const existing = await Ticket.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // 2) Retrieve the associated flight_id
    const { flight_id } = existing;

    // 3) Perform logical deletion: Ticket.remove(id) sets isDeleted = 1
    await Ticket.remove(id);

    // 4) Find the related flight and increment seats_available by 1
    const flight = await Flight.findById(flight_id);
    if (flight) {
      await Flight.update(flight_id, {
        from_city: flight.from_city,
        to_city: flight.to_city,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        price: flight.price,
        seats_total: flight.seats_total,
        seats_available: flight.seats_available + 1,
      });
    }

    res.json({ message: "Ticket deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// 5. List all tickets for admin (authenticateAdmin required)
export async function getAllTickets(req, res, next) {
  try {
    const tickets = await Ticket.findAll(); // Ensure findAll method exists in the model
    res.json(tickets);
  } catch (err) {
    next(err);
  }
}

// 6. General query function to search by ID or email (public)
//    If the query parameter contains "@", it is treated as an email; otherwise, as an ID.
export async function getTicketsByQuery(req, res, next) {
  try {
    const { query } = req.params;

    // Check for "@" to determine if it's an email
    if (query.includes("@")) {
      // Email lookup may return multiple tickets
      const tickets = await Ticket.findByEmail(query);
      return res.json(tickets);
    } else {
      // Treat query as ID (UUID format validation could be added)
      const ticket = await Ticket.findById(query);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found." });
      }
      return res.json(ticket);
    }
  } catch (err) {
    next(err);
  }
}
