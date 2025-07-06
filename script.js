// FINAL script.js for WayTogether

// Tabs
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");
tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabPanes.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-tab");
        document.getElementById(target === "map" ? "map-tab" : target).classList.add("active");
        if (target === "map") setTimeout(() => map.invalidateSize(), 200);
    });
});

// Map
let map = L.map('map').setView([10.8505, 76.2711], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const markerGroup = L.layerGroup().addTo(map);

// Utility
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Search (map tab)
document.getElementById("mapSearchBtn").addEventListener("click", async () => {
    const query = document.getElementById("mapSearchInput").value.trim();
    if (!query) return;
    const coordsList = await getAllCoordinates(query);
    if (coordsList.length === 0) return alert("No places found.");

    const results = await Promise.all(coordsList.slice(0, 5).map(async ([lat, lon]) => {
        const count = await countNearbyAmenities(lat, lon);
        return { lat, lon, count };
    }));

    results.sort((a, b) => b.count - a.count);
    const best = results.slice(0, 2);

    markerGroup.clearLayers();
    for (let res of best) {
        const { lat, lon, count } = res;
        map.setView([lat, lon], 14);
        L.marker([lat, lon]).addTo(markerGroup).bindPopup(`📍 <b>${query}</b><br>Amenities nearby: ${count}`);
        await fetchNearbyPlaces(lat, lon);
        verdictMessage(count);
    }
});

// Use my location
document.getElementById("locateMeBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        map.setView([lat, lon], 15);
        L.marker([lat, lon]).addTo(markerGroup).bindPopup("📍 You are here").openPopup();
        await fetchNearbyPlaces(lat, lon);
    }, () => alert("Could not get location"));
});

// Get multiple coords
async function getAllCoordinates(query) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.map(loc => [parseFloat(loc.lat), parseFloat(loc.lon)]);
}

// Count of important places
async function countNearbyAmenities(lat, lon, radius = 1000) {
    const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="toilets"](around:${radius},${lat},${lon});
          node["tourism"="hotel"](around:${radius},${lat},${lon});
        );
        out body;
    `;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
    });
    const data = await res.json();
    return data.elements.length;
}

// Display amenities
async function fetchNearbyPlaces(lat, lon, radius = 1000) {
    const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="toilets"](around:${radius},${lat},${lon});
          node["tourism"="hotel"](around:${radius},${lat},${lon});
        );
        out body;
    `;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
    });
    const data = await res.json();

    markerGroup.clearLayers();
    document.getElementById("placesList").innerHTML = "";
    document.getElementById("quickResultsList").innerHTML = "";

    data.elements.forEach(({ lat: plat, lon: plon, tags }) => {
        const name = tags.name || "Unnamed";
        const type = tags.amenity || tags.tourism || "unknown";
        const emoji = type === "hospital" ? "🏥" : type === "toilets" ? "🚻" : type === "hotel" ? "🏨" : "📍";
        const distance = haversine(lat, lon, plat, plon).toFixed(2);

        L.marker([plat, plon])
            .addTo(markerGroup)
            .bindPopup(`${emoji} <b>${name}</b><br>${type}<br>${distance} km away`);

        const card = document.createElement("div");
        card.className = "place-card";
        card.innerHTML = `
            <h4>${emoji} ${name}</h4>
            <p>${type}</p>
            <p>${distance} km away</p>
        `;
        document.getElementById("placesList").appendChild(card);
        document.getElementById("quickResultsList").appendChild(card.cloneNode(true));
    });
}

function verdictMessage(count) {
    const msg = document.createElement("div");
    msg.className = "verdict-message";
    msg.innerHTML = count >= 3
        ? "✅ <strong>Friendly:</strong> This place has nearby hospitals, toilets, and hotels."
        : "⚠️ <strong>Warning:</strong> This place may lack key amenities.";
    document.querySelector(".map-container")?.prepend(msg);
    setTimeout(() => msg.remove(), 6000);
}
