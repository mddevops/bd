import { router } from '@inertiajs/react';

import {
    CatalogSearchSelect,
    type CatalogSelectResource,
    type SelectOption,
} from '@/components/catalog/catalog-search-select';

export type { SelectOption as FilterOption };

interface CatalogFilterSelectProps {
    label: string;
    param: string;
    value: number | null;
    selectedLabel?: string | null;
    resource: CatalogSelectResource;
    filters?: Record<string, number | string | null | undefined>;
    placeholder?: string;
    preserveParams?: string[];
    clearParams?: string[];
    className?: string;
}

export function CatalogFilterSelect({
    label,
    param,
    value,
    selectedLabel = null,
    resource,
    filters = {},
    placeholder = 'Все',
    preserveParams = ['search', 'col', 'sort', 'page'],
    clearParams = [],
    className,
}: CatalogFilterSelectProps) {
    const onChange = (next: number | null) => {
        const params = new URLSearchParams(window.location.search);

        preserveParams.forEach((key) => {
            const existing = params.get(key);
            if (existing) {
                params.set(key, existing);
            }
        });

        clearParams.forEach((key) => params.delete(key));

        if (!next) {
            params.delete(param);
        } else {
            params.set(param, String(next));
        }

        params.delete('page');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <CatalogSearchSelect
            label={label}
            value={value}
            selectedLabel={selectedLabel}
            resource={resource}
            filters={filters}
            onChange={onChange}
            allowEmpty
            emptyLabel={placeholder}
            placeholder={placeholder}
            className={className ?? 'w-full max-w-xs'}
        />
    );
}
