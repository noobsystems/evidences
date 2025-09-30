import { useState, useEffect } from "react";

/**
 * useDebounce Hook
 * @param value Value that should be debounced
 * @param delay Waiting time in ms. Default: 500 ms
 * @returns debounced value.
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
