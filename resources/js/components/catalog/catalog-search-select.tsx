import { useEffect, useRef, useState } from 'react';

import { AsyncSearchCombobox } from '@/components/search-combobox';
import { SELECT_MAX_ITEMS } from '@/lib/select-limit';
import { cn } from '@/lib/utils';

export type CatalogSelectResource =
    | 'marks'
    | 'models'
    | 'generations'
    | 'series'
    | 'modifications'
    | 'equipments'
    | 'characteristics'
    | 'options';

export interface SelectOption {
    id: number;
    label: string;
    /** Подпись в выпадающем списке (если отличается от выбранного значения). */
    optionLabel?: string;
}

interface CatalogSearchSelectProps {
    label: string;
    value: number | null;
    selectedLabel?: string | null;
    resource: CatalogSelectResource;
    filters?: Record<string, number | string | null | undefined>;
    onChange: (value: number | null, option: SelectOption | null) => void;
    placeholder?: string;
    allowEmpty?: boolean;
    emptyLabel?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

function buildQuery(filters: Record<string, number | string | null | undefined> = {}, q = '', id?: number | null) {
    const params = new URLSearchParams();

    params.set('limit', String(SELECT_MAX_ITEMS));

    if (q) {
        params.set('q', q);
    }

    if (id) {
        params.set('id', String(id));
    }

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    });

    return params.toString();
}

export function CatalogSearchSelect({
    label,
    value,
    selectedLabel = null,
    resource,
    filters = {},
    onChange,
    placeholder = 'Начните вводить для поиска',
    allowEmpty = false,
    emptyLabel = 'Не выбрано',
    disabled = false,
    required = false,
    className,
}: CatalogSearchSelectProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<SelectOption | null>(
        value && selectedLabel ? { id: value, label: selectedLabel } : null,
    );
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const filtersKey = JSON.stringify(filters);

    useEffect(() => {
        if (value && selectedLabel) {
            setSelected({ id: value, label: selectedLabel });
            return;
        }

        if (!value) {
            setSelected(null);
            return;
        }

        if (selected?.id === value) {
            return;
        }

        const controller = new AbortController();

        fetch(`${route('catalog.select', resource)}?${buildQuery({}, '', value)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            credentials: 'same-origin',
        })
            .then((response) => response.json())
            .then((payload: { data?: SelectOption[] }) => {
                const option = payload.data?.[0] ?? null;
                setSelected(option);
            })
            .catch(() => {
                // ignore abort / network
            });

        return () => controller.abort();
    }, [value, selectedLabel, resource, selected?.id]);

    useEffect(() => {
        setOptions([]);
    }, [filtersKey, resource]);

    const loadOptions = (search: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);

        fetch(`${route('catalog.select', resource)}?${buildQuery(filters, search)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            credentials: 'same-origin',
        })
            .then((response) => response.json())
            .then((payload: { data?: SelectOption[] }) => {
                setOptions((payload.data ?? []).slice(0, SELECT_MAX_ITEMS));
            })
            .catch(() => {
                // ignore abort / network
            })
            .finally(() => {
                if (abortRef.current === controller) {
                    setLoading(false);
                }
            });
    };

    const scheduleLoad = (search: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => loadOptions(search), 250);
    };

    const handleChange = (option: SelectOption | null) => {
        if (!option) {
            setSelected(null);
            onChange(null, null);
            return;
        }

        setSelected(option);
        onChange(option.id, option);
    };

    return (
        <AsyncSearchCombobox
            label={label}
            value={selected}
            items={options}
            loading={loading}
            placeholder={allowEmpty ? emptyLabel : placeholder}
            disabled={disabled}
            allowClear={allowEmpty}
            required={required}
            className={cn(className)}
            onValueChange={handleChange}
            onInputValueChange={scheduleLoad}
            onOpenChange={(open) => {
                if (open && options.length === 0) {
                    loadOptions('');
                }
            }}
        />
    );
}
