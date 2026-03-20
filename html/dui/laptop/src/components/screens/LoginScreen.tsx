import { useEffect, useState } from "react";
import backgroundImage from "@/assets/background.png";
import startup from "@/assets/startup.mp3";
import type { ScreenType } from "../App";
import { useTranslation } from "../TranslationContext";
import Spinner from "../atoms/Spinner";


// Interface of all props parsed by the parent.
interface LoginScreenProps {
    playerName: string | undefined;
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
                    const audio = new Audio(startup);
                    audio.volume = 0.75;
                    audio.play();
                }, 500);

                setTimeout(() => {
                    props.switchScreen("desktop");
                }, 2000);
            }
        }
    }, [password, props.canAccess]);


    // Is used for the animation.
    useEffect(() => {
        const speedMs = 80; // smaller for faster animation
        let userTimeouts: ReturnType<typeof setTimeout>[] = [];

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
        <div className="w-full h-full flex flex-col justify-center items-center gap-2" style={{ background: `url(${backgroundImage})` }}>
            <svg width="250px" height="250px" className="bg-[gray] p-2 rounded-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="white" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
            </svg>

            {props.playerName && <p className="text-100 p-3 text-white">{props.playerName}</p> }
        
            {password === fullPassword
                ? props.canAccess
                    ? <div className="flex items-center">
                        <Spinner />
                        <p className="text-white text-50 leading-none mt-2 ml-4">{t("laptop.login_screen.welcome")}</p>
                    </div>
                    : <div className="flex items-center g-4">
                        <p className="text-white text-50 leading-none">{t("laptop.login_screen.missing_permission")}</p>

                        <div className="flex justify-center items-center hoverable" onClick={() => props.switchScreen("screensaver")}>
                            <svg width="50px" height="50px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                            </svg>
                        </div>
                    </div>
                : <input
                    type="password"
                    value={password}
                    className="w-1/4 px-4 py-2 text-white text-50 leading-none bg-white/30 border-2 border-white/80 rounded-20 shadow-glass"
                    disabled
                />
            }
        </div>
    );
}