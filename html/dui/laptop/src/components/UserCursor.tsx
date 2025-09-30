import { useEffect, useRef, useState } from "react";
import mouseClick from "../assets/mouse_click.mp3";

type CursorType = "normal" | "hover" | "blocked" | "text"; // Defines the possible visual states of the custom cursor.


// Visuals of the cursors.
const CursorSvg = () => <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" transform="scale(1 -1)"><path fill="#FFFFFE" stroke="#000001" stroke-miterlimit="10" d="M12.736 19.04H7.802l2.026-4.122-2.945-1.493-2.26 4.634-3.36-3.276v15.792z" /></svg>;
const CursorHoverSvg = () => <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" transform="scale(1 -1)"><g fill="#FFFFFE" stroke="#000001" stroke-miterlimit="10"><path d="M8.954 21v4.015s0 1.338 1.338 1.338 1.338-1.338 1.338-1.338V21" /><path d="M11.63 21v3.346s0 1.338 1.337 1.338 1.338-1.338 1.338-1.338V21" /><path d="M14.305 21v2.677s0 1.338 1.338 1.338 1.338-1.338 1.338-1.338V17.32s.67-6.69-6.02-6.69c0 0-2.461-.13-4.683 2.007L1.595 17.99s-1.338 1.338 0 2.676c0 0 1.003 1.004 2.676-.669l1.161-1.161a.495.495 0 0 1 .846.35v10.846s0 1.338 1.338 1.338 1.338-1.338 1.338-1.338v-9.031" /></g></svg>;
const CursorBlockedSvg = () => <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" transform="scale(1 -1)"><path fill="#FFFFFE" stroke="#000001" stroke-miterlimit="10" d="M17 23c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8 8-3.589 8-8zm-8 6a5.97 5.97 0 0 1-3.363-1.034l8.33-8.329A5.97 5.97 0 0 1 15 23c0 3.309-2.691 6-6 6zm0-12a5.96 5.96 0 0 1 3.58 1.196l-8.384 8.383A5.96 5.96 0 0 1 3 23c0-3.309 2.691-6 6-6z" /></svg>;
const CursorTextSvg = () => <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" transform="matrix(1,0,0,-1,0,0)"><path fill="#fffffe" stroke="#000001" stroke-miterlimit="10" d="M21 9.5v-2h-4V8h-2v-.5h-4v2h4v13h-4v2h4V24h2v.5h4v-2h-4v-13z"></path></svg>;


// Interface for the props parsed by the parent.
interface UserCursorProps {
    muted: boolean;
}


// Custom cursor component for use within the rendered screen in FiveM.
// The default system cursor cannot be used here, so a custom cursor is manually rendered to track the mouse position within the UI.
export default function UserCursor(props: UserCursorProps) {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [cursorType, setCursorType] = useState<CursorType>("normal"); // default is set to the normal/standard cursor.
    const hasMouseMoved = useRef(false);
    const isMuted = useRef(false);


    useEffect(() => {
        isMuted.current = props.muted;
    }, [props.muted]);


    // Updates the cursor's position and visual state.
    // The mouse position is calculated in the Lua part and sent to the DUI for rendering.
    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => {
            if (!cursorRef.current) return;

            cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

            if (!hasMouseMoved.current) {
                hasMouseMoved.current = true;
            }

            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

            const hoverable = elementUnderCursor?.closest(".hoverable");
            if (hoverable) {
                setCursorType("hover");
                return;
            }

            const blocked = elementUnderCursor?.closest(".blocked");
            if (blocked) {
                setCursorType("blocked");
                return;
            }

            const text = elementUnderCursor?.closest(".textable");
            if (text) {
                setCursorType("text");
                return;
            }

            setCursorType("normal");
        }

        const mouseDownHandler = () => {
            hasMouseMoved.current = false;
        }

        const mouseUpHandler = () => {
            if (!hasMouseMoved.current && !isMuted.current) {
                const audio = new Audio(mouseClick);
                audio.volume = 0.15;
                audio.play();
            }
        }


        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mousedown", mouseDownHandler);
        window.addEventListener("mouseup", mouseUpHandler);

        return () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mousedown", mouseDownHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            style={{
                position: "fixed",
                pointerEvents: "none",
                zIndex: 9999,
                left: 0,
                top: 0
            }}
        >
            {/*debug cursor position: <div style={{ position: "absolute", left: 0, top: 0, width: "6px", height: "6px", backgroundColor: "red", borderRadius: "50%", transform: "translate(-50%, -50%)" }}/>*/}

            {cursorType === "normal" && <CursorSvg />}
            {cursorType === "blocked" && <CursorBlockedSvg />}
            {cursorType === "hover" && (<div style={{ transform: "translate(-11px, 0)" }}><CursorHoverSvg /></div>)}
            {cursorType === "text" && (<div style={{ transform: "translate(-30px, -35px)" }}><CursorTextSvg /></div>)}
        </div>
    );
}