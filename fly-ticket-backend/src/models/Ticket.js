import { pool } from "../config/db.js";

export const Ticket = {
  // 1. Create a new ticket (reserve / book)
  async create({
    ticket_id,
    passenger_name,
    passenger_surname,
    passenger_email,
    flight_id,
    seat_number,
  }) {
    const [result] = await pool.query(
      `
      INSERT INTO Ticket
        (ticket_id, passenger_name, passenger_surname, passenger_email, flight_id, seat_number, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?, 0)
      `,
      [
        ticket_id,
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number || null,
      ]
    );
    return result;
  },

  // 2. List all tickets for a given email (only where isDeleted = 0)
  async findByEmail(email) {
    const [rows] = await pool.query(
      `
      SELECT 
        ticket_id,
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number,
        booked_at
      FROM Ticket
      WHERE passenger_email = ? AND isDeleted = 0
      ORDER BY booked_at DESC
      `,
      [email]
    );
    return rows;
  },

  // 3. Get a single ticket by ID (only where isDeleted = 0)
  async findById(ticketId) {
    const [rows] = await pool.query(
      `
      SELECT 
        ticket_id,
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number,
        booked_at
      FROM Ticket
      WHERE ticket_id = ? AND isDeleted = 0
      `,
      [ticketId]
    );
    return rows[0] || null;
  },

  // 4. Delete a ticket (logical deletion: isDeleted = 1)
  async remove(ticketId) {
    const [result] = await pool.query(
      `
      UPDATE Ticket
      SET isDeleted = 1
      WHERE ticket_id = ?
      `,
      [ticketId]
    );
    return result;
  },

  // 5. Admin: list all tickets (isDeleted = 0)
  async findAll() {
    const [rows] = await pool.query(
      `
      SELECT
        ticket_id,
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number,
        booked_at
      FROM Ticket
      WHERE isDeleted = 0
      ORDER BY booked_at DESC
      `
    );
    return rows;
  },
};
