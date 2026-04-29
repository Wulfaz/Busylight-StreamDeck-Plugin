import streamDeck from "@elgato/streamdeck";
import { ToggleBusylightAction } from "./actions/toggle-busylight";

const toggleAction = new ToggleBusylightAction();
streamDeck.actions.registerAction(toggleAction);

streamDeck.system.onApplicationDidLaunch(() => {
    setTimeout(() => toggleAction.refreshAllWatchers(), 2000);
});

streamDeck.system.onApplicationDidTerminate(() => {
    toggleAction.refreshAllWatchers();
});

streamDeck.connect();
