import useLuaCallback from "@/hooks/useLuaCallback";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "./Dropdown";
import { useEffect, useState } from "react";
import { useTranslation } from "@/components/TranslationContext";
import type { InventoriesType } from "@/types/inventory.type";
import type { Firearm } from "@/types/firearm.type";


interface FirearmDropdownProps {
    className?: string;
    selectedFirearm: Firearm | undefined;
    setSelectedFirearm: (firearm: Firearm | undefined) => void;
    onlyWithSerial?: boolean;
}


export default function FirearmDropdown(props: FirearmDropdownProps) {
    const { t } = useTranslation();
    const [firearms, setFirearms] = useState<Firearm[]>([]);

    const { trigger: getPlayersFirearms, loading } = useLuaCallback<void, InventoriesType<{ serial?: string; imperfections?: string }>>({
        name: "evidences:getPlayersFirearms",
         onSuccess: (inventories) => {
            const converted: Firearm[] = [];
            inventories.forEach(inventory => {
                inventory.items.forEach(item => {
                    if (props.onlyWithSerial && !item.details.serial) return;

                    const firearm: Firearm = {
                        serial: item.details.serial,
                        imperfections: item.details.imperfections,
                        label: item.label,
                        imagePath: item.imagePath
                    };
                    converted.push(firearm);
                });

                setFirearms(converted);
            });
        }
    });

    useEffect(() => {
        getPlayersFirearms();
    }, []);

    return <Dropdown<Firearm>
        items={firearms}
        onItemSelect={props.setSelectedFirearm}
        selectedItem={props.selectedFirearm}
        itemToString={(item) => (item.serial || item.imperfections || item.label)}
        loading={loading}
        className={props.className}
    >
        <DropdownSelection<Firearm>
            placeholder={t("laptop.desktop_screen.common.dropdowns.select_firearm")}
        >
            {item => <FirearmView item={item} />}
        </DropdownSelection>

        <DropdownUnfolded<Firearm>>
            {(item, selected) =>
                <DropdownItem<Firearm> key={item.serial || item.imperfections} item={item} selected={selected}>
                    <FirearmView item={item} />
                </DropdownItem>
            }
        </DropdownUnfolded>
    </Dropdown>
}


function FirearmView({ item }: { item: Firearm }) {
    return <div className="flex justify-start items-center gap-4">
        <img src={item.imagePath} className="w-7 h-7" />
        <div className="w-[calc(100%-55px)] flex flex-col">
            <p className="text-30 leading-none text-left truncate">{item.label}</p>
            <p className="text-20 leading-none text-left truncate">{item.serial}</p>
        </div>
    </div>
}