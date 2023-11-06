/* uses data from weather api and loads it into the DOM */
import { loadChart } from "./chart-init";
import cloudQuestion from "./assets/images/cloud-question.svg";
let lastData, lastDayLoaded;

function temperatureSystemIsInCelsius() {
  /* returns true if temperatures should be
     shown in celsius, false for farenheit */
  const metricRadioButton = document.querySelector(
    ".metric-imperial-toggle .metric input"
  );
  return metricRadioButton.checked;
}
function loadGeneralInfo(data, showInCelsius) {
  const temperatureElement = document.querySelector(
    ".general-info .temperature-info"
  );
  const weatherInfoElement = document.querySelector(
    ".general-info .weather-info"
  );
  const feelslikeTemperature = Math.round(
    data.current[showInCelsius ? "feelslike_c" : "feelslike_f"]
  );

  temperatureElement.textContent = `${feelslikeTemperature}°`;
  weatherInfoElement.textContent = data.current.condition.text;
}
function loadLocation(data) {
  const locationElement = document.querySelector(".location");
  locationElement.textContent = data.location.name;
}
function loadSpecificDayForecast(
  dayElement,
  temperatureText,
  weatherIconURL,
  weatherIconAlt
) {
  /* dayElement should be either the element for today, tomorrow or overmorrow */
  const dayTemperature = dayElement.querySelector(".temperature");
  const dayWeatherIcon = dayElement.querySelector("img.weather-icon");
  dayTemperature.textContent = temperatureText;
  dayWeatherIcon.src = weatherIconURL;
  dayWeatherIcon.alt = weatherIconAlt;
}
function loadAllDaysForecast(data, showInCelsius) {
  const todayElement = document.querySelector(".three-day-forecast .today");
  const tomorrowElement = document.querySelector(
    ".three-day-forecast .tomorrow"
  );
  const overmorrowElement = document.querySelector(
    ".three-day-forecast .overmorrow"
  );
  const days = data.forecast.forecastday;
  days.forEach((forecastday, index) => {
    let element;
    switch (index) {
      case 0:
        element = todayElement;
        break;
      case 1:
        element = tomorrowElement;
        break;
      case 2:
        element = overmorrowElement;
        break;
      default:
        throw new Error("More than 3 days forecast?");
    }

    let temperature;
    if (showInCelsius) temperature = forecastday.day.avgtemp_c;
    else temperature = forecastday.day.avgtemp_f;
    const temperatureText = `${temperature}°${showInCelsius ? "C" : "F"}`;
    const weatherIconURL = `https:${forecastday.day.condition.icon}`;
    /* for some reason the api does not 
    include the https: so we add it manually */
    const weatherIconAlt = forecastday.day.condition.text;

    loadSpecificDayForecast(
      element,
      temperatureText,
      weatherIconURL,
      weatherIconAlt
    );
  });
}
function loadAllHoursForecast(data, dayIndex, showInCelsius) {
  /* hours data is the hours branch of the specific 
    day the user is asking for(today by default) */
  const hoursData = data.forecast.forecastday[dayIndex].hour;
  const hourlyForecast = document.querySelector(".hourly-forecast");
  hoursData.forEach((hour, index) => {
    const hourElement = hourlyForecast.querySelector(`.hour-${index}`);
    const temperatureElement = hourElement.querySelector(".temperature");
    const weatherIcon = hourElement.querySelector(".weather-icon");
    temperatureElement.textContent = `${
      showInCelsius ? hour.temp_c : hour.temp_f
    }°${showInCelsius ? "C" : "F"}`;
    weatherIcon.src = `https:${hour.condition.icon}`;
    weatherIcon.alt = hour.condition.text;
  });
}
function scrollToHour(hour) {
  const hourlyForecast = document.querySelector(".hourly-forecast");
  hourlyForecast.scrollTo({
    top: 0,
    left: hour * 75,
  });
}
function loadUnknownLocation(showInCelsius) {
  /* declarations for all data elements in the DOM */
  const generalInfoTemperatureElement = document.querySelector(
    ".general-info .temperature-info"
  );
  const generalInfoWeatherInfoElement = document.querySelector(
    ".general-info .weather-info"
  );
  const locationElement = document.querySelector(".location");
  const todayElement = document.querySelector(".three-day-forecast .today");
  const todayTemperatureElement = todayElement.querySelector(".temperature");
  const todayWeatherIconElement = todayElement.querySelector(".weather-icon");
  const tomorrowElement = document.querySelector(
    ".three-day-forecast .tomorrow"
  );
  const tomorrowTemperatureElement =
    tomorrowElement.querySelector(".temperature");
  const tomorrowWeatherIconElement =
    tomorrowElement.querySelector(".weather-icon");
  const overmorrowElement = document.querySelector(
    ".three-day-forecast .overmorrow"
  );
  const overmorrowTemperatureElement =
    overmorrowElement.querySelector(".temperature");
  const overmorrowWeatherIconElement =
    overmorrowElement.querySelector(".weather-icon");
  const hoursElements = document.querySelectorAll(".hourly-forecast .hour");
  const usefulInfoCardElements =
    document.querySelectorAll(".useful-info .card");

  /* actually changing the data elements in the DOM */
  generalInfoTemperatureElement.textContent = "...°";
  generalInfoWeatherInfoElement.textContent = "Unknown";
  locationElement.textContent = "unknown location";

  todayTemperatureElement.textContent = `?°${showInCelsius ? "C" : "F"}`;
  todayWeatherIconElement.src = cloudQuestion;
  todayWeatherIconElement.alt = "unknown weather";

  tomorrowTemperatureElement.textContent = `?°${showInCelsius ? "C" : "F"}`;
  tomorrowWeatherIconElement.src = cloudQuestion;
  tomorrowWeatherIconElement.alt = "unknown weather";

  overmorrowTemperatureElement.textContent = `?°${showInCelsius ? "C" : "F"}`;
  overmorrowWeatherIconElement.src = cloudQuestion;
  overmorrowWeatherIconElement.alt = "unknown weather";

  loadChart();

  hoursElements.forEach((hourElement) => {
    const hourTemperatureElement = hourElement.querySelector(".temperature");
    const hourWeathherIconElement = hourElement.querySelector(".weather-icon");
    hourTemperatureElement.textContent = `?°${showInCelsius ? "C" : "F"}`;
    hourWeathherIconElement.src = cloudQuestion;
    hourWeathherIconElement.alt = "unknown weather";
  });
  usefulInfoCardElements.forEach((cardElement) => {
    const cardElementInfo = cardElement.querySelector(".info");
    cardElementInfo.textContent = "?";
  });
}
function locationSeededRNG(latitude, longitude, min, max) {
  /* assigns random number for each location 
  between min and max using latitude and longitude */
  max = Math.floor(max);
  min = Math.floor(min);
  const location = Math.abs(latitude * longitude * 10000);
  const x = Math.sin(location) * 10000;
  return (Math.abs(Math.floor(x)) % (max - min + 1)) + min;
}
function loadColorPreset(colorPresetNumber) {
  const body = document.querySelector("body");
  body.classList.remove(`color-preset-1`);
  body.classList.remove(`color-preset-2`);
  body.classList.remove(`color-preset-3`);
  body.classList.add(`color-preset-${colorPresetNumber}`);
}
function loadUsefulInfo(data, showInCelsius) {
  /* we will assume that if temps are in celsius then 
  the rest of the stuff is also in the metric system*/
  /* declarations for all data elements in the DOM */
  const humidityElementInfo = document.querySelector(".humidity .info");
  const feelsLikeElementInfo = document.querySelector(".feels-like .info");
  const windSpeedElementInfo = document.querySelector(".wind-speed .info");
  const windDirectionElementInfo = document.querySelector(
    ".wind-direction .info"
  );
  const uvIndexElementInfo = document.querySelector(".uv-index .info");
  const cloudCoverElementInfo = document.querySelector(".cloud-cover .info");
  const visibility = document.querySelector(".visibility .info");
  const chanceOfRainElementInfo = document.querySelector(".rain-chance .info");

  /* actually changing the data elements in the DOM */
  humidityElementInfo.textContent = `${data.current.humidity}%`;

  feelsLikeElementInfo.textContent = `${
    data.current[showInCelsius ? "feelslike_c" : "feelslike_f"]
  }°${showInCelsius ? "C" : "F"}`;

  windSpeedElementInfo.textContent = `${
    data.current[showInCelsius ? "wind_kph" : "wind_mph"]
  }${showInCelsius ? "km/h" : "mph"}`;

  windDirectionElementInfo.textContent = data.current.wind_dir;

  const uvIndex = +data.current.uv;
  if (uvIndex <= 2) uvIndexElementInfo.textContent = "Low";
  else if (uvIndex <= 5) uvIndexElementInfo.textContent = "Moderate";
  else if (uvIndex <= 7) uvIndexElementInfo.textContent = "High";
  else if (uvIndex <= 10) uvIndexElementInfo.textContent = "Very high";
  else uvIndexElementInfo.textContent = "Extreme";

  cloudCoverElementInfo.textContent = `${data.current.cloud}%`;

  visibility.textContent = `${
    data.current[showInCelsius ? "vis_km" : "vis_miles"]
  }${showInCelsius ? "km" : "miles"}`;

  chanceOfRainElementInfo.textContent = `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
}
function loadRealData(data, showInCelsius, chartAndHoursDay) {
  /* chartAndHoursDay represents the day for which 
  the chart and hours tab show the temps:
  0 - today
  1 - tomorrow
  2 - overmorrow 
  */
  const currentHour =
    chartAndHoursDay === 0 ? +data.current.last_updated.slice(-5, -3) : 0;
  /* for tomorrow and overmorrow, the hours displayed start at 0 */
  let tempsByHour = [],
    feelsLikeByHour = [];
  data.forecast.forecastday[chartAndHoursDay].hour.forEach((hour) => {
    if (showInCelsius) {
      tempsByHour.push(hour.temp_c);
      feelsLikeByHour.push(hour.feelslike_c);
    } else {
      tempsByHour.push(hour.temp_f);
      feelsLikeByHour.push(hour.feelslike_f);
    }
  });
  loadColorPreset(
    locationSeededRNG(data.location.lat, data.location.lon, 1, 3)
  );
  loadGeneralInfo(data, showInCelsius);
  loadLocation(data, showInCelsius);
  loadAllDaysForecast(data, showInCelsius);
  loadChart(tempsByHour, feelsLikeByHour, currentHour, showInCelsius);
  loadAllHoursForecast(data, chartAndHoursDay, showInCelsius);
  scrollToHour(currentHour);
  loadUsefulInfo(data, showInCelsius);
  lastDayLoaded = chartAndHoursDay;
}
function addDaysListeners() {
  /* adds listeners so that if you click on a specific 
  day it shows the charts and temps for that day */
  const todayElement = document.querySelector(".today"),
    tomorrowElement = document.querySelector(".tomorrow"),
    overmorrowElement = document.querySelector(".overmorrow");

  todayElement.addEventListener("click", (event) => {
    const showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined)
      loadRealData(lastData, showInCelsius, 0);
  });
  tomorrowElement.addEventListener("click", (event) => {
    const showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined)
      loadRealData(lastData, showInCelsius, 1);
  });
  overmorrowElement.addEventListener("click", (event) => {
    const showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined)
      loadRealData(lastData, showInCelsius, 2);
  });
}
function addMetricImperialToggleListeners() {
  /* declare metric and imperial DOM elements */
  const metricLabel = document.querySelector(".metric-imperial-toggle .metric");
  const metricRadioButton = metricLabel.querySelector("input");
  const imperialLabel = document.querySelector(
    ".metric-imperial-toggle .imperial"
  );
  const imperialRadioButton = imperialLabel.querySelector("input");

  /* add listeners for them that add or remove class 
  checked to the label and reload the data with the 
  other measurement system on change */
  metricRadioButton.addEventListener("change", () => {
    if (metricRadioButton.checked) {
      imperialLabel.classList.remove("checked");
      metricLabel.classList.add("checked");
      if (typeof lastData !== "undefined" && lastData.error === undefined)
        loadRealData(lastData, true, lastDayLoaded);
    }
  });
  imperialRadioButton.addEventListener("change", () => {
    if (imperialRadioButton.checked) {
      metricLabel.classList.remove("checked");
      imperialLabel.classList.add("checked");
      if (typeof lastData !== "undefined" && lastData.error === undefined)
        loadRealData(lastData, false, lastDayLoaded);
    }
  });
}
export function loadData(data) {
  const showInCelsius = temperatureSystemIsInCelsius();
  if (typeof data.error !== "undefined") {
    if (data.error.code === 1006)
      /* location not found error code */
      loadUnknownLocation(showInCelsius);
    else if (data.error.code)
      /* unknown error */
      throw new Error("Odd weather api error");
  } else loadRealData(data, showInCelsius, 0);
  lastData = data;
}
export function storeData() {
  return {
    lastData,
    showInCelsius: temperatureSystemIsInCelsius(),
  };
}
addDaysListeners();
addMetricImperialToggleListeners();
