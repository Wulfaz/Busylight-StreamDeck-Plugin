DISTRIBUTIONTOOL ?= .tmp/DistributionTool
PLUGIN_NAMESPACE := com.pedropombeiro.streamdeck-busylight
SOURCE_DIR := Sources/$(PLUGIN_NAMESPACE).sdPlugin
RELEASE_FILE := Release/$(PLUGIN_NAMESPACE).streamDeckPlugin

.PHONY: release
release: $(RELEASE_FILE)

.PHONY: install
install: release
	@rm -rf ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/$(PLUGIN_NAMESPACE).sdPlugin
	@open $(RELEASE_FILE)

$(RELEASE_FILE): $(DISTRIBUTIONTOOL) $(SOURCE_DIR)/*
	@rm -f $(RELEASE_FILE)
	$(DISTRIBUTIONTOOL) -b -i $(SOURCE_DIR) -o Release

$(DISTRIBUTIONTOOL): DOWNLOAD_URL = "https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolMac.zip"
$(DISTRIBUTIONTOOL):
	# Installing $(DOWNLOAD_URL) as $(DISTRIBUTIONTOOL)
	@mkdir -p $(shell dirname $(DISTRIBUTIONTOOL))
	@curl -sL $(DOWNLOAD_URL) -o $(shell dirname $(DISTRIBUTIONTOOL))/DistributionToolMac.zip
	@unzip -p "$(shell dirname $(DISTRIBUTIONTOOL))/DistributionToolMac.zip" > $(DISTRIBUTIONTOOL)
	@chmod +x "$(DISTRIBUTIONTOOL)"
