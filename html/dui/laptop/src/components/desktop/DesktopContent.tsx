import AppIcons from "./AppIcons";
import MoveableApp from "./MoveableApp";
import type { OpenApp } from "../screens/DesktopScreen";
import { AppsList, type App } from "../../data/apps";
import { useRef } from "react";


// Props parsed by the parent.
interface DesktopContentProps {
    openApps: OpenApp[];
    openApp: (app: App) => void;
    closeApp: (app: OpenApp) => void;
    focusApp: (app: OpenApp) => void;
    onMinimize: (app: OpenApp) => void;
    openPopUp: (parentApp: OpenApp, name: string, content: React.ReactNode) => void;
}


// Renders the content of the desktop.
export default function DesktopContent(props: DesktopContentProps) {
    const lastFocusedAppPosition = useRef({ x: 0, y: 0 });
    const defaultPosition = { ...lastFocusedAppPosition.current };

    return <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <AppIcons apps={AppsList()} openApp={props.openApp} />
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
                openPopUp={(name, content) => props.openPopUp(app, name, content)}
                isPopUp={app.isPopUp}
                defaultPosition={defaultPosition}
                width={width}
                height={height}
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