"use strict";

const STORAGE_KEY = "dailyWatchSeconds";
const LAST_BUCKET_KEY = "lastCountedEpochSecond";

function localDateKey(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message?.type !== "WATCH_HEARTBEAT") return undefined;

  const observedAt = Number(message.observedAt) || Date.now();
  const epochSecond = Math.floor(observedAt / 1000);
  const stored = await browser.storage.local.get([STORAGE_KEY, LAST_BUCKET_KEY]);

  // Globally deduplicate heartbeats, so two visible windows cannot double-count.
  if (stored[LAST_BUCKET_KEY] === epochSecond) return { counted: false };

  const daily = stored[STORAGE_KEY] || {};
  const dateKey = localDateKey(observedAt);
  daily[dateKey] = (Number(daily[dateKey]) || 0) + 1;

  await browser.storage.local.set({
    [STORAGE_KEY]: daily,
    [LAST_BUCKET_KEY]: epochSecond
  });

  return { counted: true, dateKey, seconds: daily[dateKey] };
});
