import { useCallback, useRef, useState } from "react";
import useLuaCallback from "./useLuaCallback";

export default function useInfinteScroll<T, U extends object = object>(callbackName: string, callbackArgs?: U) {
    const [data, setData] = useState<T[]>([]);

    const reloadRef = useRef(null);
    const scrollRef = useRef(null);
    const offset = useRef<number>(0);
    const [isFullyLoaded, setFullyLoaded] = useState<boolean>(false);

    const argsRef = useRef(callbackArgs);
    argsRef.current = callbackArgs;

    const { trigger, loading } = useLuaCallback< U & { offset: number }, T[]>({
        name: callbackName,
        onSuccess: (data) => {
            if (!data) return;
            const length = data.length;
            offset.current += length;

            setData(prev => [...prev, ...data]);
            if (length < 10) setFullyLoaded(true);
        }
    });

    const fetchData = useCallback((forceReload: boolean = false) => {
        if (!forceReload && isFullyLoaded) return;
        if (loading) return;

        if (forceReload) {
            offset.current = 0;
            setData([]);
            setFullyLoaded(false);
        }

        trigger({
            ...(argsRef.current as U),
            offset: offset.current
        });
    }, [loading, isFullyLoaded]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;

        if (isBottom) {
            fetchData();
        }
    }, [loading]);

    const handleReload = () => {
        if (reloadRef.current) {
            const reloadButton = reloadRef.current as HTMLDivElement;
            if (!reloadButton) return;

            if (reloadButton.ariaDisabled == "true") return;
            fetchData(true);

            reloadButton.ariaDisabled = "true";
            setTimeout(() => reloadButton.ariaDisabled = "false", 1000 * 5);
        }
    };

    const adjustOffset = useCallback((amount: number) => offset.current += amount, []);

    return { data, setData, fetchData, loading, reloadRef, scrollRef, handleScroll, handleReload, adjustOffset, isFullyLoaded }
}