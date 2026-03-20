import useLuaCallback from "@/hooks/useLuaCallback";
import type Citizen from "@/types/citizen.type";
import { useEffect, useState } from "react";
import fingerprintIcon from "@/assets/app_icons/fingerprint.png";
import dnaIcon from "@/assets/app_icons/dna.png";
import EvidenceDropdown from "@/components/atoms/dropdown/EvidenceDropdown";
import type { BiometricEvidence, Evidence } from "@/types/evidence.type";
import { useAppContext } from "@/hooks/useAppContext";
import { useTranslation } from "@/components/TranslationContext";
import type { BiometricDataLinkedEvent } from "@/types/events.type";


interface CitizenBiomericDataSectionProps {
    citizen: Citizen;
}


export default function CitizenBiomericDataSection(props: CitizenBiomericDataSectionProps) {
    const appContext = useAppContext();
    const { t } = useTranslation();
    const [selectedFingerprint, setSelectedFingerprint] = useState<Evidence | undefined>();
    const [selectedDna, setSelectedDna] = useState<Evidence | undefined>();
    const [isEditingCitizen, setEditingCitizen] = useState<boolean>(false);
 
    
    const { trigger: getLinkedBiometricData, data: linkedBiometricData, setData: setLinkedBiometricData, loading, error } = useLuaCallback<{ identifier: string }, { fingerprint?: string, dna?: string }>({
        name: "evidences:getBiometricDataLinkedToIdentifier",
        onSuccess: (data) => {
            setSelectedFingerprint(createDummyEvidence(data.fingerprint));
            setSelectedDna(createDummyEvidence(data.dna));
        }
    });

    const { trigger: linkBiometricDataToIdentifier } = useLuaCallback<{ type: BiometricEvidence, identifier: string, biometricData: string | undefined }, void>({
        name: "evidences:linkBiometricDataToIdentifier",
        onSuccess: (_, args) => {
            appContext.displayNotification({
                type: "Success",
                message: t(`laptop.desktop_screen.citizens_app.status_messages.biometric_data_${args.biometricData ? "link" : "unlink"}_success`, t(`laptop.desktop_screen.common.${args.type}`))
            })
            const event = new CustomEvent<BiometricDataLinkedEvent>("evidences:biometricDataLinked", {
                detail: {
                    type: args.type,
                    identifier: args.biometricData,
                    citizen: props.citizen
                }
            });
            window.dispatchEvent(event);
        },
        onError: (_, args) => {
            appContext.displayNotification({
                type: "Error",
                message: t("laptop.desktop_screen.citizens_app.status_messages.biometric_data_link_error", t(`laptop.desktop_screen.common.${args.type}`))
            });
            getLinkedBiometricData({ identifier: props.citizen.identifier });
        }
    });

    useEffect(() => getLinkedBiometricData({ identifier: props.citizen.identifier }), []);

    useEffect(() => {
        if (isEditingCitizen) setEditingCitizen(false);
    }, [linkedBiometricData]);


    const handleBiometricDataUpdate = () => {
        setLinkedBiometricData({
            dna: selectedDna?.identifier,
            fingerprint: selectedFingerprint?.identifier
        });

        linkBiometricDataToIdentifier({ type: "fingerprint", identifier: props.citizen.identifier, biometricData: selectedFingerprint?.identifier });
        linkBiometricDataToIdentifier({ type: "dna", identifier: props.citizen.identifier, biometricData: selectedDna?.identifier });
    }

    const cancelBiometricDataUpdate = () => {
        setSelectedFingerprint(createDummyEvidence(linkedBiometricData?.fingerprint));
        setSelectedDna(createDummyEvidence(linkedBiometricData?.dna));
        setEditingCitizen(false);
    };

    const createDummyEvidence = (identifier?: string): Evidence | undefined => {
        return identifier ? {
            label: "",
            imagePath: "",
            inventory: "",
            slot: -1,
            identifier: identifier,
            analysed: false
        } : undefined;
    };

    
    return <div className="w-full flex flex-col gap-4 p-6 bg-white/20 shadow-glass border-2 border-white/80 rounded-16">
        <div className="w-full flex justify-between items-center">
            <p className="text-20 leading-none m-0 uppercase">{t("laptop.desktop_screen.citizens_app.biometric_data")}</p>

            {!isEditingCitizen
                ? (!loading && !error)
                    && <div className="flex items-center gap-1">
                        <div
                            key="edit-button"
                            className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(30,110,244)]"
                            onClick={() => setEditingCitizen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                        </div>
                    </div>
                : <div className="flex items-center gap-1">
                    <div
                        key="save-button"
                        className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(52,199,89)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                        onClick={handleBiometricDataUpdate}
                    >
                        <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.save")}</p>
                    </div>
                    <div
                        key="cancel-button"
                        className="flex justify-center items-center p-1 rounded-10 hoverable bg-[rgb(233,21,45)] duration-400 transition-all hover:-translate-y-0.5 hover:shadow-button"
                        onClick={cancelBiometricDataUpdate}
                    >
                        <p className="text-20 leading-none uppercase px-1">{t("laptop.desktop_screen.common.statuses.cancel")}</p>
                    </div>
                </div>
            }
        </div>
        <div className="w-full flex flex-col gap-1">
            <div className="flex items-center gap-2" >
                <img width="30px" height="30px" src={fingerprintIcon} />
                <p className="text-30 leading-none">{t("laptop.desktop_screen.common.fingerprint")}:</p>
                {isEditingCitizen
                    ? <div className="w-full flex justify-between items-center">
                        <EvidenceDropdown
                            type="fingerprint"
                            selectedEvidence={selectedFingerprint}
                            setSelectedEvidence={setSelectedFingerprint}
                        />

                        <div className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(233,21,45)]" onClick={() => setSelectedFingerprint(undefined)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                        </div>
                    </div>
                    : <p className="text-30 leading-none">
                        {loading
                            ? t("laptop.desktop_screen.common.statuses.loading")
                            : error
                                ? t("laptop.desktop_screen.common.statuses.error")
                                : (linkedBiometricData?.fingerprint || t("laptop.desktop_screen.common.statuses.unknown"))
                        }
                    </p>
                }
            </div>
            <div className="flex items-center gap-2">
                <img width="30px" height="30px" src={dnaIcon} />
                <p className="text-30 leading-none">{t("laptop.desktop_screen.common.dna")}:</p>
                {isEditingCitizen
                    ? <div className="w-full flex justify-between items-center">
                        <EvidenceDropdown
                            type="dna"
                            selectedEvidence={selectedDna}
                            setSelectedEvidence={setSelectedDna}
                        />
                        
                        <div className="flex justify-center items-center p-1 rounded-10 hoverable hover:bg-[rgb(233,21,45)]" onClick={() => setSelectedDna(undefined)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="black" viewBox="0 -960 960 960"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                        </div>
                    </div>
                    : <p className="text-30 leading-none">
                        {loading
                            ? t("laptop.desktop_screen.common.statuses.loading")
                            : error
                                ? t("laptop.desktop_screen.common.statuses.error")
                                : (linkedBiometricData?.dna || t("laptop.desktop_screen.common.statuses.unknown"))
                        }
                    </p>
                }
            </div>
        </div>
    </div>
}