import { loadData } from "./data-load";

const searchInput = document.querySelector("input.search");
const searchIcon = document.querySelector(".search-bar .search-icon");

async function search(value) {
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=79d8d8857bb04a6ca2c170633231207&q=${value}&days=3`
  );
  const data = await response.json();
  loadData(data);
}
export function addSearchListeners() {
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && searchInput.value !== "")
      search(searchInput.value);
  });
  searchIcon.addEventListener("click", (event) => {
    if (searchInput.value !== "") search(searchInput.value);
  });
}
