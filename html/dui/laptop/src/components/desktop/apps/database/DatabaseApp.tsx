import { useCallback, useEffect, useState } from "react"
import DatabaseSearchFilters from "./DatabaseSearchFilters";
import DatabaseDataTable from "./DatabaseDataTable";
import { useDebounce } from "../../../../hooks/useDebounce";

type BiometricType = "fingerprint" | "dna";

export interface DatabaseRequestData {
    search: string;
    types: BiometricType[];
    page: number;
}

export interface DatabaseResponseData {
    entries: DatabaseEntry[];
    maxPages: number;
    currentPage: number;
}

export interface DatabaseEntry {
    type: BiometricType;
    identifier: string;
    firstname: string;
    lastname: string;
    birthdate: string;
}

export default function DatabaseApp() {
    const [searchText, setSearchText] = useState<string>("");
    const searchTextDebounced = useDebounce<string>(searchText, 750);
    const [dnaChecked, setDnaChecked] = useState<boolean>(true);
    const [fingerprintsChecked, setFingerprintsChecked] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [maxPages, setMaxPages] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [data, setData] = useState<DatabaseResponseData | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState<number>(0);

    // Send request
    useEffect(() => {
        setLoading(true);
        setError(false);

        const types: BiometricType[] = [];
        if (dnaChecked) types.push("dna");
        if (fingerprintsChecked) types.push("fingerprint");

        const data: DatabaseRequestData = {
            types: types,
            search: searchText,
            page: page
        }

        fetch("https://evidences/triggerServerCallback", {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:getStoredBiometricDataEntries",
                arguments: data
            }),
        }).then(response => response.json()).then(response => {
            setData(response);

            if (response.currentPage > response.maxPages) {
                setPage(1);
                setMaxPages(response.maxPages);
                return;
            }

            setMaxPages(response.maxPages);
            setPage(response.currentPage);
        }).catch(() => {
            setError(true);
        }).finally(() => {
            setLoading(false);
        });
    }, [searchTextDebounced, dnaChecked, fingerprintsChecked, page, reloadTrigger]);


    const handleDatabaseEntryDeletion = useCallback((databaseEntry: DatabaseEntry) => {
        fetch("https://evidences/triggerServerCallback", {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:storePersonalData",
                arguments: {
                    type: databaseEntry.type,
                    biometricData: databaseEntry.identifier,
                    firstname: null,
                    lastname: null,
                    birthdate: null
                }
            })
        }).then(() => {
            if (!data) return;

            const oldData = { ...data };
            const updatedEntries = data.entries.filter((entry) => entry.identifier != databaseEntry.identifier);
            setData({
                ...data,
                entries: updatedEntries
            });

            if (oldData.entries.length == 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                setReloadTrigger(prev => prev + 1);
            };
        });
    }, [data, page]);

    const handleDatabaseEntrySave = useCallback((databaseEntry: DatabaseEntry) => {
        if (!databaseEntry) return;

        const trimmedDatabaseEntry = Object.fromEntries(
            Object.entries(databaseEntry).map(([key, value]) => [key, value.trim() || ""])
        );

        fetch("https://evidences/triggerServerCallback", {
            method: "post",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: "evidences:storePersonalData",
                arguments: {
                    ...trimmedDatabaseEntry,
                    type: databaseEntry.type,
                    biometricData: databaseEntry.identifier
                }
            })
        }).then(() => {
            if (!data) return;

            const updatedEntries = data.entries.map((entry) => entry.identifier == databaseEntry.identifier ? databaseEntry : entry);
            setData({
                ...data,
                entries: updatedEntries
            });
        });
    }, [data]);


    return <div style={{ width: "100%", height: "100%", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "30px", background: "#c0c0c0ff" }}>
        <DatabaseSearchFilters dnaChecked={dnaChecked} fingerprintsChecked={fingerprintsChecked} handleDnaCheckedChange={dnaChecked => setDnaChecked(dnaChecked)} handleFinterprintsChecked={fingerprintsChecked => setFingerprintsChecked(fingerprintsChecked)} searchText={searchText} handleSearchTextChange={searchText => setSearchText(searchText)} />
        <DatabaseDataTable data={data} error={error} loading={loading} maxPages={maxPages} page={page} handlePageChange={newPage => setPage(newPage)} handleDatabaseEntryDeletion={handleDatabaseEntryDeletion} handleDatabaseEntrySave={handleDatabaseEntrySave} />
    </div>
}