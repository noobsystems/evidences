import firearmsRegistryIcon from "@/assets/app_icons/firearms_registry.png";
import { Sidebar, SidebarItem } from "@/components/atoms/sidebar/Sidebar";
import { useTranslation } from "@/components/TranslationContext"
import { useAppContext } from "@/hooks/useAppContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import type Citizen from "@/types/citizen.type";
import type { RegisteredFirearm } from "@/types/firearm.type";
import { useEffect } from "react";

interface CitizenFirearmsSectionProps {
    citizen: Citizen
}

export default function CitizenFirearmsSection(props: CitizenFirearmsSectionProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const { data: firearms, fetchData: fetchFirearms, loading, reloadRef, scrollRef, handleScroll, handleReload } = useInfiniteScroll<RegisteredFirearm, { identifier: string }>("evidences:getRegisteredFirearms", { identifier: props.citizen.identifier });

    useEffect(() => fetchFirearms(true), [props.citizen]);

    return <div className="w-1/2 flex flex-col gap-1 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <img width="20px" height="20px" src={firearmsRegistryIcon} />
                <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.citizens_app.registered_firearms")}</p>
            </div>
            
            <div ref={reloadRef} className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-button" onClick={handleReload}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 -960 960 960"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
            </div>
        </div>

        {(firearms.length == 0 && !loading)
            ? <div className="w-full flex flex-1 justify-center items-center">
                <p className="text-20 leading-none">{t("laptop.desktop_screen.citizens_app.statuses.no_registered_firearms")}</p>
            </div>
            : (firearms.length == 0 && loading)
                ? <div className="w-full h-full flex justify-center items-center">
                    <p className="text-20 leading-none">{t("laptop.desktop_screen.common.statuses.loading")}</p>
                </div>
                : <Sidebar ref={scrollRef} className="bg-transparent border-none shadow-none p-0" onScroll={handleScroll}>
                    {firearms.map((firearm) =>
                        <SidebarItem
                            imagePath={firearm.imagePath}
                            description={firearm.serial}
                            onClick={() => appContext.openApp("firearms_registry", { firearm: firearm })}
                        >
                            {firearm.label}
                        </SidebarItem>
                    )}
                </Sidebar>
        }
    </div>
}