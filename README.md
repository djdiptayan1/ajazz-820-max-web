# AJAZZ 820 Max Web

[![Checks](https://github.com/djdiptayan1/ajazz-820-max-web/actions/workflows/checks.yml/badge.svg)](https://github.com/djdiptayan1/ajazz-820-max-web/actions/workflows/checks.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A community-built WebHID lighting controller for compatible **AJAZZ AK820** keyboards. Change effects and paint individual keys directly from your browser—without the Windows driver.

**Unofficial and independent. Not affiliated with or endorsed by AJAZZ.** Model names are not enough to establish compatibility: check the USB identifiers below.

## What works

- Lighting effects with supported brightness, speed, direction, and palette controls.
- Per-key RGB painting, fill-all, and dark-frame editing.
- Preview first, then explicitly **Apply to keyboard**.
- **Draft / Last sent** views, with the last successful upload remembered in your browser.
- Physical-code key tester.
- Dark, Light, and System appearance with saved preference.
- Desktop controls above a stationary keyboard; responsive narrow-screen previews.

Connecting or editing a draft does not write to the keyboard. Applying custom RGB replaces the complete lighting frame; unpainted keys become dark.

## Compatibility

| Requirement | Support |
| --- | --- |
| USB vendor / product | `1a2c:a036` |
| Configuration collection | Usage page `0xFF02`, usage `0x02` |
| Connection | Wired USB |
| Browser | Desktop Chrome or Edge with WebHID |
| Page origin | `localhost` or HTTPS |
| Keyboard mode | Lighting physically verified in Windows and Mac modes |
| Bluetooth / 2.4 GHz receiver | Not supported by this app |
| Safari / Firefox | No WebHID control; not supported for hardware access |

The tested device identifies as **Shinetek Technology AK820**. Other AK820-branded variants can use different controllers and protocols. Do not broaden device filters without checking the hardware.

## Quick start

No dependencies or build step are required.

```sh
git clone https://github.com/djdiptayan1/ajazz-820-max-web.git
cd ajazz-820-max-web
python3 -m http.server 3000
```

1. Open **http://localhost:3000** in Chrome or Edge.
2. Connect the keyboard with a USB data cable.
3. Click **Connect keyboard**, select AK820, and approve the browser prompt.
4. Choose **Effects** or **Per-key colors** and edit your draft.
5. Click **Apply to keyboard** when ready.

For custom painting, choose a color and click keys. **Fill all keys** and **Make all dark** only edit the draft until Apply.

### Important preview limitation

There is **no known lighting readback command** in the documented protocol. The app cannot retrieve colors saved using keyboard shortcuts or another application.

**Last sent is a local record, not a live hardware reading.** It persists in this browser and origin. Clearing site storage removes it. Effect previews indicate selected colors; they do not reproduce exact hardware animations. Preset effects use seven palette colors or rainbow; arbitrary RGB is available in custom mode. Brightness 1/5 is dim, not off.

## Deploy on Vercel

Import this repository with these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Root directory | Repository root |
| Build command | None |
| Output directory | `.` |

The repository includes `vercel.json`. Open the deployment directly in a browser tab, not an embedded preview. Approve the keyboard again for the deployed HTTPS origin. Localhost permissions, previews, and appearance preferences do not transfer to the deployment.

## Development

The app uses native JavaScript modules and plain HTML/CSS.

| File | Purpose |
| --- | --- |
| `index.html` | Workspace and accessible controls |
| `style.css` | Responsive layout and appearance tokens |
| `app.js` | Draft editing, persistence, connection UI |
| `protocol.js` | HID framing, validation, serialized writes |
| `layout.js` | Physical keys, LED indices, browser key mapping |
| `protocol.test.mjs` | Color, packet boundary, and key-mapping regressions |

Run the regression checks with Node.js 22 or newer:

```sh
node --experimental-default-type=module protocol.test.mjs
```

Then serve the app and exercise the affected browser workflow. Hardware claims require a real device test; packet construction tests alone are not proof.

## Protocol and evidence

Reports contain 64 bytes and use `sendReport(0, data)`. The header is `AA 55 CC 33`, command is byte 4, and payload starts at byte 5.

- `07`: effect settings, including mode minus one and zero-based brightness/speed.
- `0B`, then `F6`–`FB`: custom RGB, six 54-byte chunks forming 108 RGB LED slots.
- Verified indices include Esc 15, W 55, A 59, S 60, D 61, Enter 70, and Space 94. LED 80 is slash, not Space.

Physical tests confirmed static colors and a custom frame with Esc green, WASD cyan, Space magenta, and Enter yellow. Other effects are sourced from the upstream protocol research and are not individually verified by this project.

Protocol and layout research comes from **[prasoondev/ajazz-linux](https://github.com/prasoondev/ajazz-linux)**, particularly `ajazzctl/protocol.py`, `ajazzctl/layout.py`, and [`docs/PROTOCOL.md`](https://github.com/prasoondev/ajazz-linux/blob/master/docs/PROTOCOL.md). Upstream attribution is preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Not implemented

Keys & layers, Performance, Macros, and Profiles remain visible with honest availability notices. Hardware remapping, macro uploads, onboard profiles, battery readout, music streaming, performance writes, and factory reset are not implemented. No firmware flashing is provided.

Contributions toward these features are welcome, but require evidence for the correct controller and observable hardware behavior. Unknown commands are not safe defaults.

## Troubleshooting

- **No keyboard in the chooser:** use wired mode and a data-capable cable. Check the supported VID/PID; close other keyboard configuration tools.
- **WebHID unavailable:** use desktop Chrome/Edge on localhost or HTTPS. Mobile and embedded browsers may not expose USB access.
- **Permission or connection failure:** reconnect the keyboard, close other tabs using it, then connect again. Browser and OS device-access policy can block access.
- **Preview differs from keyboard:** Last sent is not readback. Physical shortcuts and other applications can change hardware independently.
- **Colors disappeared after deployment:** browser storage and permissions are origin-specific. Recreate the draft on the deployed site.
- **Fn or OS shortcuts do not highlight:** firmware or macOS may intercept them before the page receives keyboard events.

## Contributing

Bug reports, hardware observations, accessibility improvements, and pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Use the issue templates to include the exact USB IDs, browser, connection mode, and reproduction steps. Never include serial numbers or unrelated device data.

Please keep discussion respectful and focused on reproducible behavior. Report security concerns privately using [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). Includes MIT-licensed protocol/layout research from prasoondev/ajazz-linux; see [third-party notices](THIRD_PARTY_NOTICES.md). Vendor binaries and firmware are not distributed in this repository.
