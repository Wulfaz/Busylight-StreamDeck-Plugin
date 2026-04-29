# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Requirements

- Node.js 20+
- Stream Deck 7.1+
- `@elgato/cli` installed globally: `npm install -g @elgato/cli`

## Commands

```bash
make setup      # Install @elgato/cli globally + npm install
npm run build   # Compile TypeScript → net.wulfaz.busylight.sdPlugin/bin/plugin.js
npm run watch   # Watch mode with live-reload in Stream Deck
make install    # Build, pack, and open .streamDeckPlugin to install
make release    # Bump patch version in manifest.json, build, pack, git commit
```

Manual pack only:
```bash
streamdeck pack net.wulfaz.busylight.sdPlugin
```

## Project structure

```
src/
  plugin.ts                   # Entry point — registers actions, wires app monitoring
  actions/
    toggle-busylight.ts       # SingletonAction + BusylightWatcher

net.wulfaz.busylight.sdPlugin/
  manifest.json               # Plugin metadata and action declarations
  bin/                        # Compiled output (gitignored)
  imgs/
    plugin-icon.png / @2x
    actions/toggle/           # key, off-air, on-air images
  en.json / fr.json / de.json / pt.json   # Localization

rollup.config.mjs             # Bundles src/ → sdPlugin/bin/plugin.js (CJS)
tsconfig.json
package.json
scripts/release               # Version bump + build + pack + git commit
```

## Architecture

TypeScript Node.js plugin using the `@elgato/streamdeck` v2 SDK (TC39 stage-3 decorators — do **not** add `experimentalDecorators: true` to `tsconfig.json`).

**`src/plugin.ts`** — registers `ToggleBusylightAction`, sets up plugin-level `onApplicationDidLaunch`/`onApplicationDidTerminate` listeners via `streamDeck.system`, then calls `streamDeck.connect()`. Actions must be registered before `connect()`.

**`ToggleBusylightAction`** (`SingletonAction`) — one class instance handles all physical button instances. Per-button state lives in `this.watchers: Map<actionId, BusylightWatcher>`. On `onWillAppear` a watcher is created (skipped for multi-action slots); on `onWillDisappear` it is stopped and removed. On `onKeyUp` the desired state is derived from `ev.payload.userDesiredState` (multi-action) or `(currentState + 1) % 2` (normal), the HTTP command is sent, then all watchers refresh.

**`BusylightWatcher`** — polls `http://localhost:8989?action=currentpresence` every 5 seconds and calls `setState()` to keep the button in sync with the physical light. On HTTP error it sets the button title to `"NOT INSTALLED"`. `DisableAutomaticStates: true` in the manifest ensures Stream Deck never auto-toggles the button — state is always driven by the poll result.

**Application monitoring** is plugin-level (not per-action in SDK v3). When the Busylight HTTP app launches, a 2-second delay is used before refreshing so the server has time to start.

**Version** lives in `manifest.json` (`.Version` field). `scripts/release` increments the last dot-segment with `jq` + `awk`, then builds, packs, and commits.
