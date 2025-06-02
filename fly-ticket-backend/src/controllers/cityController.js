import { City } from "../models/City.js";

export async function listCities(req, res, next) {
  try {
    const cities = await City.findAll();
    res.json(cities);
  } catch (err) {
    next(err);
  }
}
