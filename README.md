# YouTube Active Watch Time

A private Firefox extension that counts real elapsed time while a YouTube video is playing, advancing, and visibly available either in its Firefox tab or through Picture-in-Picture.

## Version 0.1 rules

Counts:

- A playing, advancing YouTube video in a visible selected tab
- Visible advertisements
- Real elapsed time at any playback speed
- A visible video even if another desktop application has focus
- Picture-in-Picture playback, including when Firefox is minimized or another Firefox tab is selected

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

## Develop in VS Code

1. Open this folder in VS Code.
2. In Firefox, open `about:debugging`.
3. Select **This Firefox**.
4. Select **Load Temporary Add-on**.
5. Choose `manifest.json`.
6. After editing, return to `about:debugging` and select **Reload**.

Optional CLI workflow:

```bash
npm install --global web-ext
web-ext lint
web-ext run