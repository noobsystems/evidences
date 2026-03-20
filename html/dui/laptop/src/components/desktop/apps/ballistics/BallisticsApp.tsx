import { useEffect, useState } from "react";
import type { Evidence, WeaponEvidenceDetails } from "@/types/evidence.type";
import EvidenceSidebar from "@/components/atoms/sidebar/EvidenceSidebar";
import BallisticsAnalysis from "./BallisticsAnalysis";
import { useTranslation } from "@/components/TranslationContext";

export default function BallisticsApp() {
    const { t } = useTranslation();
    const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
    const [evidenceDetails, setEvidenceDetails] = useState<WeaponEvidenceDetails | null>(null);
    const [evidencesAvailable, setEvidencesAvailable] = useState<boolean>(false);

    const handleEvidenceSelection = (label: string, imagePath: string, inventory: number | string, slot: number, identifier: string, analysed: boolean, details: WeaponEvidenceDetails) => {
        setSelectedEvidence({
            label: label,
            imagePath: imagePath,
            inventory: inventory,
            slot: slot,
            identifier: identifier,
            analysed: analysed
        });
        setEvidenceDetails(details);
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.action && event.data.action == "focus") {
                setSelectedEvidence(null);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return <div className="w-full h-full px-4 pb-4 flex gap-4 bg-window">
        <EvidenceSidebar
            type="ballistics"
            evidence={selectedEvidence}
            translations={{
                noItemsWithEvidences: t("laptop.desktop_screen.ballistics_app.no_ballistics_evidence_items")
            }}
            onEvidenceSelection={handleEvidenceSelection}
            onDataChange={setEvidencesAvailable}
        />

        {evidencesAvailable &&
            <BallisticsAnalysis selectedEvidence={selectedEvidence} evidenceDetails={evidenceDetails} />
        }
    </div>;
}