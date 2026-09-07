import { useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { AsyncSearchCombobox } from '@/components/search-combobox';
import { SELECT_MAX_ITEMS } from '@/lib/select-limit';
import { cn } from '@/lib/utils';

interface CountryOption {
    id: number | string;
    label: string;
}

interface CountrySearchSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    allowEmpty?: boolean;
    emptyLabel?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}

function buildQuery(q = '', name?: string) {
    const params = new URLSearchParams();

    params.set('limit', String(SELECT_MAX_ITEMS));

    if (q) {
        params.set('q', q);
    }

    if (name) {
        params.set('name', name);
    }

    return params.toString();
}

export function CountrySearchSelect({
    label,
    value,
    onChange,
    placeholder = 'Начните вводить название страны',
    allowEmpty = true,
    emptyLabel = 'Не выбрано',
    disabled = false,
    error,
    className,
}: CountrySearchSelectProps) {
    const [options, setOptions] = useState<CountryOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<CountryOption | null>(value ? { id: 0, label: value } : null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!value) {
            setSelected(null);
            return;
        }

        if (selected?.label === value) {
            return;
        }

        const controller = new AbortController();

        fetch(`${route('catalog.select', 'countries')}?${buildQuery('', value)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            credentials: 'same-origin',
        })
            .then((response) => response.json())
            .then((payload: { data?: CountryOption[] }) => {
                const option = payload.data?.[0] ?? { id: 0, label: value };
                setSelected(option);
            })
            .catch(() => {
                setSelected({ id: 0, label: value });
            });

        return () => controller.abort();
    }, [value, selected?.label]);

    const loadOptions = (search: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);

        fetch(`${route('catalog.select', 'countries')}?${buildQuery(search)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
            credentials: 'same-origin',
        })
            .then((response) => response.json())
            .then((payload: { data?: CountryOption[] }) => {
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

    const handleChange = (option: CountryOption | null) => {
        if (!option) {
            setSelected(null);
            onChange('');
            return;
        }

        setSelected(option);
        onChange(option.label);
    };

    return (
        <div className={cn('grid content-start gap-2', className)}>
            <AsyncSearchCombobox
                label={label}
                value={selected}
                items={options}
                loading={loading}
                placeholder={allowEmpty ? emptyLabel : placeholder}
                disabled={disabled}
                allowClear={allowEmpty}
                error={error}
                onValueChange={handleChange}
                onInputValueChange={scheduleLoad}
                onOpenChange={(open) => {
                    if (open && options.length === 0) {
                        loadOptions('');
                    }
                }}
            />
            <InputError message={error} />
        </div>
    );
}
