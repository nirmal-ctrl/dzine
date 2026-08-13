import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * usePersistentState — a useState hook backed by chrome.storage.local.
 *
 * - Hydrates from storage on mount.
 * - Writes through to storage on every update.
 * - Falls back to localStorage when the extension storage API is
 *   unavailable (e.g. plain `vite dev` in a browser tab).
 */
export function usePersistentState<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
    const [value, setValue] = useState<T>(initialValue);
    const [hydrated, setHydrated] = useState(false);
    const valueRef = useRef(value);
    valueRef.current = value;

    const hasChromeStorage =
        typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

    // Hydrate
    useEffect(() => {
        let cancelled = false;

        if (hasChromeStorage) {
            chrome.storage.local.get([key], (result) => {
                if (cancelled) return;
                if (result[key] !== undefined) {
                    setValue(result[key] as T);
                }
                setHydrated(true);
            });
        } else {
            try {
                const raw = window.localStorage.getItem(key);
                if (raw !== null) setValue(JSON.parse(raw) as T);
            } catch {
                // ignore malformed cache
            }
            setHydrated(true);
        }

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Cross-context sync (side panel <-> other extension views)
    useEffect(() => {
        if (!hasChromeStorage) return;
        const listener = (
            changes: Record<string, chrome.storage.StorageChange>,
            areaName: string
        ) => {
            if (areaName === 'local' && changes[key] && changes[key].newValue !== undefined) {
                const next = changes[key].newValue as T;
                if (JSON.stringify(next) !== JSON.stringify(valueRef.current)) {
                    setValue(next);
                }
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, [key, hasChromeStorage]);

    const update = useCallback(
        (next: T | ((prev: T) => T)) => {
            setValue((prev) => {
                const resolved =
                    typeof next === 'function' ? (next as (p: T) => T)(prev) : next;

                if (hasChromeStorage) {
                    try {
                    chrome.storage.local.set({ [key]: resolved }, () => {
                            const err = chrome.runtime?.lastError;
                            if (err) console.warn(`[storage] failed to persist "${key}":`, err.message);
                        });
                    } catch (e) {
                        console.warn(`[storage] failed to persist "${key}":`, e);
                    }
                } else {
                    try {
                        window.localStorage.setItem(key, JSON.stringify(resolved));
                    } catch {
                        // storage full — non-fatal
                    }
                }

                return resolved;
            });
        },
        [key, hasChromeStorage]
    );

    return [value, update, hydrated];
}
