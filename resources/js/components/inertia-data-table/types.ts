import { type CatalogSelectResource } from '@/components/catalog/catalog-search-select';

export type DataTableFilterOption = {
    value: string;
    label: string;
};

type DataTableFilterFieldBase = {
    key: string;
    label: string;
    /** При смене этого фильтра сбросить указанные ключи. */
    clears?: string[];
};

export type DataTableSelectFilterField = DataTableFilterFieldBase & {
    type: 'select';
    value: string | null;
    options: DataTableFilterOption[];
    emptyLabel?: string;
};

export type DataTableCatalogFilterField = DataTableFilterFieldBase & {
    type: 'catalog';
    value: number | null;
    selectedLabel?: string | null;
    resource: CatalogSelectResource;
    emptyLabel?: string;
    /** Доп. фильтры для API выбора (по текущему draft). */
    resourceFilters?: (draft: Record<string, string | null>) => Record<string, number | string | null | undefined>;
};

export type DataTableDateFilterField = DataTableFilterFieldBase & {
    type: 'date';
    value: string | null;
    placeholder?: string;
};

export type DataTableDateRangeFilterField = DataTableFilterFieldBase & {
    type: 'dateRange';
    fromKey: string;
    toKey: string;
    fromValue: string | null;
    toValue: string | null;
};

export type DataTableNumberRangeFilterField = DataTableFilterFieldBase & {
    type: 'numberRange';
    fromKey: string;
    toKey: string;
    fromValue: string | null;
    toValue: string | null;
    fromPlaceholder?: string;
    toPlaceholder?: string;
};

export type DataTableFilterField =
    | DataTableSelectFilterField
    | DataTableCatalogFilterField
    | DataTableDateFilterField
    | DataTableDateRangeFilterField
    | DataTableNumberRangeFilterField;

export type DataTableActiveFilter = {
    key: string;
    label: string;
    display: string;
};
