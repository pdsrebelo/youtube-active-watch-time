"use strict";
const DAILY_TOTALS_KEY = "dailyWatchSeconds";
const TODAY_VIDEOS_KEY = "todayVideoWatch";
const INITIAL_VIDEO_LIMIT = 5;
let showAllVideos = false;

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDuration(value) {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours)
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  if (minutes)
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

function getSortedVideos(data, day) {
  if (!data || data.date !== day || !data.videos || typeof data.videos !== "object") return [];
  return Object.entries(data.videos)
    .map(([id, item]) => ({ id, title: item.title || "Unknown YouTube video", seconds: Number(item.seconds) || 0 }))
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);
}

function renderVideoList(videos) {
  const list = document.querySelector("#videoList");
  const empty = document.querySelector("#noVideos");
  const allButton = document.querySelector("#showAllVideos");
  const summary = document.querySelector("#videoSummary");
  list.replaceChildren();

  if (!videos.length) {
    empty.hidden = false;
    allButton.hidden = true;
    summary.textContent = "Show videos watched today";
    return;
  }

  empty.hidden = true;
  summary.textContent = videos.length === 1 ? "Show 1 video watched today" : `Show ${videos.length} videos watched today`;

  for (const video of (showAllVideos ? videos : videos.slice(0, INITIAL_VIDEO_LIMIT))) {
    const item = document.createElement("li");
    item.className = "video-item";

    const title = document.createElement("span");
    title.className = "video-title";
    title.textContent = video.title;
    title.title = video.title;

    const duration = document.createElement("span");
    duration.className = "video-duration";
    duration.textContent = formatDuration(video.seconds);
    item.append(title, duration);
    list.append(item);
  }

  allButton.hidden = videos.length <= INITIAL_VIDEO_LIMIT;
  allButton.textContent = showAllVideos ? "Show top 5" : `Show all ${videos.length}`;
}

async function render() {
  const stored = await browser.storage.local.get([DAILY_TOTALS_KEY, TODAY_VIDEOS_KEY]);
  const totals = stored[DAILY_TOTALS_KEY] || {};
  const today = new Date();
  const day = dateKey(today);
  document.querySelector("#today").textContent = formatDuration(totals[day]);
  renderVideoList(getSortedVideos(stored[TODAY_VIDEOS_KEY], day));

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
    value.textContent = formatDuration(totals[dateKey(date)]);
    item.append(label, value);
    history.append(item);
  }
}

document.querySelector("#showAllVideos").addEventListener("click", async () => {
  showAllVideos = !showAllVideos;
  await render();
});

document.querySelector("#resetToday").addEventListener("click", async () => {
  const stored = await browser.storage.local.get(DAILY_TOTALS_KEY);
  const totals = stored[DAILY_TOTALS_KEY] || {};
  const day = dateKey(new Date());
  totals[day] = 0;

  await browser.storage.local.set({
    [DAILY_TOTALS_KEY]: totals,
    [TODAY_VIDEOS_KEY]: { date: day, videos: {} }
  });

  showAllVideos = false;
  await render();
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes[DAILY_TOTALS_KEY] || changes[TODAY_VIDEOS_KEY])) 
    render();
});

render();
