# YouTube Active Watch Time

A private Firefox extension that counts real elapsed time while a YouTube video is playing, advancing, and visibly available either in its Firefox tab or through Picture-in-Picture.

## Current rules

Counts normal videos, live streams, visible advertisements, supported Picture-in-Picture playback, and real elapsed time at any playback speed. It does not count paused, ended, seeking, buffering, ordinary background-tab playback, or heavily suspended timers.

Two simultaneous qualifying videos are globally capped to approximately one counted second per real second.

## Video breakdown

The popup displays a breakdown of videos watched during the current local calendar day. Normal videos and live streams are stored separately using their YouTube video IDs. YouTube Shorts are grouped under one `YouTube Shorts` entry. Advertisements are attributed to the current video.

The extension stores only the video ID, video title, date, and counted seconds in `browser.storage.local`. Detailed video history is kept only for the current day. Historical daily totals remain available for seven-day display. Reset today deletes both today's total and today's breakdown.

## Develop in VS Code

1. Open this folder in VS Code.
2. Open `about:debugging` in Firefox.
3. Select **This Firefox** and **Load Temporary Add-on**.
4. Choose `manifest.json`.
5. After changes, select **Reload** and reload open YouTube tabs when `content.js` changes.

Optional:

```bash
npm install --global web-ext
web-ext lint
web-ext run
```

## Package

```bash
web-ext lint
web-ext build
```

Submit the archive through Mozilla Add-ons as an unlisted, self-distributed extension. Keep the Gecko extension ID unchanged.
