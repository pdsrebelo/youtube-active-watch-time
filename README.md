# YouTube Active Watch Time

A private Firefox extension that counts real elapsed time while a YouTube video is playing, advancing, and visibly available either in its Firefox tab or through Picture-in-Picture.

## Version 0.3 rules

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

Normal videos and live streams are stored separately using their YouTube video IDs. Their titles are clickable and open the video in a new Firefox tab. Video IDs are validated before a link is created.

YouTube Shorts are grouped under one `YouTube Shorts` entry and are not clickable because that entry can represent multiple Shorts. Unknown video entries are also not clickable.

Advertisements are attributed to the video page being watched. The extension does not attempt to detect advertisements separately.

The detailed video breakdown is retained only for the current day. Historical daily totals are retained, but historical video titles and IDs are not. The breakdown remains entirely local in `browser.storage.local`.

Reset today asks for confirmation and then deletes both today's total watch time and today's per-video breakdown.

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

## Version 0.3 acceptance tests

1. Expand today's video breakdown.
2. Click a normal video title. Expect it to open in a new Firefox tab.
3. Activate the title with the keyboard. Expect Enter or Space to open it.
4. Confirm that `YouTube Shorts` and `Unknown YouTube video` have no link indicator and cannot be opened.
5. Select **Reset today**, then cancel the confirmation. Expect no data to be deleted.
6. Select **Reset today**, then accept the confirmation. Expect today's total and breakdown to be cleared.
7. Confirm that normal playback, pause, PiP, visibility, navigation, and live popup updates still behave as in version 0.2.

## Package

```bash
web-ext lint
web-ext build
```

Submit the resulting archive through Mozilla Add-ons as an unlisted, self-distributed extension. Keep the Gecko extension ID unchanged for future updates.
