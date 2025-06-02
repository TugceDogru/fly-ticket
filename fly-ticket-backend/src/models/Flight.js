import { pool } from "../config/db.js";

export const Flight = {
  // 1. List all flights (optional filters: origin, destination, date)
  async findAll({ fromCity, toCity, date }) {
    // Build dynamic WHERE clause:
    const conditions = [`isDeleted = 0`]; // Only non-deleted records
    const params = [];

    if (fromCity) {
      conditions.push("from_city = ?");
      params.push(fromCity);
    }
    if (toCity) {
      conditions.push("to_city = ?");
      params.push(toCity);
    }
    if (date) {
      // Match only the DATE part of departure_time
      conditions.push("DATE(departure_time) = ?");
      params.push(date); // e.g. '2025-06-01'
    }

    const whereClause = "WHERE " + conditions.join(" AND ");

    const sql = `
      SELECT 
        flight_id,
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total,
        seats_available
      FROM Flight
      ${whereClause}
      ORDER BY departure_time ASC
    `;

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // 2. Get a single flight by ID (only if not deleted)
  async findById(flightId) {
    const [rows] = await pool.query(
      `
      SELECT 
        flight_id,
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total,
        seats_available
      FROM Flight
      WHERE flight_id = ? AND isDeleted = 0
      `,
      [flightId]
    );
    return rows[0] || null;
  },

  // 3. Create a new flight
  async create({
    flight_id,
    from_city,
    to_city,
    departure_time,
    arrival_time,
    price,
    seats_total,
    seats_available,
  }) {
    const [result] = await pool.query(
      `
      INSERT INTO Flight
        (flight_id, from_city, to_city, departure_time, arrival_time, price, seats_total, seats_available, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      [
        flight_id,
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total,
        seats_available,
      ]
    );
    return result;
  },

  // 4. Update an existing flight (only if not deleted)
  async update(
    flightId,
    {
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available,
    }
  ) {
    const [result] = await pool.query(
      `
      UPDATE Flight
      SET
        from_city      = ?,
        to_city        = ?,
        departure_time = ?,
        arrival_time   = ?,
        price          = ?,
        seats_total    = ?,
        seats_available= ?
      WHERE flight_id = ? AND isDeleted = 0
      `,
      [
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total,
        seats_available,
        flightId,
      ]
    );
    return result;
  },

  // 5. Delete a flight (logical deletion: isDeleted = 1)
  async remove(flightId) {
    const [result] = await pool.query(
      `
      UPDATE Flight
      SET isDeleted = 1
      WHERE flight_id = ?
      `,
      [flightId]
    );
    return result;
  },
};
