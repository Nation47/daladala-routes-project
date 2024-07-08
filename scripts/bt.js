document.addEventListener('DOMContentLoaded', () => {
    const routeInput = document.getElementById('route-input');
    const routeSearch = document.getElementById('route-search');
    const routeDetails = document.getElementById('route-details');
    const alertsList = document.getElementById('alerts-list'); 
    const historyList = document.getElementById('history-list');
    const analysisResults = document.getElementById('analysis-results');
    const alertsButton = document.getElementById('alerts-button');
    const alertsCount = document.getElementById('alerts-count');
    const historyButton = document.getElementById('history-button');
    const analysisButton = document.getElementById('analysis-button');



    
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
                    addToRouteHistory(route.route);
                    analyzeRoutes(routeHistory);
                } else {
                    routeDetails.innerHTML = `<p>No routes found for "${query}".</p>`;
                }
            })
            .catch(error => console.error('Error fetching routes:', error));
    });

    function displayRouteDetails(route) {
        routeDetails.innerHTML = `
            <h2>${route.route}</h2>
            <p>Nauli: ${route.fare}</p>
            <h3>Vituo:</h3>
            <ul>
                ${route.stops.map(stop => `<li>${stop}</li>`).join('')}
            </ul>
            <h3>Msongamano wa Magari:</h3>
            <ul>
                <li>Asubuhi: ${route.traffic.morning}</li>
                <li>Mchana: ${route.traffic.afternoon}</li>
                <li>Jioni: ${route.traffic.evening}</li>
                <li>Usiku: ${route.traffic.night}</li>
            </ul>
        `;
    }

    function displayRouteOnMap(stops) {
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: { lat: -6.7924, lng: 39.2083 } 
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

    function fetchEmergencyAlerts() {
        fetch('scripts/data/alerts.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(alerts => {
                displayEmergencyAlerts(alerts);
            })
            .catch(error => console.error('There was a problem with the fetch operation:', error));
    }

    function displayEmergencyAlerts(alerts) {
        alertsList.innerHTML = alerts.map(alert => `<li>${alert.description} - ${new Date(alert.timestamp).toLocaleString()}</li>`).join('');
        alertsCount.textContent = alerts.length;
        //hidden contents
        alertsButton.addEventListener('click', () => {
            alertsList.style.display = alertsList.style.display === 'none' ? 'block' : 'none';
        });
    }

    // route history 

    fetch('scripts/data/routes.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(route => addToRouteHistory(route));
            analyzeRoutes(routeHistory);
        })
        .catch(error => console.error('Error fetching routes:', error));

        let routeHistory = [];

        function addToRouteHistory(route) {
        const existingRouteIndex = routeHistory.findIndex(item => item.route === route.route);
        if (existingRouteIndex !== -1) {
            routeHistory[existingRouteIndex].timestamp = new Date().toLocaleString();
        } else {
            routeHistory.push({
                route: route.route,
                timestamp: new Date().toLocaleString()
            });
        }
        
        displayRouteHistory();
    }

    // hidden
    historyButton.addEventListener('click', () => {
        historyList.style.display = historyList.style.display === 'none' ? 'block' : 'none';
    });


    function displayRouteHistory() {
        historyList.innerHTML = routeHistory.map(item => `<li>${item.route} - ${item.timestamp}</li>`).join('');
        
    }

    function analyzeRoutes(history) {
        const routeCount = history.reduce((acc, item) => {
            acc[item.route] = (acc[item.route] || 0) + 1;
            return acc;
        }, {});

        const analysis = Object.entries(routeCount).map(([route, count]) => {
            return `<p>Route ${route} has been searched ${count} times.</p>`;
        }).join('');

        analysisButton.addEventListener('click', () => {
            analysisResults.style.display = analysisResults.style.display === 'none' ? 'block' : 'none';
        });

        analysisResults.innerHTML = analysis;
    }

    

    // Toggle route history
   

    // Toggle route analysis
   

    // Fetch emergency alerts when the page loads
    fetchEmergencyAlerts();

});
