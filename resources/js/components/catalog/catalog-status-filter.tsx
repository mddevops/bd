import { router } from '@inertiajs/react';
import { useMemo } from 'react';

import { StaticSearchCombobox } from '@/components/search-combobox';
import { cn } from '@/lib/utils';

interface CatalogStatusFilterProps {
    label?: string;
    value: boolean | null;
    param?: string;
    placeholder?: string;
    preserveParams?: string[];
    className?: string;
}

export function CatalogStatusFilter({
    label = 'Статус',
    value,
    param = 'status',
    placeholder = 'Все статусы',
    preserveParams = ['search', 'col', 'sort', 'page'],
    className,
}: CatalogStatusFilterProps) {
    const options = useMemo(
        () => [
            { value: 'all', label: placeholder },
            { value: '1', label: 'Активна' },
            { value: '0', label: 'Неактивна' },
        ],
        [placeholder],
    );

    const onChange = (next: string) => {
        const params = new URLSearchParams(window.location.search);

        preserveParams.forEach((key) => {
            const existing = params.get(key);
            if (existing) {
                params.set(key, existing);
            }
        });

        if (next === 'all') {
            params.delete(param);
        } else {
            params.set(param, next);
        }

        params.delete('page');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    const selectValue = value === null ? 'all' : value ? '1' : '0';

    return (
        <StaticSearchCombobox
            label={label}
            value={selectValue}
            options={options}
            onChange={onChange}
            placeholder={placeholder}
            className={cn('w-full max-w-xs', className)}
        />
    );
}
