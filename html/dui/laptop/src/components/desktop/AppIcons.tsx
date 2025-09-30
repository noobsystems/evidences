import AppIcon from "./AppIcon";
import type { App } from "../../data/apps";


// Props parsed by the parsed.
interface AppIconsProps {
    apps: App[];
    openApp: (app: App) => void;
}


// Renders all the icons on the desktop.
export default function AppIcons(props: AppIconsProps) {
    return <div style={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        width: "600px",
        height: "600px"
    }}>
        {props.apps.map(app => <AppIcon app={app} width="95px" height="95px" onClick={(app) => props.openApp(app)} />)}
    </div>
}