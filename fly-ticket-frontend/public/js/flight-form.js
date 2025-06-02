onReady(async () => {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const flightId = params.get("flightId");
  const formTitle = document.getElementById("formTitle");

  // Load cities into dropdowns
  await loadCities();
  const fromSelect = document.getElementById("fromCity");
  const toSelect = document.getElementById("toCity");

  Object.entries(cityMap).forEach(([id, name]) => {
    const opt1 = document.createElement("option");
    opt1.value = id;
    opt1.textContent = name;
    fromSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = id;
    opt2.textContent = name;
    toSelect.appendChild(opt2);
  });

  // 2) “Logout” button behavior
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwt");
    window.location.href = "admin-login.html";
  });

  // If flightId exists: edit mode
  if (flightId) {
    formTitle.textContent = "Edit Flight";

    try {
      const flight = await fetchJSON(`/api/flights/${flightId}`);
      fromSelect.value = flight.from_city;
      toSelect.value = flight.to_city;
      // datetime-local input format: "YYYY-MM-DDThh:mm"
      document.getElementById("departureTime").value =
        flight.departure_time.substring(0, 16);
      document.getElementById("arrivalTime").value =
        flight.arrival_time.substring(0, 16);
      document.getElementById("price").value = flight.price;
      document.getElementById("seatsTotal").value = flight.seats_total;
      document.getElementById("seatsAvailable").value = flight.seats_available;
    } catch (err) {
      console.error(err);
      alert("Error loading flight information.");
      window.location.href = "admin-dashboard.html";
      return;
    }
  } else {
    formTitle.textContent = "Add New Flight";
  }

  // Form submission
  document
    .getElementById("flightForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const from_city = fromSelect.value;
      const to_city = toSelect.value;
      const departureVal = document.getElementById("departureTime").value; // "YYYY-MM-DDThh:mm"
      const arrivalVal = document.getElementById("arrivalTime").value;
      const price = parseFloat(document.getElementById("price").value);
      const seats_total = parseInt(
        document.getElementById("seatsTotal").value,
        10
      );
      const seats_available = parseInt(
        document.getElementById("seatsAvailable").value,
        10
      );

      if (
        !from_city ||
        !to_city ||
        !departureVal ||
        !arrivalVal ||
        isNaN(price) ||
        isNaN(seats_total) ||
        isNaN(seats_available)
      ) {
        alert("Please fill in all fields correctly.");
        return;
      }

      // Convert "YYYY-MM-DDThh:mm" to "YYYY-MM-DD hh:mm:00" format
      function toSQLDateTime(dtLocal) {
        return dtLocal.replace("T", " ") + ":00";
      }
      const departure_time = toSQLDateTime(departureVal);
      const arrival_time = toSQLDateTime(arrivalVal);

      const data = {
        from_city,
        to_city,
        departure_time,
        arrival_time,
        price,
        seats_total,
        seats_available,
      };

      try {
        if (flightId) {
          // Update
          await fetchJSON(`/api/flights/${flightId}`, {
            method: "PUT",
            body: JSON.stringify(data),
          });
          alert("Flight updated successfully.");
        } else {
          // Add new
          await fetchJSON("/api/flights", {
            method: "POST",
            body: JSON.stringify(data),
          });
          alert("New flight added successfully.");
        }
        window.location.href = "admin-dashboard.html";
      } catch (err) {
        alert("Error: " + err.message);
      }
    });
});
