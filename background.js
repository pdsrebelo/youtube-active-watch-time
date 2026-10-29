"use strict";

const DAILY_TOTALS_KEY = "dailyWatchSeconds";
const TODAY_VIDEOS_KEY = "todayVideoWatch";
const LAST_BUCKET_KEY = "lastCountedEpochSecond";
const BADGE_BACKGROUND_COLOR = "#303238";
const BADGE_TEXT_COLOR = "#ffffff";
let currentBadgeText = null;

function localDateKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sanitizeVideoId(id) {
  return typeof id === "string" && id.trim()
    ? id.trim().slice(0, 100)
    : "unknown-youtube-video";
}

function sanitizeTitle(title, id) {
  if (typeof title === "string" && title.trim()) {
    return title.trim().slice(0, 300);
  }
  return id === "youtube-shorts" ? "YouTube Shorts" : "Unknown YouTube video";
}

function shouldReplaceTitle(existing, incoming) {
  const generic = new Set(["Unknown YouTube video", "YouTube"]);
  return Boolean(incoming) && (
    !existing ||
    (generic.has(existing) && !generic.has(incoming)) ||
    (existing !== incoming && !generic.has(incoming))
  );
}

function formatBadgeText(totalSeconds) {
  const totalMinutes = Math.floor(Math.max(0, Number(totalSeconds) || 0) / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours < 10) {
    return `${hours}h${String(minutes).padStart(2, "0")}`;
  }

  return `${hours}h`;
}

async function updateBadge(totalSeconds, force = false) {
  const badgeText = formatBadgeText(totalSeconds);
  if (!force && badgeText === currentBadgeText) return;

  await browser.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND_COLOR });

  if (browser.action.setBadgeTextColor) {
    await browser.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });
  }

  await browser.action.setBadgeText({ text: badgeText });
  currentBadgeText = badgeText;
}

async function refreshBadgeFromStorage(force = false) {
  const stored = await browser.storage.local.get(DAILY_TOTALS_KEY);
  const totals = stored[DAILY_TOTALS_KEY] || {};
  const today = localDateKey(Date.now());
  await updateBadge(Number(totals[today]) || 0, force);
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message?.type !== "WATCH_HEARTBEAT") return undefined;

  const observedAt = Number(message.observedAt) || Date.now();
  const epochSecond = Math.floor(observedAt / 1000);
  const day = localDateKey(observedAt);
  const videoId = sanitizeVideoId(message.videoId);
  const videoTitle = sanitizeTitle(message.videoTitle, videoId);
  const stored = await browser.storage.local.get([
    DAILY_TOTALS_KEY,
    TODAY_VIDEOS_KEY,
    LAST_BUCKET_KEY
  ]);

  if (stored[LAST_BUCKET_KEY] === epochSecond) {
    return { counted: false, reason: "already-counted" };
  }

  const dailyTotals = stored[DAILY_TOTALS_KEY] || {};
  dailyTotals[day] = (Number(dailyTotals[day]) || 0) + 1;

  let breakdown = stored[TODAY_VIDEOS_KEY];
  if (!breakdown || breakdown.date !== day || !breakdown.videos || typeof breakdown.videos !== "object") {
    breakdown = { date: day, videos: {} };
  }

  if (!breakdown.videos[videoId]) {
    breakdown.videos[videoId] = { title: videoTitle, seconds: 0 };
  }

  const record = breakdown.videos[videoId];
  record.seconds = (Number(record.seconds) || 0) + 1;

  if (shouldReplaceTitle(record.title, videoTitle)) {
    record.title = videoTitle;
  }

  await browser.storage.local.set({
    [DAILY_TOTALS_KEY]: dailyTotals,
    [TODAY_VIDEOS_KEY]: breakdown,
    [LAST_BUCKET_KEY]: epochSecond
  });

  await updateBadge(dailyTotals[day]);

  return {
    counted: true,
    dateKey: day,
    videoId,
    dailySeconds: dailyTotals[day],
    videoSeconds: record.seconds
  };
});

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[DAILY_TOTALS_KEY]) {
    refreshBadgeFromStorage();
  }
});

browser.runtime.onInstalled.addListener(() => {
  refreshBadgeFromStorage(true);
});

browser.runtime.onStartup.addListener(() => {
  refreshBadgeFromStorage(true);
});

refreshBadgeFromStorage(true);
