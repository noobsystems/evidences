import type { Interception } from "@/types/wiretap.type";
import { useTranslation } from "@/components/TranslationContext";

interface WiretapProtocolProps {
    interception: Interception;
}


export default function WiretapProtocol(props: WiretapProtocolProps) {
    const { t } = useTranslation();
 
    const formatTime = (dateMillis: number): string => {
        return new Date(dateMillis).toLocaleTimeString(t("laptop.desktop_screen.common.date_locales"), { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };
 
    return <div className="w-full h-full p-4 flex flex-col gap-4 bg-window">
        <div className="w-full h-full p-2.5 bg-white/20 shadow-glass border-2 border-white/80 rounded-10 overflow-y-hidden hover:overflow-y-auto scrollbar">
            <p className="text-30">
                [{formatTime(props.interception.startedAt)}]
                {" "}
                <span className="text-30 italic">{t("laptop.desktop_screen.wiretap_app.protocol_popup.observation_started")}</span>
            </p>
            {props.interception.protocol && props.interception.protocol.split("\n").map((line) => <p className="text-30 wrap-break-word">{line}</p>)}
            <p className="text-30">
                [{formatTime(props.interception.endedAt)}]
                {" "}
                <span className="text-30 italic">{t("laptop.desktop_screen.wiretap_app.protocol_popup.observation_ended")}</span>
            </p>
        </div>
    </div>;
}