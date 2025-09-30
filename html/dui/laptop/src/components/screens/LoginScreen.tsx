import { useEffect, useState } from "react";
import backgroundImage from "../../assets/background.png";
import type { ScreenType } from "../App";
import { useTranslation } from "../TranslationContext";
import Spinner from "../atoms/Spinner";


export interface PlayerName {
    firstName: string;
    lastName: string;
}

// Interface of all props parsed by the parent.
interface LoginScreenProps {
    playerName: PlayerName | null;
    canAccess: boolean;
    switchScreen: (newScreen: ScreenType) => void;
}


// Renders the login screen along with the automatic login animation.
export default function LoginScreen(props: LoginScreenProps) {
    const { t } = useTranslation();
    const [password, setPassword] = useState(""); // Stores the entered password (used for the typing animation)
    const fullPassword = "MadeByNoobsForNoobs"; // The complete password that gets typed out during the animation

    // Checks if the login animation is complete and the user is allowed access.
    // If so, the screen transitions to the desktop view.
    useEffect(() => {
        if (password === fullPassword) {
            if (props.canAccess) {
                setTimeout(() => {
                    props.switchScreen("desktop");
                }, 2000);
            }
        }
    }, [password, props.canAccess]);


    // Is used for the animation.
    useEffect(() => {
        const speedMs = 80; // smaller for faster animation
        let userTimeouts: number[] = [];

        fullPassword.split("").forEach((char, index) => {
            const timeout = setTimeout(() => {
                setPassword((prev) => prev + char);
            }, speedMs * index);
            userTimeouts.push(timeout);
        });

        return () => {
            userTimeouts.forEach(clearTimeout);
        };
    }, []);


    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "10px", background: `url(${backgroundImage})` }}>
            <svg width="250px" height="250px" style={{ background: "gray", padding: "10px", borderRadius: "50%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="white" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
            </svg>

            {props.playerName && <p style={{ fontSize: "100px", padding: "15px", color: "white" }}>{props.playerName.firstName + " " + props.playerName.lastName}</p> }
        
            {password === fullPassword
                ? props.canAccess
                    ? <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner />
                        <p style={{ color: "white", marginTop: "10px", marginLeft: "20px" }}>{t("laptop.login_screen.welcome")}</p>
                    </div>
                    : <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <p style={{ color: "white" }}>{t("laptop.login_screen.missing_permission")}</p>

                        <div className="hoverable" onClick={() => props.switchScreen("screensaver")} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <svg width="50px" height="50px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                            </svg>
                        </div>
                    </div>
                : <input
                    type="password"
                    value={password}
                    style={{ width: "25%", padding: "10px 20px", color: "white", background: "rgba(255, 255, 255, 0.3)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", border: "2px solid rgba(255, 255, 255, 0.8)", borderRadius: "20px" }}
                    disabled
                />
            }
        </div>
    );
}