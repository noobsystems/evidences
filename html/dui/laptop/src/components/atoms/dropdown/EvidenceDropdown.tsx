import useLuaCallback from "@/hooks/useLuaCallback";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "./Dropdown";
import { useEffect, useState } from "react";
import type { InventoriesType } from "@/types/inventory.type";
import type { BiometricEvidence, Evidence, EvidenceDetails } from "@/types/evidence.type";
import { useTranslation } from "@/components/TranslationContext";


interface EvidenceDropdownProps {
    type: BiometricEvidence;
    selectedEvidence: Evidence | undefined;
    setSelectedEvidence: (evidence: Evidence | undefined) => void; 
}


export default function EvidenceDropdown(props: EvidenceDropdownProps) {
    const { t } = useTranslation();
    const [evidences, setEvidences] = useState<Evidence[]>([]);

    const { trigger: getPlayersItemsWithEvidence, loading } = useLuaCallback<{ type: BiometricEvidence }, InventoriesType<EvidenceDetails>>({
        name: "evidences:getPlayersItemsWithEvidence",
        onSuccess: (inventories) => {
            const converted: Evidence[] = [];
            inventories.map(inventory => {
                inventory.items.map(item => {
                    const evidence: Evidence = {
                        label: item.label,
                        imagePath: item.imagePath,
                        inventory: inventory.inventory,
                        slot: item.slot,
                        identifier: item.details.identifier,
                        analysed: item.details.analysed
                    };
                    converted.push(evidence);
                });

                setEvidences(converted);
            });
        }
    });

    useEffect(() => {
        getPlayersItemsWithEvidence({ type: props.type });
    }, []);

    return <Dropdown<Evidence>
        items={evidences}
        onItemSelect={props.setSelectedEvidence}
        selectedItem={props.selectedEvidence}
        itemToString={(item) => item.inventory + "-" + item.slot}

        loading={loading}
        className="w-1/2"
    >
        <DropdownSelection<Evidence>
            displayArrow={false}
            placeholder={t("laptop.desktop_screen.citizens_app.statuses.select_evidence")}
            className="p-0 justify-normal bg-transparent border-none shadow-none outline-none appearance-none"
        >
            {item =>
                <p className="text-30 leading-none text-left truncate hoverable">{item.identifier}</p>
            }
        </DropdownSelection>

        <DropdownUnfolded<Evidence>>
            {(item, selected) =>
                <DropdownItem<Evidence> key={`${item.inventory}-${item.slot}`} item={item} selected={selected}>
                    <div className="flex justify-start items-center gap-4">
                        <img src={item.imagePath} className="w-7 h-7" />
                        <div className="w-[calc(100%-55px)] flex flex-col">
                            <p className="text-30 leading-none text-left truncate">{item.identifier}</p>
                            <p className="text-20 leading-none text-left truncate">{t("laptop.desktop_screen.common.from")} {" "} {item.label}</p>
                        </div>
                    </div>
                </DropdownItem>
            }
        </DropdownUnfolded>
    </Dropdown>
}