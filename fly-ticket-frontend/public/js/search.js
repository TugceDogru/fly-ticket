onReady(async () => {
  try {
    // Fetch cities from backend and populate cityMap
    await loadCities();

    const fromSelect = document.getElementById("fromCitySelect");
    const toSelect = document.getElementById("toCitySelect");

    // Populate dropdowns since cityMap is { city_id: city_name }
    Object.entries(cityMap).forEach(([id, name]) => {
      const option1 = document.createElement("option");
      option1.value = id;
      option1.textContent = name;
      fromSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = id;
      option2.textContent = name;
      toSelect.appendChild(option2);
    });

    const searchBtn = document.getElementById("searchBtn");
    const allFlightsBtn = document.getElementById("allFlightsBtn");
    const container = document.getElementById("flightsContainer");

    // When 'All Flights' button is clicked:
    allFlightsBtn.addEventListener("click", async () => {
      try {
        container.innerHTML = "";
        const flights = await fetchJSON("/api/flights");
        if (flights.length === 0) {
          container.textContent = "No flights available at the moment.";
          return;
        }
        flights.forEach((f) => {
          const priceNumber = parseFloat(f.price);
          const displayPrice = isNaN(priceNumber)
            ? "0.00"
            : priceNumber.toFixed(2);

          const card = document.createElement("div");
          card.className = "flight-card";
          card.innerHTML = `
                <p><strong>Flight ID:</strong> ${f.flight_id}</p>
                <p><strong>From:</strong> ${cityMap[f.from_city]}</p>
                <p><strong>To:</strong> ${cityMap[f.to_city]}</p>
                <p><strong>Departure:</strong> ${new Date(
                  f.departure_time
                ).toLocaleString()}</p>
                <p><strong>Arrival:</strong> ${new Date(
                  f.arrival_time
                ).toLocaleString()}</p>
                <p><strong>Price:</strong> ₺${displayPrice}</p>
                <p><strong>Seats Available:</strong> ${f.seats_available}</p>
                <button class="view-detail" data-id="${
                  f.flight_id
                }">View / Book</button>
              `;
          container.appendChild(card);
        });

        // Add click event to 'View / Book' buttons
        container.querySelectorAll(".view-detail").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            window.location.href = `flight-detail.html?flightId=${id}`;
          });
        });
      } catch (err) {
        console.error(err);
        alert("Error loading flights.");
      }
    });

    // When 'Search' button is clicked (optional filtering by date and cities)
    searchBtn.addEventListener("click", async () => {
      const fromCity = fromSelect.value;
      const toCity = toSelect.value;
      const date = document.getElementById("dateInput").value;

      // If no filters are selected, trigger 'All Flights'
      if (!fromCity && !toCity && !date) {
        allFlightsBtn.click();
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (fromCity) params.append("fromCity", fromCity);
      if (toCity) params.append("toCity", toCity);
      if (date) params.append("date", date);

      const url = `/api/flights?${params.toString()}`;

      try {
        container.innerHTML = "";
        const flights = await fetchJSON(url);

        if (flights.length === 0) {
          container.textContent = "No flights found matching these criteria.";
          return;
        }

        flights.forEach((f) => {
          const priceNumber = parseFloat(f.price);
          const displayPrice = isNaN(priceNumber)
            ? "0.00"
            : priceNumber.toFixed(2);

          const card = document.createElement("div");
          card.className = "flight-card";
          card.innerHTML = `
                <p><strong>Flight ID:</strong> ${f.flight_id}</p>
                <p><strong>From:</strong> ${cityMap[f.from_city]}</p>
                <p><strong>To:</strong> ${cityMap[f.to_city]}</p>
                <p><strong>Departure:</strong> ${new Date(
                  f.departure_time
                ).toLocaleString()}</p>
                <p><strong>Arrival:</strong> ${new Date(
                  f.arrival_time
                ).toLocaleString()}</p>
                <p><strong>Price:</strong> ₺${displayPrice}</p>
                <p><strong>Seats Available:</strong> ${f.seats_available}</p>
                <button class="view-detail" data-id="${
                  f.flight_id
                }">View / Book</button>
              `;
          container.appendChild(card);
        });

        // Add click event to 'View / Book' buttons
        container.querySelectorAll(".view-detail").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            window.location.href = `flight-detail.html?flightId=${id}`;
          });
        });
      } catch (err) {
        console.error(err);
        alert("Error loading flights.");
      }
    });
  } catch (err) {
    console.error(err);
    alert("Error loading cities.");
  }
});
