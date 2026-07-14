import { WeaponEvidenceAnalysisState, type BallisticsEvidence, type Evidence, type WeaponEvidenceDetails } from "@/types/evidence.type";
import { useAppContext } from "@/hooks/useAppContext";
import useLuaCallback from "@/hooks/useLuaCallback";
import type { EvidenceAnalysedEvent } from "@/types/events.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { getStatusById, Status, type StatusType, type Firearm, type RegisteredFirearm } from "@/types/firearm.type";
import type Citizen from "@/types/citizen.type";
import FirearmDropdown from "@/components/atoms/dropdown/FirearmDropdown";
import { useTranslation } from "@/components/TranslationContext";
import Spinner from "@/components/atoms/Spinner";

interface BallisticsAnalysisProps {
    selectedEvidence: Evidence | null;
    evidenceDetails: WeaponEvidenceDetails | null;
}

export default function BallisticsAnalysis(props: BallisticsAnalysisProps) {
    return (props.selectedEvidence && props.evidenceDetails)
        ? <DisplayEvidence key={props.selectedEvidence.inventory + "-" + props.selectedEvidence.slot} evidence={props.selectedEvidence} evidenceDetails={props.evidenceDetails} />
        : <NoEvidenceSelected />
}

const NoEvidenceSelected = () => {
    const { t } = useTranslation();

    return <div className="h-full grow flex justify-center items-center">
        <p className="text-20 leading-none text-center">{t("laptop.desktop_screen.common.statuses.select_evidence")}</p>
    </div>
}

interface DisplayEvidenceProps {
    evidence: Evidence;
    evidenceDetails: WeaponEvidenceDetails;
}

const DisplayEvidence = (props: DisplayEvidenceProps) => {
    const { t } = useTranslation();
    const appContext = useAppContext();

    const [state, setState] = useState<WeaponEvidenceAnalysisState | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [additionalData, setAdditionalData] = useState<string>(props.evidenceDetails?.additionalData || "");
    const debouncedAdditionalData = useDebounce(additionalData);

    const [selectedFirearm, setSelectedFirearm] = useState<Firearm | undefined>();
    const [inventoryFirearmMatch, setInventoryFirearmMatch] = useState<null | "microstamp" | "imperfections" | "type" | "none">();

    const { trigger: setAnalysed } = useLuaCallback<{ inventory: number | string, slot: number, type: BallisticsEvidence, information: Object }, void>({
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

    const updateAnalysedState = (information: Object = {}) => {
        setAnalysed({
            inventory: props.evidence.inventory,
            slot: props.evidence.slot,
            type: "ballistics",
            information: information
        });
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

    const { trigger: getRegisteredFirearmFromSerial, data: firearm } = useLuaCallback<{ serial: string }, RegisteredFirearm | null>({
        name: "evidences:getRegisteredFirearmFromSerial",
        onSuccess: (data) => {
            setProgress(100);

            const delay = !props.evidence.analysed ? 3500 : 0;
            timeoutRef.current = window.setTimeout(() => {
                if (data || firearmRef.current) {
                    setState(WeaponEvidenceAnalysisState.DatabaseMatch);
                } else {
                    if (props.evidenceDetails.type == "magazine" || props.evidenceDetails.type == "gunshot_residue") {
                        setState(WeaponEvidenceAnalysisState.Type);
                        updateAnalysedState({ weaponType: props.evidenceDetails.weaponType });

                        return;
                    } else {
                        setState(WeaponEvidenceAnalysisState.NoDatabaseMatch);
                    }
                }

                updateAnalysedState();
            }, delay);
        },
        onError: () => setState(WeaponEvidenceAnalysisState.NoDatabaseMatch)
    });

    const { trigger: fetchFirearmOwner, data: firearmOwner, setData: setFirearmOwner, loading: loadingFirearmOwner } = useLuaCallback<{ identifier: string }, Citizen>({
        name: "evidences:getCitizen"
    });
    
    const firearmRef = useRef(firearm);
    const [firearmStatus, setFirearmStatus] = useState<StatusType>(Status.UNKNOWN);

    useEffect(() => {
        firearmRef.current = firearm;
        setFirearmStatus(getStatusById(firearm?.status) || Status.UNKNOWN);
        
        if (firearm) {
            fetchFirearmOwner({
                identifier: firearm.identifier
            });
        } else {
            setFirearmOwner(undefined);
        }
    }, [firearm]);


    const startAnalysis = useCallback(() => {
        if (!props.evidence) {
            setState(null);
            return;
        }

        setState(WeaponEvidenceAnalysisState.Loading);
        setProgress(0);

        getRegisteredFirearmFromSerial({
            serial: props.evidenceDetails.serial || ""
        });
    }, [props.evidence]);

    useEffect(() => {
        if (props.evidence.analysed) {
            if (props.evidenceDetails.serial) {
                getRegisteredFirearmFromSerial({
                    serial: props.evidenceDetails.serial
                });
            } else {
                if (props.evidenceDetails.type == "magazine" || props.evidenceDetails.type == "gunshot_residue") {
                    setState(WeaponEvidenceAnalysisState.Type);
                    updateAnalysedState({ weaponType: props.evidenceDetails.weaponType });
                } else {
                    setState(WeaponEvidenceAnalysisState.NoDatabaseMatch);
                }
            }
        } else {
            setState(null);
        }
        setProgress(0);
    }, [props.evidence, props.evidenceDetails]);


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


    const selectFirearm = useCallback((firearm?: Firearm) => {
        setSelectedFirearm(firearm);
        setInventoryFirearmMatch(null);
        cancelTimeout();

        if (!firearm) return;

        timeoutRef.current = window.setTimeout(() => {
            if (props.evidenceDetails.type == "magazine" || props.evidenceDetails.type == "gunshot_residue") {
                return;
            }

            if (props.evidenceDetails.serial && firearm.serial) {
                // Ballistics evidence is a casing with a microstamp and it couldn't be matched against a registered firearm

                if (props.evidenceDetails.serial == firearm.serial) {
                    setInventoryFirearmMatch("microstamp");
                    updateAnalysedState({ serial: props.evidenceDetails.serial });
                    return;
                }
            }

            if (props.evidenceDetails.imperfections && firearm.imperfections) {
                // Ballistics evidence is a casing without microstamp or a bullet
                // Due to their imperfections, we can check whether the evidence originated from the exact weapon

                if (props.evidenceDetails.imperfections == firearm.imperfections) {
                    setInventoryFirearmMatch("imperfections");
                    updateAnalysedState({ serial: firearm.imperfections });
                    return;
                }
            }

            if (props.evidenceDetails.weaponType) {
                // Ballistics evidence is either a casing or a bullet whose imperfections didn't match the selected firearm
                // We can only check if their orignate from a weapon of the same type

                if (props.evidenceDetails.weaponType == firearm.label) {
                    setInventoryFirearmMatch("type");
                    updateAnalysedState({ weaponType: firearm.label });
                    return;
                }
            }

            setInventoryFirearmMatch("none");
        }, 1500);
    }, [props.evidence, props.evidenceDetails]);


    const renderState = () => {
        switch (state) {
            case WeaponEvidenceAnalysisState.Loading:
                return <div className="h-full flex flex-col justify-center items-center gap-4">
                    <div className="h-8 w-[80%] bg-black/10 rounded-16">
                        <div className={`h-full rounded-16 duration-3000 transition-[width] ease-in-out bg-[linear-gradient(180deg,#6f8fb3_0%,#4f6f92_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_6px_rgba(90,120,160,0.6)]`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-20 leading-none">
                        {t("laptop.desktop_screen.ballistics_app.matching_serial")}
                    </p>
                </div>
            case WeaponEvidenceAnalysisState.DatabaseMatch:
                if (!firearm) {
                    setState(WeaponEvidenceAnalysisState.NoDatabaseMatch);
                    return
                }

                return <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                    <div className="w-full flex justify-center items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(52,199,89)" viewBox="0 -960 960 960"><path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z"/></svg>
                        <div className="w-3/4">
                            <p className="text-20 leading-none uppercase">{t("laptop.desktop_screen.ballistics_app.registry_match.header")}</p>
                            <p className="text-30 leading-none">
                                {t("laptop.desktop_screen.ballistics_app.registry_match.description")}
                            </p>
                        </div>
                    </div>

                    <button
                        className="relative flex-1 w-full flex justify-center items-center gap-6 px-1 py-1.5 border-none rounded-10 duration-400 transition-all hoverable hover:bg-button"
                        onClick={() => appContext.openApp("firearms_registry", { firearm: firearm })}
                    >
                        <img src={firearm.imagePath} className="h-25 duration-400 transition-all [-webkit-filter:drop-shadow(var(--drop-shadow-xl))]" />

                        <div>
                            <div className="flex items-center gap-1">
                                <p className="text-45 leading-none truncate">{firearm.label}</p>
                                <p className="text-45 leading-none">•</p>
                                <div className={`${firearmStatus.className} w-fit inline-flex justify-center items-center p-1 rounded-10`}>
                                    <span className="text-30 leading-none">{t(firearmStatus.translationKey)}</span>
                                </div>
                            </div>
                            <p className="text-30 leading-none text-left truncate">{(loadingFirearmOwner || !firearmOwner) ? t("laptop.desktop_screen.common.statuses.loading") : firearmOwner.fullName}</p>
                        </div>

                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" fill="black" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
                            <p className="text-15 leading-none italic">{t("laptop.desktop_screen.ballistics_app.registry_match.open_firearms_registry")}</p>
                        </div>
                    </button>
                </div>
            case WeaponEvidenceAnalysisState.NoDatabaseMatch:
                return <div className="w-full h-full flex flex-col gap-2">
                    <div className="w-full flex justify-center items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(233,21,45)" viewBox="0 -960 960 960"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                        <div className="w-full flex flex-col justify-center">
                            <p className="text-20 leading-none uppercase">{t("laptop.desktop_screen.ballistics_app.no_registry_match.header")}</p>
                            {props.evidenceDetails.type &&
                                <p className="text-25 leading-none">
                                    {t(`laptop.desktop_screen.ballistics_app.no_registry_match.${props.evidenceDetails.type}_description`)}
                                </p>
                            }
                        </div>
                    </div>
                    <div className="w-full flex flex-col flex-1 min-h-0 justify-center">
                        <div className="w-full flex justify-center items-center">
                            <div className="flex items-center gap-2 bg-white/20 shadow-glass border-2 border-white/80 rounded-10 p-2">
                                <img src={props.evidence.imagePath} className="w-7 h-7"></img>
                                <p className="text-30 leading-none truncate">{props.evidence.label}</p>
                            </div>
                            <div className="w-15 mx-2 rounded-none border-b-3 border-[black]"></div>
                            <div className="flex justify-center items-center bg-white/20 shadow-glass border-2 border-white/80 rounded-10 p-2">
                                {!inventoryFirearmMatch
                                    ? <Spinner size={50} black />
                                    : {
                                        "microstamp": <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(52,199,89)" viewBox="0 0 448 512"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>,
                                        "imperfections": <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(52,199,89)" viewBox="0 0 448 512"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>,
                                        "type": <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(30,110,244)" viewBox="0 0 32 32"><path d="M0 16q0 0.96 0.672 1.632t1.6 0.672 1.632-0.672 0.672-1.632q0-1.888 1.344-3.232t3.232-1.344 3.232 1.344 1.344 3.232q0 2.496 1.216 4.608t3.328 3.328 4.576 1.216 4.608-1.216 3.328-3.328 1.216-4.608q0-0.928-0.672-1.6t-1.6-0.672-1.632 0.672-0.672 1.6q0 1.888-1.344 3.232t-3.232 1.344-3.232-1.312-1.344-3.264q0-2.464-1.216-4.576t-3.328-3.328-4.576-1.216-4.608 1.216-3.328 3.328-1.216 4.576z"></path></svg>,
                                        "none": <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="rgb(233,21,45)" viewBox="0 -960 960 960"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                                    }[inventoryFirearmMatch]
                                }
                            </div>
                            <div className="w-15 mx-2 rounded-none border-b-3 border-[black]"></div>
                            <FirearmDropdown className="w-1/3" selectedFirearm={selectedFirearm} setSelectedFirearm={selectFirearm} />
                        </div>
                        <br />
                        <div className="w-full flex justify-center items-center">
                            {inventoryFirearmMatch &&
                                <p className="text-25 leading-none">
                                    {t(`laptop.desktop_screen.ballistics_app.no_registry_match.inventory_match.${inventoryFirearmMatch}`)}
                                </p>
                            }
                        </div>
                    </div>
                </div>
            case WeaponEvidenceAnalysisState.Type:
                const formatDate = (dateSeconds: number): string => {
                    return new Date(dateSeconds * 1000).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
                };

                return <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                    <div className="w-full flex justify-center">
                        <div className="flex flex-col">
                            <p className="text-20 leading-none uppercase">{t("laptop.desktop_screen.ballistics_app.show_type.header")}</p>
                            {props.evidenceDetails.type &&
                                <p className="text-30 leading-none">{t(`laptop.desktop_screen.ballistics_app.show_type.${props.evidenceDetails.type}_description`)}</p>
                            }
                        </div>
                    </div>
                    <div className="w-full flex-1 flex justify-center items-center gap-6">
                        <img src={props.evidenceDetails.weaponImage} className="h-25 duration-400 transition-all [-webkit-filter:drop-shadow(var(--drop-shadow-xl))]" />
                        <div className="flex flex-col">
                            <p className="text-45 leading-none truncate">{props.evidenceDetails.weaponType}</p>
                            {props.evidenceDetails.type == "gunshot_residue" &&
                                <div className="flex gap-1">
                                    <p className="text-30 leading-none">{t("laptop.desktop_screen.ballistics_app.show_type.fired_at")}:</p>
                                    <p className="text-30 leading-none">{formatDate(props.evidenceDetails.createdAt)}</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            default:
                return !props.evidence.analysed && <div className="w-full h-full flex justify-center items-center">
                    <button className="flex justify-center gap-2 px-4 py-2 border-none rounded-10 bg-button duration-400 transition-all text-30 leading-none hoverable hover:-translate-y-0.5 hover:shadow-button" onClick={startAnalysis}>{t("laptop.desktop_screen.ballistics_app.start_analyzation")}</button>
                </div>
        }
    };

    return <div className="h-full grow flex flex-col justify-center items-center gap-4">
        <div className="w-full p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
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

        <div className="w-full flex flex-col flex-1 min-h-0 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
            {renderState()}
        </div>
    </div>
}
