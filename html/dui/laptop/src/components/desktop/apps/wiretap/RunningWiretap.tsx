import { useEffect, useRef, useState } from "react";
import AudioWave from "./AudioWave";
import { useTranslation } from "@/components/TranslationContext";
import { useAppContext } from "@/hooks/useAppContext";
import useLuaCallback from "@/hooks/useLuaCallback";
import type { Observation } from "@/types/observation.type";
import type { Interception, Wiretap } from "@/types/wiretap.type";
import type { InterceptionStoredEvent } from "@/types/events.type";

interface RunningWiretapProps {
    observation: Observation;
    onClose: (success: boolean) => void;
}

export default function RunningWiretap(props: RunningWiretapProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();
    const [protocol, setProtocol] = useState<string>("");
    const currentProtocol = useRef<string>("");
    const involvedTargets = useRef<string[]>([]);
    const [activeTargets, setActiveTargets] = useState<number[]>([]);

    if (props.observation.type == "ObservableCall") {
        useEffect(() => {
            Object.values(props.observation.targets!).filter((target) => target).forEach((target) => {
                if (!involvedTargets.current.includes(target.name)) {
                    involvedTargets.current.push(target.name);
                }
            });
        }, [props.observation]);
    }

    useEffect(() => { currentProtocol.current = protocol; }, [protocol]);


    const { trigger: triggerObserve } = useLuaCallback<{ label: string } | { channel: number }, void>({
        name: `evidences:observe${props.observation.type}`
    });

    const startObservation = () => {
        const args = props.observation.type === "ObservableSpyMicrophone"
            ? props.observation.label && { label: props.observation.label }
            : props.observation.channel && { channel: props.observation.channel };
        if (!args) return;
        triggerObserve(args);
    };


    const { trigger: triggerIgnore } = useLuaCallback<{ label: string } | { channel: number }, void>({
        name: `evidences:ignore${props.observation.type}`
    });

    const stopObservation = () => {
        const args = props.observation.type === "ObservableSpyMicrophone"
            ? props.observation.label && { label: props.observation.label }
            : props.observation.channel && { channel: props.observation.channel };
        if (!args) return;
        triggerIgnore(args);
    };

    const { trigger: triggerStoreWiretap } = useLuaCallback<Wiretap, Interception>({
        name: "evidences:storeWiretap",
        onSuccess: (data) => {
            props.onClose(true);
            const event = new CustomEvent<InterceptionStoredEvent>("evidences:interceptionStored", { detail: { interception: data } });
            window.dispatchEvent(event);
        },
        onError: () => props.onClose(false)
    });
    

    useEffect(() => {
        const startedAt = Date.now();

        startObservation();
        
        const handleMessage = (event: MessageEvent) => {
            if (!event.data.action) return;

            if (event.data.action == "focus") {
                startObservation();
                return;
            }

            if (event.data.action == "unfocus") {
                stopObservation();
                return;
            }

            // Retrieve updates regarding the active targets
            if (event.data.action == "setAudioWaveActive" && event.data.target) {
                if (event.data.active) {
                    setActiveTargets(prev => [...prev, event.data.target])
                } else {
                    setActiveTargets(prev => prev.filter((target) => target != event.data.target))
                }
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);

            stopObservation();

            const target = props.observation.type == "ObservableCall"
                                ? involvedTargets.current.join(", ")
                                : props.observation.type == "ObservableRadioFreq"
                                    ? props.observation.channel
                                    : props.observation.label;
            if (target == null || target == undefined) return;

            triggerStoreWiretap({
                type: props.observation.type,
                startedAt: startedAt,
                endedAt: Date.now(),
                observer: appContext.playerName || "",
                target: target.toString(),
                protocol: currentProtocol.current || "-/-"
            });
        };
    }, []);

    const getFormattedTime = (): string => {
        return new Date().toLocaleTimeString(t("laptop.desktop_screen.common.date_locales"), { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };

    const handleFocus = () => {
        if (protocol.length == 0) {
            setProtocol(prev => `[${getFormattedTime()}] ${prev}`)
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key == "Enter") {
            e.preventDefault();
            setProtocol(prev => `${prev}[${getFormattedTime()}] `)
        }
    };

    return <div className="w-full h-full p-4 flex flex-col gap-4 bg-window">
        <div className="flex flex-col gap-1">
            {props.observation.type == "ObservableCall"
                ? Object.values(props.observation.targets!).filter((target) => target).map((target) => 
                    <div key={target.playerId} className="flex text-center gap-1">
                        <p className="text-30 whitespace-nowrap">{target.name}</p>
                        <AudioWave active={activeTargets.includes(target.playerId)} />
                    </div>)
                : <div className="flex items-center gap-1">
                    {(props.observation.type != "ObservableSpyMicrophone") &&
                        <p className="text-30 whitespace-nowrap">{props.observation.channel} MHz</p>
                    }
                    <AudioWave active={activeTargets.length > 0} />
                </div>
            }
        </div>
        <div className="flex grow">
            <textarea
                className="input leading-8 resize-none w-full h-full scrollbar textable"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
            />
        </div>
    </div>;
}