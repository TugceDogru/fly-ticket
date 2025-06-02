import "dotenv/config.js"; // Load environment variables (so pool picks up DB configuration)
import { pool } from "../config/db.js"; // MySQL connection pool
import { v4 as uuidv4 } from "uuid"; // Generate UUIDs for each city
import { City } from "../models/City.js";

// 81 provinces of Turkey:
const cityNames = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkâri",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Düzce",
];

async function seedCities() {
  try {
    console.log("Starting city seeding...");

    // 1) Ensure the City table exists (in case the schema hasn’t been created):
    await pool.query(`
      CREATE TABLE IF NOT EXISTS City (
        city_id   VARCHAR(36)    NOT NULL,
        city_name VARCHAR(100)   NOT NULL,
        UNIQUE KEY (city_name),
        PRIMARY KEY (city_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2) Remove existing rows to prevent duplicates:
    await pool.query("DELETE FROM City;");

    // 3) Insert each city with a new UUID:
    for (const name of cityNames) {
      const id = uuidv4();
      await City.create({ city_id: id, city_name: name });
      console.log(`Inserted "${name}" with city_id = ${id}`);
    }

    console.log("All 81 cities have been seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error during city seeding:", err);
    process.exit(1);
  }
}

// Execute the seeder:
seedCities();
