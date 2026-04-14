# Dev Browser External Setup Guide

This repo does not bundle the dev-browser runtime.

## Recommended Setup

1. Install or clone dev-browser using the upstream instructions for your platform.
2. Start it in the mode you need:
   - fresh browser session: use the upstream standalone/headless command
   - existing browser session: use the upstream connect/extension command
3. Wait until the tool reports that it is ready before running scripts.

## Important Notes

- Use the external dev-browser environment that provides the `@/client.js` entrypoint referenced by the skill examples.
- If the upstream project changes exact install/start commands, prefer the upstream docs over historical examples.
- For debugging, reconnect and inspect the current page state with another small script rather than trying to recover in one huge step.
