const weatherSearchBtn = document.getElementById("search-weather");
const inputLocation = document.getElementById("input-location");
const locationHeading = document.querySelector(".heading p");
const countryCode = document.querySelectorAll(".country-code")
const errorPara = document.querySelector(".error-msg p");
const currentWeatherIcon = document.querySelector(".day-night-icon");
const currentTemperature = document.querySelector(".temperature");
const apparentTemperature = document.querySelector(".some-space");
const humidity = document.querySelector(".humid");
const windSpeed = document.querySelectorAll(".windy");
const pressure = document.querySelector(".heavy-pressure");
const visibility = document.querySelector(".visible-area");
const cloudCover = document.querySelector(".cover-cloud");
const cloudStatus = document.querySelector(".cloud-status");
const uvRays = document.querySelector(".ultraviolet");
const toLatitude = document.querySelector(".latitude");
const toLongitude = document.querySelector(".longitude");
const timezone = document.querySelector(".timezone");
const windDirection = document.querySelector(".wind-direction");
const gust = document.querySelector(".wind-gust");
const beaufortScale = document.querySelector(".beaufort-scale");
const humidBar = document.getElementById("humid-prog");
const pressureBar = document.getElementById("press-prog");
const visibilityBar = document.getElementById("visib-prog");
const cloudBar = document.getElementById("cloud-prog");
const uvBar = document.getElementById("uv-prog");
const maxTemp = document.getElementsByClassName("temp");
const minTemp = document.getElementsByClassName("temp-night");
const daywiseDay = document.querySelectorAll(".daywise");
const weeklyIcons = document.querySelectorAll(".day-wise-forecast .day-forecast span");
const weeklyDescriptions = document.querySelectorAll(".day-wise-forecast .day-forecast > p:nth-of-type(2)");
const precipitation = document.querySelectorAll(".droplet-percent");
const dayTimeHour = document.querySelectorAll(".weather-time");
const tempByTime = document.querySelectorAll(".day-temp");
const highTemp = document.getElementById("highTemp");
const lowTemp = document.getElementById("lowTemp");
const suggestionBox = document.getElementById("suggestion-box");
const suggestions = document.querySelectorAll(".suggestions");
const locationTracking = document.getElementById("track-location");
const topDate = document.querySelector(".clock p:first-child");
const topTime = document.querySelector(".clock p:last-child");
const degreeLinks = document.querySelectorAll(".degree-link");

let selectedPlace = null;
let latitude = 0, longitude = 0;
let currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let isFahrenheit = false;
let latestWeatherData = null;

const changeSearchBtn = () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
        weatherSearchBtn.innerHTML = '<a class="fa-solid fa-angles-right"></a>';
    }
}

changeSearchBtn();
window.addEventListener("change", changeSearchBtn);

const debounce = (func, delay) => {
    let timer;

    return function (...args) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
}
const searchLocation = async (query) => {
    if (query.trim().length < 2) {
        suggestionBox.classList.add("hide");
        return;
    }

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
    );

    const data = await response.json();

    console.log(data.results);

    for (let i = 0; i < 5; i++) {
        const result = data.results[i];
        if (!result) continue;

        const displayText = `${result.name}${result.admin1 ? `, ${result.admin1}` : ""}, ${result.country}`;
        suggestions[i].innerHTML = displayText;
        suggestions[i].dataset.displayText = displayText;
    }
    suggestionBox.classList.remove("hide");

    suggestions.forEach((sugg, index) => {
        sugg.addEventListener("click", () => {
            const place = data.results[index];

            if (place) {
                updateSelectedPlace(place);
                suggestionBox.classList.add("hide");
            }
        })
    })
}

const debouncedSearch = debounce(searchLocation, 400);

const updateSelectedPlace = (place) => {
    selectedPlace = place;

    if (place && place.name) {
        const displayText = `${place.name}${place.country ? `, ${place.country}` : ""}`;
        inputLocation.value = displayText;
    }
};

const applyLocationState = (placeData, lat, lon) => {
    if (!placeData) return;

    latitude = Number.isFinite(lat) ? lat : placeData.latitude ?? latitude;
    longitude = Number.isFinite(lon) ? lon : placeData.longitude ?? longitude;

    if (placeData.timezone) {
        currentTimeZone = placeData.timezone;
    }

    updateSelectedPlace(placeData);
    updateClock(currentTimeZone);
};

const updateClock = (timeZone = currentTimeZone) => {
    currentTimeZone = timeZone || currentTimeZone;

    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat("en", {
        timeZone: currentTimeZone,
        weekday: "long",
        day: "numeric",
        month: "short"
    });
    const timeFormatter = new Intl.DateTimeFormat("en", {
        timeZone: currentTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    if (topDate) topDate.textContent = dateFormatter.format(now);
    if (topTime) topTime.textContent = timeFormatter.format(now);
};

const formatTemperature = (value) => {
    const convertedValue = isFahrenheit ? (value * 9) / 5 + 32 : value;
    return `${Math.round(convertedValue)}°${isFahrenheit ? "F" : "C"}`;
};

const updateTemperatureDisplay = () => {
    if (!latestWeatherData) return;

    const current = latestWeatherData.current;

    if (currentTemperature) currentTemperature.textContent = formatTemperature(current.temperature_2m);
    if (apparentTemperature) apparentTemperature.textContent = formatTemperature(current.apparent_temperature);
    if (highTemp) highTemp.textContent = formatTemperature(latestWeatherData.daily.temperature_2m_max[0]);
    if (lowTemp) lowTemp.textContent = formatTemperature(latestWeatherData.daily.temperature_2m_min[0]);

    for (let i = 0; i < 5; i++) {
        if (maxTemp[i]) maxTemp[i].textContent = formatTemperature(latestWeatherData.daily.temperature_2m_max[i]);
        if (minTemp[i]) minTemp[i].textContent = formatTemperature(latestWeatherData.daily.temperature_2m_min[i]);
    }

    for (let i = 0; i < 9; i++) {
        if (tempByTime[i]) tempByTime[i].textContent = formatTemperature(latestWeatherData.hourly.temperature_2m[i]);
    }
};

const setTemperatureUnit = (unit) => {
    isFahrenheit = unit === "F";

    degreeLinks.forEach((link) => {
        const isActive = link.dataset.unit === unit;
        link.classList.toggle("active", isActive);
    });

    updateTemperatureDisplay();
};

degreeLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        setTemperatureUnit(link.dataset.unit);
    });
});

function getBeaufort(kmh) {
    if (kmh < 1) return { scale: 0, text: "Calm" };
    if (kmh <= 5) return { scale: 1, text: "Light Air" };
    if (kmh <= 11) return { scale: 2, text: "Light Breeze" };
    if (kmh <= 19) return { scale: 3, text: "Gentle Breeze" };
    if (kmh <= 28) return { scale: 4, text: "Moderate Breeze" };
    if (kmh <= 38) return { scale: 5, text: "Fresh Breeze" };
    if (kmh <= 49) return { scale: 6, text: "Strong Breeze" };
    if (kmh <= 61) return { scale: 7, text: "Near Gale" };
    if (kmh <= 74) return { scale: 8, text: "Gale" };
    if (kmh <= 88) return { scale: 9, text: "Strong Gale" };
    if (kmh <= 102) return { scale: 10, text: "Storm" };
    if (kmh <= 117) return { scale: 11, text: "Violent Storm" };
    return { scale: 12, text: "Hurricane Force" };
}

window.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
    getGeocode("New Delhi");
})

weatherSearchBtn.addEventListener("click", () => {
    const locationToSearch = selectedPlace || inputLocation.value.trim();

    if (locationToSearch) {
        getGeocode(locationToSearch);
        errorPara.classList.add("hide");
    }
    else {
        errorPara.innerHTML = "🔑 Enter a location first!"
        errorPara.classList.remove("hide");
    }
});

inputLocation.addEventListener("input", (e) => {
    selectedPlace = null;
    debouncedSearch(e.target.value);
});

let locationPromptAttempts = 0;

const requestUserLocation = () => {
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (!navigator.geolocation) {
        errorPara.textContent = "Geolocation is not supported by this browser.";
        errorPara.classList.remove("hide");
        return;
    }

    if (!window.isSecureContext && !isLocalHost) {
        errorPara.textContent = "Open the app from localhost or HTTPS to use geolocation.";
        errorPara.classList.remove("hide");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            locationPromptAttempts = 0;
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const placeInfo = await getPlaceFromCoords(lat, lon);
            const resolvedPlace = placeInfo || {
                name: "Your location",
                country: "",
                country_code: "",
                timezone: currentTimeZone,
                latitude: lat,
                longitude: lon
            };
            await getLocationCoords(resolvedPlace, lat, lon);
        },
        (error) => {
            locationPromptAttempts += 1;

            if (error.code === 1) {
                errorPara.textContent = "Location access was denied. Please allow it in your browser and click again.";
                errorPara.classList.remove("hide");

                if (locationPromptAttempts >= 2) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            } else {
                errorPara.textContent = "Could not get your location right now.";
                errorPara.classList.remove("hide");
            }
        }
    );
};

locationTracking.addEventListener("click", requestUserLocation);


const getGeocode = async (locatePlace, index = 0) => {
    try {
        let placeData = locatePlace;

        if (typeof locatePlace === "string") {
            const safePlace = encodeURIComponent(locatePlace.trim());
            const response1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${safePlace}&count=1`);
            const data1 = await response1.json();
            console.log(data1);

            if (!data1.results || data1.results.length === 0) {
                errorPara.textContent = "🔑 Location not found.";
                errorPara.classList.remove("hide");
                return;
            }

            placeData = data1.results[index];
            errorPara.classList.add("hide");
        }

        applyLocationState(placeData, placeData.latitude, placeData.longitude);
        getLocationCoords(placeData, latitude, longitude);
    } catch (err) {
        console.log(err);
    }
}

const getPlaceFromCoords = async (lat, lon) => {
    const safeLat = Number(lat);
    const safeLon = Number(lon);

    if (!Number.isFinite(safeLat) || !Number.isFinite(safeLon)) {
        return null;
    }

    const endpoints = [
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${safeLat}&longitude=${safeLon}&count=1`,
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${safeLat}&lon=${safeLon}&zoom=10&accept-language=en`
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) continue;

            const data = await response.json();
            const result = data.results?.[0] || data;

            if (!result) continue;

            if (data.results && data.results[0]) {
                return {
                    name: result.name || result.admin1 || "Your location",
                    country: result.country || "",
                    country_code: result.country_code || "",
                    timezone: result.timezone || currentTimeZone,
                    latitude: safeLat,
                    longitude: safeLon
                };
            }

            const address = result.address || {};
            const placeName = address.city || address.town || address.village || address.hamlet || address.suburb || result.name || "Your location";
            const region = address.state || address.region || "";
            const country = address.country || "";
            const countryCode = address.country_code ? address.country_code.toUpperCase() : "";

            return {
                name: placeName,
                admin1: region,
                country,
                country_code: countryCode,
                timezone: currentTimeZone,
                latitude: safeLat,
                longitude: safeLon
            };
        } catch (err) {
            console.warn("Reverse geocoding failed", err);
        }
    }

    return {
        name: "Your location",
        country: "",
        country_code: "",
        timezone: currentTimeZone,
        latitude: safeLat,
        longitude: safeLon
    };
};

const getLocationCoords = async (placeData, lat, lon) => {
    const resolvedLat = Number.isFinite(lat) ? lat : latitude;
    const resolvedLon = Number.isFinite(lon) ? lon : longitude;

    applyLocationState(placeData, resolvedLat, resolvedLon);

    const response2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${resolvedLat}&longitude=${resolvedLon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain,precipitation,wind_gusts_10m,uv_index,cloud_cover,showers,visibility,snowfall,is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5`);
    const data2 = await response2.json();

    changeWeather(placeData, data2, resolvedLat, resolvedLon);
}


const weatherStatusIcon = document.querySelector(".weather-icon p");
const sunriseTime = document.querySelectorAll(".sun-status p")[1];
const sunsetTime = document.querySelectorAll(".sun-status p")[3];

const weatherCodeMap = {
    0: { icon: "☀️", label: "Clear" },
    1: { icon: "🌤️", label: "Mainly clear" },
    2: { icon: "⛅", label: "Partly cloudy" },
    3: { icon: "☁️", label: "Overcast" },
    45: { icon: "🌫️", label: "Fog" },
    48: { icon: "🌫️", label: "Depositing rime fog" },
    51: { icon: "🌦️", label: "Light drizzle" },
    53: { icon: "🌦️", label: "Moderate drizzle" },
    55: { icon: "🌧️", label: "Dense drizzle" },
    56: { icon: "🌧️", label: "Freezing drizzle" },
    57: { icon: "🌧️", label: "Freezing drizzle" },
    61: { icon: "🌧️", label: "Slight rain" },
    63: { icon: "🌧️", label: "Moderate rain" },
    65: { icon: "⛈️", label: "Heavy rain" },
    66: { icon: "⛈️", label: "Freezing rain" },
    67: { icon: "⛈️", label: "Heavy freezing rain" },
    71: { icon: "🌨️", label: "Slight snow" },
    73: { icon: "🌨️", label: "Moderate snow" },
    75: { icon: "🌨️", label: "Heavy snow" },
    77: { icon: "🌨️", label: "Snow grains" },
    80: { icon: "🌧️", label: "Rain showers" },
    81: { icon: "🌧️", label: "Moderate showers" },
    82: { icon: "⛈️", label: "Violent showers" },
    85: { icon: "🌨️", label: "Slight snow showers" },
    86: { icon: "🌨️", label: "Heavy snow showers" },
    95: { icon: "⛈️", label: "Thunderstorm" },
    96: { icon: "⛈️", label: "Thunderstorm with hail" },
    99: { icon: "⛈️", label: "Thunderstorm with heavy hail" }
};

const getDayNightIcon = (isDay, cloudCover) => {
    if (isDay === 1) {
        if (cloudCover >= 80) return "☁️";
        if (cloudCover >= 40) return "⛅";
        return "☀️";
    }
    if (cloudCover >= 80) return "☁️";
    if (cloudCover >= 40) return "🌙☁️";
    return "🌙";
};

const changeWeather = (placeData, data, lat = latitude, lon = longitude) => {
    const current = data.current;
    const weatherCode = data.daily.weather_code[0];
    const status = weatherCodeMap[weatherCode] || { icon: "🌤️", label: "Weather" };
    const isDay = Number(current.is_day);

    latestWeatherData = data;

    updateClock(placeData.timezone || currentTimeZone);
    timezone.innerHTML = placeData.timezone || currentTimeZone;
    toLatitude.innerHTML = lat;
    toLongitude.innerHTML = lon;

    countryCode[0].innerHTML = placeData.country_code || "";
    countryCode[1].innerHTML = placeData.country || "";
    locationHeading.innerHTML = placeData.name || "";
    humidity.innerHTML = current.relative_humidity_2m + data.current_units.relative_humidity_2m;
    windSpeed[0].innerHTML = current.wind_speed_10m + " " + data.current_units.wind_speed_10m;
    windSpeed[1].innerHTML = current.wind_speed_10m + " " + data.current_units.wind_speed_10m;
    pressure.innerHTML = current.surface_pressure + " " + data.current_units.surface_pressure;
    visibility.innerHTML = current.visibility / 1000 + " km";
    cloudCover.innerHTML = current.cloud_cover + data.current_units.cloud_cover;
    uvRays.innerHTML = current.uv_index + data.current_units.uv_index;
    windDirection.innerHTML = current.wind_direction_10m + " " + data.current_units.wind_direction_10m;
    gust.innerHTML = current.wind_gusts_10m + " " + data.current_units.wind_gusts_10m;

    cloudStatus.innerHTML = status.label;
    currentWeatherIcon.innerHTML = getDayNightIcon(isDay, current.cloud_cover);
    weatherStatusIcon.innerHTML = status.icon;

    sunriseTime.innerHTML = new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunsetTime.innerHTML = new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const beaufort = getBeaufort(current.wind_speed_10m);
    beaufortScale.innerHTML = beaufort.scale + " - " + beaufort.text;

    humidBar.value = current.relative_humidity_2m;
    pressureBar.value = current.surface_pressure;
    visibilityBar.value = current.visibility;
    cloudBar.value = current.cloud_cover;
    uvBar.value = current.uv_index;
    changeWeeklyWeather(data);
    updateTemperatureDisplay();
}

const changeWeeklyWeather = (data) => {
    for (let i = 0; i < 5; i++) {
        if (i !== 0) {
            let sampleDay = day(data, i);
            daywiseDay[i].innerHTML = sampleDay;
        }

        const weatherCode = data.daily.weather_code[i];
        const status = weatherCodeMap[weatherCode] || { icon: "🌤️", label: "Weather" };

        if (weeklyIcons[i]) {
            weeklyIcons[i].innerHTML = status.icon;
        }
        if (weeklyDescriptions[i]) {
            weeklyDescriptions[i].innerHTML = status.label;
        }

        if (maxTemp[i]) maxTemp[i].textContent = formatTemperature(data.daily.temperature_2m_max[i]);
        if (minTemp[i]) minTemp[i].textContent = formatTemperature(data.daily.temperature_2m_min[i]);
    }
    if (highTemp) highTemp.textContent = formatTemperature(data.daily.temperature_2m_max[0]);
    if (lowTemp) lowTemp.textContent = formatTemperature(data.daily.temperature_2m_min[0]);
    changeHourlyWeather(data)
}

const day = (data, n) => {
    let time = new Date(data.daily.time[n]);
    let weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let finalDay = weekday[time.getDay()].toUpperCase().slice(0, 3);
    return finalDay;
}

const dayTime = (data, n) => {
    let time = new Date(data.hourly.time[n]);
    let getTime = String(time.getHours()).padStart(2, '0') + ":" + String(time.getMinutes()).padStart(2, '0');
    return getTime;
}

const changeHourlyWeather = (data) => {
    for (let i = 0; i < 9; i++) {
        if (i !== 0) {
            let sampleTime = dayTime(data, i);
            dayTimeHour[i].innerHTML = sampleTime;
        }
        if (tempByTime[i]) tempByTime[i].textContent = formatTemperature(data.hourly.temperature_2m[i]);
        if (precipitation[i]) precipitation[i].innerHTML = "💧" + data.hourly.precipitation_probability[i] + "%";
    }
}