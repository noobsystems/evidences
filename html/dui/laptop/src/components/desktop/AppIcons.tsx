import AppIcon from "./AppIcon";
import type { App } from "@/data/apps";
import type { AppArgs } from "@/types/appargs.type";


// Props parsed by the parsed.
interface AppIconsProps {
    apps: App[];
    openApp: (app: App, args?: AppArgs) => void;
}


// Renders all the icons on the desktop.
export default function AppIcons(props: AppIconsProps) {
    return <div className="grid grid-flow-col grid-cols-[repeat(6,1fr)] grid-rows-[repeat(6,1fr)] w-120 h-full">
        {props.apps.map(app =>
            <div key={app.id} style={{ gridColumn: app.position.col, gridRow: app.position.row }}>
                <AppIcon app={app} width="95px" height="95px" onClick={(app, args) => props.openApp(app, args)} />
            </div>
        )}
    </div>
}