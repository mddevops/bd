import type { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { CatalogSearchSelect } from '@/components/catalog/catalog-search-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { DataTableDateRangeFilter } from './data-table-date-range-filter';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableNumberRangeFilter } from './data-table-number-range-filter';
import { DataTableSortMenu, type DataTableSortableColumn } from './data-table-sort-menu';
import { DataTableViewOptions } from './data-table-view-options';
import { type DataTableCatalogFilterField, type DataTableFilterField } from './types';

const EMPTY_FILTER_FIELDS: DataTableFilterField[] = [];

function buildFilterDraft(filterFields: DataTableFilterField[]): Record<string, string | null> {
    const draft: Record<string, string | null> = {};

    filterFields.forEach((field) => {
        if (field.type === 'dateRange' || field.type === 'numberRange') {
            draft[field.fromKey] = field.fromValue;
            draft[field.toKey] = field.toValue;
            return;
        }

        draft[field.key] = field.value != null && field.value !== '' ? String(field.value) : null;
    });

    return draft;
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    search: string | null | undefined;
    placeholder?: string;
    onSearch: (value: string) => void;
    children?: React.ReactNode;
    filterFields?: DataTableFilterField[];
    onFilterChange?: (key: string, value: string | null, clearKeys?: string[]) => void;
    onFiltersChange?: (values: Record<string, string | null>) => void;
    onResetFilters?: () => void;
    sortColumns?: DataTableSortableColumn[];
    sortCol?: string;
    sortDir?: string;
    onSort?: (column: string) => void;
}

export function DataTableToolbar<TData>({
    table,
    search,
    placeholder = 'Поиск...',
    onSearch,
    children,
    filterFields = EMPTY_FILTER_FIELDS,
    onFilterChange,
    onFiltersChange,
    onResetFilters,
    sortColumns = [],
    sortCol = '',
    sortDir = '',
    onSort,
}: DataTableToolbarProps<TData>) {
    const [value, setValue] = useState(search ?? '');
    const onSearchRef = useRef(onSearch);

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        setValue(search ?? '');
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (value !== (search ?? '')) {
                onSearchRef.current(value);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, search]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch(value);
    };

    const setFilter = (field: DataTableFilterField, next: string | null) => {
        if (!onFilterChange) {
            return;
        }

        if (field.type === 'dateRange' || field.type === 'numberRange') {
            return;
        }

        onFilterChange(field.key, next, field.clears);
    };

    const setCatalogFilter = (field: DataTableCatalogFilterField, next: number | null) => {
        onFilterChange?.(field.key, next ? String(next) : null, field.clears);
    };

    const filterDraft = useMemo(() => buildFilterDraft(filterFields), [filterFields]);

    const hasActiveFilters = filterFields.some((field) => {
        if (field.type === 'dateRange' || field.type === 'numberRange') {
            return Boolean(field.fromValue || field.toValue);
        }

        return Boolean(field.value);
    });

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <form onSubmit={submit} className="relative w-full max-w-xs min-w-[140px] flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 size-3.5" />
                        <Input
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={placeholder}
                            className="h-8 pl-8 text-sm"
                        />
                    </form>

                    {filterFields.map((field) => {
                        if (field.type === 'select') {
                            return (
                                <DataTableFacetedFilter
                                    key={field.key}
                                    title={field.label}
                                    options={field.options}
                                    value={field.value}
                                    onChange={(next) => setFilter(field, next)}
                                />
                            );
                        }

                        if (field.type === 'dateRange') {
                            return (
                                <DataTableDateRangeFilter
                                    key={field.key}
                                    title={field.label}
                                    fromValue={field.fromValue}
                                    toValue={field.toValue}
                                    onRangeChange={(from, to) =>
                                        onFiltersChange?.({
                                            [field.fromKey]: from,
                                            [field.toKey]: to,
                                        })
                                    }
                                />
                            );
                        }

                        if (field.type === 'numberRange') {
                            return (
                                <DataTableNumberRangeFilter
                                    key={field.key}
                                    title={field.label}
                                    fromValue={field.fromValue}
                                    toValue={field.toValue}
                                    fromPlaceholder={field.fromPlaceholder}
                                    toPlaceholder={field.toPlaceholder}
                                    onRangeChange={(from, to) =>
                                        onFiltersChange?.({
                                            [field.fromKey]: from,
                                            [field.toKey]: to,
                                        })
                                    }
                                />
                            );
                        }

                        return (
                            <Popover key={field.key}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 border-dashed px-2.5">
                                        {field.label}
                                        {field.value ? `: ${field.selectedLabel ?? field.value}` : null}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-3" align="start">
                                    <CatalogSearchSelect
                                        label={field.label}
                                        value={field.value}
                                        selectedLabel={field.selectedLabel}
                                        resource={field.resource}
                                        filters={field.resourceFilters?.(filterDraft) ?? {}}
                                        allowEmpty
                                        emptyLabel={field.emptyLabel ?? 'Все'}
                                        placeholder={field.emptyLabel ?? 'Все'}
                                        className="w-full"
                                        onChange={(next) => setCatalogFilter(field, next)}
                                    />
                                </PopoverContent>
                            </Popover>
                        );
                    })}

                    {hasActiveFilters && onResetFilters ? (
                        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onResetFilters}>
                            <X className="mr-1.5 size-3.5" />
                            Сбросить
                        </Button>
                    ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {sortColumns.length > 0 && onSort ? (
                        <DataTableSortMenu columns={sortColumns} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
                    ) : null}
                    <DataTableViewOptions table={table} />
                    {children}
                </div>
            </div>
        </div>
    );
}
