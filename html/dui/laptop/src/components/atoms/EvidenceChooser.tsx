import { useEffect, useState } from "react";
import styles from "../../css/EvidenceChooser.module.css";

export interface EvidenceDetails {
    crimeScene: string;
    collectionTime: string;
    additionalData: string;
}

interface InventoryItem {
    imagePath: string;
    label: string;
    slot: number;
    identifier: string;
    details: EvidenceDetails
}

interface Inventory {
    container: number | string;
    label: string;
    items: InventoryItem[];
}

type Inventories = Inventory[];


export interface EvidenceData {
    identifier: string;
    firstname: string;
    lastname: string;
    birthdate: string;
}


export interface ChosenEvidence {
    evidence: {
        label: string;
        imagePath: string;
        container: number | string,
        slot: number,
        identifier: string
    } | null,
    timestamp: number
}


export interface EvidenceChooserTranslations {
    noItemsWithEvidences: string;
}

interface EvidenceChooserProps {
    type: "FINGERPRINT" | "DNA";
    chosenEvidence: ChosenEvidence | null;
    translations: EvidenceChooserTranslations;
    onEvidenceSelection: (label: string, imagePath: string, container: number | string, slot: number, identifier: string, details: EvidenceDetails) => void;
}


export default function EvidenceChooser(props: EvidenceChooserProps) {
    const [inventories, setInventories] = useState<Inventories | null>(null);


    const updateInventories = () => {
        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:getPlayersItemsWithBiometricData",
                arguments: {
                    type: props.type
                }
            }),
        }).then(response => response.json()).then(response => {
            setInventories(response);
        });
    }

    useEffect(() => {
        if (!props.chosenEvidence?.evidence) updateInventories();
    }, [props.chosenEvidence]);


    return inventories && (
        <div className={styles.evidence__chooser}>
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {inventories.length == 0
                    ? <p style={{ fontSize: "20px" }}>{props.translations.noItemsWithEvidences}</p>
                    : inventories.map((inventory) =>
                        <div key={inventory.container} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <p style={{ padding: "0 5px", fontSize: "20px", textTransform: "uppercase" }}>{inventory.label}</p>
                            {inventory.items.map((item) => {
                                const active = props.chosenEvidence?.evidence
                                    && inventory.container == props.chosenEvidence.evidence.container
                                    && item.slot == props.chosenEvidence.evidence.slot
                                    && item.identifier == props.chosenEvidence.evidence.identifier

                                return <button key={item.identifier} className={`${styles.item__button} hoverable ${active ? styles.active : ""}`} onClick={() => props.onEvidenceSelection(item.label, item.imagePath, inventory.container, item.slot, item.identifier, item.details)}>
                                    <img src={item.imagePath} style={{ width: "35px", height: "35px" }}></img>
                                    <p style={{ fontSize: "30px", textAlign: "left", textTransform: "capitalize", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.label}</p>
                                </button>
                            })}
                        </div>
                    )
                }
            </div>
        </div>
    );
}