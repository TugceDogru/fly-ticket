onReady(async () => {
  // Variables declared outside try block for use throughout the file
  let flightId;
  let bookingForm;
  let bookingMessage;
  let detailContainer;

  try {
    // 1) Load city list (initialize cityMap)
    await loadCities();

    // 2) Get flightId parameter from URL
    const params = new URLSearchParams(window.location.search);
    flightId = params.get("flightId");

    // 3) Select required HTML elements
    detailContainer = document.getElementById("flightDetailContainer");
    bookingForm = document.getElementById("bookingForm");
    bookingMessage = document.getElementById("bookingMessage");

    // 4) If no flightId, display error message and exit
    if (!flightId) {
      detailContainer.innerHTML = "<p>Flight ID not found.</p>";
      return;
    }

    // 5) Fetch flight details
    const res = await fetch(`/api/flights/${encodeURIComponent(flightId)}`);
    if (!res.ok) {
      throw new Error("Flight not found.");
    }
    const f = await res.json();

    // 6) Render flight information, using cityMap for city names
    detailContainer.innerHTML = `
        <h2>Flight Details</h2>
        <p><strong>Flight ID:</strong> ${f.flight_id}</p>
        <p><strong>From:</strong> ${cityMap[f.from_city] || f.from_city}</p>
        <p><strong>To:</strong> ${cityMap[f.to_city] || f.to_city}</p>
        <p><strong>Departure:</strong> ${new Date(
          f.departure_time
        ).toLocaleString()}</p>
        <p><strong>Arrival:</strong> ${new Date(
          f.arrival_time
        ).toLocaleString()}</p>
        <p><strong>Price:</strong> ₺${parseFloat(f.price).toFixed(2)}</p>
        <p><strong>Total Seats:</strong> ${f.seats_total}</p>
        <p><strong>Available Seats:</strong> ${f.seats_available}</p>
        <hr>
        <h3>Make a Reservation</h3>
        <!-- Booking form should already exist in HTML -->
      `;
  } catch (err) {
    console.error("flight-detail.js error:", err);
    if (detailContainer) {
      detailContainer.innerHTML = `<p style="color:red;">Error loading flight details.</p>`;
    }
    return;
  }

  // Now that flightId and bookingForm are defined, add the form handler
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
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
      const seat_number = document.getElementById("seatNumber").value.trim();

      // Basic validation
      if (!passenger_name || !passenger_surname || !passenger_email) {
        bookingMessage.style.color = "red";
        bookingMessage.textContent =
          "Please enter first name, last name, and email.";
        return;
      }

      try {
        // 7) Send reservation request
        const payload = {
          passenger_name,
          passenger_surname,
          passenger_email,
          flight_id: flightId, // flight_id field is now available
          seat_number: seat_number || null,
        };

        const res2 = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data2 = await res2.json();
        if (!res2.ok) {
          throw new Error(data2.error || "Reservation could not be completed.");
        }

        // 8) Display success message and redirect to confirmation page
        bookingMessage.style.color = "green";
        bookingMessage.textContent =
          "Reservation successful! Ticket ID: " + data2.ticket_id;

        setTimeout(() => {
          window.location.href = `booking-confirmation.html?ticketId=${data2.ticket_id}`;
        }, 2000);
      } catch (err) {
        console.error("Error during reservation:", err);
        bookingMessage.style.color = "red";
        bookingMessage.textContent = "Error during reservation: " + err.message;
      }
    });
  }
});
