PLUGIN_NAMESPACE := net.wulfaz.busylight
export PLUGIN_DIR := $(PLUGIN_NAMESPACE).sdPlugin
export RELEASE_FILE := $(PLUGIN_NAMESPACE).streamDeckPlugin

.PHONY: setup
setup:
	npm install -g @elgato/cli
	npm install

.PHONY: build
build:
	npm run build

.PHONY: watch
watch:
	npm run watch

.PHONY: release
release:
	@scripts/release

.PHONY: pack
pack: build
	streamdeck pack $(PLUGIN_DIR)

.PHONY: install
install: pack
	@open $(RELEASE_FILE)
