import { useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import WiretapProtocol from "./WiretapProtocol";
import { useTranslation } from "@/components/TranslationContext";
import type { Interception } from "@/types/wiretap.type";
import type { InterceptionStoredEvent } from "@/types/events.type";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";


export default function InterceptionChooser() {
    const { t } = useTranslation();
    const appContext = useAppContext();

    const { data: interceptions, setData: setInterceptions, fetchData: fetchInterceptions, loading, reloadRef, scrollRef, handleScroll, handleReload, adjustOffset, isFullyLoaded } = useInfiniteScroll<Interception>("evidences:getWiretaps");

    const openProtocol = (interception: Interception) => {
        appContext.openPopUp(t(`laptop.desktop_screen.wiretap_app.protocol_popup.header.${interception.type}`, interception.id), <WiretapProtocol interception={interception} />);
    };

    useEffect(() => {
        fetchInterceptions(true);

        const handleInterceptionStore = (e: Event) => {
            const event = e as CustomEvent<InterceptionStoredEvent>;
            const { interception } = event.detail;

            adjustOffset(1);
            setInterceptions(prev => [interception, ...prev]);
        };

        window.addEventListener("evidences:interceptionStored", handleInterceptionStore);

        return () => window.removeEventListener("evidence:interceptionStored", handleInterceptionStore);
    }, []);

    const formatTime = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleTimeString(t("laptop.desktop_screen.common.date_locales"), { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    const formatDate = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "long", year: "numeric" });
    };

    return <div className="w-1/2 h-full p-6 flex flex-col gap-2 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
        <div className="w-full flex justify-between items-center -mt-1">
            <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.wiretap_app.latest_actions.header")}</p>
            <div ref={reloadRef}
            className="rounded-10 flex justify-center align-center p-1 hover:bg-button hoverable" onClick={handleReload}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill="black"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
            </div>
        </div>

        <div ref={scrollRef} className="w-120 h-full flex flex-col justify-between pr-1 overflow-y-scroll scrollbar" onScroll={handleScroll}>
            <div className="w-full flex flex-col grow items-start">
                {interceptions.length == 0
                    ? <div className="w-full h-full flex justify-center items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" fill="black" viewBox="0 -960 960 960"><path d="M280-160v-441q0-33 24-56t57-23h439q33 0 56.5 23.5T880-600v320L680-80H360q-33 0-56.5-23.5T280-160ZM81-710q-6-33 13-59.5t52-32.5l434-77q33-6 59.5 13t32.5 52l10 54h-82l-7-40-433 77 40 226v279q-16-9-27.5-24T158-276L81-710Zm279 110v440h280v-160h160v-280H360Zm220 220Z"/></svg>
                        <p className="text-20 leading-none">{t("laptop.desktop_screen.wiretap_app.latest_actions.no_actions_available")}</p>
                    </div>
                    : interceptions.map((interception) => 
                        <div
                            key={interception.id}
                            className="w-full flex items-center gap-2 rounded-10 p-1 overflow-hidden text-ellipsis hover:bg-button hoverable"
                            onClick={() => openProtocol(interception)}
                        >
                            {interception.type == "ObservableCall"
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="black" viewBox="0 -960 960 960"><path d="M162-120q-18 0-30-12t-12-30v-162q0-13 9-23.5t23-14.5l138-28q14-2 28.5 2.5T342-374l94 94q38-22 72-48.5t65-57.5q33-32 60.5-66.5T681-524l-97-98q-8-8-11-19t-1-27l26-140q2-13 13-22.5t25-9.5h162q18 0 30 12t12 30q0 125-54.5 247T631-329Q531-229 409-174.5T162-120Zm556-480q17-39 26-79t14-81h-88l-18 94 66 66ZM360-244l-66-66-94 20v88q41-3 81-14t79-28Zm358-356ZM360-244Z"/></svg>
                                : interception.type == "ObservableRadioFreq"
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="black" viewBox="0 -960 960 960"><path d="M196-276q-57-60-86.5-133T80-560q0-78 29.5-151T196-844l48 48q-48 48-72 110.5T148-560q0 63 24 125.5T244-324l-48 48Zm96-96q-39-39-59.5-88T212-560q0-51 20.5-100t59.5-88l48 48q-30 27-45 64t-15 76q0 36 15 73t45 67l-48 48ZM280-80l135-405q-16-14-25.5-33t-9.5-42q0-42 29-71t71-29q42 0 71 29t29 71q0 23-9.5 42T545-485L680-80h-80l-26-80H387l-27 80h-80Zm133-160h134l-67-200-67 200Zm255-132-48-48q30-27 45-64t15-76q0-36-15-73t-45-67l48-48q39 39 58 88t22 100q0 51-20.5 100T668-372Zm96 96-48-48q48-48 72-110.5T812-560q0-63-24-125.5T716-796l48-48q57 60 86.5 133T880-560q0 78-28 151t-88 133Z"/></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="black" viewBox="0 -960 960 960"><path d="M480-200q66 0 113-47t47-113v-160q0-66-47-113t-113-47q-66 0-113 47t-47 113v160q0 66 47 113t113 47Zm-80-120h160v-80H400v80Zm0-160h160v-80H400v80Zm80 40Zm0 320q-65 0-120.5-32T272-240H160v-80h84q-3-20-3.5-40t-.5-40h-80v-80h80q0-20 .5-40t3.5-40h-84v-80h112q14-23 31.5-43t40.5-35l-64-66 56-56 86 86q28-9 57-9t57 9l88-86 56 56-66 66q23 15 41.5 34.5T688-640h112v80h-84q3 20 3.5 40t.5 40h80v80h-80q0 20-.5 40t-3.5 40h84v80H688q-32 56-87.5 88T480-120Z"/></svg>
                            }
                            <div className="w-[calc(100%-50px)] flex flex-col gap-1">
                                <p className="text-20 leading-none">{t("laptop.desktop_screen.wiretap_app.latest_actions.action_duration", formatDate(interception.startedAt), formatTime(interception.startedAt), formatTime(interception.endedAt))}</p>
                                <p className="text-30 leading-none">{t(`laptop.desktop_screen.wiretap_app.latest_actions.actions.${interception.type}`, interception.observer, interception.target)}</p>
                            </div>
                        </div>
                    )
                }
            </div>

            <div className="w-full text-center text-20">
                {loading && t("laptop.desktop_screen.common.statuses.loading")}
                {interceptions.length > 0 && isFullyLoaded && t("laptop.desktop_screen.wiretap_app.latest_actions.end_reached")}
            </div>
        </div>
    </div>;
}