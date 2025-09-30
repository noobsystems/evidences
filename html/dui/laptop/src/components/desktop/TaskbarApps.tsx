import type { OpenApp } from "../screens/DesktopScreen";
import AppIcon from "./AppIcon";


// Props parsed by the parent.
interface TaskbarAppsProps {
    openApps: OpenApp[];
    maximizeApp: (app: OpenApp) => void;
}


// Renders the app icons in the taskbar.
export default function TaskbarApps(props: TaskbarAppsProps) {
    return <div style={{ flex: 1, padding: "0 10px", display: "flex", alignItems: "center", height: "100%" }}>
        {props.openApps.filter(app => !app.isPopUp).map(app =>
            <div style={{
                height: "80%",
                margin: "0 2px"
            }}>
                <AppIcon app={app} width="auto" height="100%" onClick={() => props.maximizeApp(app)} hideName disableMargin />
            </div>
        )}
    </div>
}