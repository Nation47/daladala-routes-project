document.addEventListener('DOMContentLoaded', () => {
    const routeInput = document.getElementById('route-input');
    const routeSearch = document.getElementById('route-search');
    const routeDetails = document.getElementById('route-details');

    routeSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = routeInput.value.toLowerCase();
        fetch('scripts/data/routes.json')
            .then(response => response.json())
            .then(data => {
                const route = data.find(route => route.route.toLowerCase().includes(query));
                if (route) {
                    displayRouteDetails(route);
                    displayRouteOnMap(route.stops);
                } else {
                    routeDetails.innerHTML = `<p>No routes found for "${query}".</p>`;
                }
            });
    });

    function displayRouteDetails(route) {
        routeDetails.innerHTML = `
            <h2>${route.route}</h2>
            <p>Fare: ${route.fare}</p>
            <h3>Stops:</h3>
            <ul>
                ${route.stops.map(stop => `<li>${stop}</li>`).join('')}
            </ul>
        `;
    }

    function displayRouteOnMap(stops) {
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: { lat: -6.7924, lng: 39.2083 } // Centered on Dar es Salaam
        });
        const geocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds();
        stops.forEach(stop => {
            geocoder.geocode({ address: stop + ', Dar es Salaam, Tanzania' }, (results, status) => {
                if (status === 'OK') {
                    const marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    bounds.extend(marker.position);
                    map.fitBounds(bounds);
                }
            });
        });
    }
});
