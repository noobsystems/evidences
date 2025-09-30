import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../../TranslationContext";
import EvidenceChooser, { type ChosenEvidence, type EvidenceData, type EvidenceDetails } from "../../../atoms/EvidenceChooser";
import EvidenceDataView from "../../../atoms/EvidenceDataView";


export default function FingerprintApp() {
    const { t } = useTranslation();
    const [fingerprintData, setFingerprintData] = useState<EvidenceData | null>(null);
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

        fetch("https://evidences/triggerServerCallback", {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:getStoredPersonalDataFromIdentifier",
                arguments: {
                    type: "fingerprint",
                    identifier: identifier
                }
            })
        }).then(response => response.json()).then(response => setFingerprintData(response));
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
        setFingerprintData((prev) =>
            prev
                ? {
                    ...prev,
                    [field]: value,
                }
                : null
        );
    }, []);

    const handleEvidenceDataSave = useCallback(() => {
        if (!fingerprintData) return;

        const trimmedFingerprintData = Object.fromEntries(
            Object.entries(fingerprintData).map(([key, value]) => [key, value.trim() || ""])
        );

        fetch("https://evidences/triggerServerCallback", {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:storePersonalData",
                arguments: {
                    ...trimmedFingerprintData,
                    type: "fingerprint",
                    biometricData: fingerprintData.identifier
                }
            })
        });
    }, [fingerprintData]);

    const handleEvidenceLabelling = useCallback(() => {
        if (!chosenEvidence || !chosenEvidence.evidence || (!evidenceDetails && !fingerprintData)) return;

        const trimmedEvidenceDetails = Object.fromEntries(
            Object.entries(evidenceDetails || {}).map(([key, value]) => [key, value.trim() || ""])
        );

        const trimmedFingerprintData = Object.fromEntries(
            Object.entries(fingerprintData || {}).map(([key, value]) => [key, value.trim() || ""])
        );

        fetch("https://evidences/triggerServerCallback", {
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
                        FINGERPRINT: {
                            ...trimmedFingerprintData
                        }
                    }
                }
            })
        });
    }, [chosenEvidence, evidenceDetails, fingerprintData]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.action && event.data.action == "focus") {
                setChosenEvidence({ evidence: null, timestamp: new Date().getTime() });
                setFingerprintData(null);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return <div style={{ width: "100%", height: "100%", padding: "0 20px 20px", display: "flex", justifyContent: "flex-end", background: "#c0c0c0ff" }}>
        <EvidenceChooser
            type="FINGERPRINT"
            chosenEvidence={chosenEvidence}
            translations={{
                noItemsWithEvidences: t("laptop.desktop_screen.fingerprint_app.no_items_with_fingerprints")
            }}
            onEvidenceSelection={handleEvidenceSelection}
        />

        <EvidenceDataView
            type="FINGERPRINT"
            chosenEvidence={chosenEvidence}
            evidenceDetails={evidenceDetails}
            evidenceData={fingerprintData}
            translations={{
                tooltipSave: t("laptop.desktop_screen.fingerprint_app.tooltip_save"),
                noEvidenceSelected: t("laptop.desktop_screen.fingerprint_app.no_fingerprint_selected")
            }}
            onEvidenceDetailsChange={handleEvidenceDetailsChange}
            onEvidenceDataChange={handleEvidenceDataChange}
            onEvidenceDataSave={handleEvidenceDataSave}
            onEvidenceLabelling={handleEvidenceLabelling}
        />
    </div>;
}