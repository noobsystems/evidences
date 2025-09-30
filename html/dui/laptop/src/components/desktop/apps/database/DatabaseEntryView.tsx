import { useState } from "react";
import { useTranslation } from "../../../TranslationContext";
import type { DatabaseEntry } from "./DatabaseApp";
import styles from "../../../../css/DatabaseEntryView.module.css";

interface DatabaseEntryViewProps {
    databaseEntry: DatabaseEntry;
    handleSave: (databaseEntry: DatabaseEntry) => void;
}

export default function DatabaseEntryView(props: DatabaseEntryViewProps) {
    const { t } = useTranslation();

    const [evidenceData, setEvidenceData] = useState<DatabaseEntry>(props.databaseEntry);

    const handleChange = (field: keyof DatabaseEntry, value: string) => {
        setEvidenceData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return <div style={{ width: "100%", height: "100%", padding: "20px", background: "#c0c0c0ff", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "60%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
            <label style={{ fontSize: "22.5px", textTransform: "uppercase" }}>
                {t("laptop.desktop_screen.common.firstname_placeholder")}
                <input className={`${styles.input} textable`} maxLength={25} value={evidenceData.firstname || ""} onChange={(e) => handleChange("firstname", e.target.value)} />
            </label>

            <label style={{ fontSize: "22.5px", textTransform: "uppercase" }}>
                {t("laptop.desktop_screen.common.lastname_placeholder")}
                <input className={`${styles.input} textable`} maxLength={25} value={evidenceData.lastname || ""} onChange={(e) => handleChange("lastname", e.target.value)} />
            </label>

            <label style={{ fontSize: "22.5px", textTransform: "uppercase" }}>
                {t("laptop.desktop_screen.common.birthdate_placeholder")}
                <input className={`${styles.input} textable`} maxLength={25} value={evidenceData.birthdate || ""} onChange={(e) => handleChange("birthdate", e.target.value)} />
            </label>

            <button className={`${styles.save__button} hoverable`} onClick={() => props.handleSave(evidenceData)}>
                <svg width="30px" height="30px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
                </svg>
                <span style={{ fontSize: "30px" }}>{t("laptop.desktop_screen.common.save_button")}</span>
            </button>
        </div>
    </div>
}