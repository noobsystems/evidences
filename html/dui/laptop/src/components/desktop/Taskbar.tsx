import { useEffect, useState } from "react";
import type { ScreenType } from "../App";
import type { OpenApp } from "../screens/DesktopScreen";
import TaskbarApps from "./TaskbarApps";
import { useTranslation } from "../TranslationContext";

// Props parsed by the parent.
interface TaskbarProps {
    switchScreen: (newScreen: ScreenType) => void;
    mute: (muted: boolean) => void;
    openApps: OpenApp[];
    maximizeApp: (app: OpenApp) => void;
}


// Renders the taskbar of the custom os.
export default function Taskbar(props: TaskbarProps) {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [muted, setMuted] = useState<boolean>(false);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    // Return to the screen saver sceeen if the user logs out.
    const handleLogout = () => props.switchScreen("screensaver");

    const handleUnfocus = () => {
        props.switchScreen("screensaver");

        // make the player unfocus the laptop by emulating pressing the Escape key
        fetch(`https://${location.host}/keydown`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({ key: "Escape" })
        });
    }

    const handleMute = () => {
        const isMuted = !muted;
        setMuted(isMuted);
        props.mute(isMuted);
    }

    // Format time to a specific format.
    const formatTime = (date: Date): string =>
        date.toLocaleTimeString(
            t("laptop.screen_saver.date_locales"),
            { hour: "2-digit", minute: "2-digit", hour12: false }
        );

    return <div style={{
        width: "100%",
        height: "5%",
        bottom: 0,
        background: "#001221",
        color: "#ffffff",
        position: "absolute",
        display: "flex",
        alignItems: "center"
    }}>
        <button
            onClick={handleLogout}
            className="hoverable"
            style={{
                backgroundImage: "linear-gradient(#192029, #0D1216)",
                border: "2px solid #363636",
                height: "80%",
                width: "auto",
                marginLeft: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <svg width="100%" height="100%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
                </svg>
        </button>

        <TaskbarApps openApps={props.openApps} maximizeApp={props.maximizeApp} />

        <div style={{ display: "flex", alignItems: "center", marginRight: "10px", height: "100%" }}>
            <svg style={{ margin: "0 5px" }} height="50%" width="50%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M666-440 440-666l226-226 226 226-226 226Zm-546-80v-320h320v320H120Zm400 400v-320h320v320H520Zm-400 0v-320h320v320H120Zm80-480h160v-160H200v160Zm467 48 113-113-113-113-113 113 113 113Zm-67 352h160v-160H600v160Zm-400 0h160v-160H200v160Zm160-400Zm194-65ZM360-360Zm240 0Z" />
            </svg>

            <svg style={{ margin: "0 5px" }} height="50%" width="50%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
            </svg>

            <button onClick={handleUnfocus} className="hoverable" style={{ display: "flex", background: "none", border: "none", margin: "0 5px", height: "50%", width: "50%" }}>
                <svg height="100%" width="100%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path d="M480-480q-17 0-28.5-11.5T440-520v-320q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840v320q0 17-11.5 28.5T480-480Zm0 360q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-61 20-118.5T198-704q11-14 28-13.5t30 13.5q11 11 10 27t-11 30q-27 36-41 79t-14 88q0 117 81.5 198.5T480-200q117 0 198.5-81.5T760-480q0-46-13.5-89.5T704-649q-10-13-11-28.5t10-26.5q12-12 29-12.5t28 12.5q39 48 59.5 105T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z" />
                </svg>
            </button>

            <button onClick={handleMute} className="hoverable" style={{ display: "flex", background: "none", border: "none", margin: "0 5px", height: "50%", width: "50%" }}>
                {!muted ?
                    <svg height="100%" width="100%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                        <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" />
                    </svg> :
                    <svg height="100%" width="100%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                        <path d="m616-320-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm-496-40v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z" />
                    </svg>}
            </button>

            <svg style={{ margin: "0 5px" }} height="50%" width="50%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M480-120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM254-346l-84-86q59-59 138.5-93.5T480-560q92 0 171.5 35T790-430l-84 84q-44-44-102-69t-124-25q-66 0-124 25t-102 69ZM84-516 0-600q92-94 215-147t265-53q142 0 265 53t215 147l-84 84q-77-77-178.5-120.5T480-680q-116 0-217.5 43.5T84-516Z" />
            </svg>

            <svg style={{ margin: "0 5px" }} height="50%" width="50%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M160-240q-50 0-85-35t-35-85v-240q0-50 35-85t85-35h540q50 0 85 35t35 85v240q0 50-35 85t-85 35H160Zm0-80h540q17 0 28.5-11.5T740-360v-240q0-17-11.5-28.5T700-640H160q-17 0-28.5 11.5T120-600v240q0 17 11.5 28.5T160-320Zm700-60v-200h20q17 0 28.5 11.5T920-540v120q0 17-11.5 28.5T880-380h-20Zm-700 20v-240h320v240H160Z" />
            </svg>

            <p style={{ margin: "0 5px", fontSize: "60%" }}>
                {formatTime(currentTime)}
            </p>
        </div>
    </div>
}