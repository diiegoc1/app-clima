const api = {
  key: "6a8d0feea0f48fa08a9bb3c9b23b32e5",
  base: "https://api.openweathermap.org/data/2.5/",
};

const unsplashApi = {
  key: "XcUH0AIC0FwZNjX-yDCr8UgsjmijZwFP3WBtDc-QGmg",
  base: "https://api.unsplash.com/photos/random",
};

const weatherConditions = {
  Thunderstorm: "Tomenta",
  Drizzle: "Llovizna",
  Rain: "Lluvia",
  Snow: "Nieve",
  Mist: "Niebla",
  Smoke: "Humo",
  Haze: "Neblina",
  Dust: "Polvo",
  Fog: "Niebla",
  Sand: "Arena",
  Ash: "Ceniza",
  Squall: "Chubasco",
  Tornado: "Tornado",
  Clear: "Despejado",
  Clouds: "Nublado",
};

const weatherToUnsplashQuery = {
  Thunderstorm: "thunderstorm",
  Drizzle: "rain",
  Rain: "rain",
  Snow: "snow",
  Mist: "fog",
  Smoke: "smoke",
  Haze: "fog",
  Dust: "dust",
  Fog: "fog",
  Sand: "sandstorm",
  Ash: "volcano",
  Squall: "storm",
  Tornado: "tornado",
  Clear: "sunny",
  Clouds: "cloudy",
};

// Elementos del DOM
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");
const tempElement = document.getElementById("temp");
const weatherElement = document.getElementById("weather");
const feelsLikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const forecastContainer = document.getElementById("forecast");
const weatherContainer = document.querySelector(".weather-container");
const initialMessage = document.querySelector(".initial-message");
const app = document.querySelector(".app");

searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim() !== "") {
    getWeather(searchInput.value);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    getWeather(searchInput.value);
  }
});

function getWeather(query) {
  fetch(`${api.base}weather?q=${query}&units=metric&lang=es&APPID=${api.key}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ciudad no encontrada");
      }
      return response.json();
    })
    .then(displayWeather)
    .catch((error) => {
      alert(error.message);
      console.error(error);
    });
}

async function getBackgroundImage(weatherCondition) {
  const query = weatherToUnsplashQuery[weatherCondition] || "weather";

  try {
    const response = await fetch(
      `${unsplashApi.base}?query=${query}+weather&orientation=landscape&client_id=${unsplashApi.key}`
    );
    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.error("Error al obtener imagen de fondo:", error);
    const defaultImages = {
      Thunderstorm:
        "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      Drizzle:
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      Rain: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      Snow: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      Clear:
        "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      Clouds:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    };
    return (
      defaultImages[weatherCondition] ||
      "https://images.unsplash.com/photo-1496450681664-3df85efbd29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    );
  }
}

async function displayWeather(weather) {
  weatherContainer.style.display = "block";
  initialMessage.style.display = "none";

  const weatherCondition = weather.weather[0].main;
  const bgImage = await getBackgroundImage(weatherCondition);
  app.style.backgroundImage = `url(${bgImage})`;

  locationElement.textContent = `${weather.name}, ${weather.sys.country}`;

  dateElement.textContent = dateBuilder(new Date());

  const temp = Math.round(weather.main.temp);
  tempElement.textContent = `${temp}°C`;
  weatherElement.textContent =
    weatherConditions[weather.weather[0].main] || weather.weather[0].main;

  feelsLikeElement.textContent = `Sensación: ${Math.round(weather.main.feels_like)}°C`;
  humidityElement.textContent = `Humedad: ${weather.main.humidity}%`;
  windElement.textContent = `Viento: ${Math.round(weather.wind.speed * 3.6)} km/h`;

  if (temp > 25) {
    app.className = "app warm";
  } else if (temp < 10) {
    app.className = "app cold";
  } else {
    app.className = "app";
  }
  getForecast(weather.coord.lat, weather.coord.lon);
}

function getForecast(lat, lon) {
  fetch(`${api.base}forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&APPID=${api.key}`)
    .then((response) => response.json())
    .then(displayForecast)
    .catch((error) => console.error(error));
}

function displayForecast(forecast) {
  forecastContainer.innerHTML = "";

  // Agrupar por día
  const dailyForecast = {};
  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString(); // Usar la fecha como clave única

    if (!dailyForecast[dayKey]) {
      dailyForecast[dayKey] = item;
    }
  });

  // Tomar los primeros 7 días
  const forecastDays = Object.values(dailyForecast).slice(0, 6);

  forecastDays.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayElement = document.createElement("div");
    dayElement.className = "forecast-day";

    dayElement.innerHTML = `
      <div class="day">${getDayName(date)}</div>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${
      day.weather[0].description
    }">
      <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
      <div class="forecast-weather">${
        weatherConditions[day.weather[0].main] || day.weather[0].main
      }</div>
    `;
    forecastContainer.appendChild(dayElement);
  });
}

function dateBuilder(d) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}

function getDayName(date) {
  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  return days[date.getDay()];
}

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `${api.base}weather>lat=${latitude}&lon=${longitude}&units=metric&lang=es&APPID=${api.key}`
        )
          .then((response) => response.json())
          .then(displayWeather)
          .catch((error) => console.error(error));
      },
      (error) => {
        console.error("Geolocalizacion no permitida", error);
        getWeather("Madrid");
      }
    );
  } else {
    getWeather("Madrid");
  }
});
