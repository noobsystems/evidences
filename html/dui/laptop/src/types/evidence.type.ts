export type BiometricEvidence = "fingerprint" | "dna";
export type BallisticsEvidence = "ballistics";
export type EvidenceType = BiometricEvidence | BallisticsEvidence;

export enum EvidenceAnalysisState {
    Loading,
    DatabaseMatch,
    NoDatabaseMatch
}

export enum WeaponEvidenceAnalysisState {
    Loading,
    DatabaseMatch,
    NoDatabaseMatch,
    Type
}

export interface Evidence {
    label: string;
    imagePath: string;
    inventory: number | string;
    slot: number;
    identifier: string;
    analysed: boolean;
}

export interface EvidenceDetails {
    createdAt: number;
    identifier: string;
    analysed: boolean;
    collectionTime: string;
    crimeScene: string;
    additionalData: string;
}

export type WeaponEvidenceDetails = EvidenceDetails & {
    weaponType?: string;
    weaponImage?: string;
    serial?: string;
    imperfections?: string;
    type?: string;
}

export interface EvidenceData {
    identifier: string;
    firstname: string;
    lastname: string;
    birthdate: string;
}