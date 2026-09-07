import { router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

import { type TableState } from '@/types/pagination';

type ParamValue = string | number | undefined | null;

interface NavigateOptions {
    /** Ключи фильтров, которые нужно сохранить из URL, если не переопределены. */
    filterKeys?: string[];
    /** Дополнительно удалить эти ключи. */
    clearKeys?: string[];
}

function readParam(params: URLSearchParams, key: string): string | undefined {
    const value = params.get(key);

    return value === null || value === '' ? undefined : value;
}

export function useInertiaDataTable(state: TableState, filterKeys: string[] = []) {
    const filterKeysKey = filterKeys.join(',');
    const stableFilterKeys = useMemo(
        () => (filterKeysKey ? filterKeysKey.split(',') : []),
        [filterKeysKey],
    );

    const navigate = useCallback(
        (updates: Record<string, ParamValue>, options: NavigateOptions = {}) => {
            const url = new URL(window.location.href);
            const keys = options.filterKeys ?? stableFilterKeys;

            const next: Record<string, string | undefined> = {
                search: state.search || undefined,
                col: state.col || undefined,
                sort: state.sort || undefined,
                limit: readParam(url.searchParams, 'limit'),
            };

            keys.forEach((key) => {
                next[key] = readParam(url.searchParams, key);
            });

            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    next[key] = undefined;
                } else {
                    next[key] = String(value);
                }
            });

            (options.clearKeys ?? []).forEach((key) => {
                next[key] = undefined;
            });

            Object.keys(next).forEach((key) => {
                const value = next[key];
                if (value === undefined) {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, value);
                }
            });

            if (!('page' in updates)) {
                url.searchParams.delete('page');
            }

            router.get(`${url.pathname}${url.search}`, {}, { preserveState: true, preserveScroll: true, replace: true });
        },
        [stableFilterKeys, state.col, state.search, state.sort],
    );

    const setSearch = useCallback(
        (search: string) => {
            navigate({ search: search || undefined });
        },
        [navigate],
    );

    const toggleSort = useCallback(
        (col: string) => {
            const sort = state.col === col && state.sort === 'asc' ? 'desc' : 'asc';
            navigate({ col, sort });
        },
        [navigate, state.col, state.sort],
    );

    const setLimit = useCallback(
        (limit: number) => {
            navigate({ limit });
        },
        [navigate],
    );

    const applyFilters = useCallback(
        (values: Record<string, string | null | undefined>) => {
            navigate(values);
        },
        [navigate],
    );

    const removeFilter = useCallback(
        (key: string, clearKeys: string[] = []) => {
            navigate({ [key]: undefined }, { clearKeys });
        },
        [navigate],
    );

    const resetFilters = useCallback(() => {
        const cleared = Object.fromEntries(stableFilterKeys.map((key) => [key, undefined]));
        navigate(cleared);
    }, [navigate, stableFilterKeys]);

    const setFilter = useCallback(
        (key: string, value: string | null | undefined, clearKeys: string[] = []) => {
            navigate({ [key]: value }, { clearKeys });
        },
        [navigate],
    );

    return {
        setSearch,
        toggleSort,
        setLimit,
        applyFilters,
        removeFilter,
        resetFilters,
        setFilter,
        sortCol: state.col,
        sortDir: state.sort as 'asc' | 'desc' | '',
    };
}
