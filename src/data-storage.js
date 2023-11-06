import { storeData, loadData } from "./data-load";

function storeAllData() {
  const allData = storeData();
  localStorage.setItem("lastData", JSON.stringify(allData.lastData));
  localStorage.setItem("showInCelsius", allData.showInCelsius);
}
function loadAllData() {
  const lastData = JSON.parse(localStorage.getItem("lastData")),
    showInCelsius = localStorage.getItem("showInCelsius");

  if (showInCelsius === "false") {
    /* the toggle itself is remembered but the .checked class isn't */
    const metricLabel = document.querySelector(
      ".metric-imperial-toggle label.metric"
    );
    console.log(1);
    const imperialLabel = document.querySelector(
      ".metric-imperial-toggle label.imperial"
    );
    metricLabel.classList.remove("checked");
    imperialLabel.classList.add("checked");
  }
  if (typeof lastData !== "undefined")
    setTimeout(() => {
      loadData(lastData, 0);
    }, 10); /* for some reason sometimes chart does not load unless i do this */
}

export function addLocalStorage() {
  window.addEventListener("beforeunload", storeAllData);
  window.addEventListener("load", loadAllData);
}
