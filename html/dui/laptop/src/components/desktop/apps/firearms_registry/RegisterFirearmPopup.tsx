import CitizenDropdown from "@/components/atoms/dropdown/CitizenDropdown";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "@/components/atoms/dropdown/Dropdown";
import FirearmDropdown from "@/components/atoms/dropdown/FirearmDropdown";
import { useTranslation } from "@/components/TranslationContext";
import { useAppContext } from "@/hooks/useAppContext";
import useLuaCallback from "@/hooks/useLuaCallback";
import type Citizen from "@/types/citizen.type";
import { Status, type Firearm, type RegisteredFirearm, type StatusType } from "@/types/firearm.type";
import { useState } from "react";


interface RegisterFirearmPopUpProps {
    checkAlreadyRegistered: (serial: string) => boolean;
    onUpdateFirearm: (firearm: RegisteredFirearm, deletion: boolean) => void;
    onClose: () => void;
}


export default function RegisterFirearmPopUp(props: RegisterFirearmPopUpProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();

    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | undefined>();
    const [selectedFirearm, setSelectedFirearm] = useState<Firearm | undefined>();

    const registeredBy = appContext.playerName || "";

    const [reason, setReason] = useState<string>("");
    const [status, setStatus] = useState<StatusType>(Status.REGISTERED);


    const { trigger, loading } = useLuaCallback<RegisteredFirearm, void>({
        name: "evidences:registerFirearm",
        onSuccess: (_, args) => {
            props.onUpdateFirearm(args, false);
            props.onClose();
            appContext.close();
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_registration_error") })
    });


    const handleSaveEntry = () => {
        if (!selectedCitizen || !selectedFirearm) {
            appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.common.statuses.fill_all_fields") });
            return;
        }

        if (props.checkAlreadyRegistered(selectedFirearm.serial!!)) {
            appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_already_registered") });
            return;
        }

        trigger({
            serial: selectedFirearm.serial,
            label: selectedFirearm.label,
            imagePath: selectedFirearm.imagePath,
            identifier: selectedCitizen.identifier,
            reason: reason,
            registeredBy: registeredBy,
            registeredAt: Date.now(),
            status: status?.id || Status.UNKNOWN.id
        });
    };

    return <div className="w-full h-full p-4 bg-window flex justify-center">
        <div className="w-[60%] h-full flex flex-col justify-evenly items-center">
            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.firearms_registry_app.registration_popup.firearm")}</span>
                <FirearmDropdown selectedFirearm={selectedFirearm} setSelectedFirearm={setSelectedFirearm} onlyWithSerial />
            </div>
            
            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.firearms_registry_app.registration_popup.citizen")}</span>
                <CitizenDropdown selectedCitizen={selectedCitizen} setSelectedCitizen={setSelectedCitizen} />
            </div>

            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.firearms_registry_app.registration_popup.reason")}</span>
                <textarea className="input resize-none scrollbar textable" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.firearms_registry_app.registration_popup.status")}</span>
                <Dropdown<StatusType>
                    items={Object.values(Status)}
                    onItemSelect={item => setStatus(item)}
                    selectedItem={status}
                    itemToString={item => t(item.translationKey)}
                    className="w-full"
                >
                    <DropdownSelection<StatusType> placeholder={t("laptop.desktop_screen.firearms_registry_app.status.")}>
                        {item => (
                            <p className="text-30 leading-none text-left truncate">{t(item.translationKey)}</p>
                        )}
                    </DropdownSelection>
                    <DropdownUnfolded<StatusType>>
                        {(item, selected) => (
                            <DropdownItem<StatusType> key={item.id} item={item} selected={selected} className={item.classNameHover}>
                                <p className="text-30 leading-none text-left truncate">{t(item.translationKey)}</p>
                            </DropdownItem>
                        )}
                    </DropdownUnfolded>
                </Dropdown>
            </div>

            <button
                disabled={loading}
                className="w-[30%] flex justify-center px-4 py-2 border-none rounded-10 bg-[rgb(52,199,89)] duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button"
                onClick={handleSaveEntry}
            >
                {t("laptop.desktop_screen.common.statuses.save")}
            </button>
        </div>
    </div>
}