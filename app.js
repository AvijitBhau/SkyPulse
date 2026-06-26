const weatherSearchBtn = document.getElementById("search-weather");
const inputLocation = document.getElementById("input-location");
const locationHeading = document.querySelector(".heading p");
const countryCode = document.querySelectorAll(".country-code")
const errorPara = document.querySelector(".error-msg p");
const currentWeatherIcon = document.querySelector(".day-night-icon");
const currentTemperature = document.querySelector(".temperature");
const apparentTemperature = document.querySelector(".some-space");
const weatherIcon = document.querySelector(".weather-icon p");
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





let latitude = 0, longitude = 0;

const titleCase = (str) => {
    let finalArray = [];
    let arr = [];
    arr = str.split(" ");
    for (let i = 0; i < arr.length; i++) {
        let check = arr[i];
        let firstCapital = check[0].toUpperCase();
        let havelast = arr[i].slice(1).toLowerCase();
        let combine = firstCapital + havelast;
        finalArray.push(combine);
    }
    let finalLocation = finalArray.join(" ");
    return finalLocation;
}
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
    if (query.length < 2) return;
    
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`
    );
    
    const data = await response.json();
    
    console.log(data.results);

    for (let i = 0; i < 5; i++) {
        let locationName = data.results[i].name + ", ";
        let locationCountry = data.results[i].country;
        let loactionSubPlace = data.results[i].admin1 + ", " || "";
        suggestions[i].innerHTML = locationName + loactionSubPlace + locationCountry;
    }
    suggestionBox.classList.remove("hide");
}

const debouncedSearch = debounce(searchLocation, 400);

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
    getGeocode("New Delhi");
})

weatherSearchBtn.addEventListener("click", () => {
    if (inputLocation.value.trim() !== "") {
        getGeocode(inputLocation.value.trim());
        errorPara.classList.add("hide");
    }
    else {
        errorPara.innerHTML = "🔑 Enter a location first!"
        errorPara.classList.remove("hide");
    }
});

inputLocation.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
});

const getGeocode = async (locatePlace) => {
    try {
        const response1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locatePlace}&count=1`);
        const data1 = await response1.json();
        console.log(data1);

        if (!data1.results || data1.results.length === 0) {
            errorPara.textContent = "🔑 Location not found.";
            errorPara.classList.remove("hide");
        }
        else {
            errorPara.classList.add("hide");
        }

        latitude = data1.results[0]["latitude"];
        longitude = data1.results[0]["longitude"];

        timezone.innerHTML = data1.results[0]["timezone"];
        toLatitude.innerHTML = latitude;
        toLongitude.innerHTML = longitude;

        countryCode[0].innerHTML = data1.results[0]["country_code"];
        countryCode[1].innerHTML = data1.results[0]["country"];
        locationHeading.innerHTML = data1.results[0]["name"];


        const response2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain,precipitation,wind_gusts_10m,uv_index,cloud_cover,showers,visibility,snowfall,is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5`);
        const data2 = await response2.json();

        changeWeather(data2);
    } catch (err) {
        console.log()
    }
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

const changeWeather = (data) => {
    const current = data.current;
    const weatherCode = data.daily.weather_code[0];
    const status = weatherCodeMap[weatherCode] || { icon: "🌤️", label: "Weather" };
    const isDay = Number(current.is_day);

    currentTemperature.innerHTML = current.temperature_2m + data.current_units.temperature_2m;
    apparentTemperature.innerHTML = current.apparent_temperature + data.current_units.apparent_temperature;
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

        maxTemp[i].innerHTML = data.daily.temperature_2m_max[i] + "°C";
        minTemp[i].innerHTML = data.daily.temperature_2m_min[i] + "°C";
    }
    highTemp.innerHTML = data.daily.temperature_2m_max[0] + "°C";
    lowTemp.innerHTML = data.daily.temperature_2m_min[0] + "°C";
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
    // console.log(getTime);
    return getTime;
}

const changeHourlyWeather = (data) => {
    console.log(data);
    for (let i = 0; i < 9; i++) {
        if (i !== 0) {
            let sampleTime = dayTime(data, i);
            dayTimeHour[i].innerHTML = sampleTime;
        }
        tempByTime[i].innerHTML = data.hourly.temperature_2m[i] + "°C";
        precipitation[i].innerHTML = "💧" + data.hourly.precipitation_probability[i] + "%";
    }
}