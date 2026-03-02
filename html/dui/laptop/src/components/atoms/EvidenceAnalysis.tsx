import { useCallback, useEffect, useRef, useState } from "react";
import type { Evidence, EvidenceDetails } from "@/types/evidence.type";
import useLuaCallback from "@/hooks/useLuaCallback";
import { useTranslation } from "@/components/TranslationContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { BiometricDataLinkedEvent, EvidenceAnalysedEvent } from "@/types/events.type";
import type Citizen from "@/types/citizen.type";
import female from "@/assets/images/female.png";
import male from "@/assets/images/male.png";
import { useAppContext } from "@/hooks/useAppContext";

enum State {
    Loading,
    DatabaseMatch,
    NoDatabaseMatch,
}

interface EvidenceAnalysisProps {
    selectedEvidence: Evidence | null;
    evidenceDetails: EvidenceDetails | null;
    type: "fingerprint" | "dna";
}

export default function EvidenceAnalysis(props: EvidenceAnalysisProps) {
    return (props.selectedEvidence && props.evidenceDetails)
        ? <DisplayEvidence key={props.selectedEvidence.inventory + "-" + props.selectedEvidence.slot} type={props.type} evidence={props.selectedEvidence} evidenceDetails={props.evidenceDetails} />
        : <NoEvidenceSelected />
}

const NoEvidenceSelected = () => {
    const { t } = useTranslation();

    return <div className="h-full grow flex justify-center items-center">
        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.select_evidence")}</p>
    </div>
}

interface DisplayEvidenceProps {
    type: "fingerprint" | "dna";
    evidence: Evidence;
    evidenceDetails: EvidenceDetails;
}

const DisplayEvidence = (props: DisplayEvidenceProps) => {
    const { t } = useTranslation();
    const appContext = useAppContext();

    const [state, setState] = useState<State | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [additionalData, setAdditionalData] = useState<string>(props.evidenceDetails?.additionalData || "");
    const debouncedAdditionalData = useDebounce(additionalData);

    const { trigger: setAnalysed } = useLuaCallback<{ inventory: number | string, slot: number, type: "fingerprint" | "dna" }, void>({
        name: "evidences:setAnalysed",
        onSuccess: (_, args) => {
            const event = new CustomEvent<EvidenceAnalysedEvent>("evidences:analysed", {
                detail: {
                    inventory: args.inventory,
                    slot: args.slot,
                    type: args.type 
                }
            });

            window.dispatchEvent(event);
        }
    });

    const updateAnalysedState = () => {
        if (!props.evidence.analysed) {
            setAnalysed({
                inventory: props.evidence.inventory,
                slot: props.evidence.slot,
                type: props.type
            });
        }
    }
    
    const timeoutRef = useRef<number | null>(null);

    const cancelTimeout = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };


    useEffect(() => {
        return () => cancelTimeout()
    }, []);


    const { trigger: getCitizenLinkedToBiometricData, data: citizen, setData: setCitizen } = useLuaCallback<{ type: "fingerprint" | "dna", biometricData: string }, Citizen | null>({
        name: "evidences:getCitizenLinkedToBiometricData",
        onSuccess: (data) => {
            setProgress(100);

            const delay = !props.evidence.analysed ? 3500 : 0;
            timeoutRef.current = window.setTimeout(() => {
                if (data || citizenRef.current) {
                    setState(State.DatabaseMatch);
                } else {
                    setState(State.NoDatabaseMatch);
                }

                updateAnalysedState();
            }, delay);
        },
        onError: () => setState(State.NoDatabaseMatch)
    });

    const citizenRef = useRef(citizen);

    useEffect(() => {
        citizenRef.current = citizen;
    }, [citizen]);


    const startAnalysis = useCallback(() => {
        if (!props.evidence) {
            setState(null);
            return;
        }

        setState(State.Loading);
        setProgress(0);

        getCitizenLinkedToBiometricData({
            type: props.type,
            biometricData: props.evidence.identifier
        });
    }, [props.evidence]);

    useEffect(() => {
        if (props.evidence.analysed) {
            getCitizenLinkedToBiometricData({
                type: props.type,
                biometricData: props.evidence.identifier
            });
        } else {
            setState(null);
        }
        setProgress(0);
    }, [props.evidence]);


    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    

    useEffect(() => {
        const handleBiometricDataLinked = (e: Event) => {
            const event = e as CustomEvent<BiometricDataLinkedEvent>;
            const { type, identifier, citizen } = event.detail;

            if (type !== props.type) return;

            if (identifier && identifier === props.evidence.identifier) {
                setCitizen(citizen);
                if (stateRef.current !== null && stateRef.current !== State.Loading) setState(State.DatabaseMatch);
            } else {
                setCitizen(null);
                if (stateRef.current !== null  && stateRef.current !== State.Loading) setState(State.NoDatabaseMatch);
            }
        };

        window.addEventListener("evidences:biometricDataLinked", handleBiometricDataLinked);

        return () => window.removeEventListener("evidences:biometricDataLinked", handleBiometricDataLinked);
    }, []);


    const { trigger: updateAdditionalData } = useLuaCallback<{ inventory: number | string, slot: number, additionalData: string }, void>({
        name: "evidences:updateAdditionalData"
    });

    useEffect(() => {
        updateAdditionalData({
            inventory: props.evidence.inventory,
            slot: props.evidence.slot,
            additionalData: additionalData
        });
    }, [debouncedAdditionalData]);

    const formatDate = (date: string | number): string => {
        if (typeof date == "string") return date;
        return new Date(date).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    }

    const renderState = () => {
        switch (state) {
            case State.Loading:
                return <div className="h-full flex flex-col justify-center items-center gap-4">
                    <div className="h-8 w-[80%] bg-black/10 rounded-16">
                        <div className={`h-full rounded-16 duration-3000 transition-[width] ease-in-out bg-[linear-gradient(180deg,#6f8fb3_0%,#4f6f92_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_6px_rgba(90,120,160,0.6)]`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-20 leading-none">
                        {t("laptop.desktop_screen.evidence_analysis.matching_biometric_data", t(`laptop.desktop_screen.common.${props.type}`))}
                    </p>
                </div>
            case State.DatabaseMatch:
                if (!citizen) {
                    setState(State.NoDatabaseMatch);
                    return
                }
                
                return <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                    <div className="w-full flex justify-center items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(52,199,89)" viewBox="0 -960 960 960"><path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z"/></svg>
                        <div className="w-3/4">
                            <p className="text-20 leading-none uppercase">{t("laptop.desktop_screen.evidence_analysis.database_match.header")}</p>
                            <p className="text-30 leading-none">
                                {t("laptop.desktop_screen.evidence_analysis.database_match.description", t(`laptop.desktop_screen.common.${props.type}`))}
                            </p>
                        </div>
                    </div>

                    <button
                        className="relative flex-1 w-full flex justify-center items-center gap-6 px-1 py-1.5 border-none rounded-10 duration-400 transition-all hoverable hover:bg-button"
                        onClick={() => appContext.openApp("citizens", { citizen: citizen })}
                    >
                        <img src={citizen.gender == "male" ? male : female} className="h-25 duration-400 transition-all [-webkit-filter:drop-shadow(var(--drop-shadow-xl))]" />

                        <div>
                            <p className="text-45 leading-none text-left truncate">{citizen.fullName}</p>
                            <p className="text-30 leading-none text-left truncate">{`${formatDate(citizen.birthdate)} • ${t(`laptop.desktop_screen.citizens_app.gender.${citizen.gender}`)}`}</p>
                        </div>

                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" fill="black" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
                            <p className="text-15 leading-none italic">{t("laptop.desktop_screen.evidence_analysis.database_match.open_citizens_app")}</p>
                        </div>
                    </button>
                </div>
            case State.NoDatabaseMatch:
                return <div className="w-full h-full flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(233,21,45)" viewBox="0 -960 960 960"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                    <div className="w-3/4">
                        <p className="text-20 leading-none uppercase">{t("laptop.desktop_screen.evidence_analysis.no_database_match.header")}</p>
                        <p className="text-30 leading-none">
                            {t("laptop.desktop_screen.evidence_analysis.no_database_match.description", t(`laptop.desktop_screen.common.${props.type}`), t(`laptop.desktop_screen.common.${props.type}`))}
                        </p>
                    </div>
                </div>
            default:
                return !props.evidence.analysed && <div className="w-full h-full flex justify-center items-center">
                    <button className="flex justify-center gap-2 px-4 py-2 border-none rounded-10 bg-button duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button" onClick={startAnalysis}>{t("laptop.desktop_screen.evidence_analysis.start_analyzation")}</button>
                </div>
        }
    };
    
    return <div className="h-full grow flex flex-col justify-center items-center gap-6">
        <div className="w-3/4 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-22.5 leading-none uppercase">{t("laptop.desktop_screen.common.evidence_placeholder")}:</span>
                    <div className="flex items-baseline gap-1">
                        <img src={props.evidence.imagePath} className="w-[22px] h-[22px]"></img>
                        <span className="text-30 leading-none">{props.evidence.label}</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-22.5 leading-none uppercase">{t("laptop.desktop_screen.common.crime_scene_placeholder")}:</span>
                    <span className="text-30 leading-none">{props.evidenceDetails.crimeScene || "-/-"}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-22.5 leading-none uppercase">{t("laptop.desktop_screen.common.collection_time_placeholder")}:</span>
                    <span className="text-30 leading-none">{props.evidenceDetails.collectionTime || "-/-"}</span>
                </div>
                <div className="w-full flex flex-col gap-2 mt-4">
                    <span className="text-22.5 leading-none uppercase">{t("laptop.desktop_screen.common.additional_data_placeholder")}</span>
                    <textarea className="input resize-none scrollbar textable" maxLength={500} value={additionalData} onChange={(e) => setAdditionalData(e.target.value)} />
                </div>
            </div>
        </div>

        <div className="w-3/4 h-[40%] p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            {renderState()}
        </div>
    </div>
}