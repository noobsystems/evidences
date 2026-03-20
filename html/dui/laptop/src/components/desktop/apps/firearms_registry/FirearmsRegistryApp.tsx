import { Sidebar, SidebarItem } from "@/components/atoms/sidebar/Sidebar";
import { useTranslation } from "@/components/TranslationContext";
import { useAppContext } from "@/hooks/useAppContext";
import { useDebounce } from "@/hooks/useDebounce";
import useLuaCallback from "@/hooks/useLuaCallback";
import { useEffect, useState } from "react";
import RegisterFirearmPopUp from "./RegisterFirearmPopup";
import { getStatusById, Status, type RegisteredFirearm, type StatusType } from "@/types/firearm.type";
import type Citizen from "@/types/citizen.type";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "@/components/atoms/dropdown/Dropdown";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";


interface FirearmsRegistryAppProps {
    firearm?: RegisteredFirearm;
}


export default function FirearmsRegistryApp({ firearm }: FirearmsRegistryAppProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const [selectedFirearm, setSelectedFirearm] = useState<RegisteredFirearm | undefined>(firearm);


    useEffect(() => {
        if (!firearm) return;

        fetchCitizen({ identifier: firearm.identifier });
        setSelectedFirearm(firearm);
    }, [firearm]);


    const [searchText, setSearchText] = useState<string>("");
    const debouncedSearchText = useDebounce<string>(searchText, 750);

    const { data: firearms, setData: setFirearms, fetchData: fetchFirearms, loading, reloadRef, scrollRef, handleScroll, handleReload, adjustOffset } = useInfiniteScroll<RegisteredFirearm, { searchText: string }>("evidences:getRegisteredFirearms", { searchText: debouncedSearchText });

    const [citizensCache, setCitizensCache] = useState<Map<string, Citizen>>(new Map());
    const { trigger: fetchCitizen } = useLuaCallback<{ identifier: string }, Citizen>({
        name: "evidences:getCitizen",
        onSuccess: (data) => {
            if (!data) return;

            setCitizensCache(prev => {
                const nextMap = new Map(prev);
                nextMap.set(data.identifier.toString(), data);
                return nextMap;
            });
        }
    });

    useEffect(() => fetchFirearms(true), [debouncedSearchText]);

    useEffect(() => {
        if (firearms.length == 0) return;

        firearms.forEach((firearm) => {
            if (!citizensCache.has(firearm.identifier.toString())) {
                fetchCitizen({ identifier: firearm.identifier });
            }
        });
    }, [firearms, citizensCache]);

    const handleFirearmRegistration = () => {
        appContext.openPopUp(t("laptop.desktop_screen.firearms_registry_app.registration_popup.header"),
            <RegisterFirearmPopUp
                checkAlreadyRegistered={serial => (firearms.find(f => f.serial == serial) != null)}
                onUpdateFirearm={onUpdateFirearm}
                onClose={() =>
                    appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_registration_success") })
                }
            />
        );
    };

    const onUpdateFirearm = (firearm: RegisteredFirearm, deletion: boolean) => {
        if (deletion) {
            setSelectedFirearm(undefined);
            adjustOffset(-1);
        }

        setFirearms((prev) => {
            if (prev.find((f) => f.serial == firearm?.serial)) {
                return deletion
                    ? prev.filter((f) => f.serial != firearm.serial)
                    : prev.map((f) => f.serial == firearm.serial ? firearm : f);
            } else {
                adjustOffset(1);
                return [firearm, ...prev];
            }
        });
    };

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
                    <div onClick={handleFirearmRegistration} className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(52,199,89)]">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
                    </div>
                </div>
            </div>
            <Sidebar ref={scrollRef} className="w-full flex-1" onScroll={handleScroll}>
                {(firearms.length == 0 && !loading)
                    ? <div className="w-full h-full flex justify-center items-center">
                        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.firearms_registry_app.no_firearms_found")}</p>
                    </div>
                    : (firearms.length == 0 && loading)
                        ? <div className="w-full h-full flex justify-center items-center">
                            <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.loading")}</p>
                        </div>
                        : firearms.map((firearm) => {
                            return <SidebarItem
                                active={selectedFirearm?.serial === firearm.serial}
                                imagePath={firearm.imagePath}
                                description={citizensCache.get(firearm.identifier.toString())?.fullName || t("laptop.desktop_screen.common.statuses.loading")}
                                onClick={() => setSelectedFirearm(firearm)}
                            >
                                {firearm.serial}
                            </SidebarItem>
                        })
                }
            </Sidebar>
        </div>
        {selectedFirearm
            ? <DisplayFirearm key={selectedFirearm.serial} citizen={citizensCache.get(selectedFirearm.identifier.toString())} firearm={selectedFirearm} onUpdateFirearm={onUpdateFirearm} />
            : firearms.length > 0 && <NoFirearmSelected />
        }
    </div>
}

const NoFirearmSelected = () => {
    const { t } = useTranslation();

    return <div className="h-full grow flex justify-center items-center">
        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.select_firearm")}</p>
    </div>
}

interface DisplayFirearmProps {
    firearm: RegisteredFirearm,
    citizen: Citizen | undefined,
    onUpdateFirearm: (firearm: RegisteredFirearm, deletion: boolean) => void
}

const DisplayFirearm = (props: DisplayFirearmProps) => {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const [isEditingRegistration, setEditingRegistration] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<StatusType>(getStatusById(props.firearm.status) || Status.UNKNOWN);
    const [registrationReason, setRegistrationReason] = useState<string>(props.firearm.reason);

    const formatDate = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    };

    const { trigger: registerFirearm } = useLuaCallback<RegisteredFirearm, void>({
        name: "evidences:registerFirearm",
        onSuccess: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_update_success") }),
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_update_error") })
    });

    const { trigger: unregisterFirearm } = useLuaCallback<{ serial: string }, void>({
        name: "evidences:unregisterFirearm",
        onSuccess: () => {
            appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_deletion_success") });
            props.onUpdateFirearm(props.firearm, true);
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.firearms_registry_app.status_messages.firearm_deletion_error") })
    });

    useEffect(() => {
        if (isEditingRegistration) setEditingRegistration(false);
    }, [props.firearm]);

    const handleRegistrationUpdate = () => {
        const updatedFirearm = { ...props.firearm };
        updatedFirearm.status = selectedStatus.id;
        updatedFirearm.reason = registrationReason;

        registerFirearm(updatedFirearm);
        setEditingRegistration(false);
    };

    const cancelRegistrationUpdate = () => {
        setSelectedStatus(getStatusById(props.firearm.status) || Status.UNKNOWN);
        setRegistrationReason(props.firearm.reason);
        setEditingRegistration(false);
    };

    const removeFirearm = () => {
        unregisterFirearm({
            serial: props.firearm.serial!!
        });
    };

    return <div className="h-full flex flex-col grow gap-4">
        <div className="w-full flex flex-col gap-4 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            <div className="w-full flex justify-between items-center">
                <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.firearms_registry_app.firearm_information")}</p>
                <div key="delete-button" className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(233,21,45)]" onClick={removeFirearm}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                </div>
            </div>
            <div className="w-full flex justify-start items-center gap-4">
                <img width="150px" src={props.firearm.imagePath}></img>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.firearm_type")}:</p>
                        <p className="text-30 leading-none">{props.firearm.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.firearm_serial")}:</p>
                        <p className="text-30 leading-none">{props.firearm.serial}</p>
                    </div>
                    {props.citizen &&
                        <div className="flex items-center gap-2">
                            <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.firearm_owner")}:</p>
                            <p className="text-30 leading-none hoverable" onClick={() => appContext.openApp("citizens", { citizen: props.citizen })}>
                                {props.citizen.fullName}
                            </p>
                        </div>
                    }
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.registered_by")}:</p>
                        <p className="text-30 leading-none">{props.firearm.registeredBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.registered_at")}:</p>
                        <p className="text-30 leading-none">{formatDate(props.firearm.registeredAt)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="w-full flex flex-col flex-1 min-h-0 gap-4 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            <div className="w-full flex justify-between items-center">
                <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.firearms_registry_app.firearm_registration")}</p>

                {!isEditingRegistration
                    ? <div className="flex items-center gap-1">
                            <div
                                key="edit-button"
                                className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(30,110,244)]"
                                onClick={() => setEditingRegistration(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                            </div>
                        </div>
                    : <div className="flex items-center gap-1">
                        <div
                            key="save-button"
                            className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(52,199,89)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                            onClick={handleRegistrationUpdate}
                        >
                            <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.save")}</p>
                        </div>
                        <div
                            key="cancel-button"
                            className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(233,21,45)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                            onClick={cancelRegistrationUpdate}
                        >
                            <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.cancel")}</p>
                        </div>
                    </div>
                }
            </div>
            <div className="w-full flex items-center gap-2">
                <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.firearm_status")}:</p>
                {isEditingRegistration
                    ? <Dropdown<StatusType>
                        items={Object.values(Status)}
                        onItemSelect={item => setSelectedStatus(item)}
                        selectedItem={selectedStatus}
                        itemToString={item => t(item.translationKey)}
                        className="w-1/2"
                    >
                        <DropdownSelection<StatusType> displayArrow={false} placeholder={t("laptop.desktop_screen.firearms_registry_app.status.header")} className="p-0 justify-normal bg-transparent border-none shadow-none outline-none appearance-none">
                            {item => (
                                <p className="text-30 leading-none p-1 text-left truncate hoverable">{t(item.translationKey)}</p>
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
                    : <div className={`${selectedStatus.className} w-fit inline-flex justify-center items-center p-1 rounded-10`}>
                        <span className="text-30 leading-none">{t(selectedStatus.translationKey)}</span>
                    </div>
                }
            </div>
            <div className="flex flex-col flex-1 min-h-0 items-start gap-2">
                <p className="text-30 leading-none">{t("laptop.desktop_screen.firearms_registry_app.registration_reason")}:</p>
                <textarea
                    disabled={!isEditingRegistration}
                    className={`w-full h-full input resize-none scrollbar ${isEditingRegistration && "textable"}`}
                    maxLength={500}
                    value={registrationReason}
                    onChange={(e) => setRegistrationReason(e.target.value)}
                />
            </div>
        </div>
    </div>
}