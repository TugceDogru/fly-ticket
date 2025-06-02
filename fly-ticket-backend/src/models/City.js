import { pool } from "../config/db.js";

export const City = {
  // fetch all cities
  async findAll() {
    const [rows] = await pool.query(
      "SELECT city_id, city_name FROM City ORDER BY city_name"
    );
    return rows;
  },

  // fetch a single city by its ID
  async findById(cityId) {
    const [rows] = await pool.query(
      "SELECT city_id, city_name FROM City WHERE city_id = ?",
      [cityId]
    );
    return rows[0] || null;
  },

  // create a new city
  async create({ city_id, city_name }) {
    const [result] = await pool.query(
      "INSERT INTO City (city_id, city_name) VALUES (?, ?)",
      [city_id, city_name]
    );
    return result;
  },

  // (optional) delete a city
  async remove(cityId) {
    const [result] = await pool.query("DELETE FROM City WHERE city_id = ?", [
      cityId,
    ]);
    return result;
  },
};
