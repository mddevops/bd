import { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

export function createDataTableSelectColumn<TData extends { id: number }>(): ColumnDef<TData> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                aria-label="Выбрать все на странице"
                className="size-4"
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                          ? 'indeterminate'
                          : false
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label="Выбрать строку"
                className="size-4"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(value === true)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    };
}
