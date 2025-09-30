import Spinner from "../../../atoms/Spinner";
import { useTranslation } from "../../../TranslationContext";
import type { DatabaseEntry, DatabaseResponseData } from "./DatabaseApp";
import { useAppContext } from "../../../../hooks/useAppContext";
import DatabaseEntryView from "./DatabaseEntryView";
import ChevronSVG from "./ChevronSVG";
import React from "react";
import styles from "../../../../css/DatabaseDataTable.module.css";


interface DatabaseDataTableProps {
    loading: boolean;
    error: boolean;
    page: number;
    maxPages: number;
    data: DatabaseResponseData | null;
    handlePageChange: (newPage: number) => void;
    handleDatabaseEntryDeletion: (databaseEntry: DatabaseEntry) => void;
    handleDatabaseEntrySave: (databaseEntry: DatabaseEntry) => void;
}

const Container = ({ children }: React.PropsWithChildren<{}>) => {
    return <div style={{ width: "100%", height: "100%", padding: "30px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.2)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", border: "2px solid rgba(255, 255, 255, 0.8)", borderRadius: "16px" }}>
        {children}
    </div>
};

export default function DatabaseDataTable(props: DatabaseDataTableProps) {
    const { t } = useTranslation();
    const appContext = useAppContext();


    const openDetailsInNewPopUp = (databaseEntry: DatabaseEntry) => {
        appContext.openPopUp(databaseEntry.type.toUpperCase() + ": " + databaseEntry.identifier, <DatabaseEntryView databaseEntry={databaseEntry} handleSave={props.handleDatabaseEntrySave} />)
    };


    if (props.loading) {
        return <Container>
            <Spinner black />
        </Container>;
    }

    if (props.error) {
        return <Container>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <svg width="100px" height="100px" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                </svg>

                <p style={{ width: "50%", fontSize: "25px" }}>{t("laptop.desktop_screen.database_app.search_result_error")}</p>
            </div>
        </Container>;
    }

    if (!props.data || props.data.entries.length == 0) {
        return <Container>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <svg width="100px" height="100px" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path d="M280-160v-441q0-33 24-56t57-23h439q33 0 56.5 23.5T880-600v320L680-80H360q-33 0-56.5-23.5T280-160ZM81-710q-6-33 13-59.5t52-32.5l434-77q33-6 59.5 13t32.5 52l10 54h-82l-7-40-433 77 40 226v279q-16-9-27.5-24T158-276L81-710Zm279 110v440h280v-160h160v-280H360Zm220 220Z"/>
                </svg>

                <p style={{ width: "50%", fontSize: "25px" }}>{t("laptop.desktop_screen.database_app.search_result_empty")}</p>
            </div>
        </Container>;
    }

    return <Container>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ flex: "1" }}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.header}>
                            <th style={{ textTransform: "uppercase" }}>{t("laptop.desktop_screen.database_app.type")}</th>
                            <th style={{ textTransform: "uppercase" }}>{t("laptop.desktop_screen.database_app.citizen")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.data.entries.map((databaseEntry) => (
                            <tr key={databaseEntry.identifier} className={styles.row}>
                                <td>
                                    <div style={{ width: "50px", height: "50px" }}>
                                        {databaseEntry.type === "dna"
                                            ? <svg width="50px" height="50px" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                                <path d="M200-40v-40q0-139 58-225.5T418-480q-102-88-160-174.5T200-880v-40h80v40q0 11 .5 20.5T282-840h396q1-10 1.5-19.5t.5-20.5v-40h80v40q0 139-58 225.5T542-480q102 88 160 174.5T760-80v40h-80v-40q0-11-.5-20.5T678-120H282q-1 10-1.5 19.5T280-80v40h-80Zm138-640h284q13-19 22.5-38t17.5-42H298q8 22 17.5 41.5T338-680Zm142 148q20-17 39-34t36-34H405q17 17 36 34t39 34Zm-75 172h150q-17-17-36-34t-39-34q-20 17-39 34t-36 34ZM298-200h364q-8-22-17.5-41.5T622-280H338q-13 19-22.5 38T298-200Z"/>
                                            </svg>
                                            : <svg width="50px" height="50px" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                                <path d="M481-781q106 0 200 45.5T838-604q7 9 4.5 16t-8.5 12q-6 5-14 4.5t-14-8.5q-55-78-141.5-119.5T481-741q-97 0-182 41.5T158-580q-6 9-14 10t-14-4q-7-5-8.5-12.5T126-602q62-85 155.5-132T481-781Zm0 94q135 0 232 90t97 223q0 50-35.5 83.5T688-257q-51 0-87.5-33.5T564-374q0-33-24.5-55.5T481-452q-34 0-58.5 22.5T398-374q0 97 57.5 162T604-121q9 3 12 10t1 15q-2 7-8 12t-15 3q-104-26-170-103.5T358-374q0-50 36-84t87-34q51 0 87 34t36 84q0 33 25 55.5t59 22.5q34 0 58-22.5t24-55.5q0-116-85-195t-203-79q-118 0-203 79t-85 194q0 24 4.5 60t21.5 84q3 9-.5 16T208-205q-8 3-15.5-.5T182-217q-15-39-21.5-77.5T154-374q0-133 96.5-223T481-687Zm0-192q64 0 125 15.5T724-819q9 5 10.5 12t-1.5 14q-3 7-10 11t-17-1q-53-27-109.5-41.5T481-839q-58 0-114 13.5T260-783q-8 5-16 2.5T232-791q-4-8-2-14.5t10-11.5q56-30 117-46t124-16Zm0 289q93 0 160 62.5T708-374q0 9-5.5 14.5T688-354q-8 0-14-5.5t-6-14.5q0-75-55.5-125.5T481-550q-76 0-130.5 50.5T296-374q0 81 28 137.5T406-123q6 6 6 14t-6 14q-6 6-14 6t-14-6q-59-62-90.5-126.5T256-374q0-91 66-153.5T481-590Zm-1 196q9 0 14.5 6t5.5 14q0 75 54 123t126 48q6 0 17-1t23-3q9-2 15.5 2.5T744-191q2 8-3 14t-13 8q-18 5-31.5 5.5t-16.5.5q-89 0-154.5-60T460-374q0-8 5.5-14t14.5-6Z"/>
                                            </svg>
                                        }
                                    </div>
                                </td>

                                <td>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "40px" }}>{databaseEntry.firstname} {databaseEntry.lastname}</span>
                                        {databaseEntry.birthdate &&
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <svg width="30px" height="30px" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                                    <path d="M160-80v-440H80v-240h208q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h208v240h-80v440H160Zm400-760q-17 0-28.5 11.5T520-800q0 17 11.5 28.5T560-760q17 0 28.5-11.5T600-800q0-17-11.5-28.5T560-840Zm-200 40q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z"/>
                                                </svg>
                                                <span style={{ fontSize: "30px" }}>{databaseEntry.birthdate}</span>
                                            </div>
                                        }
                                    </div>
                                </td>

                                <td>
                                    <div style={{ display:"flex", gap: "20px", justifyContent: "end" }}>
                                        <button className={`${styles.inspect__button} hoverable`} onClick={() => openDetailsInNewPopUp(databaseEntry)}>
                                            <svg width="30px" height="30px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                                            </svg>
                                            <span style={{ fontSize: "30px" }}>{t("laptop.desktop_screen.database_app.inspect_button")}</span>
                                        </button>

                                        <button className={`${styles.delete__button} hoverable`} onClick={() => props.handleDatabaseEntryDeletion(databaseEntry)}>
                                            <svg width="30px" height="30px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/>
                                            </svg>
                                            <span style={{ fontSize: "30px" }}>{t("laptop.desktop_screen.common.delete_button")}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <button
                    onClick={() => props.handlePageChange(props.page - 1)}
                    disabled={props.page <= 1}
                    className={`${styles.switchpage__button} ${props.page <= 1 ? "blocked" : "hoverable"}`}
                >
                    <ChevronSVG style={{ transform: "rotate(90deg)" }} width="35px" height="35px" />
                </button>

                <span style={{ fontSize: "20px", lineHeight: "20px", textTransform: "uppercase" }}>
                    {t("laptop.desktop_screen.database_app.page", props.data.currentPage, props.data.maxPages)}
                </span>

                <button
                    onClick={() => props.handlePageChange(props.page + 1)}
                    disabled={props.page >= props.data.maxPages}
                    className={`${styles.switchpage__button} ${props.page >= props.data.maxPages ? "blocked" : "hoverable"}`}
                >
                    <ChevronSVG style={{ transform: "rotate(-90deg)" }} width="35px" height="35px" />
                </button>
            </div>         
        </div>
    </Container>;
}