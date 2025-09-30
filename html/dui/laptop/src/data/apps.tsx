import type React from "react";
import DNAApp from "../components/desktop/apps/dna/DNAApp";
import FingerprintApp from "../components/desktop/apps/fingerprint/FingerprintApp";
import DatabaseApp from "../components/desktop/apps/database/DatabaseApp";
import { useTranslation } from "../components/TranslationContext";
import fingerprintIcon from "../assets/app_icons/fingerprint.png";
import dnaIcon from "../assets/app_icons/dna.png";
import databaseIcon from "../assets/app_icons/database.png";

export interface App {
    name: string;
    icon: (width: string, height: string) => React.ReactNode;
    content: React.ReactNode;
}

export const AppsList = () => {
    const { t } = useTranslation();

    return [
        {
            name: t("laptop.desktop_screen.fingerprint_app.name"),
            icon: (width: string, height: string) => <img width={width} height={height} src={fingerprintIcon} draggable="false" />,
            content: <FingerprintApp />
        },
        {
            name: t("laptop.desktop_screen.dna_app.name"),
            icon: (width: string, height: string) => <img width={width} height={height} src={dnaIcon} draggable="false" />,
            content: <DNAApp />
        },
        {
            name: t("laptop.desktop_screen.database_app.name"),
            icon: (width: string, height: string) => <img width={width} height={height} src={databaseIcon} draggable="false" />,
            content: <DatabaseApp />
        }
    ];
};