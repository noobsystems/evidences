import { useEffect, useState } from "react";
import backgroundImage from "../../assets/background.png";
import type { ScreenType } from "../App";
import { useTranslation } from "../TranslationContext";
import styles from "../../css/ScreenSaver.module.css";


// This is the interface for the props parsed by the parent component.
interface ScreenSaverScreenProps {
    switchScreen: (newScreen: ScreenType) => void;
}


// Render the screen saver screen.
export default function ScreenSaverScreen(props: ScreenSaverScreenProps) {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [animateOut, setAnimateOut] = useState(false);


    // Handle click and switch to login screen.
    function handleClick() {
        setAnimateOut(true);

        setTimeout(() => {
            props.switchScreen("login");
        }, 750);
    }


    // Update time on screen every second.
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString(t("laptop.screen_saver.date_locales"), { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString(t("laptop.screen_saver.date_locales"), { weekday: "long", day: "numeric", month: "long" });
    }


    return (
        <div
            onClick={handleClick}
            style={{
                width: "100%",
                height: "100%",
                background: `url(${backgroundImage})`,
                position: "relative"
            }}
        >
            <div style={{ position: "absolute", bottom: "50px", left: "50px", color: "white", zIndex: 10 }} className={`${styles.screensaver__container} ${animateOut ? styles.slide__up : ""}`}>
                <p style={{ fontSize: "150px" }}>{formatTime(currentTime)}</p>
                <p>{formatDate(currentTime)}</p>
            </div>
        </div>
    );
}
