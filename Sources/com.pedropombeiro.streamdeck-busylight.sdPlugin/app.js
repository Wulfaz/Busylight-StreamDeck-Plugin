/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help you quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    // Subscribe to the willAppear and other events
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.willDisappear', (jsonObj) => action.onWillDisappear(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.applicationDidLaunch', (jsonObj) => action.onApplicationDidLaunch(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.applicationDidTerminate', (jsonObj) => action.onApplicationDidTerminate(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.pedropombeiro.streamdeck-busylight.toggle.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};

// ACTIONS

const action = {
    settings:{},
    cache: {},

    getContextFromCache: function (ctx) {
        return this.cache[ctx];
    },

    onDidReceiveSettings: function(jsn) {
        console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');

        this.settings = Utils.getProp(jsn, 'payload.settings', {});

         const found = this.getContextFromCache(jsn.context);
         if (found) {
             found.refreshButtonAsync();
         }
     },

    /**
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * shown on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: async function (jsn) {
        console.log("You can cache your settings in 'onWillAppear'", jsn.payload.settings);
        /**
         * The willAppear event carries your saved settings (if any). You can use these settings
         * to setup your plugin or save the settings for later use.
         * If you want to request settings at a later time, you can do so using the
         * 'getSettings' event, which will tell Stream Deck to send your data
         * (in the 'didReceiceSettings above)
         *
         * $SD.api.getSettings(jsn.context);
        */
        this.settings = jsn.payload.settings;

        if (!jsn.payload.isInMultiAction) {
            const watcher = new BusylightHttpWatcher(jsn);

            // cache the current watcher
            this.cache[jsn.context] = watcher;
        }

        // // Nothing in the settings pre-fill, just something for demonstration purposes
        // if (!this.settings || Object.keys(this.settings).length === 0) {
        // }
    },

    onWillDisappear: function (jsn) {
        let found = this.getContextFromCache(jsn.context);
        if (found) {
            found.stop();
            delete this.cache[jsn.context];
        }
    },

    onKeyUp: function (jsn) {
        const watcher = this.getContextFromCache(jsn.context);
        /** Edge case +++ */
        if (!watcher) this.onWillAppear(jsn);

        this.toggleBusylightAsync(jsn, 'onKeyUp', 'green');
    },

    onSendToPlugin: function (jsn) {
        /**
         * This is a message sent directly from the Property Inspector
         * (e.g. some value, which is not saved to settings)
         * You can send this event from Property Inspector (see there for an example)
         */

        const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
        if (sdpi_collection.value && sdpi_collection.value !== undefined) {
            // this.toggleBusylightAsync({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');
        }
    },

    onApplicationDidLaunch: function (jsn) {
        setTimeout(() => {
            const found = this.getContextFromCache(jsn.context);
            if (found) {
                found.refreshButtonAsync();
			};
        }, 2000);
    },

    onApplicationDidTerminate: function (jsn) {
        const found = this.getContextFromCache(jsn.context);
        if (found) {
            found.refreshButtonAsync();
        }
    },

    /**
     * This snippet shows how you could save settings persistantly to Stream Deck software.
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },

    /**
     * Finally here's a method which gets called from various events above.
     * This is just an idea on how you can act on receiving some interesting message
     * from Stream Deck.
     */

     toggleBusylightAsync: async function(inJsonData, caller, tagColor) {
        console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]toggleBusylightAsync from: ${caller}`);
        // console.log(inJsonData);

        switch (inJsonData.payload.userDesiredState) {
            case 0:
                await fetch('http://localhost:8989?action=light&green=50');
                break;

            case 1:
                await fetch('http://localhost:8989?action=pulse&red=100');
                break;
        }

        if (inJsonData.payload.isInMultiAction) {
            return;
        }

        const found = this.getContextFromCache(inJsonData.context);
        if (found) {
            await found.refreshButtonAsync();
        }
    }

};

function BusylightHttpWatcher (jsonObj) {
    var context = jsonObj.context,
        timer = 0


    function start() {
        if (timer !== 0) {
            return;
        }

        console.log('[app.js]starting watcher')
        refreshButtonAsync();
        timer = setInterval(function (sx) {
            refreshButtonAsync();
        }, 5000);
    }

    function stop() {
        if (timer === 0) {
            return;
        }

        console.log('[app.js]stopping watcher')
        window.clearInterval(timer);
        timer = 0;
    }

    async function refreshButtonAsync() {
        console.log('%c%s', `color: white; background: 'grey'; font-size: 15px;`, `[app.js]refreshButtonAsync`);

        try {
            const resp = await fetch('http://localhost:8989?action=currentpresence');
            if (resp.status != 200) {
                $SD.api.setTitle(jsn.context, resp.status);
                $SD.api.send(context, 'showAlert');
                return;
            }

            const payload = await resp.json();
            const parameter = payload.runningcommand.parameter;

            $SD.api.setTitle(context, '');

            if (parameter == null) {
                return;
            }

            const paramJSON = JSON.parse(parameter);
            if (paramJSON.action === 'light' || paramJSON.action === 'pulse') {
                let newState = undefined;

                if (paramJSON.green !== undefined && paramJSON.green > 0) {
                    newState = 0;
                } else if (paramJSON.red !== undefined && paramJSON.red > 0) {
                    newState = 1;
                }

                if (newState !== undefined) {
                    $SD.api.send(context, 'setState', {
                        payload: {
                            "state": newState
                        }
                    });
                    $SD.api.send(context, 'showOk');
                }
            }
        } catch (error) {
            console.log(error);
            $SD.api.setTitle(context, 'NOT INSTALLED');
            $SD.api.send(context, 'showAlert');
            return;
        }
    }

    start();

    return {
        timer: timer,
        refreshButtonAsync: refreshButtonAsync,
        stop: stop
    };
};
