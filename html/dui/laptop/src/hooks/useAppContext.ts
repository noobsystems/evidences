import { useContext } from "react";
import { AppContext } from "../components/desktop/MoveableApp";

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
    return ctx;
};