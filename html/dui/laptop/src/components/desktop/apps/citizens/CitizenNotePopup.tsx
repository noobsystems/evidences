import type Note from "@/types/note.type";
import { useState } from "react";
import useLuaCallback from "@/hooks/useLuaCallback";
import { useAppContext } from "@/hooks/useAppContext";
import type Citizen from "@/types/citizen.type";
import { useTranslation } from "@/components/TranslationContext";


interface CitizenNotePopupProps {
    citizen: Citizen,
    note?: Note,
    onClose: (note: Note, deletion: boolean) => void
}

export default function CitizenNotePopup(props: CitizenNotePopupProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const [title, setTitle] = useState<string>(props.note?.title || "");
    const [text, setText] = useState<string>(props.note?.text || "");

    const { trigger: triggerNoteSave } = useLuaCallback<{ id: number | null, identifier: string, modifiedAt: number, modifiedBy: string, title: string, text: string }, Note>({
        name: "evidences:storeNote",
        onSuccess: (data) => {
            props.onClose(data, false);
            appContext.close();
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.citizens_app.status_messages.note_save_error") })
    });

    const { trigger: triggerNoteDelete } = useLuaCallback<{ id: number }, void>({
        name: "evidences:deleteNote",
        onSuccess: () => {
            if (props.note) {
                props.onClose(props.note, true);
            }
            appContext.close();
        },
        onError: () => appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.citizens_app.status_messages.note_delete_error") })
    });

    const storeNote = () => {
        if (!title || !text) {
            appContext.displayNotification({ type: "Error", message: t("laptop.desktop_screen.common.statuses.fill_all_fields") });
            return;
        }

        triggerNoteSave({
            id: props.note?.id || null,
            identifier: props.citizen.identifier,
            modifiedAt: Date.now(),
            modifiedBy: appContext.playerName || "",
            title: title,
            text: text
        });
    };

    
    const deleteNote = () => {
        if (props.note) {
            triggerNoteDelete({ id: props.note.id });
        } else {
            appContext.close();
        }
    };

    return <div className="w-full h-full p-4 flex flex-col items-center gap-4 bg-window">
        <div className="w-full flex flex-col gap-2">
            <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.citizens_app.notes.title")}</span>
            <input
                className="input textable"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
        </div>

        <div className="w-full grow flex flex-col gap-2">
            <span className="text-20 leading-none uppercase">{t("laptop.desktop_screen.citizens_app.notes.text")}</span>
            <textarea
                className="w-full h-full input resize-none scrollbar textable"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
        </div>

        <div className="w-full flex justify-center items-center gap-4">
            <button className="w-[30%] flex justify-center px-4 py-2 border-none rounded-10 bg-[rgb(52,199,89)] duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button" onClick={() => storeNote()}>{t("laptop.desktop_screen.common.statuses.save")}</button>
            <button className="w-[30%] flex justify-center px-4 py-2 border-none rounded-10 bg-[rgb(233,21,45)] duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button" onClick={() => deleteNote()}>{props.note ? t("laptop.desktop_screen.common.statuses.delete") : t("laptop.desktop_screen.common.statuses.cancel")}</button>
        </div>
    </div>
}