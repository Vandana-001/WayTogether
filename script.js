let places = [];
let map;

// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadPlaces();
    initializeMap();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            if (targetTab === 'map') {
                document.getElementById('map-tab').classList.add('active');
                // Resize map when tab is shown
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                }, 100);
            } else if (targetTab === 'places') {
                document.getElementById('places-tab').classList.add('active');
            } else {
                document.getElementById('explore').classList.add('active');
            }
        });
    });
}

async function loadPlaces() {
    try {
        const res = await fetch('locations.json');
        places = await res.json();
        renderPlaces(places);
        renderQuickResults(places.slice(0, 6)); // Show first 6 in quick results
    } catch (err) {
        console.error("Failed to load locations:", err);
        // Fallback with sample data for demo
        places = [
            {
                name: "Quiet Corner Cafe",
                location: "Downtown",
                type: "Cafe",
                quiet: true,
                low_crowd: true,
                sensory_friendly: true,
                crowd_level: "Low",
                status: "Open",
                weather_warning: "Clear"
            },
            {
                name: "Peaceful Park",
                location: "City Center",
                type: "Park",
                quiet: true,
                low_crowd: false,
                sensory_friendly: true,
                crowd_level: "Medium",
                status: "Open",
                weather_warning: "Sunny"
            },
            {
                name: "Silent Library",
                location: "University Area",
                type: "Library",
                quiet: true,
                low_crowd: true,
                sensory_friendly: true,
                crowd_level: "Very Low",
                status: "Open",
                weather_warning: "Indoor"
            }
        ];
        renderPlaces(places);
        renderQuickResults(places);
    }
}

function renderPlaces(data) {
    const list = document.getElementById('placesList');
    list.innerHTML = '';

    if (data.length === 0) {
        list.innerHTML = '<div class="no-results"><p>No matching places found. Try adjusting your filters.</p></div>';
        return;
    }

    data.forEach(place => {
        const div = document.createElement('div');
        div.className = 'place-card';
        div.innerHTML = `
            <h3>${place.name}</h3>
            <p>📍 <strong>${place.location}</strong> | 🏷️ ${place.type}</p>
            <p>
                🧘 Quiet: ${place.quiet ? '✅' : '❌'} | 
                👥 Low Crowd: ${place.low_crowd ? '✅' : '❌'} | 
                🎧 Sensory-Friendly: ${place.sensory_friendly ? '✅' : '❌'}
            </p>
            <p>
                📊 Crowd Level: <span class="crowd-level">${place.crowd_level}</span><br>
                🟢 Status: <span class="status">${place.status}</span><br>
                ☁️ Weather: <span class="weather">${place.weather_warning}</span>
            </p>
        `;
        list.appendChild(div);
    });
}

function renderQuickResults(data) {
    const quickList = document.getElementById('quickResultsList');
    quickList.innerHTML = '';

    if (data.length === 0) {
        quickList.innerHTML = '<div class="no-results"><p>No results found. Try different filters.</p></div>';
        return;
    }

    data.forEach(place => {
        const div = document.createElement('div');
        div.className = 'quick-result-card';
        div.innerHTML = `
            <h4>${place.name}</h4>
            <p>📍 ${place.location} | 🏷️ ${place.type}</p>
            <p>
                ${place.quiet ? '🧘 Quiet' : ''} 
                ${place.low_crowd ? '👥 Low Crowd' : ''} 
                ${place.sensory_friendly ? '🎧 Sensory-Friendly' : ''}
            </p>
        `;
        
        // Add click handler to switch to places tab
        div.addEventListener('click', function() {
            document.querySelector('[data-tab="places"]').click();
        });
        
        quickList.appendChild(div);
    });
}

function applyFilters() {
    const quiet = document.getElementById('quietFilter').checked;
    const lowCrowd = document.getElementById('crowdFilter').checked;
    const sensory = document.getElementById('sensoryFilter').checked;
    const query = document.getElementById('searchBar').value.toLowerCase();

    const filtered = places.filter(p =>
        (!quiet || p.quiet) &&
        (!lowCrowd || p.low_crowd) &&
        (!sensory || p.sensory_friendly) &&
        (p.name.toLowerCase().includes(query) || p.location.toLowerCase().includes(query))
    );

    renderPlaces(filtered);
    renderQuickResults(filtered.slice(0, 6));
}

// Set up event listeners for filters
function setupFilterListeners() {
    ["quietFilter", "crowdFilter", "sensoryFilter"].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("change", applyFilters);
        }
    });
    
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
        searchBar.addEventListener("input", applyFilters);
    }
    
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.getElementById('quietFilter').checked = false;
            document.getElementById('crowdFilter').checked = false;
            document.getElementById('sensoryFilter').checked = false;
            document.getElementById('searchBar').value = '';
            renderPlaces(places);
            renderQuickResults(places.slice(0, 6));
        });
    }
}

// Initialize map
function initializeMap() {
    map = L.map('map').setView([9.9312, 76.2673], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Handle map click
    map.on('click', async function (e) {
        const { lat, lng } = e.latlng;

        // Remove previous custom markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && !layer._isBaseLayer) {
                map.removeLayer(layer);
            }
        });

        // Add user's selected marker
        L.marker([lat, lng])
            .addTo(map)
            .bindPopup("You selected this spot")
            .openPopup();

        try {
            const res = await fetch('nearby_mock.json');
            const data = await res.json();

            data.forEach(place => {
                const distance = getDistanceFromLatLonInKm(lat, lng, place.lat, place.lng);
                if (distance <= 2) {
                    const icon = place.type === 'hospital' ? '🏥' : '🚻';
                    L.marker([place.lat, place.lng], { icon: createEmojiIcon(icon) })
                        .addTo(map)
                        .bindPopup(`
                            <div>
                                ${icon} <b>${place.name}</b><br>
                                🧭 <i>Approx. ${distance.toFixed(2)} km away</i><br>
                                📍 <span style="font-size: 14px;">Lat: ${place.lat.toFixed(4)}, Lng: ${place.lng.toFixed(4)}</span>
                            </div>
                        `);
                }
            });
        } catch (err) {
            console.error("Failed to fetch nearby places:", err);
        }
    });
}

function createEmojiIcon(emoji) {
    return L.divIcon({
        className: '',
        html: `<div style="font-size: 24px;">${emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    setupFilterListeners();
    
    // Remove the annoying welcome modal
    const welcomeModal = document.getElementById("welcomeModal");
    if (welcomeModal) {
        welcomeModal.style.display = "none";
    }
});