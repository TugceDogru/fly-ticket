// public/js/admin-dashboard.js

onReady(async () => {
  // 1) Check JWT (token) from localStorage
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  // 2) “Logout” button behavior
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwt");
    window.location.href = "admin-login.html";
  });

  // 3) “Add New Flight” button behavior
  document.getElementById("addFlightBtn").addEventListener("click", () => {
    window.location.href = "flight-form.html";
  });

  // 4) All Tickets button (toggle show/hide)
  const viewTicketsBtn = document.getElementById("viewTicketsBtn");
  const ticketsSection = document.getElementById("ticketsSection");
  let ticketsLoaded = false; // Just for the first time fetch

  viewTicketsBtn.addEventListener("click", async () => {
    // If the section is currently visible: close (hide tickets)
    if (ticketsSection.style.display === "block") {
      ticketsSection.style.display = "none";
      viewTicketsBtn.textContent = "All Tickets";
      return;
    }

    // If the section is hidden: first loadCities(), then fetch+render, then show
    try {
      // If it is the first time you will load it, just fetch and render.
      if (!ticketsLoaded) {
        // 4.a) Pull all tickets from server
        const res = await fetch("/api/tickets", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error loading tickets.");
        }
        const tickets = await res.json();
        renderTicketsTable(tickets);
        ticketsLoaded = true;
      }
      // 4.b) Make section visible
      ticketsSection.style.display = "block";
      viewTicketsBtn.textContent = "Hide Tickets";
    } catch (err) {
      console.error(err);
      alert("Error loading tickets: " + err.message);
    }
  });

  // 5) “Search Tickets” button behavior
  document
    .getElementById("ticketSearchBtn")
    .addEventListener("click", async () => {
      const query = document.getElementById("ticketQueryInput").value.trim();
      if (!query) {
        alert("Please enter a Ticket ID or Email to search.");
        return;
      }
      try {
        const res = await fetch(`/api/tickets/${encodeURIComponent(query)}`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error searching tickets.");
        }
        const data = await res.json();
        // If single ticket object, wrap in array for rendering consistency
        const tickets = Array.isArray(data) ? data : [data];
        renderSearchResults(tickets);
      } catch (err) {
        console.error(err);
        alert("Error searching tickets: " + err.message);
      }
    });

  // 6) Load city map if needed (not strictly needed for ticket display)
  await loadCities();

  // 7) Fetch flight list and populate flights table
  try {
    const flights = await fetchJSON("/api/flights");
    renderFlightsTable(flights);
  } catch (err) {
    console.error(err);
    alert("Error loading flight list.");
  }

  /**
   * Populate Flights Table
   */
  function renderFlightsTable(flights) {
    const tbody = document.querySelector("#flightsTable tbody");
    tbody.innerHTML = "";

    flights.forEach((f) => {
      const priceNumber = parseFloat(f.price);
      const displayPrice = isNaN(priceNumber) ? "0.00" : priceNumber.toFixed(2);

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${f.flight_id}</td>
          <td>${cityMap[f.from_city] || f.from_city}</td>
          <td>${cityMap[f.to_city] || f.to_city}</td>
          <td>${new Date(f.departure_time).toLocaleString()}</td>
          <td>${new Date(f.arrival_time).toLocaleString()}</td>
          <td>₺${displayPrice}</td>
          <td>${f.seats_total}</td>
          <td>${f.seats_available}</td>
          <td>
            <button class="editFlight" data-id="${f.flight_id}">Edit</button>
            <button class="deleteFlight" data-id="${
              f.flight_id
            }">Delete</button>
          </td>
        `;
      tbody.appendChild(tr);
    });

    // “Edit” buttons
    document.querySelectorAll(".editFlight").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        window.location.href = `flight-form.html?flightId=${id}`;
      });
    });

    // “Delete” buttons
    document.querySelectorAll(".deleteFlight").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Are you sure you want to delete this flight?")) return;

        try {
          await fetchJSON(`/api/flights/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          });
          window.location.reload();
        } catch (err) {
          alert("Error deleting flight: " + err.message);
        }
      });
    });
  }

  /**
   * Populate All Tickets Table
   */
  function renderTicketsTable(tickets) {
    const tbody = document.querySelector("#ticketsTable tbody");
    tbody.innerHTML = "";

    tickets.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${t.ticket_id}</td>
          <td>${t.passenger_name} ${t.passenger_surname}</td>
          <td>${t.passenger_email}</td>
          <td>${t.flight_id}</td>
          <td>${t.seat_number || "—"}</td>
          <td>${new Date(t.booked_at).toLocaleString()}</td>
          <td>
            <button class="deleteTicket" data-id="${
              t.ticket_id
            }">Cancel</button>
          </td>
        `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".deleteTicket").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Are you sure you want to cancel this ticket?")) return;

        try {
          await fetch(`/api/tickets/${id}`, {
            method: "DELETE",
          });
          btn.closest("tr").remove();
        } catch (err) {
          alert("Error deleting ticket: " + err.message);
        }
      });
    });
  }

  /**
   * Populate Search Results Section
   */
  function renderSearchResults(tickets) {
    const container = document.getElementById("ticketSearchResult");
    container.innerHTML = "";

    if (!tickets.length) {
      container.textContent = "No tickets found for that query.";
      return;
    }

    // Build a small table for the search results
    const table = document.createElement("table");
    table.border = "1";
    table.innerHTML = `
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Passenger Name</th>
            <th>Passenger Email</th>
            <th>Flight ID</th>
            <th>Seat Number</th>
            <th>Booked At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
    const tbody = table.querySelector("tbody");

    tickets.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${t.ticket_id}</td>
          <td>${t.passenger_name} ${t.passenger_surname}</td>
          <td>${t.passenger_email}</td>
          <td>${t.flight_id}</td>
          <td>${t.seat_number || "—"}</td>
          <td>${new Date(t.booked_at).toLocaleString()}</td>
          <td>
            <button class="deleteTicket" data-id="${
              t.ticket_id
            }">Cancel</button>
          </td>
        `;
      tbody.appendChild(tr);
    });

    container.appendChild(table);

    // Wire up “Cancel” buttons in search results
    container.querySelectorAll(".deleteTicket").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Are you sure you want to cancel this ticket?")) return;

        try {
          await fetch(`/api/tickets/${id}`, {
            method: "DELETE",
          });
          btn.closest("tr").remove();
        } catch (err) {
          alert("Error deleting ticket: " + err.message);
        }
      });
    });
  }
});
