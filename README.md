# YouTube Active Watch Time

A private Firefox extension that counts real elapsed time while a YouTube video is playing, advancing, and visibly available either in its Firefox tab or through Picture-in-Picture.

## Version 0.2 rules

Counts:

- A playing, advancing YouTube video in a visible selected tab
- Visible advertisements, attributed to the current video
- Real elapsed time at any playback speed
- A visible video even if another desktop application has focus
- Picture-in-Picture playback, including when Firefox is minimized or another Firefox tab is selected
- Normal YouTube videos and live streams as separate video entries
- YouTube Shorts, grouped under one `YouTube Shorts` entry

Does not count:

- Paused, ended, seeking, or buffering video
- Playback in an ordinary background tab without Picture-in-Picture
- Playback in a minimized Firefox window without Picture-in-Picture
- Background playback without a visible YouTube tab or Picture-in-Picture window
- Sleeping or heavily suspended timers

Two simultaneous qualifying videos are globally capped to approximately one counted second per real second.

## Picture-in-Picture

Picture-in-Picture playback is supported through Firefox's existing video and document visibility behaviour. The extension does not use PiP-specific detection.

Verified behaviour:

- Playing PiP counts.
- Paused PiP does not count.
- PiP continues counting when Firefox is minimized.
- PiP continues counting when another Firefox tab is selected.
- Closing PiP stops playback and counting.

Because this behaviour depends on Firefox, it should be retested after major Firefox updates.

## Video breakdown

The popup displays a breakdown of videos watched during the current local calendar day.

For each video, the extension stores:

- The YouTube video ID
- The video title
- The amount of active watch time attributed to that video

Normal videos and live streams are stored separately using their YouTube video IDs. YouTube Shorts are grouped under one `YouTube Shorts` entry.

Advertisements are attributed to the video page being watched. The extension does not attempt to detect advertisements separately.

The detailed video breakdown is retained only for the current day. Historical daily totals are retained, but historical video titles and IDs are not. The breakdown remains entirely local in `browser.storage.local`.

Reset today deletes both today's total watch time and today's per-video breakdown.

## Develop in VS Code

1. Open this folder in VS Code.
2. In Firefox, open `about:debugging`.
3. Select **This Firefox**.
4. Select **Load Temporary Add-on**.
5. Choose `manifest.json`.
6. After editing, return to `about:debugging` and select **Reload**.
7. Reload any open YouTube tabs after changes to `content.js`.

Optional CLI workflow:

```bash
npm install --global web-ext
web-ext lint
web-ext run
```

## Acceptance tests

1. Play normally for 2 minutes. Expect approximately 2 minutes.
2. Pause for 2 minutes. Expect no increase.
3. Switch to another Firefox tab without PiP for 2 minutes. Expect no increase.
4. Keep YouTube visible on one monitor and focus another program. Expect an increase.
5. Use split screen with YouTube visible. Expect an increase.
6. Minimize Firefox without PiP. Expect no increase.
7. Play at 2x speed for 2 real minutes. Expect approximately 2 minutes.
8. Seek forward in the video. Expect no artificial increase.
9. Play a video in PiP for 2 minutes. Expect approximately 2 minutes.
10. Pause the video in PiP. Expect no increase.
11. Keep PiP playing while Firefox is minimized. Expect an increase.
12. Navigate to another normal video in the same tab. Expect a separate breakdown entry.
13. Reset today. Expect today's total and video breakdown to be cleared.

Allow a tolerance of a few seconds because playback is sampled at approximately one-second intervals.

## Package

```bash
web-ext lint
web-ext build
```

Submit the resulting archive through Mozilla Add-ons as an unlisted, self-distributed extension. Keep the Gecko extension ID unchanged for future updates.
