# YouTube Active Watch Time

A private Firefox extension that counts real elapsed time while a YouTube video is playing, advancing, and visibly available either in its Firefox tab or through Picture-in-Picture.

## Version 0.4 rules

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

## Toolbar badge

The toolbar badge displays a compact form of the same daily total shown as **Active Watch Time** in the popup.

- Below one hour: `0m` to `59m`
- From one hour through nine hours: `1h00` to `9h59`
- At ten hours or more: whole hours, such as `10h`

The badge omits seconds and changes only when its displayed value changes. It is restored from `browser.storage.local` when Firefox or the extension starts, and it immediately reflects **Reset today**.

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

## Version 0.4 acceptance tests

1. Load or reload the extension. Expect the badge to show today's compact total immediately.
2. Watch until the next full minute. Expect the badge to advance once at the minute boundary.
3. Pause the video. Expect the badge not to change.
4. Open the popup. Expect the precise total to match the badge's compact representation.
5. Confirm **Reset today**. Expect the popup to show `0s` and the badge to show `0m`.
6. Reload the extension or restart Firefox. Expect the badge to restore today's stored total.
7. Confirm that clickable videos, PiP, visibility, navigation, and the video breakdown still behave as in version 0.3.

## Package

```bash
web-ext lint
web-ext build
```

Submit the resulting archive through Mozilla Add-ons as an unlisted, self-distributed extension. Keep the Gecko extension ID unchanged for future updates.
