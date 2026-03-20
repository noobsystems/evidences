import { useEffect } from "react";
import useLuaCallback from "@/hooks/useLuaCallback";
import { Sidebar, SidebarItem, SidebarSection } from "./Sidebar";
import type { EvidenceType, Evidence } from "@/types/evidence.type";
import type { EvidenceAnalysedEvent } from "@/types/events.type";
import { useTranslation } from "@/components/TranslationContext";
import type { InventoriesType } from "@/types/inventory.type";


interface EvidenceSidebarProps<T> {
    type: EvidenceType;
    evidence: Evidence | null;
    translations: {
        noItemsWithEvidences: string;
    };
    onEvidenceSelection: (label: string, imagePath: string, inventory: number | string, slot: number, identifier: string, analysed: boolean, details: T) => void;
    onDataChange: (dataAvailable: boolean) => void;
}


export default function EvidenceSidebar<T>(props: EvidenceSidebarProps<T>) {
    const { t } = useTranslation();

    const { trigger, data: inventories, setData: setInventories, loading } = useLuaCallback<{ type: EvidenceType }, InventoriesType<T>>({
        name: "evidences:getPlayersItemsWithEvidence",
        defaultData: [],
        onSuccess: (data) => props.onDataChange(data.length > 0)
    });

    useEffect(() => {
        trigger({ type: props.type });
 
        const handleMessage = (event: MessageEvent) => {
            if (event.data.action && event.data.action == "focus") {
                trigger({ type: props.type });
            }
        };

        const handleAnalysed = (e: Event) => {
            const event = e as CustomEvent<EvidenceAnalysedEvent>;
            const { inventory, slot, type } = event.detail;

            if (type != props.type) return;

            setInventories(prev => {
                if (!prev) return prev;

                return prev.map(inv => {
                    if (inv.inventory != inventory) return inv;

                    return {
                        ...inv,
                        items: inv.items.map(item => {
                            if (item.slot != slot) return item;

                            return {
                                ...item,
                                details: {
                                    ...item.details,
                                    analysed: true
                                }
                            };
                        })
                    };
                });
            });
        };

        window.addEventListener("message", handleMessage);
        window.addEventListener("evidences:analysed", handleAnalysed);

        return () => {
            window.removeEventListener("message", handleMessage);
            window.removeEventListener("evidence:analysed", handleAnalysed);
        };
    }, []);

    return <Sidebar className="w-70 h-full shrink-0">
        {(!inventories || (inventories.length == 0 && !loading))
            ? <div className="w-full h-full flex justify-center items-center">
                <p className="text-20 leading-none text-center">{props.translations.noItemsWithEvidences}</p>
            </div>
            : (inventories.length == 0 && loading)
                ? <div className="w-full h-full flex justify-center items-center">
                    <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.loading")}</p>
                </div>
                : inventories && inventories.map((inventory) => (
                    <SidebarSection title={inventory.label}>
                        {inventory.items.map((item) => {
                            const active = props.evidence
                                && inventory.inventory == props.evidence.inventory
                                && item.slot == props.evidence.slot
                                && item.details.identifier == props.evidence.identifier

                            return <SidebarItem
                                active={!!active}
                                imagePath={item.imagePath}
                                description={item.details.analysed ? t("laptop.desktop_screen.common.statuses.analysed") : undefined}
                                onClick={() => props.onEvidenceSelection(item.label, item.imagePath, inventory.inventory, item.slot, item.details.identifier, item.details.analysed, item.details)}
                            >
                                {item.label}
                            </SidebarItem>
                        })}
                    </SidebarSection>
                ))
        }
    </Sidebar>
}