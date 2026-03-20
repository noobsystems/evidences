import type React from "react";
import CitizensApp from "@/components/desktop/apps/citizens/CitizensApp";
import DNAApp from "@/components/desktop/apps/dna/DNAApp";
import FingerprintApp from "@/components/desktop/apps/fingerprint/FingerprintApp";
import FirearmsRegistryApp from "@/components/desktop/apps/firearms_registry/FirearmsRegistryApp";
import BallisticsApp from "@/components/desktop/apps/ballistics/BallisticsApp";
import WiretapApp from "@/components/desktop/apps/wiretap/WiretapApp";
import citizensIcon from "@/assets/app_icons/citizens.png";
import fingerprintIcon from "@/assets/app_icons/fingerprint.png";
import dnaIcon from "@/assets/app_icons/dna.png";
import firearmsRegistryIcon from "@/assets/app_icons/firearms_registry.png";
import ballisticsIcon from "@/assets/app_icons/ballistics.png";
import wiretapIcon from "@/assets/app_icons/wiretap.png";
import { useTranslation } from "@/components/TranslationContext";

export interface AppPosition {
    col: number;
    row: number;
}

export interface App {
    id: string;
    name: string;
    position: AppPosition;
    icon: (width: string, height: string) => React.ReactNode;
    content: (props?: any) => React.ReactNode;
}


export const AppsList = (): App[] => {
    const { t } = useTranslation();

    return [
        {
            id: "citizens",
            name: t("laptop.desktop_screen.citizens_app.name"),
            position: { col: 1, row: 1 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={citizensIcon} draggable="false" />,
            content: (props) => <CitizensApp {...props} />
        },
        {
            id: "fingerprint",
            name: t("laptop.desktop_screen.fingerprint_app.name"),
            position: { col: 1, row: 2 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={fingerprintIcon} draggable="false" />,
            content: (props) => <FingerprintApp {...props} />
        },
        {
            id: "dna",
            name: t("laptop.desktop_screen.dna_app.name"),
            position: { col: 1, row: 3 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={dnaIcon} draggable="false" />,
            content: (props) => <DNAApp {...props} />
        },
        {
            id: "firearms_registry",
            name: t("laptop.desktop_screen.firearms_registry_app.name"),
            position: { col: 2, row: 1 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={firearmsRegistryIcon} draggable="false" />,
            content: (props) => <FirearmsRegistryApp {...props} />
        },
        {
            id: "ballistics",
            name: t("laptop.desktop_screen.ballistics_app.name"),
            position: { col: 2, row: 2 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={ballisticsIcon} draggable="false" />,
            content: (props) => <BallisticsApp {...props} />
        },
        {
            id: "wiretap",
            name: t("laptop.desktop_screen.wiretap_app.name"),
            position: { col: 3, row: 1 },
            icon: (width: string, height: string) => <img style={{ width, height }} className="object-contain max-h-full max-w-full" src={wiretapIcon} draggable="false" />,
            content: (props) => <WiretapApp {...props} />
        }
    ];
};