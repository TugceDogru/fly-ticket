onReady(async () => {
  try {
    // 1) Load the city list so that cityMap is initialized
    await loadCities();
    console.log("loadCities() completed, cityMap:", cityMap);

    // 2) Retrieve ticketId from the URL
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get("ticketId");
    if (!ticketId) {
      alert("Ticket ID not found.");
      window.location.href = "index.html";
      return;
    }
    console.log(" Ticket ID:", ticketId);

    // 3) Fetch ticket details (corrected: "/api/tickets/${ticketId}")
    const ticket = await fetchJSON(
      `/api/tickets/${encodeURIComponent(ticketId)}`
    );
    console.log("Returned ticket object:", ticket);
    if (!ticket || !ticket.ticket_id) {
      throw new Error(
        "Failed to retrieve a valid ticket detail from the server."
      );
    }

    // 4) Fetch flight details
    const flight = await fetchJSON(
      `/api/flights/${encodeURIComponent(ticket.flight_id)}`
    );
    console.log("Returned flight object:", flight);
    if (!flight || !flight.flight_id) {
      throw new Error(
        "Failed to retrieve a valid flight detail from the server."
      );
    }

    // 5) Render to screen
    const div = document.getElementById("confirmationInfo");
    if (!div) {
      throw new Error("Element #confirmationInfo not found on page.");
    }

    // If booked_at exists, format it; otherwise display “—”
    const bookedAtText = ticket.booked_at
      ? new Date(ticket.booked_at).toLocaleString()
      : "—";

    div.innerHTML = `
          <p><strong>Reservation Successful!</strong></p>
          <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
          <p><strong>Passenger:</strong> ${ticket.passenger_name} ${
      ticket.passenger_surname
    }</p>
          <p><strong>Email:</strong> ${ticket.passenger_email}</p>
          <p><strong>Seat Number:</strong> ${
            ticket.seat_number || "Not Specified"
          }</p>
          <hr>
          <p><strong>Flight Details:</strong></p>
          <p><strong>From:</strong> ${
            cityMap[flight.from_city] || flight.from_city
          }</p>
          <p><strong>To:</strong> ${
            cityMap[flight.to_city] || flight.to_city
          }</p>
          <p><strong>Departure:</strong> ${new Date(
            flight.departure_time
          ).toLocaleString()}</p>
          <p><strong>Arrival:</strong> ${new Date(
            flight.arrival_time
          ).toLocaleString()}</p>
          <p><strong>Booked At:</strong> ${bookedAtText}</p>
        `;

    // 6) "Return to Home" button
    const goHomeBtn = document.getElementById("goHome");
    if (!goHomeBtn) {
      throw new Error("Element #goHome not found on page.");
    }
    goHomeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  } catch (err) {
    console.error("Error in confirmation.js:", err);
    alert("Error retrieving reservation information: " + (err.message || ""));
    window.location.href = "index.html";
  }
});
