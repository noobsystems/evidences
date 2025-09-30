import { useTranslation } from "../../../TranslationContext";

interface DatabaseSearchFiltersProps {
    searchText: string;
    dnaChecked: boolean;
    fingerprintsChecked: boolean;
    handleSearchTextChange: (newText: string) => void;
    handleDnaCheckedChange: (dnaChecked: boolean) => void;
    handleFinterprintsChecked: (fingerprintsChecked: boolean) => void;
}

export default function DatabaseSearchFilters(props: DatabaseSearchFiltersProps) {
    const { t } = useTranslation();

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
            <input
                type="text"
                className="textable"
                placeholder={t("laptop.desktop_screen.database_app.search_placeholder")}
                onChange={(e) => props.handleSearchTextChange(e.target.value)}
                value={props.searchText}
                style={{
                    padding: "12.5px",
                    background: "rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    border: "2px solid rgba(255, 255, 255, 0.8)",
                    borderRadius: "10px",
                    fontSize: "40px"
                }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label className="hoverable" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "30px" }}>
                    <input
                        type="checkbox"
                        checked={props.dnaChecked}
                        onChange={(e) => props.handleDnaCheckedChange(e.target.checked)}
                        style={{ width: "30px", height: "30px" }}
                    />
                    {t("laptop.desktop_screen.database_app.types.dna")}
                </label>

                <label className="hoverable" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "30px" }}>
                    <input
                        type="checkbox"
                        checked={props.fingerprintsChecked}
                        onChange={(e) => props.handleFinterprintsChecked(e.target.checked)}
                        style={{ width: "30px", height: "30px" }}
                    />
                    {t("laptop.desktop_screen.database_app.types.fingerprint")}
                </label>
            </div>
        </div>
    );
}