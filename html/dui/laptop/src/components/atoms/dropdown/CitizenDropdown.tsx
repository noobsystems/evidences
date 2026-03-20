import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, DropdownItem, DropdownSelection, DropdownUnfolded } from "./Dropdown";
import type Citizen from "@/types/citizen.type";
import useLuaCallback from "@/hooks/useLuaCallback";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "@/components/TranslationContext";

interface CitizenDropdownProps {
    className?: string;
    selectedCitizen: Citizen | undefined;
    setSelectedCitizen: (citizen: Citizen | undefined) => void;
}

export default function CitizenDropdown(props: CitizenDropdownProps) {
    const { t } = useTranslation();

    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const offset = useRef<number>(0);
    const [isFullyLoaded, setFullyLoaded] = useState<boolean>(false);

    const [searchText, setSearchText] = useState<string>("");
    const debouncedSearchText = useDebounce(searchText);

    const { trigger, loading } = useLuaCallback<{ searchText: string | null, offset: number }, Citizen[]>({
        name: "evidences:getCitizens",
        onSuccess: (data) => {
            if (!data) return;
            const length = data.length;
            offset.current += length;

            setCitizens(prev => [...prev, ...data]);
            if (length < 10) setFullyLoaded(true);
        }
    });

    useEffect(() => fetchCitizens(true), [debouncedSearchText]);

    const fetchCitizens = useCallback((forceReload: boolean = false) => {
        if (!forceReload && isFullyLoaded) return;
        if (loading) return;

        if (forceReload) {
            offset.current = 0;
            setCitizens([]);
            setFullyLoaded(false);
        }

        trigger({
            searchText: searchText,
            offset: offset.current
        });
    }, [loading, isFullyLoaded, debouncedSearchText]);

    const formatDate = (date: string | number): string => {
        if (typeof date == "string") return date;
        return new Date(date).toLocaleDateString(t("laptop.desktop_screen.common.date_locales"), { day: "numeric", month: "numeric", year: "numeric" });
    }


    return (
        <Dropdown<Citizen>
            items={citizens}
            onItemSelect={(item) => props.setSelectedCitizen(item)}
            selectedItem={props.selectedCitizen}
            itemToString={(citizen) => citizen.identifier}
            onScrollToBottom={fetchCitizens}
            onUnfold={() => fetchCitizens(true)}
            loading={loading}
            searchText={searchText}
            onSearchTextChange={text => setSearchText(text)}
            className={props.className}
        >
            <DropdownSelection<Citizen> placeholder={t("laptop.desktop_screen.common.dropdowns.select_citizen")} includeSearch={item => item.fullName}>
                {item => (
                    <p className="text-30 leading-none text-left truncate">{item.fullName}</p>
                )}
            </DropdownSelection>

            <DropdownUnfolded<Citizen>>
                {(item, selected) =>
                    <DropdownItem<Citizen>
                        key={item.identifier}
                        item={item}
                        selected={selected}
                    >
                        <p className="text-30 leading-none text-left truncate">{item.fullName}</p>
                        <p className="text-20 leading-none text-left truncate">{formatDate(item.birthdate) + " • " + item.gender}</p>
                    </DropdownItem>
                }
            </DropdownUnfolded>
        </Dropdown>
    );
}