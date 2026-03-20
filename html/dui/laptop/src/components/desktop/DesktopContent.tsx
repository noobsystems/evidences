import AppIcons from "./AppIcons";
import MoveableApp from "./MoveableApp";
import type { OpenApp } from "../screens/DesktopScreen";
import { AppsList, type App } from "@/data/apps";
import { useRef } from "react";
import type { Options } from "../App";
import type { AppArgs } from "@/types/appargs.type";


// Props parsed by the parent.
interface DesktopContentProps {
    playerName: string | undefined;
    options: Options | undefined;
    openApps: OpenApp[];
    openApp: (app: App, args?: AppArgs) => void;
    closeApp: (app: OpenApp) => void;
    focusApp: (app: OpenApp) => void;
    onMinimize: (app: OpenApp) => void;
    openPopUp: (parentApp: OpenApp, name: string, content: React.ReactNode) => void;
}


// Renders the content of the desktop.
export default function DesktopContent(props: DesktopContentProps) {
    const lastFocusedAppPosition = useRef({ x: 0, y: 0 });
    const defaultPosition = { ...lastFocusedAppPosition.current };
    const appList = AppsList();
    const filteredAppsList = appList.filter((app) => !props.options?.disabledApps.includes(app.id));


    const handleAppOpen = (appId: string, args?: AppArgs) => {
        const app = appList.find(app => app.id === appId);
        if (!app) return;
        props.openApp(app, args);
    }


    return <div className="w-full h-[95%] relative">
        <AppIcons apps={filteredAppsList} openApp={props.openApp} />
        {props.openApps.map((app) => {
            const width = app.isPopUp ? 1000 : 1400;
            const height = app.isPopUp ? 600 : 850;

            defaultPosition.x += 50;
            defaultPosition.y += 50;

            if (defaultPosition.x + width >= 1920) {
                defaultPosition.x = 50;
                defaultPosition.y = 50;
            }

            return <MoveableApp
                key={app.name}
                app={app}
                openApp={handleAppOpen}
                openPopUp={(name, content) => props.openPopUp(app, name, content)}
                close={() => props.closeApp(app)}
                isPopUp={app.isPopUp}
                defaultPosition={defaultPosition}
                width={width}
                height={height}
                playerName={props.playerName}
                options={props.options}
                onClose={props.closeApp}
                onMinimize={props.onMinimize}
                onFocus={props.focusApp}
                onUpdatePosition={(x, y) => {
                    lastFocusedAppPosition.current.x = x;
                    lastFocusedAppPosition.current.y = y;
                }} />
        })}
    </div>;
}