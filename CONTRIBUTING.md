# Contributing

Thanks for helping make keyboard configuration accessible without the Windows driver.

## Start here

Search existing issues before opening a duplicate. For substantial features or protocol changes, open a feature proposal first. Small fixes can go directly to a pull request.

1. Fork the repository and create a focused branch.
2. Serve it with `python3 -m http.server 3000`.
3. Run `node --experimental-default-type=module protocol.test.mjs` with Node.js 22+.
4. Exercise the changed browser workflow, including error and disconnected states.
5. Explain the behavior, verification, and any limitations in your pull request.

## Hardware and protocol changes

- Match the exact VID/PID and HID collection. Model names alone are insufficient.
- Separate static evidence, inference, and physical verification.
- Document command bytes, payload layout, expected effects, and references.
- Test on your own compatible hardware. Never probe unknown reset, bootloader, or flash commands as a shortcut.
- Preserve validation, serialized writes, and error reporting.
- Connection and draft editing must not write to hardware. Apply remains explicit.
- Keep local last-sent state distinct from actual hardware readback.
- Add a deterministic regression for plausible consumer-visible bugs. Do not require a connected device in CI.

## UI changes

Keep the keyboard docked below desktop controls, preserve narrow-screen access, support both themes, and retain visible keyboard focus. Respect reduced-motion and reduced-transparency settings. Verify that edits do not create accidental hardware writes.

## Reports and privacy

Include OS/browser versions, keyboard mode, USB VID/PID, steps, expected behavior, and observed behavior. Redact serial numbers, personal data, tokens, and unrelated device logs. A successful write alone does not prove the lighting changed: describe what you saw.

## License and conduct

Contributions are provided under the project's MIT license. Retain upstream attribution. Be respectful, assume good intent, and keep technical disagreement specific to evidence and behavior. The maintainer can moderate abusive or unrelated content.
