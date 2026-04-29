# Stream Deck Busylight integration

The `Stream Deck Busylight` plugin integrates the Stream Deck with the [kuando Busylight](https://busylight.com/) presence indicator. It's perfect for letting your family know when you're in a Zoom call.

`Stream Deck Busylight` requires Stream Deck 7.1 or later, as well as the official [kuando Busylight HTTP](https://www.plenom.com/download/177233/) software.

> This project is a fork of [streamdeck-busylight](https://github.com/pedropombeiro/streamdeck-busylight) by Pedro Pombeiro, rewritten for the Stream Deck SDK v3 with TypeScript and Node.js.

## Description

`Stream Deck Busylight` provides a single action which toggles the light between solid green (off-air) and glowing red (on-air).

It requires no configuration — it connects to the kuando Busylight HTTP server on the default address (`localhost:8989`). The button state automatically syncs with the light every 5 seconds, so it stays accurate even if the light is changed from another source.

## Features

- Written in TypeScript (Stream Deck SDK v3)
- Cross-platform (macOS, Windows)
- Localization support (EN, FR, DE, PT)

## Installation

**Prerequisite**: Install the official [kuando Busylight HTTP](https://www.plenom.com/download/177233/) software.

Download the [latest release](https://github.com/Wulfaz/Busylight-StreamDeck-Plugin/releases) and double-click the `.streamDeckPlugin` file to install.

## Building from source

```bash
npm install -g @elgato/cli
npm install
npm run build
streamdeck pack net.wulfaz.busylight.sdPlugin
```

## Demo

[YouTube video](https://youtu.be/fgxbG2PBowo) (original demo by Pedro Pombeiro) — the Busylight action is on the second row from the top, third column from the right.
