import { useTranslation } from "@/components/TranslationContext";
import { useEffect, useState } from "react";
import { Sidebar, SidebarItem } from "@/components/atoms/sidebar/Sidebar";
import { useDebounce } from "@/hooks/useDebounce";
import female from "@/assets/images/female.png";
import male from "@/assets/images/male.png";
import useLuaCallback from "@/hooks/useLuaCallback";
import type Citizen from "@/types/citizen.type";
import { useAppContext } from "@/hooks/useAppContext";
import CreateCitizenPopUp from "./CreateCitizenPopup";
import CitizenNotesSection from "./CitizenNotesSection";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "@/components/atoms/dropdown/Dropdown";
import { genders, type Gender } from "@/types/citizen.type";
import CitizenBiomericDataSection from "./CitizenBiometricDataSection";
import CitizenFirearmsSection from "./CitizenFirearmsSection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";


interface CitizensAppProps {
    citizen?: Citizen;
}


export default function CitizensApp({citizen}: CitizensAppProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();

    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | undefined>(citizen);

    useEffect(() => {
        if (!citizen) return;
        setSelectedCitizen(citizen);
    }, [citizen]);

    const [searchText, setSearchText] = useState<string>("");
    const debouncedSearchText = useDebounce<string>(searchText, 750);

    const { data: citizens, setData: setCitizens, fetchData: fetchCitizens, loading, reloadRef, scrollRef, handleScroll, handleReload, adjustOffset } = useInfiniteScroll<Citizen, { searchText: string }>("evidences:getCitizens", { searchText: debouncedSearchText });

    useEffect(() => fetchCitizens(true), [debouncedSearchText]);

    const handleCitizensRegistration = () => {
        appContext.openPopUp(t("laptop.desktop_screen.citizens_app.create_citizen"), <CreateCitizenPopUp onUpdateCitizen={onUpdateCitizen} onClose={() =>
            appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_creation_success") })
        } />);
    };

    const onUpdateCitizen = (citizen: Citizen, deletion: boolean) => {
        if (deletion) {
            setSelectedCitizen(undefined);
            adjustOffset(-1);
        }

        setCitizens((prev) => {
            if (prev.find((c) => c.identifier == citizen?.identifier)) {
                return deletion
                    ? prev.filter((c) => c.identifier != citizen.identifier)
                    : prev.map((c) => c.identifier == citizen.identifier ? citizen : c);
            } else {
                adjustOffset(1);
                return [citizen, ...prev];
            }
        });
    };

    const formatDate = (date: string | number): string => {
        if (typeof date == "string") return date;
        return new Date(date).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    }

    return <div className="w-full h-full flex gap-4 p-4 bg-window">
        <div className="w-70 h-full flex flex-col gap-2">
            <div className="w-full flex items-center gap-2">
                <div className="min-w-0 flex flex-1 items-center bg-white/20 shadow-glass border-2 border-white/80 rounded-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="pl-2" width="35px" height="35px" fill="black" viewBox="0 -960 960 960"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                    <input
                        type="text"
                        className="input text-30 p-2 bg-transparent border-none shadow-none outline-none appearance-none textable"
                        placeholder={t("laptop.desktop_screen.common.statuses.search")}
                        onChange={(e) => setSearchText(e.target.value)}
                        value={searchText}
                        maxLength={25}
                    />
                </div>

                <div className="flex flex-col justify-between items-center">
                    <div ref={reloadRef} className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-button" onClick={handleReload}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 -960 960 960"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                    </div>
                    {!appContext.options?.areCitizensSynced && <div onClick={handleCitizensRegistration} className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(52,199,89)]">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 -960 960 960"><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/></svg>
                    </div>}
                </div>
            </div>
            <Sidebar ref={scrollRef} className="w-full flex-1" onScroll={handleScroll}>
                {(citizens.length == 0 && !loading)
                    ? <div className="w-full h-full flex justify-center items-center">
                        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.citizens_app.statuses.no_citizens_found")}</p>
                    </div>
                    : (citizens.length == 0 && loading)
                        ? <div className="w-full h-full flex justify-center items-center">
                            <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.loading")}</p>
                        </div>
                        : citizens.map((citizen) =>
                            <SidebarItem
                                active={selectedCitizen?.identifier === citizen.identifier}
                                description={formatDate(citizen.birthdate) + " • " + t(`laptop.desktop_screen.citizens_app.gender.${citizen.gender}`)}
                                onClick={() => setSelectedCitizen(citizen)}
                            >
                                {citizen.fullName}
                            </SidebarItem>
                        )
                }
            </Sidebar>
        </div>
        {selectedCitizen
            ? <DisplayCitizen key={selectedCitizen.identifier} citizen={selectedCitizen} onUpdateCitizen={onUpdateCitizen} />
            : citizens.length > 0 && <NoCitizenSelected />
        }
    </div>
}

const NoCitizenSelected = () => {
    const { t } = useTranslation();

    return <div className="h-full grow flex justify-center items-center">
        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.select_citizen")}</p>
    </div>
}

interface DisplayCitizenProps {
    citizen: Citizen,
    onUpdateCitizen: (citizen: Citizen, deletion: boolean) => void
}

const DisplayCitizen = (props: DisplayCitizenProps) => {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const [isEditingCitizen, setEditingCitizen] = useState<boolean>(false);
    const [fullName, setFullName] = useState<string>(props.citizen.fullName);
    const [birthdate, setBirthdate] = useState<string | number>(props.citizen.birthdate);
    const [gender, setGender] = useState<Gender>(genders.find(gender => gender.id == props.citizen.gender)!);

    const { trigger: storeCitizen } = useLuaCallback<{ identifier: string; fullName: string; birthdate: string, gender: string }, Citizen>({
        name: "evidences:storeCitizen",
        onSuccess: (data) => {
            appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_update_success") });
            props.onUpdateCitizen(data, false);
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_update_error") })
    });

    const { trigger: deleteCitizen } = useLuaCallback<{ identifier: string }, void>({
        name: "evidences:deleteCitizen",
        onSuccess: () => {
            appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_deletion_success") });
            props.onUpdateCitizen(props.citizen, true);
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.citizens_app.status_messages.citizen_deletion_error") })
    });

    const removeCitizen = () => {
        deleteCitizen({
            identifier: props.citizen.identifier
        });
    };

    const updateCitizen = () => {
        storeCitizen({
            identifier: props.citizen.identifier,
            fullName: fullName,
            birthdate: birthdate.toString(),
            gender: gender.id
        });
        setEditingCitizen(false);
    };

    const cancelCitizenUpdate = () => {
        setEditingCitizen(false);
        setFullName(props.citizen.fullName);
        setBirthdate(props.citizen.birthdate);
        setGender(genders.find(gender => gender.id == props.citizen.gender)!);
    };

    const formatDate = (date: string | number): string => {
        if (typeof date == "string") return date;
        return new Date(date).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    }

    return <div className="h-full flex flex-col grow gap-4">
        <div className="w-full flex flex-col gap-4 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            <div className="w-full flex justify-between items-center">
                <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.citizens_app.personal_data")}</p>

                {!appContext.options?.areCitizensSynced && (!isEditingCitizen
                    ? <div className="flex items-center gap-1">
                        <div key="edit-button" className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(30,110,244)]" onClick={() => setEditingCitizen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                        </div>
                        <div key="delete-button" className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(233,21,45)]" onClick={removeCitizen}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                        </div>
                    </div>
                    : <div className="flex items-center gap-1">
                        <div
                            key="save-button"
                            className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(52,199,89)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                            onClick={updateCitizen}
                        >
                            <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.save")}</p>
                        </div>
                        <div
                            key="cancel-button"
                            className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(233,21,45)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                            onClick={cancelCitizenUpdate}
                        >
                            <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.cancel")}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full flex justify-start items-center gap-4">
                <img width="150px" src={props.citizen.gender == "male" ? male : female}></img>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.common.name_placeholder")}:</p>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Firstname Lastname"
                            disabled={!isEditingCitizen}
                            className={`text-30 leading-none p-0 bg-transparent border-none shadow-none outline-none appearance-none ${isEditingCitizen && "textable"}`}
                            maxLength={25}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.common.birthdate_placeholder")}:</p>
                        <input
                            value={formatDate(birthdate)}
                            onChange={(e) => setBirthdate(e.target.value)}
                            placeholder={formatDate(Date.now())}
                            disabled={!isEditingCitizen}
                            className={`text-30 leading-none p-0 bg-transparent border-none shadow-none outline-none appearance-none ${isEditingCitizen && "textable"}`}
                            maxLength={25}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.common.gender_placeholder")}:</p>
                        {isEditingCitizen
                            ? <Dropdown<Gender>
                                items={genders}
                                onItemSelect={setGender}
                                selectedItem={gender}
                                itemToString={item => item.id}
                                className="w-1/2"
                            >
                                <DropdownSelection<Gender> displayArrow={false} placeholder={t("laptop.desktop_screen.citizens_app.gender.header")} className="p-0 justify-normal bg-transparent border-none shadow-none outline-none appearance-none">
                                    {item => (
                                        <p className="text-30 leading-none text-left truncate hoverable">{t(item.translationKey)}</p>
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
                            : <p className="text-30 leading-none">{t(gender.translationKey)}</p>
                        }
                    </div>
                </div>
            </div>
        </div>
        <CitizenBiomericDataSection citizen={props.citizen} />
        <div className="w-full flex flex-1 min-h-0 gap-4">
            <CitizenNotesSection citizen={props.citizen} />
            <CitizenFirearmsSection citizen={props.citizen} />
        </div>
    </div>
}