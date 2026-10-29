"use strict";

const STORAGE_KEY = "dailyWatchSeconds";

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDuration(totalSeconds) {
  const total = Math.max(
    0,
    Math.floor(Number(totalSeconds) || 0)
  );

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

async function render() {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const daily = stored[STORAGE_KEY] || {};
  const today = new Date();

  document.querySelector("#today").textContent = formatDuration(daily[dateKey(today)]);

  const history = document.querySelector("#history");
  history.replaceChildren();

  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const item = document.createElement("li");
    const label = document.createElement("span");
    const value = document.createElement("span");
    label.textContent = offset === 0 ? "Today" : formatter.format(date);
    value.textContent = formatDuration(daily[dateKey(date)]);
    item.append(label, value);
    history.append(item);
  }
}

document.querySelector("#resetToday").addEventListener("click", async () => {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const daily = stored[STORAGE_KEY] || {};
  daily[dateKey(new Date())] = 0;
  await browser.storage.local.set({ [STORAGE_KEY]: daily });
  await render();
});

render();

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    render();
  }
});