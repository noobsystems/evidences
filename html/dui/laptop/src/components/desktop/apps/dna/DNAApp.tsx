import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../../TranslationContext";
import EvidenceChooser, { type ChosenEvidence, type EvidenceData, type EvidenceDetails } from "../../../atoms/EvidenceChooser";
import EvidenceDataView from "../../../atoms/EvidenceDataView";


export default function DNAApp() {
    const { t } = useTranslation();
    const [dnaData, setDnaData] = useState<EvidenceData | null>(null);
    const [chosenEvidence, setChosenEvidence] = useState<ChosenEvidence | null>(null);
    const [evidenceDetails, setEvidenceDetails] = useState<EvidenceDetails | null>(null);

    const handleEvidenceSelection = useCallback((label: string, imagePath: string, container: number | string, slot: number, identifier: string, details: EvidenceDetails) => {
        setChosenEvidence({
            evidence: {
                label: label,
                imagePath: imagePath,
                container: container,
                slot: slot,
                identifier: identifier
            },
            timestamp: new Date().getTime()
        });
        setEvidenceDetails(details);

        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:getStoredPersonalDataFromIdentifier",
                arguments: {
                    type: "dna",
                    identifier: identifier
                }
            })
        }).then(response => response.json()).then(response => setDnaData(response));
    }, []);

    const handleEvidenceDetailsChange = useCallback((field: keyof EvidenceDetails, value: string) => {
        setEvidenceDetails((prev) =>
            prev
                ? {
                    ...prev,
                    [field]: value,
                }
                : null
        );
    }, []);

    const handleEvidenceDataChange = useCallback((field: keyof EvidenceData, value: string | boolean) => {
        setDnaData((prev) =>
            prev
                ? {
                    ...prev,
                    [field]: value,
                }
                : null
        );
    }, []);

    const handleEvidenceDataSave = useCallback(() => {
        if (!dnaData) return;

        const trimmedFingerprintData = Object.fromEntries(
            Object.entries(dnaData).map(([key, value]) => [key, value.trim() || ""])
        );

        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:storePersonalData",
                arguments: {
                    ...trimmedFingerprintData,
                    type: "dna",
                    biometricData: dnaData.identifier
                }
            })
        });
    }, [dnaData]);

    const handleEvidenceLabelling = useCallback(() => {
        if (!chosenEvidence || !chosenEvidence.evidence || (!evidenceDetails && !dnaData)) return;

        const trimmedEvidenceDetails = Object.fromEntries(
            Object.entries(evidenceDetails || {}).map(([key, value]) => [key, value.trim() || ""])
        );

        const trimmedFingerprintData = Object.fromEntries(
            Object.entries(dnaData || {}).map(([key, value]) => [key, value.trim() || ""])
        );

        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:labelEvidenceItem",
                arguments: {
                    container: chosenEvidence.evidence.container,
                    slot: chosenEvidence.evidence.slot,
                    information: {
                        ...trimmedEvidenceDetails,
                        DNA: {
                            ...trimmedFingerprintData
                        }
                    }
                }
            })
        });
    }, [chosenEvidence, evidenceDetails, dnaData]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.action && event.data.action == "focus") {
                setChosenEvidence({ evidence: null, timestamp: new Date().getTime() });
                setDnaData(null);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return <div style={{ width: "100%", height: "100%", padding: "0 20px 20px", display: "flex", justifyContent: "flex-end", background: "#c0c0c0ff" }}>
        <EvidenceChooser
            type="DNA"
            chosenEvidence={chosenEvidence}
            translations={{
                noItemsWithEvidences: t("laptop.desktop_screen.dna_app.no_items_with_dna")
            }}
            onEvidenceSelection={handleEvidenceSelection}
        />

        <EvidenceDataView
            type="DNA"
            chosenEvidence={chosenEvidence}
            evidenceDetails={evidenceDetails}
            evidenceData={dnaData}
            translations={{
                tooltipSave: t("laptop.desktop_screen.dna_app.tooltip_save"),
                noEvidenceSelected: t("laptop.desktop_screen.dna_app.no_dna_selected")
            }}
            onEvidenceDetailsChange={handleEvidenceDetailsChange}
            onEvidenceDataChange={handleEvidenceDataChange}
            onEvidenceDataSave={handleEvidenceDataSave}
            onEvidenceLabelling={handleEvidenceLabelling}
        />
    </div>;
}