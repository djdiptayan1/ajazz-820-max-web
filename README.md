# AJAZZ 820 Max Web

## Run

```sh
python3 -m http.server 3000
```

Open http://localhost:3000 in Chrome or Edge. Connect the keyboard by USB cable.
Click **Connect Keyboard**, select AK820, and approve Chrome's device chooser.

- **Lighting:** choose Effects or Per-key colors, edit the draft, then click **Apply to keyboard**.
- Per-key painting never sends immediately. Fill all keys and Make all dark edit only the draft.
- Custom uploads contain the whole frame. Unpainted keys are dark.
- Preset effects accept seven palette colors or rainbow, not arbitrary RGB. Brightness 1/5 is dim, not off.
- Live key testing uses browser physical key codes. Fn and OS-reserved shortcuts may not reach the page.
- **Draft / Last sent:** compare edits with the most recent successful write, saved locally in this browser and restored after reload.
- There is no known lighting readback command. Colors changed with physical keyboard shortcuts or another application cannot be recovered automatically. The vendor app also keeps its own local state.
- Connecting does not change keyboard lighting. Last sent is a local copy, never proof of current hardware state.
- All feature sections remain navigable. Unsupported sections explain their limits rather than presenting nonfunctional forms.
- Desktop controls use multiple columns above a stationary bottom keyboard. Both lighting modes fit without scrolling at 1280×800 and 1440×900. Shorter windows scroll only the controls; mobile retains normal scrolling.
- **Appearance:** choose Dark, Light, or System in the toolbar. The preference persists in this browser; System follows OS appearance. Theme changes never change hardware colors.

## Deploy on Vercel

Import this repository. Use **Other** as the framework preset, repository root as the root directory, no build command, and `.` as the output directory.

Vercel HTTPS supports WebHID in desktop Chrome/Edge. Approve the keyboard again on the deployed origin. Local previews and appearance settings are stored per origin and do not transfer from localhost.

## Hardware and evidence

Targets only wired VID `1a2c`, PID `a036`, collection `FF02:02`.
Each WebHID output is `sendReport(0, data)` with 64 data bytes.
Header: `AA 55 CC 33`; command at byte 4; payload starts at byte 5.

- Effect command `07`: mode minus one, brightness 0–4, speed 0–4, direction 0/1, palette 0–7.
- Custom RGB: command `0B`, then `F6`–`FB`, each carrying 54 RGB bytes across a 108-LED frame.
- Correct indices include Esc 15, W 55, A 59, S 60, D 61, Enter 70, Space 94. LED 80 is slash, not Space.

The user confirmed the browser-driven Esc green, WASD cyan, Space magenta, and Enter yellow test on physical hardware.
The browser also completed a static-red write. Other effects are sourced from ajazz-linux, not individually checked here.

Protocol and layout source: [prasoondev/ajazz-linux](https://github.com/prasoondev/ajazz-linux), `ajazzctl/protocol.py`, `ajazzctl/layout.py`, and `docs/PROTOCOL.md`.
The extracted OemDrv.exe targets a different controller; its older packet format is not used by this web app.

Bluetooth and receiver configuration are not supported. Battery responses remain unverified.
Remapping, macros, profiles, music streaming, performance settings, and factory reset controls remain disabled; they do not send speculative commands.
No firmware flashing is implemented. Custom colors may be stored by the keyboard.

## Regression check

```sh
node --experimental-default-type=module protocol.test.mjs
```

## Changes

- Replaced the incompatible inline driver with one shared module implementation.
- Integrated hardware-confirmed output framing and corrected per-key LED indices.
- Serialized RGB uploads and surfaced transfer errors without false success messages.
- Removed the obsolete assembler that could restore incorrect packets.
- Redesigned as a keyboard-first workspace with accessible controls, responsive layout and reduced-motion support.
- Added explicit preview-before-apply editing and persistent last-sent colors. Verified actual WebHID upload and reload restoration in Chrome.
