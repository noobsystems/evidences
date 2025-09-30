import React, { createContext, useEffect, useRef, useState } from "react";
import type { OpenApp } from "../screens/DesktopScreen";
import styles from "../../css/MoveableApp.module.css";


// Props parsed by the parent.
interface MoveableAppProps {
    app: OpenApp;
    isPopUp?: boolean;
    defaultPosition?: { x: number, y: number };
    width: number;
    height: number;
    onClose: (app: OpenApp) => void;
    onFocus: (app: OpenApp) => void;
    onMinimize: (app: OpenApp) => void;
    openPopUp: (name: string, content: React.ReactNode) => void;
    onUpdatePosition: (x: number, y: number) => void;
}



interface AppContextType {
    openPopUp: (name: string, content: React.ReactNode) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);


// Renders an open app on the desktop.
export default function MoveableApp(props: MoveableAppProps) {
    const screenRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(props.defaultPosition || { x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState(props.defaultPosition || { x: 0, y: 0 });

    useEffect(() => {
        props.onUpdatePosition(position.x, position.y);
    }, []);

    // Used to drag the window around.
    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };


    // When dragged update the window position.
    const onMouseMove = (e: MouseEvent) => {
        if (!dragging || !screenRef.current) return;

        const screen = screenRef.current.getBoundingClientRect();
        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;

        newX = Math.max(0, Math.min(screen.width - 25, newX));
        newY = Math.max(0, Math.min(screen.height - 25, newY));

        setPosition({ x: newX, y: newY });
        props.onUpdatePosition(newX, newY);
    };


    // Stop dragging.
    const onMouseUp = () => {
        setDragging(false);
    };


    // Listeners
    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    });


    return (
        <div
            ref={screenRef}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                overflow: "hidden",
                top: 0,
                left: 0,
                pointerEvents: "none"
            }}
        >
            <div
                onMouseDown={() => props.onFocus(props.app)}
                style={{
                    width: props.width + "px",
                    height: props.height + "px",
                    position: "absolute",
                    left: position.x,
                    top: position.y,
                    userSelect: "none",
                    borderRadius: "10px",
                    overflow: "hidden",
                    pointerEvents: "auto",
                    zIndex: props.app.zIndex,
                    display: props.app.minimized ? "none" : "block",
                    boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.4)"
                }}
            >
                <div onMouseDown={onMouseDown} style={{
                    width: "100%",
                    height: "42px",
                    background: "#c0c0c0ff",
                    position: "relative",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <div style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        height: "100%",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <span style={{ fontSize: "25px" }}>{props.app.name.toUpperCase()}</span>
                    </div>

                    <div style={{ height: "100%", display: "flex", alignItems: "center", gap: "7.5px", marginRight: "20px"}}>
                        {!props.isPopUp &&
                            <button className={`${styles.minimize__button} hoverable`} onClick={() => props.onMinimize(props.app)}>
                                <svg width="25px" height="25px" fill="#c0c0c0ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                    <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z"/>
                                </svg>
                            </button>
                        }

                        <button className={`${styles.close__button} hoverable`} onClick={() => props.onClose(props.app)}>
                            <svg width="25px" height="25px" fill="#c0c0c0ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div style={{ width: "100%", height: (props.height - 42) + "px", background: "transparent" }}>
                    <AppContext.Provider value={{ openPopUp: props.openPopUp }}>
                        {props.app.content}
                    </AppContext.Provider>
                </div>
            </div>
        </div>
    );
}