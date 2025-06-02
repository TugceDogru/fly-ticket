-- (1) Create the database if you haven’t already:
CREATE DATABASE IF NOT EXISTS flyticket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flyticket_db;

-- (2) Create the City table schema:
CREATE TABLE IF NOT EXISTS City (
  `city_id`   VARCHAR(36)      NOT NULL,
  `city_name` VARCHAR(100)     NOT NULL,
  UNIQUE KEY (`city_name`),
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS Flight (
  flight_id       VARCHAR(36)      PRIMARY KEY,
  from_city       VARCHAR(36)      NOT NULL,
  to_city         VARCHAR(36)      NOT NULL,
  departure_time  DATETIME         NOT NULL,
  arrival_time    DATETIME         NOT NULL,
  price           DECIMAL(10,2)    NOT NULL,
  seats_total     INT              NOT NULL,
  seats_available INT              NOT NULL,

  CONSTRAINT fk_flight_from_city
    FOREIGN KEY (from_city)
    REFERENCES City (city_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_flight_to_city
    FOREIGN KEY (to_city)
    REFERENCES City (city_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- (4) Create the Ticket table:
CREATE TABLE IF NOT EXISTS Ticket (
  ticket_id         VARCHAR(36)      PRIMARY KEY,
  passenger_name    VARCHAR(100)     NOT NULL,
  passenger_surname VARCHAR(100)     NOT NULL,
  passenger_email   VARCHAR(255)     NOT NULL,
  flight_id         VARCHAR(36)      NOT NULL,
  seat_number       VARCHAR(10)      NULL,
  booked_at         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ticket_flight
    FOREIGN KEY (flight_id)
    REFERENCES Flight (flight_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (5) Create the Admin table:
CREATE TABLE IF NOT EXISTS Admin (
  username VARCHAR(50)      PRIMARY KEY,
  password VARCHAR(255)     NOT NULL        -- store bcrypt‐hashed password
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

