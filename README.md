# FlyTicket

A full-stack flight booking application featuring a Node.js/Express backend with MySQL and a vanilla HTML/CSS/JavaScript frontend. Users can search for flights, make bookings (tickets), and view or cancel reservations. Administrators can manage flights and view all ticket reservations.

---

## Table of Contents

* [Features](#features)
* [Technologies Used](#technologies-used)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)

  * [1. Clone the Repository](#1-clone-the-repository)
  * [2. Environment Variables](#2-environment-variables)
  * [3. Install Dependencies](#3-install-dependencies)
  * [4. Set Up the Database](#4-set-up-the-database)
  * [5. Run the Backend & Frontend](#5-run-the-backend--frontend)
* [Admin Login Credentials](#admin-login-credentials)
* [API Endpoints](#api-endpoints)

  * [Authentication (Admin)](#authentication-admin)
  * [Cities](#cities)
  * [Flights](#flights)
  * [Tickets](#tickets)
* [Frontend Pages](#frontend-pages)
* [License](#license)

---

## Features

* **Public (User) Functionality**

  * Search flights by origin, destination, and/or date
  * View flight details (departure/arrival times, price, seats available)
  * Book a ticket (choose seat number if available)
  * View booking confirmation with flight details
  * Search or look up a ticket by Ticket ID or passenger email
  * Cancel (logically delete) a ticket, which restores a seat to the flight

* **Admin Functionality**

  * Register a new admin account (username + password)
  * Login to obtain a JWT for protected operations
  * Create, edit, and logically delete flights
  * View a table of all flights
  * View all tickets (reservations) in one table
  * Search tickets by Ticket ID or passenger email
  * Cancel any ticket (logical delete) and restore the seat to its flight

* **Business Rules / Validation**

  1. No two flights can depart from the **same city** at the **same hour** on the **same date**.
  2. No two flights can arrive at the **same city** at the **exact same arrival time**.
  3. On a single flight, no two tickets may use the **same seat number**.
  4. On a single flight, a passenger (combination of name + surname) can only have **one active booking**.

---

## Technologies Used

* **Backend**

  * Node.js (v14 or later)
  * Express.js
  * MySQL / MySQL2 (with connection pooling)
  * bcryptjs (password hashing)
  * jsonwebtoken (JWT-based authentication)
  * dotenv (environment variables)

* **Frontend**

  * HTML5 / CSS3
  * Vanilla JavaScript (ES6+)
  * Fetch API for AJAX requests
  * Simple CSS Flexbox for layout

* **Dev Tools / Libraries**

  * nodemon (automatic server restarts during development)
  * uuid (for generating unique IDs)
  * Prettier / ESLint (optional for code formatting & linting)

---

## Prerequisites

* **Node.js** (v14.x or higher) and **npm** installed
* **MySQL** server (v5.7 or higher)
* Basic knowledge of terminal/command-line usage

---

## Getting Started

Follow these steps to set up and run FlyTicket on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flyticket.git
cd flyticket
```

You should now have this structure:

```
flyticket/
├─ fly-ticket-backend/
└─ fly-ticket-frontend/
```

### 2. Environment Variables

Create a `.env` file inside `fly-ticket-backend/` with the following variables:

```ini
# fly-ticket-backend/.env

# MySQL connection (adjust to your setup)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=flyticket_db

# JWT secret (choose a strong, random string)
JWT_SECRET=your_jwt_secret_key

# Server port (default: 5000)
PORT=5000
```

### 3. Install Dependencies

#### Backend

```bash
cd fly-ticket-backend
npm install
```

#### Frontend

*No additional build step is required for the frontend.*
However, you may install a simple HTTP server globally if you want to serve the frontend separately:

```bash
npm install -g serve
```

### 4. Set Up the Database

1. Launch your MySQL client or MySQL Workbench.

2. Create a new database (e.g., `flyticket_db`):

   ```sql
   CREATE DATABASE flyticket_db;
   ```

3. Run the provided `schema.sql` and `data.sql` (if any) scripts (or execute the following tables manually):

   ```sql
   -- Table: City
   CREATE TABLE City (
     city_id   VARCHAR(36) PRIMARY KEY,
     city_name VARCHAR(100) NOT NULL
   );

   -- Table: Flight
   CREATE TABLE Flight (
     flight_id       VARCHAR(36) PRIMARY KEY,
     from_city       VARCHAR(36) NOT NULL,
     to_city         VARCHAR(36) NOT NULL,
     departure_time  DATETIME NOT NULL,
     arrival_time    DATETIME NOT NULL,
     price           DECIMAL(10,2) NOT NULL,
     seats_total     INT NOT NULL,
     seats_available INT NOT NULL,
     isDeleted       TINYINT(1) DEFAULT 0,
     FOREIGN KEY (from_city) REFERENCES City(city_id),
     FOREIGN KEY (to_city)   REFERENCES City(city_id)
   );

   -- Table: Ticket
   CREATE TABLE Ticket (
     ticket_id       VARCHAR(36) PRIMARY KEY,
     passenger_name    VARCHAR(50) NOT NULL,
     passenger_surname VARCHAR(50) NOT NULL,
     passenger_email   VARCHAR(100) NOT NULL,
     flight_id         VARCHAR(36) NOT NULL,
     seat_number       VARCHAR(10),
     booked_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
     isDeleted         TINYINT(1) DEFAULT 0,
     FOREIGN KEY (flight_id) REFERENCES Flight(flight_id)
   );

   -- Table: Admin
   CREATE TABLE Admin (
     username VARCHAR(50) PRIMARY KEY,
     password VARCHAR(100) NOT NULL
   );
   ```

4. (Optional) Insert some initial cities into the `City` table:

   ```sql
   INSERT INTO City (city_id, city_name) VALUES
     ('b0afa95a-89db-42e8-b9f3-b3a0c3627c20','Adana'),
     ('cdd2724a-461f-4474-9892-574a9cf8c9e0','Adıyaman'),
     ('feb2813a-ee4a-4c3e-93b3-f22b989c0fe7','Afyonkarahisar'),
     ('a9ef5e77-93d1-404b-ad38-e9a9866504df','Ağrı'),
     -- (add as many cities as you need)
     ('93123189-0fd1-43a0-8a37-d051d3abf025','Aksaray');
   ```

### 5. Run the Backend & Frontend

#### Backend

```bash
cd fly-ticket-backend
npm run dev
```

* The server starts on `http://localhost:5000`.
* You should see:

  ```
   Server is running on port 5000
   Database connection OK
  ```

#### Frontend

You can serve the `fly-ticket-frontend/public` folder as static files in one of two ways:

1. **Via the Express Backend (integrated)**

   * The backend’s `app.js` already serves the `public` folder from the frontend:

     ```js
     // In fly-ticket-backend/src/app.js
     app.use(
       express.static(path.join(__dirname, "../../fly-ticket-frontend/public"))
     );
     app.get("*", (req, res) => {
       res.sendFile(
         path.join(__dirname, "../../fly-ticket-frontend/public/index.html")
       );
     });
     ```
   * Simply navigate to `http://localhost:5000/` in your browser.
   * All frontend routes (`/index.html`, `/flight-detail.html`, `/booking-confirmation.html`, etc.) will be served automatically.

2. **Separate Static Server**
   If you prefer to run frontend independently on a different port (e.g., `http://localhost:3000`):

   ```bash
   cd fly-ticket-frontend/public
   serve -l 3000
   ```

   * Then backend still runs on `http://localhost:5000`.
   * In this case, open `http://localhost:3000/index.html` in your browser.
   * Ensure all `fetch` calls in your JS use the correct full URL for the API (e.g., `fetch("http://localhost:5000/api/flights")`).

---

## Admin Login Credentials

Currently, there is no default admin seed in the database. To create your first admin:

1. **Register a new admin**

   * Send a `POST` request to `/api/admin/register` with JSON body:

     ```json
     {
       "username": "admin",
       "password": "Admin@1234"
     }
     ```
   * If successful, you will get a `201 Created` response:

     ```json
     {
       "message": "Admin registered successfully."
     }
     ```

2. **Log in as admin**

   * Send a `POST` request to `/api/admin/login` with JSON body:

     ```json
     {
       "username": "admin",
       "password": "Admin@1234"
     }
     ```
   * On success, you’ll receive:

     ```json
     {
       "message": "Login successful.",
       "token": "<YOUR_JWT_TOKEN>"
     }
     ```
   * Copy the `token` from the response and store it in your browser’s **Local Storage** under the key `jwt`. The frontend code will automatically attach this token to protected API calls (create/update/delete flights, view all tickets, etc.).

> **Example Credentials**
>
> ```
> Username: admin
> Password: Admin@1234
> ```

---

## API Endpoints

Below is an overview of available endpoints. All protected (admin-only) routes require a valid `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication (Admin)

* **POST** `/api/admin/register`

  * Registers a new admin.
  * Body (JSON):

    ```json
    {
      "username": "admin",
      "password": "Admin@1234"
    }
    ```
  * Response (201):

    ```json
    { "message": "Admin registered successfully." }
    ```

* **POST** `/api/admin/login`

  * Logs in an existing admin.
  * Body (JSON):

    ```json
    {
      "username": "admin",
      "password": "Admin@1234"
    }
    ```
  * Response (200):

    ```json
    { 
      "message": "Login successful.", 
      "token": "<JWT_TOKEN>" 
    }
    ```

### Cities (Public)

* **GET** `/api/cities`

  * Returns a list of all cities.
  * Response (200):

    ```json
    [
      { "city_id": "b0afa95a-89db-42e8-b9f3-b3a0c3627c20", "city_name": "Adana" },
      { "city_id": "cdd2724a-461f-4474-9892-574a9cf8c9e0", "city_name": "Adıyaman" },
      ...
    ]
    ```

### Flights

* **GET** `/api/flights`

  * List all flights (optionally filtered by `fromCity`, `toCity`, `date`).
  * Query parameters (all optional):

    * `fromCity=<city_id>`
    * `toCity=<city_id>`
    * `date=<YYYY-MM-DD>`
  * Response (200):

    ```json
    [
      {
        "flight_id": "e34d8cd6-411e-4b0a-a6b5-93a6c3b71953",
        "from_city": "b0afa95a-89db-42e8-b9f3-b3a0c3627c20",
        "to_city": "cdd2724a-461f-4474-9892-574a9cf8c9e0",
        "departure_time": "2025-06-01T11:03:00.000Z",
        "arrival_time": "2025-06-01T14:03:00.000Z",
        "price": "1000.00",
        "seats_total": 120,
        "seats_available": 117
      },
      ...
    ]
    ```

* **GET** `/api/flights/:id`

  * Retrieve a single flight by its ID.
  * Response (200) if exists, (404) if not found:

    ```json
    {
      "flight_id": "e34d8cd6-411e-4b0a-a6b5-93a6c3b71953",
      "from_city": "b0afa95a-89db-42e8-b9f3-b3a0c3627c20",
      "to_city": "cdd2724a-461f-4474-9892-574a9cf8c9e0",
      "departure_time": "2025-06-01T11:03:00.000Z",
      "arrival_time": "2025-06-01T14:03:00.000Z",
      "price": "1000.00",
      "seats_total": 120,
      "seats_available": 117
    }
    ```

* **POST** `/api/flights` *(Admin-only)*

  * Create a new flight.
  * Request body (JSON):

    ```json
    {
      "from_city": "<city_id>",
      "to_city": "<city_id>",
      "departure_time": "2025-06-01 11:03:00",
      "arrival_time": "2025-06-01 14:03:00",
      "price": 1000.00,
      "seats_total": 120,
      "seats_available": 120
    }
    ```
  * Response (201):

    ```json
    { 
      "message": "Flight created successfully.", 
      "flight_id": "<generated_uuid>" 
    }
    ```

* **PUT** `/api/flights/:id` *(Admin-only)*

  * Update an existing flight.
  * Request body (JSON) same format as POST.
  * Response (200):

    ```json
    { "message": "Flight updated successfully." }
    ```
  * Returns 400 if any business rule is violated (e.g., same-hour departure or same-time arrival).
  * Returns 404 if flight not found.

* **DELETE** `/api/flights/:id` *(Admin-only)*

  * Logically delete a flight (`isDeleted = 1`).
  * Response (200):

    ```json
    { "message": "Flight deleted successfully." }
    ```
  * Returns 404 if flight not found.

### Tickets

* **GET** `/api/tickets` *(Admin-only)*

  * List all tickets (only those with `isDeleted = 0`).
  * Requires a valid JWT in the `Authorization` header.
  * Response (200):

    ```json
    [
      {
        "ticket_id": "4f5af8da-8e92-493c-b944-55cf1f2a0ea0",
        "passenger_name": "Tuğçe",
        "passenger_surname": "Doğru",
        "passenger_email": "tugce.dogru@example.com",
        "flight_id": "e34d8cd6-411e-4b0a-a6b5-93a6c3b71953",
        "seat_number": "A2",
        "booked_at": "2025-06-01T18:30:04.000Z"
      },
      ...
    ]
    ```

* **POST** `/api/tickets` *(Public)*

  * Book a new ticket for a flight.
  * Request body (JSON):

    ```json
    {
      "passenger_name": "Tuğçe",
      "passenger_surname": "Doğru",
      "passenger_email": "tugce.dogru@example.com",
      "flight_id": "e34d8cd6-411e-4b0a-a6b5-93a6c3b71953",
      "seat_number": "A2"             // optional
    }
    ```
  * Business rules:

    1. `seats_available` on that flight must be > 0.
    2. The chosen `seat_number` (if provided) must not already be booked on that flight.
    3. The same passenger name + surname cannot have more than one active booking on the same flight.
  * Response (201):

    ```json
    {
      "message": "Ticket booked successfully.",
      "ticket_id": "<new_ticket_uuid>"
    }
    ```
  * Returns 400 if any rule is violated.

* **GET** `/api/tickets/:query` *(Public)*

  * Query by **Ticket ID** or **Email**:

    * If `:query` contains `"@"`, it is treated as an email and returns an array of tickets.
    * Otherwise, it is treated as a Ticket ID and returns a single ticket object.
  * Examples:

    * `/api/tickets/4f5af8da-8e92-493c-b944-55cf1f2a0ea0` → returns one ticket.
    * `/api/tickets/tugce.dogru@example.com` → returns an array of tickets for that email.
  * Response (200) if found, (404) if not found.

* **DELETE** `/api/tickets/:id` *(Public / Optional Admin-Only)*

  * Logically delete (cancel) a ticket. Increases `seats_available` on the associated flight by +1.
  * Response (200):

    ```json
    { "message": "Ticket deleted successfully." }
    ```
  * Returns 404 if ticket not found.

---

## Frontend Pages

All frontend files reside in:

```
fly-ticket-frontend/public/
```

Use `http://localhost:5000/` (or your static server port) to access them.

1. **`index.html`** – Home / Flight Search

   * Search flights by origin, destination, date.
   * Displays matching flight cards with “Details / Book” button.

2. **`flight-detail.html`** – Flight Detail & Booking Form

   * Fetches flight details by `?flightId=<id>`.
   * Shows flight information (From, To, Departure, Arrival, Price, Seats).
   * Booking form: name, surname, email, optional seat number.
   * On successful booking, shows a confirmation message and redirects to `booking-confirmation.html?ticketId=<id>`.

3. **`booking-confirmation.html`** – Booking Confirmation

   * Fetches ticket details by `?ticketId=<id>`.
   * Displays passenger details, seat number, flight from/to names, departure/arrival times, booking timestamp.
   * “Go Home” button returns to `index.html`.

4. **`ticket-detail.html`** – Ticket Lookup

   * Input: Ticket ID (or later extended to email + ID).
   * On “Getir”, fetches `/api/tickets/:query` (either ID or email).
   * Displays ticket + flight details: From/To city names, departure/arrival times, price, seats available.

5. **`admin-register.html`** – Admin Registration

   * Form: `username`, `password`.
   * POSTs to `/api/admin/register` to create a new admin.
   * On success, redirects to `admin-login.html`.

6. **`admin-login.html`** – Admin Login

   * Form: `username`, `password`.
   * POSTs to `/api/admin/login`, stores returned JWT in `localStorage["jwt"]`.
   * On success, redirect to `admin-dashboard.html`.

7. **`admin-dashboard.html`** – Admin Dashboard

   * Shows two main sections:

     1. **Flight List** – Table of all flights (ID, From, To, Departure, Arrival, Price, Seats Total, Seats Available, Actions).

        * Actions:

          * **Edit** → go to `flight-form.html?flightId=<id>`.
          * **Delete** → DELETE `/api/flights/:id` (requires JWT).
     2. **Ticket Search** – Input box for Ticket ID or Email + “Search” button.

        * Displays matching tickets (ID, Passenger, Email, Flight ID, Seat, Booked At, Cancel button).
        * Cancel button → DELETE `/api/tickets/:id` and removes row from table.
     3. **All Tickets** – Table of all tickets (requires JWT).

        * “All Tickets” button triggers GET `/api/tickets` and displays them in a table.
        * Cancel buttons next to each row.

8. **`flight-form.html`** – Add / Edit Flight (Admin-only)

   * If `?flightId=<id>` in URL, pre-populates fields for editing.
   * Otherwise, adds a new flight.
   * Fields: From City (dropdown), To City (dropdown), Departure Time (`datetime-local`), Arrival Time (`datetime-local`), Price, Seats Total, Seats Available.
   * On submit, POST or PUT to `/api/flights[/:id]` (requires JWT).
   * Displays error alerts if business rules are violated (same-hour departure or same-time arrival).

---

## License

This project is licensed under the MIT License.
Feel free to reuse, modify, or distribute under the same license terms.

---

**Enjoy booking flights with FlyTicket!**
