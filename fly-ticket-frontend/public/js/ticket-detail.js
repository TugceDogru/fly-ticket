onReady(async () => {
  // 1) Load city list (populate cityMap)
  await loadCities();

  const ticketQueryInput = document.getElementById("ticketQueryInput");
  const lookupBtn = document.getElementById("lookupBtn");
  const detailContainer = document.getElementById("ticketDetailContainer");

  lookupBtn.addEventListener("click", async () => {
    const query = ticketQueryInput.value.trim();
    if (!query) {
      alert("Please enter a Ticket ID or Email.");
      return;
    }

    detailContainer.innerHTML = "<p>Loading…</p>";

    try {
      // 2) GET /api/tickets/:query → if query is ID, returns single object; if email, returns an array
      const res = await fetch(`/api/tickets/${encodeURIComponent(query)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ticket not found.");
      }
      const data = await res.json();

      detailContainer.innerHTML = ""; // clear previous content

      // 3) Check the data type: if it's an array, it’s an email query result
      if (Array.isArray(data)) {
        if (data.length === 0) {
          detailContainer.innerHTML = "<p>No tickets found for this email.</p>";
          return;
        }
        // For each ticket, display details in a separate section
        for (let ticket of data) {
          await renderSingleTicket(ticket);
        }
      } else {
        // Single object → ID query
        await renderSingleTicket(data);
      }
    } catch (err) {
      console.error(err);
      detailContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  });

  // Helper function to display ticket + flight information:
  async function renderSingleTicket(ticket) {
    try {
      // 4) Fetch the flight:
      const flight = await fetchJSON(`/api/flights/${ticket.flight_id}`);

      // 5) Determine 'From' and 'To' names using cityMap:
      const fromCityName = cityMap[flight.from_city] || flight.from_city;
      const toCityName = cityMap[flight.to_city] || flight.to_city;

      // 6) Create a container div and populate it:
      const wrapper = document.createElement("div");
      wrapper.className = "ticket-block";
      wrapper.innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Passenger:</strong> ${ticket.passenger_name} ${
        ticket.passenger_surname
      }</p>
            <p><strong>Email:</strong> ${ticket.passenger_email}</p>
            <p><strong>Seat Number:</strong> ${
              ticket.seat_number || "Not specified"
            }</p>
            <p><strong>Booked At:</strong> ${new Date(
              ticket.booked_at
            ).toLocaleString()}</p>
            <hr>
            <p><strong>Flight ID:</strong> ${flight.flight_id}</p>
            <p><strong>From:</strong> ${fromCityName}</p>
            <p><strong>To:</strong> ${toCityName}</p>
            <p><strong>Departure:</strong> ${new Date(
              flight.departure_time
            ).toLocaleString()}</p>
            <p><strong>Arrival:</strong> ${new Date(
              flight.arrival_time
            ).toLocaleString()}</p>
            <p><strong>Price:</strong> ₺${parseFloat(flight.price).toFixed(
              2
            )}</p>
            <p><strong>Seats Available:</strong> ${flight.seats_available}</p>
            <button class="cancelTicketBtn" data-id="${ticket.ticket_id}">
              Cancel Reservation
            </button>
            <hr style="margin-top:20px;" />
          `;
      detailContainer.appendChild(wrapper);

      // 7) Listen for 'Cancel Reservation' button:
      wrapper
        .querySelector(".cancelTicketBtn")
        .addEventListener("click", async () => {
          const ticketId = ticket.ticket_id;
          if (!confirm("Are you sure you want to cancel this ticket?")) return;

          try {
            const res2 = await fetch(`/api/tickets/${ticketId}`, {
              method: "DELETE",
            });
            if (!res2.ok) {
              const data2 = await res2.json();
              throw new Error(data2.error || "Error during cancellation.");
            }
            alert("Ticket canceled successfully.");
            // Remove the canceled ticket from the UI:
            wrapper.remove();
          } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
          }
        });
    } catch (err) {
      console.error(err);
      // If fetching flight details fails, still display ticket, but show error for flight details:
      const wrapper = document.createElement("div");
      wrapper.className = "ticket-block";
      wrapper.innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Passenger:</strong> ${ticket.passenger_name} ${
        ticket.passenger_surname
      }</p>
            <p><strong>Email:</strong> ${ticket.passenger_email}</p>
            <p><strong>Seat Number:</strong> ${
              ticket.seat_number || "Not specified"
            }</p>
            <p><strong>Booked At:</strong> ${new Date(
              ticket.booked_at
            ).toLocaleString()}</p>
            <hr>
            <p style="color:red;">Error loading flight details.</p>
            <button class="cancelTicketBtn" data-id="${ticket.ticket_id}">
              Cancel Reservation
            </button>
            <hr style="margin-top:20px;" />
          `;
      detailContainer.appendChild(wrapper);
      wrapper
        .querySelector(".cancelTicketBtn")
        .addEventListener("click", async () => {
          const ticketId = ticket.ticket_id;
          if (!confirm("Are you sure you want to cancel this ticket?")) return;

          try {
            const res2 = await fetch(`/api/tickets/${ticketId}`, {
              method: "DELETE",
            });
            if (!res2.ok) {
              const data2 = await res2.json();
              throw new Error(data2.error || "Error during cancellation.");
            }
            alert("Ticket canceled successfully.");
            wrapper.remove();
          } catch (err2) {
            console.error(err2);
            alert("Error: " + err2.message);
          }
        });
    }
  }
});
