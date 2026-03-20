import type { AppArgs } from "@/types/appargs.type";
import type { App } from "@/data/apps";


// Props parsed by the parent.
interface AppIconProps {
    app: App;
    width: string;
    height: string;
    onClick: (app: App, args?: AppArgs) => void;
    taskbarIcon?: boolean;
}


// Renders a specific app icon (on desktop and taskbar).
export default function AppIcon(props: AppIconProps) {
    return (
        <div
            className={`w-full h-full flex justify-center items-center flex-col hoverable ${!props.taskbarIcon ? "p-3" : "p-0"}`}
            onClick={() => props.onClick(props.app)}
        >
            <div className={`w-full h-full flex justify-center items-center flex-col gap-1 px-2 py-1 hover:bg-white/33 hover:rounded-10`}>
                {props.app.icon(props.width, props.height)}
                {!props.taskbarIcon && <p className="h-[40%] w-full text-white text-24 leading-none text-center">{props.app.name}</p>}
            </div>
        </div>
    );
}