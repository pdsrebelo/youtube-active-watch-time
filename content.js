(() => {
  "use strict";
  const SAMPLE_INTERVAL_MS = 1000;
  const MAX_VALID_WALL_DELTA_SECONDS = 2.25;
  const MIN_MEDIA_ADVANCE_SECONDS = 0.05;
  let previousVideo = null;
  let previousContentId = null;
  let previousMediaTime = null;
  let previousWallTime = null;

  function getContentIdentity() {
    const url = new URL(location.href);
    const id = url.searchParams.get("v");
    if (id) return { id, type: "video" };
    if (url.pathname.startsWith("/shorts/")) return { id: "youtube-shorts", type: "shorts" };
    return { id: "unknown-youtube-video", type: "unknown" };
  }

  function cleanTitle(title) {
    if (!title) return null;
    const cleaned = title.replace(/\s*-\s*YouTube\s*$/i, "").trim();
    return !cleaned || cleaned.toLowerCase() === "youtube" ? null : cleaned;
  }

  function getVideoTitle(identity) {
    if (identity.type === "shorts") return "YouTube Shorts";
    if (identity.type === "unknown") return "Unknown YouTube video";
    return cleanTitle(document.querySelector("h1 yt-formatted-string")?.textContent) ||
      cleanTitle(document.querySelector('meta[name="title"]')?.getAttribute("content")) ||
      cleanTitle(document.title) || "Unknown YouTube video";
  }

  function getPrimaryVideo() {
    return [...document.querySelectorAll("video")]
      .filter((video) => video.isConnected)
      .sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0] || null;
  }

  function resetSample(video = null, contentId = null) {
    previousVideo = video;
    previousContentId = contentId;
    previousMediaTime = video ? video.currentTime : null;
    previousWallTime = performance.now();
  }

  async function sample() {
    const video = getPrimaryVideo();
    const identity = getContentIdentity();
    const now = performance.now();
    if (!video || video !== previousVideo || identity.id !== previousContentId) {
      resetSample(video, identity.id);
      return;
    }

    const wallDelta = previousWallTime === null ? 0 : (now - previousWallTime) / 1000;
    const mediaDelta = previousMediaTime === null ? 0 : video.currentTime - previousMediaTime;
    const playing = !video.paused && !video.ended && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (playing && mediaDelta >= MIN_MEDIA_ADVANCE_SECONDS && wallDelta > 0 &&
        wallDelta <= MAX_VALID_WALL_DELTA_SECONDS && document.visibilityState === "visible") {
      try {
        await browser.runtime.sendMessage({
          type: "WATCH_HEARTBEAT",
          observedAt: Date.now(),
          videoId: identity.id,
          videoType: identity.type,
          videoTitle: getVideoTitle(identity)
        });
      } catch {}
    }
    previousMediaTime = video.currentTime;
    previousWallTime = now;
  }

  function resetFromPage() {
    const identity = getContentIdentity();
    resetSample(getPrimaryVideo(), identity.id);
  }
  document.addEventListener("visibilitychange", resetFromPage);
  window.addEventListener("pageshow", resetFromPage);
  window.addEventListener("pagehide", () => resetSample());
  resetFromPage();
  setInterval(sample, SAMPLE_INTERVAL_MS);
})();
