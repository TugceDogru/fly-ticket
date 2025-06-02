onReady(async () => {
  try {
    await loadCities();
    const params = new URLSearchParams(window.location.search);
    const flightId = params.get("flightId");
    if (!flightId) {
      alert("Flight ID not found.");
      window.location.href = "index.html";
      return;
    }

    // Fetch flight details
    const flight = await fetchJSON(`/api/flights/${flightId}`);
    const infoDiv = document.getElementById("flightInfo");
    infoDiv.innerHTML = `
          <p><strong>Flight ID:</strong> ${flight.flight_id}</p>
          <p><strong>From:</strong> ${cityMap[flight.from_city]}</p>
          <p><strong>To:</strong> ${cityMap[flight.to_city]}</p>
          <p><strong>Departure:</strong> ${new Date(
            flight.departure_time
          ).toLocaleString()}</p>
          <p><strong>Arrival:</strong> ${new Date(
            flight.arrival_time
          ).toLocaleString()}</p>
          <p><strong>Price:</strong> ₺${flight.price.toFixed(2)}</p>
          <p><strong>Seats Available:</strong> ${flight.seats_available}</p>
        `;

    // Booking form submission
    document
      .getElementById("bookingForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const passenger_name = document
          .getElementById("passengerName")
          .value.trim();
        const passenger_surname = document
          .getElementById("passengerSurname")
          .value.trim();
        const passenger_email = document
          .getElementById("passengerEmail")
          .value.trim();
        const seat_number =
          document.getElementById("seatNumber").value.trim() || null;

        if (!passenger_name || !passenger_surname || !passenger_email) {
          alert("Please fill in first name, last name, and email.");
          return;
        }

        try {
          const res = await fetchJSON("/api/tickets", {
            method: "POST",
            body: JSON.stringify({
              passenger_name,
              passenger_surname,
              passenger_email,
              flight_id: flightId,
              seat_number,
            }),
          });
          const ticketId = res.ticket_id;
          window.location.href = `booking-confirmation.html?ticketId=${ticketId}`;
        } catch (err) {
          alert("Error during booking: " + err.message);
        }
      });
  } catch (err) {
    console.error(err);
    alert("Error fetching flight information.");
    window.location.href = "index.html";
  }
});
