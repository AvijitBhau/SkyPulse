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


weatherSearchBtn.addEventListener("click", () => {
    if (inputLocation.value.trim() !== "") {
        getGeocode();
        errorPara.classList.add("hide");
    }
    else {
        // errorPara.innerHTML = "Enter a location first!"
        errorPara.classList.remove("hide");
    }
});

const getGeocode = async () => {
    try {
        const response1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${inputLocation.value.trim()}&count=1`);
        const data1 = await response1.json();
        console.log(data1);

        if (!data1.results || data1.results.length === 0) {
            errorPara.textContent = "Location not found.";
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

        getWeatherData();
    } catch (err) {
        console.log()
    }
}

const getWeatherData = async () => {
    try {
        const response2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain,precipitation,wind_gusts_10m,uv_index,cloud_cover,showers,visibility,snowfall,is_day`);
        const data2 = await response2.json();

        changeWeather(data2);
    } catch (err) {
        console.log("Got " + err);
    }
}

const changeWeather = (data) => {
    console.log(data);

    currentTemperature.innerHTML = data.current["temperature_2m"] + data.current_units["temperature_2m"];
    apparentTemperature.innerHTML = data.current["apparent_temperature"] + data.current_units["apparent_temperature"];
    humidity.innerHTML = data.current["relative_humidity_2m"] + data.current_units["relative_humidity_2m"];
    windSpeed[0].innerHTML = data.current["wind_speed_10m"] + " " + data.current_units["wind_speed_10m"];
    windSpeed[1].innerHTML = data.current["wind_speed_10m"] + " " + data.current_units["wind_speed_10m"];
    pressure.innerHTML = data.current["surface_pressure"] + " " + data.current_units["surface_pressure"];
    visibility.innerHTML = data.current["visibility"]/1000 + " " + "km";
    cloudCover.innerHTML = data.current["cloud_cover"] + data.current_units["cloud_cover"];
    uvRays.innerHTML = data.current["uv_index"] + data.current_units["uv_index"];
    windDirection.innerHTML = data.current["wind_direction_10m"] + " " + data.current_units["wind_direction_10m"];
    gust.innerHTML = data.current["wind_gusts_10m"] + " " + data.current_units["wind_gusts_10m"];

    const beaufort = getBeaufort(data.current["wind_speed_10m"]);
    beaufortScale.innerHTML = beaufort.scale + " - " + beaufort.text;

    humidBar.value = data.current["relative_humidity_2m"];
    pressureBar.value = data.current["surface_pressure"];
    visibilityBar.value = data.current["visibility"];
    cloudBar.value = data.current["cloud_cover"];
    uvBar.value = data.current["uv_index"];
}
