import { useTranslation } from "@/components/TranslationContext";
import { useAppContext } from "@/hooks/useAppContext";
import useLuaCallback from "@/hooks/useLuaCallback";
import type Citizen from "@/types/citizen.type";
import type Note from "@/types/note.type";
import { useCallback, useEffect, useRef, useState } from "react";
import CitizenNotePopup from "./CitizenNotePopup";
import { Sidebar, SidebarItem } from "@/components/atoms/sidebar/Sidebar";

interface CitizenNotesSectionProps {
    citizen: Citizen
}

export default function CitizenNotesSection(props: CitizenNotesSectionProps) {
    const appContext = useAppContext();
    const { t } = useTranslation();
    const [notes, setNotes] = useState<Note[]>([]);
    const reloadRef = useRef(null);
    const scrollRef = useRef(null);
    const offset = useRef<number>(0);
    const [isFullyLoaded, setFullyLoaded] = useState<boolean>(false);

    const { trigger, loading } = useLuaCallback<{ identifier: string, offset: number }, Note[]>({
        name: "evidences:getNotes",
        onSuccess: (data) => {
            if (!data) return;
            const length = data.length;
            offset.current += length;

            setNotes(prev => [...prev, ...data]);
            if (length < 10) setFullyLoaded(true);
        }
    });

    const fetchNotes = useCallback((forceReload: boolean = false) => {
        if (!forceReload && isFullyLoaded) return;
        if (loading) return;

        if (forceReload) {
            offset.current = 0;
            setNotes([]);
            setFullyLoaded(false);
        }

        trigger({
            identifier: props.citizen.identifier,
            offset: offset.current
        });
    }, [loading, isFullyLoaded]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;

        if (isBottom) {
            fetchNotes();
        }
    }, [loading]);

    const handleReload = () => {
        if (reloadRef.current) {
            const reloadButton = reloadRef.current as HTMLDivElement;

            if (reloadButton.ariaDisabled == "true") return;
            fetchNotes(true);

            reloadButton.ariaDisabled = "true";
            setTimeout(() => reloadButton.ariaDisabled = "false", 1000 * 5);
        }
    };

    const openNotePopup = (note: Note | undefined = undefined) => {
        appContext.openPopUp(t(`laptop.desktop_screen.citizens_app.notes.${note ? "edit" : "create"}`), <CitizenNotePopup citizen={props.citizen} note={note} onClose={(note, deletion) => {
            if (deletion) offset.current -= 1;
            
            setNotes((prev) => {
                if (prev.find((n) => n.id == note.id)) {
                    return deletion
                        ? prev.filter((n) => n.id != note.id)
                        : prev.map((n) => n.id == note.id ? note : n);
                } else {
                    offset.current += 1;
                    return [note, ...prev];
                }
            });

            if (deletion) {
                appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.citizens_app.status_messages.note_deletion_success") })
            } else {
                appContext.displayNotification({ type: "Success", message: t("laptop.desktop_screen.citizens_app.status_messages.note_save_success") })
            }
        }} />);
    };

    const formatDate = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
    };

    useEffect(() => fetchNotes(true), [props.citizen]);

    return <div className="w-1/2 flex flex-col gap-1 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
        <div className="flex justify-between items-center">
            <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.citizens_app.notes.header")}</p>

            <div className="flex items-center gap-1">
                <div className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(52,199,89)]" onClick={() => openNotePopup()}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3 22 9.5 42t15.5 38H200Zm0-120v40-560 243-3 280Zm80-40h163q3-21 9.5-41t14.5-39H280v80Zm0-160h244q32-30 71.5-50t84.5-27v-3H280v80Zm0-160h400v-80H280v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm-20-80h40v-100h100v-40H740v-100h-40v100H600v40h100v100Z"/></svg>
                </div>
                
                <div ref={reloadRef} className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-button" onClick={handleReload}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="black" viewBox="0 -960 960 960"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                </div>
            </div>
        </div>

        {(notes.length == 0 && !loading)
            ? <div className="w-full flex flex-1 justify-center items-center">
                <p className="text-20 leading-none">{t("laptop.desktop_screen.citizens_app.statuses.no_notes_found")}</p>
            </div>
            : (notes.length == 0 && loading)
                ? <div className="w-full h-full flex justify-center items-center">
                    <p className="text-20 leading-none">{t("laptop.desktop_screen.common.statuses.loading")}</p>
                </div>
                : <Sidebar ref={scrollRef} className="bg-transparent border-none shadow-none p-0" onScroll={handleScroll}>
                    {notes.map((note) =>
                        <SidebarItem description={`${formatDate(note.modifiedAt)} • ${t("laptop.desktop_screen.common.by")} ${note.modifiedBy}`} onClick={() => openNotePopup(note)}>
                            {note.title}
                        </SidebarItem>
                    )}
                </Sidebar>
        }
    </div>
}