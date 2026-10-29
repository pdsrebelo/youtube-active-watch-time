(() => {
  "use strict";

  const SAMPLE_INTERVAL_MS = 1000;
  const MAX_VALID_WALL_DELTA_SECONDS = 2.25;
  const MIN_MEDIA_ADVANCE_SECONDS = 0.05;

  let previousVideo = null;
  let previousMediaTime = null;
  let previousWallTime = null;

  function resetSample(video = null) {
    previousVideo = video;
    previousMediaTime = video ? video.currentTime : null;
    previousWallTime = performance.now();
  }

  function getPrimaryVideo() {
    const videos = [...document.querySelectorAll("video")];
    if (!videos.length) return null;

    return videos
      .filter((video) => video.isConnected)
      .sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0] || null;
  }

  async function sample() {
    const video = getPrimaryVideo();
    const now = performance.now();

    if (!video || video !== previousVideo) {
      resetSample(video);
      return;
    }

    const wallDelta = previousWallTime === null ? 0 : (now - previousWallTime) / 1000;
    const mediaDelta = previousMediaTime === null ? 0 : video.currentTime - previousMediaTime;

    const genuinelyAdvancing = mediaDelta >= MIN_MEDIA_ADVANCE_SECONDS;
    const reasonableTimerInterval = wallDelta > 0 && wallDelta <= MAX_VALID_WALL_DELTA_SECONDS;
    const normallyVisible = document.visibilityState === "visible";
    const playing = !video.paused && !video.ended && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (playing && genuinelyAdvancing && reasonableTimerInterval && normallyVisible) {
      try {
        await browser.runtime.sendMessage({
          type: "WATCH_HEARTBEAT",
          observedAt: Date.now()
        });
      } catch {
        // Extension reloads can briefly invalidate the content-script context.
      }
    }

    previousMediaTime = video.currentTime;
    previousWallTime = now;
  }

  document.addEventListener("visibilitychange", () => resetSample(getPrimaryVideo()));
  window.addEventListener("pageshow", () => resetSample(getPrimaryVideo()));
  window.addEventListener("pagehide", () => resetSample(null));

  resetSample(getPrimaryVideo());
  setInterval(sample, SAMPLE_INTERVAL_MS);
})();
