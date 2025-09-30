import React, { createContext, useContext, useState, useEffect } from "react";
import defaultTranslations from "../../../../../locales/en.json";

type TranslationObject = Record<string, any>;

type TranslationContextType = {
    lang: string;
    setLang: (lang: string) => void;
    t: (key: string, ...replacements: (string | number)[]) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<string>("en");
    const [translations, setTranslations] = useState<TranslationObject>(defaultTranslations);

    useEffect(() => {
        if (lang == "en") return;

        fetch(`../../../../../locales/${lang}.json`)
            .then((res) => {
                if (!res.ok) throw new Error(`Could not load language file: ${lang}`);
                return res.json();
            })
            .then((data) => setTranslations(data))
            .catch((err) => console.error(err));
    }, [lang]);

    const t = (key: string, ...replacements: (string | number)[]): string => {
        const raw = key.split(".").reduce((acc, part) => {
            if (acc && typeof acc === "object" && part in acc) {
                return acc[part];
            }
            return undefined;
        }, translations as any);

        if (typeof raw !== "string") return key;

        let result = raw;
        replacements.forEach((val) => {
            result = result.replace("%s", String(val));
        });
        return result;
    };

    return (
        <TranslationContext.Provider value={{ lang, setLang, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const ctx = useContext(TranslationContext);
    if (!ctx) throw new Error("useTranslation must be used within a TranslationProvider");
    return ctx;
};