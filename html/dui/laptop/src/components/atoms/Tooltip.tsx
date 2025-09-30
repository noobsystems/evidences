import { useState } from "react";

export const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {
    const [isVisible, setVisisble] = useState<boolean>(false);

    return (
        <div
            onMouseEnter={() => setVisisble(true)}
            onMouseLeave={() => setVisisble(false)}
            style={{ position: "relative", display: "flex", alignItems: "center" }}
        >
            {children}
            {isVisible && <span style={{
                position: "absolute",
                top: "calc(-100% - 100px)",
                backgroundColor: "#333",
                borderRadius: "10px",
                zIndex: 1,
                minWidth: "300px",
                color: "white",
                padding: "10px",
                fontSize:" 20px"
            }}>{text}</span>}
        </div>
    );
};