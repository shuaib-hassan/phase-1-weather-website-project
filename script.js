let useCelsius = true; // Default to Celsius because most of the world uses it

function getWeather() {
    const apiKey = '99212dc6eaa183a279f7b9789e3c4ea7'; // API key for OpenWeatherMap
    const city = document.getElementById('city').value;

    // Check if city is empty
    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    // Fetch current weather first
    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) throw new Error('Weather data not found');
            return response.json();
        })
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Failed to fetch weather:', error); // Log error for debugging
            alert('Weather data unavailable. Try another city?');
        });

    // Fetch hourly forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(() => {
            
        });
}

function displayWeather(data) {
    // Grab all the DOM elements we'll need
    const tempDiv = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    // Clear previous data - prevents verlaps
    weatherInfoDiv.innerHTML = '';
    tempDiv.innerHTML = '';

    // Check if the city was found
    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>City not found</p>`;
        return;
    }

    // Convert temp based on user preference
    const temp = useCelsius 
        ? Math.round(data.main.temp - 273.15) // Kelvin to Celsius
        : Math.round((data.main.temp - 273.15) * 9/5 + 32); // Kelvin to Fahrenheit

    // Set the temperature and weather info
    tempDiv.innerHTML = `<p>${temp}°${useCelsius ? 'C' : 'F'}</p>`;
    weatherInfoDiv.innerHTML = `<p>${data.name}</p><p>${data.weather[0].description}</p>`;
    
    // Set the weather icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    weatherIcon.style.display = 'block';
}

// Show the next 8 hours of forecast (3-hour intervals from API)
function displayHourlyForecast(hourlyData) {
    const forecastDiv = document.getElementById('hourly-forecast');
    forecastDiv.innerHTML = ''; // remove previous forecast

    // Slice first 8 items (next 24 hours in 3-hour increments)
    hourlyData.slice(0, 8).forEach(hourData => {
        const time = new Date(hourData.dt * 1000); // Convert timestamp
        const temp = useCelsius
            ? Math.round(hourData.main.temp - 273.15)
            : Math.round((hourData.main.temp - 273.15) * 9/5 + 32);

        // Build forecast item HTML - could use template literals but keeping simple
        forecastDiv.innerHTML += `
            <div class="hourly-item">
                <span>${time.getHours()}:00</span>
                <img src="https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png" 
                     alt="${hourData.weather[0].description}">
                <span>${temp}°${useCelsius ? 'C' : 'F'}</span>
            </div>
        `;
    });
}


// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', getWeather);

// Event listener for the Enter key in the input field
document.getElementById('city').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') getWeather();
});

// switching between Celsius/Fahrenheit
document.getElementById('unit-btn').addEventListener('click', function() {
    useCelsius = !useCelsius;
    this.textContent = useCelsius ? '°C/°F' : '°F/°C'; // Update button text
    if (document.getElementById('city').value) {
        getWeather(); // Refresh if we have a city
    }
});

// Event listener for the locate button of your current location 
document.getElementById('locate-btn').addEventListener('click', function() {
    if (!navigator.geolocation) {
        alert("Your browser doesn't support geolocation");
        return;
    }

    // Show loading state
    this.textContent = 'Locating...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Reset button text
            this.textContent = '📍 Locate';
            
            // Fetch weather for coordinates
            const apiKey = '99212dc6eaa183a279f7b9789e3c4ea7'; // Duplicated - would refactor later
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('city').value = data.name;
                    getWeather();
                });
        },
        () => {
            this.textContent = '📍 Locate';
            alert("Couldn't get your location");
        }
    );
});