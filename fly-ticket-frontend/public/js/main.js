/**
 * fetchJSON: General fetch wrapper.
 * - Adds Authorization header if missing and token exists in localStorage.
 * - Adds Content-Type if JSON body is provided.
 */
async function fetchJSON(url, options = {}) {
  const token = localStorage.getItem("jwt");
  const headers = options.headers || {};

  if (!headers["Authorization"] && token) {
    headers["Authorization"] = "Bearer " + token;
  }
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Server error");
  }
  return response.json();
}

/**
 * cityMap: Holds { city_id: city_name, ... } structure.
 * loadCities(): Fetches /api/cities and populates cityMap.
 */
const cityMap = {};

async function loadCities() {
  const cities = await fetchJSON("/api/cities");
  cities.forEach((c) => {
    cityMap[c.city_id] = c.city_name;
  });
}

/**
 * onReady: Helper for DOMContentLoaded
 */
function onReady(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

// Expose global functions on window
window.fetchJSON = fetchJSON;
window.loadCities = loadCities;
window.onReady = onReady;
window.cityMap = cityMap;
