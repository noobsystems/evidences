import type { App } from "../../data/apps";
import styles from "../../css/AppIcon.module.css";


// Props parsed by the parent.
interface AppIconProps {
    app: App;
    width: string;
    height: string;
    onClick: (app: App) => void;
    hideName?: boolean;
    disableMargin?: boolean;
}


// Renders a specific app icon (on desktop and taskbar).
export default function AppIcon(props: AppIconProps) {
    return <div
        className="hoverable"
        onClick={() => props.onClick(props.app)}
        style={{
            width: "100%",
            height: "100%",
            padding: !props.disableMargin ? "10px 10px" : "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
    }}>
        <div className={styles.app__icon} style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: "5px"
        }}>
            {props.app.icon(props.width, props.height)}
            {!props.hideName && <p style={{ color: "white", fontSize: "24px", height: "40%", width: "100%", textAlign: "center" }}>{props.app.name}</p>}
        </div>
    </div>
}