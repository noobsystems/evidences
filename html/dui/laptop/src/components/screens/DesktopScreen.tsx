import backgroundImage from "../../assets/background.png";
import DesktopContent from "../desktop/DesktopContent";
import Taskbar from "../desktop/Taskbar";
import type { ScreenType } from "../App";
import React, { useState } from "react";
import type { App } from "../../data/apps";


// Interface for the props parsed by the parent.
interface DesktopScreenProps {
    switchScreen: (newScreen: ScreenType) => void;
    mute: (muted: boolean) => void;
}


// Extends the App type to include an additional state for open applications.
// Adds a "minimized" flag to track whether the app is minimized.
export type OpenApp = App & { minimized: boolean, isPopUp?: boolean, parent?: OpenApp, zIndex: number };


// Renders the desktop screen of the laptop.
export default function DesktopScreen(props: DesktopScreenProps) {
    const [openApps, setOpenApps] = useState<OpenApp[]>([]); // all open apps, default none
    // const [focusedApp, setFocusedApp] = useState<OpenApp | null>(null); // sets the app that is focused by the player.
    const [focusedAppIndex, setFocusedAppIndex] = useState<number>(1);


    function updateZIndexOfApp(app: OpenApp) {
        setOpenApps(prev => prev.map(a => a.name == app.name ? { ...a, zIndex: focusedAppIndex + 1 } : a));
        setFocusedAppIndex(prev => prev + 1);
    }


    function getPopUpsByApp(app: OpenApp) {
        return openApps.filter(a => a.parent?.name === app.name);
    }


    // Handles minimizing an app.
    // Updates the app's state to "minimized" and clears the focused app.
    function handleMinimizeApp(app: OpenApp) {
        setOpenApps(currentApps => currentApps.map(a => (a.name === app.name || (a.parent && a.parent.name === app.name)) ? { ...a, minimized: true } : a));
    }


    // Restores a minimized app to its active state.
    // Sets the app's "minimized" property to false and brings it into focus.
    // Called when the user clicks to maximize or reopen a minimized app.
    function handleMaximizeApp(app: OpenApp) {
        setOpenApps(currentApps => currentApps.map(a => (a.name === app.name || (a.parent && a.parent.name === app.name)) ? { ...a, minimized: false } : a));
        updateZIndexOfApp(app);
        getPopUpsByApp(app).map(updateZIndexOfApp);
    }


    // Opens an app by adding it to the list of open apps if it's not already open.
    // Sets the app's minimized state to false and brings it into focus.
    // Called when the user opens an app.
    function handleAppOpen(app: App) {
        const openApp: OpenApp = { ...app, minimized: false, zIndex: 1 };

        const existingApp = openApps.find((a) => a.name === app.name);
        if (existingApp && existingApp.minimized) {
            // Maximize the app
            handleMaximizeApp(openApp);
        } else {
            // Open the app
            setOpenApps((prev) => {
                if (existingApp) return prev;
                return [...prev, openApp];
            });
            updateZIndexOfApp(openApp);
        }
    }


    // Brings the specified app to the front by setting it as the focused app.
    // Called when the user selects or interacts with an app to make it active.
    function handleBringToFront(app: OpenApp) {
        updateZIndexOfApp(app);
    }


    // Closes the specified app by removing it from the list of open apps.
    // Called when the user closes an app window.
    function handleAppClose(app: OpenApp) {
        setOpenApps((prev) => prev.filter((a) => a.name !== app.name && a.parent?.name !== app.name));
    }


    // Creates an pop-up to the app.
    function openPopUp(parentApp: OpenApp, name: string, content: React.ReactNode) {
        const popupApp: OpenApp = {
            name: name,
            icon: parentApp.icon,
            content: content,
            minimized: false,
            isPopUp: true,
            parent: parentApp,
            zIndex: 0
        }

        setOpenApps(prev => [
            ...prev,
            popupApp
        ]);
        updateZIndexOfApp(popupApp);
    }


    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: `url(${backgroundImage})`,
                position: "relative"
            }}
        >
            <DesktopContent openApps={openApps} openPopUp={openPopUp} openApp={handleAppOpen} onMinimize={handleMinimizeApp} focusApp={handleBringToFront} closeApp={handleAppClose} />
            <Taskbar switchScreen={props.switchScreen} mute={props.mute} maximizeApp={handleMaximizeApp} openApps={openApps} />
        </div>
    );
}
