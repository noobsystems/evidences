import { useState } from "react";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "@/components/atoms/dropdown/Dropdown";
import { genders, type Gender } from "@/types/citizen.type";
import useLuaCallback from "@/hooks/useLuaCallback";
import { useAppContext } from "@/hooks/useAppContext";
import type Citizen from "@/types/citizen.type";
import { useTranslation } from "@/components/TranslationContext";

interface CreateCitizenPopUpProps {
    onUpdateCitizen: (citizen: Citizen, deletion: boolean) => void;
    onClose: () => void;
}

export default function CreateCitizenPopUp(props: CreateCitizenPopUpProps) {
    const appContext = useAppContext();
    const { t } = useTranslation();

    const [fullName, setFullName] = useState<string>("");
    const [birthdate, setBirthdate] = useState<string>("");
    const [gender, setGender] = useState<Gender | undefined>(undefined);

    const { trigger, loading } = useLuaCallback<{ fullName: string; birthdate: string, gender: string }, Citizen>({
        name: "evidences:storeCitizen",
        onSuccess: (data) => {
            props.onUpdateCitizen(data, false);
            props.onClose();
            appContext.close();
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_creation_error") })
    });

    const handleCitizenCreation = () => {
        if (!fullName || !birthdate || !gender) {
            appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.common.statuses.fill_all_fields") });
            return;
        }

        trigger({
            fullName: fullName,
            birthdate: birthdate,
            gender: gender.id
        });
    }

    const formatDate = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    };

    return <div className="w-full h-full p-4 bg-window flex justify-center">
        <div className="w-[60%] h-full flex flex-col justify-evenly items-center">
            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.common.name_placeholder")}</span>
                <input className="input textable" maxLength={25} placeholder={t("laptop.desktop_screen.common.fullname_placeholder")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.common.birthdate_placeholder")}</span>
                <input className="input textable" maxLength={25} placeholder={formatDate(Date.now())} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            </div>

            <div className="w-full flex flex-col gap-2">
                <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.common.gender_placeholder")}</span>
                <div>
                    <Dropdown<Gender>
                        items={genders}
                        onItemSelect={setGender}
                        selectedItem={gender}
                        itemToString={item => item.id}
                        className="w-full"
                    >
                        <DropdownSelection<Gender> placeholder={t("laptop.desktop_screen.citizens_app.gender.header")}>
                            {item => (
                                <p className="text-30 leading-none text-left truncate">{t(item.translationKey)}</p>
                            )}
                        </DropdownSelection>
                        <DropdownUnfolded<Gender>>
                            {(item, selected) => (
                                <DropdownItem<Gender> key={item.id} item={item} selected={selected}>
                                    <p className="text-30 leading-none text-left truncate">{t(item.translationKey)}</p>
                                </DropdownItem>
                            )}
                        </DropdownUnfolded>
                    </Dropdown>
                </div>
            </div>

            <button
                disabled={loading}
                className="w-[30%] flex justify-center px-4 py-2 border-none rounded-10 bg-[rgb(52,199,89)] duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button"
                onClick={handleCitizenCreation}
            >
                {t("laptop.desktop_screen.common.statuses.save")}
            </button>
        </div>
    </div>
}