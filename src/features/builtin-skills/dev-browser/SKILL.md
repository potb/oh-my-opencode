---
name: dev-browser
description: Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include "go to [url]", "click on", "fill out the form", "take a screenshot", "scrape", "automate", "test the website", "log into", or any browser interaction request.
---

# Dev Browser Skill

Browser automation that maintains page state across script executions.

## Setup

This repo does not bundle the dev-browser runtime. Install and run dev-browser from an external checkout or upstream distribution.

See [references/installation.md](references/installation.md) for the minimal current guidance.

## Modes

- **Standalone mode**: use a fresh browser session
- **Connect mode**: use an existing browser session when the user is already logged in

Ask the user which mode they want if unclear.

## Running Scripts

Run scripts from the external dev-browser environment that provides the `@/client.js` entrypoint used below.

```bash
npx tsx <<'EOF'
import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("example", { viewport: { width: 1920, height: 1080 } });

await page.goto("https://example.com");
await waitForPageLoad(page);

console.log({ title: await page.title(), url: page.url() });
await client.disconnect();
EOF
```

## Key Principles

1. Use small scripts that do one thing.
2. Log or return state after each step.
3. Use descriptive page names.
4. Disconnect when done.
5. Keep browser-context code plain JavaScript.

## Error Recovery

If a script fails, reconnect to the same named page, inspect the current URL/title/screenshot, and continue with another small script.
