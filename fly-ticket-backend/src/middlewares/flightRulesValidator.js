import { pool } from "../config/db.js";

export async function validateFlightRules(req, res, next) {
  try {
    const {
      flight_id, // Present when updating an existing flight
      from_city,
      to_city,
      departure_time, // ISO string or MySQL-compatible DATETIME
      arrival_time, // ISO string or MySQL-compatible DATETIME
    } = req.body;

    // Rule A: Prevent two flights from the same origin departing within the same hour on the same date.
    {
      const sqlA = `
        SELECT COUNT(*) AS count
        FROM Flight
        WHERE from_city = ?
          AND DATE(departure_time) = DATE(?)
          AND HOUR(departure_time) = HOUR(?)
          ${flight_id ? "AND flight_id <> ?" : ""}
      `;
      const paramsA = flight_id
        ? [from_city, departure_time, departure_time, flight_id]
        : [from_city, departure_time, departure_time];

      const [rowsA] = await pool.query(sqlA, paramsA);
      if (rowsA[0].count > 0) {
        return res.status(400).json({
          error:
            "A flight is already scheduled to depart from this city at the same hour on that date.",
        });
      }
    }

    // Rule B: Prevent two flights from arriving at the same destination at the exact same time.
    {
      const sqlB = `
        SELECT COUNT(*) AS count
        FROM Flight
        WHERE to_city = ?
          AND arrival_time = ?
          ${flight_id ? "AND flight_id <> ?" : ""}
      `;
      const paramsB = flight_id
        ? [to_city, arrival_time, flight_id]
        : [to_city, arrival_time];

      const [rowsB] = await pool.query(sqlB, paramsB);
      if (rowsB[0].count > 0) {
        return res.status(400).json({
          error:
            "A flight is already scheduled to arrive at this city at the same exact time.",
        });
      }
    }

    // Both validations passed
    next();
  } catch (err) {
    next(err);
  }
}
