import type Citizen from "./citizen.type";
import type { EvidenceType, BiometricEvidence } from "./evidence.type";
import type { Interception } from "./wiretap.type";


export interface EvidenceAnalysedEvent {
    inventory: number | string;
    slot: number;
    type: EvidenceType;
}

export interface InterceptionStoredEvent {
    interception: Interception;
}

export interface BiometricDataLinkedEvent {
    type: BiometricEvidence;
    identifier?: string;
    citizen: Citizen;
}