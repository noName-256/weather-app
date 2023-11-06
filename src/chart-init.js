import Hammer from "hammerjs";
import Chart from "chart.js/auto";
import zoomPlugin, { zoom } from "chartjs-plugin-zoom";
const chartElement = document.querySelector("#temperature-chart");
function deviceIsMobile() {
  return window.innerWidth < 650;
}
let weatherData = {
  labels: [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ],
  datasets: [
    {
      label: "Temperature",
      borderColor: "#c32860" /* line color */,
      pointBorderColor: "#b80043" /* point color */,
      pointBorderWidth: 4,
      borderWidth: 4,
      pointHoverBorderWidth: 8,
      data: [],
      lineTension: 0.45,
    },
    {
      label: "Feels like",
      borderColor: "#2880c3" /* line color */,
      pointBorderColor: "#0068b8" /* point color */,
      pointBorderWidth: 4,
      borderWidth: 4,
      pointHoverBorderWidth: 8,
      data: [],
      lineTension: 0.45,
    },
  ],
};
let chartOptions = {
  scales: {
    x: {
      /* make x scale limited in size */
      min: 0,
      max: 6,
      ticks: {
        font: {
          weight: "600",
        },
      },
    },
    y: {
      min: 0,
      max: 30,
      ticks: {
        stepSize: 5,
        font: {
          weight: "600",
        },
      },
    },
  },
  layout: {
    padding: 10,
  },
  plugins: {
    zoom: {
      /* plugin for making chart "scrollable", meaning you can pan it */
      pan: {
        enabled: true,
        mode: "x",
      },
    },
    tooltip: {
      /* tooltip sytling */
      titleFont: {
        weight: "700",
        size: 12,
      },
      bodyFont: {
        weight: "600",
        size: 15,
      },
      displayColors: false,
      bodyFontSize: 20,
      callbacks: {
        label: function (context) {
          return context.dataset.data[context.dataIndex] + "°";
        },
      },
    },
    legend: {
      labels: {
        font: {
          family:
            "'Ubuntu', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          size: 12,
        },
      },
    },
  },
  responsive: deviceIsMobile(),
};
function initChart() {
  /* hide chart and create it's default options
  whenever we want to load a new one, we just change
  the settings and data that we need and update the chart*/
  window.tempChart = new Chart(chartElement, {
    type: "line",
    data: weatherData,
    options: chartOptions,
  });
  Chart.register(zoomPlugin);
  chartElement.style.display = "none";
  /* 
      -> tempChart
         -> config
            -> _config
               -> data
                  -> datasets
                  -> labels
               -> options
                  -> plugins
                  -> scales
                  -> layout
  */
}
function roundToMultipleOf5(number) {
  return Math.floor(number / 5) * 5;
}
export function loadChart(
  tempsByHour,
  feelsLikeByHour,
  startingHour = 0,
  showInCelsius = true
) {
  /* define the data and options we update */
  const data = tempChart.config._config.data;
  const options = tempChart.config._config.options;
  /* if no data is found hide chart and abort*/
  if (
    tempsByHour === undefined ||
    !tempsByHour.length ||
    !feelsLikeByHour.length
  ) {
    chartElement.style.display = "none";
    return;
  }
  /* get line and point color for the chart from body css variables */
  const body = document.querySelector("body");
  const chartLineColor1 = getComputedStyle(body).getPropertyValue(
    "--chart-line-color1"
  );
  const chartPointColor1 = getComputedStyle(body).getPropertyValue(
    "--chart-point-color1"
  );
  const chartLineColor2 = getComputedStyle(body).getPropertyValue(
    "--chart-line-color2"
  );
  const chartPointColor2 = getComputedStyle(body).getPropertyValue(
    "--chart-point-color2"
  );
  /* set labels */
  if (showInCelsius) {
    data.datasets[0].label = "Temperature (°C)";
    data.datasets[1].label = "Feels like (°C)";
    options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.data[context.dataIndex] + "°C";
    };
  } else {
    data.datasets[0].label = "Temperature (°F)";
    data.datasets[1].label = "Feels like (°F)";
    options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.data[context.dataIndex] + "°F";
    };
  }
  /* set weather data and chart colors */
  data.datasets[0].data = tempsByHour;
  data.datasets[0].borderColor = chartLineColor1;
  data.datasets[0].pointBorderColor = chartPointColor1;
  data.datasets[1].data = feelsLikeByHour;
  data.datasets[1].borderColor = chartLineColor2;
  data.datasets[1].pointBorderColor = chartPointColor2;

  /* set x and y axis min and max */
  const numberOfHoursDisplayed = 6;
  if (startingHour < 19) {
    options.scales.x.min = startingHour;
    options.scales.x.max = startingHour + numberOfHoursDisplayed - 1;
  } else {
    options.scales.x.min = 23 - numberOfHoursDisplayed;
    options.scales.x.max = 23;
  }
  options.scales.y.min = roundToMultipleOf5(
    Math.min.apply(Math, tempsByHour.concat(feelsLikeByHour)) - 5
  );
  options.scales.y.max = roundToMultipleOf5(
    Math.max.apply(Math, tempsByHour.concat(feelsLikeByHour)) + 5
  );
  /* show chart */
  tempChart.update("none");
  chartElement.style.display = "block";
}
initChart();
